import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Crown,
  Sparkles,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  LogOut,
  Edit2,
  Save,
  Clock,
  Zap,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

interface AccountProfileModalProps {
  onNavigateToSubscription?: () => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  onNavigateToSubscription,
}) => {
  const {
    currentUser,
    isProfileModalOpen,
    closeProfileModal,
    subscriptionTier,
    logout,
    updateUserProfile,
    language,
    effectiveTheme,
  } = useApp();

  const isVi = language === 'vi';
  const isLight = effectiveTheme === 'light';

  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isProfileModalOpen || !currentUser) return null;

  const tier = (currentUser.subscription?.tier || subscriptionTier || 'FREE').toUpperCase();
  const isPro = tier === 'PRO';
  const isFamily = tier === 'FAMILY';
  const isFree = tier === 'FREE';

  // Calculate subscription duration / expiration
  const getSubscriptionDuration = () => {
    if (isFree) {
      return isVi ? 'Miễn phí không giới hạn' : 'Unlimited Free Access';
    }

    const expiresAt = currentUser.subscription?.expiresAt;
    // Over 5 years ahead or null considered lifetime
    if (!expiresAt || expiresAt > Date.now() + 5 * 365 * 86400 * 1000) {
      return isVi ? 'Vĩnh viễn (Gói Trọn đời)' : 'Lifetime Access';
    }

    const diffMs = expiresAt - Date.now();
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const dateStr = new Date(expiresAt).toLocaleDateString(isVi ? 'vi-VN' : 'en-US');

    if (daysLeft > 0) {
      return isVi ? `Còn ${daysLeft} ngày (Hết hạn: ${dateStr})` : `${daysLeft} days remaining (Expires: ${dateStr})`;
    }
    return isVi ? `Đã hết hạn (${dateStr})` : `Expired (${dateStr})`;
  };

  const handleStartEditName = () => {
    setNameInput(currentUser.name);
    setIsEditingName(true);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      setErrorMsg(isVi ? 'Tên không được để trống' : 'Name cannot be empty');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await updateUserProfile({ name: nameInput.trim() });
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || (isVi ? 'Cập nhật tên thất bại' : 'Failed to update name'));
    } else {
      setSuccessMsg(isVi ? 'Đã cập nhật tên tài khoản thành công!' : 'Account name updated successfully!');
      setIsEditingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setErrorMsg(isVi ? 'Vui lòng nhập mật khẩu hiện tại' : 'Please enter current password');
      return;
    }
    if (newPassword.length < 4) {
      setErrorMsg(isVi ? 'Mật khẩu mới phải có ít nhất 4 ký tự' : 'New password must have at least 4 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(isVi ? 'Mật khẩu xác nhận không khớp' : 'Password confirmation does not match');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await updateUserProfile({
      currentPassword,
      newPassword,
    });
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || (isVi ? 'Đổi mật khẩu thất bại' : 'Password update failed'));
    } else {
      setSuccessMsg(isVi ? 'Đổi mật khẩu thành công!' : 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleLogout = () => {
    closeProfileModal();
    logout();
  };

  const handleUpgradeClick = () => {
    closeProfileModal();
    if (onNavigateToSubscription) {
      onNavigateToSubscription();
    }
  };

  const getTierBadge = () => {
    if (isFamily) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white font-black text-xs shadow-lg shadow-purple-500/30 border border-purple-300/40 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FAMILY ELITE</span>
        </span>
      );
    }
    if (isPro) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 border border-amber-300/60">
          <Crown className="w-3.5 h-3.5" />
          <span>PRO VIP</span>
        </span>
      );
    }
    return (
      <span
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${
          isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
        }`}
      >
        <User className="w-3.5 h-3.5" />
        <span>{isVi ? 'GÓI MIỄN PHÍ' : 'FREE TIER'}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-700/80 text-slate-100'
        }`}
      >
        {/* Glow Header Background */}
        <div
          className={`absolute top-0 left-0 right-0 h-36 pointer-events-none bg-gradient-to-b ${
            isFamily
              ? isLight
                ? 'from-purple-200/40 via-fuchsia-100/20 to-transparent'
                : 'from-purple-600/25 via-fuchsia-600/10 to-transparent'
              : isPro
              ? isLight
                ? 'from-amber-200/40 via-yellow-100/20 to-transparent'
                : 'from-amber-500/25 via-yellow-500/10 to-transparent'
              : isLight
              ? 'from-teal-100/40 via-slate-100/20 to-transparent'
              : 'from-teal-500/20 via-slate-800/10 to-transparent'
          }`}
        />

        {/* Top Header */}
        <div
          className={`relative flex items-center justify-between p-6 pb-4 border-b ${
            isLight ? 'border-slate-100' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3.5">
            {/* Avatar Ring */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xl border-2 ${
                isFamily
                  ? 'bg-gradient-to-tr from-purple-600 to-pink-500 border-purple-300 text-white shadow-purple-500/30'
                  : isPro
                  ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 border-amber-200 text-slate-950 shadow-amber-500/30'
                  : isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`font-display font-bold text-lg truncate max-w-[200px] ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  {currentUser.name}
                </h3>
                {getTierBadge()}
              </div>
              <p
                className={`text-xs mt-0.5 flex items-center gap-1.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser.email}</span>
              </p>
            </div>
          </div>
          <button
            onClick={closeProfileModal}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`flex border-b px-6 ${
            isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <button
            onClick={() => {
              setActiveTab('info');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'info'
                ? isLight
                  ? 'border-teal-600 text-teal-700 font-bold'
                  : 'border-teal-400 text-teal-300'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{isVi ? 'Thông tin cá nhân' : 'Personal Info'}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('security');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'security'
                ? isLight
                  ? 'border-teal-600 text-teal-700 font-bold'
                  : 'border-teal-400 text-teal-300'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>{isVi ? 'Đổi mật khẩu' : 'Change Password'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-600 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'info' ? (
            <div className="space-y-4">
              {/* Name Editor */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200'
                    : 'bg-slate-800/50 border-slate-700/60'
                }`}
              >
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {isVi ? 'Họ và tên hiển thị' : 'Display Name'}
                </span>
                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none border ${
                        isLight
                          ? 'bg-white border-teal-500 text-slate-900'
                          : 'bg-slate-900 border-teal-500/60 text-slate-100'
                      }`}
                      placeholder={isVi ? 'Nhập tên mới...' : 'Enter new name...'}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Lưu' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                        isLight
                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      {isVi ? 'Hủy' : 'Cancel'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`font-semibold text-sm ${
                        isLight ? 'text-slate-900' : 'text-slate-100'
                      }`}
                    >
                      {currentUser.name}
                    </span>
                    <button
                      onClick={handleStartEditName}
                      className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-500 font-medium transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Sửa tên' : 'Edit name'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Subscription Overview Card */}
              <div
                className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
                  isFamily
                    ? isLight
                      ? 'bg-gradient-to-br from-purple-50 via-fuchsia-50/70 to-pink-50 border-purple-200 text-purple-950 shadow-sm'
                      : 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                    : isPro
                    ? isLight
                      ? 'bg-gradient-to-br from-amber-50 via-yellow-50/70 to-orange-50 border-amber-200 text-amber-950 shadow-sm'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isLight ? 'text-slate-600' : 'opacity-75'
                      }`}
                    >
                      {isVi ? 'Gói quyền lợi tài khoản' : 'Account Subscription'}
                    </span>
                    <h4
                      className={`font-bold text-base mt-0.5 flex items-center gap-2 ${
                        isLight
                          ? isFamily
                            ? 'text-purple-950 font-black'
                            : isPro
                            ? 'text-amber-950 font-black'
                            : 'text-slate-900'
                          : ''
                      }`}
                    >
                      {isFamily && <Sparkles className="w-4 h-4 text-purple-500" />}
                      {isPro && <Crown className="w-4 h-4 text-amber-500" />}
                      <span>
                        {isFamily
                          ? isVi
                            ? 'Gói Family Elite (Gia đình)'
                            : 'Family Elite Plan'
                          : isPro
                          ? isVi
                            ? 'Gói Pro VIP (Cá nhân)'
                            : 'Pro VIP Plan'
                          : isVi
                          ? 'Gói Miễn Phí (Free Edition)'
                          : 'Free Edition'}
                      </span>
                    </h4>
                  </div>
                  {isFree && (
                    <button
                      onClick={handleUpgradeClick}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                    >
                      {isVi ? 'Nâng cấp ngay' : 'Upgrade Now'}
                    </button>
                  )}
                </div>

                <div
                  className={`mt-3 pt-3 border-t text-xs space-y-2 ${
                    isLight ? 'border-slate-200' : 'border-slate-700/40'
                  }`}
                >
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                      {isVi ? 'Trạng thái:' : 'Status:'}
                    </span>
                    <span className="text-teal-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                      {isVi ? 'Đang hoạt động' : 'Active'}
                    </span>
                  </div>

                  {/* Privileges */}
                  <div className="flex items-center justify-between">
                    <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                      {isVi ? 'Quyền hạn:' : 'Privileges:'}
                    </span>
                    <span
                      className={`font-medium ${
                        isLight ? 'text-slate-800' : 'text-slate-200'
                      }`}
                    >
                      {isFamily
                        ? isVi
                          ? 'Full AI 3D + 5 Thiết bị cùng lúc'
                          : 'Full 3D AI + 5 Concurrent Devices'
                        : isPro
                        ? isVi
                          ? 'Full AI 3D + Cảnh báo nâng cao'
                          : 'Full 3D AI + Advanced Alerts'
                        : isVi
                        ? 'Cảnh báo tư thế cơ bản'
                        : 'Basic Posture Alerts'}
                    </span>
                  </div>

                  {/* Subscription Duration / Expiration */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex items-center gap-1 ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-teal-500" />
                      <span>{isVi ? 'Thời hạn:' : 'Duration:'}</span>
                    </span>
                    <span
                      className={`font-semibold ${
                        isFamily
                          ? isLight
                            ? 'text-purple-900 font-bold'
                            : 'text-purple-300'
                          : isPro
                          ? isLight
                            ? 'text-amber-900 font-bold'
                            : 'text-amber-300'
                          : isLight
                          ? 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                    >
                      {getSubscriptionDuration()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Security Tab - Change Password */
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label
                  className={`block text-xs font-semibold mb-1 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {isVi ? 'Mật khẩu hiện tại' : 'Current Password'}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={
                    isVi ? 'Nhập mật khẩu đang dùng...' : 'Enter your current password...'
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none border transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500'
                      : 'bg-slate-800/80 border-slate-700 text-slate-100 focus:border-teal-400'
                  }`}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-semibold mb-1 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {isVi ? 'Mật khẩu mới' : 'New Password'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isVi ? 'Ít nhất 4 ký tự...' : 'At least 4 characters...'}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none border transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500'
                      : 'bg-slate-800/80 border-slate-700 text-slate-100 focus:border-teal-400'
                  }`}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-semibold mb-1 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {isVi ? 'Xác nhận mật khẩu mới' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={
                    isVi ? 'Nhập lại mật khẩu mới...' : 'Re-enter your new password...'
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none border transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500'
                      : 'bg-slate-800/80 border-slate-700 text-slate-100 focus:border-teal-400'
                  }`}
                  required
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-60"
                >
                  {loading
                    ? isVi
                      ? 'Đang cập nhật...'
                      : 'Updating...'
                    : isVi
                    ? 'Xác nhận đổi mật khẩu'
                    : 'Confirm Password Change'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 px-6 border-t flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{isVi ? 'Đăng xuất' : 'Sign Out'}</span>
          </button>
          <button
            onClick={closeProfileModal}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
