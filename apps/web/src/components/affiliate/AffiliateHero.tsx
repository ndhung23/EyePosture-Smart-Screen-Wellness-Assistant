'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface AffiliateHeroProps {
  onScrollToPortal: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
}

export function AffiliateHero({ onScrollToPortal, onOpenAuth, isLoggedIn }: AffiliateHeroProps) {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  return (
    <div className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-amber-500/15 via-cyan-500/15 to-purple-600/15 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs md:text-sm font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
          <span>{isVi ? 'Chương Trình Đối Tác & Tiếp Thị Liên Kết SaaS' : 'SaaS Creator & Affiliate Partner Program'}</span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-extrabold text-[10px]">
            HOA HỒNG 40%
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight md:leading-[1.15]">
          {isVi ? (
            <>
              Chia Sẻ Ứng Dụng Sức Khỏe AI <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                Nhận Hoa Hồng Lên Đến 40%
              </span>
            </>
          ) : (
            <>
              Share EyePosture AI Wellness <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                Earn Up To 40% Commission
              </span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          {isVi
            ? 'Xử lý AI 100% On-Device cục bộ, chi phí duy trì server trên mỗi người dùng gần như bằng 0. Biên lợi nhuận gộp cực cao cho phép EyePosture chia sẻ mức hoa hồng cao nhất thị trường cho đối tác và KOC.'
            : '100% On-Device AI processing with near-zero per-user server costs. High gross margin enables EyePosture to offer top-tier recurring & lifetime commissions for creators and affiliates.'}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {isLoggedIn ? (
            <button
              onClick={onScrollToPortal}
              className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <span>{isVi ? 'Vào Dashboard Affiliate Của Bạn' : 'Go To Your Affiliate Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <span>{isVi ? 'Đăng Nhập Lấy Mã Affiliate Ngay' : 'Sign In To Get Affiliate Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <a
            href="#commission-policy"
            className="px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-200"
          >
            {isVi ? 'Xem Bảng % Hoa Hồng' : 'View Commission Tiers'}
          </a>
        </div>

        {/* Key Highlights */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-sm flex items-start gap-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {isVi ? '35% – 40% Trọn Đời' : '35% – 40% Lifetime'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isVi ? 'Nhận ~100k - 200k mỗi đơn mua gói Lifetime' : 'Earn ~100k - 200k VND per lifetime license'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-sm flex items-start gap-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {isVi ? 'Win-Win 2 Chiều' : 'Win-Win 2-Way'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isVi ? 'Khách được giảm 10-15%, bạn nhận 30-40%' : 'Buyers save 10-15%, you earn 30-40%'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-sm flex items-start gap-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {isVi ? 'Rút Tiền 24h & Đổi VIP' : '24h Payout & VIP Swap'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isVi ? 'Chuyển khoản VietQR hoặc đổi 3 tháng VIP Family' : 'Direct bank transfer or 3-month Family VIP'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
