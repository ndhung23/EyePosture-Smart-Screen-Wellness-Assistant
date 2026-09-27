'use client';

import React from 'react';
import { Crown, Sparkles, Calendar, CheckCircle2, Gift, Users, Megaphone, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function AffiliateCommissionTable() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  return (
    <section id="commission-policy" className="py-16 md:py-24 bg-slate-50/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isVi ? 'Chính Sách Minh Bạch' : 'Transparent Policy'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isVi ? 'Phân Bổ Tỷ Lệ Hoa Hồng Chuẩn SaaS' : 'SaaS-Standard Commission Distribution'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {isVi
              ? 'Khác với hàng vật lý (chỉ chi trả 5% – 15%), EyePosture xử lý AI 100% On-Device nên chi phí duy trì server gần như bằng 0. Chúng tôi chia sẻ mức hoa hồng cao nhất để kích thích người giới thiệu.'
              : 'Unlike physical goods (only 5%–15%), EyePosture runs 100% On-Device AI with zero server maintenance overhead, passing massive profit margins back to partners.'}
          </p>
        </div>

        {/* 1. Pricing Plan Commission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Lifetime Card - Gói Chủ Lực */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-500/40 shadow-xl shadow-amber-500/10 flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[11px] uppercase tracking-wider shadow-md">
              {isVi ? 'Gói Chủ Lực Đẩy Affiliate' : 'Top Recommendation'}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Crown className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-amber-500">35% – 40%</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isVi ? 'Gói Trọn Đời (Lifetime)' : 'Lifetime Plan'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isVi ? 'Mức giá: 299.000đ – 499.000đ' : 'Price: 299,000đ – 499,000đ'}
              </p>

              <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-slate-900 dark:text-white">
                <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  {isVi ? 'Tiền hoa hồng bạn nhận được:' : 'Commission per order:'}
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  ~100.000đ – 200.000đ <span className="text-xs font-normal text-slate-500">/ {isVi ? 'đơn' : 'order'}</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{isVi ? 'Gói được người dùng văn phòng và lập trình viên chuộng nhất' : 'Most popular plan for programmers and office professionals'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{isVi ? 'Số tiền đủ hấp dẫn cho Content Creator, Reviewer công nghệ làm video' : 'Generous enough for TikTokers & tech reviewers to promote'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{isVi ? 'Người mua được giảm ngay 10% - 15% khi nhập mã của bạn' : 'Referred buyers get instant 10% - 15% discount'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Yearly Card */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-cyan-500">30% – 35%</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isVi ? 'Gói Theo Năm (1 Năm)' : 'Yearly Plan (1 Year)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isVi ? 'Mức giá: 199.000đ – 299.000đ' : 'Price: 199,000đ – 299,000đ'}
              </p>

              <div className="mt-6 p-4 rounded-2xl bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 text-slate-900 dark:text-white">
                <div className="text-xs text-cyan-700 dark:text-cyan-300 font-medium">
                  {isVi ? 'Tiền hoa hồng bạn nhận được:' : 'Commission per order:'}
                </div>
                <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                  ~60.000đ – 100.000đ <span className="text-xs font-normal text-slate-500">/ {isVi ? 'đơn' : 'order'}</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                  <span>{isVi ? 'Chi trả 1 lần nhanh chóng cho năm đầu tiên' : 'Immediate payout for the first year'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                  <span>{isVi ? 'Tỷ lệ chốt đơn rất cao nhờ mức giá hợp lý' : 'High conversion rate due to affordable yearly pricing'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Monthly Card */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-indigo-500">20%</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isVi ? 'Gói Theo Tháng' : 'Monthly Plan'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isVi ? 'Mức giá: 19.000đ – 49.000đ' : 'Price: 19,000đ – 49,000đ'}
              </p>

              <div className="mt-6 p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-500/20 text-slate-900 dark:text-white">
                <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                  {isVi ? 'Hoa hồng định kỳ (Recurring):' : 'Recurring commission:'}
                </div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  ~4.000đ – 10.000đ <span className="text-xs font-normal text-slate-500">/ {isVi ? 'tháng' : 'month'}</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{isVi ? 'Hoa hồng định kỳ đều đặn mỗi tháng người dùng duy trì gói' : 'Monthly recurring commission as long as user subscribes'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{isVi ? 'Có thể quy đổi thành thời gian sử dụng bản Family miễn phí' : 'Can be converted to free Family VIP access'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Win - Win Mechanism & 2-Tier Model */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Win-Win Mechanism */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isVi ? 'Cơ Chế Win - Win (Đôi Bên Cùng Có Lợi)' : 'Win - Win 2-Way Incentive'}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {isVi
                ? 'Không chỉ là link affiliate thông thường, EyePosture cung cấp mã giảm giá 2 chiều giúp bạn dễ dàng thuyết phục bạn bè hoặc fan hâm mộ:'
                : 'Beyond ordinary links, EyePosture provides a 2-way discount voucher making it effortless to convert your audience:'}
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  {isVi ? '1. Người Mua (Được giới thiệu): Giảm ngay 10% – 15%' : '1. Buyer: Saves 10% – 15% instantly'}
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  {isVi ? 'Nhập mã của bạn khi thanh toán, giá tự động chiết khấu ngay trên VietQR SePay.' : 'Enter your promo code at checkout for immediate QR price reduction.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                <div className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                  {isVi ? '2. Người Giới Thiệu (Bạn / KOC): Nhận 30% – 40%' : '2. Referrer: Earns 30% – 40% commission'}
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  {isVi ? 'Hệ thống tự động cộng tiền hoa hồng vào tài khoản ngay khi giao dịch thanh toán thành công.' : 'Instant commission credited to your balance upon successful SePay payment.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40">
                <div className="font-bold text-cyan-800 dark:text-cyan-300 text-sm">
                  {isVi ? '3. EyePosture (Chủ phần mềm): Thu về 55% – 60%' : '3. EyePosture: Retains 55% – 60% with CAC = 0'}
                </div>
                <p className="text-xs text-cyan-700 dark:text-cyan-400 mt-1">
                  {isVi ? 'Doanh thu thuần bền vững mà không mất chi phí quảng cáo, sẵn sàng chi trả hoa hồng cao nhất.' : 'Clean revenue with zero ad-spend overhead, allowing us to maintain high partner rewards.'}
                </p>
              </div>
            </div>
          </div>

          {/* 2-Tier Referrer Model */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isVi ? 'Mô Hình Phân Cấp Người Giới Thiệu' : '2-Tier Partner Model'}
                </h3>
              </div>

              <div className="space-y-6">
                {/* Tier 1 */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-500" />
                      {isVi ? 'Cấp 1: Người Dùng Thông Thường (Refer-a-friend)' : 'Tier 1: Regular Member (Refer-a-friend)'}
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      20% – 30%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isVi
                      ? 'Áp dụng cho mọi tài khoản đã đăng ký. Tặng 20% – 30% hoa hồng tiền mặt hoặc quy đổi thành thời gian sử dụng: Giới thiệu 1 người mua gói Năm/Trọn đời → Tặng 3 tháng dùng bản Family miễn phí.'
                      : 'For all registered users. 20%–30% cash commission or convert: 1 referral = 3 months free Family VIP license.'}
                  </p>
                </div>

                {/* Tier 2 */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <Megaphone className="w-4 h-4 text-amber-500" />
                      {isVi ? 'Cấp 2: Content Creator / KOC / Reviewer' : 'Tier 2: Content Creator / KOC / Reviewer'}
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                      30% – 40% VIP
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isVi
                      ? 'Dành cho dân công nghệ, công thái học, setup góc làm việc, TikToker & Reviewer. Hoa hồng 30% – 40% cao nhất thị trường. Cung cấp mã Voucher thương hiệu riêng tặng fan (Ví dụ: fan được giảm 15%, KOC nhận 40%).'
                      : 'For tech, desk setup, ergonomics creators. Top 30%–40% commission + private custom branded vouchers for your community.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
              {isVi ? '⚡ Đăng ký nâng cấp KOC trực tiếp chỉ với 1 cú click ngay trong Dashboard.' : '⚡ Upgrade to KOC Partner instantly inside your dashboard.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
