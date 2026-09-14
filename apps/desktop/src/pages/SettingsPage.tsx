import React from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Eye,
  ScanFace,
  Volume2,
  Clock,
  Shield,
  Bell,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, language, switchLanguage } = useApp();

  if (!settings) return null;

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-100">{t('settings.title')}</h2>
        <p className="text-sm text-slate-400 mt-1">{t('settings.saveChanges')}</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-teal-400" />
            <span>{t('settings.general')}</span>
          </h3>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">{t('settings.language')}</span>
                <span className="text-[11px] text-slate-400">Interface display language</span>
              </div>
              <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => switchLanguage('en')}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    language === 'en' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => switchLanguage('vi')}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    language === 'vi' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300'
                  }`}
                >
                  Tiếng Việt
                </button>
              </div>
            </div>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-200">{t('settings.launchOnStartup')}</span>
              <input
                type="checkbox"
                checked={settings.general.startWithWindows}
                onChange={(e) =>
                  updateSettings({
                    ...settings,
                    general: { ...settings.general, startWithWindows: e.target.checked },
                  })
                }
                className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-200">{t('settings.minimizeToTray')}</span>
              <input
                type="checkbox"
                checked={settings.general.minimizeToTray}
                onChange={(e) =>
                  updateSettings({
                    ...settings,
                    general: { ...settings.general, minimizeToTray: e.target.checked },
                  })
                }
                className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Posture Settings */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ScanFace className="w-4 h-4 text-amber-400" />
            <span>{t('settings.posture')}</span>
          </h3>

          <div className="space-y-4 pt-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-200">Enable Posture Monitoring</span>
              <input
                type="checkbox"
                checked={settings.posture.enabled}
                onChange={(e) =>
                  updateSettings({
                    ...settings,
                    posture: { ...settings.posture, enabled: e.target.checked },
                  })
                }
                className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
              />
            </label>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Detection Sensitivity (Level {settings.posture.sensitivity})</span>
                <span className="text-slate-400">1 (Lenient) to 5 (Strict)</span>
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
                className="w-full accent-teal-500 bg-slate-800"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <span className="text-xs text-slate-200 block">Warning Delay (Debounce)</span>
                <span className="text-[11px] text-slate-400">Seconds before reminding</span>
              </div>
              <span className="font-mono text-xs text-slate-200">
                {settings.posture.warningDelaySeconds} sec
              </span>
            </div>
          </div>
        </div>

        {/* Distance Settings */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>{t('settings.distance')}</span>
          </h3>

          <div className="space-y-4 pt-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-200">Enable Distance Monitoring</span>
              <input
                type="checkbox"
                checked={settings.distance.enabled}
                onChange={(e) =>
                  updateSettings({
                    ...settings,
                    distance: { ...settings.distance, enabled: e.target.checked },
                  })
                }
                className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
              />
            </label>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-200 block">Comfort Threshold</span>
                <span className="text-[11px] text-slate-400">Distance under which warning triggers</span>
              </div>
              <span className="font-mono text-xs text-slate-200">~{settings.distance.thresholdCm} cm</span>
            </div>
          </div>
        </div>

        {/* Notification & Quiet Hours */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>{t('settings.notifications')}</span>
          </h3>

          <div className="space-y-4 pt-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-200">Audio Chimes</span>
              <input
                type="checkbox"
                checked={settings.notifications.soundEnabled}
                onChange={(e) =>
                  updateSettings({
                    ...settings,
                    notifications: { ...settings.notifications, soundEnabled: e.target.checked },
                  })
                }
                className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-200">Suppress in Fullscreen (Movies / Games)</span>
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
                className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-800">
              <div>
                <span className="text-xs text-slate-200 block">Quiet Hours (22:00 - 07:00)</span>
                <span className="text-[11px] text-slate-400">Mute reminders during sleeping hours</span>
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
                className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
