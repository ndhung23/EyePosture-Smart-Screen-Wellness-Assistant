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
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

type SettingsTab = 'general' | 'posture' | 'distance' | 'breaks' | 'hydration' | 'notifications';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, language, switchLanguage } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  if (!settings) return null;

  const tabs = [
    {
      id: 'general' as SettingsTab,
      label: t('settings.general'),
      description: 'Language, startup & system behavior',
      icon: SettingsIcon,
      color: 'text-teal-400',
    },
    {
      id: 'posture' as SettingsTab,
      label: t('settings.posture'),
      description: 'Ergonomic posture thresholds & sensitivity',
      icon: ScanFace,
      color: 'text-amber-400',
    },
    {
      id: 'distance' as SettingsTab,
      label: t('settings.distance'),
      description: 'Screen viewing distance calibration',
      icon: Eye,
      color: 'text-emerald-400',
    },
    {
      id: 'breaks' as SettingsTab,
      label: '20-20-20 Eye Breaks',
      description: 'Rest intervals and break duration',
      icon: Coffee,
      color: 'text-indigo-400',
    },
    {
      id: 'hydration' as SettingsTab,
      label: 'Hydration Tracking',
      description: 'Water intake reminder frequency',
      icon: Droplets,
      color: 'text-cyan-400',
    },
    {
      id: 'notifications' as SettingsTab,
      label: t('settings.notifications'),
      description: 'Quiet hours, chimes & fullscreen mode',
      icon: Bell,
      color: 'text-rose-400',
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
            Options & Categories
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
                <p className="text-xs text-slate-400 mt-1">Configure language, startup, and system tray integration</p>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.language')}</span>
                  <span className="text-xs text-slate-400">Select interface display language</span>
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

              {/* Startup Toggle */}
              <div className="flex items-center justify-between py-3 border-t border-slate-800/80">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t('settings.launchOnStartup')}</span>
                  <span className="text-xs text-slate-400">Launch EyePosture automatically when Windows starts</span>
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
                  <span className="text-xs text-slate-400">Keep monitoring silently in system tray when closed</span>
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
                <p className="text-xs text-slate-400 mt-1">Real-time spine angle, head tilt, and slouching detection</p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">Enable Posture Monitoring</span>
                  <span className="text-xs text-slate-400">Track head tilt and forward slouching via camera landmarks</span>
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
                  <span className="font-medium text-sm">Detection Sensitivity (Level {settings.posture.sensitivity})</span>
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
                  <span>1 (Forgiving)</span>
                  <span>3 (Recommended)</span>
                  <span>5 (Ergonomic Pro)</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-slate-800/80">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">Warning Delay (Debounce)</span>
                  <span className="text-xs text-slate-400">Avoid false alerts when temporarily reaching for coffee</span>
                </div>
                <span className="font-mono text-sm px-3 py-1 bg-slate-800 rounded-lg text-teal-300 border border-slate-700">
                  {settings.posture.warningDelaySeconds} seconds
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
                <p className="text-xs text-slate-400 mt-1">Eye-to-screen distance monitoring to prevent myopia and eye strain</p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">Enable Distance Monitoring</span>
                  <span className="text-xs text-slate-400">Calculate eye distance using iris proportions and face geometry</span>
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
                  <span className="text-sm font-medium text-slate-200 block">Ergonomic Safe Threshold</span>
                  <span className="text-xs text-slate-400">Distance under which a gentle warning prompts you to lean back</span>
                </div>
                <span className="font-mono text-sm px-3 py-1 bg-slate-800 rounded-lg text-emerald-400 border border-slate-700">
                  ~{settings.distance.thresholdCm} cm (50-70 cm recommended)
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
                  <span>20-20-20 Eye Break Schedule</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Every 20 minutes, look 20 feet away for 20 seconds</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">Work Interval</span>
                  <span className="text-xl font-bold text-slate-100 mt-1 block">20 Minutes</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Optimal focus cycle</span>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">Break Duration</span>
                  <span className="text-xl font-bold text-indigo-300 mt-1 block">20 Seconds</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Ciliary muscle relaxation</span>
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
                  <span>Hydration Tracking</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Periodic gentle reminder to stay hydrated throughout working sessions</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">Daily Target</span>
                  <span className="text-xl font-bold text-cyan-300 mt-1 block">8 Glasses (2000 ml)</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Recommended daily water intake</span>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">Interval</span>
                  <span className="text-xl font-bold text-slate-100 mt-1 block">Every 45 Minutes</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Intelligent backoff policy</span>
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
                <p className="text-xs text-slate-400 mt-1">Audio alerts, fullscreen auto-suppression, and quiet hours</p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">Audio Chimes</span>
                  <span className="text-xs text-slate-400">Play subtle pleasant sound chime when a reminder pops up</span>
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
                  <span className="text-sm font-medium text-slate-200 block">Suppress in Fullscreen</span>
                  <span className="text-xs text-slate-400">Never interrupt gaming sessions, movie watching, or presentations</span>
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
                  <span className="text-sm font-medium text-slate-200 block">Quiet Hours (22:00 - 07:00)</span>
                  <span className="text-xs text-slate-400">Mute all reminder notifications during nighttime</span>
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
        </div>
      </div>
    </div>
  );
};
