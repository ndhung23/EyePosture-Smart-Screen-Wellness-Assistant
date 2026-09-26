'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Shield, Download, LogIn, User as UserIcon, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

export function Navbar({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user, logout, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/EyePosture.png"
            alt="EyePosture Logo"
            className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 dark:from-cyan-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                EyePosture
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                AI Assistant
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a
            href="#features"
            className="relative py-1 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 group/link"
          >
            <span>{t('nav_features')}</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-500 to-indigo-500 group-hover/link:w-full transition-all duration-300 ease-out rounded-full" />
          </a>
          <a
            href="#wellness"
            className="relative py-1 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 group/link"
          >
            <span>{t('nav_wellness')}</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-500 to-indigo-500 group-hover/link:w-full transition-all duration-300 ease-out rounded-full" />
          </a>
          <a
            href="#pricing"
            className="relative py-1 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 group/link"
          >
            <span>{t('nav_pricing')}</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-500 to-indigo-500 group-hover/link:w-full transition-all duration-300 ease-out rounded-full" />
          </a>
          <a
            href="/api/download"
            className="relative py-1 flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 group/link"
          >
            <Download className="w-4 h-4 group-hover/link:-translate-y-0.5 transition-transform duration-200" />
            <span>{t('nav_download')}</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-500 to-indigo-500 group-hover/link:w-full transition-all duration-300 ease-out rounded-full" />
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  {t('nav_admin')}
                </Link>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 text-sm hover:border-slate-400 dark:hover:border-slate-700 transition-colors duration-200">
                <UserIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="font-medium text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                  {user.name || user.email}
                </span>
                <button
                  onClick={logout}
                  title={t('nav_logout')}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              type="button"
              className="btn-tactile flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-cyan-500/35 transition-all duration-300 ease-out active:scale-95"
            >
              <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span>{t('nav_login')}</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors duration-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 text-sm shadow-xl transition-all duration-300 animate-in slide-in-from-top-2">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:translate-x-1.5 transition-all duration-200 font-medium"
          >
            {t('nav_features')}
          </a>
          <a
            href="#wellness"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:translate-x-1.5 transition-all duration-200 font-medium"
          >
            {t('nav_wellness')}
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:translate-x-1.5 transition-all duration-200 font-medium"
          >
            {t('nav_pricing')}
          </a>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-purple-600 dark:text-purple-400 hover:translate-x-1.5 transition-all duration-200 font-semibold"
            >
              {t('nav_admin')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
