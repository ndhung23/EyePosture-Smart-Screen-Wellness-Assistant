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
  const { language, switchLanguage, activeProfile, subscriptionTier, theme, effectiveTheme, switchTheme } = useApp();

  const navItems = [
    { id: 'dashboard' as NavPage, labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { id: 'monitor' as NavPage, labelKey: 'nav.monitor', icon: ScanFace },
    { id: 'breaks' as NavPage, labelKey: 'nav.breaks', icon: Eye },
    { id: 'screenTime' as NavPage, labelKey: 'nav.screenTime', icon: Clock },
    { id: 'statistics' as NavPage, labelKey: 'nav.statistics', icon: BarChart3 },
    { id: 'profiles' as NavPage, labelKey: 'nav.profiles', icon: Users },
    { id: 'settings' as NavPage, labelKey: 'nav.settings', icon: Settings },
    { id: 'subscription' as NavPage, labelKey: 'nav.subscription', icon: Sparkles, badge: subscriptionTier },
    { id: 'privacy' as NavPage, labelKey: 'nav.privacy', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between p-4 select-none shrink-0 h-screen">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Eye className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1.5">
              EyePosture
              {subscriptionTier === 'PRO' && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
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
                onClick={() => onSelectPage(item.id)}
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
                {item.badge && item.badge !== 'FREE' && (
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
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

        {/* Profile Card */}
        <div
          onClick={() => onSelectPage('profiles')}
          className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800/60 cursor-pointer transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{activeProfile?.name ?? 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate">
              {activeProfile?.isChild ? t('common.childProfile') : t('common.adultProfile')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
