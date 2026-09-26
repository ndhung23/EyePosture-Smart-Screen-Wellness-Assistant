'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Volume2, VolumeX, CheckCircle2, AlertTriangle, Sparkles, Activity, Target, Eye, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/language-context';

// Dynamic import with SSR disabled for React Three Fiber Canvas
const PostureCanvas = dynamic(
  () => import('./posture-canvas'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl border border-white/10 text-slate-400 gap-3">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
        <span className="text-xs font-mono text-cyan-400/90 tracking-wider">INITIALIZING 3D COCKPIT...</span>
      </div>
    ),
  }
);

interface PostureVisualizerProps {
  initialState?: 'GOOD' | 'BAD';
}

export function PostureVisualizer({ initialState = 'GOOD' }: PostureVisualizerProps) {
  const { t } = useLanguage();
  const [postureState, setPostureState] = useState<'GOOD' | 'BAD'>(initialState);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const isGood = postureState === 'GOOD';

  return (
    <div className="relative mx-auto w-full max-w-xl group">
      {/* Outer Glow Halo with Animated Pulse */}
      <div
        className={`absolute -inset-1 rounded-[32px] blur-xl opacity-30 dark:opacity-40 transition-all duration-700 pointer-events-none ${
          isGood
            ? 'bg-gradient-to-r from-cyan-500/40 via-emerald-500/30 to-indigo-500/30'
            : 'bg-gradient-to-r from-rose-600/50 via-red-500/40 to-amber-500/30 animate-pulse'
        }`}
      />

      {/* Main Glassmorphic Cockpit HUD Container */}
      <div
        className={`relative rounded-[28px] backdrop-blur-2xl transition-all duration-500 p-5 sm:p-6 border shadow-xl dark:shadow-2xl ${
          isGood
            ? 'bg-white/95 dark:bg-slate-950/85 border-slate-200 dark:border-cyan-500/30 dark:shadow-[0_0_50px_rgba(6,182,212,0.15)] shadow-slate-200/50'
            : 'bg-white/95 dark:bg-slate-950/90 border-rose-300 dark:border-rose-500/50 dark:shadow-[0_0_50px_rgba(244,63,94,0.25)] shadow-rose-200/50'
        }`}
      >
        {/* Cockpit HUD Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isGood ? 'bg-cyan-400' : 'bg-rose-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isGood ? 'bg-cyan-500 shadow-sm shadow-cyan-400' : 'bg-rose-500 shadow-sm shadow-rose-400'
                }`}
              />
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-800 dark:text-slate-200">
                {t('hud_title')}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase tracking-wider border ${
                  isGood
                    ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/40 animate-pulse'
                }`}
              >
                {isGood ? t('hud_status_opt') : t('hud_status_warn')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-400">
              <Activity className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>FPS 60 • NPU ACTIVE</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white transition"
              title={t('hud_sound_tooltip')}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* 3D Hologram Stage with HUD Viewport Elements */}
        <div className="relative h-[380px] rounded-2xl overflow-hidden bg-[#020617] border border-slate-800 dark:border-white/10 flex flex-col items-center justify-center shadow-inner group/canvas text-white">
          {/* Cyber HUD Grid & Radar Lines */}
          <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

          {/* Warning Scanline overlay when bad posture */}
          <AnimatePresence>
            {!isGood && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none bg-gradient-to-b from-rose-500/10 via-transparent to-rose-500/15 z-10"
              >
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-rose-500/60 to-transparent animate-shimmer" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sci-Fi HUD Corner Crosshair Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none z-20" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none z-20" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none z-20" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none z-20" />

          {/* Top HUD Telemetry Coordinates */}
          <div className="absolute top-3 left-10 pointer-events-none z-20 flex items-center gap-2 text-[9px] font-mono text-slate-400">
            <Target className="w-2.5 h-2.5 text-cyan-400" />
            <span>CERVICAL SCAN: {isGood ? 'ALIGNED [0.00, +1.00]' : 'OFFSET [-0.42, +0.65]'}</span>
          </div>

          {/* HUD Floating Callout Badge 1: C4-C7 Spine Angle (Top Right) */}
          <div className="absolute top-3 right-3 sm:right-5 pointer-events-none z-20">
            <div className={`p-2 sm:p-2.5 rounded-xl backdrop-blur-xl border shadow-xl transition-all duration-300 ${
              isGood
                ? 'bg-slate-950/85 border-cyan-500/40 shadow-cyan-500/10'
                : 'bg-rose-950/90 border-rose-500/60 shadow-rose-500/20'
            }`}>
              <div className="flex items-center justify-between gap-3 text-[9px] font-mono uppercase text-slate-400 border-b border-white/10 pb-1 mb-1">
                <span className="flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 text-cyan-400" />
                  C4-C7 SPINE
                </span>
                <span className={isGood ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold animate-pulse'}>
                  {isGood ? 'NORMAL' : 'OVERLOAD'}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[10px] text-slate-300 font-medium">{t('hud_c4_label')}</span>
                <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                  isGood ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isGood ? '12°' : '38°'}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[8.5px] font-semibold">
                {isGood ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">{t('hud_c4_normal')}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="text-rose-300 font-bold">{t('hud_c4_bad')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* HUD Floating Callout Badge 2: Raycast AI Distance (Bottom Left) */}
          <div className="absolute bottom-3 left-3 sm:left-5 pointer-events-none z-20">
            <div className={`p-2 sm:p-2.5 rounded-xl backdrop-blur-xl border shadow-xl transition-all duration-300 ${
              isGood
                ? 'bg-slate-950/85 border-cyan-500/40 shadow-cyan-500/10'
                : 'bg-rose-950/90 border-rose-500/60 shadow-rose-500/20'
            }`}>
              <div className="flex items-center justify-between gap-3 text-[9px] font-mono uppercase text-slate-400 border-b border-white/10 pb-1 mb-1">
                <span className="flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5 text-cyan-400" />
                  RAYCAST AI
                </span>
                <span className={isGood ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isGood ? 'SAFE' : 'TOO CLOSE'}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[10px] text-slate-300 font-medium">{t('hud_dist_label')}</span>
                <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                  isGood ? 'text-cyan-400' : 'text-rose-400'
                }`}>
                  {isGood ? '58 cm' : '32 cm'}
                </span>
              </div>
              <div className="text-[8.5px] text-slate-400 mt-0.5 font-mono">
                {isGood ? t('hud_ray_safe') : t('hud_ray_warn')}
              </div>
            </div>
          </div>

          {/* Three.js 3D WebGL Canvas */}
          <PostureCanvas postureState={postureState} />
        </div>

        {/* Realtime Biomechanical HUD Telemetry Cards */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          {/* Gauge 1: Distance */}
          <div
            className={`p-3 rounded-2xl border backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg cursor-default ${
              isGood
                ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-cyan-500/10'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/40 hover:border-rose-500/60 hover:shadow-rose-500/15'
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">
              {t('hud_dist_label')}
            </span>
            <span
              className={`text-lg sm:text-xl font-mono font-black tracking-tight ${
                isGood ? 'text-cyan-600 dark:text-cyan-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isGood ? '58 cm' : '32 cm'}
            </span>
            <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
              {isGood ? t('hud_dist_opt') : t('hud_dist_warn')}
            </div>
          </div>

          {/* Gauge 2: Neck Angle */}
          <div
            className={`p-3 rounded-2xl border backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg cursor-default ${
              isGood
                ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/10'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/40 hover:border-rose-500/60 hover:shadow-rose-500/15'
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">
              {t('hud_angle_label')}
            </span>
            <span
              className={`text-lg sm:text-xl font-mono font-black tracking-tight ${
                isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400 animate-pulse'
              }`}
            >
              {isGood ? '12°' : '38°'}
            </span>
            <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
              {isGood ? t('hud_angle_opt') : t('hud_angle_warn')}
            </div>
          </div>

          {/* Gauge 3: Blink Rate */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-indigo-500/40 hover:shadow-indigo-500/10 cursor-default">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">
              {t('hud_blink_label')}
            </span>
            <span className="text-lg sm:text-xl font-mono font-black tracking-tight text-indigo-600 dark:text-indigo-400">
              18/m
            </span>
            <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
              {t('hud_blink_sub')}
            </div>
          </div>
        </div>

        {/* Real Interactive Controller Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
            <span>{t('hud_test_label')}</span>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            {/* Button 1: Tư thế chuẩn */}
            <button
              onClick={() => setPostureState('GOOD')}
              className={`btn-tactile flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-300 ease-out ${
                isGood
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/25 scale-[1.02] border border-cyan-400/40'
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('hud_btn_good')}</span>
            </button>

            {/* Button 2: Thử gập cổ cúi sát */}
            <button
              onClick={() => setPostureState('BAD')}
              className={`btn-tactile flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-300 ease-out ${
                !isGood
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-500/30 scale-[1.02] border border-rose-400/40'
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-rose-500/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('hud_btn_bad')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
