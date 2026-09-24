'use client';

import React from 'react';
import { Users, Laptop, Crown, Ticket } from 'lucide-react';

interface StatsProps {
  userCount: number;
  deviceCount: number;
  proCount: number;
  voucherCount: number;
}

export function AdminStats({ userCount, deviceCount, proCount, voucherCount }: StatsProps) {
  const cards = [
    {
      label: 'Tổng Người Dùng',
      value: userCount,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      badge: 'Tài khoản',
    },
    {
      label: 'Thiết Bị Kết Nối',
      value: deviceCount,
      icon: Laptop,
      color: 'from-cyan-500 to-emerald-500',
      badge: 'Desktop Clients',
    },
    {
      label: 'Gói Bản Quyền Pro/Family',
      value: proCount,
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      badge: 'Đang kích hoạt',
    },
    {
      label: 'Voucher Khuyến Mãi',
      value: voucherCount,
      icon: Ticket,
      color: 'from-amber-500 to-orange-500',
      badge: 'Mã giảm giá',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-400 light:text-slate-500 block mb-1">
                {c.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white dark:text-white light:text-slate-900">
                  {c.value}
                </span>
                <span className="text-[10px] text-slate-500">{c.badge}</span>
              </div>
            </div>
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${c.color} flex items-center justify-center text-white shadow-md`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
