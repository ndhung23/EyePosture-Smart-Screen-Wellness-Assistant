'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, Sparkles, Tag, ArrowRight, QrCode, X, ChevronDown, Loader2, CheckCircle2, Crown, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

export function Pricing({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user, updateUser } = useAuth();
  const { t, language } = useLanguage();
  const isVi = language === 'vi';
  const [interval, setInterval] = useState<'month' | 'year' | 'lifetime'>('year');
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
    PRO_lifetime: 299000,
    FAMILY_month: 49000,
    FAMILY_year: 299000,
    FAMILY_lifetime: 499000,
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

    // Kiểm tra mã giới thiệu Affiliate từ URL hoặc localStorage
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref') || urlParams.get('affiliate');
      const targetRef = refParam || localStorage.getItem('eyeposture_ref');

      if (targetRef) {
        const cleanRef = targetRef.trim().toUpperCase();
        localStorage.setItem('eyeposture_ref', cleanRef);
        setVoucherCode(cleanRef);
        setShowVoucherInput(true);

        if (refParam) {
          fetch('/api/affiliate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'track_click', code: cleanRef }),
          }).catch(() => {});
        }

        fetch(`/api/vouchers?code=${encodeURIComponent(cleanRef)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.valid) {
              setAppliedVoucher({ code: data.code, discountPercent: data.discountPercent });
              setVoucherMessage({
                text: `Mã giới thiệu "${data.code}" hợp lệ! Giảm ngay ${data.discountPercent}% cho đơn hàng`,
                isError: false,
              });
            }
          })
          .catch(() => {});
      }
    } catch {}
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
                expiresAt: Date.now() + (interval === 'lifetime' ? 36500 : interval === 'year' ? 365 : 30) * 86400 * 1000,
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
    PRO: dbPlans[`PRO_${interval}`] || (interval === 'lifetime' ? 299000 : interval === 'year' ? 199000 : 19000),
    FAMILY: dbPlans[`FAMILY_${interval}`] || (interval === 'lifetime' ? 499000 : interval === 'year' ? 299000 : 49000),
  };

  const originalPrices = {
    PRO: interval === 'lifetime' ? 699000 : interval === 'year' ? 399000 : 39000,
    FAMILY: interval === 'lifetime' ? 999000 : interval === 'year' ? 599000 : 99000,
  };

  const unitText = interval === 'lifetime'
    ? (isVi ? ' trọn đời' : ' lifetime')
    : interval === 'year'
    ? (isVi ? ' / năm' : ' / year')
    : (isVi ? ' / tháng' : ' / month');

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
          affiliateCode: appliedVoucher?.code || (typeof window !== 'undefined' ? localStorage.getItem('eyeposture_ref') : undefined) || undefined,
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
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>{isVi ? 'BẢNG GIÁ MINH BẠCH' : 'TRANSPARENT PRICING'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            <span>{isVi ? 'Gói Dịch Vụ & ' : 'Plans & '}</span>
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 dark:from-teal-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent">
              {isVi ? 'Giấy Phép Bản Quyền' : 'Software Licensing'}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {isVi
              ? 'Bản quyền phần mềm thanh toán linh hoạt qua cổng SePay Webhook (VietQR) và thẻ quốc tế.'
              : 'Flexible licensing powered by automated bank webhook QR payments and cards.'}
          </p>

          {/* Luxury 3-State Billing Interval Switcher */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 backdrop-blur-xl mt-6 shadow-sm">
            <button
              onClick={() => setInterval('month')}
              className={`btn-tactile px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 ${
                interval === 'month'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isVi ? '1 Tháng' : '1 Month'}
            </button>
            <button
              onClick={() => setInterval('year')}
              className={`btn-tactile flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 ${
                interval === 'year'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{isVi ? '1 Năm' : '1 Year'}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase shadow-sm">
                {isVi ? 'TIẾT KIỆM' : 'SAVE'}
              </span>
            </button>
            <button
              onClick={() => setInterval('lifetime')}
              className={`btn-tactile flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 ${
                interval === 'lifetime'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{isVi ? 'Trọn đời' : 'Lifetime'}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-purple-500 text-white text-[10px] font-extrabold uppercase shadow-sm">
                {isVi ? 'MUA 1 LẦN' : 'ONE-TIME'}
              </span>
            </button>
          </div>
        </div>

        {/* Current Active Plan Banner if logged in with PRO/FAMILY */}
        {user?.subscription?.status === 'ACTIVE' && user.subscription.tier !== 'FREE' && (
          <div className="max-w-4xl mx-auto mb-10 p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-400/40 flex items-center justify-between gap-4 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20 shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-400">
                    {isVi ? 'GÓI HIỆN TẠI' : 'CURRENT PLAN'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                    👑 {user.subscription.tier} VIP
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {isVi
                    ? `Bản quyền ${user.subscription.tier === 'FAMILY' ? 'Gia đình (Family)' : 'Cá nhân (Pro)'} đã được xác thực mã hóa an toàn với đầy đủ các mô hình góc nghiêng & khoảng cách mắt.`
                    : `Your ${user.subscription.tier} VIP license is cryptographically verified with full posture & eye models.`}
                </p>
              </div>
            </div>
            <a
              href="/dashboard"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition active:scale-95 shrink-0"
            >
              {isVi ? 'Xem Dashboard' : 'View Dashboard'}
            </a>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* ============================================================ */}
          {/* CARD 1: FREE PLAN                                            */}
          {/* ============================================================ */}
          <div className="rounded-[28px] p-7 sm:p-8 bg-white/95 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl flex flex-col justify-between hover-card-glow hover:-translate-y-2 hover:shadow-2xl hover:border-cyan-500/30 transition-all duration-300 ease-out shadow-lg shadow-slate-200/50 dark:shadow-xl">
            <div>
              <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                {isVi ? 'CƠ BẢN' : 'STANDARD'}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {isVi ? 'Gói Miễn phí (Free)' : 'Free Plan'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                {isVi ? 'Bộ đếm 20-20-20 & nhắc uống nước' : 'Essential habit reminders'}
              </p>

              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">0đ</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/{isVi ? 'vĩnh viễn' : 'forever'}</span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 mb-8 border-t border-slate-200 dark:border-white/5 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                  <span>{isVi ? 'Bộ đếm chu kỳ nghỉ mắt 20-20-20' : '20-20-20 Eye break timer'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                  <span>{isVi ? 'Nhắc nhở uống nước công thái học' : 'Hydration reminders'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                  <span>{isVi ? 'Theo dõi thời gian dùng màn hình cơ bản' : 'Screen time tracking'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                  <span>{isVi ? 'Xử lý 100% On-device bảo mật' : '100% On-device privacy'}</span>
                </li>
              </ul>
            </div>

            <a
              href="/api/download"
              className="btn-tactile w-full py-3.5 px-4 rounded-xl border border-slate-300 dark:border-white/10 hover:border-teal-500/40 text-center font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 bg-slate-50 dark:bg-white/5 transition-all duration-200 active:scale-95"
            >
              {isVi ? 'Tải Bản Cài Miễn Phí' : 'Download Free App'}
            </a>
          </div>

          {/* ============================================================ */}
          {/* CARD 2: PRO PLAN                                             */}
          {/* ============================================================ */}
          <div className="relative rounded-[32px] p-[2px] overflow-hidden lg:-translate-y-4 hover:-translate-y-6 transition-transform duration-300 ease-out shadow-xl dark:shadow-[0_0_60px_rgba(20,184,166,0.2)] hover:shadow-2xl hover:shadow-teal-500/20">
            {/* Animated Rotating Conic LED Border */}
            <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,#14b8a6,#06b6d4,#6366f1,#a855f7,#14b8a6)] animate-spin-slow pointer-events-none" />

            {/* Inner Pro Card Container */}
            <div className="relative h-full rounded-[30px] bg-white dark:bg-slate-900 p-7 sm:p-8 flex flex-col justify-between border border-teal-400/40 dark:border-teal-500/30">
              {/* Floating Top-Right Badge: CÁ NHÂN */}
              <div className="absolute top-0 right-0 bg-teal-500 text-slate-950 text-[10px] uppercase tracking-wider font-extrabold px-3.5 py-1 rounded-bl-xl shadow-sm">
                {isVi ? 'Cá nhân' : 'Personal'}
              </div>

              <div>
                <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1.5 mt-1">
                  {isVi ? 'CHUYÊN NGHIỆP' : 'PRO VIP'}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{isVi ? 'Gói Cá nhân (Pro)' : 'Personal Plan (Pro)'}</span>
                  <Crown className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                  {isVi ? 'Dành cho 1 người dùng cá nhân' : 'For 1 individual workstation user'}
                </p>

                {/* Ultra High-Contrast Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-teal-600 dark:text-teal-400 drop-shadow-sm">
                      {getDiscountedPrice(basePrices.PRO).toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {unitText}
                    </span>
                  </div>

                  {originalPrices.PRO > basePrices.PRO && !appliedVoucher && (
                    <div className="text-xs text-slate-400 line-through mt-1 font-medium">
                      {isVi ? 'Giá gốc:' : 'Regular:'} {originalPrices.PRO.toLocaleString('vi-VN')}đ
                    </div>
                  )}

                  {appliedVoucher && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        {isVi ? 'Giá gốc:' : 'Regular:'} <del className="text-slate-400">{basePrices.PRO.toLocaleString('vi-VN')}đ</del> (-{appliedVoucher.discountPercent}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-200 mb-8 border-t border-slate-200 dark:border-white/10 pt-6">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {isVi ? '1 tài khoản cho 1 người dùng' : '1 account for 1 user'}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                    <span>{isVi ? 'Ước tính góc nghiêng tư thế bằng thị giác máy tính' : 'Continuous posture angle estimation'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                    <span>{isVi ? 'Giám sát khoảng cách mắt công thái học chuẩn' : 'Smart eye distance monitor'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                    <span>{isVi ? 'Cảnh báo thích ứng chống mỏi mắt thông minh' : 'Anti-fatigue adaptive alerts'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                    <span>{isVi ? 'Báo cáo thống kê xu hướng tuần & tháng' : 'Weekly & monthly trend analytics'}</span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              {user?.subscription?.tier === 'PRO' && user?.subscription?.status === 'ACTIVE' ? (
                <div className="w-full py-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-400 font-bold text-xs text-center">
                  {isVi ? 'Bản quyền Pro đang kích hoạt' : 'Pro License Active'}
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout('PRO')}
                  disabled={creatingOrder}
                  className="btn-tactile relative overflow-hidden group w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-center font-bold text-sm text-slate-950 dark:text-white shadow-xl shadow-teal-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-teal-400/40"
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span>
                    {isVi
                      ? `Nâng Cấp Cá Nhân (${getDiscountedPrice(basePrices.PRO).toLocaleString('vi-VN')}đ)`
                      : `Upgrade Personal (${getDiscountedPrice(basePrices.PRO).toLocaleString('vi-VN')}đ)`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 3: FAMILY PLAN                                          */}
          {/* ============================================================ */}
          <div className="relative rounded-[28px] p-7 sm:p-8 bg-white/95 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl flex flex-col justify-between hover-card-glow hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-400/50 transition-all duration-300 ease-out shadow-lg shadow-slate-200/50 dark:shadow-xl overflow-hidden">
            {/* Top-Right Badge: 4 USERS */}
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-3.5 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{isVi ? '4 Người dùng' : '4 Users'}</span>
            </div>

            <div>
              <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">
                {isVi ? 'GIA ĐÌNH' : 'FAMILY VIP'}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{isVi ? 'Gói Gia đình (Family)' : 'Family Plan'}</span>
                <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold mt-1 mb-5">
                {isVi ? '1 tài khoản được 4 người dùng' : '1 account supports 4 users'}
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                    {getDiscountedPrice(basePrices.FAMILY).toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {unitText}
                  </span>
                </div>

                {originalPrices.FAMILY > basePrices.FAMILY && !appliedVoucher && (
                  <div className="text-xs text-slate-400 line-through mt-1 font-medium">
                    {isVi ? 'Giá gốc:' : 'Regular:'} {originalPrices.FAMILY.toLocaleString('vi-VN')}đ
                  </div>
                )}

                {appliedVoucher && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>
                      {isVi ? 'Giá gốc:' : 'Regular:'} <del className="text-slate-400">{basePrices.FAMILY.toLocaleString('vi-VN')}đ</del> (-{appliedVoucher.discountPercent}%)
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 mb-8 border-t border-slate-200 dark:border-white/5 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    {isVi ? '⭐ 1 tài khoản được 4 người dùng' : '⭐ 1 account supports 4 users'}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span>{isVi ? 'Đầy đủ tất cả tính năng Chuyên nghiệp (Pro)' : 'All Pro features included'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span>{isVi ? 'Hồ sơ người lớn & trẻ em không giới hạn' : 'Unlimited adult & child profiles'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span>{isVi ? 'Kiểm soát phụ huynh & giới hạn giờ màn hình' : 'Parental screen limiters'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span>{isVi ? 'Đồng bộ hồ sơ trên tối đa 4 thiết bị' : 'Sync profiles across up to 4 devices'}</span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            {user?.subscription?.tier === 'FAMILY' && user?.subscription?.status === 'ACTIVE' ? (
              <div className="w-full py-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-bold text-xs text-center">
                {isVi ? 'Bản quyền Family đang kích hoạt' : 'Family License Active'}
              </div>
            ) : (
              <button
                onClick={() => handleCheckout('FAMILY')}
                disabled={creatingOrder}
                className="btn-tactile w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span>
                  {isVi
                    ? `Chọn Gói Gia Đình (${getDiscountedPrice(basePrices.FAMILY).toLocaleString('vi-VN')}đ)`
                    : `Select Family (${getDiscountedPrice(basePrices.FAMILY).toLocaleString('vi-VN')}đ)`}
                </span>
              </button>
            )}
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
                    <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Thời hạn:' : 'Duration:'}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {interval === 'lifetime' ? (isVi ? 'Trọn đời (Lifetime)' : 'Lifetime') : interval === 'year' ? (isVi ? '1 Năm' : '1 Year') : (isVi ? '1 Tháng' : '1 Month')}
                    </span>
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
