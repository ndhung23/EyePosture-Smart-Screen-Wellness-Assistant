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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
              <Eye className="w-4 h-4" />
            </div>
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
            <a href="#pricing" className="hover:text-cyan-400 transition">{t('nav_pricing')}</a>
            <a
              href="https://github.com/ndhung23/EyePosture-Smart-Screen-Wellness-Assistant"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition"
            >
              GitHub Repository
            </a>
            <Link href="/admin" className="hover:text-purple-400 transition">
              {t('nav_admin')}
            </Link>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right">
            <span>© 2026 EyePosture Project. EXE101 FPT University.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
