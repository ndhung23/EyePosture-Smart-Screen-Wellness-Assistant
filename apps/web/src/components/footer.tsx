'use client';

import React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 bg-slate-950 dark:bg-slate-950 light:bg-slate-50 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/EyePosture.png"
              alt="EyePosture Logo"
              className="w-8 h-8 rounded-lg object-contain shadow-md shadow-cyan-500/10"
            />
            <div>
              <span className="font-extrabold text-base tracking-tight text-white dark:text-white light:text-slate-900">
                EyePosture
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                AI Smart Screen Wellness Assistant
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
            <a href="#features" className="hover:text-cyan-400 transition">{t('nav_features')}</a>
            <a href="#wellness" className="hover:text-cyan-400 transition">{t('nav_wellness')}</a>
            <a href="#pricing" className="hover:text-cyan-400 transition">{t('nav_pricing')}</a>
            <a href="/api/download" className="hover:text-cyan-400 transition">{t('nav_download')}</a>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right">
            <span>© 2026 EyePosture Project. EXE101 FPT University.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
