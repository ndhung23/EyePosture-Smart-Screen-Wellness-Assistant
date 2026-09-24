'use client';

import React, { useState } from 'react';
import { VoucherItem } from '@/lib/types';
import { Plus, Ticket, Trash2, CheckCircle2, Clock, Percent, ToggleLeft, ToggleRight } from 'lucide-react';

interface VoucherManagerProps {
  vouchers: VoucherItem[];
  onCreateVoucher: (data: { code: string; discountPercent: number; daysValid: number }) => Promise<void>;
  onToggleVoucher: (id: string, isActive: boolean) => Promise<void>;
  onDeleteVoucher: (id: string) => Promise<void>;
}

export function VoucherManager({
  vouchers,
  onCreateVoucher,
  onToggleVoucher,
  onDeleteVoucher,
}: VoucherManagerProps) {
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [daysValid, setDaysValid] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Vui lòng nhập mã voucher');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onCreateVoucher({
        code: code.trim().toUpperCase(),
        discountPercent,
        daysValid,
      });
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo voucher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Voucher Form */}
      <div className="p-6 rounded-2xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Ticket className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm text-white dark:text-white light:text-slate-900">
            Tạo Mã Giảm Giá (Voucher) Mới
          </h3>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Code input */}
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Mã Voucher</label>
            <input
              type="text"
              required
              placeholder="VD: EYE30, SUMMER50"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs text-white dark:text-white light:text-slate-900 font-mono uppercase focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Discount presets */}
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Phần Trăm Giảm Giá: <strong className="text-cyan-400">{discountPercent}%</strong>
            </label>
            <div className="flex items-center gap-1.5">
              {[10, 20, 30, 50].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => setDiscountPercent(pct)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                    discountPercent === pct
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Duration presets */}
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Thời Gian Hạn Sử Dụng: <strong className="text-cyan-400">{daysValid} Ngày</strong>
            </label>
            <div className="flex items-center gap-1.5">
              {[7, 14, 30, 90].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDaysValid(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                    daysValid === d
                      ? 'bg-purple-600 text-white border-purple-500 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-12 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Đang tạo...' : 'Phát Hành Voucher'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Vouchers Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-50 text-slate-400 dark:text-slate-400 light:text-slate-500 font-semibold">
              <th className="py-3.5 px-4">Mã Voucher</th>
              <th className="py-3.5 px-4">Giảm Giá</th>
              <th className="py-3.5 px-4">Thời Hạn Còn Lại</th>
              <th className="py-3.5 px-4 text-center">Đã Sử Dụng</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 dark:divide-slate-800/60 light:divide-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700">
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Chưa có mã voucher nào được tạo
                </td>
              </tr>
            ) : (
              vouchers.map((v) => {
                const now = Date.now();
                const isExpired = v.expiresAt < now;
                const remainingDays = Math.max(0, Math.ceil((v.expiresAt - now) / (86400 * 1000)));

                return (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-800/30 dark:hover:bg-slate-800/30 light:hover:bg-slate-50 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 font-mono font-bold text-xs text-indigo-300">
                        <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{v.code}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-extrabold text-sm text-cyan-400">
                        {v.discountPercent}%
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {isExpired ? (
                          <span className="text-rose-400 font-semibold">Đã hết hạn</span>
                        ) : (
                          <span>Còn {remainingDays} ngày</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-semibold text-slate-300">
                      {v.usageCount} lượt
                    </td>

                    <td className="py-3 px-4">
                      {v.isActive && !isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Hoạt Động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                          {isExpired ? 'Hết Hạn' : 'Tạm Dừng'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onToggleVoucher(v.id, !v.isActive)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white transition"
                        title={v.isActive ? 'Tạm dừng voucher' : 'Kích hoạt voucher'}
                      >
                        {v.isActive ? (
                          <ToggleRight className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-500" />
                        )}
                      </button>

                      <button
                        onClick={() => onDeleteVoucher(v.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition"
                        title="Xóa voucher"
                      >
                        <Trash2 className="w-4 h-4" />
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
