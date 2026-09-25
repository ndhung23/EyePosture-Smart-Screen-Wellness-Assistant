'use client';

import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '@/lib/types';
import {
  CreditCard,
  Edit2,
  Save,
  X,
  Sparkles,
  Crown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  DollarSign,
  Tag,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const PricingManager: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pricing');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error('Fetch pricing plans error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleStartEdit = (plan: SubscriptionPlan) => {
    setEditingPlan({ ...plan });
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlan),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cập nhật giá thất bại');
      }

      setSuccessMsg(`Đã cập nhật giá gói "${editingPlan.nameVi}" thành công!`);
      setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? data.plan : p)));
      setEditingPlan(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu giá gói');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      const newActive = !plan.isActive;
      const res = await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plan.id, isActive: newActive }),
      });
      if (res.ok) {
        setPlans((prev) =>
          prev.map((p) => (p.id === plan.id ? { ...p, isActive: newActive } : p))
        );
      }
    } catch (err) {
      console.error('Toggle plan active error:', err);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('Bạn có chắc chắn muốn khôi phục toàn bộ bảng giá về mức mặc định ban đầu không?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
        setSuccessMsg('Đã khôi phục toàn bộ bảng giá về mặc định!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi khôi phục bảng giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Bảng Giá & Gói Dịch Vụ</span>
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
                Database Synced
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Thay đổi giá tại đây sẽ tự động cập nhật ngay lập tức lên Website và Ứng dụng Desktop EyePosture của người dùng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={handleResetDefaults}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition border border-rose-500/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isFamily = plan.tier === 'FAMILY';
          const isLifetime = plan.interval === 'lifetime';
          const isYear = plan.interval === 'year';

          return (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isFamily
                  ? 'bg-gradient-to-b from-purple-950/30 via-slate-900/90 to-purple-950/20 border-purple-500/40 shadow-lg shadow-purple-500/5'
                  : 'bg-gradient-to-b from-amber-950/30 via-slate-900/90 to-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
              }`}
            >
              {/* Header Badges */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                      isFamily
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isFamily ? <Sparkles className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                    <span>{plan.tier}</span>
                  </span>

                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {isLifetime ? 'Trọn đời' : isYear ? '1 Năm' : '1 Tháng'}
                  </span>
                </div>

                <h4 className="font-bold text-base text-slate-100">{plan.nameVi}</h4>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px] line-clamp-2">
                  {plan.descriptionVi}
                </p>

                {/* Price Display */}
                <div className="my-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-teal-300 font-mono">
                        {plan.priceVnd.toLocaleString('vi-VN')} đ
                      </span>
                      {plan.originalPriceVnd && plan.originalPriceVnd > plan.priceVnd && (
                        <span className="text-xs text-slate-500 line-through ml-2">
                          {plan.originalPriceVnd.toLocaleString('vi-VN')} đ
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      ${plan.priceUsd}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleActive(plan)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition ${
                    plan.isActive
                      ? 'text-teal-400 hover:text-teal-300'
                      : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {plan.isActive ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-teal-400" />
                      <span>Đang mở bán</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-500" />
                      <span>Đang tắt</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleStartEdit(plan)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs border border-slate-700 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Sửa giá</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base text-slate-100">
                  Cập Nhật Giá Gói: {editingPlan.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Name VI */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tên hiển thị (Tiếng Việt)
                </label>
                <input
                  type="text"
                  value={editingPlan.nameVi}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, nameVi: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Price VND & USD */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Giá bán VNĐ (đ)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={editingPlan.priceVnd}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        priceVnd: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-teal-500/60 text-teal-300 font-mono font-bold focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Giá bán USD ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.priceUsd}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        priceUsd: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Original Price VND */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Giá gốc gạch ngang (VNĐ - Khuyến mãi)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={editingPlan.originalPriceVnd || ''}
                  placeholder="Ví dụ: 39000 (Để trống nếu không giảm giá)"
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      originalPriceVnd: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-mono focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Description VI */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mô tả quyền lợi (Tiếng Việt)
                </label>
                <textarea
                  rows={2}
                  value={editingPlan.descriptionVi || ''}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, descriptionVi: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Đang lưu...' : 'Lưu giá mới'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
