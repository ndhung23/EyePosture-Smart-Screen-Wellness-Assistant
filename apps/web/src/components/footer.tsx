'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function Footer() {
  const { t, language } = useLanguage();
  const isVi = language === 'vi';

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 py-14 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-slate-200 dark:border-slate-800/80">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/EyePosture.png"
                alt="EyePosture Logo"
                className="w-9 h-9 rounded-xl object-contain shadow-md shadow-cyan-500/10"
              />
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  EyePosture
                </span>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                  AI Smart Screen Wellness Assistant
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              {isVi
                ? 'Ứng dụng Desktop ứng dụng AI On-device phân tích khoảng cách tầm nhìn, cảnh báo gù lưng và nhắc nhở quy tắc 20-20-20 bảo vệ cột sống và thị lực chuẩn y khoa.'
                : 'Desktop application with On-device AI analyzing screen distance, slouching warnings, and 20-20-20 eye wellness rules.'}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isVi ? 'Kỹ thuật viên trực hỗ trợ 24/7' : 'Technical Support Active 24/7'}</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {isVi ? 'Liên Kết Nhanh' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a href="/#features" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                  {t('nav_features')}
                </a>
              </li>
              <li>
                <a href="/#wellness" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                  {t('nav_wellness')}
                </a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                  {t('nav_pricing')}
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                  {isVi ? 'Hỏi Đáp Thường Gặp (FAQ)' : 'FAQ'}
                </a>
              </li>
              <li>
                <Link href="/affiliate" className="hover:text-amber-500 dark:hover:text-amber-400 font-semibold text-amber-600 dark:text-amber-400 transition flex items-center gap-1">
                  <span>{t('nav_affiliate')}</span>
                </Link>
              </li>
              <li>
                <a href="/api/download" className="hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition">
                  {t('nav_download')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-cyan-500" />
              <span>{isVi ? 'Hỗ Trợ Kỹ Thuật & Sự Cố' : 'Technical Support & Incident'}</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isVi
                ? 'Khi gặp sự cố về cài đặt, lỗi camera AI, kích hoạt bản quyền hoặc cần giải đáp:'
                : 'For installation issues, camera AI connection, license activation, or assistance:'}
            </p>
            <div className="space-y-2.5 pt-1">
              <a
                href="tel:0359928446"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-sm group"
              >
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-normal">Hotline / Zalo</div>
                  <div className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">0359928446</div>
                </div>
              </a>

              <a
                href="mailto:eyeposture@gmail.com"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-sm group"
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-normal">Email Tiếp Nhận Sự Cố</div>
                  <div className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">eyeposture@gmail.com</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span>© 2026 EyePosture Project. EXE101 FPT University.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% On-Device Privacy</span>
            <span>•</span>
            <span>Windows 10 &amp; 11 Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
