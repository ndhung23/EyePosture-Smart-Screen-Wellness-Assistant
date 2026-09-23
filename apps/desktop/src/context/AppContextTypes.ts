import {
  Profile,
  UserSettings,
  VisionFrameAnalysis,
  ReminderEvent,
  DailyStatistics,
  SubscriptionTier,
  GovernorStatus,
  CameraDeviceInfo,
  SecuritySettings,
  AppTheme,
  CalibrationData,
} from '@eyeposture/shared-types';
import { LanguageCode } from '@eyeposture/i18n';

export type SimulationMode = 'UPRIGHT' | 'SLOUCH' | 'TOO_CLOSE' | 'TILT' | 'PROLONGED_STARE' | 'BLINKING';

export interface AppContextValue {
  language: LanguageCode;
  switchLanguage: (lang: LanguageCode) => void;
  theme: AppTheme;
  effectiveTheme: 'dark' | 'light';
  switchTheme: (theme: AppTheme) => void;
  currentUser: { id: string; email: string; name: string; role?: string } | null;
  authToken: string | null;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  syncEntitlements: (overrideToken?: string) => Promise<void>;
  activeProfile: Profile | null;
  profiles: Profile[];
  switchProfile: (profileId: string) => void;
  createProfile: (name: string, isChild: boolean) => void;
  deleteProfile: (id: string) => void;
  settings: UserSettings | null;
  updateSettings: (newSettings: UserSettings) => void;
  isMonitoring: boolean;
  toggleMonitoring: () => void;
  requestToggleMonitoring: (forceTarget?: boolean) => void;
  requestQuitApp: () => void;
  confirmQuit: () => void;
  passwordModalConfig: {
    isOpen: boolean;
    action: 'PAUSE_MONITORING' | 'QUIT_APP' | 'ACCESS_SETTINGS';
    onSuccess?: () => void;
  } | null;
  requestAccessSettings: (onSuccess: () => void) => void;
  isSettingsUnlocked: boolean;
  closePasswordModal: () => void;
  verifyPassword: (password: string) => Promise<boolean>;
  updateSecuritySettings: (newSecurity: SecuritySettings) => void;
  liveAnalysis: VisionFrameAnalysis;
  governorStatus: GovernorStatus;
  activeReminders: ReminderEvent[];
  dismissReminder: (id: string) => void;
  snoozeReminder: (id: string, seconds?: number) => void;
  dailyStats: DailyStatistics;
  logWaterGlass: () => void;
  startBreakNow: () => void;
  completeBreak: () => void;
  skipBreak: () => void;
  isBreakActive: boolean;
  breakProgress: { remainingSeconds: number; percentComplete: number };
  hydrationProgress: { glassesToday: number; dailyGoalGlasses: number; percentComplete: number };
  screenTimeMinutes: number;
  screenTimeLimitMinutes: number;
  subscriptionTier: SubscriptionTier;
  upgradeToPro: () => Promise<void>;
  clearLocalData: () => void;
  connectedCameras: CameraDeviceInfo[];
  selectedCameraId: string;
  selectCamera: (id: string) => void;
  cameraStream: MediaStream | null;
  cameraError: string | null;
  startCamera: (deviceId?: string) => Promise<void>;
  stopCamera: () => void;
  useSimulatedCamera: boolean;
  setUseSimulatedCamera: (val: boolean) => void;
  simulationMode: SimulationMode;
  setSimulationMode: (mode: SimulationMode) => void;
  isCalibrating: boolean;
  calibrationSamplesCount: number;
  activeCalibration: CalibrationData | null;
  startPostureCalibration: () => Promise<CalibrationData | null>;
  triggerOverlayAlert: (type?: string, title?: string, message?: string) => void;
}
