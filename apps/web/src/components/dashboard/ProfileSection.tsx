'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Shield,
  Crown,
  Sparkles,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  KeyRound,
  Laptop,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

export function ProfileSection() {
  const { user, token, updateUser } = useAuth();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [copiedId, setCopiedId] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Password modal/state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSavingName(true);
    setMsg(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser({ name: nameInput.trim() });
        setIsEditingName(false);
        setMsg({ text: isVi ? 'Cập nhật tên thành công!' : 'Name updated successfully!', isError: false });
      } else {
        setMsg({ text: data.error || 'Cập nhật thất bại', isError: true });
      }
    } catch {
      setMsg({ text: 'Lỗi kết nối máy chủ', isError: true });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setMsg(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowPasswordChange(false);
        setCurrentPassword('');
        setNewPassword('');
        alert(isVi ? 'Đổi mật khẩu tài khoản thành công!' : 'Password changed successfully!');
      } else {
        setMsg({ text: data.error || 'Đổi mật khẩu thất bại', isError: true });
      }
    } catch {
      setMsg({ text: 'Lỗi kết nối máy chủ', isError: true });
    } finally {
      setSavingPassword(false);
    }
  };

  const tier = user.subscription?.tier || 'FREE';
  const expiresAt = user.subscription?.expiresAt;
  const isLifetime = expiresAt && expiresAt > Date.now() + 10 * 365 * 86400 * 1000;
  const expiryText = isLifetime
    ? (isVi ? 'Trọn Đời (Lifetime VIP)' : 'Lifetime VIP')
    : expiresAt
    ? new Date(expiresAt).toLocaleDateString('vi-VN')
    : (isVi ? 'Không thời hạn (Gói miễn phí)' : 'Standard Free');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
            msg.isError
              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {msg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* 1. Account Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            {(user.name || user.email || 'E').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {user.name || user.email.split('@')[0]}
              </h2>
              {user.role === 'ADMIN' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-purple-500 text-white">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400 font-mono">ID: {user.id.slice(0, 14)}...</span>
              <button
                onClick={handleCopyId}
                className="text-slate-400 hover:text-cyan-500 transition p-1"
                title="Copy ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsEditingName(!isEditingName)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {isEditingName ? (isVi ? 'Hủy sửa tên' : 'Cancel') : (isVi ? 'Đổi Tên' : 'Edit Name')}
          </button>
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-500" />
            <span>{isVi ? 'Đổi Mật Khẩu' : 'Change Password'}</span>
          </button>
        </div>
      </div>

      {/* Edit Name Inline Form */}
      {isEditingName && (
        <form onSubmit={handleUpdateName} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            required
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder={isVi ? 'Nhập tên hiển thị mới...' : 'Enter your name...'}
            className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={savingName}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-2"
          >
            {savingName && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isVi ? 'Lưu Thay Đổi' : 'Save'}</span>
          </button>
        </form>
      )}

      {/* Change Password Inline Form */}
      {showPasswordChange && (
        <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-cyan-500" />
            <span>{isVi ? 'Thay Đổi Mật Khẩu Tài Khoản' : 'Change Account Password'}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{isVi ? 'Mật khẩu hiện tại:' : 'Current password:'}</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{isVi ? 'Mật khẩu mới (ít nhất 4 ký tự):' : 'New password:'}</label>
              <input
                type="password"
                required
                minLength={4}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2"
          >
            {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isVi ? 'Cập Nhật Mật Khẩu' : 'Update Password'}</span>
          </button>
        </form>
      )}

      {/* 2. Subscription Status & License Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subscription Plan Status */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-400">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{isVi ? 'Gói Dịch Vụ Của Bạn' : 'Your License'}</span>
                  <h3 className="text-2xl font-black text-amber-400">
                    {tier === 'FAMILY' ? 'FAMILY VIP' : tier === 'PRO' ? 'PRO VIP' : 'FREE TIER'}
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>{isVi ? 'Thời hạn bản quyền:' : 'Expires at:'}</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{expiryText}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>{isVi ? 'Quyền lợi AI On-Device:' : 'AI Processing:'}</span>
                <span className="font-bold text-emerald-400">
                  {tier === 'FREE' ? (isVi ? '2 tiếng/ngày' : '2 hours/day') : (isVi ? 'Không giới hạn 24/7' : 'Unlimited 24/7')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
            <a
              href="/#pricing"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:from-amber-300 hover:to-orange-400 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{tier === 'FREE' ? (isVi ? 'Nâng Cấp VIP Ngay' : 'Upgrade VIP') : (isVi ? 'Gia Hạn Bản Quyền' : 'Renew')}</span>
            </a>
            <span className="text-[11px] text-slate-400">
              {isVi ? 'Thanh toán tự động qua SePay' : 'Automated QR SePay'}
            </span>
          </div>
        </div>

        {/* Desktop App Activation Sync Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isVi ? 'Đồng Bộ Bản Quyền Lên Máy Tính' : 'Activate On Windows App'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isVi ? 'Cài đặt và đăng nhập trên Windows' : 'Install & sign in on desktop'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <span>
                  {isVi
                    ? '1. Tải và cài đặt ứng dụng EyePosture Desktop (.exe) phiên bản v1.2.0 mới nhất.'
                    : '1. Download & install EyePosture Desktop v1.2.0.'}
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <span>
                  {isVi
                    ? `2. Đăng nhập bằng tài khoản email này (${user.email}) trên app Desktop.`
                    : `2. Sign in with (${user.email}) on your desktop app.`}
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <span>
                  {isVi
                    ? '3. Hệ thống sẽ tự động kích hoạt giấy phép bản quyền Pro/Family ngay tức thì.'
                    : '3. License automatically activates with zero manual key entry.'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <a
              href="/api/download"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1.5 shadow-md shadow-cyan-600/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isVi ? 'Tải EyePosture (.exe)' : 'Download .exe'}</span>
            </a>
            <span className="text-[11px] text-slate-400">Windows 10 / 11 64-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
