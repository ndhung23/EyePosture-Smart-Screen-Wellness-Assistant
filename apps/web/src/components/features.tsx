'use client';

import React from 'react';
import { Eye, Shield, Laptop, BellRing, HeartPulse, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Eye,
      title: t('feat_1_title'),
      desc: t('feat_1_desc'),
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: HeartPulse,
      title: t('feat_2_title'),
      desc: t('feat_2_desc'),
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Sparkles,
      title: t('feat_3_title'),
      desc: t('feat_3_desc'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: t('feat_4_title'),
      desc: t('feat_4_desc'),
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Laptop,
      title: t('feat_5_title'),
      desc: t('feat_5_desc'),
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: BellRing,
      title: t('feat_6_title'),
      desc: t('feat_6_desc'),
      color: 'from-rose-500 to-red-500',
    },
  ];

  return (
    <section id="features" className="py-20 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 dark:text-cyan-400 light:text-indigo-600">
            {t('feat_tag')}
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
            {t('feat_title')}
          </p>
          <p className="text-base text-slate-400 dark:text-slate-400 light:text-slate-600">
            {t('feat_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative rounded-3xl p-7 bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2.5">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed font-normal">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
