import { describe, it, expect, beforeEach } from 'vitest';
import {
  ReminderEngine,
  BreakTimer,
  HydrationTimer,
  NotificationPolicyEngine,
  ResourceGovernor,
} from '../src/index.js';
import { UserSettings, ReminderEvent } from '@eyeposture/shared-types';

const mockSettings: UserSettings = {
  profileId: 'prof-1',
  general: {
    language: 'en',
    theme: 'dark',
    startWithWindows: true,
    minimizeToTray: true,
    autoCheckUpdates: true,
  },
  camera: {
    deviceId: 'default',
    enabled: true,
    mirror: true,
    sensitivity: 3,
  },
  posture: {
    enabled: true,
    sensitivity: 3,
    warningDelaySeconds: 5,
    cooldownSeconds: 30,
    soundEnabled: true,
    voiceEnabled: false,
  },
  distance: {
    enabled: true,
    thresholdCm: 50,
    warningDelaySeconds: 5,
    cooldownSeconds: 25,
    soundEnabled: true,
    voiceEnabled: false,
  },
  breaks: {
    enabled: true,
    intervalMinutes: 20,
    durationSeconds: 20,
    strictMode: false,
    soundEnabled: true,
  },
  hydration: {
    enabled: true,
    intervalMinutes: 45,
    dailyGoalGlasses: 8,
    soundEnabled: true,
  },
  screenTime: {
    enabled: true,
    dailyLimitMinutes: 240,
    warningThresholdPercent: 80,
    excludedApplications: [],
  },
  notifications: {
    popupEnabled: true,
    soundEnabled: true,
    voiceEnabled: false,
    soundVolume: 80,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    suppressInFullscreen: true,
  },
  privacy: {
    telemetryEnabled: false,
    localRetentionDays: 60,
    cameraProcessingLocalOnly: true,
  },
  blink: {
    enabled: true,
    earThreshold: 0.22,
    prolongedStareThresholdSec: 7,
    minBlinksPerMinute: 10,
    cooldownSeconds: 30,
    soundEnabled: true,
  },
};

describe('Reminder Engine & Subsystems', () => {
  it('should tick BreakTimer and trigger when 20 minutes elapse', () => {
    const timer = new BreakTimer({ intervalMinutes: 20, durationSeconds: 20 });
    expect(timer.getStatus()).toBe('RUNNING');

    // Tick 19 minutes (1140 seconds)
    const res1 = timer.tick(1140);
    expect(res1.triggered).toBe(false);
    expect(timer.getStatus()).toBe('RUNNING');

    // Tick another 60 seconds (total 20 min)
    const res2 = timer.tick(60);
    expect(res2.triggered).toBe(true);
    expect(timer.getStatus()).toBe('BREAK_READY');

    // Snooze by 5 minutes
    timer.snooze(5);
    expect(timer.getStatus()).toBe('RUNNING');
    expect(timer.getProgress().remainingSeconds).toBe(300);
  });

  it('should tick HydrationTimer and log glasses', () => {
    const timer = new HydrationTimer({ intervalMinutes: 45, dailyGoalGlasses: 8 });
    expect(timer.getProgress().glassesToday).toBe(0);

    timer.logGlass(1);
    expect(timer.getProgress().glassesToday).toBe(1);
    expect(timer.getProgress().percentComplete).toBe(13); // 1/8 ~ 12.5%

    // Tick 45 minutes (2700 seconds)
    const res = timer.tick(2700);
    expect(res.triggered).toBe(true);
  });

  it('should suppress notifications during quiet hours and in fullscreen', () => {
    const policy = new NotificationPolicyEngine(mockSettings.notifications);

    // Mock quiet hours (23:30)
    const quietDate = new Date('2026-09-14T23:30:00');
    expect(policy.isQuietHours(quietDate)).toBe(true);

    const quietResult = policy.evaluate('POSTURE', 'NORMAL', undefined, quietDate.getTime());
    expect(quietResult.allowed).toBe(false);
    expect(quietResult.reason).toContain('Quiet hours');

    // Outside quiet hours (14:00) with fullscreen app (e.g. game or movie)
    const daytime = new Date('2026-09-14T14:00:00').getTime();
    const fullscreenApp = {
      processName: 'game.exe',
      windowTitle: 'Game',
      category: 'GAMING' as const,
      isFullScreen: true,
      timestamp: daytime,
    };

    const fullResult = policy.evaluate('POSTURE', 'NORMAL', fullscreenApp, daytime);
    expect(fullResult.allowed).toBe(false);
    expect(fullResult.reason).toContain('Fullscreen');
  });

  it('should enforce anti-fatigue backoff when >= 3 alerts fire in 5 minutes', () => {
    const policy = new NotificationPolicyEngine({
      ...mockSettings.notifications,
      quietHoursEnabled: false,
    });

    const t0 = 100000;
    // Alert 1
    expect(policy.evaluate('POSTURE', 'NORMAL', undefined, t0).allowed).toBe(true);
    policy.recordDelivery('POSTURE', t0);

    // Alert 2
    expect(policy.evaluate('POSTURE', 'NORMAL', undefined, t0 + 60000).allowed).toBe(true);
    policy.recordDelivery('POSTURE', t0 + 60000);

    // Alert 3
    expect(policy.evaluate('POSTURE', 'NORMAL', undefined, t0 + 120000).allowed).toBe(true);
    policy.recordDelivery('POSTURE', t0 + 120000);

    // Alert 4 within 30s after 3rd alert -> must be throttled by anti-fatigue policy
    const throttled = policy.evaluate('POSTURE', 'NORMAL', undefined, t0 + 150000);
    expect(throttled.allowed).toBe(false);
    expect(throttled.reason).toContain('Anti-fatigue backoff');
  });

  it('should adjust resource governor modes according to system state', () => {
    const governor = new ResourceGovernor();

    // Plugged in, normal state
    const status1 = governor.evaluate({
      cameraAvailable: true,
      isOnBattery: false,
      batteryLevelPercent: 100,
      cpuLoadPercent: 15,
      isUserIdle: false,
    });
    expect(status1.mode).toBe('BALANCED');
    expect(status1.targetFps).toBe(5);

    // Laptop switched to battery
    const status2 = governor.evaluate({
      cameraAvailable: true,
      isOnBattery: true,
      batteryLevelPercent: 65,
      cpuLoadPercent: 15,
      isUserIdle: false,
    });
    expect(status2.mode).toBe('POWER_SAVER');
    expect(status2.targetFps).toBe(2);

    // User stepped away (idle > 3 min)
    const status3 = governor.evaluate({
      cameraAvailable: true,
      isOnBattery: false,
      batteryLevelPercent: 100,
      cpuLoadPercent: 10,
      isUserIdle: true,
    });
    expect(status3.mode).toBe('IDLE');
    expect(status3.targetFps).toBe(0);
    expect(status3.cameraActive).toBe(false);
  });

  it('should emit posture warning and automatically resolve when posture improves', () => {
    const engine = new ReminderEngine({
      ...mockSettings,
      notifications: { ...mockSettings.notifications, quietHoursEnabled: false },
    });

    const emittedEvents: ReminderEvent[] = [];
    engine.subscribe((evt) => emittedEvents.push(evt));

    const t0 = 1000000;

    // Send POOR posture analysis
    engine.processVisionAnalysis(
      {
        timestamp: t0,
        faceDetected: true,
        confidence: 0.9,
        distanceEstimateCm: 55,
        distanceRatio: 1.0,
        distanceState: 'SAFE',
        postureScore: 50,
        postureState: 'POOR',
        headAngles: { pitch: 25, roll: 0, yaw: 0 },
        slouchDetected: true,
      },
      undefined,
      t0
    );

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0].type).toBe('POSTURE');
    expect(emittedEvents[0].state).toBe('ACTIVE_WARNING');

    // Now user straightens up (GOOD posture)
    engine.processVisionAnalysis(
      {
        timestamp: t0 + 2000,
        faceDetected: true,
        confidence: 0.95,
        distanceEstimateCm: 55,
        distanceRatio: 1.0,
        distanceState: 'SAFE',
        postureScore: 95,
        postureState: 'GOOD',
        headAngles: { pitch: 2, roll: 0, yaw: 0 },
        slouchDetected: false,
      },
      undefined,
      t0 + 2000
    );

    expect(emittedEvents.length).toBe(2);
    expect(emittedEvents[1].type).toBe('POSTURE');
    expect(emittedEvents[1].state).toBe('RESOLVED');
  });

  it('should emit screen time warnings at 80% and 100% daily limit', () => {
    const engine = new ReminderEngine({
      ...mockSettings,
      screenTime: {
        enabled: true,
        dailyLimitMinutes: 100,
        warningThresholdPercent: 80,
        excludedApplications: [],
      },
      notifications: { ...mockSettings.notifications, quietHoursEnabled: false },
    });

    const emittedEvents: ReminderEvent[] = [];
    engine.subscribe((evt) => emittedEvents.push(evt));

    // 50 minutes: no warning
    engine.updateScreenTime(50);
    expect(emittedEvents.length).toBe(0);

    // 80 minutes: 80% warning
    engine.updateScreenTime(80);
    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0].type).toBe('SCREEN_TIME');
    expect(emittedEvents[0].state).toBe('WARNING');

    // 100 minutes: 100% urgent limit reached
    engine.updateScreenTime(100);
    expect(emittedEvents.length).toBe(2);
    expect(emittedEvents[1].type).toBe('SCREEN_TIME');
    expect(emittedEvents[1].state).toBe('ACTIVE_WARNING');
    expect(emittedEvents[1].priority).toBe('URGENT');
  });

  it('should emit BLINK_REMINDER when prolonged stare without blinking is detected', () => {
    const engine = new ReminderEngine({
      ...mockSettings,
      notifications: { ...mockSettings.notifications, quietHoursEnabled: false },
    });

    const emittedEvents: ReminderEvent[] = [];
    engine.subscribe((evt) => emittedEvents.push(evt));

    const now = 1700000000000;
    engine.processVisionAnalysis({
      timestamp: now,
      faceDetected: true,
      confidence: 0.95,
      distanceEstimateCm: 60,
      distanceRatio: 1.0,
      distanceState: 'SAFE',
      postureScore: 90,
      postureState: 'GOOD',
      headAngles: { pitch: 0, roll: 0, yaw: 0 },
      slouchDetected: false,
      blinkMetrics: {
        leftEar: 0.28,
        rightEar: 0.28,
        averageEar: 0.28,
        blinkCount: 2,
        blinksPerMinute: 6,
        secondsSinceLastBlink: 8.5,
        prolongedStareDetected: true,
        eyeStrainScore: 75,
      },
    }, undefined, now);

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0].type).toBe('BLINK_REMINDER');
    expect(emittedEvents[0].titleKey).toBe('blink.reminderTitle');
    expect(emittedEvents[0].payload?.stareSeconds).toBe(9);
  });

  it('should not emit BLINK_REMINDER when blink reminder is disabled (default off)', () => {
    const engine = new ReminderEngine({
      ...mockSettings,
      blink: { ...mockSettings.blink, enabled: false },
      notifications: { ...mockSettings.notifications, quietHoursEnabled: false },
    });

    const emittedEvents: ReminderEvent[] = [];
    engine.subscribe((evt) => emittedEvents.push(evt));

    const now = 1700000000000;
    engine.processVisionAnalysis({
      timestamp: now,
      faceDetected: true,
      confidence: 0.95,
      distanceEstimateCm: 60,
      distanceRatio: 1.0,
      distanceState: 'SAFE',
      postureScore: 90,
      postureState: 'GOOD',
      headAngles: { pitch: 0, roll: 0, yaw: 0 },
      slouchDetected: false,
      blinkMetrics: {
        leftEar: 0.28,
        rightEar: 0.28,
        averageEar: 0.28,
        blinkCount: 2,
        blinksPerMinute: 6,
        secondsSinceLastBlink: 8.5,
        prolongedStareDetected: true,
        eyeStrainScore: 75,
      },
    }, undefined, now);

    expect(emittedEvents.length).toBe(0);
  });
});
