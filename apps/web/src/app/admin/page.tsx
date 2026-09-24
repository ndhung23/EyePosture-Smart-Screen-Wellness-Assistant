'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminStats } from '@/components/admin/admin-stats';
import { UsersTable } from '@/components/admin/users-table';
import { DevicesTable } from '@/components/admin/devices-table';
import { VoucherManager } from '@/components/admin/voucher-manager';
import { UserProfile, DeviceItem, VoucherItem, SubscriptionTier } from '@/lib/types';
import { Users, Laptop, Ticket, Lock, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const { user, login, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'USERS' | 'DEVICES' | 'VOUCHERS'>('USERS');

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
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Xác Thực Quản Trị Viên</h2>
            <p className="text-xs text-slate-400 mt-1">Cổng truy cập cơ sở dữ liệu Supabase & Quản lý bản quyền</p>
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
                placeholder="admin"
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

            <p className="text-[11px] text-slate-500 text-center">
              (Mặc định: <strong>admin</strong> / mật khẩu: <strong>1</strong>)
            </p>
          </form>
        </div>
      </div>
    );
  }

  const proCount = users.filter((u) => u.subscription?.tier === 'PRO' || u.subscription?.tier === 'FAMILY').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Summary Stats */}
        <AdminStats
          userCount={users.length}
          deviceCount={devices.length}
          proCount={proCount}
          voucherCount={vouchers.length}
        />

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-4">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-200 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                activeTab === 'USERS'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 light:text-slate-700 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('admin_users_tab')} ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('DEVICES')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                activeTab === 'DEVICES'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 light:text-slate-700 hover:text-white'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>{t('admin_devices_tab')} ({devices.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('VOUCHERS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                activeTab === 'VOUCHERS'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 light:text-slate-700 hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>{t('admin_vouchers_tab')} ({vouchers.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              setRefreshing(true);
              fetchData();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/60 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{t('admin_sync_btn')}</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">Đang tải dữ liệu từ Supabase...</div>
        ) : (
          <div>
            {activeTab === 'USERS' && (
              <UsersTable
                users={users}
                onToggleBlock={handleToggleBlockUser}
                onUpgradeTier={handleUpgradeUser}
              />
            )}

            {activeTab === 'DEVICES' && (
              <DevicesTable devices={devices} onToggleBlock={handleToggleBlockDevice} />
            )}

            {activeTab === 'VOUCHERS' && (
              <VoucherManager
                vouchers={vouchers}
                onCreateVoucher={handleCreateVoucher}
                onToggleVoucher={handleToggleVoucher}
                onDeleteVoucher={handleDeleteVoucher}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
