import React from 'react';
import {
  LayoutDashboard,
  ScanFace,
  Eye,
  Clock,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  ShieldCheck,
  Globe,
  User as UserIcon,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export type NavPage =
  | 'dashboard'
  | 'monitor'
  | 'breaks'
  | 'screenTime'
  | 'statistics'
  | 'profiles'
  | 'settings'
  | 'subscription'
  | 'privacy';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  const {
    language,
    switchLanguage,
    activeProfile,
    subscriptionTier,
    theme,
    effectiveTheme,
    switchTheme,
    requestAccessSettings,
    currentUser,
    openAuthModal,
    openProfileModal,
  } = useApp();

  const tier = (currentUser?.subscription?.tier || subscriptionTier || 'FREE').toUpperCase();

  const navItems = [
    { id: 'dashboard' as NavPage, labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { id: 'monitor' as NavPage, labelKey: 'nav.monitor', icon: ScanFace },
    { id: 'breaks' as NavPage, labelKey: 'nav.breaks', icon: Eye },
    { id: 'screenTime' as NavPage, labelKey: 'nav.screenTime', icon: Clock },
    { id: 'statistics' as NavPage, labelKey: 'nav.statistics', icon: BarChart3 },
    { id: 'settings' as NavPage, labelKey: 'nav.settings', icon: Settings },
    { id: 'subscription' as NavPage, labelKey: 'nav.subscription', icon: Sparkles, badge: subscriptionTier },
    { id: 'privacy' as NavPage, labelKey: 'nav.privacy', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between p-4 select-none shrink-0 h-screen">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <img
            src="./EyePosture.png"
            alt="EyePosture Logo"
            className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-teal-500/20 shrink-0"
            onError={(e) => {
              // Fallback if relative path differs
              (e.currentTarget as HTMLImageElement).src = '/EyePosture.png';
            }}
          />
          <div>
            <h1 className="font-display font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>EyePosture</span>
              {tier === 'FAMILY' && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                  FAMILY
                </span>
              )}
              {tier === 'PRO' && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm">
                  PRO
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">{t('app.tagline')}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'settings') {
                    requestAccessSettings(() => onSelectPage('settings'));
                  } else {
                    onSelectPage(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{t(item.labelKey)}</span>
                </div>
                {item.id === 'subscription' && (
                  tier === 'FAMILY' ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm flex items-center gap-0.5">
                      💎 FAMILY
                    </span>
                  ) : tier === 'PRO' ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm flex items-center gap-0.5">
                      👑 PRO
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      FREE
                    </span>
                  )
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Profile & Language */}
      <div className="pt-4 border-t border-slate-800/60 space-y-3">
        {/* Language selector */}
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('common.language')}</span>
          </div>
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/50">
            <button
              onClick={() => switchLanguage('en')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                language === 'en' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => switchLanguage('vi')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                language === 'vi' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VI
            </button>
          </div>
        </div>

        {/* Theme selector */}
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            {effectiveTheme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{t('settings.theme')}</span>
          </div>
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/50">
            <button
              onClick={() => switchTheme('light')}
              title={t('settings.themeLight')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                effectiveTheme === 'light' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              onClick={() => switchTheme('dark')}
              title={t('settings.themeDark')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                effectiveTheme === 'dark' ? 'bg-indigo-500 text-slate-100 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Account / User Card */}
        {currentUser ? (
          <div
            onClick={openProfileModal}
            title={language === 'vi' ? 'Nhấn để xem và sửa thông tin tài khoản' : 'Click to view and edit account'}
            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all hover:scale-[1.02] border ${
              tier === 'FAMILY'
                ? effectiveTheme === 'light'
                  ? 'bg-purple-50/90 border-purple-200 hover:bg-purple-100 text-purple-950 shadow-sm'
                  : 'bg-purple-950/30 border-purple-500/50 hover:bg-purple-900/40 text-purple-200'
                : tier === 'PRO'
                ? effectiveTheme === 'light'
                  ? 'bg-amber-50/90 border-amber-200 hover:bg-amber-100 text-amber-950 shadow-sm'
                  : 'bg-amber-950/30 border-amber-500/50 hover:bg-amber-900/40 text-amber-200'
                : effectiveTheme === 'light'
                ? 'bg-slate-100 border-slate-200 hover:bg-slate-200/70 text-slate-800'
                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/80 text-slate-200'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md shrink-0 ${
                tier === 'FAMILY'
                  ? 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white'
                  : tier === 'PRO'
                  ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold truncate">{currentUser.name}</p>
                {tier === 'FAMILY' && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-500/25 text-purple-600 dark:text-purple-300">
                    VIP
                  </span>
                )}
                {tier === 'PRO' && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-600 dark:text-amber-300">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        ) : (
          <div
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 cursor-pointer transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-teal-500 dark:text-teal-300">
                {language === 'vi' ? 'Đăng nhập tài khoản' : 'Sign in account'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {language === 'vi' ? 'Mở khóa tính năng VIP' : 'Unlock VIP features'}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
