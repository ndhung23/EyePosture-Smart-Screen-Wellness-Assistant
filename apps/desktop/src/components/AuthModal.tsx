import React, { useState } from 'react';
import { User, Mail, Lock, X, LogIn, UserPlus, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { AuthService } from '../services/AuthService.js';
import { t } from '@eyeposture/i18n';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login, registerUser } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [forgotStep, setForgotStep] = useState<'email' | 'otp'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [testCodeHint, setTestCodeHint] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
    }
  }, [authModalMode]);

  React.useEffect(() => {
    if (authModalOpen) {
      setError(null);
      setSuccessMsg(null);
      setTestCodeHint(null);
      setForgotStep('email');
      setOtpCode('');
      setNewPassword('');
    }
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Email hoặc mật khẩu không chính xác.');
        } else {
          closeAuthModal();
        }
      } else if (mode === 'register') {
        if (!name.trim()) {
          setError('Vui lòng nhập họ tên của bạn.');
          setLoading(false);
          return;
        }
        const res = await registerUser(email, password, name);
        if (!res.success) {
          setError(res.error || 'Đăng ký tài khoản không thành công.');
        } else {
          closeAuthModal();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ Cloud.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.requestPasswordReset(cleanEmail);
      if (res.success) {
        if (res.testCode) {
          setTestCodeHint(res.testCode);
        }
        setForgotStep('otp');
      } else {
        setError(res.error || 'Không thể gửi mã xác nhận đến email.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối khi gửi mã xác nhận.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otpCode.trim()) {
      setError('Vui lòng nhập mã xác thực 6 số.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await AuthService.resetPassword(cleanEmail, otpCode, newPassword);
      if (res.success) {
        setSuccessMsg('Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập ngay.');
        setTimeout(() => {
          setMode('login');
          setPassword(newPassword);
          setSuccessMsg(null);
        }, 1200);
      } else {
        setError(res.error || 'Mã xác thực không chính xác hoặc đã hết hạn.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-7 shadow-2xl shadow-teal-500/10 relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Back Button for Forgot Mode */}
        {mode === 'forgot' && (
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            {mode === 'forgot' ? (
              <KeyRound className="w-6 h-6" />
            ) : mode === 'login' ? (
              <LogIn className="w-6 h-6" />
            ) : (
              <UserPlus className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-slate-100">
              {mode === 'forgot'
                ? 'Khôi phục mật khẩu'
                : mode === 'login'
                ? 'Đăng nhập tài khoản'
                : 'Tạo tài khoản mới'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'forgot'
                ? 'Nhận mã OTP qua email để đặt lại mật khẩu'
                : mode === 'login'
                ? 'Đồng bộ bản quyền Pro và cài đặt trên mọi thiết bị'
                : 'Đăng ký tài khoản để kích hoạt bản quyền EyePosture Cloud'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs (Only in login / register mode) */}
        {mode !== 'forgot' && (
          <div className="flex rounded-xl bg-slate-800/80 p-1 mb-6 border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Test Code Hint Banner */}
        {testCodeHint && (
          <div className="p-2.5 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between animate-fadeIn">
            <span>Mã OTP thử nghiệm:</span>
            <span className="font-mono font-bold text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded">
              {testCodeHint}
            </span>
          </div>
        )}

        {/* FORM 1: LOGIN & REGISTER */}
        {mode !== 'forgot' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span>Họ và tên</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Họ và tên của bạn (VD: Nguyễn Văn A)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>{mode === 'login' ? 'Tài khoản / Email' : 'Email'}</span>
              </label>
              <input
                type={mode === 'login' ? 'text' : 'email'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'login' ? 'Tài khoản admin hoặc email...' : 'Địa chỉ email (VD: user@gmail.com)'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Mật khẩu</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors underline font-medium"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={mode === 'register' ? 6 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Mật khẩu mới (tối thiểu 6 ký tự)' : 'Nhập mật khẩu của bạn...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <span>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
              )}
            </button>
          </form>
        )}

        {/* FORM 2: FORGOT PASSWORD - STEP 1 */}
        {mode === 'forgot' && forgotStep === 'email' && (
          <form onSubmit={handleSendForgotOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>Nhập địa chỉ Email tài khoản:</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Địa chỉ email đã đăng ký (VD: user@gmail.com)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <span>Gửi mã xác nhận qua Email</span>
              )}
            </button>
          </form>
        )}

        {/* FORM 3: FORGOT PASSWORD - STEP 2 */}
        {mode === 'forgot' && forgotStep === 'otp' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Mã xác thực (6 số gửi qua email):</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Nhập 6 số xác thực (VD: 123456)"
                className="w-full text-center tracking-widest font-mono text-base font-bold px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-teal-300 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Mật khẩu mới:</label>
              <input
                type="password"
                required
                minLength={4}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới (tối thiểu 4 ký tự)..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !otpCode || !newPassword}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <span>Đặt lại mật khẩu</span>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2"
              >
                Đăng ký ngay
              </button>
            </p>
          ) : mode === 'register' ? (
            <p>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2"
              >
                Đăng nhập
              </button>
            </p>
          ) : (
            <p>
              Đã nhớ lại mật khẩu?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2"
              >
                Quay lại đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
