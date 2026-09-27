import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Droplets,
  Info,
  Crown,
  Filter,
  Calendar,
  Search,
  Clock,
  Trash2,
  RefreshCw,
  Activity,
  Check,
  X,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { AlertHistoryService, AlertHistoryItem } from '../services/AlertHistoryService.js';
import { ReminderType } from '@eyeposture/shared-types';
import { t } from '@eyeposture/i18n';

type TimeRangeFilter = 'TODAY' | '7DAYS' | '30DAYS' | 'ALL' | 'CUSTOM';
type TypeFilter = 'ALL' | ReminderType;
type SeverityFilter = 'ALL' | 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
type StateFilter = 'ALL' | 'RESOLVED' | 'ACTIVE_WARNING' | 'SKIPPED';

const TYPE_CONFIG: Record<
  ReminderType | 'CUSTOM',
  { label: string; color: string; bg: string; border: string; icon: React.FC<{ className?: string }> }
> = {
  POSTURE: {
    label: 'Cảnh báo tư thế',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    icon: AlertTriangle,
  },
  DISTANCE: {
    label: 'Cảnh báo khoảng cách',
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/30',
    icon: Eye,
  },
  EYE_BREAK: {
    label: 'Nghỉ mắt 20-20-20',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/15',
    border: 'border-indigo-500/30',
    icon: Clock,
  },
  HYDRATION: {
    label: 'Nhắc nhở uống nước',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
    icon: Droplets,
  },
  BLINK_REMINDER: {
    label: 'Nhắc nhở chớp mắt',
    color: 'text-teal-400',
    bg: 'bg-teal-500/15',
    border: 'border-teal-500/30',
    icon: Eye,
  },
  SCREEN_TIME: {
    label: 'Giới hạn màn hình',
    color: 'text-purple-400',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/30',
    icon: Activity,
  },
  CUSTOM: {
    label: 'Tùy chỉnh khác',
    color: 'text-slate-400',
    bg: 'bg-slate-500/15',
    border: 'border-slate-500/30',
    icon: Info,
  },
};

export const StatisticsPage: React.FC = () => {
  const { dailyStats, subscriptionTier, currentUser, activeProfile } = useApp();
  const isProOrFamily = subscriptionTier === 'PRO' || subscriptionTier === 'FAMILY';

  // Raw alert history items
  const [historyItems, setHistoryItems] = useState<AlertHistoryItem[]>(() => {
    return AlertHistoryService.getAlertHistory(activeProfile?.id || 'default');
  });

  const loadData = () => {
    const data = AlertHistoryService.getAlertHistory(activeProfile?.id || 'default');
    setHistoryItems(data);
  };

  useEffect(() => {
    loadData();
    const handleRecorded = () => {
      loadData();
    };
    window.addEventListener('eyeposture:alert_recorded', handleRecorded);
    return () => window.removeEventListener('eyeposture:alert_recorded', handleRecorded);
  }, [activeProfile?.id]);

  // Filters State
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('7DAYS');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedType, setSelectedType] = useState<TypeFilter>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>('ALL');
  const [selectedState, setSelectedState] = useState<StateFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination / display limit
  const [displayLimit, setDisplayLimit] = useState(25);

  // Time boundaries calculation
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Filter items
  const filteredItems = useMemo(() => {
    const now = Date.now();
    const oneDay = 86400000;

    return historyItems.filter((item) => {
      // 1. Time range filter
      if (timeRange === 'TODAY') {
        if (item.date !== todayStr) return false;
      } else if (timeRange === '7DAYS') {
        if (now - item.timestamp > 7 * oneDay) return false;
      } else if (timeRange === '30DAYS') {
        if (now - item.timestamp > 30 * oneDay) return false;
      } else if (timeRange === 'CUSTOM') {
        if (customStartDate && item.date < customStartDate) return false;
        if (customEndDate && item.date > customEndDate) return false;
      }

      // 2. Type filter
      if (selectedType !== 'ALL' && item.type !== selectedType) {
        return false;
      }

      // 3. Severity filter
      if (selectedSeverity !== 'ALL') {
        if (selectedSeverity === 'HIGH' && item.severity !== 'HIGH') return false;
        if (selectedSeverity === 'URGENT' && item.severity !== 'URGENT') return false;
        if (selectedSeverity === 'NORMAL' && item.severity !== 'NORMAL') return false;
        if (selectedSeverity === 'LOW' && item.severity !== 'LOW') return false;
      }

      // 4. State filter
      if (selectedState !== 'ALL') {
        if (selectedState !== item.state) return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchMsg = item.message.toLowerCase().includes(q);
        const matchDate = item.date.includes(q) || item.timeStr.includes(q);
        if (!matchTitle && !matchMsg && !matchDate) return false;
      }

      return true;
    });
  }, [
    historyItems,
    timeRange,
    customStartDate,
    customEndDate,
    selectedType,
    selectedSeverity,
    selectedState,
    searchQuery,
    todayStr,
  ]);

  // Aggregate stats from filtered items
  const statsOverview = useMemo(() => {
    const total = filteredItems.length;
    let postureCount = 0;
    let distanceCount = 0;
    let breakCount = 0;
    let hydrationCount = 0;
    let blinkCount = 0;
    let resolvedCount = 0;

    filteredItems.forEach((item) => {
      if (item.type === 'POSTURE') postureCount++;
      else if (item.type === 'DISTANCE') distanceCount++;
      else if (item.type === 'EYE_BREAK') breakCount++;
      else if (item.type === 'HYDRATION') hydrationCount++;
      else if (item.type === 'BLINK_REMINDER') blinkCount++;

      if (item.state === 'RESOLVED') resolvedCount++;
    });

    const complianceRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 100;

    return {
      total,
      postureCount,
      distanceCount,
      breakCount,
      hydrationCount,
      blinkCount,
      resolvedCount,
      complianceRate,
    };
  }, [filteredItems]);

  // Daily distribution for chart
  const dailyDistribution = useMemo(() => {
    const map = new Map<string, { date: string; posture: number; distance: number; breaks: number; total: number }>();

    // Take last 7 distinct days in chronological order
    const days: string[] = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
      days.push(d);
      map.set(d, { date: d, posture: 0, distance: 0, breaks: 0, total: 0 });
    }

    filteredItems.forEach((item) => {
      if (map.has(item.date)) {
        const entry = map.get(item.date)!;
        entry.total++;
        if (item.type === 'POSTURE') entry.posture++;
        else if (item.type === 'DISTANCE') entry.distance++;
        else if (item.type === 'EYE_BREAK') entry.breaks++;
      }
    });

    return Array.from(map.values());
  }, [filteredItems]);

  const maxDailyCount = useMemo(() => {
    const max = Math.max(...dailyDistribution.map((d) => d.total), 1);
    return max;
  }, [dailyDistribution]);

  // Reset all filters
  const handleResetFilters = () => {
    setTimeRange('7DAYS');
    setCustomStartDate('');
    setCustomEndDate('');
    setSelectedType('ALL');
    setSelectedSeverity('ALL');
    setSelectedState('ALL');
    setSearchQuery('');
  };

  return (
    <div className="p-8 space-y-7 max-w-6xl mx-auto pb-20 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-2xl text-slate-100 flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-teal-400" />
              <span>Thống kê Nhắc nhở & Cảnh báo</span>
            </h2>
            {isProOrFamily && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                <Crown className="w-3.5 h-3.5" />
                <span>{subscriptionTier}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Theo dõi chi tiết số lần cảnh báo tư thế, cự ly khoảng cách mắt, nhắc nghỉ ngơi 20-20-20 và tỷ lệ tuân thủ sức khỏe.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-300 transition-all active:scale-95"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử nhắc nhở & cảnh báo của hồ sơ này?')) {
                AlertHistoryService.clearHistory(activeProfile?.id || 'default');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all active:scale-95"
            title="Xóa lịch sử cảnh báo"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa lịch sử</span>
          </button>
        </div>
      </div>

      {/* Metrics Highlight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* Total Alerts */}
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Tổng cảnh báo
          </span>
          <p className="font-display text-2xl font-black text-slate-100">{statsOverview.total}</p>
          <span className="text-[10px] text-slate-500">Trong bộ lọc</span>
        </div>

        {/* Posture */}
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Tư thế</span>
          </span>
          <p className="font-display text-2xl font-black text-amber-300">{statsOverview.postureCount}</p>
          <span className="text-[10px] text-slate-500">Gù lưng / lệch</span>
        </div>

        {/* Distance */}
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>Khoảng cách</span>
          </span>
          <p className="font-display text-2xl font-black text-rose-300">{statsOverview.distanceCount}</p>
          <span className="text-[10px] text-slate-500">Quá gần (&lt;45cm)</span>
        </div>

        {/* Breaks */}
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Nghỉ mắt</span>
          </span>
          <p className="font-display text-2xl font-black text-indigo-300">{statsOverview.breakCount}</p>
          <span className="text-[10px] text-slate-500">Quy tắc 20-20-20</span>
        </div>

        {/* Hydration */}
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            <span>Uống nước</span>
          </span>
          <p className="font-display text-2xl font-black text-cyan-300">{statsOverview.hydrationCount}</p>
          <span className="text-[10px] text-slate-500">Lần nhắc nhở</span>
        </div>

        {/* Compliance Rate */}
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã xử lý</span>
          </span>
          <p className="font-display text-2xl font-black text-emerald-300">{statsOverview.complianceRate}%</p>
          <span className="text-[10px] text-slate-500">Tỷ lệ tuân thủ</span>
        </div>
      </div>

      {/* FILTER TOOLBAR CARD */}
      <div className="glass-card p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-teal-400" />
            <span>Bộ lọc thống kê toàn diện</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetFilters}
              className="text-xs text-teal-400 hover:text-teal-300 hover:underline transition-colors font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Đặt lại bộ lọc</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">
              Hiển thị <strong className="text-slate-200">{filteredItems.length}</strong> kết quả
            </span>
          </div>
        </div>

        {/* Filters Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* 1. Time Range */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Khoảng thời gian:</span>
            </label>
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setTimeRange('TODAY')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  timeRange === 'TODAY' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hôm nay
              </button>
              <button
                onClick={() => setTimeRange('7DAYS')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  timeRange === '7DAYS' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                7 ngày
              </button>
              <button
                onClick={() => setTimeRange('30DAYS')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  timeRange === '30DAYS' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                30 ngày
              </button>
              <button
                onClick={() => setTimeRange('ALL')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  timeRange === 'ALL' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất cả
              </button>
            </div>
          </div>

          {/* 2. Type Filter */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Loại cảnh báo / Nhắc nhở:</span>
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as TypeFilter)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500/60 cursor-pointer font-medium"
            >
              <option value="ALL">Tất cả các loại cảnh báo</option>
              <option value="POSTURE">Cảnh báo tư thế ngồi (Gù lưng / lệch)</option>
              <option value="DISTANCE">Cảnh báo khoảng cách màn hình (&lt;45cm)</option>
              <option value="EYE_BREAK">Nhắc nhở nghỉ ngơi mắt (20-20-20)</option>
              <option value="HYDRATION">Nhắc nhở bổ sung nước</option>
              <option value="BLINK_REMINDER">Nhắc nhở chớp mắt chống khô</option>
              <option value="SCREEN_TIME">Cảnh báo thời gian sử dụng màn hình</option>
            </select>
          </div>

          {/* 3. Severity & State */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Mức độ nghiêm trọng:</span>
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as SeverityFilter)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500/60 cursor-pointer font-medium"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="URGENT">Khẩn cấp (Urgent)</option>
              <option value="HIGH">Cao (High)</option>
              <option value="NORMAL">Bình thường (Normal)</option>
              <option value="LOW">Nhẹ (Low)</option>
            </select>
          </div>

          {/* 4. Search Filter */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tìm kiếm từ khóa:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nội dung cảnh báo..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Custom Date Range Picker (shown when custom is selected) */}
        {timeRange === 'CUSTOM' && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-4 text-xs animate-fadeIn">
            <span className="text-slate-400 font-medium">Khoảng ngày tùy chỉnh:</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Từ:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500/60"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Đến:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500/60"
              />
            </div>
          </div>
        )}
      </div>

      {/* Visual Distribution Chart (Last 7 Days) */}
      <div className="glass-card p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Biểu đồ phân bổ cảnh báo 7 ngày qua</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tần suất cảnh báo tư thế & khoảng cách theo từng ngày giúp bạn nhận biết thời điểm mỏi mệt.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30">
            Tổng: {statsOverview.total} lần
          </span>
        </div>

        {/* Interactive Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
          {dailyDistribution.map((item) => {
            const heightPercent = Math.max(12, Math.round((item.total / maxDailyCount) * 100));
            const dayLabel = new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' });

            return (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-teal-300 bg-slate-850 px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none mb-1 shadow-md">
                  {item.total} lần
                </div>

                <div className="w-full max-w-[42px] bg-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-end h-32 p-1 border border-slate-700/50 group-hover:border-teal-500/50 transition-colors">
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-teal-600 via-teal-400 to-cyan-300 transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors truncate max-w-full text-center">
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED ALERT & REMINDER HISTORY LOG TABLE */}
      <div className="glass-card border border-slate-800 overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-100">Chi tiết các lần nhắc nhở & cảnh báo</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredItems.length} sự kiện được ghi nhận
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">Không có cảnh báo nào trong bộ lọc này</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tư thế làm việc rất tốt hoặc không có sự kiện nào khớp với tiêu chí tìm kiếm của bạn.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto">
            {filteredItems.slice(0, displayLimit).map((item) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.CUSTOM;
              const IconComp = cfg.icon;

              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-850/60 transition-colors flex items-start justify-between gap-4 text-xs"
                >
                  {/* Left: Icon & Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-200 text-xs">{item.title}</span>
                        <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                          {cfg.label}
                        </span>

                        {item.severity === 'HIGH' || item.severity === 'URGENT' ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {item.severity}
                          </span>
                        ) : null}
                      </div>

                      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Right: Timestamp & State */}
                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-slate-300 font-mono text-[11px] font-semibold">{item.timeStr}</div>
                    <div className="text-slate-500 font-mono text-[10px]">{item.date}</div>
                    <div className="pt-0.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.state === 'RESOLVED'
                          ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                          : item.state === 'SKIPPED'
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}>
                        {item.state === 'RESOLVED' ? <Check className="w-3 h-3 text-teal-400" /> : null}
                        <span>{item.state === 'RESOLVED' ? 'Đã khắc phục' : item.state === 'SKIPPED' ? 'Bỏ qua' : 'Cảnh báo'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredItems.length > displayLimit && (
              <div className="p-3 text-center bg-slate-900/60">
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 25)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-teal-400 transition-all active:scale-95"
                >
                  Xem thêm ({filteredItems.length - displayLimit} cảnh báo còn lại)...
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
