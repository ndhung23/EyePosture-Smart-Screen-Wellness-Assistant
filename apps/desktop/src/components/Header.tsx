import { BatteryCharging, Battery, AlertCircle, X, User as UserIcon, LogOut, ArrowUpCircle, Crown, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const Header: React.FC = () => {
  const {
    activeProfile,
    isMonitoring,
    toggleMonitoring,
    governorStatus,
    activeReminders,
    dismissReminder,
    currentUser,
    openAuthModal,
    openProfileModal,
    subscriptionTier,
    logout,
    language,
    effectiveTheme,
  } = useApp();

  const isVi = language === 'vi';
  const isLight = effectiveTheme === 'light';
  const tier = (currentUser?.subscription?.tier || subscriptionTier || 'FREE').toUpperCase();

  return (
    <header className="px-8 py-5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {/* User Greeting */}
        <div>
          <h2 className={`font-display font-bold text-xl ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            {t('dashboard.greeting', { name: currentUser?.name || activeProfile?.name || (isVi ? 'Bạn' : 'User') })}
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {!currentUser
              ? isVi
                ? 'Chế độ Khách (Chưa kích hoạt camera AI)'
                : 'Guest Mode (AI Camera Inactive)'
              : isMonitoring
              ? t('dashboard.cameraActive')
              : t('dashboard.cameraPaused')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Power status badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
            }`}
          >
            {governorStatus.isOnBattery ? (
              <Battery className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <BatteryCharging className="w-3.5 h-3.5 text-teal-500" />
            )}
            <span className="font-medium text-[11px]">
              {governorStatus.mode} ({governorStatus.targetFps} FPS)
            </span>
          </div>

          {/* Check for updates button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('eyeposture:check-update'))}
            title={isVi ? 'Kiểm tra bản cập nhật mới' : 'Check for new updates'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition-all active:scale-95 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-teal-600'
                : 'bg-slate-800/60 hover:bg-slate-700/80 border-slate-700/50 text-slate-300 hover:text-teal-300'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5 text-teal-500" />
            <span className="hidden sm:inline font-medium text-[11px]">{isVi ? 'Cập nhật' : 'Update'}</span>
          </button>

          {/* User Account / Profile Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={openProfileModal}
                title={isVi ? 'Xem và chỉnh sửa thông tin tài khoản' : 'View and edit account profile'}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all hover:scale-[1.02] active:scale-95 ${
                  tier === 'FAMILY'
                    ? isLight
                      ? 'bg-purple-100/90 border-purple-300 text-purple-900 shadow-sm'
                      : 'bg-purple-950/40 border-purple-500/50 text-purple-200 shadow-md shadow-purple-500/10'
                    : tier === 'PRO'
                    ? isLight
                      ? 'bg-amber-100/90 border-amber-300 text-amber-900 shadow-sm'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md shadow-amber-500/10'
                    : isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    tier === 'FAMILY'
                      ? 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white'
                      : tier === 'PRO'
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950'
                      : isLight
                      ? 'bg-slate-300 text-slate-800'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold max-w-[100px] truncate">{currentUser.name}</span>

                {tier === 'FAMILY' && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-sm flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>FAMILY</span>
                  </span>
                )}
                {tier === 'PRO' && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" />
                    <span>PRO</span>
                  </span>
                )}
                {tier === 'FREE' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-400">
                    FREE
                  </span>
                )}

                {currentUser.role === 'ADMIN' && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-600 border border-teal-500/40">
                    ADMIN
                  </span>
                )}
              </button>

              {tier === 'FREE' && (
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('eyeposture:navigate', { detail: 'subscription' }))}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                  title={isVi ? 'Nâng cấp lên gói Pro' : 'Upgrade to Pro'}
                >
                  <Crown className="w-3 h-3" />
                  <span className="hidden md:inline">{isVi ? 'Nâng PRO' : 'Go PRO'}</span>
                </button>
              )}

              <button
                onClick={logout}
                title={isVi ? 'Đăng xuất' : 'Sign out'}
                className="p-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-xs font-semibold text-teal-400 transition-all active:scale-95"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{isVi ? 'Đăng nhập' : 'Sign In'}</span>
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('eyeposture:navigate', { detail: 'subscription' }))}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{isVi ? 'Gói Pro' : 'Pro Plan'}</span>
              </button>
            </div>
          )}

          {/* Monitoring Active / Pause Toggle Button */}
          <button
            onClick={() => {
              if (!currentUser) {
                openAuthModal('login');
                return;
              }
              toggleMonitoring();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              isMonitoring && currentUser
                ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 hover:bg-teal-500/25'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isMonitoring && currentUser ? 'bg-teal-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>{isMonitoring && currentUser ? t('header.monitoringOn') : t('header.monitoringOff')}</span>
          </button>
        </div>
      </div>

      {/* Active Non-Intrusive Reminder Alerts Bar */}
      {activeReminders.length > 0 && (
        <div className="space-y-2 mt-1">
          {activeReminders.slice(0, 2).map((reminder) => (
            <div
              key={reminder.id}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs shadow-md transition-all ${
                reminder.priority === 'URGENT'
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                  : reminder.type === 'POSTURE'
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                  : 'bg-teal-950/60 border-teal-500/50 text-teal-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-semibold mr-2">{t(reminder.titleKey)}</span>
                  <span className="opacity-80">{t(reminder.messageKey)}</span>
                </div>
              </div>
              <button
                onClick={() => dismissReminder(reminder.id)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};
