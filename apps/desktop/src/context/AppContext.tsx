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
  CalibrationData,
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
import { VisionEngine, SyntheticVisionHarness, KeyFacialLandmarks } from '@eyeposture/vision';
import { ReminderEngine } from '@eyeposture/reminder-engine';
import { LicenseVerifier, PRO_FEATURES } from '@eyeposture/billing';
import { t, setLanguage, getLanguage, LanguageCode } from '@eyeposture/i18n';
import { FaceLandmarkerService } from '../services/FaceLandmarkerService.js';
import { AuthService } from '../services/AuthService.js';

import { AppContextValue, SimulationMode } from './AppContextTypes.js';

export type { SimulationMode, AppContextValue };

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<LanguageCode>(() => (typeof localStorage !== 'undefined' && (localStorage.getItem('eyeposture_language') as LanguageCode)) || 'vi');
  const [theme, setThemeState] = useState<AppTheme>(() => (typeof localStorage !== 'undefined' && (localStorage.getItem('eyeposture_theme') as AppTheme)) || 'light');
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('light');
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(() => {
    return typeof localStorage !== 'undefined' && !!localStorage.getItem('eyeposture_auth_token');
  });
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('FREE');
  const [isBreakActive, setIsBreakActive] = useState<boolean>(false);
  const [activeReminders, setActiveReminders] = useState<ReminderEvent[]>([]);
  const [passwordModalConfig, setPasswordModalConfig] = useState<{
    isOpen: boolean;
    action: 'PAUSE_MONITORING' | 'QUIT_APP' | 'ACCESS_SETTINGS';
    onSuccess?: () => void;
  } | null>(null);
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    role?: string;
    createdAt?: string;
    subscription?: {
      tier: SubscriptionTier;
      status: string;
      expiresAt: number | null;
    };
  } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

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
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('UPRIGHT');
  const [connectedCameras, setConnectedCameras] = useState<CameraDeviceInfo[]>([
    { deviceId: 'default', label: 'Default Integrated Camera', isDefault: true },
  ]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('default');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationSamplesCount, setCalibrationSamplesCount] = useState<number>(0);
  const [activeCalibration, setActiveCalibration] = useState<CalibrationData | null>(null);
  const isCalibratingRef = useRef<boolean>(false);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);

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
      const savedTheme = typeof localStorage !== 'undefined' ? (localStorage.getItem('eyeposture_theme') as AppTheme) : null;
      const initialTheme = savedTheme || userSettings.general.theme || 'light';
      setThemeState(initialTheme);

      // Check cached license
      const cached = licenseRepo.getCachedLicense();
      if (cached && cached.tier) {
        setSubscriptionTier(cached.tier);
      }

      // Load saved calibration baseline if available
      const latestCalib = calibRepo.getLatestCalibration(currentProf.id, 'default');
      if (latestCalib) {
        visionEngineRef.current.setCalibration(latestCalib);
        setActiveCalibration(latestCalib);
      }

      // Initialize Reminder Engine
      const engine = new ReminderEngine(userSettings);
      reminderEngineRef.current = engine;

      engine.subscribe((event: ReminderEvent) => {
        if (event.type === 'EYE_BREAK' && event.state === 'ACTIVE_WARNING') {
          setIsBreakActive(true);
        }
        setActiveReminders((prev) => [event, ...prev.filter((e) => e.type !== event.type)]);

        // Always-on-top centered desktop overlay alert
        if (event.state === 'ACTIVE_WARNING') {
          const title = t(event.titleKey as any) || event.titleKey;
          const message = t(event.messageKey as any) || event.messageKey;
          (window as any).electronApi?.showOverlayAlert?.({
            type: event.type,
            title,
            message,
            durationMs: 4500,
          });
        } else if (event.state === 'RESOLVED') {
          (window as any).electronApi?.dismissOverlayAlert?.();
        }
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
    try {
      localStorage.setItem('eyeposture_theme', newTheme);
    } catch {}
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
    FaceLandmarkerService.getInstance().initialize().catch((err) => {
      console.warn('[AppContext] FaceLandmarker init failed:', err);
    });

    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
    v.style.position = 'fixed';
    v.style.top = '-9999px';
    v.style.left = '-9999px';
    v.style.width = '640px';
    v.style.height = '480px';
    v.style.opacity = '0';
    v.style.pointerEvents = 'none';
    document.body.appendChild(v);
    hiddenVideoRef.current = v;

    enumerateCameras();
    if (typeof localStorage !== 'undefined' && localStorage.getItem('eyeposture_auth_token')) {
      startCamera();
    }

    return () => {
      stopCamera();
      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.srcObject = null;
        hiddenVideoRef.current.remove();
        hiddenVideoRef.current = null;
      }
      FaceLandmarkerService.getInstance().close();
    };
  }, []);

  useEffect(() => {
    if (hiddenVideoRef.current && cameraStream) {
      hiddenVideoRef.current.srcObject = cameraStream;
      hiddenVideoRef.current.play().catch(() => {});
    } else if (hiddenVideoRef.current && !cameraStream) {
      hiddenVideoRef.current.srcObject = null;
    }
  }, [cameraStream]);

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
      let sampleLandmarks: KeyFacialLandmarks | null = null;
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
          case 'PROLONGED_STARE':
            sampleLandmarks = SyntheticVisionHarness.createProlongedStareLandmarks();
            break;
          case 'BLINKING':
            sampleLandmarks = Math.random() > 0.4
              ? SyntheticVisionHarness.createUprightLandmarks()
              : SyntheticVisionHarness.createBlinkingLandmarks();
            break;
          case 'UPRIGHT':
          default:
            sampleLandmarks = SyntheticVisionHarness.createUprightLandmarks();
            break;
        }
      } else {
        const v = hiddenVideoRef.current;
        if (v && v.readyState >= 2 && !v.paused) {
          sampleLandmarks = FaceLandmarkerService.getInstance().detect(v, performance.now());
        }
      }

      if (isCalibratingRef.current && sampleLandmarks) {
        visionEngineRef.current.addCalibrationSample(sampleLandmarks);
        setCalibrationSamplesCount((prev) => prev + 1);
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
      if (!currentUser) {
        openAuthModal('login');
        return;
      }
      setIsMonitoring(true);
      if (!cameraStream) startCamera();
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

  const requestAccessSettings = (onSuccess: () => void) => {
    const sec = settingsRef.current?.security;
    if (sec?.enabled && sec?.passwordHash && !isSettingsUnlocked) {
      setPasswordModalConfig({
        isOpen: true,
        action: 'ACCESS_SETTINGS',
        onSuccess: () => {
          setIsSettingsUnlocked(true);
          onSuccess();
        },
      });
    } else {
      onSuccess();
    }
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
    triggerOverlayAlert(
      'BREAK',
      t('breaks.breakTitle') || 'Đã đến giờ nghỉ ngơi!',
      t('breaks.breakMessage') || 'Quy tắc 20-20-20: Hãy nhìn xa 20 feet trong 20 giây để thư giãn mắt.'
    );
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
    if (newSettings.blink && !newSettings.blink.enabled) {
      setActiveReminders((prev) => prev.filter((r) => r.type !== 'BLINK_REMINDER'));
    }
    if (activeProfile && reposRef.current.settingsRepo) {
      reposRef.current.settingsRepo.saveSettings(activeProfile.id, newSettings);
      reminderEngineRef.current?.updateSettings(newSettings);
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const updateUserProfile = async (data: { name?: string; currentPassword?: string; newPassword?: string }) => {
    if (!authToken) return { success: false, error: 'Chưa đăng nhập' };
    const res = await AuthService.updateProfile(authToken, data);
    if (!res.success) return { success: false, error: res.error };
    if (res.user) {
      setCurrentUser(res.user);
      localStorage.setItem('eyeposture_auth_user', JSON.stringify(res.user));
    }
    return { success: true, message: res.message || 'Cập nhật thành công!' };
  };

  const syncEntitlements = async (overrideToken?: string) => {
    const token = overrideToken || authToken;
    if (!token) return;
    const body = await AuthService.fetchEntitlements(token);
    if (body?.payload?.tier) {
      setSubscriptionTier(body.payload.tier);
      if (reposRef.current.licenseRepo) {
        reposRef.current.licenseRepo.saveCachedLicense(
          body.entitlementToken,
          'cloud_signature',
          body.payload.expiresAt,
          body.payload.tier,
          body.payload.features || PRO_FEATURES
        );
      }
    }
  };

  const login = async (email: string, password: string) => {
    const res = await AuthService.login(email, password);
    if (!res.success) return { success: false, error: res.error };
    const { token, user } = res.data;
    setAuthToken(token);
    setCurrentUser(user);
    if (user?.subscription?.tier) {
      setSubscriptionTier(user.subscription.tier);
    }
    localStorage.setItem('eyeposture_auth_token', token);
    localStorage.setItem('eyeposture_auth_user', JSON.stringify(user));
    await syncEntitlements(token);
    setIsMonitoring(true);
    startCamera();
    return { success: true };
  };

  const registerUser = async (email: string, password: string, name: string) => {
    const res = await AuthService.register(email, password, name);
    if (!res.success) return { success: false, error: res.error };
    const { token, user } = res.data;
    setAuthToken(token);
    setCurrentUser(user);
    if (user?.subscription?.tier) {
      setSubscriptionTier(user.subscription.tier);
    }
    localStorage.setItem('eyeposture_auth_token', token);
    localStorage.setItem('eyeposture_auth_user', JSON.stringify(user));
    await syncEntitlements(token);
    setIsMonitoring(true);
    startCamera();
    return { success: true };
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setSubscriptionTier('FREE');
    setIsMonitoring(false);
    stopCamera();
    localStorage.removeItem('eyeposture_auth_token');
    localStorage.removeItem('eyeposture_auth_user');
  };

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('eyeposture_auth_token');
      const savedUser = localStorage.getItem('eyeposture_auth_user');
      if (savedToken && savedUser) {
        setAuthToken(savedToken);
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed?.subscription?.tier) {
          setSubscriptionTier(parsed.subscription.tier);
        }
        syncEntitlements(savedToken);
      }
    } catch {}
  }, []);

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

  const startPostureCalibration = async (): Promise<CalibrationData | null> => {
    return new Promise((resolve) => {
      setIsCalibrating(true);
      isCalibratingRef.current = true;
      setCalibrationSamplesCount(0);

      setTimeout(() => {
        isCalibratingRef.current = false;
        setIsCalibrating(false);

        const currentCamId = selectedCameraId || 'default';
        const baseline = visionEngineRef.current.finalizeCalibration(currentCamId);

        if (baseline && activeProfile && reposRef.current.calibRepo) {
          reposRef.current.calibRepo.saveCalibration(activeProfile.id, baseline);
          setActiveCalibration(baseline);
          console.log('[AppContext] Calibrated baseline saved:', baseline);
        } else {
          console.warn('[AppContext] Calibration completed with partial or fallback samples');
        }

        resolve(baseline);
      }, 2500);
    });
  };

  const triggerOverlayAlert = (type: string = 'DISTANCE', title?: string, message?: string) => {
    let defTitle = 'Cảnh báo khoảng cách màn hình';
    let defMsg = 'Bạn đang ngồi quá gần màn hình (<45cm). Vui lòng lùi lại!';
    if (type.includes('POSTURE')) {
      defTitle = 'Cảnh báo tư thế ngồi';
      defMsg = 'Phát hiện gù lưng hoặc cúi đầu quá thấp. Hãy ngồi thẳng lưng!';
    } else if (type.includes('BLINK')) {
      defTitle = 'Nhắc nhở chớp mắt';
      defMsg = 'Hãy chớp mắt vài lần để duy trì độ ẩm giác mạc!';
    } else if (type.includes('BREAK')) {
      defTitle = 'Đã đến giờ nghỉ mắt!';
      defMsg = 'Quy tắc 20-20-20: Hãy nhìn xa 20 feet trong 20 giây.';
    }
    (window as any).electronApi?.showOverlayAlert?.({
      type,
      title: title || defTitle,
      message: message || defMsg,
      durationMs: 4500,
    });
  };

  const selectCamera = (id: string) => {
    setSelectedCameraId(id);
    if (settings) {
      updateSettings({ ...settings, camera: { ...settings.camera, deviceId: id } });
    }
    startCamera(id);
    if (activeProfile && reposRef.current.calibRepo) {
      const latestCalib = reposRef.current.calibRepo.getLatestCalibration(activeProfile.id, id);
      if (latestCalib) {
        visionEngineRef.current.setCalibration(latestCalib);
        setActiveCalibration(latestCalib);
      } else {
        setActiveCalibration(null);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        switchLanguage,
        theme,
        effectiveTheme,
        switchTheme,
        currentUser,
        authToken,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        updateUserProfile,
        login,
        registerUser,
        logout,
        syncEntitlements,
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
        requestAccessSettings,
        isSettingsUnlocked,
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
        isCalibrating,
        calibrationSamplesCount,
        activeCalibration,
        startPostureCalibration,
        triggerOverlayAlert,
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
