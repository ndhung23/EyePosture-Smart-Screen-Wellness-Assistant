import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Power,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { hashPassword } from '../utils/crypto.js';
import { t } from '@eyeposture/i18n';

export const SecuritySettingsSection: React.FC = () => {
  const { settings, updateSecuritySettings, requestQuitApp } = useApp();

  // Local states for Set Password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Local states for Change Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showChangeNewPassword, setShowChangeNewPassword] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!settings) return null;

  const security = settings.security || {
    enabled: false,
    passwordHash: undefined,
    requireOnPause: true,
    requireOnQuit: true,
  };

  const hasPassword = Boolean(security.passwordHash);

  const clearFeedbackAfterDelay = () => {
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // 1. Handler: Initial password setup
  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setFeedback({ type: 'error', message: t('security.passwordTooShort') });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: t('security.passwordMismatch') });
      return;
    }

    const hashed = await hashPassword(newPassword);
    updateSecuritySettings({
      ...security,
      enabled: true,
      passwordHash: hashed,
      requireOnPause: security.requireOnPause ?? true,
      requireOnQuit: security.requireOnQuit ?? true,
    });

    setNewPassword('');
    setConfirmPassword('');
    setFeedback({ type: 'success', message: t('security.passwordSaved') });
    clearFeedbackAfterDelay();
  };

  // 2. Handler: Change existing password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setFeedback({ type: 'error', message: t('security.enterCurrentPassword') });
      return;
    }
    const currentHashed = await hashPassword(currentPassword);
    if (currentHashed !== security.passwordHash) {
      setFeedback({ type: 'error', message: t('security.incorrectPassword') });
      return;
    }
    if (changeNewPassword.length < 4) {
      setFeedback({ type: 'error', message: t('security.passwordTooShort') });
      return;
    }
    if (changeNewPassword !== changeConfirmPassword) {
      setFeedback({ type: 'error', message: t('security.passwordMismatch') });
      return;
    }

    const newHashed = await hashPassword(changeNewPassword);
    updateSecuritySettings({
      ...security,
      passwordHash: newHashed,
    });

    setCurrentPassword('');
    setChangeNewPassword('');
    setChangeConfirmPassword('');
    setFeedback({ type: 'success', message: t('security.passwordSaved') });
    clearFeedbackAfterDelay();
  };

  // 3. Handler: Remove password protection completely
  const handleRemovePassword = async () => {
    if (!currentPassword) {
      setFeedback({ type: 'error', message: t('security.enterCurrentPassword') });
      return;
    }
    const currentHashed = await hashPassword(currentPassword);
    if (currentHashed !== security.passwordHash) {
      setFeedback({ type: 'error', message: t('security.incorrectPassword') });
      return;
    }

    updateSecuritySettings({
      enabled: false,
      passwordHash: undefined,
      requireOnPause: false,
      requireOnQuit: false,
    });

    setCurrentPassword('');
    setChangeNewPassword('');
    setChangeConfirmPassword('');
    setFeedback({ type: 'success', message: t('security.passwordRemoved') });
    clearFeedbackAfterDelay();
  };

  // 4. Handler: Toggle enabled/disabled (requires current password if currently enabled)
  const handleToggleEnabled = () => {
    updateSecuritySettings({
      ...security,
      enabled: !security.enabled,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Banner Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          security.enabled && hasPassword
            ? 'bg-gradient-to-r from-purple-950/40 to-slate-900 border-purple-500/30'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-3.5 rounded-2xl ${
                security.enabled && hasPassword
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {security.enabled && hasPassword ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <ShieldAlert className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-display font-bold text-lg text-slate-100">
                  {t('security.title')}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    security.enabled && hasPassword
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {security.enabled && hasPassword ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {t('security.description')}
              </p>
            </div>
          </div>

          {/* Master Enable/Disable Toggle (when password exists) */}
          {hasPassword && (
            <button
              onClick={handleToggleEnabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                security.enabled
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
              }`}
            >
              {security.enabled ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{t('security.enabled')}</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>{t('security.enabled')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* If No Password Set Yet: Show Setup Form */}
      {!hasPassword ? (
        <div className="glass-card p-6 border border-slate-800 space-y-5">
          <div>
            <h4 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>{t('security.setPassword')}</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {t('security.enabledDesc')}
            </p>
          </div>

          <form onSubmit={handleSetupPassword} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">{t('security.newPassword')}</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('security.enterNewPassword')}
                  className="w-full px-3.5 py-2 pr-10 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">{t('security.confirmPassword')}</label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('security.enterConfirmPassword')}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60"
              />
            </div>

            <button
              type="submit"
              disabled={!newPassword || !confirmPassword}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {t('security.setPassword')}
            </button>
          </form>
        </div>
      ) : (
        /* If Password Already Set: Show Protection Scope & Management */
        <div className="space-y-6">
          {/* Protection Triggers Options */}
          <div className="glass-card p-6 border border-slate-800 space-y-4">
            <h4 className="font-semibold text-sm text-slate-200">{t('common.options')}</h4>
            <div className="space-y-3">
              {/* Require on Pause */}
              <label className="flex items-start justify-between p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 cursor-pointer transition-all">
                <div className="pr-4">
                  <div className="text-xs font-semibold text-slate-200">{t('security.requireOnPause')}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{t('security.requireOnPauseDesc')}</div>
                </div>
                <input
                  type="checkbox"
                  checked={security.requireOnPause}
                  onChange={(e) =>
                    updateSecuritySettings({ ...security, requireOnPause: e.target.checked })
                  }
                  className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-700 border-slate-600"
                />
              </label>

              {/* Require on Quit */}
              <label className="flex items-start justify-between p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 cursor-pointer transition-all">
                <div className="pr-4">
                  <div className="text-xs font-semibold text-slate-200">{t('security.requireOnQuit')}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{t('security.requireOnQuitDesc')}</div>
                </div>
                <input
                  type="checkbox"
                  checked={security.requireOnQuit}
                  onChange={(e) =>
                    updateSecuritySettings({ ...security, requireOnQuit: e.target.checked })
                  }
                  className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-700 border-slate-600"
                />
              </label>
            </div>
          </div>

          {/* Change or Remove Password Section */}
          <div className="glass-card p-6 border border-slate-800 space-y-5">
            <div>
              <h4 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-400" />
                <span>{t('security.changePassword')}</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {t('security.enterCurrentPassword')}
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t('security.currentPassword')}</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('security.enterCurrentPassword')}
                    className="w-full px-3.5 py-2 pr-10 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t('security.newPassword')}</label>
                <div className="relative">
                  <input
                    type={showChangeNewPassword ? 'text' : 'password'}
                    value={changeNewPassword}
                    onChange={(e) => setChangeNewPassword(e.target.value)}
                    placeholder={t('security.enterNewPassword')}
                    className="w-full px-3.5 py-2 pr-10 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowChangeNewPassword(!showChangeNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showChangeNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t('security.confirmPassword')}</label>
                <input
                  type={showChangeNewPassword ? 'text' : 'password'}
                  value={changeConfirmPassword}
                  onChange={(e) => setChangeConfirmPassword(e.target.value)}
                  placeholder={t('security.enterConfirmPassword')}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!currentPassword || !changeNewPassword || !changeConfirmPassword}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {t('security.changePassword')}
                </button>

                <button
                  type="button"
                  onClick={handleRemovePassword}
                  disabled={!currentPassword}
                  className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
                >
                  {t('security.removePassword')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* App Exit Action Card */}
      <div className="glass-card p-6 border border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
            <Power className="w-4 h-4 text-rose-400" />
            <span>Thoát EyePosture (Quit Application)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Đóng toàn bộ ứng dụng và ngắt kết nối khỏi khay hệ thống.
          </p>
        </div>
        <button
          onClick={requestQuitApp}
          className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all active:scale-95 flex items-center gap-2"
        >
          <Power className="w-3.5 h-3.5" />
          <span>Thoát ứng dụng</span>
        </button>
      </div>
    </div>
  );
};
