import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  SqlJsDriver,
  MigrationRunner,
  ProfileRepository,
  SettingsRepository,
  CalibrationRepository,
  EventRepository,
  ScreenTimeRepository,
  StatisticsRepository,
  LicenseRepository,
} from '../src/index.js';

describe('Database Layer & Repositories', () => {
  let driver: SqlJsDriver;
  let profileRepo: ProfileRepository;
  let settingsRepo: SettingsRepository;
  let calibRepo: CalibrationRepository;
  let eventRepo: EventRepository;
  let screenRepo: ScreenTimeRepository;
  let statsRepo: StatisticsRepository;
  let licenseRepo: LicenseRepository;

  beforeEach(async () => {
    driver = await SqlJsDriver.create();
    const runner = new MigrationRunner(driver);
    runner.runMigrations();

    profileRepo = new ProfileRepository(driver);
    settingsRepo = new SettingsRepository(driver);
    calibRepo = new CalibrationRepository(driver);
    eventRepo = new EventRepository(driver);
    screenRepo = new ScreenTimeRepository(driver);
    statsRepo = new StatisticsRepository(driver);
    licenseRepo = new LicenseRepository(driver);
  });

  afterEach(() => {
    driver.close();
  });

  it('should run migrations and create schema tables', () => {
    const runner = new MigrationRunner(driver);
    expect(runner.getCurrentVersion()).toBe(1);
  });

  it('should handle profile creation, defaults, and switching', () => {
    const profile1 = profileRepo.create({
      name: 'John Doe',
      isChild: false,
      isDefault: true,
    });
    expect(profile1.id).toBeDefined();
    expect(profile1.name).toBe('John Doe');
    expect(profile1.isDefault).toBe(true);

    const profile2 = profileRepo.create({
      name: 'Timmy (Child)',
      isChild: true,
      isDefault: false,
    });

    const all = profileRepo.findAll();
    expect(all.length).toBe(2);

    profileRepo.setDefault(profile2.id);
    const def = profileRepo.getDefault();
    expect(def?.id).toBe(profile2.id);
    expect(def?.name).toBe('Timmy (Child)');
  });

  it('should manage settings with fallback defaults', () => {
    const profile = profileRepo.create({ name: 'Jane', isChild: false, isDefault: true });
    const settings = settingsRepo.getSettings(profile.id);

    expect(settings.general.language).toBe('en');
    expect(settings.breaks.intervalMinutes).toBe(20);
    expect(settings.distance.thresholdCm).toBe(50);
    expect(settings.security.enabled).toBe(false);
    expect(settings.security.requireOnPause).toBe(true);
    expect(settings.blink?.enabled).toBe(false);

    // Update break interval and security
    settings.breaks.intervalMinutes = 25;
    settings.security = {
      enabled: true,
      passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      requireOnPause: true,
      requireOnQuit: true,
    };
    settingsRepo.saveSettings(profile.id, settings);

    const updated = settingsRepo.getSettings(profile.id);
    expect(updated.breaks.intervalMinutes).toBe(25);
    expect(updated.security.enabled).toBe(true);
    expect(updated.security.passwordHash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('should store and retrieve camera calibration baselines', () => {
    const profile = profileRepo.create({ name: 'Alice', isChild: false, isDefault: true });
    const baseline = {
      cameraDeviceId: 'cam-01',
      baselineFaceDistanceRatio: 0.35,
      baselineFaceWidth: 140,
      baselinePitch: 5.2,
      baselineRoll: -1.0,
      baselineY: 210,
      calibratedAt: new Date().toISOString(),
    };

    calibRepo.saveCalibration(profile.id, baseline);
    const retrieved = calibRepo.getLatestCalibration(profile.id, 'cam-01');

    expect(retrieved).toBeDefined();
    expect(retrieved?.baselineFaceDistanceRatio).toBeCloseTo(0.35);
    expect(retrieved?.baselinePitch).toBeCloseTo(5.2);
  });

  it('should log summarized events and aggregate day metrics', () => {
    const profile = profileRepo.create({ name: 'Bob', isChild: false, isDefault: true });
    const now = Date.now();
    const dayStart = now - 10000;
    const dayEnd = now + 10000;

    eventRepo.logPostureEvent({
      profileId: profile.id,
      startTime: now - 5000,
      endTime: now,
      durationSeconds: 5,
      severity: 'WARNING',
      averageScore: 65,
    });

    eventRepo.logDistanceEvent({
      profileId: profile.id,
      startTime: now - 3000,
      endTime: now,
      durationSeconds: 3,
      minDistanceRatio: 0.55,
    });

    eventRepo.logBreakSession({
      profileId: profile.id,
      sessionType: 'EYE_BREAK_20_20_20',
      targetDurationSec: 20,
      actualDurationSec: 20,
      completed: true,
      skipped: false,
      timestamp: now,
    });

    eventRepo.logHydration(profile.id, 2);

    const summary = eventRepo.getEventsCountForDay(profile.id, dayStart, dayEnd);
    expect(summary.postureCount).toBe(1);
    expect(summary.distanceCount).toBe(1);
    expect(summary.breaksCompleted).toBe(1);
    expect(summary.breaksSkipped).toBe(0);
    expect(summary.hydrationGlasses).toBe(2);
  });

  it('should track screen time and app usage without collecting sensitive content', () => {
    const profile = profileRepo.create({ name: 'Sam', isChild: false, isDefault: true });
    const today = '2026-09-14';

    screenRepo.recordAppUsage(profile.id, today, 'Code.exe', 'DEVELOPMENT', 3600);
    screenRepo.recordAppUsage(profile.id, today, 'chrome.exe', 'BROWSING', 1800);

    const usage = screenRepo.getAppUsageForDate(profile.id, today);
    expect(usage.length).toBe(2);
    expect(usage[0].processName).toBe('Code.exe');
    expect(usage[0].percentageOfTotal).toBe(67); // 3600 / 5400 = 66.6%

    const totalMinutes = screenRepo.getDailyScreenTimeMinutes(profile.id, today);
    expect(totalMinutes).toBe(90);
  });

  it('should calculate Screen Wellness Score and weekly statistics accurately', () => {
    const score = statsRepo.calculateScreenWellnessScore(2, 1, 3, 0, 4);
    // Base 100 - (2*2) - (1*3) - 0 + (3*5) + (4*2) = 100 - 4 - 3 + 15 + 8 = 116 -> capped at 100
    expect(score).toBe(100);

    const badScore = statsRepo.calculateScreenWellnessScore(10, 5, 0, 2, 0);
    // Base 100 - 20 - 15 - 20 = 45
    expect(badScore).toBe(45);

    const profile = profileRepo.create({ name: 'Eve', isChild: false, isDefault: true });
    statsRepo.upsertDailyStats({
      date: '2026-09-14',
      profileId: profile.id,
      totalScreenTimeMinutes: 240,
      postureWarningsCount: 3,
      distanceWarningsCount: 1,
      eyeBreaksCompleted: 4,
      eyeBreaksSkipped: 1,
      waterGlassesDrank: 5,
      wellnessScore: 88,
    });

    const daily = statsRepo.getDailyStats(profile.id, '2026-09-14');
    expect(daily.wellnessScore).toBe(88);
    expect(daily.totalScreenTimeMinutes).toBe(240);
  });

  it('should cache and clear signed entitlements for offline use', () => {
    licenseRepo.saveCachedLicense(
      'header.payload.sig',
      'signature_hex',
      Date.now() + 86400000,
      'PRO',
      ['posture_full', 'distance_full']
    );

    const cached = licenseRepo.getCachedLicense();
    expect(cached).toBeDefined();
    expect(cached?.tier).toBe('PRO');
    expect(cached?.features).toContain('posture_full');

    licenseRepo.clearCachedLicense();
    expect(licenseRepo.getCachedLicense()).toBeUndefined();
  });
});
