'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      title={language === 'vi' ? 'Chuyển sang Tiếng Anh (English)' : 'Switch to Vietnamese'}
      aria-label="Chuyển đổi ngôn ngữ / Switch language"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 backdrop-blur-md transition-all duration-300 shadow-sm text-xs font-bold active:scale-95 ${className}`}
    >
      <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
      <span className="tracking-wide uppercase font-mono">{language === 'vi' ? 'VI' : 'EN'}</span>
    </button>
  );
}
