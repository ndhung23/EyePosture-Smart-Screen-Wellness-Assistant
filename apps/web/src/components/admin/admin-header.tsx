'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, LogOut } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import { LanguageToggle } from '../language-toggle';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

export function AdminHeader() {
  const { logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/90 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-100 transition"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-white dark:text-white light:text-slate-900">
                  {t('admin_title')}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Supabase Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
                {t('admin_subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-rose-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('nav_logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
