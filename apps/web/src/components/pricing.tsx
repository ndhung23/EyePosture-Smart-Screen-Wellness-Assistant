'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Tag, ArrowRight, ShieldCheck, QrCode, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

export function Pricing({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [interval, setInterval] = useState<'month' | 'year'>('year');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountPercent: number } | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<{ tier: string; amount: number; orderCode: string; qrUrl: string } | null>(null);

  const basePrices = {
    PRO: interval === 'year' ? 590000 : 59000,
    FAMILY: interval === 'year' ? 990000 : 99000,
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

  const handleCheckout = (tier: 'PRO' | 'FAMILY') => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const finalAmount = getDiscountedPrice(basePrices[tier]);
    const orderCode = `EP${Math.floor(100000 + Math.random() * 900000)}`;
    const bankAccount = '0339949168';
    const bankCode = 'MB';
    const accountName = 'NGUYEN DUY HUNG';
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${finalAmount}&addInfo=${orderCode}&accountName=${encodeURIComponent(
      accountName
    )}`;

    setCheckoutModal({
      tier,
      amount: finalAmount,
      orderCode,
      qrUrl,
    });
  };

  return (
    <section id="pricing" className="py-20 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 dark:text-cyan-400 light:text-indigo-600">
            {t('pricing_tag')}
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
            {t('pricing_title')}
          </p>
          <p className="text-base text-slate-400 dark:text-slate-400 light:text-slate-600">
            {t('pricing_subtitle')}
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-900 dark:bg-slate-900 light:bg-slate-200 border border-slate-800 dark:border-slate-800 light:border-slate-300 mt-4">
            <button
              onClick={() => setInterval('month')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                interval === 'month'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow'
                  : 'text-slate-400 light:text-slate-700 hover:text-white'
              }`}
            >
              {t('pricing_monthly')}
            </button>
            <button
              onClick={() => setInterval('year')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                interval === 'year'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow'
                  : 'text-slate-400 light:text-slate-700 hover:text-white'
              }`}
            >
              <span>{t('pricing_yearly')}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase">
                {t('pricing_save_20')}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* FREE PLAN */}
          <div className="rounded-3xl p-8 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider mb-2">
                {t('pricing_free_tier')}
              </div>
              <h3 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-4">
                {t('pricing_free_name')}
              </h3>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900">0đ</span>
                <span className="text-xs text-slate-400">/{language === 'vi' ? 'vĩnh viễn' : 'forever'}</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">{t('pricing_free_desc')}</p>

              <ul className="space-y-3.5 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t('pricing_feat_free_1')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t('pricing_feat_free_2')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t('pricing_feat_free_3')}</span>
                </li>
              </ul>
            </div>

            <a
              href="https://github.com/ndhung23/EyePosture-Smart-Screen-Wellness-Assistant/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 text-center font-bold text-xs text-slate-300 dark:text-slate-300 light:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-100 transition"
            >
              {t('pricing_free_btn')}
            </a>
          </div>

          {/* PRO PLAN (HIGHLIGHTED) */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-b from-indigo-950/60 via-slate-900/90 to-purple-950/60 dark:bg-gradient-to-b dark:from-indigo-950/60 dark:to-purple-950/60 light:bg-white border-2 border-indigo-500/80 shadow-2xl shadow-indigo-500/20 flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
              {t('pricing_pro_badge')}
            </div>

            <div>
              <div className="text-xs font-bold text-cyan-400 dark:text-cyan-400 light:text-indigo-600 uppercase tracking-wider mb-2">
                {t('pricing_pro_tier')}
              </div>
              <h3 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-4">
                {t('pricing_pro_name')}
              </h3>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300 light:from-indigo-600 light:to-purple-600">
                    {getDiscountedPrice(basePrices.PRO).toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-xs text-slate-400">/{interval === 'year' ? (language === 'vi' ? 'năm' : 'year') : (language === 'vi' ? 'tháng' : 'month')}</span>
                </div>
                {appliedVoucher && (
                  <div className="text-xs text-emerald-400 font-semibold mt-1">
                    Giá gốc: <del className="text-slate-500">{basePrices.PRO.toLocaleString('vi-VN')}đ</del> (-{appliedVoucher.discountPercent}%)
                  </div>
                )}
              </div>

              {/* Voucher Code Box */}
              <div className="mb-6 p-3 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-2">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('pricing_voucher_label')}</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder={t('pricing_voucher_placeholder')}
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase font-mono"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={checkingVoucher}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    {checkingVoucher ? '...' : t('pricing_voucher_apply')}
                  </button>
                </div>
                {voucherMessage && (
                  <p
                    className={`text-[10px] mt-2 font-medium ${
                      voucherMessage.isError ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {voucherMessage.text}
                  </p>
                )}
              </div>

              <ul className="space-y-3.5 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="font-semibold text-white light:text-slate-900">{t('pricing_feat_pro_1')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>{t('pricing_feat_pro_2')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>{t('pricing_feat_pro_3')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>{t('pricing_feat_pro_4')}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('PRO')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-center font-bold text-xs text-white shadow-lg shadow-indigo-500/25 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{t('pricing_pro_btn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* FAMILY PLAN */}
          <div className="rounded-3xl p-8 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-purple-400 dark:text-purple-400 light:text-purple-600 uppercase tracking-wider mb-2">
                {t('pricing_family_tier')}
              </div>
              <h3 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-4">
                {t('pricing_family_name')}
              </h3>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900">
                  {getDiscountedPrice(basePrices.FAMILY).toLocaleString('vi-VN')}đ
                </span>
                <span className="text-xs text-slate-400">/{interval === 'year' ? (language === 'vi' ? 'năm' : 'year') : (language === 'vi' ? 'tháng' : 'month')}</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">{t('pricing_family_desc')}</p>

              <ul className="space-y-3.5 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="font-semibold text-white light:text-slate-900">{t('pricing_feat_family_1')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>{t('pricing_feat_family_2')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>{t('pricing_feat_family_3')}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('FAMILY')}
              className="w-full py-3 px-4 rounded-xl border border-purple-500/50 hover:bg-purple-500/10 text-center font-bold text-xs text-purple-300 dark:text-purple-300 light:text-purple-700 transition"
            >
              {t('pricing_family_btn')}
            </button>
          </div>
        </div>
      </div>

      {/* Checkout VietQR Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-5">
            <button
              onClick={() => setCheckoutModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">{t('pricing_vietqr_title')}</h4>
                <p className="text-xs text-slate-400">{t('pricing_vietqr_desc')}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center">
              <img
                src={checkoutModal.qrUrl}
                alt="VietQR Code"
                className="w-64 h-64 object-contain rounded-lg"
              />
              <span className="text-[11px] text-slate-600 mt-2 font-medium">
                {t('pricing_modal_scan_hint')}
              </span>
            </div>

            <div className="space-y-2 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">{t('pricing_modal_tier')}</span>
                <span className="font-bold text-cyan-400">{checkoutModal.tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('pricing_modal_amount')}</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {checkoutModal.amount.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('pricing_modal_note')}</span>
                <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  {checkoutModal.orderCode}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                alert(t('pricing_modal_alert'));
                setCheckoutModal(null);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition"
            >
              {t('pricing_vietqr_done')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
