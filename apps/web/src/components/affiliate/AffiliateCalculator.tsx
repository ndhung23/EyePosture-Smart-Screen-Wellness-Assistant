'use client';

import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function AffiliateCalculator() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [ordersPerMonth, setOrdersPerMonth] = useState(30);
  const [partnerTier, setPartnerTier] = useState<'MEMBER' | 'KOC'>('KOC');

  // Lifetime plan average: 399,000 VND
  // Member: 35% commission = ~140,000 VND/order
  // KOC: 40% commission = ~160,000 VND/order
  const commPerOrder = partnerTier === 'KOC' ? 160000 : 140000;
  const monthlyEarnings = ordersPerMonth * commPerOrder;
  const yearlyEarnings = monthlyEarnings * 12;

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 text-xs font-semibold mb-3">
                <Calculator className="w-3.5 h-3.5" />
                <span>{isVi ? 'Công Cụ Dự Phóng' : 'Revenue Simulator'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {isVi ? 'Ước Tính Thu Nhập Của Bạn Mỗi Tháng' : 'Estimate Your Monthly Income'}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {isVi
                  ? 'Kéo thanh trượt để tính toán tiềm năng thu nhập dựa trên số lượng đơn hàng giới thiệu thành công.'
                  : 'Drag the slider to calculate potential earnings based on successful referral orders.'}
              </p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50 dark:bg-slate-950/60 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    {isVi ? 'Cấp bậc đối tác của bạn:' : 'Your Partner Tier:'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPartnerTier('MEMBER')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        partnerTier === 'MEMBER'
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {isVi ? 'Thành Viên (35%)' : 'Member (35%)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerTier('KOC')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        partnerTier === 'KOC'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isVi ? 'KOC VIP (40%)' : 'KOC Partner (40%)'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {isVi ? 'Số đơn hàng giới thiệu / tháng:' : 'Orders referred per month:'}
                    </label>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                      {ordersPerMonth} {isVi ? 'đơn' : 'orders'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="150"
                    step="1"
                    value={ordersPerMonth}
                    onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>1 {isVi ? 'đơn' : 'order'}</span>
                    <span>50 {isVi ? 'đơn' : 'orders'}</span>
                    <span>100 {isVi ? 'đơn' : 'orders'}</span>
                    <span>150 {isVi ? 'đơn' : 'orders'}</span>
                  </div>
                </div>
              </div>

              {/* Result Preview */}
              <div className="p-6 rounded-2xl bg-amber-50/80 dark:bg-gradient-to-br dark:from-amber-500/10 dark:via-amber-500/5 dark:to-transparent border border-amber-200 dark:border-amber-500/30 text-center flex flex-col justify-center shadow-sm">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  {isVi ? 'Thu nhập ước tính / tháng' : 'Estimated Monthly Earnings'}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 mt-2">
                  {formatVnd(monthlyEarnings)}
                </div>
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                  {isVi ? (
                    <>Tương đương khoảng <span className="font-bold text-slate-900 dark:text-slate-200">{formatVnd(yearlyEarnings)}</span> mỗi năm</>
                  ) : (
                    <>Projected at <span className="font-bold text-slate-900 dark:text-slate-200">{formatVnd(yearlyEarnings)}</span> per year</>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-amber-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                  {isVi
                    ? '💡 Chỉ cần làm 1-2 video TikTok hoặc bài viết review, bạn có thể đạt 30-50 đơn hàng/tháng hoàn toàn tự động.'
                    : '💡 One or two viral TikTok reviews can easily generate 30-50 orders passively.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
