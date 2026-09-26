'use client';

import React from 'react';
import { Download, ShieldCheck, CheckCircle2, ArrowRight, Laptop } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { PostureVisualizer } from '@/components/posture-3d/posture-visualizer';

export function Hero({ onOpenAuth: _onOpenAuth }: { onOpenAuth?: () => void } = {}) {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300">
      {/* 1. Spotlight Glow Sweep from Top Center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 dark:from-cyan-500/20 via-indigo-600/5 dark:via-indigo-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* 2. Cyber Matrix Dot Grid Pattern */}
      <div className="absolute inset-0 bg-dot-grid opacity-30 dark:opacity-25 pointer-events-none -z-10" />

      {/* 3. Subtle Animated Neon Orbit Ambient */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: World-Class Typography & CTAs */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Tag Pill with Glowing Border */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-cyan-500/40 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-semibold backdrop-blur-xl shadow-sm dark:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-400 transition">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>{t('hero_badge')}</span>
            </div>

            {/* Bilingual Metallic Gradient Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]">
              <span className="block text-slate-900 dark:text-white">
                {t('hero_title_1')}
              </span>
              <span className="block mt-1 bg-gradient-to-r from-slate-950 via-slate-800 to-cyan-600 dark:from-white dark:via-slate-200 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                {t('hero_title_2')}
              </span>
              <span className="block mt-1 bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-600 dark:from-cyan-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
                {t('hero_title_highlight')}
              </span>
            </h1>

            {/* Crisp Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t('hero_desc')}
            </p>

            {/* CTAs with Shimmer Neon Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Shimmer Primary CTA */}
              <a
                href="/api/download"
                className="btn-tactile relative group overflow-hidden w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-base shadow-lg shadow-cyan-500/25 dark:shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:shadow-cyan-500/45 dark:hover:shadow-[0_0_55px_rgba(6,182,212,0.6)] hover:-translate-y-1 transition-all duration-300 ease-out active:scale-95 border border-cyan-400/40"
              >
                {/* Diagonal Light Shimmer Stripe */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                <Download className="w-5 h-5 text-white transition-transform duration-300 ease-out group-hover:-translate-y-1" />
                <span>{t('hero_btn_download')}</span>
              </a>

              {/* Glassmorphic Secondary CTA */}
              <a
                href="#pricing"
                className="btn-tactile group w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl border border-slate-300 dark:border-white/15 bg-white/90 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-cyan-500/40 text-slate-800 dark:text-slate-200 font-semibold text-base backdrop-blur-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 ease-out shadow-sm active:scale-95"
              >
                <span>{t('hero_btn_pricing')}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-all duration-300 ease-out group-hover:translate-x-1.5" />
              </a>
            </div>

            {/* Trust Points Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-slate-700 dark:text-slate-300">{t('hero_trust_privacy')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-slate-700 dark:text-slate-300">{t('hero_trust_free')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-purple-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                <Laptop className="w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-slate-700 dark:text-slate-300">{t('hero_trust_os')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: AI HUD Cockpit Interactive Visualizer */}
          <div className="lg:col-span-5 w-full flex items-center justify-center">
            <PostureVisualizer />
          </div>
        </div>
      </div>
    </section>
  );
}
