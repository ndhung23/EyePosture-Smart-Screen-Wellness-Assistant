import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, X, ShieldAlert, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const PasswordPromptModal: React.FC = () => {
  const { passwordModalConfig, closePasswordModal, verifyPassword } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (passwordModalConfig?.isOpen) {
      setPassword('');
      setErrorMessage(null);
      setShowPassword(false);
      setIsVerifying(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [passwordModalConfig?.isOpen]);

  if (!passwordModalConfig?.isOpen) return null;

  const isQuitAction = passwordModalConfig.action === 'QUIT_APP';

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setErrorMessage(t('security.incorrectPassword'));
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        const callback = passwordModalConfig.onSuccess;
        closePasswordModal();
        if (callback) {
          callback();
        }
      } else {
        setErrorMessage(t('security.incorrectPassword'));
        setIsVerifying(false);
        inputRef.current?.select();
      }
    } catch {
      setErrorMessage(t('security.incorrectPassword'));
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      closePasswordModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-7 shadow-2xl shadow-purple-500/10 relative flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={closePasswordModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title={t('security.cancel')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Icon Badge */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
            isQuitAction
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
          }`}
        >
          {isQuitAction ? <ShieldAlert className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
        </div>

        {/* Title and Subtitle */}
        <h3 className="font-display text-xl font-bold text-slate-100 text-center mb-2">
          {isQuitAction ? t('security.promptTitleQuit') : t('security.promptTitlePause')}
        </h3>
        <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed max-w-sm">
          {isQuitAction ? t('security.promptDescQuit') : t('security.promptDescPause')}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('security.currentPassword')}</span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder={t('security.enterCurrentPassword')}
                className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closePasswordModal}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-all active:scale-95"
            >
              {t('security.cancel')}
            </button>
            <button
              type="submit"
              disabled={isVerifying || !password}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isQuitAction
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 disabled:opacity-50'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20 disabled:opacity-50'
              }`}
            >
              {isVerifying ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{t('security.verifyAndContinue')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
