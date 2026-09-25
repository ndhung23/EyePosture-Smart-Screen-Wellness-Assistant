import React from 'react';
import { BarChart3, TrendingUp, CheckCircle2, AlertTriangle, Eye, Droplets, Info, Crown, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const StatisticsPage: React.FC = () => {
  const { dailyStats, subscriptionTier, currentUser, openAuthModal } = useApp();
  const isProOrFamily = subscriptionTier === 'PRO' || subscriptionTier === 'FAMILY';

  const mockWeekly = [
    { day: 'Mon', score: 85, posture: 3, distance: 1, breaks: 4 },
    { day: 'Tue', score: 92, posture: 1, distance: 0, breaks: 5 },
    { day: 'Wed', score: 78, posture: 5, distance: 2, breaks: 3 },
    { day: 'Thu', score: 88, posture: 2, distance: 1, breaks: 4 },
    { day: 'Fri', score: 94, posture: 1, distance: 0, breaks: 6 },
    { day: 'Sat', score: 96, posture: 0, distance: 0, breaks: 2 },
    { day: 'Sun', score: dailyStats.wellnessScore, posture: dailyStats.postureWarningsCount, distance: dailyStats.distanceWarningsCount, breaks: dailyStats.eyeBreaksCompleted },
  ];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">{t('nav.statistics')}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {t('statistics.subtitle')}
          </p>
        </div>
        {isProOrFamily && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
            <Crown className="w-3.5 h-3.5" />
            <span>{subscriptionTier === 'FAMILY' ? 'FAMILY ELITE ACTIVE' : 'PRO VIP ACTIVE'}</span>
          </span>
        )}
      </div>

      {/* Wellness Metric Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center gap-3">
        <Info className="w-5 h-5 text-teal-400 shrink-0" />
        <p className="text-xs text-slate-300 leading-relaxed">
          {t('statistics.disclaimer')}
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-5 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-semibold">{t('statistics.weeklyAverage')}</span>
          <p className="font-display text-3xl font-extrabold text-teal-400">89%</p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {t('statistics.fromLastWeek')}
          </span>
        </div>

        <div className="glass-card p-5 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-semibold">{t('statistics.breaksCompletedCount')}</span>
          <p className="font-display text-3xl font-extrabold text-indigo-400">28</p>
          <span className="text-[11px] text-slate-400">{t('statistics.complianceRate')}</span>
        </div>

        <div className="glass-card p-5 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-semibold">{t('statistics.postureInterventions')}</span>
          <p className="font-display text-3xl font-extrabold text-amber-400">12</p>
          <span className="text-[11px] text-emerald-400">{t('statistics.fewerSlouch')}</span>
        </div>

        <div className="glass-card p-5 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-semibold">{t('statistics.totalHydration')}</span>
          <p className="font-display text-3xl font-extrabold text-cyan-400">38</p>
          <span className="text-[11px] text-slate-400">{t('statistics.glassesThisWeek')}</span>
        </div>
      </div>

      {/* Weekly Screen Wellness Trend Chart */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">{t('statistics.weeklyTrendTitle')}</h3>
            <p className="text-xs text-slate-400">{t('statistics.weeklyTrendSubtitle')}</p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30">
            {t('statistics.last7Days')}
          </span>
        </div>

        {/* CSS/SVG Bar Chart with VIP overlay for Free/Guest */}
        <div className="relative">
          {!isProOrFamily && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10 border border-amber-500/30 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-2 shadow-inner">
                <Crown className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                Báo cáo Thống kê & Xu hướng 7 ngày (PRO & FAMILY)
              </h4>
              <p className="text-xs text-slate-300 mt-1.5 max-w-sm leading-relaxed">
                Tài khoản Free chỉ xem được chỉ số ngày hiện tại. Nâng cấp lên PRO để mở khóa toàn bộ lịch sử 7 ngày, biểu đồ tuần và xuất báo cáo y khoa.
              </p>
              <button
                onClick={() => {
                  if (!currentUser) openAuthModal('login');
                  else window.dispatchEvent(new CustomEvent('eyeposture:navigate', { detail: 'subscription' }));
                }}
                className="mt-3 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                <span>{!currentUser ? 'Đăng nhập tài khoản' : 'Nâng cấp lên PRO'}</span>
              </button>
            </div>
          )}

          <div className={`h-48 flex items-end justify-between gap-4 pt-4 px-2 ${!isProOrFamily ? 'filter blur-[3px] opacity-20' : ''}`}>
            {mockWeekly.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-mono text-slate-400">{item.score}%</span>
                <div className="w-full max-w-[48px] bg-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-end h-36 p-1">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      item.score >= 90 ? 'gradient-teal' : item.score >= 80 ? 'gradient-emerald' : 'gradient-amber'
                    }`}
                    style={{ height: `${item.score}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-300">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
