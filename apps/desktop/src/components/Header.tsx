import React from 'react';
import { Power, Coffee, Droplets, BatteryCharging, Battery, AlertCircle, X, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const Header: React.FC = () => {
  const {
    activeProfile,
    isMonitoring,
    toggleMonitoring,
    startBreakNow,
    logWaterGlass,
    governorStatus,
    activeReminders,
    dismissReminder,
    theme,
    effectiveTheme,
    switchTheme,
  } = useApp();

  return (
    <header className="px-8 py-5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {/* User Greeting */}
        <div>
          <h2 className="font-display font-bold text-xl text-slate-100">
            {t('dashboard.greeting', { name: activeProfile?.name ?? 'User' })}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isMonitoring ? t('dashboard.cameraActive') : t('dashboard.cameraPaused')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Power status badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
            {governorStatus.isOnBattery ? (
              <Battery className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <BatteryCharging className="w-3.5 h-3.5 text-teal-400" />
            )}
            <span className="font-medium text-[11px]">
              {governorStatus.mode} ({governorStatus.targetFps} FPS)
            </span>
          </div>

          {/* Quick Break Button */}
          <button
            onClick={startBreakNow}
            title={t('breaks.startBreak')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-xs font-medium text-slate-200 transition-all active:scale-95"
          >
            <Coffee className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('breaks.startBreak')}</span>
          </button>

          {/* Quick Water Button */}
          <button
            onClick={logWaterGlass}
            title={t('hydration.logGlass')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-xs font-medium text-slate-200 transition-all active:scale-95"
          >
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('hydration.logGlass')}</span>
          </button>

          {/* Quick Theme Toggle Button */}
          <button
            onClick={() => switchTheme(effectiveTheme === 'dark' ? 'light' : 'dark')}
            title={effectiveTheme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-xs font-medium text-slate-200 transition-all active:scale-95"
          >
            {effectiveTheme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t('header.lightMode')}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">{t('header.darkMode')}</span>
              </>
            )}
          </button>

          {/* Monitoring Active / Pause Toggle Button */}
          <button
            onClick={toggleMonitoring}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              isMonitoring
                ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 hover:bg-teal-500/25'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isMonitoring ? 'bg-teal-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>{isMonitoring ? t('header.monitoringOn') : t('header.monitoringOff')}</span>
          </button>
        </div>
      </div>

      {/* Active Non-Intrusive Reminder Alerts Bar */}
      {activeReminders.length > 0 && (
        <div className="space-y-2 mt-1">
          {activeReminders.slice(0, 2).map((reminder) => (
            <div
              key={reminder.id}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs shadow-md transition-all ${
                reminder.priority === 'URGENT'
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                  : reminder.type === 'POSTURE'
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                  : 'bg-teal-950/60 border-teal-500/50 text-teal-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-semibold mr-2">{t(reminder.titleKey)}</span>
                  <span className="opacity-80">{t(reminder.messageKey)}</span>
                </div>
              </div>
              <button
                onClick={() => dismissReminder(reminder.id)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};
