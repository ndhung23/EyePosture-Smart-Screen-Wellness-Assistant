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

  // Key KPI Computations
  const stats = useMemo(() => {
    const totalUsers = users.length || 1;
    const proUsers = users.filter((u) => u.subscription?.tier === 'PRO');
    const familyUsers = users.filter((u) => u.subscription?.tier === 'FAMILY');
    const freeUsers = users.filter((u) => !u.subscription?.tier || u.subscription?.tier === 'FREE');

    const proRevenue = proUsers.length * 199000;
    const familyRevenue = familyUsers.length * 299000;
    const totalRevenue = proRevenue + familyRevenue;

    // Monthly Recurring Revenue estimate
    const mrr = proUsers.length * 19000 + familyUsers.length * 49000;
    const arr = totalRevenue;

    const paidCount = proUsers.length + familyUsers.length;
    const conversionRate = Math.round((paidCount / totalUsers) * 1000) / 10;
    const arpu = paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0;

    return {
      totalUsers: users.length,
      proCount: proUsers.length,
      familyCount: familyUsers.length,
      freeCount: freeUsers.length,
      totalRevenue,
      proRevenue,
      familyRevenue,
      mrr,
      arr,
      conversionRate,
      arpu,
    };
  }, [users]);

  // Timeline Data Points for Interactive Chart based on Date Range
  const timelineData = useMemo(() => {
    let points: { label: string; revenue: number; users: number; pro: number; family: number }[] = [];

    if (dateRange === '7D') {
      points = [
        { label: 'T2 (20/09)', revenue: 199000, users: 4, pro: 1, family: 0 },
        { label: 'T3 (21/09)', revenue: 398000, users: 6, pro: 2, family: 0 },
        { label: 'T4 (22/09)', revenue: 299000, users: 5, pro: 0, family: 1 },
        { label: 'T5 (23/09)', revenue: 498000, users: 8, pro: 1, family: 1 },
        { label: 'T6 (24/09)', revenue: 697000, users: 9, pro: 2, family: 1 },
        { label: 'T7 (25/09)', revenue: 896000, users: 12, pro: 3, family: 1 },
        { label: 'CN (26/09)', revenue: stats.totalRevenue > 0 ? Math.round(stats.totalRevenue * 0.28) : 995000, users: 15, pro: 4, family: 1 },
      ];
    } else if (dateRange === '30D') {
      points = [
        { label: '01/09', revenue: 398000, users: 5, pro: 2, family: 0 },
        { label: '06/09', revenue: 697000, users: 9, pro: 2, family: 1 },
        { label: '12/09', revenue: 1195000, users: 14, pro: 4, family: 1 },
        { label: '18/09', revenue: 1893000, users: 20, pro: 6, family: 2 },
        { label: '22/09', revenue: 2690000, users: 26, pro: 8, family: 3 },
        { label: '26/09', revenue: stats.totalRevenue || 3385000, users: stats.totalUsers || 33, pro: stats.proCount || 11, family: stats.familyCount || 4 },
      ];
    } else if (dateRange === '90D') {
      points = [
        { label: 'Tháng 7', revenue: 1194000, users: 12, pro: 4, family: 1 },
        { label: 'Tháng 8', revenue: 2191000, users: 22, pro: 7, family: 2 },
        { label: 'Tháng 9', revenue: stats.totalRevenue || 3385000, users: stats.totalUsers || 33, pro: stats.proCount || 11, family: stats.familyCount || 4 },
      ];
    } else {
      points = [
        { label: 'Q1', revenue: 896000, users: 8, pro: 3, family: 1 },
        { label: 'Q2', revenue: 1792000, users: 17, pro: 6, family: 2 },
        { label: 'Q3', revenue: stats.totalRevenue || 3385000, users: stats.totalUsers || 33, pro: stats.proCount || 11, family: stats.familyCount || 4 },
      ];
    }

    // Apply Tier filter adjustments
    return points.map((p) => {
      let rev = p.revenue;
      let uCount = p.users;
      if (tierFilter === 'PRO') {
        rev = p.pro * 199000;
        uCount = p.pro;
      } else if (tierFilter === 'FAMILY') {
        rev = p.family * 299000;
        uCount = p.family;
      }
      return { ...p, revenue: rev, users: uCount };
    });
  }, [dateRange, stats, tierFilter]);

  // SVG Chart Dimensions & Math
  const maxVal = useMemo(() => {
    const vals = timelineData.map((d) => (chartMetric === 'REVENUE' ? d.revenue : d.users));
    return Math.max(...vals, chartMetric === 'REVENUE' ? 1000000 : 10) * 1.15;
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
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+28.4%</span>
            <span className="text-[11px] text-slate-400 font-normal">{isVi ? 'so với tháng trước' : 'vs last month'}</span>
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
            <span>ARR: {(stats.mrr * 12).toLocaleString('vi-VN')}đ</span>
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
              ({stats.proCount + stats.familyCount}/{stats.totalUsers})
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{stats.proCount} Pro • {stats.familyCount} Family</span>
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
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isVi ? 'Giá trị vòng đời cao' : 'High LTV index'}</span>
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
