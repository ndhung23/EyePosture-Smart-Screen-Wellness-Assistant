'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Eye,
  Clock,
  Cpu,
  Lock,
  ChevronRight,
  Activity,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function Features() {
  const { t, language } = useLanguage();

  // Interactive state for Card 1 (Spine Angle Simulator)
  const [sliderAngle, setSliderAngle] = useState(15);

  // Ergonomic weight calculation based on Dr. Kenneth Hansraj's spine load study
  const getCervicalLoad = (deg: number) => {
    if (deg <= 15) {
      return {
        weight: '5 - 12 kg',
        status: t('bento_card1_status_opt'),
        color: 'text-emerald-600 dark:text-emerald-400',
        advice: t('bento_card1_rec_good'),
        isSafe: true,
      };
    }
    if (deg <= 30) {
      return {
        weight: '18 kg',
        status: t('bento_card1_status_warn'),
        color: 'text-amber-600 dark:text-amber-400',
        advice: t('bento_card1_rec_bad'),
        isSafe: false,
      };
    }
    if (deg <= 45) {
      return {
        weight: '22 kg',
        status: t('bento_card1_status_warn'),
        color: 'text-orange-600 dark:text-orange-400',
        advice: t('bento_card1_rec_bad'),
        isSafe: false,
      };
    }
    return {
      weight: '27 kg (+450%)',
      status: t('bento_card1_status_crit'),
      color: 'text-rose-600 dark:text-rose-400',
      advice: t('bento_card1_rec_bad'),
      isSafe: false,
    };
  };

  const loadInfo = getCervicalLoad(sliderAngle);

  // SVG Spine Curve points calculated dynamically from slider angle
  const curveOffset = (sliderAngle / 60) * 45;

  return (
    <section id="features" className="py-24 md:py-32 relative bg-[#f8fafc] dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden">
      {/* Background Matrix & Subtle Gradient Radiance */}
      <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>{t('bento_tag')}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            <span>{t('bento_title_1')} </span>
            <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-indigo-600 dark:from-cyan-400 dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent">
              {t('bento_title_2')}
            </span>
          </h2>

          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('bento_subtitle')}
          </p>
        </div>

        {/* Asymmetric Bento Grid (4 Blocks) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ============================================================ */}
          {/* BENTO CARD 1: Cột Sống Thời Gian Thực (LỚN - Chiếm 8 Cột)     */}
          {/* ============================================================ */}
          <div className="lg:col-span-8 rounded-3xl p-7 sm:p-8 bg-white/90 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-xl dark:shadow-2xl flex flex-col justify-between group hover-card-glow hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/40 transition-all duration-300 ease-out relative overflow-hidden">
            {/* Ambient Corner Flare */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-out" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-md">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-600 dark:text-cyan-400 font-bold block">
                      {t('bento_card1_tag')}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {t('bento_card1_title')}
                    </h3>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
                  loadInfo.isSafe
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300 animate-pulse'
                }`}>
                  {loadInfo.status}
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                {t('bento_card1_desc')}
              </p>
            </div>

            {/* Interactive Cervical Angle Visualizer Tool */}
            <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#020617]/90 border border-slate-200 dark:border-white/10 relative">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Dynamic SVG Spine Curve Simulator */}
                <div className="md:col-span-5 flex flex-col items-center justify-center bg-white dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-white/5 relative shadow-sm">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('bento_card1_spine_sim')}
                  </span>

                  <svg width="140" height="150" viewBox="0 0 140 150" className="overflow-visible">
                    {/* Reference Vertical Plumb Line */}
                    <line x1="70" y1="20" x2="70" y2="135" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />

                    {/* Dynamic Curved Cervical Spine Line */}
                    <path
                      d={`M 70 130 Q ${70 - curveOffset * 0.7} 75 ${70 - curveOffset} 25`}
                      fill="none"
                      stroke={loadInfo.isSafe ? '#06b6d4' : '#f43f5e'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />

                    {/* 7 Cervical Vertebrae Markers (C1 to C7) */}
                    {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
                      const tVal = idx / 6;
                      const px = (1 - tVal) * (1 - tVal) * (70 - curveOffset) + 2 * (1 - tVal) * tVal * (70 - curveOffset * 0.7) + tVal * tVal * 70;
                      const py = 25 + tVal * 105;
                      return (
                        <circle
                          key={idx}
                          cx={px}
                          cy={py}
                          r={idx === 0 ? 5.5 : 4}
                          fill={idx === 0 ? (loadInfo.isSafe ? '#38bdf8' : '#fb7185') : '#475569'}
                          stroke={loadInfo.isSafe ? '#06b6d4' : '#f43f5e'}
                          strokeWidth="2"
                          className="transition-all duration-300"
                        />
                      );
                    })}

                    {/* Stylized Head Oval at top */}
                    <ellipse
                      cx={70 - curveOffset - 8}
                      cy="15"
                      rx="16"
                      ry="12"
                      fill="none"
                      stroke={loadInfo.isSafe ? '#38bdf8' : '#f43f5e'}
                      strokeWidth="2"
                      transform={`rotate(${-(sliderAngle * 0.6)}, ${70 - curveOffset - 8}, 15)`}
                      className="transition-all duration-300"
                    />
                  </svg>

                  <div className="mt-2 text-center">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {t('bento_card1_tilt')} <span className={loadInfo.color}>{sliderAngle}°</span>
                    </span>
                  </div>
                </div>

                {/* Interactive Slider & Medical Load Metrics */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-slate-600 dark:text-slate-400">{t('bento_card1_slider_label')}</span>
                      <span className={`font-bold ${loadInfo.color}`}>{sliderAngle}°</span>
                    </div>

                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={sliderAngle}
                      onChange={(e) => setSliderAngle(Number(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-800 appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                      <span>0° ({language === 'vi' ? 'Chuẩn' : 'Normal'})</span>
                      <span>30° ({language === 'vi' ? 'Mỏi cơ' : 'Fatigue'})</span>
                      <span>60° ({language === 'vi' ? 'Quá tải' : 'Severe'})</span>
                    </div>
                  </div>

                  {/* Load comparison readout */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('bento_card1_load')}</span>
                      <span className={`text-xl font-mono font-black ${loadInfo.color}`}>
                        {loadInfo.weight}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('bento_card1_rec')}</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {loadInfo.advice}
                      </span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex gap-2">
                    {[12, 30, 45].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setSliderAngle(preset)}
                        className={`btn-tactile px-3 py-1 rounded-lg text-[11px] font-mono transition-all duration-200 active:scale-95 ${
                          sliderAngle === preset
                            ? 'bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/30'
                            : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 hover:border-cyan-500/40 hover:-translate-y-0.5'
                        }`}
                      >
                        {preset === 12 ? t('bento_card1_preset_good') : `${preset}°`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* BENTO CARD 2: Tần Số Chớp Mắt (VỪA - Chiếm 4 Cột)             */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 rounded-3xl p-7 sm:p-8 bg-white/90 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-xl dark:shadow-2xl flex flex-col justify-between group hover-card-glow hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/40 transition-all duration-300 ease-out relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[70px] pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-out" />

            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-600 dark:text-indigo-400 font-bold block">
                    {t('bento_card2_tag')}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('bento_card2_title')}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('bento_card2_desc')}
              </p>
            </div>

            {/* Live Waveform Pulse Visualizer */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#020617]/90 border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{t('bento_card2_realtime')}</span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {t('bento_card2_status')}
                </span>
              </div>

              {/* Animated Waveform SVG */}
              <div className="relative h-20 w-full overflow-hidden flex items-center">
                <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="40" x2="300" y2="40" className="stroke-slate-300 dark:stroke-slate-800" strokeDasharray="4 4" />
                  <path
                    d="M 0 40 Q 30 40 45 40 L 55 15 L 65 65 L 75 35 L 85 40 Q 120 40 145 40 L 155 10 L 165 70 L 175 30 L 185 40 Q 240 40 255 40 L 265 18 L 275 60 L 285 40 L 300 40"
                    fill="none"
                    stroke="url(#waveGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Scanning Laser Beam */}
                <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-shimmer pointer-events-none" />
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>{t('bento_card2_tear')}</span>
                <span className="text-cyan-700 dark:text-cyan-300 font-bold">{t('bento_card2_tear_opt')}</span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* BENTO CARD 3: Quy Tắc 20-20-20 (VỪA - Chiếm 4 Cột)            */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 rounded-3xl p-7 sm:p-8 bg-white/90 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-xl dark:shadow-2xl flex flex-col justify-between group hover-card-glow hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-teal-500/10 hover:border-teal-500/40 transition-all duration-300 ease-out relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-[70px] pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-out" />

            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-md">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-teal-600 dark:text-teal-400 font-bold block">
                    {t('bento_card3_tag')}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('bento_card3_title')}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('bento_card3_desc')}
              </p>
            </div>

            {/* Circular Digital Countdown HUD */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#020617]/90 border border-slate-200 dark:border-white/10 flex items-center justify-around">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-slate-300 dark:stroke-slate-800" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset="65"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-mono font-black text-slate-900 dark:text-white">19:42</span>
                  <span className="text-[8px] font-mono text-teal-600 dark:text-teal-300 uppercase">{t('bento_card3_remaining')}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:translate-x-1.5 transition-transform duration-200 cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>{t('bento_card3_p1')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:translate-x-1.5 transition-transform duration-200 cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span>{t('bento_card3_p2')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:translate-x-1.5 transition-transform duration-200 cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{t('bento_card3_p3')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* BENTO CARD 4: 100% On-Device Privacy (DÀI - Chiếm 8 Cột)      */}
          {/* ============================================================ */}
          <div className="lg:col-span-8 rounded-3xl p-7 sm:p-8 bg-white/90 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-xl dark:shadow-2xl flex flex-col justify-between group hover-card-glow hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-300 ease-out relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-out" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-600 dark:text-emerald-400 font-bold block">
                      {t('bento_card4_tag')}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {t('bento_card4_title')}
                    </h3>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t('bento_card4_badge')}</span>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {t('bento_card4_desc')}
              </p>
            </div>

            {/* Architecture Data Flow Infographic */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#020617]/90 border border-slate-200 dark:border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-center">
                {/* Step 1: Camera Input */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 flex flex-col items-center shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-1.5">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('bento_card4_cam')}</span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{t('bento_card4_cam_sub')}</span>
                </div>

                {/* Connector Arrow */}
                <div className="hidden sm:flex items-center justify-center text-slate-400">
                  <ChevronRight className="w-5 h-5 text-emerald-500 animate-pulse" />
                </div>

                {/* Step 2: On-device NPU/GPU */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 flex flex-col items-center shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{t('bento_card4_chip')}</span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{t('bento_card4_chip_sub')}</span>
                </div>

                {/* Step 3: Frame Destroyed */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 flex flex-col items-center shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('bento_card4_del')}</span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{t('bento_card4_del_sub')}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {t('bento_card4_flight')}
                </span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 mt-1 sm:mt-0">
                  Zero Camera Cloud Streaming
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
