export type AppLanguage = 'en' | 'vi';
export type AppTheme = 'system' | 'dark' | 'light';

export interface GeneralSettings {
  language: AppLanguage;
  theme: AppTheme;
  startWithWindows: boolean;
  minimizeToTray: boolean;
  autoCheckUpdates: boolean;
}

export interface CameraSettings {
  deviceId: string;
  enabled: boolean;
  mirror: boolean;
  sensitivity: number; // 1 (low) to 5 (high)
}

export interface CalibrationData {
  baselineFaceDistanceRatio: number;
  baselineFaceWidth: number;
  baselinePitch: number;
  baselineRoll: number;
  baselineY: number;
  calibratedAt: string;
  cameraDeviceId: string;
}

export interface PostureSettings {
  enabled: boolean;
  sensitivity: number; // 1 to 5
  warningDelaySeconds: number; // e.g. 5s
  cooldownSeconds: number; // e.g. 30s
  soundEnabled: boolean;
  voiceEnabled: boolean;
}

export interface DistanceSettings {
  enabled: boolean;
  thresholdCm: number; // approximate comfort threshold e.g. 50cm
  warningDelaySeconds: number; // e.g. 5s
  cooldownSeconds: number;
  soundEnabled: boolean;
  voiceEnabled: boolean;
}

export interface BreakSettings {
  enabled: boolean;
  intervalMinutes: number; // default 20 (20-20-20 rule)
  durationSeconds: number; // default 20
  strictMode: boolean; // block screen or prominent overlay
  soundEnabled: boolean;
}

export interface HydrationSettings {
  enabled: boolean;
  intervalMinutes: number; // default 45 min
  dailyGoalGlasses: number; // default 8
  soundEnabled: boolean;
}

export interface ScreenTimeSettings {
  enabled: boolean;
  dailyLimitMinutes: number; // default 360 (6 hours)
  warningThresholdPercent: number; // default 80%
  excludedApplications: string[];
}

export interface NotificationSettings {
  popupEnabled: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  soundVolume: number; // 0 to 100
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string; // HH:mm
  suppressInFullscreen: boolean;
}

export interface PrivacySettings {
  telemetryEnabled: boolean;
  localRetentionDays: number; // 30, 60, 90
  cameraProcessingLocalOnly: boolean; // always true
}

export interface SecuritySettings {
  enabled: boolean;
  passwordHash?: string;
  requireOnPause: boolean;
  requireOnQuit: boolean;
}

export interface UserSettings {
  profileId: string;
  general: GeneralSettings;
  camera: CameraSettings;
  posture: PostureSettings;
  distance: DistanceSettings;
  breaks: BreakSettings;
  hydration: HydrationSettings;
  screenTime: ScreenTimeSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
  calibration?: CalibrationData;
}
