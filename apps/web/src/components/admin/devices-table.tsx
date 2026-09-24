'use client';

import React, { useState } from 'react';
import { DeviceItem } from '@/lib/types';
import { Laptop, ShieldCheck, ShieldAlert, Clock, Search } from 'lucide-react';

interface DevicesTableProps {
  devices: DeviceItem[];
  onToggleBlock: (deviceId: string, isBlocked: boolean) => Promise<void>;
}

export function DevicesTable({ devices, onToggleBlock }: DevicesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = devices.filter((d) => {
    return (
      d.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.deviceFingerprint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleBlock = async (id: string, currentBlocked: boolean) => {
    setActionLoading(id);
    try {
      await onToggleBlock(id, !currentBlocked);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm máy tính, mã máy, người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-50 text-slate-400 dark:text-slate-400 light:text-slate-500 font-semibold">
              <th className="py-3.5 px-4">Thiết Bị / Máy Trạm</th>
              <th className="py-3.5 px-4">Chủ Sở Hữu</th>
              <th className="py-3.5 px-4">Hệ Điều Hành & Phiên Bản</th>
              <th className="py-3.5 px-4">Hoạt Động Gần Nhất</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 dark:divide-slate-800/60 light:divide-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Chưa có thiết bị máy tính nào kết nối
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const isBlocked = Boolean(d.isBlocked || d.status === 'BLOCKED');
                const isLoading = actionLoading === d.id;

                return (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-800/30 dark:hover:bg-slate-800/30 light:hover:bg-slate-50 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white dark:text-white light:text-slate-900">
                            {d.deviceName || 'Desktop Client'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono tracking-tight">
                            {d.deviceFingerprint}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-medium">
                        {d.userName || 'Chưa gán'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {d.userEmail || 'Chưa liên kết tài khoản'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-300 dark:text-slate-300 light:text-slate-700">
                        {d.os || 'Windows 11'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        v{d.appVersion || '1.0.0'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          {d.lastActiveAt
                            ? new Date(d.lastActiveAt).toLocaleString('vi-VN')
                            : 'Mới kết nối'}
                        </span>
                      </div>
                    </td>

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

                    <td className="py-3 px-4 text-right">
                      <button
                        disabled={isLoading}
                        onClick={() => handleBlock(d.id, isBlocked)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border disabled:opacity-50 ${
                          isBlocked
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                      >
                        {isBlocked ? 'Mở Khóa' : 'Khóa Máy'}
                      </button>
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
