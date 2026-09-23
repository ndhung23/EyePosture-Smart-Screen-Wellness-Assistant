import {
  ReminderEvent,
  ReminderType,
  ReminderState,
  UserSettings,
  VisionFrameAnalysis,
  ActiveAppInfo,
} from '@eyeposture/shared-types';
import { BreakTimer } from '../timers/break-timer.js';
import { HydrationTimer } from '../timers/hydration-timer.js';
import { NotificationPolicyEngine } from '../policy/notification-policy.js';
import { ResourceGovernor, GovernorInputs } from '../governor/resource-governor.js';

export type ReminderListener = (event: ReminderEvent) => void;

export class ReminderEngine {
  private settings: UserSettings;
  private breakTimer: BreakTimer;
  private hydrationTimer: HydrationTimer;
  private policyEngine: NotificationPolicyEngine;
  private governor: ResourceGovernor;

  private listeners: Set<ReminderListener> = new Set();

  // Active reminder states
  private activePostureState: ReminderState = 'NORMAL';
  private activeDistanceState: ReminderState = 'NORMAL';
  private activeBlinkState: ReminderState = 'NORMAL';
  private lastPostureAlertTime: number = 0;
  private lastDistanceAlertTime: number = 0;
  private lastBlinkAlertTime: number = 0;

  // Screen time tracking in current day (minutes)
  private screenTimeMinutesToday: number = 0;
  private screenTimeWarningEmitted: Set<number> = new Set(); // 80, 90, 100

  constructor(settings: UserSettings) {
    this.settings = settings;
    this.breakTimer = new BreakTimer({
      intervalMinutes: settings.breaks.intervalMinutes,
      durationSeconds: settings.breaks.durationSeconds,
    });
    this.hydrationTimer = new HydrationTimer({
      intervalMinutes: settings.hydration.intervalMinutes,
      dailyGoalGlasses: settings.hydration.dailyGoalGlasses,
    });
    this.policyEngine = new NotificationPolicyEngine(settings.notifications);
    this.governor = new ResourceGovernor();
  }

  public updateSettings(settings: UserSettings): void {
    this.settings = settings;
    this.breakTimer.updateConfig(settings.breaks.intervalMinutes, settings.breaks.durationSeconds);
    this.hydrationTimer.updateConfig(
      settings.hydration.intervalMinutes,
      settings.hydration.dailyGoalGlasses
    );
    this.policyEngine.updateSettings(settings.notifications);
  }

  public subscribe(listener: ReminderListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: ReminderEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  /**
   * Main periodic tick (e.g. called every 1 second by background timer)
   */
  public tick(deltaSeconds: number = 1, activeApp?: ActiveAppInfo, now: number = Date.now()): void {
    // 1. Tick Eye-Break Timer
    if (this.settings.breaks.enabled) {
      const breakRes = this.breakTimer.tick(deltaSeconds);
      if (breakRes.triggered) {
        const policy = this.policyEngine.evaluate('EYE_BREAK', 'NORMAL', activeApp, now);
        if (policy.allowed) {
          this.policyEngine.recordDelivery('EYE_BREAK', now);
          this.emit({
            id: crypto.randomUUID(),
            type: 'EYE_BREAK',
            state: 'ACTIVE_WARNING',
            priority: policy.adjustedPriority ?? 'NORMAL',
            titleKey: 'breaks.breakTitle',
            messageKey: 'breaks.breakMessage',
            timestamp: now,
            canSnooze: true,
            snoozeSeconds: 300,
          });
        }
      }
    }

    // 2. Tick Hydration Timer
    if (this.settings.hydration.enabled) {
      const hydRes = this.hydrationTimer.tick(deltaSeconds);
      if (hydRes.triggered) {
        const policy = this.policyEngine.evaluate('HYDRATION', 'LOW', activeApp, now);
        if (policy.allowed) {
          this.policyEngine.recordDelivery('HYDRATION', now);
          this.emit({
            id: crypto.randomUUID(),
            type: 'HYDRATION',
            state: 'ACTIVE_WARNING',
            priority: policy.adjustedPriority ?? 'LOW',
            titleKey: 'hydration.reminderTitle',
            messageKey: 'hydration.reminderMessage',
            timestamp: now,
            canSnooze: true,
            snoozeSeconds: 600,
          });
        }
      }
    }
  }

  /**
   * Processes output from Vision Engine
   */
  public processVisionAnalysis(
    analysis: VisionFrameAnalysis,
    activeApp?: ActiveAppInfo,
    now: number = Date.now()
  ): void {
    // 1. Posture state evaluation
    if (this.settings.posture.enabled) {
      if (analysis.postureState === 'POOR') {
        const cooldownMs = this.settings.posture.cooldownSeconds * 1000;
        if (now - this.lastPostureAlertTime >= cooldownMs) {
          const policy = this.policyEngine.evaluate('POSTURE', 'NORMAL', activeApp, now);
          if (policy.allowed) {
            this.lastPostureAlertTime = now;
            this.activePostureState = 'ACTIVE_WARNING';
            this.policyEngine.recordDelivery('POSTURE', now);
            this.emit({
              id: crypto.randomUUID(),
              type: 'POSTURE',
              state: 'ACTIVE_WARNING',
              priority: policy.adjustedPriority ?? 'NORMAL',
              titleKey: 'notifications.posture_warning',
              messageKey: 'notifications.posture_warning_detail',
              timestamp: now,
              canSnooze: false,
            });
          }
        }
      } else if (analysis.postureState === 'GOOD' && this.activePostureState === 'ACTIVE_WARNING') {
        // User corrected posture! Resolve warning immediately
        this.activePostureState = 'NORMAL';
        this.emit({
          id: crypto.randomUUID(),
          type: 'POSTURE',
          state: 'RESOLVED',
          priority: 'LOW',
          titleKey: 'monitor.slouchNormal',
          messageKey: 'monitor.slouchNormal',
          timestamp: now,
          canSnooze: false,
        });
      }
    }

    // 2. Distance state evaluation
    if (this.settings.distance.enabled) {
      if (analysis.distanceState === 'TOO_CLOSE') {
        const cooldownMs = this.settings.distance.cooldownSeconds * 1000;
        if (now - this.lastDistanceAlertTime >= cooldownMs) {
          const policy = this.policyEngine.evaluate('DISTANCE', 'NORMAL', activeApp, now);
          if (policy.allowed) {
            this.lastDistanceAlertTime = now;
            this.activeDistanceState = 'ACTIVE_WARNING';
            this.policyEngine.recordDelivery('DISTANCE', now);
            this.emit({
              id: crypto.randomUUID(),
              type: 'DISTANCE',
              state: 'ACTIVE_WARNING',
              priority: policy.adjustedPriority ?? 'NORMAL',
              titleKey: 'notifications.distance_too_close',
              messageKey: 'notifications.distance_too_close_detail',
              timestamp: now,
              canSnooze: false,
            });
          }
        }
      } else if (analysis.distanceState === 'SAFE' && this.activeDistanceState === 'ACTIVE_WARNING') {
        // User backed away! Resolve warning immediately
        this.activeDistanceState = 'NORMAL';
        this.emit({
          id: crypto.randomUUID(),
          type: 'DISTANCE',
          state: 'RESOLVED',
          priority: 'LOW',
          titleKey: 'dashboard.statusGood',
          messageKey: 'dashboard.statusGood',
          timestamp: now,
          canSnooze: false,
        });
      }
    }

    // 3. Eye Blink / Prolonged Stare evaluation (ErgoBlink integration)
    const blinkSettings = this.settings.blink;
    if (blinkSettings?.enabled && analysis.blinkMetrics) {
      const { prolongedStareDetected, eyeStrainScore, secondsSinceLastBlink } = analysis.blinkMetrics;
      const cooldownMs = blinkSettings.cooldownSeconds * 1000;

      if (prolongedStareDetected || eyeStrainScore >= 70) {
        if (now - this.lastBlinkAlertTime >= cooldownMs) {
          const policy = this.policyEngine.evaluate('BLINK_REMINDER', 'NORMAL', activeApp, now);
          if (policy.allowed) {
            this.lastBlinkAlertTime = now;
            this.activeBlinkState = 'ACTIVE_WARNING';
            this.policyEngine.recordDelivery('BLINK_REMINDER', now);
            this.emit({
              id: crypto.randomUUID(),
              type: 'BLINK_REMINDER',
              state: 'ACTIVE_WARNING',
              priority: policy.adjustedPriority ?? 'NORMAL',
              titleKey: 'blink.reminderTitle',
              messageKey: 'blink.reminderMessage',
              payload: {
                stareSeconds: Math.round(secondsSinceLastBlink),
                eyeStrainScore,
              },
              timestamp: now,
              canSnooze: false,
            });
          }
        }
      } else if (!prolongedStareDetected && this.activeBlinkState === 'ACTIVE_WARNING') {
        this.activeBlinkState = 'NORMAL';
      }
    }
  }

  /**
   * Updates screen time progress and fires limit alerts (80%, 90%, 100%)
   */
  public updateScreenTime(usedMinutes: number, now: number = Date.now()): void {
    this.screenTimeMinutesToday = usedMinutes;
    if (!this.settings.screenTime.enabled) return;

    const limit = this.settings.screenTime.dailyLimitMinutes;
    if (limit <= 0) return;

    const percent = Math.round((usedMinutes / limit) * 100);

    if (percent >= 100 && !this.screenTimeWarningEmitted.has(100)) {
      this.screenTimeWarningEmitted.add(100);
      this.emit({
        id: crypto.randomUUID(),
        type: 'SCREEN_TIME',
        state: 'ACTIVE_WARNING',
        priority: 'URGENT',
        titleKey: 'screenTime.limitReached',
        messageKey: 'screenTime.limitReached',
        payload: { percent: 100 },
        timestamp: now,
        canSnooze: true,
        snoozeSeconds: 900,
      });
    } else if (percent >= 80 && percent < 100 && !this.screenTimeWarningEmitted.has(80)) {
      this.screenTimeWarningEmitted.add(80);
      this.emit({
        id: crypto.randomUUID(),
        type: 'SCREEN_TIME',
        state: 'WARNING',
        priority: 'NORMAL',
        titleKey: 'screenTime.approachingWarning',
        messageKey: 'screenTime.approachingWarning',
        payload: { percent },
        timestamp: now,
        canSnooze: false,
      });
    }
  }

  public getBreakTimer(): BreakTimer {
    return this.breakTimer;
  }

  public getHydrationTimer(): HydrationTimer {
    return this.hydrationTimer;
  }

  public getResourceGovernor(): ResourceGovernor {
    return this.governor;
  }

  public evaluateGovernor(inputs: GovernorInputs) {
    return this.governor.evaluate(inputs);
  }
}
