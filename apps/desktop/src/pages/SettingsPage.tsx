import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Eye,
  ScanFace,
  Volume2,
  Bell,
  Coffee,
  Droplets,
  Shield,
  Laptop,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { SecuritySettingsSection } from '../components/SecuritySettingsSection.js';
import { t } from '@eyeposture/i18n';

type SettingsTab = 'general' | 'posture' | 'distance' | 'breaks' | 'hydration' | 'notifications' | 'security';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, language, switchLanguage, theme, switchTheme } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  if (!settings) return null;

  const tabs = [
    {
      id: 'general' as SettingsTab,
      label: t('settings.general'),
      description: t('settings.generalDesc'),
      icon: SettingsIcon,
      color: 'text-teal-400',
    },
    {
      id: 'posture' as SettingsTab,
      label: t('settings.posture'),
      description: t('settings.postureDesc'),
      icon: ScanFace,
      color: 'text-amber-400',
    },
    {
      id: 'distance' as SettingsTab,
      label: t('settings.distance'),
      description: t('settings.distanceDesc'),
      icon: Eye,
      color: 'text-emerald-400',
    },
    {
      id: 'breaks' as SettingsTab,
      label: t('settings.breaks'),
      description: t('settings.breaksDesc'),
      icon: Coffee,
      color: 'text-indigo-400',
    },
    {
      id: 'hydration' as SettingsTab,
      label: t('settings.hydration'),
      description: t('settings.hydrationDesc'),
      icon: Droplets,
      color: 'text-cyan-400',
    },
    {
      id: 'notifications' as SettingsTab,
      label: t('settings.notifications'),
      description: t('settings.notificationsDesc'),
      icon: Bell,
      color: 'text-rose-400',
    },
    {
      id: 'security' as SettingsTab,
      label: t('settings.security'),
      description: t('settings.securityDesc'),
      icon: Lock,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-slate-100">{t('settings.title')}</h2>
        <p className="text-sm text-slate-400 mt-1">{t('settings.saveChanges')}</p>
      </div>

      {/* Master-Detail Layout: Left Options / Right Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Settings Options Navigation */}
        <div className="md:col-span-4 glass-card p-3 space-y-1.5 border border-slate-800/80">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {t('common.options')}
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all duration-150 flex items-start gap-3 border ${
                  isActive
                    ? 'bg-teal-500/15 border-teal-500/30 text-slate-100 shadow-md shadow-teal-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-teal-500/20' : 'bg-slate-800/60'} shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate flex items-center justify-between">
                    <span>{tab.label}</span>
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{tab.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Selected Detail Content */}
        <div className="md:col-span-8">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="glass-card p-6 space-y-6 border border-slate-800/80">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-teal-400" />
                  <span>{t('settings.general')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{t('settings.generalDetailDesc')}</p>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.language')}</span>
                  <span className="text-xs text-slate-400">{t('settings.languageDesc')}</span>
                </div>
                <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-700/60">
                  <button
                    onClick={() => switchLanguage('en')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      language === 'en'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => switchLanguage('vi')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      language === 'vi'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    Tiếng Việt
                  </button>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-t border-slate-800/80 gap-3">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.theme')}</span>
                  <span className="text-xs text-slate-400">{t('settings.themeDesc')}</span>
                </div>
                <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-700/60 self-start sm:self-auto">
                  <button
                    onClick={() => switchTheme('dark')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      theme === 'dark'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>{t('settings.themeDark')}</span>
                  </button>
                  <button
                    onClick={() => switchTheme('light')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      theme === 'light'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>{t('settings.themeLight')}</span>
                  </button>
                  <button
                    onClick={() => switchTheme('system')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      theme === 'system'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>{t('settings.themeSystem')}</span>
                  </button>
                </div>
              </div>

              {/* Startup Toggle */}
              <div className="flex items-center justify-between py-3 border-t border-slate-800/80">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.launchOnStartup')}</span>
                  <span className="text-xs text-slate-400">{t('settings.launchOnStartupDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.general.startWithWindows}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      general: { ...settings.general, startWithWindows: e.target.checked },
                    })
                  }
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Tray Minimize */}
              <div className="flex items-center justify-between py-3 border-t border-slate-800/80">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.minimizeToTray')}</span>
                  <span className="text-xs text-slate-400">{t('settings.minimizeToTrayDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.general.minimizeToTray}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      general: { ...settings.general, minimizeToTray: e.target.checked },
                    })
                  }
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* POSTURE TAB */}
          {activeTab === 'posture' && (
            <div className="glass-card p-6 space-y-6 border border-slate-800/80">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ScanFace className="w-5 h-5 text-amber-400" />
                  <span>{t('settings.posture')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{t('monitor.subtitle')}</p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.enablePosture')}</span>
                  <span className="text-xs text-slate-400">{t('settings.enablePostureDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.posture.enabled}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      posture: { ...settings.posture, enabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="py-3 border-t border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs text-slate-200">
                  <span className="font-medium text-sm">{t('settings.detectionSensitivity')} ({settings.posture.sensitivity})</span>
                  <span className="text-teal-400 font-semibold">{settings.posture.sensitivity === 1 ? 'Lenient' : settings.posture.sensitivity >= 4 ? 'Strict' : 'Balanced'}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={settings.posture.sensitivity}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      posture: { ...settings.posture, sensitivity: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-teal-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>1</span>
                  <span>3</span>
                  <span>5</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-slate-800/80">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.warningDelay')}</span>
                  <span className="text-xs text-slate-400">{t('settings.warningDelayDesc')}</span>
                </div>
                <span className="font-mono text-sm px-3 py-1 bg-slate-800 rounded-lg text-teal-300 border border-slate-700">
                  {settings.posture.warningDelaySeconds} {t('common.seconds')}
                </span>
              </div>
            </div>
          )}

          {/* DISTANCE TAB */}
          {activeTab === 'distance' && (
            <div className="glass-card p-6 space-y-6 border border-slate-800/80">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  <span>{t('settings.distance')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{t('settings.distanceDesc')}</p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.enableDistance')}</span>
                  <span className="text-xs text-slate-400">{t('settings.enableDistanceDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.distance.enabled}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      distance: { ...settings.distance, enabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-slate-800/80">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.safeDistanceThreshold')}</span>
                  <span className="text-xs text-slate-400">{t('settings.safeDistanceDesc')}</span>
                </div>
                <span className="font-mono text-sm px-3 py-1 bg-slate-800 rounded-lg text-emerald-400 border border-slate-700">
                  ~{settings.distance.thresholdCm} cm
                </span>
              </div>
            </div>
          )}

          {/* BREAKS TAB */}
          {activeTab === 'breaks' && (
            <div className="glass-card p-6 space-y-6 border border-slate-800/80">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-indigo-400" />
                  <span>{t('breaks.title')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{t('breaks.subtitle')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">{t('breaks.workInterval')}</span>
                  <span className="text-xl font-bold text-slate-100 mt-1 block">20 {t('common.minutes')}</span>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">{t('breaks.breakDuration')}</span>
                  <span className="text-xl font-bold text-indigo-300 mt-1 block">20 {t('common.seconds')}</span>
                </div>
              </div>
            </div>
          )}

          {/* HYDRATION TAB */}
          {activeTab === 'hydration' && (
            <div className="glass-card p-6 space-y-6 border border-slate-800/80">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                  <span>{t('hydration.title')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{t('hydration.subtitle')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">{t('hydration.dailyTarget')}</span>
                  <span className="text-xl font-bold text-cyan-300 mt-1 block">8 {t('hydration.glassesUnit')} (2000 ml)</span>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">{t('common.status')}</span>
                  <span className="text-xl font-bold text-slate-100 mt-1 block">45 {t('common.minutes')}</span>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6 space-y-6 border border-slate-800/80">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-rose-400" />
                  <span>{t('settings.notifications')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{t('settings.notificationsDesc')}</p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.audioChimes')}</span>
                  <span className="text-xs text-slate-400">{t('settings.audioChimesDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.soundEnabled}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      notifications: { ...settings.notifications, soundEnabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-slate-800/80">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.suppressFullscreen')}</span>
                  <span className="text-xs text-slate-400">{t('settings.suppressFullscreenDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.suppressInFullscreen}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        suppressInFullscreen: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-slate-800/80">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.quietHours')}</span>
                  <span className="text-xs text-slate-400">{t('settings.quietHoursDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.quietHoursEnabled}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        quietHoursEnabled: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Security & Lock Tab */}
          {activeTab === 'security' && <SecuritySettingsSection />}
        </div>
      </div>
    </div>
  );
};
