import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Power,
  User,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  Sliders,
  Camera,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const SecuritySettingsSection: React.FC = () => {
  const {
    settings,
    updateSecuritySettings,
    requestQuitApp,
    currentUser,
    openAuthModal,
    verifyPassword,
  } = useApp();

  const [isConfirmingToggle, setIsConfirmingToggle] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!settings) return null;

  const security = settings.security || {
    enabled: false,
    requireOnPause: true,
    requireOnQuit: true,
    requireOnSettings: true,
  };

  const isEnabled = Boolean(security.enabled);

  const clearFeedbackAfterDelay = () => {
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const handleStartToggle = () => {
    if (!currentUser) {
      setFeedback({
        type: 'error',
        message: 'Vui lòng đăng nhập tài khoản trước để sử dụng tính năng Bảo Mật.',
      });
      clearFeedbackAfterDelay();
      return;
    }
    setAccountPassword('');
    setShowPassword(false);
    setIsConfirmingToggle(true);
  };

  const handleConfirmToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountPassword.trim()) {
      setFeedback({ type: 'error', message: 'Vui lòng nhập mật khẩu tài khoản của bạn.' });
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verifyPassword(accountPassword);
      if (isValid) {
        const nextState = !isEnabled;
        updateSecuritySettings({
          ...security,
          enabled: nextState,
          requireOnPause: true,
          requireOnQuit: true,
          requireOnSettings: true,
        });

        setIsConfirmingToggle(false);
        setAccountPassword('');
        setFeedback({
          type: 'success',
          message: nextState
            ? 'Đã kích hoạt tính năng Bảo Mật thành công! Giờ đây các thao tác quan trọng sẽ được bảo vệ bằng mật khẩu tài khoản.'
            : 'Đã tắt tính năng Bảo Mật. Các thao tác sẽ không yêu cầu nhập mật khẩu nữa.',
        });
        clearFeedbackAfterDelay();
      } else {
        setFeedback({
          type: 'error',
          message: 'Mật khẩu tài khoản không chính xác. Vui lòng thử lại.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Lỗi xác thực mật khẩu. Vui lòng kiểm tra lại.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Banner Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isEnabled
            ? 'bg-gradient-to-r from-purple-950/40 to-slate-900 border-purple-500/30'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-3.5 rounded-2xl ${
                isEnabled
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isEnabled ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <ShieldAlert className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-display font-bold text-lg text-slate-100">
                  {t('security.title') || 'Bảo mật & Khoá bảo vệ'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isEnabled
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {isEnabled ? 'Đang Bật (Active)' : 'Đang Tắt (Mặc định)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Bảo vệ ứng dụng bằng chính mật khẩu tài khoản của bạn. Khi bật, EyePosture sẽ yêu cầu nhập mật khẩu tài khoản để: 
                <strong className="text-slate-300"> Thoát ứng dụng</strong>, 
                <strong className="text-slate-300"> Tắt camera giám sát</strong> hoặc 
                <strong className="text-slate-300"> Truy cập Cài đặt</strong>.
              </p>
            </div>
          </div>

          {/* Master Enable / Disable Button */}
          {currentUser ? (
            <button
              onClick={handleStartToggle}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 shrink-0 shadow-sm ${
                isEnabled
                  ? 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-300'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20 border-purple-500'
              }`}
            >
              {isEnabled ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Tắt Bảo Mật</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Bật Bảo Mật</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-teal-500/20 border border-teal-400 transition-all active:scale-95 shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập để bật</span>
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

      {/* Account Info Card */}
      <div className="glass-card p-6 border border-slate-800 space-y-4">
        <h4 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-purple-400" />
          <span>Tài khoản xác thực bảo vệ</span>
        </h4>

        {currentUser ? (
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>{currentUser.name || 'Người dùng'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  {currentUser.role || 'USER'}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">{currentUser.email}</div>
              <p className="text-[11px] text-slate-400 pt-1">
                🔑 Mật khẩu bảo mật trùng khớp với mật khẩu đăng nhập của tài khoản này. Không cần ghi nhớ thêm mật khẩu riêng biệt.
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                isEnabled
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {isEnabled ? <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> : <Shield className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isEnabled ? 'Đang bảo vệ' : 'Chưa bảo vệ'}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-200">Bạn chưa đăng nhập tài khoản</div>
              <div className="text-[11px] text-amber-300/80 mt-0.5">
                Đăng nhập để liên kết mật khẩu tài khoản với tính năng khoá bảo vệ của EyePosture.
              </div>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all active:scale-95"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Form Modal / Card for Toggle */}
      {isConfirmingToggle && (
        <div className="glass-card p-6 border-2 border-purple-500/50 bg-purple-950/20 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>
                {isEnabled
                  ? 'Nhập mật khẩu tài khoản để Tắt Bảo Mật'
                  : 'Nhập mật khẩu tài khoản để Bật Bảo Mật'}
              </span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsConfirmingToggle(false);
                setAccountPassword('');
              }}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Hủy
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Vui lòng nhập mật khẩu tài khoản <strong className="text-teal-300 font-mono">{currentUser?.email}</strong> để xác thực thao tác:
          </p>

          <form onSubmit={handleConfirmToggle} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="Nhập mật khẩu tài khoản của bạn..."
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isVerifying || !accountPassword}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isVerifying ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{isEnabled ? 'Xác nhận & Tắt' : 'Xác nhận & Bật'}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingToggle(false);
                  setAccountPassword('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all active:scale-95"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Protected Actions Scope Overview */}
      <div className="glass-card p-6 border border-slate-800 space-y-4">
        <h4 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Danh sách thao tác được bảo vệ</span>
        </h4>
        <p className="text-xs text-slate-400">
          Khi tính năng Bảo Mật được bật, các thao tác sau sẽ bị khóa và cần nhập đúng mật khẩu tài khoản để thực hiện:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Action 1 */}
          <div className={`p-4 rounded-xl border transition-all ${
            isEnabled
              ? 'bg-slate-800/40 border-purple-500/30 text-slate-200'
              : 'bg-slate-800/20 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`p-2 rounded-lg ${isEnabled ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'}`}>
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">Thoát ứng dụng</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Yêu cầu mật khẩu trước khi tắt hoàn toàn ứng dụng và thoát khỏi khay hệ thống.
            </p>
            <div className="mt-3 text-[10px] font-semibold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-teal-400' : 'bg-slate-600'}`} />
              <span>{isEnabled ? 'Đang được bảo vệ' : 'Chưa kích hoạt'}</span>
            </div>
          </div>

          {/* Action 2 */}
          <div className={`p-4 rounded-xl border transition-all ${
            isEnabled
              ? 'bg-slate-800/40 border-purple-500/30 text-slate-200'
              : 'bg-slate-800/20 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`p-2 rounded-lg ${isEnabled ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'}`}>
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">Tắt giám sát Camera</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Yêu cầu mật khẩu khi người dùng cố gắng tắt camera giám sát tư thế & khoảng cách.
            </p>
            <div className="mt-3 text-[10px] font-semibold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-teal-400' : 'bg-slate-600'}`} />
              <span>{isEnabled ? 'Đang được bảo vệ' : 'Chưa kích hoạt'}</span>
            </div>
          </div>

          {/* Action 3 */}
          <div className={`p-4 rounded-xl border transition-all ${
            isEnabled
              ? 'bg-slate-800/40 border-purple-500/30 text-slate-200'
              : 'bg-slate-800/20 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`p-2 rounded-lg ${isEnabled ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'}`}>
                <Sliders className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">Cài đặt (Dashboard Settings)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Yêu cầu mật khẩu khi truy cập vào bảng Cài đặt để ngăn ngừa việc sửa đổi thông số.
            </p>
            <div className="mt-3 text-[10px] font-semibold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-teal-400' : 'bg-slate-600'}`} />
              <span>{isEnabled ? 'Đang được bảo vệ' : 'Chưa kích hoạt'}</span>
            </div>
          </div>
        </div>
      </div>

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
