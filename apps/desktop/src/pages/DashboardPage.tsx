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
  Crown,
  Sparkles,
  Lock,
  User,
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
    currentUser,
    openAuthModal,
    subscriptionTier,
    language,
    effectiveTheme,
  } = useApp();

  const isVi = language === 'vi';
  const isLight = effectiveTheme === 'light';
  const tier = (currentUser?.subscription?.tier || subscriptionTier || 'FREE').toUpperCase();

  const getExpiryBadgeText = () => {
    const expiresAt = currentUser?.subscription?.expiresAt;
    if (!expiresAt || expiresAt > Date.now() + 5 * 365 * 86400 * 1000) {
      return isVi ? 'Vĩnh viễn' : 'Lifetime';
    }
    const daysLeft = Math.max(0, Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24)));
    return isVi ? `Còn ${daysLeft} ngày` : `${daysLeft}d left`;
  };

  const [isCalibOpen, setIsCalibOpen] = useState<boolean>(false);

  const screenHours = Math.floor(screenTimeMinutes / 60);
  const screenMins = screenTimeMinutes % 60;
  const limitHours = Math.floor(screenTimeLimitMinutes / 60);

  const breakMinsLeft = Math.floor(breakProgress.remainingSeconds / 60);
  const breakSecsLeft = breakProgress.remainingSeconds % 60;

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto pb-16">
      {/* Account Tier Banner */}
      {!currentUser ? (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg transition-all ${
            isLight
              ? 'bg-gradient-to-r from-teal-50 via-cyan-50/70 to-slate-50 border-teal-200'
              : 'bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border-teal-500/30'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-500 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  {isVi ? 'Chế độ Khách (Chưa đăng nhập)' : 'Guest Mode (Not Signed In)'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                    isLight
                      ? 'bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isVi ? 'GIỚI HẠN TÍNH NĂNG' : 'LIMITED ACCESS'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isVi
                  ? 'Hãy đăng nhập để đồng bộ lịch sử thói quen tư thế và kích hoạt đầy đủ quyền lợi gói bản quyền trên máy tính này.'
                  : 'Please sign in to sync your posture habits history and activate your full license privileges on this computer.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 active:scale-95 transition-all whitespace-nowrap ml-3"
          >
            {isVi ? 'Đăng nhập ngay' : 'Sign In Now'}
          </button>
        </div>
      ) : tier === 'FAMILY' ? (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl transition-all ${
            isLight
              ? 'bg-gradient-to-r from-purple-100/90 via-fuchsia-50/70 to-pink-50 border-purple-200 shadow-purple-500/5'
              : 'bg-gradient-to-r from-purple-950/60 via-slate-900 to-purple-950/40 border-purple-500/40 shadow-purple-500/10'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-sm ${isLight ? 'text-purple-950 font-black' : 'text-purple-200'}`}>
                  {isVi ? 'GÓI FAMILY ELITE CAO CẤP' : 'FAMILY ELITE PLAN'}
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    isLight
                      ? 'bg-purple-200/80 text-purple-900 border-purple-300'
                      : 'bg-purple-500/30 text-purple-200 border-purple-400/40'
                  }`}
                >
                  VIP ACTIVE • {getExpiryBadgeText()}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-purple-900/80 font-medium' : 'text-slate-300'}`}>
                {isVi
                  ? 'Toàn bộ tính năng AI 3D, đo khoảng cách thời gian thực, cảnh báo mỏi mắt và kết nối 5 thiết bị đã sẵn sàng hoạt động.'
                  : 'Full 3D AI telemetry, real-time distance alerts, eye fatigue monitoring and 5 device connections are active.'}
              </p>
            </div>
          </div>
        </div>
      ) : tier === 'PRO' ? (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl transition-all ${
            isLight
              ? 'bg-gradient-to-r from-amber-100/90 via-yellow-50/70 to-orange-50 border-amber-200 shadow-amber-500/5'
              : 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-amber-500/40 shadow-amber-500/10'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30 shrink-0">
              <Crown className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-sm ${isLight ? 'text-amber-950 font-black' : 'text-amber-200'}`}>
                  {isVi ? 'GÓI PRO VIP CHUYÊN NGHIỆP' : 'PRO VIP PLAN'}
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    isLight
                      ? 'bg-amber-200/80 text-amber-900 border-amber-300'
                      : 'bg-amber-500/30 text-amber-200 border-amber-400/40'
                  }`}
                >
                  VIP ACTIVE • {getExpiryBadgeText()}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-amber-900/80 font-medium' : 'text-slate-300'}`}>
                {isVi
                  ? 'Đã mở khóa toàn bộ Phân tích tư thế 3D AI, Cảnh báo khoảng cách thông minh và Báo cáo chuyên sâu.'
                  : 'Full 3D AI posture telemetry, intelligent distance alerts, and in-depth wellness analytics are unlocked.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-md transition-all ${
            isLight
              ? 'bg-slate-100 border-slate-200'
              : 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-slate-700/80'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight ? 'bg-slate-200 border-slate-300 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                  {isVi ? 'Gói Miễn Phí (Free Edition)' : 'Free Edition'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    isLight ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isVi ? 'TÍNH NĂNG CƠ BẢN' : 'BASIC FEATURES'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isVi
                  ? 'Nâng cấp lên gói PRO hoặc FAMILY để mở khóa AI đo khoảng cách 3D, nhận diện mỏi mắt và báo cáo nâng cao.'
                  : 'Upgrade to PRO or FAMILY to unlock 3D distance AI, eye strain detection, and advanced ergonomics.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('subscription')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap ml-3"
          >
            <Crown className="w-4 h-4" />
            <span>{isVi ? 'Nâng cấp PRO' : 'Upgrade to PRO'}</span>
          </button>
        </div>
      )}

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
          onClick={() => {
            if (!currentUser) openAuthModal('login');
            else onNavigate('monitor');
          }}
          className="glass-card glass-card-interactive p-6 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              {t('dashboard.distanceStatus')}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-display text-2xl font-bold ${
                  !currentUser
                    ? 'text-slate-400'
                    : liveAnalysis.distanceState === 'TOO_CLOSE'
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {!currentUser
                  ? isVi
                    ? 'Chưa kích hoạt'
                    : 'Inactive'
                  : liveAnalysis.distanceState === 'TOO_CLOSE'
                  ? t('dashboard.tooClose')
                  : t('dashboard.statusGood')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentUser && liveAnalysis.faceDetected ? `~${liveAnalysis.distanceEstimateCm} cm` : '-- cm'}
              </span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              {!currentUser
                ? isVi
                  ? 'Đăng nhập để khởi động camera đo khoảng cách'
                  : 'Sign in to activate camera distance tracking'
                : liveAnalysis.distanceState === 'TOO_CLOSE'
                ? t('dashboard.leanBackHint')
                : t('dashboard.ergonomicDistance')}
            </p>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
              !currentUser
                ? 'bg-slate-800/40 border-slate-700/60 text-slate-500'
                : liveAnalysis.distanceState === 'TOO_CLOSE'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <Eye className="w-7 h-7" />
          </div>
        </div>

        {/* Sitting Posture Status Card */}
        <div
          onClick={() => {
            if (!currentUser) openAuthModal('login');
            else onNavigate('monitor');
          }}
          className="glass-card glass-card-interactive p-6 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              {t('dashboard.postureStatus')}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-display text-2xl font-bold ${
                  !currentUser
                    ? 'text-slate-400'
                    : liveAnalysis.postureState === 'POOR'
                    ? 'text-amber-400'
                    : liveAnalysis.postureState === 'ACCEPTABLE'
                    ? 'text-cyan-400'
                    : 'text-emerald-400'
                }`}
              >
                {!currentUser
                  ? isVi
                    ? 'Chưa kích hoạt'
                    : 'Inactive'
                  : liveAnalysis.postureState === 'POOR'
                  ? t('dashboard.statusPoor')
                  : liveAnalysis.postureState === 'ACCEPTABLE'
                  ? t('dashboard.statusAcceptable')
                  : t('dashboard.statusGood')}
              </span>
              <span className="text-xs text-slate-400 font-mono">{currentUser ? `${liveAnalysis.postureScore}/100` : '--/100'}</span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              {!currentUser
                ? isVi
                  ? 'Đăng nhập để nhận diện tư thế thời gian thực'
                  : 'Sign in for real-time posture analysis'
                : liveAnalysis.slouchDetected
                ? t('dashboard.slouchWarning')
                : t('dashboard.alignedGood')}
            </p>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
              !currentUser
                ? 'bg-slate-800/40 border-slate-700/60 text-slate-500'
                : liveAnalysis.postureState === 'POOR'
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
            onClick={() => {
              if (!currentUser) openAuthModal('login');
              else toggleMonitoring();
            }}
            className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 flex flex-col items-center gap-2 transition-all active:scale-95"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isMonitoring && currentUser ? 'bg-teal-500/20 text-teal-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">
              {!currentUser
                ? isVi
                  ? 'Đăng nhập để bật'
                  : 'Sign in to enable'
                : isMonitoring
                ? t('dashboard.quickActions.pause')
                : t('dashboard.quickActions.resume')}
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
