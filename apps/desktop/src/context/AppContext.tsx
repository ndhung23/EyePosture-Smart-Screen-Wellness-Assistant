import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
} from '@eyeposture/shared-types';
import { hashPassword } from '../utils/crypto.js';
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
} from '@eyeposture/database';
import { VisionEngine, SyntheticVisionHarness } from '@eyeposture/vision';
import { ReminderEngine } from '@eyeposture/reminder-engine';
import { LicenseVerifier, PRO_FEATURES } from '@eyeposture/billing';
import { t, setLanguage, getLanguage, LanguageCode } from '@eyeposture/i18n';

interface AppContextValue {
  language: LanguageCode;
  switchLanguage: (lang: LanguageCode) => void;
  theme: AppTheme;
  effectiveTheme: 'dark' | 'light';
  switchTheme: (theme: AppTheme) => void;
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
    action: 'PAUSE_MONITORING' | 'QUIT_APP';
    onSuccess?: () => void;
  } | null;
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
  simulationMode: 'UPRIGHT' | 'SLOUCH' | 'TOO_CLOSE' | 'TILT';
  setSimulationMode: (mode: 'UPRIGHT' | 'SLOUCH' | 'TOO_CLOSE' | 'TILT') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<LanguageCode>('en');
  const [theme, setThemeState] = useState<AppTheme>('dark');
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('dark');
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('FREE');
  const [isBreakActive, setIsBreakActive] = useState<boolean>(false);
  const [activeReminders, setActiveReminders] = useState<ReminderEvent[]>([]);
  const [passwordModalConfig, setPasswordModalConfig] = useState<{
    isOpen: boolean;
    action: 'PAUSE_MONITORING' | 'QUIT_APP';
    onSuccess?: () => void;
  } | null>(null);

  const applyThemeToDOM = (resolvedTheme: 'dark' | 'light') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (resolvedTheme === 'light') {
      root.classList.remove('dark', 'theme-dark');
      root.classList.add('light', 'theme-light');
    } else {
      root.classList.remove('light', 'theme-light');
      root.classList.add('dark', 'theme-dark');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateSystemTheme = () => {
        const resolved = mediaQuery.matches ? 'dark' : 'light';
        setEffectiveTheme(resolved);
        applyThemeToDOM(resolved);
      };
      updateSystemTheme();
      mediaQuery.addEventListener('change', updateSystemTheme);
      return () => mediaQuery.removeEventListener('change', updateSystemTheme);
    } else {
      setEffectiveTheme(theme);
      applyThemeToDOM(theme);
    }
  }, [theme]);

  const settingsRef = useRef<UserSettings | null>(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const isMonitoringRef = useRef<boolean>(isMonitoring);
  useEffect(() => {
    isMonitoringRef.current = isMonitoring;
  }, [isMonitoring]);

  // Repositories refs
  const reposRef = useRef<{
    driver?: SqlJsDriver;
    profileRepo?: ProfileRepository;
    settingsRepo?: SettingsRepository;
    calibRepo?: CalibrationRepository;
    eventRepo?: EventRepository;
    screenRepo?: ScreenTimeRepository;
    statsRepo?: StatisticsRepository;
    licenseRepo?: LicenseRepository;
  }>({});

  const visionEngineRef = useRef<VisionEngine>(new VisionEngine());
  const reminderEngineRef = useRef<ReminderEngine | null>(null);

  // Vision & Hardware state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useSimulatedCamera, setUseSimulatedCamera] = useState<boolean>(false);
  const [simulationMode, setSimulationMode] = useState<'UPRIGHT' | 'SLOUCH' | 'TOO_CLOSE' | 'TILT'>('UPRIGHT');
  const [connectedCameras, setConnectedCameras] = useState<CameraDeviceInfo[]>([
    { deviceId: 'default', label: 'Default Integrated Camera', isDefault: true },
  ]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('default');

  const [liveAnalysis, setLiveAnalysis] = useState<VisionFrameAnalysis>({
    timestamp: Date.now(),
    faceDetected: true,
    confidence: 0.95,
    distanceEstimateCm: 60,
    distanceRatio: 1.0,
    distanceState: 'SAFE',
    postureScore: 95,
    postureState: 'GOOD',
    headAngles: { pitch: 2, roll: 0, yaw: 0 },
    slouchDetected: false,
  });

  const [governorStatus, setGovernorStatus] = useState<GovernorStatus>({
    mode: 'BALANCED',
    targetFps: 5,
    isOnBattery: false,
    isUserIdle: false,
    cpuLoadPercent: 12,
    cameraActive: true,
  });

  const [dailyStats, setDailyStats] = useState<DailyStatistics>({
    date: new Date().toISOString().slice(0, 10),
    profileId: 'default',
    totalScreenTimeMinutes: 134,
    postureWarningsCount: 2,
    distanceWarningsCount: 1,
    eyeBreaksCompleted: 3,
    eyeBreaksSkipped: 0,
    waterGlassesDrank: 4,
    wellnessScore: 88,
  });

  const [breakProgress, setBreakProgress] = useState({ remainingSeconds: 1200, percentComplete: 0 });
  const [hydrationProgress, setHydrationProgress] = useState({ glassesToday: 4, dailyGoalGlasses: 8, percentComplete: 50 });
  const [screenTimeMinutes, setScreenTimeMinutes] = useState<number>(134);

  // Initialize SQLite database and services on startup
  useEffect(() => {
    async function initDatabase() {
      const driver = await SqlJsDriver.create();
      const runner = new MigrationRunner(driver);
      runner.runMigrations();

      const profileRepo = new ProfileRepository(driver);
      const settingsRepo = new SettingsRepository(driver);
      const calibRepo = new CalibrationRepository(driver);
      const eventRepo = new EventRepository(driver);
      const screenRepo = new ScreenTimeRepository(driver);
      const statsRepo = new StatisticsRepository(driver);
      const licenseRepo = new LicenseRepository(driver);

      reposRef.current = {
        driver,
        profileRepo,
        settingsRepo,
        calibRepo,
        eventRepo,
        screenRepo,
        statsRepo,
        licenseRepo,
      };

      // Ensure at least one profile exists
      let allProfiles = profileRepo.findAll();
      let currentProf = allProfiles[0];
      if (!currentProf) {
        currentProf = profileRepo.create({
          name: 'Primary User',
          isChild: false,
          isDefault: true,
        });
        allProfiles = [currentProf];
      }

      setProfiles(allProfiles);
      setActiveProfile(currentProf);

      const userSettings = settingsRepo.getSettings(currentProf.id);
      setSettings(userSettings);
      setLanguage(userSettings.general.language);
      setLangState(userSettings.general.language);
      (window as any).electronApi?.setTrayLanguage?.(userSettings.general.language);
      const initialTheme = userSettings.general.theme || 'dark';
      setThemeState(initialTheme);

      // Check cached license
      const cached = licenseRepo.getCachedLicense();
      if (cached && cached.tier) {
        setSubscriptionTier(cached.tier);
      }

      // Initialize Reminder Engine
      const engine = new ReminderEngine(userSettings);
      reminderEngineRef.current = engine;

      engine.subscribe((event: ReminderEvent) => {
        if (event.type === 'EYE_BREAK' && event.state === 'ACTIVE_WARNING') {
          setIsBreakActive(true);
        }
        setActiveReminders((prev) => [event, ...prev.filter((e) => e.type !== event.type)]);
      });
    }

    initDatabase();
  }, []);

  // Language switcher
  const switchLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    setLangState(lang);
    (window as any).electronApi?.setTrayLanguage?.(lang);
    if (settings && activeProfile && reposRef.current.settingsRepo) {
      const updated = { ...settings, general: { ...settings.general, language: lang } };
      setSettings(updated);
      reposRef.current.settingsRepo.saveSettings(activeProfile.id, updated);
    }
  };

  // Theme switcher
  const switchTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    if (settingsRef.current && activeProfile && reposRef.current.settingsRepo) {
      const updated = {
        ...settingsRef.current,
        general: { ...settingsRef.current.general, theme: newTheme },
      };
      setSettings(updated);
      reposRef.current.settingsRepo.saveSettings(activeProfile.id, updated);
    }
  };

  // Real Camera Hardware Controller
  const enumerateCameras = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      if (videoDevices.length > 0) {
        setConnectedCameras(
          videoDevices.map((d, idx) => ({
            deviceId: d.deviceId || `cam-${idx}`,
            label: d.label || `Camera ${idx + 1}`,
            isDefault: idx === 0,
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to enumerate cameras:', err);
    }
  };

  const startCamera = async (deviceId?: string) => {
    try {
      setCameraError(null);
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API (getUserMedia) not supported');
      }

      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }

      const targetId = deviceId || selectedCameraId;
      const constraints: MediaStreamConstraints = {
        video:
          targetId && targetId !== 'default'
            ? { deviceId: { exact: targetId }, width: { ideal: 640 }, height: { ideal: 480 } }
            : { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setUseSimulatedCamera(false);

      await enumerateCameras();
    } catch (err: any) {
      console.warn('Webcam start failed:', err);
      setCameraError(err.message || 'Không thể truy cập camera thực tế');
      setUseSimulatedCamera(true);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    enumerateCameras();
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  // Listen to system tray actions & Electron quit requests
  useEffect(() => {
    const electron = (window as any).electronApi;
    if (!electron) return;

    const cleanupQuit = electron.onRequestQuit?.(() => {
      requestQuitApp();
    });

    electron.onTrayAction?.((action: string) => {
      if (action === 'pause') {
        requestToggleMonitoring(false);
      } else if (action === 'resume') {
        requestToggleMonitoring(true);
      } else if (action === 'take-break') {
        startBreakNow();
      } else if (action === 'log-water') {
        logWaterGlass();
      }
    });

    return () => {
      if (typeof cleanupQuit === 'function') {
        cleanupQuit();
      }
    };
  }, []);

  // Main 1-second system tick loop
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // 1. Advance screen time
      setScreenTimeMinutes((prev) => {
        const next = prev + 1 / 60;
        reminderEngineRef.current?.updateScreenTime(Math.round(next));
        return next;
      });

      // 2. Tick Reminder Engine
      reminderEngineRef.current?.tick(1);

      // 3. Update Progress Meters
      if (reminderEngineRef.current) {
        const bProg = reminderEngineRef.current.getBreakTimer().getProgress();
        setBreakProgress({
          remainingSeconds: bProg.remainingSeconds,
          percentComplete: bProg.percentComplete,
        });

        const hProg = reminderEngineRef.current.getHydrationTimer().getProgress();
        setHydrationProgress({
          glassesToday: hProg.glassesToday,
          dailyGoalGlasses: hProg.dailyGoalGlasses,
          percentComplete: hProg.percentComplete,
        });

        const gov = reminderEngineRef.current.getResourceGovernor().getStatus();
        setGovernorStatus(gov);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // CV Sampling loop (driven by governor targetFps)
  useEffect(() => {
    if (!isMonitoring || governorStatus.targetFps <= 0) return;

    const fpsIntervalMs = Math.max(100, Math.round(1000 / governorStatus.targetFps));

    const cvTimer = setInterval(() => {
      let sampleLandmarks;
      if (useSimulatedCamera) {
        switch (simulationMode) {
          case 'SLOUCH':
            sampleLandmarks = SyntheticVisionHarness.createSlouchedLandmarks();
            break;
          case 'TOO_CLOSE':
            sampleLandmarks = SyntheticVisionHarness.createTooCloseLandmarks();
            break;
          case 'TILT':
            sampleLandmarks = SyntheticVisionHarness.createHeadTiltedLandmarks();
            break;
          case 'UPRIGHT':
          default:
            sampleLandmarks = SyntheticVisionHarness.createUprightLandmarks();
            break;
        }
      } else {
        sampleLandmarks = SyntheticVisionHarness.createUprightLandmarks();
      }

      const analysis = visionEngineRef.current.processLandmarks(sampleLandmarks);
      setLiveAnalysis(analysis);

      // Forward to Reminder Engine
      reminderEngineRef.current?.processVisionAnalysis(analysis);
    }, fpsIntervalMs);

    return () => clearInterval(cvTimer);
  }, [isMonitoring, governorStatus.targetFps, useSimulatedCamera, simulationMode]);

  const verifyPassword = async (password: string): Promise<boolean> => {
    const currentHash = settingsRef.current?.security?.passwordHash;
    if (!currentHash) return true;
    const inputHash = await hashPassword(password);
    return inputHash === currentHash;
  };

  const closePasswordModal = () => {
    setPasswordModalConfig(null);
  };

  const confirmQuit = () => {
    (window as any).electronApi?.confirmQuit?.();
  };

  const requestQuitApp = () => {
    const sec = settingsRef.current?.security;
    if (sec?.enabled && sec?.requireOnQuit && sec?.passwordHash) {
      setPasswordModalConfig({
        isOpen: true,
        action: 'QUIT_APP',
        onSuccess: () => {
          confirmQuit();
        },
      });
    } else {
      confirmQuit();
    }
  };

  const requestToggleMonitoring = (forceTarget?: boolean) => {
    const nextState = forceTarget !== undefined ? forceTarget : !isMonitoringRef.current;
    if (nextState) {
      setIsMonitoring(true);
      return;
    }

    const sec = settingsRef.current?.security;
    if (sec?.enabled && sec?.requireOnPause && sec?.passwordHash) {
      setPasswordModalConfig({
        isOpen: true,
        action: 'PAUSE_MONITORING',
        onSuccess: () => {
          setIsMonitoring(false);
        },
      });
    } else {
      setIsMonitoring(false);
    }
  };

  const toggleMonitoring = () => {
    requestToggleMonitoring();
  };

  const updateSecuritySettings = (newSecurity: SecuritySettings) => {
    if (!settings) return;
    const updated: UserSettings = { ...settings, security: newSecurity };
    updateSettings(updated);
  };

  const dismissReminder = (id: string) => {
    setActiveReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const snoozeReminder = (id: string, seconds: number = 300) => {
    dismissReminder(id);
    reminderEngineRef.current?.getBreakTimer().snooze(Math.round(seconds / 60));
  };

  const logWaterGlass = () => {
    reminderEngineRef.current?.getHydrationTimer().logGlass(1);
    if (activeProfile && reposRef.current.eventRepo) {
      reposRef.current.eventRepo.logHydration(activeProfile.id, 1);
    }
    setDailyStats((prev: DailyStatistics) => ({
      ...prev,
      waterGlassesDrank: prev.waterGlassesDrank + 1,
      wellnessScore: Math.min(100, prev.wellnessScore + 2),
    }));
  };

  const startBreakNow = () => {
    setIsBreakActive(true);
    reminderEngineRef.current?.getBreakTimer().startBreak();
  };

  const completeBreak = () => {
    setIsBreakActive(false);
    reminderEngineRef.current?.getBreakTimer().completeBreak();
    setDailyStats((prev: DailyStatistics) => ({
      ...prev,
      eyeBreaksCompleted: prev.eyeBreaksCompleted + 1,
      wellnessScore: Math.min(100, prev.wellnessScore + 5),
    }));
  };

  const skipBreak = () => {
    setIsBreakActive(false);
    reminderEngineRef.current?.getBreakTimer().skipBreak();
    setDailyStats((prev: DailyStatistics) => ({
      ...prev,
      eyeBreaksSkipped: prev.eyeBreaksSkipped + 1,
      wellnessScore: Math.max(10, prev.wellnessScore - 5),
    }));
  };

  const switchProfile = (profileId: string) => {
    const prof = profiles.find((p) => p.id === profileId);
    if (prof && reposRef.current.settingsRepo) {
      setActiveProfile(prof);
      const profSettings = reposRef.current.settingsRepo.getSettings(prof.id);
      setSettings(profSettings);
      if (profSettings.general?.theme) {
        setThemeState(profSettings.general.theme);
      }
      reminderEngineRef.current?.updateSettings(profSettings);
    }
  };

  const createProfile = (name: string, isChild: boolean) => {
    if (!reposRef.current.profileRepo) return;
    const newProf = reposRef.current.profileRepo.create({
      name,
      isChild,
      isDefault: false,
    });
    setProfiles((prev) => [...prev, newProf]);
    switchProfile(newProf.id);
  };

  const deleteProfile = (id: string) => {
    if (profiles.length <= 1 || !reposRef.current.profileRepo) return;
    reposRef.current.profileRepo.delete(id);
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);
    if (activeProfile?.id === id) {
      switchProfile(remaining[0].id);
    }
  };

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    if (newSettings.general?.theme && newSettings.general.theme !== theme) {
      setThemeState(newSettings.general.theme);
    }
    if (activeProfile && reposRef.current.settingsRepo) {
      reposRef.current.settingsRepo.saveSettings(activeProfile.id, newSettings);
      reminderEngineRef.current?.updateSettings(newSettings);
    }
  };

  const upgradeToPro = async () => {
    setSubscriptionTier('PRO');
    if (reposRef.current.licenseRepo) {
      reposRef.current.licenseRepo.saveCachedLicense(
        'mock_pro_token',
        'mock_signature',
        Date.now() + 30 * 86400 * 1000,
        'PRO',
        PRO_FEATURES
      );
    }
  };

  const clearLocalData = () => {
    if (reposRef.current.driver) {
      const runner = new MigrationRunner(reposRef.current.driver);
      reposRef.current.driver.exec('DELETE FROM posture_events; DELETE FROM distance_events; DELETE FROM daily_statistics;');
      runner.runMigrations();
    }
    setDailyStats({
      date: new Date().toISOString().slice(0, 10),
      profileId: activeProfile?.id ?? 'default',
      totalScreenTimeMinutes: 0,
      postureWarningsCount: 0,
      distanceWarningsCount: 0,
      eyeBreaksCompleted: 0,
      eyeBreaksSkipped: 0,
      waterGlassesDrank: 0,
      wellnessScore: 100,
    });
  };

  const selectCamera = (id: string) => {
    setSelectedCameraId(id);
    if (settings) {
      updateSettings({ ...settings, camera: { ...settings.camera, deviceId: id } });
    }
    startCamera(id);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        switchLanguage,
        theme,
        effectiveTheme,
        switchTheme,
        activeProfile,
        profiles,
        switchProfile,
        createProfile,
        deleteProfile,
        settings,
        updateSettings,
        isMonitoring,
        toggleMonitoring,
        requestToggleMonitoring,
        requestQuitApp,
        confirmQuit,
        passwordModalConfig,
        closePasswordModal,
        verifyPassword,
        updateSecuritySettings,
        liveAnalysis,
        governorStatus,
        activeReminders,
        dismissReminder,
        snoozeReminder,
        dailyStats,
        logWaterGlass,
        startBreakNow,
        completeBreak,
        skipBreak,
        isBreakActive,
        breakProgress,
        hydrationProgress,
        screenTimeMinutes: Math.round(screenTimeMinutes),
        screenTimeLimitMinutes: settings?.screenTime.dailyLimitMinutes ?? 360,
        subscriptionTier,
        upgradeToPro,
        clearLocalData,
        connectedCameras,
        selectedCameraId,
        selectCamera,
        cameraStream,
        cameraError,
        startCamera,
        stopCamera,
        useSimulatedCamera,
        setUseSimulatedCamera,
        simulationMode,
        setSimulationMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
