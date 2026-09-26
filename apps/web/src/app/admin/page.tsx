'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminStats } from '@/components/admin/admin-stats';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { UsersTable } from '@/components/admin/users-table';
import { DevicesTable } from '@/components/admin/devices-table';
import { VoucherManager } from '@/components/admin/voucher-manager';
import { PricingManager } from '@/components/admin/pricing-manager';
import { UserProfile, DeviceItem, VoucherItem, SubscriptionTier } from '@/lib/types';
import {
  LayoutDashboard,
  Users,
  Laptop,
  Ticket,
  CreditCard,
  RefreshCw,
  ArrowLeft,
  X,
  User as UserIcon,
  Sparkles
} from 'lucide-react';

export default function AdminPage() {
  const { user, login, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const isVi = language === 'vi';

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'DEVICES' | 'VOUCHERS' | 'PLANS'>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin login form states if not logged in as admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Data states
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [uRes, dRes, vRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/devices'),
        fetch('/api/vouchers'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData.users || []);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDevices(dData.devices || []);
      }
      if (vRes.ok) {
        const vData = await vRes.json();
        setVouchers(vData.vouchers || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng nhập quản trị viên thất bại');

      if (data.user.role !== 'ADMIN') {
        throw new Error('Tài khoản này không có quyền truy cập trang quản trị');
      }

      login(data.token, data.user);
      fetchData();
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // User Actions
  const handleToggleBlockUser = async (userId: string, isBlocked: boolean) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'block', userId, isBlocked }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBlocked, status: isBlocked ? 'BLOCKED' : 'ACTIVE' } : u))
      );
    }
  };

  const handleUpgradeUser = async (userId: string, tier: SubscriptionTier) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upgrade', userId, tier }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
              ...u,
              subscription: { tier, status: 'ACTIVE', expiresAt: Date.now() + 365 * 86400 * 1000 },
            }
            : u
        )
      );
    }
  };

  // Device Actions
  const handleToggleBlockDevice = async (deviceId: string, isBlocked: boolean) => {
    const res = await fetch('/api/admin/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, isBlocked }),
    });
    if (res.ok) {
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, isBlocked, status: isBlocked ? 'BLOCKED' : 'ACTIVE' } : d))
      );
    }
  };

  // Voucher Actions
  const handleCreateVoucher = async (data: { code: string; discountPercent: number; daysValid: number }) => {
    const res = await fetch('/api/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi khi tạo voucher');
    setVouchers((prev) => [result.voucher, ...prev]);
  };

  const handleToggleVoucher = async (id: string, isActive: boolean) => {
    const res = await fetch('/api/vouchers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive }),
    });
    if (res.ok) {
      setVouchers((prev) => prev.map((v) => (v.id === id ? { ...v, isActive } : v)));
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return;
    const res = await fetch(`/api/vouchers?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      setVouchers((prev) => prev.filter((v) => v.id !== id));
    }
  };

  // If not logged in as Admin, show login barrier
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <div className="w-full max-w-sm p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl text-center">
          <img
            src="/EyePosture.png"
            alt="EyePosture Logo"
            className="w-14 h-14 rounded-2xl object-contain mx-auto shadow-xl shadow-cyan-500/20 mb-2"
          />
          <div>
            <h2 className="text-xl font-extrabold text-white">Xác Thực Quản Trị Viên</h2>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-left">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tài khoản Quản trị</label>
              <input
                type="text"
                required
                placeholder="Enter username"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition disabled:opacity-50"
            >
              {loginLoading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-cyan-400 transition inline-flex items-center gap-1"
              >
                ← Quay lại trang chủ
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const proCount = users.filter((u) => u.subscription?.tier === 'PRO' || u.subscription?.tier === 'FAMILY').length;

  const getTabTitle = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return isVi ? 'Dashboard & Thống Kê Phân Tích' : 'Analytics & Revenue Dashboard';
      case 'USERS':
        return isVi ? 'Quản Lý Người Dùng' : 'User Management';
      case 'DEVICES':
        return isVi ? 'Quản Lý Thiết Bị Kết Nối' : 'Connected Devices';
      case 'VOUCHERS':
        return isVi ? 'Quản Lý Voucher Khuyến Mãi' : 'Voucher Management';
      case 'PLANS':
        return isVi ? 'Quản Lý Gói & Bảng Giá' : 'Subscription Plans';
    }
  };

  // Reusable Sidebar Nav Content
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4 space-y-6">
      {/* Brand Header & Back to Website */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/EyePosture.png"
              alt="EyePosture Logo"
              className="w-8 h-8 rounded-xl object-contain shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
                EyePosture
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Admin Hub</span>
            </div>
          </Link>

          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menu Quản Trị
          </div>

          {/* 1. Dashboard Tab */}
          <button
            onClick={() => {
              setActiveTab('DASHBOARD');
              setMobileMenuOpen(false);
            }}
            className={`btn-tactile w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'DASHBOARD'
                ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>{isVi ? 'Dashboard Phân Tích' : 'Analytics Dashboard'}</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'DASHBOARD'
                  ? 'bg-white/20 text-white'
                  : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
              }`}
            >
              LIVE
            </span>
          </button>

          {/* 2. Users Tab */}
          <button
            onClick={() => {
              setActiveTab('USERS');
              setMobileMenuOpen(false);
            }}
            className={`btn-tactile w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'USERS'
                ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 shrink-0" />
              <span>{t('admin_users_tab')}</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'USERS'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {users.length}
            </span>
          </button>

          {/* 3. Devices Tab */}
          <button
            onClick={() => {
              setActiveTab('DEVICES');
              setMobileMenuOpen(false);
            }}
            className={`btn-tactile w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'DEVICES'
                ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Laptop className="w-4 h-4 shrink-0" />
              <span>{t('admin_devices_tab')}</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'DEVICES'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {devices.length}
            </span>
          </button>

          {/* 4. Vouchers Tab */}
          <button
            onClick={() => {
              setActiveTab('VOUCHERS');
              setMobileMenuOpen(false);
            }}
            className={`btn-tactile w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'VOUCHERS'
                ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Ticket className="w-4 h-4 shrink-0" />
              <span>{t('admin_vouchers_tab')}</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'VOUCHERS'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {vouchers.length}
            </span>
          </button>

          {/* 5. Plans & Pricing Tab */}
          <button
            onClick={() => {
              setActiveTab('PLANS');
              setMobileMenuOpen(false);
            }}
            className={`btn-tactile w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'PLANS'
                ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Gói & Bảng giá</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'PLANS' ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-500 dark:text-amber-400'
              }`}
            >
              DB
            </span>
          </button>
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        {/* Quick Sync Button */}
        <button
          onClick={() => {
            setRefreshing(true);
            fetchData();
          }}
          disabled={refreshing}
          className="btn-tactile w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{t('admin_sync_btn')}</span>
        </button>

        {/* Current Admin Account Card */}
        {user && (
          <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user.name || 'Admin'}
              </span>
              <span className="text-[10px] text-slate-400 truncate font-mono">
                {user.email}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* 1. LEFT SIDEBAR: Bám sát hẳn mép trái màn hình (Full-height sticky sidebar) */}
      <aside className="w-64 xl:w-72 shrink-0 min-h-screen border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 h-screen z-20 overflow-y-auto hidden lg:block">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Menu (Sliding Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* 2. RIGHT AREA: Chiếm toàn bộ phần còn lại (flex-1 min-w-0) */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <AdminHeader
          activeTabTitle={getTabTitle()}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {loading ? (
            <div className="py-24 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
              <span>Đang đồng bộ dữ liệu thời gian thực từ Supabase...</span>
            </div>
          ) : (
            <div className="space-y-8">
              {/* TAB 1: DASHBOARD & BIỂU ĐỒ PHÂN TÍCH DOANH THU / NGƯỜI DÙNG */}
              {activeTab === 'DASHBOARD' && (
                <AnalyticsDashboard
                  users={users}
                  devices={devices}
                  vouchers={vouchers}
                />
              )}

              {/* TAB 2: QUẢN LÝ NGƯỜI DÙNG */}
              {activeTab === 'USERS' && (
                <div className="space-y-8">
                  <AdminStats
                    userCount={users.length}
                    deviceCount={devices.length}
                    proCount={proCount}
                    voucherCount={vouchers.length}
                  />
                  <UsersTable
                    users={users}
                    onToggleBlock={handleToggleBlockUser}
                    onUpgradeTier={handleUpgradeUser}
                  />
                </div>
              )}

              {/* TAB 3: QUẢN LÝ THIẾT BỊ */}
              {activeTab === 'DEVICES' && (
                <div className="space-y-8">
                  <AdminStats
                    userCount={users.length}
                    deviceCount={devices.length}
                    proCount={proCount}
                    voucherCount={vouchers.length}
                  />
                  <DevicesTable devices={devices} onToggleBlock={handleToggleBlockDevice} />
                </div>
              )}

              {/* TAB 4: QUẢN LÝ VOUCHER */}
              {activeTab === 'VOUCHERS' && (
                <div className="space-y-8">
                  <AdminStats
                    userCount={users.length}
                    deviceCount={devices.length}
                    proCount={proCount}
                    voucherCount={vouchers.length}
                  />
                  <VoucherManager
                    vouchers={vouchers}
                    onCreateVoucher={handleCreateVoucher}
                    onToggleVoucher={handleToggleVoucher}
                    onDeleteVoucher={handleDeleteVoucher}
                  />
                </div>
              )}

              {/* TAB 5: GÓI & BẢNG GIÁ */}
              {activeTab === 'PLANS' && <PricingManager />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
