import React, { useState } from 'react';
import { Clock, AlertTriangle, ShieldCheck, Check, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const ScreenTimePage: React.FC = () => {
  const { screenTimeMinutes, screenTimeLimitMinutes, settings, updateSettings } = useApp();

  const [newExclusion, setNewExclusion] = useState<string>('');

  const hoursUsed = Math.floor(screenTimeMinutes / 60);
  const minsUsed = screenTimeMinutes % 60;
  const limitHours = Math.floor(screenTimeLimitMinutes / 60);
  const percent = Math.min(100, Math.round((screenTimeMinutes / Math.max(1, screenTimeLimitMinutes)) * 100));

  const mockAppUsage = [
    { process: 'Code.exe', name: 'Visual Studio Code', category: 'Development', minutes: 85, color: 'bg-teal-500' },
    { process: 'chrome.exe', name: 'Google Chrome', category: 'Browsing', minutes: 35, color: 'bg-indigo-500' },
    { process: 'Slack.exe', name: 'Slack', category: 'Communication', minutes: 14, color: 'bg-amber-500' },
  ];

  const handleLimitChange = (newHours: number) => {
    if (!settings) return;
    updateSettings({
      ...settings,
      screenTime: {
        ...settings.screenTime,
        dailyLimitMinutes: Math.max(60, newHours * 60),
      },
    });
  };

  const handleAddExclusion = () => {
    if (!newExclusion || !settings) return;
    const current = settings.screenTime.excludedApplications || [];
    if (!current.includes(newExclusion)) {
      updateSettings({
        ...settings,
        screenTime: {
          ...settings.screenTime,
          excludedApplications: [...current, newExclusion],
        },
      });
    }
    setNewExclusion('');
  };

  const handleRemoveExclusion = (app: string) => {
    if (!settings) return;
    const current = settings.screenTime.excludedApplications || [];
    updateSettings({
      ...settings,
      screenTime: {
        ...settings.screenTime,
        excludedApplications: current.filter((a: string) => a !== app),
      },
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-100">{t('screenTime.title')}</h2>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your cumulative daily display exposure and manage healthy boundaries.
        </p>
      </div>

      {/* Main Screen Time Limit Progress Card */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-md">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
            {t('screenTime.usedToday')}
          </span>
          <div className="font-display text-4xl font-extrabold text-slate-100">
            {hoursUsed}h {minsUsed}m
            <span className="text-base text-slate-400 font-normal font-sans ml-2">/ {limitHours}h daily limit</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {percent >= 100
              ? t('screenTime.limitReached')
              : percent >= 80
              ? t('screenTime.approachingWarning', { percent })
              : 'You are well within your daily screen time allocation.'}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs text-slate-400">Adjust Daily Limit:</span>
            <div className="flex items-center gap-1">
              {[4, 6, 8, 10].map((h) => (
                <button
                  key={h}
                  onClick={() => handleLimitChange(h)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    limitHours === h
                      ? 'bg-indigo-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Circular Ring Gauge */}
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
              className={`transition-all duration-500 ${
                percent >= 100 ? 'text-rose-400' : percent >= 80 ? 'text-amber-400' : 'text-indigo-400'
              }`}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - percent / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <Clock className="w-7 h-7 text-indigo-400 mb-1" />
            <span className="font-display text-2xl font-bold text-slate-100">{percent}%</span>
          </div>
        </div>
      </div>

      {/* Application Usage & Exclusions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Apps Breakdown */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">
            {t('screenTime.appBreakdown')}
          </h3>

          <div className="space-y-3">
            {mockAppUsage.map((app) => (
              <div key={app.process} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200 font-medium">{app.name}</span>
                  <span className="text-slate-400 font-mono">{app.minutes} min</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${app.color}`}
                    style={{ width: `${Math.round((app.minutes / screenTimeMinutes) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400 mt-4">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Only foreground window process titles are aggregated. No keystrokes or URLs are collected.</span>
          </div>
        </div>

        {/* Excluded Applications */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Excluded Applications (Ignored from Limits)
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. spotify.exe"
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleAddExclusion}
              className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {(settings?.screenTime.excludedApplications || ['spotify.exe', 'zoom.exe']).map((app: string) => (
              <div
                key={app}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/40 text-xs text-slate-300"
              >
                <span>{app}</span>
                <button
                  onClick={() => handleRemoveExclusion(app)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
