'use client';

import React, { useState } from 'react';
import { Download, Sparkles, ShieldCheck, CheckCircle2, Eye, Volume2, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function Hero({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { t } = useLanguage();
  const [postureState, setPostureState] = useState<'GOOD' | 'BAD'>('GOOD');

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/15 to-purple-500/10 blur-[130px] -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/20 text-cyan-400 dark:text-cyan-400 light:text-indigo-600 text-xs font-semibold backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('hero_badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900 leading-[1.15]">
              {t('hero_title_1')}{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {t('hero_title_highlight')}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 dark:text-slate-300 light:text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t('hero_desc')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="https://github.com/ndhung23/EyePosture-Smart-Screen-Wellness-Assistant/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-500/25 hover:shadow-cyan-500/35 transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                <Download className="w-5 h-5" />
                <span>{t('hero_btn_download')}</span>
              </a>

              <a
                href="#pricing"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 bg-slate-900/60 dark:bg-slate-900/60 light:bg-white text-slate-200 dark:text-slate-200 light:text-slate-700 font-semibold text-base hover:bg-slate-800/80 light:hover:bg-slate-100 transition shadow-sm"
              >
                <span>{t('hero_btn_pricing')}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Trust points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 light:text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('hero_trust_privacy')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>{t('hero_trust_free')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>{t('hero_trust_os')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Posture Visualizer Mockup */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-3xl p-1 bg-gradient-to-b from-cyan-500/30 via-indigo-500/20 to-purple-500/30 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
              <div className="rounded-[22px] bg-slate-950/90 dark:bg-slate-950/90 light:bg-slate-900 text-white p-6 space-y-5 border border-slate-800">
                {/* Visualizer Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-mono text-slate-300 font-medium tracking-wide">
                      {t('hero_sim_active')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t('hero_sim_audio')}</span>
                  </div>
                </div>

                {/* Simulated Camera Window */}
                <div className="relative h-52 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-4 text-center group">
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                  {/* Ergonomics Tracking Bounding Box */}
                  <div
                    className={`relative z-10 w-32 h-32 rounded-2xl border-2 transition-all duration-500 flex flex-col items-center justify-center ${
                      postureState === 'GOOD'
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                        : 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/20'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-2">
                      <Eye
                        className={`w-6 h-6 transition-colors ${
                          postureState === 'GOOD' ? 'text-emerald-400' : 'text-rose-400 animate-pulse'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full ${
                        postureState === 'GOOD'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {postureState === 'GOOD' ? t('hero_sim_good') : t('hero_sim_bad')}
                    </span>
                  </div>

                  {/* Corner Target Marks */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                </div>

                {/* Realtime Metrics Gauges */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">{t('hero_sim_dist')}</span>
                    <span className="font-bold text-cyan-400 text-sm">
                      {postureState === 'GOOD' ? '56 cm' : '32 cm'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">{t('hero_sim_angle')}</span>
                    <span
                      className={`font-bold text-sm ${
                        postureState === 'GOOD' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {postureState === 'GOOD' ? '12°' : '38°'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">{t('hero_sim_blink')}</span>
                    <span className="font-bold text-purple-400 text-sm">17/m</span>
                  </div>
                </div>

                {/* Interactive Simulator Trigger */}
                <div className="pt-1 flex items-center justify-between text-xs bg-slate-900/40 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400">{t('hero_sim_test')}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPostureState('GOOD')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        postureState === 'GOOD'
                          ? 'bg-emerald-500 text-white shadow'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t('hero_sim_btn_good')}
                    </button>
                    <button
                      onClick={() => setPostureState('BAD')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        postureState === 'BAD'
                          ? 'bg-rose-500 text-white shadow'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t('hero_sim_btn_bad')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

