'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, LogOut, Sparkles, Menu } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import { LanguageToggle } from '../language-toggle';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

interface AdminHeaderProps {
  activeTabTitle?: string;
  onToggleMobileMenu?: () => void;
}

export function AdminHeader({ activeTabTitle, onToggleMobileMenu }: AdminHeaderProps) {
  const { logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger & Current Page Title */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
              {activeTabTitle || t('admin_title')}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Supabase Live
            </span>
          </div>
        </div>

        {/* Right: Controls & Logout */}
        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={logout}
            className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-500/40 transition active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('nav_logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
