'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={
        theme === 'dark'
          ? (language === 'vi' ? 'Chuyển sang giao diện Sáng' : 'Switch to Light Mode')
          : (language === 'vi' ? 'Chuyển sang giao diện Tối' : 'Switch to Dark Mode')
      }
      aria-label="Toggle Light / Dark mode"
      className={`relative inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 animate-spin-slow transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform" />
      )}
    </button>
  );
}
