import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Tag,
  Search,
  Coffee,
  Droplet,
  Eye,
  Check,
  Edit2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskCategory = 'WORK' | 'STUDY' | 'HEALTH' | 'PERSONAL';

export interface DailyTodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  category: TaskCategory;
  dueTime?: string;
  createdAt: string;
  completedAt?: string;
}

const CATEGORY_MAP: Record<TaskCategory, { label: string; color: string; bg: string; border: string }> = {
  WORK: { label: 'Công việc', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  STUDY: { label: 'Học tập', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  HEALTH: { label: 'Sức khỏe', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
  PERSONAL: { label: 'Cá nhân', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
};

const PRIORITY_MAP: Record<TaskPriority, { label: string; color: string; bg: string; border: string }> = {
  HIGH: { label: 'Khẩn cấp', color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  MEDIUM: { label: 'Trung bình', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  LOW: { label: 'Bình thường', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
};

export const TodoPage: React.FC = () => {
  const { activeProfile, logWaterGlass, startBreakNow } = useApp();

  const storageKey = useMemo(() => {
    return `eyeposture_todos_${activeProfile?.id || 'default'}`;
  }, [activeProfile?.id]);

  const [todos, setTodos] = useState<DailyTodoItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'sample-1',
        title: 'Bắt đầu phiên làm việc & kiểm tra tư thế ngồi chuẩn',
        completed: false,
        priority: 'HIGH',
        category: 'HEALTH',
        dueTime: '08:30',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-2',
        title: 'Nghỉ giải lao mắt quy tắc 20-20-20 & uống 1 cốc nước',
        completed: false,
        priority: 'MEDIUM',
        category: 'HEALTH',
        dueTime: '10:00',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-3',
        title: 'Hoàn thành các công việc quan trọng trong buổi sáng',
        completed: false,
        priority: 'HIGH',
        category: 'WORK',
        dueTime: '11:30',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Reload when storageKey changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setTodos(JSON.parse(saved));
      }
    } catch {}
  }, [storageKey]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(todos));
    } catch {}
  }, [todos, storageKey]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('MEDIUM');
  const [newCategory, setNewCategory] = useState<TaskCategory>('WORK');
  const [newDueTime, setNewDueTime] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'HIGH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Form submission
  const handleAddTodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = newTitle.trim();
    if (!cleanTitle) return;

    const newTask: DailyTodoItem = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle,
      completed: false,
      priority: newPriority,
      category: newCategory,
      dueTime: newDueTime.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [newTask, ...prev]);
    setNewTitle('');
    setNewDueTime('');
  };

  // Quick preset adding
  const handleAddPreset = (title: string, category: TaskCategory, priority: TaskPriority) => {
    const newTask: DailyTodoItem = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title,
      completed: false,
      priority,
      category,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTask, ...prev]);
  };

  // Toggle completion
  const handleToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Delete task
  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  // Save edit
  const handleSaveEdit = (id: string) => {
    if (!editingTitle.trim()) return;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: editingTitle.trim() } : t))
    );
    setEditingId(null);
  };

  // Stats
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered tasks
  const filteredTodos = useMemo(() => {
    return todos.filter((item) => {
      if (filterStatus === 'ACTIVE' && item.completed) return false;
      if (filterStatus === 'COMPLETED' && !item.completed) return false;
      if (filterStatus === 'HIGH' && item.priority !== 'HIGH') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [todos, filterStatus, searchQuery]);

  // Today formatted string
  const todayFormatted = useMemo(() => {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const dateStr = now.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return `${dayName}, ${dateStr}`;
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-7 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-slate-800 bg-gradient-to-r from-teal-950/30 via-slate-900 to-purple-950/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 text-xs text-teal-400 font-semibold tracking-wider uppercase mb-1">
              <Calendar className="w-4 h-4" />
              <span>{todayFormatted}</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-100 flex items-center gap-2.5">
              <CheckSquare className="w-7 h-7 text-teal-400" />
              <span>Danh sách công việc hàng ngày</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Quản lý công việc hiệu quả và duy trì thói quen nghỉ ngơi mắt lành mạnh theo nhịp sinh học máy tính.
            </p>
          </div>

          {/* Quick Health Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                logWaterGlass();
                handleAddPreset('Đã uống 1 cốc nước bổ sung khoáng chất', 'HEALTH', 'LOW');
              }}
              title="Ghi nhận uống 1 cốc nước"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all active:scale-95"
            >
              <Droplet className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Uống nước</span>
            </button>

            <button
              onClick={() => {
                startBreakNow();
                handleAddPreset('Nghỉ ngơi mắt 20 giây thư giãn', 'HEALTH', 'MEDIUM');
              }}
              title="Bắt đầu nghỉ ngơi mắt 20s"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold transition-all active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-teal-400" />
              <span>+ Nghỉ mắt 20s</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="glass-card p-4 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Tổng số việc</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Mục tiêu trong ngày</div>
        </div>

        {/* Card 2: Completed */}
        <div className="glass-card p-4 border border-slate-800">
          <div className="text-xs text-teal-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã hoàn thành</span>
          </div>
          <div className="text-2xl font-bold text-teal-300 mt-1">{completedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Việc đã xong</div>
        </div>

        {/* Card 3: Remaining */}
        <div className="glass-card p-4 border border-slate-800">
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Còn lại</span>
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-1">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cần tiếp tục thực hiện</div>
        </div>

        {/* Card 4: Progress Percentage */}
        <div className="glass-card p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Tiến độ hôm nay</span>
            <span className="font-bold text-teal-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1.5 flex items-center justify-between">
            <span>{completedCount}/{totalCount} việc</span>
            <span>{progressPercent === 100 ? '🎉 Hoàn tất!' : 'Đang tiến triển'}</span>
          </div>
        </div>
      </div>

      {/* Add Task Form Card */}
      <div className="glass-card p-6 border border-slate-800 space-y-4">
        <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-400" />
          <span>Thêm công việc mới</span>
        </h3>

        <form onSubmit={handleAddTodo} className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nhập nội dung công việc (VD: Hoàn thành báo cáo, Họp team, Vươn vai thư giãn...)"
              className="flex-1 w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20"
            />

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm công việc</span>
            </button>
          </div>

          {/* Options Row: Priority, Category, Time */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            {/* Priority Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Độ ưu tiên:</span>
              <div className="flex items-center gap-1.5">
                {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((p) => {
                  const info = PRIORITY_MAP[p];
                  const isSelected = newPriority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                        isSelected
                          ? `${info.bg} ${info.border} ${info.color} ring-1 ring-white/20`
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Danh mục:</span>
              <div className="flex items-center gap-1.5">
                {(['WORK', 'STUDY', 'HEALTH', 'PERSONAL'] as TaskCategory[]).map((c) => {
                  const info = CATEGORY_MAP[c];
                  const isSelected = newCategory === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCategory(c)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                        isSelected
                          ? `${info.bg} ${info.border} ${info.color} ring-1 ring-white/20`
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Time Input (Optional) */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Giờ hẹn:</span>
              <input
                type="time"
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-teal-500/60"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Task Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'ACTIVE'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đang làm ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'COMPLETED'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đã xong ({completedCount})
          </button>
          <button
            onClick={() => setFilterStatus('HIGH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'HIGH'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Khẩn cấp
          </button>
        </div>

        {/* Search & Bulk Action */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công việc..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
            />
          </div>

          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-400 hover:text-rose-300 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Dọn việc đã xong</span>
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTodos.length === 0 ? (
          <div className="glass-card p-10 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-300">
              {searchQuery ? 'Không tìm thấy công việc phù hợp' : 'Không có công việc nào trong danh sách'}
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.'
                : 'Thêm một công việc mới ở trên để bắt đầu kế hoạch làm việc hiệu quả hôm nay!'}
            </p>
          </div>
        ) : (
          filteredTodos.map((task) => {
            const priorityInfo = PRIORITY_MAP[task.priority];
            const categoryInfo = CATEGORY_MAP[task.category];
            const isEditing = editingId === task.id;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${
                  task.completed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700/80 hover:bg-slate-850'
                }`}
              >
                {/* Left: Checkbox & Title */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(task.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 active:scale-90 ${
                      task.completed
                        ? 'bg-teal-500 border-teal-400 text-slate-950'
                        : 'border-slate-600 hover:border-teal-400 bg-slate-800/80 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(task.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 px-3 py-1 rounded-lg bg-slate-800 border border-teal-500 text-xs text-slate-100"
                      />
                      <button
                        onClick={() => handleSaveEdit(task.id)}
                        className="p-1 rounded text-teal-400 hover:text-teal-300"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <div
                        onClick={() => handleToggle(task.id)}
                        className={`text-sm font-medium cursor-pointer transition-all truncate select-none ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-100 hover:text-teal-300'
                        }`}
                      >
                        {task.title}
                      </div>

                      {/* Meta Tags */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityInfo.bg} ${priorityInfo.border} ${priorityInfo.color}`}
                        >
                          {priorityInfo.label}
                        </span>

                        {/* Category Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${categoryInfo.bg} ${categoryInfo.border} ${categoryInfo.color}`}
                        >
                          {categoryInfo.label}
                        </span>

                        {/* Due Time */}
                        {task.dueTime && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{task.dueTime}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditingId(task.id);
                        setEditingTitle(task.title);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Sửa công việc"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Xóa công việc"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
