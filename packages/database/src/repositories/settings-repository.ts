import { IDatabaseDriver } from '../driver/interface.js';
import {
  UserSettings,
  GeneralSettings,
  CameraSettings,
  PostureSettings,
  DistanceSettings,
  BreakSettings,
  HydrationSettings,
  ScreenTimeSettings,
  NotificationSettings,
  PrivacySettings,
} from '@eyeposture/shared-types';

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  language: 'en',
  theme: 'dark',
  startWithWindows: true,
  minimizeToTray: true,
  autoCheckUpdates: true,
};

export const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  deviceId: 'default',
  enabled: true,
  mirror: true,
  sensitivity: 3,
};

export const DEFAULT_POSTURE_SETTINGS: PostureSettings = {
  enabled: true,
  sensitivity: 3,
  warningDelaySeconds: 5,
  cooldownSeconds: 30,
  soundEnabled: true,
  voiceEnabled: false,
};

export const DEFAULT_DISTANCE_SETTINGS: DistanceSettings = {
  enabled: true,
  thresholdCm: 50,
  warningDelaySeconds: 5,
  cooldownSeconds: 25,
  soundEnabled: true,
  voiceEnabled: false,
};

export const DEFAULT_BREAK_SETTINGS: BreakSettings = {
  enabled: true,
  intervalMinutes: 20,
  durationSeconds: 20,
  strictMode: false,
  soundEnabled: true,
};

export const DEFAULT_HYDRATION_SETTINGS: HydrationSettings = {
  enabled: true,
  intervalMinutes: 45,
  dailyGoalGlasses: 8,
  soundEnabled: true,
};

export const DEFAULT_SCREEN_TIME_SETTINGS: ScreenTimeSettings = {
  enabled: true,
  dailyLimitMinutes: 360,
  warningThresholdPercent: 80,
  excludedApplications: [],
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  popupEnabled: true,
  soundEnabled: true,
  voiceEnabled: false,
  soundVolume: 75,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  suppressInFullscreen: true,
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  telemetryEnabled: false,
  localRetentionDays: 60,
  cameraProcessingLocalOnly: true,
};

export class SettingsRepository {
  private driver: IDatabaseDriver;

  constructor(driver: IDatabaseDriver) {
    this.driver = driver;
  }

  public getCategory<T>(profileId: string, category: string, defaultValue: T): T {
    const row = this.driver.get<{ config_json: string }>(
      'SELECT config_json FROM settings WHERE profile_id = ? AND category = ?',
      [profileId, category]
    );
    if (!row) return defaultValue;
    try {
      return { ...defaultValue, ...JSON.parse(row.config_json) };
    } catch {
      return defaultValue;
    }
  }

  public saveCategory<T>(profileId: string, category: string, config: T): void {
    const now = new Date().toISOString();
    const configJson = JSON.stringify(config);
    this.driver.run(
      `INSERT INTO settings (profile_id, category, config_json, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(profile_id, category) DO UPDATE SET config_json = excluded.config_json, updated_at = excluded.updated_at`,
      [profileId, category, configJson, now]
    );
  }

  public getSettings(profileId: string): UserSettings {
    return {
      profileId,
      general: this.getCategory<GeneralSettings>(profileId, 'general', DEFAULT_GENERAL_SETTINGS),
      camera: this.getCategory<CameraSettings>(profileId, 'camera', DEFAULT_CAMERA_SETTINGS),
      posture: this.getCategory<PostureSettings>(profileId, 'posture', DEFAULT_POSTURE_SETTINGS),
      distance: this.getCategory<DistanceSettings>(profileId, 'distance', DEFAULT_DISTANCE_SETTINGS),
      breaks: this.getCategory<BreakSettings>(profileId, 'breaks', DEFAULT_BREAK_SETTINGS),
      hydration: this.getCategory<HydrationSettings>(profileId, 'hydration', DEFAULT_HYDRATION_SETTINGS),
      screenTime: this.getCategory<ScreenTimeSettings>(profileId, 'screenTime', DEFAULT_SCREEN_TIME_SETTINGS),
      notifications: this.getCategory<NotificationSettings>(profileId, 'notifications', DEFAULT_NOTIFICATION_SETTINGS),
      privacy: this.getCategory<PrivacySettings>(profileId, 'privacy', DEFAULT_PRIVACY_SETTINGS),
    };
  }

  public saveSettings(profileId: string, settings: UserSettings): void {
    this.saveCategory(profileId, 'general', settings.general);
    this.saveCategory(profileId, 'camera', settings.camera);
    this.saveCategory(profileId, 'posture', settings.posture);
    this.saveCategory(profileId, 'distance', settings.distance);
    this.saveCategory(profileId, 'breaks', settings.breaks);
    this.saveCategory(profileId, 'hydration', settings.hydration);
    this.saveCategory(profileId, 'screenTime', settings.screenTime);
    this.saveCategory(profileId, 'notifications', settings.notifications);
    this.saveCategory(profileId, 'privacy', settings.privacy);
  }
}
