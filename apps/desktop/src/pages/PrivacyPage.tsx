import React, { useState } from 'react';
import { ShieldCheck, HardDrive, EyeOff, Lock, Trash2, Download, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const PrivacyPage: React.FC = () => {
  const { clearLocalData } = useApp();
  const [clearedMessage, setClearedMessage] = useState<boolean>(false);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to permanently clear all local monitoring history?')) {
      clearLocalData();
      setClearedMessage(true);
      setTimeout(() => setClearedMessage(false), 3000);
    }
  };

  const handleExport = () => {
    const diagnosticData = {
      app: 'EyePosture',
      version: '1.0.0',
      os: 'Windows 11',
      privacyStatus: 'Camera frames strictly local',
      telemetry: 'disabled',
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(diagnosticData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eyeposture-diagnostic-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-100">{t('privacy.title')}</h2>
        <p className="text-sm text-slate-400 mt-1">
          Our core architecture is built around local-first processing, ensuring zero biometric surveillance.
        </p>
      </div>

      {/* Primary Privacy Pillars */}
      <div className="space-y-4">
        {/* Local Processing Guarantee */}
        <div className="glass-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <EyeOff className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-slate-100">
              {t('privacy.localProcessingTitle')}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('privacy.localProcessingDesc')}
            </p>
          </div>
        </div>

        {/* Data Retention */}
        <div className="glass-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-slate-100">
              {t('privacy.dataRetentionTitle')}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('privacy.dataRetentionDesc')}
            </p>
          </div>
        </div>

        {/* What is Never Collected */}
        <div className="glass-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-slate-100">
              What Is Strictly Never Collected
            </h3>
            <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4 pt-1">
              <li>No video recordings or webcam photos</li>
              <li>No keystrokes, clipboard, or input logging</li>
              <li>No website URLs or browsing contents</li>
              <li>No microphone or audio recordings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Management Actions */}
      <div className="glass-card p-6 space-y-4 border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200">Local Data Controls</h3>
        <p className="text-xs text-slate-400">
          You have complete sovereignty over your local database records.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('privacy.clearData')}</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{t('privacy.exportData')}</span>
          </button>
        </div>

        {clearedMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>All local posture, distance, and daily statistics records have been purged.</span>
          </div>
        )}
      </div>
    </div>
  );
};
