import React from 'react';
import { Eye, Coffee, CheckCircle, Clock, Play, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const BreaksPage: React.FC = () => {
  const {
    startBreakNow,
    breakProgress,
    dailyStats,
    settings,
    updateSettings,
  } = useApp();

  const breakMinsLeft = Math.floor(breakProgress.remainingSeconds / 60);
  const breakSecsLeft = breakProgress.remainingSeconds % 60;

  const interval = settings?.breaks.intervalMinutes ?? 20;
  const duration = settings?.breaks.durationSeconds ?? 20;

  const handleIntervalChange = (val: number) => {
    if (!settings) return;
    updateSettings({
      ...settings,
      breaks: { ...settings.breaks, intervalMinutes: Math.max(5, val) },
    });
  };

  const handleDurationChange = (val: number) => {
    if (!settings) return;
    updateSettings({
      ...settings,
      breaks: { ...settings.breaks, durationSeconds: Math.max(10, val) },
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-100">{t('breaks.title')}</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">{t('breaks.subtitle')}</p>
      </div>

      {/* Main Countdown & Control Card */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-md">
          <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
            {t('breaks.nextIn')}
          </span>
          <div className="font-display text-5xl font-extrabold text-slate-100 font-mono tracking-tight">
            {String(breakMinsLeft).padStart(2, '0')}:{String(breakSecsLeft).padStart(2, '0')}
          </div>
          <p className="text-xs text-slate-400">
            Relax your ciliary eye muscles by gazing at a distant focal point across the room or out a window.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={startBreakNow}
              className="px-5 py-2.5 rounded-xl gradient-teal text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/25 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('breaks.startBreak')}</span>
            </button>
          </div>
        </div>

        {/* Circular Progress Meter */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              className="text-slate-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              className="text-teal-400 transition-all duration-500"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - breakProgress.percentComplete / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <Eye className="w-8 h-8 text-teal-400 mb-1" />
            <span className="font-display text-lg font-bold text-slate-100">
              {breakProgress.percentComplete}%
            </span>
          </div>
        </div>
      </div>

      {/* Compliance Stats and Customization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Compliance Card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Today's Break Compliance</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400">Breaks Completed</span>
              <p className="font-display text-3xl font-bold text-emerald-400 mt-1">
                {dailyStats.eyeBreaksCompleted}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400">Breaks Skipped</span>
              <p className="font-display text-3xl font-bold text-slate-400 mt-1">
                {dailyStats.eyeBreaksSkipped}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Custom Interval Settings</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 block">Work Interval</span>
                <span className="text-[11px] text-slate-500">Minutes between breaks</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleIntervalChange(interval - 5)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                >
                  -
                </button>
                <span className="font-mono text-sm text-slate-200 w-12 text-center">{interval} min</span>
                <button
                  onClick={() => handleIntervalChange(interval + 5)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 block">Break Duration</span>
                <span className="text-[11px] text-slate-500">Seconds to rest eyes</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDurationChange(duration - 5)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                >
                  -
                </button>
                <span className="font-mono text-sm text-slate-200 w-12 text-center">{duration} sec</span>
                <button
                  onClick={() => handleDurationChange(duration + 5)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
