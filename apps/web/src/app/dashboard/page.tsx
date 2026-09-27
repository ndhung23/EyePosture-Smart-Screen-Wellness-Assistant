'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AuthModal } from '@/components/auth-modal';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { ProfileSection } from '@/components/dashboard/ProfileSection';
import { AffiliateSection } from '@/components/dashboard/AffiliateSection';
import { SupportSection } from '@/components/dashboard/SupportSection';
import {
  User,
  Share2,
  Headphones,
  Crown,
  Sparkles,
  ArrowRight,
  Shield,
  LayoutDashboard,
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'profile' | 'affiliate' | 'support'>('profile');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'affiliate' || tabParam === 'support' || tabParam === 'profile') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tier = user?.subscription?.tier || 'FREE';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {!user ? (
          /* Unauthenticated State */
          <div className="max-w-md mx-auto text-center py-20 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isVi ? 'Đăng Nhập Vào Dashboard' : 'Sign In To Your Dashboard'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {isVi
                ? 'Vui lòng đăng nhập để xem thông tin cá nhân, quản lý tiếp thị liên kết và kết nối kênh hỗ trợ.'
                : 'Please sign in to access your profile, affiliate portal, and support channels.'}
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-white text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              {isVi ? 'Đăng Nhập Ngay' : 'Sign In Now'}
            </button>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Dashboard Greeting Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    User Portal
                  </span>
                  <span
                    className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-md ${
                      tier === 'FAMILY'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : tier === 'PRO'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tier === 'FAMILY' ? '💎 FAMILY VIP' : tier === 'PRO' ? '⭐ PRO VIP' : 'FREE TIER'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {isVi ? `Xin chào, ${user.name || user.email.split('@')[0]}! 👋` : `Welcome back, ${user.name || user.email.split('@')[0]}! 👋`}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {isVi
                    ? 'Quản lý thông tin tài khoản cá nhân, theo dõi hoa hồng tiếp thị và kết nối kênh hỗ trợ chính thức.'
                    : 'Manage account profile, track affiliate performance, and contact official support.'}
                </p>
              </div>

              {/* Quick Action Link */}
              <div className="flex items-center gap-3">
                <a
                  href="/#pricing"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isVi ? 'Bảng Giá Nâng Cấp' : 'Upgrade Pricing'}</span>
                </a>
                <a
                  href="/api/download"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1.5 shadow-md shadow-cyan-600/20 active:scale-95"
                >
                  <span>{isVi ? 'Tải App Desktop (.exe)' : 'Download Windows .exe'}</span>
                </a>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'profile'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{isVi ? 'Thông Tin Cá Nhân & Bản Quyền' : 'Personal Profile & License'}</span>
              </button>

              <button
                onClick={() => setActiveTab('affiliate')}
                className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'affiliate'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>{isVi ? 'Tiếp Thị & Hoa Hồng (Affiliate 40%)' : 'Affiliate & Commissions (40%)'}</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                  VIP
                </span>
              </button>

              <button
                onClick={() => setActiveTab('support')}
                className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'support'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>{isVi ? 'Kênh Hỗ Trợ (eyeposture@gmail.com)' : 'Support Channel'}</span>
              </button>
            </div>

            {/* Active Tab View */}
            <div>
              {activeTab === 'profile' && <ProfileSection />}
              {activeTab === 'affiliate' && <AffiliateSection onOpenAuth={() => setAuthModalOpen(true)} />}
              {activeTab === 'support' && <SupportSection />}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </React.Suspense>
  );
}
