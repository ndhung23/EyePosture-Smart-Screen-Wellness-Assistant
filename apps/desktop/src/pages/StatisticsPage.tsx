import React from 'react';
import { BarChart3, TrendingUp, CheckCircle2, AlertTriangle, Eye, Droplets, Info } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const StatisticsPage: React.FC = () => {
  const { dailyStats } = useApp();

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
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-100">{t('nav.statistics')}</h2>
        <p className="text-sm text-slate-400 mt-1">
          {t('statistics.subtitle')}
        </p>
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

        {/* CSS/SVG Bar Chart */}
        <div className="h-48 flex items-end justify-between gap-4 pt-4 px-2">
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
  );
};
