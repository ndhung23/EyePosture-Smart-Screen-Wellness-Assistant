'use client';

import React, { useState } from 'react';
import { UserProfile, SubscriptionTier } from '@/lib/types';
import {
  X,
  Copy,
  Check,
  Crown,
  Calendar,
  Clock,
  Laptop,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Receipt,
  Layers,
  Info
} from 'lucide-react';

interface UserDetailModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleBlock: (userId: string, isBlocked: boolean) => Promise<void>;
  onUpgradeTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
}

export function UserDetailModal({
  user,
  isOpen,
  onClose,
  onToggleBlock,
  onUpgradeTier,
}: UserDetailModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BILLING' | 'DEVICES'>('OVERVIEW');
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleCopyId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const isBlocked = Boolean(user.isBlocked || user.status === 'BLOCKED');
  const tier = user.subscription?.tier || 'FREE';
  const expiresAt = user.subscription?.expiresAt;

  // Format dates
  const formatDate = (val?: string | number | null) => {
    if (!val) return '—';
    try {
      const d = typeof val === 'number' ? new Date(val) : new Date(val);
      if (isNaN(d.getTime())) return '—';
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return '—';
    }
  };

  // Calculate duration remaining
  const calculateDuration = () => {
    if (tier === 'FREE') {
      return { text: 'Miễn phí vô thời hạn', type: 'free', daysLeft: null };
    }
    if (!expiresAt) {
      return { text: 'Không xác định', type: 'neutral', daysLeft: null };
    }

    const now = Date.now();
    const diffMs = expiresAt - now;

    // Check if admin / lifetime (> 5 years)
    if (diffMs > 5 * 365 * 86400 * 1000) {
      return { text: 'Vô thời hạn (Đặc quyền VIP)', type: 'lifetime', daysLeft: 9999 };
    }

    if (diffMs <= 0) {
      return { text: 'Đã hết hạn', type: 'expired', daysLeft: 0 };
    }

    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return {
      text: `Còn lại ${daysLeft} ngày`,
      type: daysLeft > 30 ? 'healthy' : daysLeft > 7 ? 'warning' : 'critical',
      daysLeft,
    };
  };

  const durationInfo = calculateDuration();

  // Format currency VND
  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleBlockAction = async () => {
    setActionLoading(true);
    try {
      await onToggleBlock(user.id, !isBlocked);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgradeAction = async (targetTier: SubscriptionTier) => {
    setActionLoading(true);
    try {
      await onUpgradeTier(user.id, targetTier);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 text-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-cyan-500/20 uppercase shrink-0">
              {user.name ? user.name[0] : user.email[0]}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{user.name || 'Người Dùng'}</h2>

                {/* Role Badge */}
                {user.role === 'ADMIN' ? (
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md font-medium text-[10px] uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    Khách Hàng
                  </span>
                )}

                {/* Status Badge */}
                {isBlocked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    <ShieldAlert className="w-3 h-3" />
                    Đã Khóa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Hoạt Động
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                <span>{user.email}</span>
                <span className="text-slate-600">•</span>
                <button
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-cyan-400 transition"
                  title="Sao chép User ID"
                >
                  <span>{user.id}</span>
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Đóng modal (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Subscription Tier */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Gói Bản Quyền</span>
              <Crown className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-base font-extrabold uppercase ${
                  tier === 'FAMILY'
                    ? 'text-purple-400'
                    : tier === 'PRO'
                    ? 'text-cyan-400'
                    : 'text-slate-300'
                }`}
              >
                {tier}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">• Active</span>
            </div>
          </div>

          {/* Card 2: Duration */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Thời Gian Dùng</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-sm font-bold text-white truncate" title={durationInfo.text}>
              {durationInfo.text}
            </div>
          </div>

          {/* Card 3: Total Spent / Revenue */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Tổng Chi Tiêu</span>
              <Receipt className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-emerald-400 truncate">
              {formatCurrency(user.totalSpent || 0)}
            </div>
          </div>

          {/* Card 4: Devices Connected */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Thiết Bị</span>
              <Laptop className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-bold text-white">
              {user.deviceCount || 0} Thiết bị
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-900">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-3 px-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'OVERVIEW'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Thông Tin & Bản Quyền
          </button>

          <button
            onClick={() => setActiveTab('BILLING')}
            className={`pb-3 px-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'BILLING'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Lịch Sử Giao Dịch ({user.orders?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('DEVICES')}
            className={`pb-3 px-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'DEVICES'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Thiết Bị Kết Nối ({user.devices?.length || 0})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Detailed Info Grid */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  Hồ Sơ Tài Khoản Chi Tiết
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-slate-500 mb-1">Mã Định Danh (UUID)</div>
                    <div className="font-mono text-slate-200 break-all">{user.id}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-slate-500 mb-1">Email Đăng Ký</div>
                    <div className="font-mono text-slate-200">{user.email}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-slate-500 mb-1">Tên Hiển Thị</div>
                    <div className="font-medium text-slate-200">{user.name || 'Chưa cập nhật'}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-slate-500 mb-1">Vai Trò Hệ Thống</div>
                    <div className="font-medium text-slate-200">{user.role === 'ADMIN' ? 'Quản Trị Viên (Full Access)' : 'Người Dùng Tiêu Chuẩn (User)'}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-slate-500 mb-1">Ngày Đăng Ký (Created At)</div>
                    <div className="font-medium text-slate-200">{formatDate(user.createdAt)}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-slate-500 mb-1">Cập Nhật Gần Nhất (Updated At)</div>
                    <div className="font-medium text-slate-200">{formatDate(user.updatedAt || user.createdAt)}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Subscription Timeline */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Chi Tiết Chu Kỳ & Hạn Sử Dụng
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-slate-500 mb-1">Gói Cước Đang Sử Dụng</div>
                    <div className="font-bold text-purple-300 text-sm">{tier}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-slate-500 mb-1">Ngày Hết Hạn Bản Quyền</div>
                    <div className="font-medium text-slate-200">
                      {tier === 'FREE'
                        ? 'Không có ngày hết hạn'
                        : durationInfo.type === 'lifetime'
                        ? 'Vô thời hạn (Lifetime)'
                        : formatDate(expiresAt)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-slate-500 mb-1">Tình Trạng Hạn Dùng</div>
                    <div className="font-semibold text-emerald-400">{durationInfo.text}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BILLING & ORDERS */}
          {activeTab === 'BILLING' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Lịch Sử Giao Dịch & Đơn Hàng</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Các hóa đơn thanh toán đã phát sinh qua hệ thống và cổng thanh toán tự động SePay
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Tổng Doanh Thu</div>
                  <div className="text-sm font-extrabold text-emerald-400">
                    {formatCurrency(user.totalSpent || 0)}
                  </div>
                </div>
              </div>

              {(!user.orders || user.orders.length === 0) ? (
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/20">
                  <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <div className="font-semibold text-slate-300 text-xs">Chưa có giao dịch trực tiếp nào</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                    Người dùng này chưa tạo đơn hàng trực tuyến hoặc gói được kích hoạt từ tài khoản Quản trị viên nội bộ.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <th className="py-2.5 px-3">Mã Đơn Hàng</th>
                        <th className="py-2.5 px-3">Gói & Chu Kỳ</th>
                        <th className="py-2.5 px-3">Số Tiền</th>
                        <th className="py-2.5 px-3">Trạng Thái</th>
                        <th className="py-2.5 px-3">Thời Gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {user.orders.map((ord) => (
                        <tr key={ord.orderCode} className="hover:bg-slate-850/50">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-cyan-400">{ord.orderCode}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-white">{ord.tier}</span> ({ord.interval})
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-400">{formatCurrency(ord.amount)}</td>
                          <td className="py-2.5 px-3">
                            {ord.status === 'PAID' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                Đã Thanh Toán
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                                {ord.status}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{formatDate(ord.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEVICES */}
          {activeTab === 'DEVICES' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white">Thiết Bị Đang Kết Nối</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Danh sách máy tính người dùng đã cài đặt ứng dụng EyePosture Desktop Client
                </p>
              </div>

              {(!user.devices || user.devices.length === 0) ? (
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/20">
                  <Laptop className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <div className="font-semibold text-slate-300 text-xs">Chưa có thiết bị nào kích hoạt</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                    Người dùng chưa cài đặt và đăng nhập ứng dụng trên máy tính cá nhân.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {user.devices.map((dev) => (
                    <div
                      key={dev.id}
                      className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{dev.deviceName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            OS: {dev.os} • App: {dev.appVersion}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-slate-500">Hoạt động gần nhất</div>
                        <div className="text-xs text-slate-300">{formatDate(dev.lastActiveAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Upgrade buttons */}
            {tier !== 'FAMILY' && (
              <button
                disabled={actionLoading}
                onClick={() => handleUpgradeAction(tier === 'FREE' ? 'PRO' : 'FAMILY')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Nâng Lên {tier === 'FREE' ? 'PRO' : 'FAMILY'}
              </button>
            )}

            {/* Block / Unblock */}
            {user.role !== 'ADMIN' && (
              <button
                disabled={actionLoading}
                onClick={handleBlockAction}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border disabled:opacity-50 flex items-center gap-1.5 ${
                  isBlocked
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                }`}
              >
                {isBlocked ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Mở Khóa Tài Khoản
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Khóa Tài Khoản
                  </>
                )}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
