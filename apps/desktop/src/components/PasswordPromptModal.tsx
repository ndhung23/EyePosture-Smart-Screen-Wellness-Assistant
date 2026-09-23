import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, X, ShieldAlert, KeyRound, Mail, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { AuthService } from '../services/AuthService.js';
import { hashPassword } from '../utils/crypto.js';
import { t } from '@eyeposture/i18n';

export const PasswordPromptModal: React.FC = () => {
  const { passwordModalConfig, closePasswordModal, verifyPassword, settings, updateSecuritySettings, currentUser } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Forgot password & Email recovery states
  const [mode, setMode] = useState<'verify' | 'forgot'>('verify');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify_code'>('request');
  const [emailInput, setEmailInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [testCodeHint, setTestCodeHint] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const existingEmail = settings?.security?.recoveryEmail || currentUser?.email || '';

  useEffect(() => {
    if (passwordModalConfig?.isOpen) {
      setPassword('');
      setErrorMessage(null);
      setShowPassword(false);
      setIsVerifying(false);
      setMode('verify');
      setForgotStep('request');
      setEmailInput(existingEmail);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setTestCodeHint(null);
      setSuccessMessage(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [passwordModalConfig?.isOpen, existingEmail]);

  if (!passwordModalConfig?.isOpen) return null;

  const isQuitAction = passwordModalConfig.action === 'QUIT_APP';
  const isSettingsAction = passwordModalConfig.action === 'ACCESS_SETTINGS';

  // --- Handlers for Verify Mode ---
  const handleSubmitVerify = async (e?: React.FormEvent) => {
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

  // --- Handlers for Forgot Password & Email Recovery ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (emailInput || existingEmail).trim().toLowerCase();

    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setIsSendingCode(true);
    setErrorMessage(null);

    try {
      const res = await AuthService.requestPasswordReset(targetEmail);
      if (res.success) {
        // Save recovery email into settings if not saved yet
        if (settings && (!settings.security?.recoveryEmail || settings.security.recoveryEmail !== targetEmail)) {
          updateSecuritySettings({
            ...settings.security,
            recoveryEmail: targetEmail,
          });
        }
        if (res.testCode) {
          setTestCodeHint(res.testCode);
        }
        setForgotStep('verify_code');
      } else {
        setErrorMessage(res.error || 'Không thể gửi mã xác nhận đến email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối khi gửi mã xác nhận.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode.trim()) {
      setErrorMessage('Vui lòng nhập mã xác thực 6 số.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    setIsVerifying(true);
    const targetEmail = (emailInput || existingEmail).trim().toLowerCase();

    try {
      const res = await AuthService.resetPassword(targetEmail, otpCode, newPassword);
      if (res.success) {
        const hashed = await hashPassword(newPassword);
        if (settings) {
          updateSecuritySettings({
            ...settings.security,
            enabled: true,
            passwordHash: hashed,
            recoveryEmail: targetEmail,
          });
        }
        setSuccessMessage('Mật khẩu đã được đặt lại thành công!');
        setTimeout(() => {
          const callback = passwordModalConfig.onSuccess;
          closePasswordModal();
          if (callback) {
            callback();
          }
        }, 800);
      } else {
        setErrorMessage(res.error || 'Mã xác thực không chính xác hoặc đã hết hạn.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi cập nhật mật khẩu.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getTitle = () => {
    if (mode === 'forgot') return 'Khôi phục mật khẩu';
    if (isQuitAction) return t('security.promptTitleQuit');
    if (isSettingsAction) return 'Khóa Bảo Mật Cài Đặt';
    return t('security.promptTitlePause');
  };

  const getSubtitle = () => {
    if (mode === 'forgot') {
      if (forgotStep === 'request') {
        return existingEmail
          ? `Mã xác nhận 6 số sẽ được gửi tới email ${existingEmail}`
          : 'Tài khoản chưa đăng ký email. Vui lòng nhập email để nhận mã xác thực đặt lại mật khẩu.';
      }
      return 'Nhập mã xác thực đã gửi đến email của bạn và đặt mật khẩu mới.';
    }
    if (isQuitAction) return t('security.promptDescQuit');
    if (isSettingsAction) return 'Vui lòng nhập đúng mật khẩu đã đặt để mở giao diện Cài đặt.';
    return t('security.promptDescPause');
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

        {/* Mode Back button */}
        {mode === 'forgot' && (
          <button
            onClick={() => {
              setMode('verify');
              setErrorMessage(null);
            }}
            className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
        )}

        {/* Security Icon Badge */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
            mode === 'forgot'
              ? 'bg-teal-500/15 border border-teal-500/30 text-teal-400'
              : isQuitAction
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              : isSettingsAction
              ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
              : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
          }`}
        >
          {mode === 'forgot' ? (
            <Mail className="w-7 h-7" />
          ) : isQuitAction ? (
            <ShieldAlert className="w-7 h-7" />
          ) : (
            <Lock className="w-7 h-7" />
          )}
        </div>

        {/* Title and Subtitle */}
        <h3 className="font-display text-xl font-bold text-slate-100 text-center mb-2">
          {getTitle()}
        </h3>
        <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed max-w-sm">
          {getSubtitle()}
        </p>

        {/* Success Message Banner */}
        {successMessage && (
          <div className="w-full mb-4 p-3.5 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Error Message Banner */}
        {errorMessage && (
          <div className="w-full mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Test Code Hint Banner (For Local Testing when SMTP not configured) */}
        {testCodeHint && (
          <div className="w-full mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between animate-fadeIn">
            <span>Mã thử nghiệm hệ thống:</span>
            <span className="font-mono font-bold text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded">
              {testCodeHint}
            </span>
          </div>
        )}

        {/* --- FORM 1: NORMAL PASSWORD VERIFY --- */}
        {mode === 'verify' && (
          <form onSubmit={handleSubmitVerify} className="w-full space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t('security.currentPassword')}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage(null);
                  }}
                  className="text-teal-400 hover:text-teal-300 hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </button>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitVerify();
                    if (e.key === 'Escape') closePasswordModal();
                  }}
                  placeholder={
                    isSettingsAction
                      ? 'Nhập mật khẩu mở khóa Cài đặt...'
                      : isQuitAction
                      ? 'Nhập mật khẩu để thoát ứng dụng...'
                      : (t('security.enterCurrentPassword') || 'Nhập mật khẩu bảo mật...')
                  }
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

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={closePasswordModal}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-all active:scale-95"
              >
                {t('security.cancel') || 'Hủy bỏ'}
              </button>
              <button
                type="submit"
                disabled={isVerifying || !password}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isQuitAction
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 disabled:opacity-50'
                    : isSettingsAction
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 disabled:opacity-50'
                    : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20 disabled:opacity-50'
                }`}
              >
                {isVerifying ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{isSettingsAction ? 'Mở khóa & Tiếp tục' : (t('security.verifyAndContinue') || 'Xác nhận & Tiếp tục')}</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* --- FORM 2: FORGOT PASSWORD - STEP 1 (REQUEST OTP) --- */}
        {mode === 'forgot' && forgotStep === 'request' && (
          <form onSubmit={handleSendOtp} className="w-full space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>{existingEmail ? 'Email khôi phục đã liên kết:' : 'Nhập Email để đăng ký khôi phục:'}</span>
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Ví dụ: hotro@gmail.com..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingCode || !emailInput}
              className="w-full py-2.5 px-4 rounded-xl gradient-teal text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isSendingCode ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <span>{existingEmail ? 'Gửi mã xác thực qua Email' : 'Đăng ký email & Gửi mã OTP'}</span>
              )}
            </button>
          </form>
        )}

        {/* --- FORM 3: FORGOT PASSWORD - STEP 2 (VERIFY CODE & NEW PASSWORD) --- */}
        {mode === 'forgot' && forgotStep === 'verify_code' && (
          <form onSubmit={handleResetPassword} className="w-full space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Mã xác thực (6 số đã gửi đến email):</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Nhập 6 số xác thực (VD: 123456)"
                className="w-full text-center tracking-widest font-mono text-lg font-bold px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-teal-300 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Mật khẩu mới:</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới (tối thiểu 4 ký tự)..."
                  className="w-full px-4 py-2 pr-10 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Nhập lại mật khẩu mới:</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới để xác nhận..."
                className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || !otpCode || !newPassword || !confirmPassword}
              className="w-full py-2.5 px-4 rounded-xl gradient-teal text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50 active:scale-95 transition-all mt-2"
            >
              {isVerifying ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <span>Xác nhận & Đổi mật khẩu</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
