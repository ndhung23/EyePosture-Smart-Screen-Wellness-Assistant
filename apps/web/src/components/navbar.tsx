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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 dark:bg-slate-950/70 light:bg-white/80 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 transition-colors">
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
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent light:from-indigo-600 light:to-purple-700">
                EyePosture
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 light:bg-indigo-50 light:text-indigo-600 light:border-indigo-200">
                AI Assistant
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-600">
          <a href="#features" className="hover:text-cyan-400 dark:hover:text-cyan-400 light:hover:text-indigo-600 transition-colors">
            {t('nav_features')}
          </a>
          <a href="#wellness" className="hover:text-cyan-400 dark:hover:text-cyan-400 light:hover:text-indigo-600 transition-colors">
            {t('nav_wellness')}
          </a>
          <a href="#pricing" className="hover:text-cyan-400 dark:hover:text-cyan-400 light:hover:text-indigo-600 transition-colors">
            {t('nav_pricing')}
          </a>
          <a
            href="/api/download"
            className="flex items-center gap-1.5 hover:text-cyan-400 dark:hover:text-cyan-400 light:hover:text-indigo-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('nav_download')}
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
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                  Admin Hub
                </Link>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-sm">
                <UserIcon className="w-4 h-4 text-cyan-400" />
                <span className="font-medium text-slate-200 dark:text-slate-200 light:text-slate-800 max-w-[120px] truncate">
                  {user.name || user.email}
                </span>
                <button
                  onClick={logout}
                  title="Đăng xuất"
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-cyan-500/30 transition-all duration-300 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-slate-950/95 dark:bg-slate-950/95 light:bg-white border-b border-slate-800 dark:border-slate-800 light:border-slate-200 text-sm">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 light:text-slate-700 hover:text-cyan-400"
          >
            Tính Năng
          </a>
          <a
            href="#wellness"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 light:text-slate-700 hover:text-cyan-400"
          >
            Quy Tắc 20-20-20
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 light:text-slate-700 hover:text-cyan-400"
          >
            Bảng Giá
          </a>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-purple-400 font-semibold"
            >
              Admin Hub Quản Trị
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
