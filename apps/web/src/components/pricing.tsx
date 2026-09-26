'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, Sparkles, Tag, ArrowRight, QrCode, X, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

export function Pricing({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user, updateUser } = useAuth();
  const { t, language } = useLanguage();
  const [interval, setInterval] = useState<'month' | 'year'>('year');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountPercent: number } | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<{
    tier: string;
    amount: number;
    orderCode: string;
    qrUrl: string;
    status: 'CREATING' | 'PENDING' | 'PAID';
  } | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [dbPlans, setDbPlans] = useState<Record<string, number>>({
    PRO_month: 19000,
    PRO_year: 199000,
    FAMILY_month: 49000,
    FAMILY_year: 299000,
  });

  useEffect(() => {
    fetch('/api/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data.plans && Array.isArray(data.plans)) {
          const map: Record<string, number> = {};
          for (const p of data.plans) {
            map[`${p.tier}_${p.interval}`] = p.priceVnd;
          }
          setDbPlans((prev) => ({ ...prev, ...map }));
        }
      })
      .catch(() => {});
  }, []);

  // Polling kiểm tra trạng thái thanh toán từ SePay Webhook
  useEffect(() => {
    if (!checkoutModal || checkoutModal.status !== 'PENDING') return;

    const pollTimer = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/pricing/order?orderCode=${encodeURIComponent(checkoutModal.orderCode)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'PAID') {
            setCheckoutModal((prev) => (prev ? { ...prev, status: 'PAID' } : null));

            // Tự động nâng quyền của user trong local state
            updateUser({
              subscription: {
                tier: checkoutModal.tier as any,
                status: 'ACTIVE',
                expiresAt: Date.now() + (interval === 'year' ? 365 : 30) * 86400 * 1000,
              },
            });

            // Tự động đóng modal sau 4 giây
            setTimeout(() => {
              setCheckoutModal(null);
            }, 4500);
          }
        }
      } catch (err) {
        // Silent poll error
      }
    }, 2500);

    return () => clearInterval(pollTimer);
  }, [checkoutModal?.orderCode, checkoutModal?.status, interval, checkoutModal?.tier, updateUser]);

  const basePrices = {
    PRO: dbPlans[`PRO_${interval}`] || (interval === 'year' ? 199000 : 19000),
    FAMILY: dbPlans[`FAMILY_${interval}`] || (interval === 'year' ? 299000 : 49000),
  };

  const getDiscountedPrice = (amount: number) => {
    if (!appliedVoucher) return amount;
    return Math.round(amount * (1 - appliedVoucher.discountPercent / 100));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setCheckingVoucher(true);
    setVoucherMessage(null);
    try {
      const res = await fetch(`/api/vouchers?code=${encodeURIComponent(voucherCode.trim())}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedVoucher({ code: data.code, discountPercent: data.discountPercent });
        setVoucherMessage({ text: `Áp dụng thành công! Giảm ${data.discountPercent}% cho đơn hàng`, isError: false });
      } else {
        setAppliedVoucher(null);
        setVoucherMessage({ text: data.error || 'Mã voucher không hợp lệ hoặc đã hết hạn', isError: true });
      }
    } catch {
      // Offline fallback validation for standard promo codes
      const clean = voucherCode.trim().toUpperCase();
      if (clean === 'EYE20' || clean === 'WELCOME20') {
        setAppliedVoucher({ code: clean, discountPercent: 20 });
        setVoucherMessage({ text: `Áp dụng thành công! Giảm 20%`, isError: false });
      } else if (clean === 'VIP50') {
        setAppliedVoucher({ code: clean, discountPercent: 50 });
        setVoucherMessage({ text: `Áp dụng thành công! Giảm 50%`, isError: false });
      } else {
        setVoucherMessage({ text: 'Không thể xác thực mã voucher lúc này', isError: true });
      }
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleCheckout = async (tier: 'PRO' | 'FAMILY') => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const finalAmount = getDiscountedPrice(basePrices[tier]);
    const orderCode = `EP${Math.floor(100000 + Math.random() * 900000)}`;
    const bankAccount = process.env.NEXT_PUBLIC_PAYMENT_BANK_ACCOUNT || '4661398013';
    const bankCode = process.env.NEXT_PUBLIC_PAYMENT_BANK_CODE || 'BIDV';
    const accountName = process.env.NEXT_PUBLIC_PAYMENT_BANK_ACCOUNT_NAME || 'NGUYEN DUY HUNG';
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${finalAmount}&addInfo=${orderCode}&accountName=${encodeURIComponent(
      accountName
    )}`;

    setCreatingOrder(true);
    try {
      await fetch('/api/pricing/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode,
          userId: user.id,
          tier,
          interval,
          amount: finalAmount,
        }),
      });
    } catch (err) {
      console.error('Lỗi khi lưu đơn hàng:', err);
    } finally {
      setCreatingOrder(false);
    }

    setCheckoutModal({
      tier,
      amount: finalAmount,
      orderCode,
      qrUrl,
      status: 'PENDING',
    });
  };

  return (
    <section id="pricing" className="py-24 md:py-32 relative bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden">
      {/* Background Ambients */}
      <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-indigo-600/10 to-purple-600/10 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>{t('pricing_tag')}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            <span>{language === 'vi' ? 'Đầu Tư Cho Đôi Mắt Và ' : 'Invest in Your Eyes & '}</span>
            <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-indigo-600 dark:from-cyan-400 dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent">
              {language === 'vi' ? 'Sức Khỏe Lâu Dài' : 'Lifelong Health'}
            </span>
          </h2>

          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('pricing_subtitle')}
          </p>

          {/* Luxury Billing Interval Switcher */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 backdrop-blur-xl mt-6 shadow-sm">
            <button
              onClick={() => setInterval('month')}
              className={`btn-tactile px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 ${
                interval === 'month'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('pricing_monthly')}
            </button>
            <button
              onClick={() => setInterval('year')}
              className={`btn-tactile flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 ${
                interval === 'year'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t('pricing_yearly')}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase">
                {t('pricing_save_20')}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* ============================================================ */}
          {/* CARD 1: FREE PLAN                                            */}
          {/* ============================================================ */}
          <div className="rounded-[28px] p-8 bg-white/90 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 backdrop-blur-xl flex flex-col justify-between hover-card-glow hover:-translate-y-2 hover:shadow-2xl hover:border-cyan-500/30 transition-all duration-300 ease-out shadow-lg shadow-slate-200/50 dark:shadow-xl">
            <div>
              <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                {t('pricing_free_tier')}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {t('pricing_free_name')}
              </h3>

              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">0đ</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/{language === 'vi' ? 'vĩnh viễn' : 'forever'}</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {t('pricing_free_desc')}
              </p>

              <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 mb-8 border-t border-slate-200 dark:border-white/5 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>{t('pricing_feat_free_1')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>{t('pricing_feat_free_2')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>{t('pricing_feat_free_3')}</span>
                </li>
              </ul>
            </div>

            <a
              href="/api/download"
              className="btn-tactile w-full py-3.5 px-4 rounded-xl border border-slate-300 dark:border-white/10 hover:border-cyan-500/40 text-center font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 bg-slate-50 dark:bg-white/5 transition-all duration-200 active:scale-95"
            >
              {t('pricing_free_btn')}
            </a>
          </div>

          {/* ============================================================ */}
          {/* CARD 2: PRO PLAN (HIGHLIGHTED WITH MOVING GRADIENT BORDER)    */}
          {/* ============================================================ */}
          <div className="relative rounded-[32px] p-[2px] overflow-hidden lg:-translate-y-4 hover:-translate-y-6 transition-transform duration-300 ease-out shadow-xl dark:shadow-[0_0_60px_rgba(6,182,212,0.2)] hover:shadow-2xl hover:shadow-cyan-500/20">
            {/* Animated Rotating Conic LED Border */}
            <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,#06b6d4,#38bdf8,#6366f1,#a855f7,#ec4899,#06b6d4)] animate-spin-slow pointer-events-none" />

            {/* Inner Pro Card Container */}
            <div className="relative h-full rounded-[30px] bg-white dark:bg-slate-950/95 backdrop-blur-2xl p-8 flex flex-col justify-between border border-cyan-400/40 dark:border-cyan-500/30">
              {/* Floating Top Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md shadow-cyan-500/25 flex items-center gap-1.5 animate-pulse-glow">
                <Sparkles className="w-3 h-3" />
                <span>{t('pricing_pro_badge')}</span>
              </div>

              <div>
                <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-2 mt-1">
                  {t('pricing_pro_tier')}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {t('pricing_pro_name')}
                </h3>

                {/* Ultra High-Contrast Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                      {getDiscountedPrice(basePrices.PRO).toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      /{interval === 'year' ? (language === 'vi' ? 'năm' : 'year') : (language === 'vi' ? 'tháng' : 'month')}
                    </span>
                  </div>

                  {appliedVoucher && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        Giá gốc: <del className="text-slate-400 dark:text-slate-500">{basePrices.PRO.toLocaleString('vi-VN')}đ</del> (-{appliedVoucher.discountPercent}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-200 mb-8 border-t border-slate-200 dark:border-white/10 pt-6">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white">{t('pricing_feat_pro_1')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                    <span>{t('pricing_feat_pro_2')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                    <span>{t('pricing_feat_pro_3')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                    <span>{t('pricing_feat_pro_4')}</span>
                  </li>
                </ul>
              </div>

              {/* Shimmer Checkout CTA */}
              <button
                onClick={() => handleCheckout('PRO')}
                className="btn-tactile relative overflow-hidden group w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-center font-bold text-sm text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/45 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-cyan-400/40"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                <span>{t('pricing_pro_btn')}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 3: FAMILY PLAN                                          */}
          {/* ============================================================ */}
          <div className="rounded-[28px] p-8 bg-white/90 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 backdrop-blur-xl flex flex-col justify-between hover-card-glow hover:-translate-y-2 hover:shadow-2xl hover:border-purple-400/50 transition-all duration-300 ease-out shadow-lg shadow-slate-200/50 dark:shadow-xl">
            <div>
              <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2">
                {t('pricing_family_tier')}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {t('pricing_family_name')}
              </h3>

              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  {getDiscountedPrice(basePrices.FAMILY).toLocaleString('vi-VN')}đ
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  /{interval === 'year' ? (language === 'vi' ? 'năm' : 'year') : (language === 'vi' ? 'tháng' : 'month')}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {t('pricing_family_desc')}
              </p>

              <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 mb-8 border-t border-slate-200 dark:border-white/5 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-500 dark:text-purple-400 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white">{t('pricing_feat_family_1')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-500 dark:text-purple-400 shrink-0" />
                  <span>{t('pricing_feat_family_2')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-500 dark:text-purple-400 shrink-0" />
                  <span>{t('pricing_feat_family_3')}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('FAMILY')}
              className="btn-tactile w-full py-3.5 px-4 rounded-xl border border-purple-400 dark:border-purple-500/40 hover:border-purple-600 dark:hover:border-purple-500/70 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-center font-bold text-xs text-purple-700 dark:text-purple-300 transition-all duration-200 active:scale-95"
            >
              {t('pricing_family_btn')}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* REFINED PROMO CODE ACCORDION / TOGGLE AT BOTTOM             */}
        {/* ============================================================ */}
        <div className="mt-12 max-w-md mx-auto text-center">
          {!showVoucherInput ? (
            <button
              onClick={() => setShowVoucherInput(true)}
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{t('pricing_voucher_link')}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-lg space-y-2.5 text-left">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  {t('pricing_voucher_label')}
                </span>
                <button
                  onClick={() => setShowVoucherInput(false)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-medium"
                >
                  {t('pricing_voucher_close')}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('pricing_voucher_placeholder')}
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 uppercase font-mono"
                />
                <button
                  onClick={handleApplyVoucher}
                  disabled={checkingVoucher}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {checkingVoucher ? '...' : t('pricing_voucher_apply')}
                </button>
              </div>

              {voucherMessage && (
                <p
                  className={`text-[11px] font-mono ${
                    voucherMessage.isError ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {voucherMessage.text}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CHECKOUT VIETQR MODAL                                         */}
      {/* ============================================================ */}
      {/* ============================================================ */}
      {/* CHECKOUT VIETQR MODAL (AUTOMATED SEPAY INTEGRATION)          */}
      {/* ============================================================ */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 text-slate-900 dark:text-white shadow-2xl space-y-5">
            <button
              onClick={() => setCheckoutModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {checkoutModal.status === 'PAID' ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-500 animate-bounce">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl -z-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Thanh Toán Thành Công!
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    Gói {checkoutModal.tier} VIP đã được kích hoạt tức thì
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
                  Email xác nhận cùng biên nhận thanh toán đã được gửi tới tài khoản của bạn. Bạn có thể mở ứng dụng EyePosture Desktop để trải nghiệm ngay!
                </p>

                <div className="w-full pt-3">
                  <button
                    onClick={() => setCheckoutModal(null)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition"
                  >
                    Hoàn tất & Đóng
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{t('pricing_vietqr_title')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('pricing_vietqr_desc')}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 dark:border-transparent flex flex-col items-center justify-center relative">
                  <img
                    src={checkoutModal.qrUrl}
                    alt="VietQR Code"
                    className="w-64 h-64 object-contain rounded-lg"
                  />
                  <span className="text-[11px] text-slate-600 mt-2 font-medium">
                    {t('pricing_modal_scan_hint')}
                  </span>
                </div>

                <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-white/10 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t('pricing_modal_tier')}</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{checkoutModal.tier} VIP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t('pricing_modal_amount')}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {checkoutModal.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t('pricing_modal_note')}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      {checkoutModal.orderCode}
                    </span>
                  </div>
                </div>

                {/* Realtime Listening Status Banner */}
                <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-cyan-500" />
                  <span className="text-[11px] font-medium">
                    Đang tự động lắng nghe giao dịch chuyển khoản...
                  </span>
                </div>

                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/pricing/order?orderCode=${encodeURIComponent(checkoutModal.orderCode)}`);
                      if (res.ok) {
                        const data = await res.json();
                        if (data.status === 'PAID') {
                          setCheckoutModal((prev) => (prev ? { ...prev, status: 'PAID' } : null));
                          return;
                        }
                      }
                    } catch {}
                    alert('Hệ thống chưa nhận được thông tin chuyển khoản từ ngân hàng. Nếu bạn đã quét mã và chuyển tiền, vui lòng đợi 5-15 giây để SePay đồng bộ tự động!');
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
                >
                  Kiểm tra giao dịch ngay
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
