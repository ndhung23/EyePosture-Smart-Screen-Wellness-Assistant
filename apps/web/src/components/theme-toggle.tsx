'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
      aria-label="Chuyển chế độ Sáng / Tối"
      className={`relative inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-700/60 dark:border-slate-800 bg-slate-900/60 dark:bg-slate-900/80 light:bg-white light:border-slate-300 light:shadow-sm text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-cyan-400 dark:hover:text-cyan-400 light:hover:text-indigo-600 backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 active:scale-95 ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 animate-spin-slow transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform" />
      )}
    </button>
  );
}
