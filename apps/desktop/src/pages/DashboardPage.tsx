import React, { useState } from 'react';
import {
  Activity,
  Eye,
  ScanFace,
  Clock,
  Coffee,
  Droplets,
  Target,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';
import { CalibrationModal } from '../components/CalibrationModal.js';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    settings,
    dailyStats,
    liveAnalysis,
    isMonitoring,
    toggleMonitoring,
    startBreakNow,
    logWaterGlass,
    breakProgress,
    hydrationProgress,
    screenTimeMinutes,
    screenTimeLimitMinutes,
  } = useApp();

  const [isCalibOpen, setIsCalibOpen] = useState<boolean>(false);

  const screenHours = Math.floor(screenTimeMinutes / 60);
  const screenMins = screenTimeMinutes % 60;
  const limitHours = Math.floor(screenTimeLimitMinutes / 60);

  const breakMinsLeft = Math.floor(breakProgress.remainingSeconds / 60);
  const breakSecsLeft = breakProgress.remainingSeconds % 60;

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Status Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Screen Wellness Score Card */}
        <div className="glass-card p-6 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
              {t('dashboard.wellnessScore')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-extrabold text-slate-100">
                {dailyStats.wellnessScore}%
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('common.optimal')}
              </span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              {t('dashboard.habitScoreDesc')}
            </p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Activity className="w-10 h-10" />
          </div>
        </div>

        {/* Eye-to-Screen Distance Card */}
        <div
          onClick={() => onNavigate('monitor')}
          className="glass-card glass-card-interactive p-6 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              {t('dashboard.distanceStatus')}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-display text-2xl font-bold ${
                  liveAnalysis.distanceState === 'TOO_CLOSE' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {liveAnalysis.distanceState === 'TOO_CLOSE' ? t('dashboard.tooClose') : t('dashboard.statusGood')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {liveAnalysis.faceDetected ? `~${liveAnalysis.distanceEstimateCm} cm` : '-- cm'}
              </span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              {liveAnalysis.distanceState === 'TOO_CLOSE'
                ? t('dashboard.leanBackHint')
                : t('dashboard.ergonomicDistance')}
            </p>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
              liveAnalysis.distanceState === 'TOO_CLOSE'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <Eye className="w-7 h-7" />
          </div>
        </div>

        {/* Sitting Posture Status Card */}
        <div
          onClick={() => onNavigate('monitor')}
          className="glass-card glass-card-interactive p-6 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              {t('dashboard.postureStatus')}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-display text-2xl font-bold ${
                  liveAnalysis.postureState === 'POOR'
                    ? 'text-amber-400'
                    : liveAnalysis.postureState === 'ACCEPTABLE'
                    ? 'text-cyan-400'
                    : 'text-emerald-400'
                }`}
              >
                {liveAnalysis.postureState === 'POOR'
                  ? t('dashboard.statusPoor')
                  : liveAnalysis.postureState === 'ACCEPTABLE'
                  ? t('dashboard.statusAcceptable')
                  : t('dashboard.statusGood')}
              </span>
              <span className="text-xs text-slate-400 font-mono">{liveAnalysis.postureScore}/100</span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              {liveAnalysis.slouchDetected ? t('dashboard.slouchWarning') : t('dashboard.alignedGood')}
            </p>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
              liveAnalysis.postureState === 'POOR'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
            }`}
          >
            <ScanFace className="w-7 h-7" />
          </div>
        </div>

        {/* Eye Blink & Strain Card (ErgoBlink Integration) */}
        <div
          onClick={() => onNavigate('monitor')}
          className="glass-card glass-card-interactive p-6 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              {t('blink.blinkRate')}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-display text-2xl font-bold ${
                  (liveAnalysis.blinkMetrics?.eyeStrainScore ?? 0) >= 70
                    ? 'text-rose-400'
                    : (liveAnalysis.blinkMetrics?.eyeStrainScore ?? 0) >= 35
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {liveAnalysis.blinkMetrics?.blinksPerMinute ?? 16} BPM
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {Math.max(0, 100 - (liveAnalysis.blinkMetrics?.eyeStrainScore ?? 15))}%
              </span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              {!settings?.blink?.enabled
                ? t('blink.disabledStatus')
                : liveAnalysis.blinkMetrics?.prolongedStareDetected
                ? t('blink.staringAlert')
                : t('blink.normalEyeStrain')}
            </p>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
              (liveAnalysis.blinkMetrics?.eyeStrainScore ?? 0) >= 70
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
            }`}
          >
            <Eye className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Habits & Reminders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Screen Time Tracker */}
        <div
          onClick={() => onNavigate('screenTime')}
          className="glass-card glass-card-interactive p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold">{t('dashboard.screenTime')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-slate-100">
              {screenHours}h {screenMins}m
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {t('dashboard.limitHours', { hours: limitHours })}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full gradient-indigo rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((screenTimeMinutes / Math.max(1, screenTimeLimitMinutes)) * 100)
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{t('dashboard.usedToday')}</span>
              <span>
                {Math.round((screenTimeMinutes / Math.max(1, screenTimeLimitMinutes)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* 20-20-20 Eye Break */}
        <div
          onClick={() => onNavigate('breaks')}
          className="glass-card glass-card-interactive p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Coffee className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold">{t('dashboard.nextEyeBreak')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-slate-100 font-mono">
              {String(breakMinsLeft).padStart(2, '0')}:{String(breakSecsLeft).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {t('dashboard.breaksCompletedToday', { count: dailyStats.eyeBreaksCompleted })}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full gradient-teal rounded-full transition-all duration-500"
                style={{ width: `${breakProgress.percentComplete}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{t('dashboard.nextRestInterval')}</span>
              <span>{breakProgress.percentComplete}%</span>
            </div>
          </div>
        </div>

        {/* Hydration Tracker */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold">{t('dashboard.waterReminder')}</span>
            </div>
            <button
              onClick={logWaterGlass}
              className="text-xs font-semibold px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
            >
              {t('dashboard.addGlass')}
            </button>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-slate-100">
              {hydrationProgress.glassesToday} / {hydrationProgress.dailyGoalGlasses}
            </span>
            <span className="text-xs text-slate-400">{t('dashboard.glassesUnit')}</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${hydrationProgress.percentComplete}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{t('dashboard.dailyTarget')}</span>
              <span>{hydrationProgress.percentComplete}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">{t('dashboard.quickActionsTitle')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={toggleMonitoring}
            className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 flex flex-col items-center gap-2 transition-all active:scale-95"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isMonitoring ? 'bg-teal-500/20 text-teal-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">
              {isMonitoring ? t('dashboard.quickActions.pause') : t('dashboard.quickActions.resume')}
            </span>
          </button>

          <button
            onClick={startBreakNow}
            className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 flex flex-col items-center gap-2 transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">
              {t('dashboard.quickActions.takeBreak')}
            </span>
          </button>

          <button
            onClick={logWaterGlass}
            className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 flex flex-col items-center gap-2 transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">
              {t('dashboard.quickActions.drinkWater')}
            </span>
          </button>

          <button
            onClick={() => setIsCalibOpen(true)}
            className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 flex flex-col items-center gap-2 transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">
              {t('dashboard.quickActions.calibrate')}
            </span>
          </button>
        </div>
      </div>

      <CalibrationModal isOpen={isCalibOpen} onClose={() => setIsCalibOpen(false)} />
    </div>
  );
};
