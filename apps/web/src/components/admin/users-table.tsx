'use client';

import React, { useState } from 'react';
import { UserProfile, SubscriptionTier } from '@/lib/types';
import { Search, ShieldAlert, ShieldCheck, ArrowUpRight, Crown, Laptop } from 'lucide-react';

interface UsersTableProps {
  users: UserProfile[];
  onToggleBlock: (userId: string, isBlocked: boolean) => Promise<void>;
  onUpgradeTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
}

export function UsersTable({ users, onToggleBlock, onUpgradeTier }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | SubscriptionTier>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || u.subscription?.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleBlock = async (userId: string, currentBlocked: boolean) => {
    setActionLoading(userId);
    try {
      await onToggleBlock(userId, !currentBlocked);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = async (userId: string, nextTier: SubscriptionTier) => {
    setActionLoading(userId);
    try {
      await onUpgradeTier(userId, nextTier);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {(['ALL', 'FREE', 'PRO', 'FAMILY'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                tierFilter === t
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-100 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
              }`}
            >
              {t === 'ALL' ? 'Tất Cả' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-50 text-slate-400 dark:text-slate-400 light:text-slate-500 font-semibold">
              <th className="py-3.5 px-4">Người Dùng</th>
              <th className="py-3.5 px-4">Vai Trò</th>
              <th className="py-3.5 px-4">Gói Bản Quyền</th>
              <th className="py-3.5 px-4 text-center">Thiết Bị</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 dark:divide-slate-800/60 light:divide-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Không tìm thấy người dùng phù hợp
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const tier = u.subscription?.tier || 'FREE';
                const isBlocked = Boolean(u.isBlocked || u.status === 'BLOCKED');
                const isLoading = actionLoading === u.id;

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-800/30 dark:hover:bg-slate-800/30 light:hover:bg-slate-50 transition"
                  >
                    {/* User Identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                          {u.name ? u.name[0] : u.email[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-white dark:text-white light:text-slate-900">
                            {u.name || 'Người Dùng'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      {u.role === 'ADMIN' ? (
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md font-medium text-[10px] uppercase bg-slate-800 text-slate-400 light:bg-slate-100 light:text-slate-600">
                          Khách Hàng
                        </span>
                      )}
                    </td>

                    {/* Subscription */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            tier === 'FAMILY'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : tier === 'PRO'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-800 text-slate-400 light:bg-slate-100 light:text-slate-600'
                          }`}
                        >
                          {tier}
                        </span>
                      </div>
                    </td>

                    {/* Devices */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 text-slate-400">
                        <Laptop className="w-3.5 h-3.5" />
                        <span>{u.deviceCount ?? 0}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <ShieldAlert className="w-3 h-3" />
                          Đã Khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          Hoạt Động
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {/* Upgrade dropdown or quick button */}
                      {tier !== 'FAMILY' && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleUpgrade(u.id, tier === 'FREE' ? 'PRO' : 'FAMILY')}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold text-[11px] transition disabled:opacity-50"
                          title="Nâng cấp gói tài khoản"
                        >
                          Nâng {tier === 'FREE' ? 'Pro' : 'Family'}
                        </button>
                      )}

                      {/* Block / Unblock */}
                      {u.role !== 'ADMIN' && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleBlock(u.id, isBlocked)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border disabled:opacity-50 ${
                            isBlocked
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {isBlocked ? 'Mở Khóa' : 'Khóa'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
