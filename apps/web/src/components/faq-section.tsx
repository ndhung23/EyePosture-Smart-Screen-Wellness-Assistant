'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Sparkles, Eye, Monitor, Cpu, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function FaqSection() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      icon: Sparkles,
      q: isVi
        ? 'EyePosture là gì và giải quyết vấn đề gì cho người dùng máy tính?'
        : 'What is EyePosture and what problems does it solve?',
      a: isVi
        ? 'EyePosture là phần mềm Desktop thông minh ứng dụng trí tuệ nhân tạo (AI Computer Vision) cục bộ giúp người dùng máy tính bảo vệ mắt và giữ tư thế ngồi chuẩn y khoa. Phần mềm liên tục theo dõi góc nghiêng cổ C1-C7, phát hiện gù lưng, đo khoảng cách an toàn tới màn hình (50-70cm), đồng thời nhắc chớp mắt và thực hiện quy tắc 20-20-20 để ngăn ngừa hội chứng thị giác màn hình (CVS) và thoái hóa cột sống cổ.'
        : 'EyePosture is a desktop screen wellness assistant powered by on-device AI. It continuously monitors cervical spine posture, detects slouching, measures safe screen distance (50-70cm), and delivers intelligent blink and 20-20-20 rule reminders to combat Computer Vision Syndrome (CVS) and spinal fatigue.',
    },
    {
      icon: ShieldCheck,
      q: isVi
        ? 'Webcam có ghi hình hay gửi video lên mạng không? Bảo mật ra sao?'
        : 'Does the webcam record or send video to the cloud? How is privacy protected?',
      a: isVi
        ? 'Tuyệt đối KHÔNG. EyePosture cam kết bảo mật 100% On-Device Privacy. Toàn bộ quá trình nhận diện tư thế và mắt được tính toán trực tiếp trên phần cứng máy tính của bạn (CPU/GPU/NPU). Không có bất kỳ hình ảnh hay luồng video nào bị lưu trữ vào ổ cứng hay truyền tải lên internet.'
        : 'Absolutely NOT. EyePosture operates with 100% On-Device Privacy. All computer vision inference runs locally on your PC (CPU/GPU/NPU). Zero frames, images, or video streams are ever stored on disk or transmitted over the internet.',
    },
    {
      icon: Eye,
      q: isVi
        ? 'Quy tắc 20-20-20 và cơ chế nhắc chớp mắt hoạt động thế nào?'
        : 'How does the 20-20-20 rule and blink reminder mechanism work?',
      a: isVi
        ? 'Theo khuyến nghị y khoa nhãn khoa quốc tế, cứ mỗi 20 phút nhìn màn hình, bạn nên nhìn xa 20 feet (6 mét) trong 20 giây để các cơ điều tiết của mắt được thư giãn hoàn toàn. EyePosture tự động tính toán thời gian làm việc thực tế và hiển thị thông báo dịu nhẹ, kết hợp nhận diện tần suất chớp mắt để cấp ẩm giác mạc tự nhiên.'
        : 'Following international ophthalmology standards, every 20 minutes of screen time, you should look at an object 20 feet away for 20 seconds. EyePosture tracks active screen time and provides gentle visual cues alongside blink rate detection to maintain natural corneal hydration.',
    },
    {
      icon: Monitor,
      q: isVi
        ? 'EyePosture phát hiện gù lưng và cảnh báo khoảng cách màn hình ra sao?'
        : 'How does EyePosture detect hunchback posture and screen distance?',
      a: isVi
        ? 'EyePosture ước lượng khoảng cách dựa trên kích thước vùng mặt theo quy luật thị sai hình học. Khi bạn cúi đầu chúc xuống (gập đốt sống cổ > 30 độ) hoặc tiến quá sát màn hình (< 50cm) quá thời gian ngưỡng cài đặt, phần mềm sẽ hiển thị cảnh báo trực quan hoặc âm thanh nhắc nhở bạn ngồi thẳng lưng.'
        : 'EyePosture estimates distance using facial geometric parallax. When your head tilts forward (neck flexion > 30°) or sits too close to the screen (< 50cm) past your threshold, gentle HUD banners or audio alerts remind you to adjust your posture.',
    },
    {
      icon: Cpu,
      q: isVi
        ? 'EyePosture hỗ trợ hệ điều hành nào và có làm chậm máy tính không?'
        : 'Which operating systems are supported and does it consume high PC resources?',
      a: isVi
        ? 'EyePosture hiện tương thích hoàn hảo với Windows 10 và Windows 11 (64-bit). Mô hình AI được tối ưu hóa cực nhẹ, mức tiêu thụ CPU thông thường chỉ từ 1% - 3% và tiêu tốn dưới 150MB RAM, đảm bảo máy hoạt động êm ái khi bạn làm việc, lập trình hoặc chơi game.'
        : 'EyePosture currently supports Windows 10 and Windows 11 (64-bit). The AI engine is ultra-lightweight, using only 1%-3% CPU and under 150MB RAM, ensuring smooth performance during coding, office work, or gaming.',
    },
    {
      icon: HelpCircle,
      q: isVi
        ? 'Làm thế nào để tải và bắt đầu sử dụng EyePosture?'
        : 'How do I download and get started with EyePosture?',
      a: isVi
        ? 'Bạn chỉ cần nhấn nút "Tải Bản Cài Windows (.exe)" trên trang chủ eyeposture.vercel.app để tải về bộ cài đặt tự động. Sau khi cài đặt, ứng dụng chạy ngay và không bắt buộc đăng nhập để dùng thử các tính năng công thái học cơ bản.'
        : 'Simply click "Download for Windows (.exe)" on eyeposture.vercel.app. Once installed, the app launches instantly without mandatory account creation for basic ergonomic features.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-slate-100/60 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isVi ? 'Hỏi Đáp Chuyên Sâu & Y Khoa' : 'Frequently Asked Questions'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isVi ? 'Những Thắc Mắc Thường Gặp Về ' : 'Frequently Asked About '}
            <span className="bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
              EyePosture AI
            </span>
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            {isVi
              ? 'Mọi thông tin về cơ chế phát hiện tư thế, bảo vệ thị giác, công nghệ AI on-device và quyền riêng tư tuyệt đối.'
              : 'Everything you need to know about posture detection, eye protection, on-device AI technology, and zero-compromise privacy.'}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const Icon = faq.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white dark:bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                    : 'bg-white/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isOpen
                          ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-base text-slate-900 dark:text-slate-100">
                      {faq.q}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-cyan-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/50">
                    <p className="mt-2">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/20">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Bạn còn thắc mắc khác hoặc cần hỗ trợ xử lý sự cố?' : 'Still have questions or need technical incident support?'}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl mx-auto">
            {isVi
              ? 'Đội ngũ kỹ thuật EyePosture hỗ trợ 24/7 về cài đặt, lỗi camera, kích hoạt bản quyền và tiếp nhận sự cố kỹ thuật qua Hotline & Email:'
              : 'Our engineering team is active 24/7 for troubleshooting, camera issues, and licensing support:'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-5">
            <a
              href="tel:0359928446"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hotline / Zalo: 0359928446</span>
            </a>
            <a
              href="mailto:eyeposture@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 shadow-sm transition-all active:scale-95"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>Email: eyeposture@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
