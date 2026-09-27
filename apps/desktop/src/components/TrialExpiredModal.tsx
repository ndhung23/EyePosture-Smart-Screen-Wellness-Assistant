import React from 'react';
import { Crown, Clock, X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const TrialExpiredModal: React.FC = () => {
  const { isTrialExpiredModalOpen, closeTrialExpiredModal } = useApp();

  if (!isTrialExpiredModalOpen) return null;

  const handleUpgrade = () => {
    closeTrialExpiredModal();
    window.dispatchEvent(new CustomEvent('eyeposture:navigate', { detail: 'subscription' }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-7 shadow-2xl shadow-amber-500/10 relative flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={closeTrialExpiredModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Central Crown & Clock Icon */}
        <div className="relative mb-5">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-xl shadow-amber-500/10 p-4">
            <Crown className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-slate-800 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Title & Badge */}
        <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase mb-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          <span>HẾT HẠN DÙNG THỬ 2 TIẾNG HÔM NAY</span>
        </span>

        <h3 className="font-display font-bold text-xl text-slate-100 mb-2 leading-snug">
          Bạn đã dùng hết 2 giờ giám sát Camera miễn phí hôm nay
        </h3>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed max-w-sm">
          Người dùng vãng lai và tài khoản miễn phí được trải nghiệm tối đa <strong>2 tiếng/ngày</strong>. Hãy nâng cấp lên gói <strong>PRO</strong> hoặc <strong>FAMILY</strong> để bảo vệ sức khỏe mắt và tư thế liên tục không giới hạn!
        </p>

        {/* Benefits list */}
        <div className="w-full bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 mb-6 text-left space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Giám sát qua Camera không giới hạn 24/7</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Đo góc nghiêng 3D & Phát hiện gù lưng chuẩn y khoa</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Thống kê xu hướng dài hạn & Xuất báo cáo sức khỏe</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={closeTrialExpiredModal}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-300 transition-all active:scale-95"
          >
            Để sau (Quay lại ngày mai)
          </button>

          <button
            onClick={handleUpgrade}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Nâng cấp PRO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
