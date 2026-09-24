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
      aria-label="Chuyển đổi ngôn ngữ / Switch language"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700/60 dark:border-slate-800 bg-slate-900/60 dark:bg-slate-900/80 light:bg-white light:border-slate-300 light:shadow-sm text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-cyan-400 dark:hover:text-cyan-400 light:hover:text-cyan-600 backdrop-blur-md transition-all duration-300 shadow-sm text-xs font-bold active:scale-95 ${className}`}
    >
      <Globe className="w-3.5 h-3.5 text-cyan-400" />
      <span className="tracking-wide uppercase font-mono">{language === 'vi' ? 'VI' : 'EN'}</span>
    </button>
  );
}
