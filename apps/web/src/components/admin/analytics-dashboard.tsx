'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Sparkles,
  Layers,
  PieChart as PieChartIcon,
  CheckCircle2,
  Clock,
  ChevronDown
} from 'lucide-react';
import { UserProfile, DeviceItem, VoucherItem, SubscriptionTier } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface AnalyticsDashboardProps {
  users: UserProfile[];
  devices: DeviceItem[];
  vouchers: VoucherItem[];
}

type DateRange = '7D' | '30D' | '90D' | '1Y';

export function AnalyticsDashboard({ users, devices, vouchers }: AnalyticsDashboardProps) {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Filters State
  const [dateRange, setDateRange] = useState<DateRange>('30D');
  const [tierFilter, setTierFilter] = useState<'ALL' | SubscriptionTier>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [chartMetric, setChartMetric] = useState<'REVENUE' | 'USERS'>('REVENUE');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Filtered Users based on top controls
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (tierFilter !== 'ALL' && u.subscription?.tier !== tierFilter) return false;
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, tierFilter, statusFilter]);

  // Key KPI Computations - Real Data from DB
  const stats = useMemo(() => {
    const totalUsers = users.length || 0;
    const proUsers = users.filter((u) => u.subscription?.tier === 'PRO');
    const familyUsers = users.filter((u) => u.subscription?.tier === 'FAMILY');
    const freeUsers = users.filter((u) => !u.subscription?.tier || u.subscription?.tier === 'FREE');

    // DOANH THU THỰC TẾ: Tổng số tiền từ các hóa đơn đã thanh toán thành công
    const totalRevenue = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);

    // Tính doanh thu theo từng gói từ orders thực tế đã thanh toán (PAID)
    let proRevenue = 0;
    let familyRevenue = 0;
    users.forEach((u) => {
      (u.orders || []).forEach((o) => {
        if (o.status === 'PAID') {
          if (o.tier === 'PRO') proRevenue += o.amount;
          else if (o.tier === 'FAMILY') familyRevenue += o.amount;
        }
      });
    });

    const paidUsersCount = users.filter((u) => (u.totalSpent || 0) > 0).length;
    const conversionRate = totalUsers > 0 ? Math.round((paidUsersCount / totalUsers) * 1000) / 10 : 0;
    const arpu = paidUsersCount > 0 ? Math.round(totalRevenue / paidUsersCount) : 0;
    const mrr = totalRevenue > 0 ? Math.round(totalRevenue / 12) : 0;
    const arr = totalRevenue;

    return {
      totalUsers,
      proCount: proUsers.length,
      familyCount: familyUsers.length,
      freeCount: freeUsers.length,
      totalRevenue,
      proRevenue,
      familyRevenue,
      mrr,
      arr,
      paidUsersCount,
      conversionRate,
      arpu,
    };
  }, [users]);

  // Timeline Data Points based on Real User Registrations & Real Orders
  const timelineData = useMemo(() => {
    // Generate dates based on selected range
    const now = new Date();
    const nowTs = now.getTime();

    // Helper: count users registered before or on a given timestamp
    const countUsersBefore = (ts: number, tier?: SubscriptionTier) => {
      return users.filter((u) => {
        const uTime = u.createdAt ? new Date(u.createdAt).getTime() : 0;
        if (uTime > ts) return false;
        if (tier && u.subscription?.tier !== tier) return false;
        return true;
      }).length;
    };

    // Helper: sum revenue paid before or on a given timestamp
    const sumRevenueBefore = (ts: number, tier?: SubscriptionTier) => {
      let sum = 0;
      users.forEach((u) => {
        (u.orders || []).forEach((o) => {
          if (o.status === 'PAID') {
            const oTime = o.paidAt ? new Date(o.paidAt).getTime() : new Date(o.createdAt).getTime();
            if (oTime <= ts) {
              if (!tier || o.tier === tier) {
                sum += o.amount;
              }
            }
          }
        });
      });
      return sum;
    };

    let dateList: { label: string; ts: number }[] = [];

    if (dateRange === '7D') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(nowTs - i * 86400 * 1000);
        d.setHours(23, 59, 59, 999);
        const dayLabel = `T${d.getDay() === 0 ? 'CN' : d.getDay() + 1} (${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')})`;
        dateList.push({ label: dayLabel, ts: d.getTime() });
      }
    } else if (dateRange === '30D') {
      const step = 5;
      for (let i = 5; i >= 0; i--) {
        const d = new Date(nowTs - i * step * 86400 * 1000);
        d.setHours(23, 59, 59, 999);
        const dayLabel = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        dateList.push({ label: dayLabel, ts: d.getTime() });
      }
    } else if (dateRange === '90D') {
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        dateList.push({ label: `Tháng ${d.getMonth() + 1}`, ts: Math.min(endOfMonth.getTime(), nowTs) });
      }
    } else {
      // 1Y - 4 quarters
      const curQuarter = Math.floor(now.getMonth() / 3) + 1;
      for (let q = 1; q <= 4; q++) {
        const qEndMonth = q * 3;
        const d = new Date(now.getFullYear(), qEndMonth, 0, 23, 59, 59, 999);
        dateList.push({ label: `Q${q}`, ts: Math.min(d.getTime(), nowTs) });
      }
    }

    return dateList.map(({ label, ts }) => {
      const totalU = countUsersBefore(ts);
      const proU = countUsersBefore(ts, 'PRO');
      const famU = countUsersBefore(ts, 'FAMILY');
      const rev = sumRevenueBefore(ts, tierFilter === 'ALL' ? undefined : tierFilter);

      let filteredU = totalU;
      if (tierFilter === 'PRO') filteredU = proU;
      else if (tierFilter === 'FAMILY') filteredU = famU;
      else if (tierFilter === 'FREE') filteredU = countUsersBefore(ts, 'FREE');

      return {
        label,
        revenue: rev,
        users: filteredU,
        pro: proU,
        family: famU,
      };
    });
  }, [dateRange, users, tierFilter]);

  // SVG Chart Dimensions & Math
  const maxVal = useMemo(() => {
    const vals = timelineData.map((d) => (chartMetric === 'REVENUE' ? d.revenue : d.users));
    const highest = Math.max(...vals, 0);
    if (chartMetric === 'REVENUE') {
      return highest > 0 ? highest * 1.2 : 100000;
    }
    return Math.max(highest, 3) * 1.2;
  }, [timelineData, chartMetric]);

  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 40;
  const paddingY = 30;

  const pointsCoordinates = useMemo(() => {
    const usableW = svgWidth - paddingX * 2;
    const usableH = svgHeight - paddingY * 2;
    const count = timelineData.length;

    return timelineData.map((d, i) => {
      const val = chartMetric === 'REVENUE' ? d.revenue : d.users;
      const x = paddingX + (i / (count - 1)) * usableW;
      const y = svgHeight - paddingY - (val / maxVal) * usableH;
      return { x, y, data: d };
    });
  }, [timelineData, chartMetric, maxVal]);

  // Smooth SVG Path String
  const areaPath = useMemo(() => {
    if (pointsCoordinates.length === 0) return { line: '', area: '' };
    const first = pointsCoordinates[0];
    let d = `M ${first.x} ${first.y}`;

    for (let i = 0; i < pointsCoordinates.length - 1; i++) {
      const curr = pointsCoordinates[i];
      const next = pointsCoordinates[i + 1];
      const midX = (curr.x + next.x) / 2;
      d += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }

    const last = pointsCoordinates[pointsCoordinates.length - 1];
    const baselineY = svgHeight - paddingY;
    const area = `${d} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
    return { line: d, area };
  }, [pointsCoordinates]);

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = 'ID,Name,Email,Tier,Status,ExpiresAt\n';
    const rows = users
      .map(
        (u) =>
          `"${u.id}","${u.name}","${u.email}","${u.subscription?.tier || 'FREE'}","${u.status}","${
            u.subscription?.expiresAt ? new Date(u.subscription.expiresAt).toLocaleDateString() : 'N/A'
          }"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eyeposture-analytics-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP FILTER BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Date Range & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{isVi ? 'Thời Gian:' : 'Period:'}</span>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs font-bold">
            {(['7D', '30D', '90D', '1Y'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`btn-tactile px-3 py-1 rounded-lg transition-all duration-200 ${
                  dateRange === r
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r === '7D' ? (isVi ? '7 Ngày' : '7 Days') : r === '30D' ? (isVi ? '30 Ngày' : '30 Days') : r === '90D' ? (isVi ? 'Quý' : 'Quarter') : (isVi ? 'Năm' : '1 Year')}
              </button>
            ))}
          </div>

          {/* Filter by Tier */}
          <div className="flex items-center gap-1.5 pl-2">
            <span className="text-xs text-slate-500 font-medium">{isVi ? 'Gói:' : 'Tier:'}</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">{isVi ? 'Tất Cả Gói' : 'All Tiers'}</option>
              <option value="FREE">Free</option>
              <option value="PRO">Pro</option>
              <option value="FAMILY">Family</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">{isVi ? 'Trạng Thái:' : 'Status:'}</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">{isVi ? 'Tất Cả' : 'All'}</option>
              <option value="ACTIVE">{isVi ? 'Hoạt Động' : 'Active'}</option>
              <option value="BLOCKED">{isVi ? 'Đã Khóa' : 'Blocked'}</option>
            </select>
          </div>
        </div>

        {/* Right: Export Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="btn-tactile inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-cyan-500/50 bg-white dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 shadow-sm transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isVi ? 'Xuất Báo Cáo CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR HIGH-IMPACT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-white/95 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm hover-card-glow transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isVi ? 'Tổng Doanh Thu Tích Lũy' : 'Total Revenue'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.totalRevenue.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {stats.totalRevenue > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Giao dịch đã xác nhận
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">Chưa phát sinh giao dịch thanh toán</span>
            )}
          </div>
        </div>

        {/* Card 2: MRR */}
        <div className="p-5 rounded-2xl bg-white/95 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm hover-card-glow transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isVi ? 'Doanh Thu Định Kỳ (MRR)' : 'Monthly Recurring (MRR)'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.mrr.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-xs text-slate-400 font-mono">/{isVi ? 'tháng' : 'mo'}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ARR: {(stats.arr).toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* Card 3: Paid Conversion Rate */}
        <div className="p-5 rounded-2xl bg-white/95 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm hover-card-glow transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isVi ? 'Tỷ Lệ Kích Hoạt Trả Phí' : 'Paid Conversion Rate'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <PieChartIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {stats.conversionRate}%
            </span>
            <span className="text-xs text-slate-400">
              ({stats.paidUsersCount}/{stats.totalUsers} {isVi ? 'đã trả phí' : 'paid'})
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{stats.familyCount} Family ({isVi ? 'Đặc quyền VIP' : 'VIP grants'})</span>
          </div>
        </div>

        {/* Card 4: ARPU */}
        <div className="p-5 rounded-2xl bg-white/95 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm hover-card-glow transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isVi ? 'ARPU (Bình Quân/User VIP)' : 'ARPU (Per Paid User)'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.arpu.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{stats.paidUsersCount > 0 ? (isVi ? 'Giá trị vòng đời cao' : 'High LTV index') : (isVi ? 'Theo dõi giao dịch thực' : 'Real-time billing')}</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE SVG CHART SECTION */}
      <div className="p-6 rounded-3xl bg-white/95 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {chartMetric === 'REVENUE'
                  ? isVi ? 'Biểu Đồ Xu Hướng Doanh Thu Thực Tế' : 'Revenue Growth Trends'
                  : isVi ? 'Biểu Đồ Tăng Trưởng Người Dùng Mới' : 'User Acquisition Trends'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isVi
                ? `Thống kê chu kỳ ${dateRange} kết hợp dữ liệu Supabase và phân tích bản quyền`
                : `Interactive telemetry breakdown across ${dateRange}`}
            </p>
          </div>

          {/* Metric Switcher Button */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setChartMetric('REVENUE')}
              className={`btn-tactile px-3.5 py-1.5 rounded-lg transition ${
                chartMetric === 'REVENUE'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isVi ? 'Doanh Thu (VND)' : 'Revenue (VND)'}
            </button>
            <button
              onClick={() => setChartMetric('USERS')}
              className={`btn-tactile px-3.5 py-1.5 rounded-lg transition ${
                chartMetric === 'USERS'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isVi ? 'Người Dùng (Users)' : 'Users'}
            </button>
          </div>
        </div>

        {/* Realtime Alert when 0 revenue */}
        {chartMetric === 'REVENUE' && stats.totalRevenue === 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2.5">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              {isVi
                ? 'Hệ thống ghi nhận 0 ₫ doanh thu thực tế từ cổng thanh toán. Hai tài khoản (admin & test@gmail.com) hiện đang sử dụng gói FAMILY theo diện cấp quyền quản trị/dùng thử nội bộ, chưa phát sinh giao dịch thanh toán.'
                : 'Zero billing revenue recorded. Both accounts (admin & test@gmail.com) are currently active via internal VIP grants.'}
            </span>
          </div>
        )}

        {/* Dynamic SVG Area Graph with Crosshair */}
        <div className="relative w-full overflow-hidden pt-4 pb-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              {/* Neon Glow Linear Gradient for Area */}
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>

              {/* Stroke Line Gradient */}
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = svgHeight - paddingY - (svgHeight - paddingY * 2) * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-slate-400 text-[10px] font-mono"
                  >
                    {chartMetric === 'REVENUE'
                      ? `${Math.round((maxVal * ratio) / 1000).toLocaleString('vi-VN')}k`
                      : Math.round(maxVal * ratio)}
                  </text>
                </g>
              );
            })}

            {/* Gradient Filled Area */}
            {areaPath.area && (
              <path d={areaPath.area} fill="url(#areaGradient)" className="transition-all duration-500" />
            )}

            {/* Main Smooth Line */}
            {areaPath.line && (
              <path
                d={areaPath.line}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}

            {/* Data Interactive Nodes */}
            {pointsCoordinates.map((pt, idx) => {
              const isHovered = hoveredPointIndex === idx;
              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Vertical Hover Crosshair */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingY}
                      x2={pt.x}
                      y2={svgHeight - paddingY}
                      className="stroke-cyan-500/70"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Outer Pulsing Glow Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 8 : 4.5}
                    className={`transition-all duration-200 ${
                      isHovered
                        ? 'fill-cyan-400 stroke-white stroke-2 shadow-lg shadow-cyan-500/50'
                        : 'fill-white dark:fill-slate-900 stroke-cyan-500 stroke-2'
                    }`}
                  />

                  {/* X Axis Date Label */}
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className={`text-[10.5px] font-mono transition-colors ${
                      isHovered
                        ? 'fill-cyan-600 dark:fill-cyan-400 font-bold'
                        : 'fill-slate-500 dark:fill-slate-400'
                    }`}
                  >
                    {pt.data.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip Callout */}
          {hoveredPointIndex !== null && pointsCoordinates[hoveredPointIndex] && (
            <div
              className="absolute z-20 pointer-events-none p-3 rounded-xl bg-slate-950/95 text-white border border-cyan-500/40 shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-3 text-xs space-y-1"
              style={{
                left: `${(pointsCoordinates[hoveredPointIndex].x / svgWidth) * 100}%`,
                top: `${(pointsCoordinates[hoveredPointIndex].y / svgHeight) * 100}%`,
              }}
            >
              <div className="font-bold text-cyan-400 border-b border-white/10 pb-1 flex items-center justify-between gap-4">
                <span>{pointsCoordinates[hoveredPointIndex].data.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">Realtime Live</span>
              </div>
              <div className="flex justify-between gap-4 pt-0.5">
                <span className="text-slate-400">{isVi ? 'Doanh thu:' : 'Revenue:'}</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {pointsCoordinates[hoveredPointIndex].data.revenue.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">{isVi ? 'Người dùng:' : 'Users:'}</span>
                <span className="font-bold text-white font-mono">
                  {pointsCoordinates[hoveredPointIndex].data.users} users
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. BREAKDOWN & TIER DISTRIBUTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Tier Distribution Bar Breakdown (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white/95 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-500" />
                <span>{isVi ? 'Phân Bổ Cơ Cấu Gói Bản Quyền' : 'Subscription Tier Distribution'}</span>
              </h4>
              <span className="text-xs text-slate-500 font-mono">{stats.totalUsers} {isVi ? 'Tài Khoản' : 'Accounts'}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isVi
                ? 'Tỷ lệ người dùng giữa bản Free dùng thử và các gói trả phí Pro / Family'
                : 'Ratio between Free trial accounts and paid active subscriptions'}
            </p>
          </div>

          {/* Segmented Progress Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex shadow-inner">
              <div
                style={{ width: `${(stats.freeCount / stats.totalUsers) * 100}%` }}
                className="bg-slate-400 dark:bg-slate-600 transition-all duration-500"
                title={`Free: ${stats.freeCount}`}
              />
              <div
                style={{ width: `${(stats.proCount / stats.totalUsers) * 100}%` }}
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                title={`Pro: ${stats.proCount}`}
              />
              <div
                style={{ width: `${(stats.familyCount / stats.totalUsers) * 100}%` }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                title={`Family: ${stats.familyCount}`}
              />
            </div>

            {/* Legend Labels */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  FREE TRIAL
                </span>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {stats.freeCount} <span className="text-xs font-normal text-slate-400">({Math.round((stats.freeCount / stats.totalUsers) * 100)}%)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  PRO
                </span>
                <div className="text-lg font-bold text-cyan-700 dark:text-cyan-300 mt-1">
                  {stats.proCount} <span className="text-xs font-normal opacity-75">({Math.round((stats.proCount / stats.totalUsers) * 100)}%)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  FAMILY
                </span>
                <div className="text-lg font-bold text-purple-700 dark:text-purple-300 mt-1">
                  {stats.familyCount} <span className="text-xs font-normal opacity-75">({Math.round((stats.familyCount / stats.totalUsers) * 100)}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <span>{isVi ? 'Tổng thiết bị kết nối client:' : 'Connected desktop clients:'}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{devices.length} Devices</span>
          </div>
        </div>

        {/* Revenue by Plan Comparison (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white/95 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>{isVi ? 'Doanh Thu Theo Phân Loại Gói' : 'Revenue Contribution'}</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isVi ? 'So sánh giá trị đóng góp giữa Pro & Family' : 'Comparison of revenue contribution'}
            </p>
          </div>

          {/* Vertical Bar Compare */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-cyan-600 dark:text-cyan-400">Gói PRO (199k/năm)</span>
                <span className="text-slate-900 dark:text-white font-mono">{stats.proRevenue.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${(stats.proRevenue / (stats.totalRevenue || 1)) * 100}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-purple-600 dark:text-purple-400">Gói FAMILY (299k/năm)</span>
                <span className="text-slate-900 dark:text-white font-mono">{stats.familyRevenue.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${(stats.familyRevenue / (stats.totalRevenue || 1)) * 100}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-600"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
            <span className="text-emerald-700 dark:text-emerald-300 font-bold">{isVi ? 'Voucher đang phát hành:' : 'Active Vouchers:'}</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
              {vouchers.filter((v) => v.isActive).length} {isVi ? 'mã ưu đãi' : 'promos'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
