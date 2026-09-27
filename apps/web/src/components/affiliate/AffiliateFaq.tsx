'use client';

import React from 'react';
import { HelpCircle, CheckCircle, ArrowRight, Share2, DollarSign, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function AffiliateFaq({ onOpenAuth, isLoggedIn }: { onOpenAuth: () => void; isLoggedIn: boolean }) {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const steps = [
    {
      step: '01',
      title: isVi ? 'Đăng Ký & Lấy Mã Giảm Giá' : 'Register & Get Voucher',
      desc: isVi
        ? 'Đăng nhập chỉ mất 10 giây. Hệ thống tự động tạo mã voucher giảm giá 10% - 15% mang tên bạn và link tiếp thị riêng.'
        : 'Sign in within 10 seconds. The system immediately creates your 10%-15% voucher and unique referral link.',
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      step: '02',
      title: isVi ? 'Chia Sẻ & Quảng Bá' : 'Share & Promote',
      desc: isVi
        ? 'Gửi mã cho bạn bè đồng nghiệp, hoặc làm video TikTok, YouTube, bài đăng Facebook/LinkedIn giới thiệu về tính năng bảo vệ mắt & tư thế AI.'
        : 'Share your link with colleagues, or create TikTok/YouTube reviews about AI ergonomics and posture monitoring.',
      icon: Share2,
      color: 'text-cyan-500 bg-cyan-500/10',
    },
    {
      step: '03',
      title: isVi ? 'Nhận Hoa Hồng & Rút Tiền' : 'Earn & Cash Out',
      desc: isVi
        ? 'Hệ thống tự động ghi nhận hoa hồng 30% - 40% ngay khi khách thanh toán VietQR SePay. Bạn có thể rút tiền về mọi ngân hàng trong 24h.'
        : 'Earn 30%-40% commission instantly upon VietQR SePay confirmation. Cash out to any bank within 24 hours.',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
  ];

  const faqs = [
    {
      q: isVi ? 'Tôi có mất phí gì khi tham gia chương trình Affiliate không?' : 'Is there any fee to join the Affiliate Program?',
      a: isVi
        ? 'Hoàn toàn không. Chương trình tiếp thị liên kết EyePosture miễn phí 100% cho mọi người dùng và nhà sáng tạo nội dung.'
        : 'Zero fees. The EyePosture Affiliate Program is 100% free for all users and content creators.',
    },
    {
      q: isVi ? 'Người mua được hưởng lợi gì khi dùng mã của tôi?' : 'What benefit does the buyer get using my code?',
      a: isVi
        ? 'Đây là cơ chế Win-Win 2 chiều: Khách hàng nhập mã của bạn sẽ được giảm trực tiếp 10% (với Member) hoặc 15% (với KOC Partner) vào tổng hóa đơn thanh toán.'
        : 'This is a 2-way Win-Win mechanism: Buyers save 10% (Member) or 15% (KOC Partner) off their total invoice.',
    },
    {
      q: isVi ? 'Điều kiện để trở thành KOC Partner (nhận hoa hồng 40%) là gì?' : 'What are the requirements for KOC Partner (40% commission)?',
      a: isVi
        ? 'Bất kỳ ai sở hữu kênh TikTok, YouTube, Blog, trang cá nhân về Công nghệ, Công thái học, Góc làm việc (Desk setup) hoặc Y tế đều có thể bấm nút "Nâng cấp KOC" trong Dashboard để nhận ngay quyền lợi 40% trọn đời.'
        : 'Anyone with a TikTok, YouTube, tech blog, or ergonomic desk setup channel can apply via the dashboard to unlock 40% lifetime commission.',
    },
    {
      q: isVi ? 'Bao lâu thì tôi nhận được tiền rút về tài khoản ngân hàng?' : 'How fast are bank payouts processed?',
      a: isVi
        ? 'Lệnh rút tiền được kiểm tra và xử lý qua chuyển khoản nhanh Napas 24/7 trong vòng 24 giờ làm việc. Số tiền rút tối thiểu là 50.000 VNĐ.'
        : 'Payouts are processed via 24/7 Napas bank transfer within 24 working hours. Minimum payout is 50,000 VND.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3 Steps */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isVi ? '3 Bước Đơn Giản Để Bắt Đầu' : '3 Simple Steps to Start'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isVi ? 'Không cần thủ tục phức tạp, kích hoạt tự động trong 30 giây' : 'No complicated approval, instant 30-second activation'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl font-black text-slate-200 dark:text-slate-800 absolute top-6 right-6">
                  {st.step}
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${st.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{st.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isVi ? 'Câu Hỏi Thường Gặp' : 'FAQ'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {isVi ? 'Giải Đáp Thắc Mắc' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-2">
                  {faq.q}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Banner */}
          {!isLoggedIn && (
            <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-center shadow-xl shadow-amber-500/20">
              <h3 className="text-2xl sm:text-3xl font-black">
                {isVi ? 'Sẵn Sàng Gia Tăng Thu Nhập Thụ Động Cùng EyePosture?' : 'Ready to Earn Passive Income with EyePosture?'}
              </h3>
              <p className="mt-2 text-sm text-amber-100 max-w-xl mx-auto">
                {isVi
                  ? 'Gia nhập cộng đồng KOC và Đối tác ngay hôm nay để nhận mức chiết khấu hoa hồng 40% trọn đời.'
                  : 'Join our creator and partner community today to lock in 40% lifetime commission.'}
              </p>
              <button
                onClick={onOpenAuth}
                className="mt-6 px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-white hover:bg-amber-50 shadow-lg active:scale-95 transition-all text-sm sm:text-base"
              >
                {isVi ? 'Bắt Đầu Ngay (Miễn Phí)' : 'Get Started Free'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
