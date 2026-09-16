import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle2, RotateCcw, X } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const BreakModal: React.FC = () => {
  const { isBreakActive, completeBreak, skipBreak } = useApp();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20);

  useEffect(() => {
    if (!isBreakActive) {
      setSecondsRemaining(20);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeBreak();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreakActive, completeBreak]);

  if (!isBreakActive) return null;

  const circleCircumference = 2 * Math.PI * 54;
  const strokeDashoffset = circleCircumference - (secondsRemaining / 20) * circleCircumference;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-md w-full bg-slate-900 border border-teal-500/30 rounded-3xl p-8 shadow-2xl shadow-teal-500/10 text-center relative flex flex-col items-center">
        {/* Close / Skip button */}
        <button
          onClick={skipBreak}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title={t('breaks.skipBreak')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-4 text-teal-400">
          <Eye className="w-8 h-8 stroke-[2]" />
        </div>

        {/* Title & Guidance */}
        <h3 className="font-display text-2xl font-bold text-slate-100 mb-2">
          {t('breaks.breakTitle')}
        </h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-sm">
          {t('breaks.breakMessage')}
        </p>

        {/* Circular Countdown Progress */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              className="text-slate-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              className="text-teal-400 transition-all duration-1000 ease-linear"
              strokeWidth="8"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-bold text-slate-100">{secondsRemaining}</span>
            <span className="text-[11px] text-teal-400 uppercase tracking-widest font-semibold">{t('common.seconds')}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={skipBreak}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-medium text-slate-300 transition-all"
          >
            {t('breaks.skipBreak')}
          </button>
          <button
            onClick={completeBreak}
            className="flex-1 py-3 px-4 rounded-xl gradient-teal text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 hover:opacity-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('breaks.completeBreak')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
