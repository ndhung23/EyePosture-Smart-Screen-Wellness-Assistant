'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  DollarSign,
  TrendingUp,
  MousePointer,
  Share2,
  Gift,
  ArrowUpRight,
  ShieldCheck,
  Building,
  CreditCard,
  UserCheck,
  Clock,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

export function AffiliatePortal({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [account, setAccount] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);

  // Modals
  const [showKocModal, setShowKocModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showCustomCodeModal, setShowCustomCodeModal] = useState(false);

  // Forms
  const [kocChannel, setKocChannel] = useState('');
  const [kocPreferredCode, setKocPreferredCode] = useState('');
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [payoutBank, setPayoutBank] = useState('Vietcombank');
  const [payoutAccountNum, setPayoutAccountNum] = useState('');
  const [payoutHolder, setPayoutHolder] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const loadAffiliateData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/affiliate?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        setAccount(data.account);
        setReferrals(data.referrals || []);
        setPayoutRequests(data.payoutRequests || []);
      }
    } catch (err) {
      console.error('Failed to load affiliate data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAffiliateData();
    }
  }, [user]);

  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://eyeposture.vercel.app');
  const affiliateUrl = account ? `${origin}/?ref=${account.affiliateCode}` : '';

  const handleCopyLink = () => {
    if (!affiliateUrl) return;
    navigator.clipboard.writeText(affiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!account?.affiliateCode) return;
    navigator.clipboard.writeText(account.affiliateCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleUpgradeKoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setActionLoading(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upgrade_koc',
          userId: user.id,
          channelInfo: kocChannel,
          preferredCode: kocPreferredCode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccount(data.account);
        setShowKocModal(false);
        alert(isVi ? 'Chúc mừng bạn đã được nâng cấp lên KOC Partner (Hoa hồng 40%)!' : 'Successfully upgraded to KOC Partner (40% Commission)!');
      } else {
        setActionMsg({ text: data.error || 'Có lỗi xảy ra', isError: true });
      }
    } catch {
      setActionMsg({ text: 'Lỗi kết nối máy chủ', isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCustomCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setActionLoading(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'custom_code',
          userId: user.id,
          customCode: customCodeInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccount((prev: any) => ({ ...prev, affiliateCode: data.affiliateCode }));
        setShowCustomCodeModal(false);
        setCustomCodeInput('');
      } else {
        setActionMsg({ text: data.error || 'Mã không khả dụng', isError: true });
      }
    } catch {
      setActionMsg({ text: 'Lỗi kết nối máy chủ', isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setActionLoading(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'payout',
          userId: user.id,
          type: 'BANK_TRANSFER',
          bankName: payoutBank,
          accountNumber: payoutAccountNum,
          accountHolder: payoutHolder,
          amountVnd: Number(payoutAmount),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccount((prev: any) => ({ ...prev, currentBalanceVnd: data.currentBalanceVnd }));
        setPayoutRequests((prev) => [data.payout, ...prev]);
        setShowPayoutModal(false);
        alert(data.message);
      } else {
        setActionMsg({ text: data.error || 'Rút tiền thất bại', isError: true });
      }
    } catch {
      setActionMsg({ text: 'Lỗi kết nối máy chủ', isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertFamilyVip = async () => {
    if (!user) return;
    if (!confirm(isVi ? 'Bạn có muốn nhận ưu đãi 3 tháng bản quyền Family miễn phí?' : 'Convert your referral reward to 3 months free Family VIP?')) return;
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'payout',
          userId: user.id,
          type: 'CONVERT_FAMILY_VIP',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        loadAffiliateData();
      }
    } catch {
      alert('Có lỗi xảy ra khi đổi quyền lợi.');
    }
  };

  const formatVnd = (val: number) => new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ';

  if (!user) {
    return (
      <section id="affiliate-portal" className="py-16 md:py-24 bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-6">
              <Share2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {isVi ? 'Bắt Đầu Kiếm Thu Nhập Cùng EyePosture' : 'Start Earning With EyePosture'}
            </h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
              {isVi
                ? 'Đăng nhập tài khoản của bạn để nhận ngay Mã giới thiệu giảm giá 2 chiều và Link tiếp thị 40% hoa hồng.'
                : 'Sign in to access your private 2-way discount voucher and track your referral commissions in real time.'}
            </p>
            <button
              onClick={onOpenAuth}
              className="mt-8 px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {isVi ? 'Đăng Nhập Hoặc Đăng Ký Miễn Phí' : 'Sign In / Register For Free'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="affiliate-portal" className="py-16 md:py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isVi ? 'Affiliate Partner Portal' : 'Affiliate Partner Portal'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {isVi ? 'Bảng Điều Khiển Đối Tác' : 'Partner Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {account?.tier !== 'KOC_PARTNER' && (
              <button
                onClick={() => {
                  setActionMsg(null);
                  setShowKocModal(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isVi ? 'Nâng Cấp KOC (40%)' : 'Upgrade to KOC (40%)'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setActionMsg(null);
                setShowPayoutModal(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>{isVi ? 'Rút Tiền Ngân Hàng' : 'Withdraw Balance'}</span>
            </button>
          </div>
        </div>

        {/* Affiliate Link & Code VIP Card */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-orange-500/10 dark:from-amber-500/10 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-white border border-amber-300/80 dark:border-amber-500/30 shadow-xl mb-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                  {account?.tier === 'KOC_PARTNER' ? '⭐ KOC VIP PARTNER' : 'TIÊU CHUẨN (MEMBER)'}
                </span>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  {account?.tier === 'KOC_PARTNER'
                    ? (isVi ? 'Hoa hồng 40% Lifetime • Giảm 15% cho Fan' : '40% Lifetime Commission • 15% Fan Discount')
                    : (isVi ? 'Hoa hồng 35% Lifetime • Giảm 10% cho bạn bè' : '35% Lifetime Commission • 10% Friend Discount')}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{isVi ? 'Mã Giới Thiệu Của Bạn:' : 'Your Promo Code:'}</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-wider">
                    {account?.affiliateCode || 'ĐANG TẢI...'}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold flex items-center gap-1 text-slate-800 dark:text-slate-200 border border-amber-200 dark:border-transparent"
                    title={isVi ? 'Copy mã' : 'Copy code'}
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setActionMsg(null);
                      setShowCustomCodeModal(true);
                    }}
                    className="text-xs text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-200 underline font-semibold"
                  >
                    {isVi ? 'Đổi mã riêng' : 'Custom code'}
                  </button>
                </div>
              </div>
            </div>

            {/* Link Copy Box */}
            <div className="lg:max-w-md w-full bg-white/95 dark:bg-slate-950/80 p-4 rounded-2xl border border-amber-200 dark:border-slate-800 shadow-md">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isVi ? 'Link Tiếp Thị Liên Kết Trực Tiếp (Tự động kích hoạt giảm giá):' : 'Direct Referral Link (Auto applies discount):'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={affiliateUrl}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 w-full focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? (isVi ? 'Đã chép' : 'Copied') : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {/* Clicks */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">{isVi ? 'Lượt Click Link' : 'Total Clicks'}</span>
              <MousePointer className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {account?.totalClicks || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {isVi ? 'Lưu lượng truy cập tiếp thị' : 'Marketing traffic'}
            </div>
          </div>

          {/* Conversions */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">{isVi ? 'Đơn Mua Thành Công' : 'Conversions'}</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {account?.totalConversions || 0}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              {account?.totalClicks ? `${Math.round(((account.totalConversions || 0) / account.totalClicks) * 100)}% chuyển đổi` : '0% chuyển đổi'}
            </div>
          </div>

          {/* Total Earned */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">{isVi ? 'Tổng Hoa Hồng Kiếm Được' : 'Total Earned'}</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {formatVnd(account?.totalEarnedVnd || 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {isVi ? 'Tích lũy từ khi tham gia' : 'Cumulative total'}
            </div>
          </div>

          {/* Current Balance */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/15 dark:to-slate-900 border border-emerald-400/40 dark:border-emerald-500/30 shadow-sm">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-2">
              <span className="text-xs font-semibold uppercase">{isVi ? 'Số Dư Khả Dụng' : 'Available Balance'}</span>
              <CreditCard className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {formatVnd(account?.currentBalanceVnd || 0)}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleConvertFamilyVip}
                className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <Gift className="w-3 h-3" />
                <span>{isVi ? 'Đổi 3 tháng VIP' : 'Swap 3mo VIP'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Referrals History Table */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isVi ? 'Lịch Sử Đơn Hàng Giới Thiệu' : 'Referral Order History'}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {referrals.length} {isVi ? 'giao dịch' : 'transactions'}
            </span>
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
              {isVi ? 'Chưa có đơn hàng nào được ghi nhận. Hãy chia sẻ mã của bạn để bắt đầu nhận hoa hồng!' : 'No referral orders yet. Share your code to earn commissions!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="pb-3 font-semibold">{isVi ? 'Thời Gian' : 'Date'}</th>
                    <th className="pb-3 font-semibold">{isVi ? 'Gói Cước' : 'Plan'}</th>
                    <th className="pb-3 font-semibold">{isVi ? 'Giá Trị Đơn' : 'Amount'}</th>
                    <th className="pb-3 font-semibold">{isVi ? '% Hoa Hồng' : 'Rate'}</th>
                    <th className="pb-3 font-semibold">{isVi ? 'Tiền Nhận Được' : 'Commission'}</th>
                    <th className="pb-3 font-semibold">{isVi ? 'Trạng Thái' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {new Date(ref.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">
                        {ref.planTier} ({ref.planInterval === 'lifetime' ? 'Trọn đời' : ref.planInterval === 'year' ? '1 Năm' : 'Tháng'})
                      </td>
                      <td className="py-3">{formatVnd(ref.finalAmount)}</td>
                      <td className="py-3 font-bold text-cyan-600 dark:text-cyan-400">{ref.commissionPercent}%</td>
                      <td className="py-3 font-bold text-amber-500">{formatVnd(ref.commissionAmount)}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {isVi ? 'Đã duyệt' : 'Approved'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Upgrade to KOC Partner */}
      {showKocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-amber-500/30 shadow-2xl relative">
            <button
              onClick={() => setShowKocModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {isVi ? 'Nâng Cấp KOC Partner (40%)' : 'Upgrade to KOC Partner'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isVi ? 'Dành cho Content Creator, Reviewer công nghệ & setup bàn làm việc' : 'For Tech Reviewers & Desk Setup Creators'}
              </p>
            </div>

            {actionMsg && (
              <div className={`p-3 rounded-xl text-xs mb-4 ${actionMsg.isError ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20'}`}>
                {actionMsg.text}
              </div>
            )}

            <form onSubmit={handleUpgradeKoc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Kênh TikTok / YouTube / Website của bạn:' : 'Your TikTok / YouTube / Website:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: tiktok.com/@techreview"
                  value={kocChannel}
                  onChange={(e) => setKocChannel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Mã voucher bạn muốn tặng fan (Giảm ngay 15%):' : 'Preferred custom voucher code (15% fan discount):'}
                </label>
                <input
                  type="text"
                  placeholder="ví dụ: TUANTECH15"
                  value={kocPreferredCode}
                  onChange={(e) => setKocPreferredCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 transition"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 text-xs">
                {isVi
                  ? '✨ Sau khi nâng cấp: Hoa hồng trọn đời tăng lên 40%, mã voucher của bạn sẽ giảm 15% trực tiếp cho người mua.'
                  : '✨ Lifetime commission raised to 40%, and your custom voucher gives 15% off to your fans.'}
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 font-bold text-slate-950 hover:from-amber-300 hover:to-orange-400 shadow-md shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isVi ? 'Xác Nhận Nâng Cấp Ngay' : 'Confirm Upgrade'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Custom Code */}
      {showCustomCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowCustomCodeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              {isVi ? 'Đặt Mã Voucher Riêng' : 'Set Custom Promo Code'}
            </h3>

            {actionMsg && (
              <div className="p-3 rounded-xl text-xs mb-4 bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                {actionMsg.text}
              </div>
            )}

            <form onSubmit={handleCustomCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Mã voucher (3 - 15 ký tự chữ và số):' : 'Promo code (3-15 chars):'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: HUYREVIEW10"
                  value={customCodeInput}
                  onChange={(e) => setCustomCodeInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 transition"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-amber-400 font-bold text-slate-950 hover:bg-amber-300 shadow-md shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isVi ? 'Lưu Mã Mới' : 'Save Code'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Withdraw Payout */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-emerald-500/30 shadow-2xl relative">
            <button
              onClick={() => setShowPayoutModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {isVi ? 'Rút Tiền Về Ngân Hàng' : 'Withdraw Balance'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isVi ? `Số dư hiện tại: ${formatVnd(account?.currentBalanceVnd || 0)}` : `Available balance: ${formatVnd(account?.currentBalanceVnd || 0)}`}
              </p>
            </div>

            {actionMsg && (
              <div className="p-3 rounded-xl text-xs mb-4 bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                {actionMsg.text}
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Ngân Hàng Nhận Tiền:' : 'Bank Name:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vietcombank, MB Bank, Techcombank, BIDV..."
                  value={payoutBank}
                  onChange={(e) => setPayoutBank(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Số Tài Khoản:' : 'Account Number:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập số tài khoản"
                  value={payoutAccountNum}
                  onChange={(e) => setPayoutAccountNum(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Tên Chủ Tài Khoản (Không dấu):' : 'Account Holder Name:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="NGUYEN VAN A"
                  value={payoutHolder}
                  onChange={(e) => setPayoutHolder(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Số Tiền Muốn Rút (Tối thiểu 50.000 VNĐ):' : 'Amount (Min 50,000 VND):'}
                </label>
                <input
                  type="number"
                  min="50000"
                  max={account?.currentBalanceVnd || 0}
                  required
                  placeholder="ví dụ: 200000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-bold text-white hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 active:scale-95 transition flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isVi ? 'Tạo Lệnh Rút Tiền' : 'Submit Withdrawal'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
