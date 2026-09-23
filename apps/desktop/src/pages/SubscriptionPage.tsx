import React, { useState } from 'react';
import { Sparkles, Check, Crown, QrCode, Copy, CheckCircle2, X, RefreshCw, Users, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t, getLanguage } from '@eyeposture/i18n';

export type PlanKey =
  | 'PRO_MONTH'
  | 'PRO_YEAR'
  | 'PRO_LIFETIME'
  | 'FAMILY_MONTH'
  | 'FAMILY_YEAR'
  | 'FAMILY_LIFETIME';

export type BillingInterval = 'month' | 'year' | 'lifetime';

interface PlanDetail {
  tier: 'PRO' | 'FAMILY';
  interval: BillingInterval;
  titleVi: string;
  titleEn: string;
  priceVi: string;
  priceEn: string;
  unitVi: string;
  unitEn: string;
  amountVnd: number;
  amountUsd: string;
  content: string;
}

const PLAN_DETAILS: Record<PlanKey, PlanDetail> = {
  PRO_MONTH: {
    tier: 'PRO',
    interval: 'month',
    titleVi: 'Gói Cá nhân (1 Tháng)',
    titleEn: 'Personal Plan (1 Month)',
    priceVi: '19.000đ',
    priceEn: '$0.99',
    unitVi: '/ tháng',
    unitEn: '/ month',
    amountVnd: 19000,
    amountUsd: '$0.99',
    content: 'EYEPOSTURE PRO 1M',
  },
  PRO_YEAR: {
    tier: 'PRO',
    interval: 'year',
    titleVi: 'Gói Cá nhân (1 Năm)',
    titleEn: 'Personal Plan (1 Year)',
    priceVi: '199.000đ',
    priceEn: '$9.99',
    unitVi: '/ năm',
    unitEn: '/ year',
    amountVnd: 199000,
    amountUsd: '$9.99',
    content: 'EYEPOSTURE PRO 1Y',
  },
  PRO_LIFETIME: {
    tier: 'PRO',
    interval: 'lifetime',
    titleVi: 'Gói Cá nhân (Trọn đời)',
    titleEn: 'Personal Plan (Lifetime)',
    priceVi: '299.000đ',
    priceEn: '$19.99',
    unitVi: ' trọn đời',
    unitEn: ' lifetime',
    amountVnd: 299000,
    amountUsd: '$19.99',
    content: 'EYEPOSTURE PRO LIFE',
  },
  FAMILY_MONTH: {
    tier: 'FAMILY',
    interval: 'month',
    titleVi: 'Gói Gia đình (1 Tháng - 4 người dùng)',
    titleEn: 'Family Plan (1 Month - 4 users)',
    priceVi: '49.000đ',
    priceEn: '$4.99',
    unitVi: '/ tháng',
    unitEn: '/ month',
    amountVnd: 49000,
    amountUsd: '$4.99',
    content: 'EYEPOSTURE FAMILY 1M',
  },
  FAMILY_YEAR: {
    tier: 'FAMILY',
    interval: 'year',
    titleVi: 'Gói Gia đình (1 Năm - 4 người dùng)',
    titleEn: 'Family Plan (1 Year - 4 users)',
    priceVi: '299.000đ',
    priceEn: '$19.99',
    unitVi: '/ năm',
    unitEn: '/ year',
    amountVnd: 299000,
    amountUsd: '$19.99',
    content: 'EYEPOSTURE FAMILY 1Y',
  },
  FAMILY_LIFETIME: {
    tier: 'FAMILY',
    interval: 'lifetime',
    titleVi: 'Gói Gia đình (Trọn đời - 4 người dùng)',
    titleEn: 'Family Plan (Lifetime - 4 users)',
    priceVi: '499.000đ',
    priceEn: '$29.99',
    unitVi: ' trọn đời',
    unitEn: ' lifetime',
    amountVnd: 499000,
    amountUsd: '$29.99',
    content: 'EYEPOSTURE FAMILY LIFE',
  },
};

export const SubscriptionPage: React.FC = () => {
  const { subscriptionTier, upgradeToPro, currentUser, authToken, openAuthModal, syncEntitlements, language } = useApp();
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('month');
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('PRO_MONTH');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<{
    orderCode: string;
    qrUrl: string;
    amount: number;
    transferContent: string;
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  } | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const isVi = language === 'vi' || getLanguage() === 'vi';

  const bankCode = ((import.meta as any).env?.PAYMENT_BANK_CODE as string) || 'BIDV';
  const bankAccount = ((import.meta as any).env?.PAYMENT_BANK_ACCOUNT as string) || '4661398013';
  const bankAccountName = ((import.meta as any).env?.PAYMENT_BANK_ACCOUNT_NAME as string) || 'NGUYEN DUY HUNG';

  const currentPlanInfo = PLAN_DETAILS[selectedPlan];
  const fallbackQrUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankCode}&amount=${currentPlanInfo.amountVnd}&des=${encodeURIComponent(
    currentPlanInfo.content
  )}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSelectPlan = async (tier: 'PRO' | 'FAMILY', interval: BillingInterval) => {
    const key = `${tier}_${interval.toUpperCase()}` as PlanKey;
    setSelectedPlan(key);

    if (!currentUser || !authToken) {
      openAuthModal('login');
      return;
    }

    setShowQrModal(true);
    setIsLoadingOrder(true);
    setPaymentSuccess(false);

    try {
      const res = await fetch('http://localhost:8080/api/v1/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          provider: 'sepay',
          tier,
          interval,
          amount: PLAN_DETAILS[key].amountVnd,
        }),
      }).catch(() =>
        fetch('https://eyeposture.vercel.app/api/v1/subscription/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            provider: 'sepay',
            tier,
            interval,
            amount: PLAN_DETAILS[key].amountVnd,
          }),
        })
      );

      if (res && res.ok) {
        const orderData = await res.json();
        setActiveOrder(orderData);
      }
    } catch (err) {
      console.warn('Failed to create order:', err);
    } finally {
      setIsLoadingOrder(false);
    }
  };

  // Realtime Auto-Polling for SePay payment confirmation
  React.useEffect(() => {
    if (!showQrModal || !activeOrder?.orderCode || paymentSuccess) return;

    const intervalId = setInterval(async () => {
      try {
        const fingerprint = localStorage.getItem('eyeposture_device_fingerprint') || 'desktop_device';
        const endpoints = [
          `http://localhost:8080/api/v1/orders/${activeOrder.orderCode}/status?deviceId=${encodeURIComponent(fingerprint)}`,
          `https://eyeposture.vercel.app/api/v1/orders/${activeOrder.orderCode}/status?deviceId=${encodeURIComponent(fingerprint)}`,
        ];

        let pollRes;
        for (const ep of endpoints) {
          try {
            pollRes = await fetch(ep);
            if (pollRes.ok) break;
          } catch {}
        }

        if (pollRes && pollRes.ok) {
          const pollData = await pollRes.json();
          if (pollData.status === 'PAID') {
            setPaymentSuccess(true);
            await syncEntitlements();
            setTimeout(() => {
              setShowQrModal(false);
              setPaymentSuccess(false);
            }, 3000);
          }
        }
      } catch (err) {
        console.warn('Polling check error:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [showQrModal, activeOrder?.orderCode, paymentSuccess]);

  const handleSimulateWebhookSuccess = async () => {
    setIsUpgrading(true);
    await upgradeToPro();
    setTimeout(() => {
      setIsUpgrading(false);
      setShowQrModal(false);
    }, 600);
  };

  // Compute active card data based on selected interval
  const proKey = `PRO_${selectedInterval.toUpperCase()}` as PlanKey;
  const familyKey = `FAMILY_${selectedInterval.toUpperCase()}` as PlanKey;
  const proPlan = PLAN_DETAILS[proKey];
  const familyPlan = PLAN_DETAILS[familyKey];

  const featureMatrix = [
    { nameKey: 'subscription.features.basicReminders', free: true, pro: true, family: true },
    { nameKey: 'subscription.features.basicScreenTime', free: true, pro: true, family: true },
    { nameKey: 'subscription.features.fullPosture', free: false, pro: true, family: true },
    { nameKey: 'subscription.features.fullDistance', free: false, pro: true, family: true },
    { nameKey: 'subscription.features.multiProfiles', free: false, pro: true, family: true },
    { nameKey: 'subscription.features.advancedStats', free: false, pro: true, family: true },
    { nameKey: 'subscription.features.adaptiveFatigue', free: false, pro: true, family: true },
  ];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">{t('subscription.title')}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {t('subscription.subtitle')}
          </p>
        </div>

        {/* Billing Interval Toggle Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-inner self-start md:self-auto">
          <button
            type="button"
            onClick={() => setSelectedInterval('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedInterval === 'month'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isVi ? '1 Tháng' : '1 Month'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedInterval('year')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              selectedInterval === 'year'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{isVi ? '1 Năm' : '1 Year'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold uppercase tracking-tight">
              {isVi ? 'Tiết kiệm' : 'Save'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedInterval('lifetime')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              selectedInterval === 'lifetime'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{isVi ? 'Trọn đời' : 'Lifetime'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-400 text-slate-950 font-extrabold uppercase tracking-tight">
              {isVi ? 'Mua 1 lần' : 'One-time'}
            </span>
          </button>
        </div>
      </div>

      {/* Current Active Plan Status Banner */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-teal flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            {subscriptionTier === 'PRO' ? <Crown className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                {t('subscription.currentPlan')}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {subscriptionTier === 'PRO' ? t('subscription.tierPro') : t('subscription.tierFree')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {subscriptionTier === 'PRO'
                ? t('subscription.proLicensedDesc')
                : t('subscription.freeLicensedDesc')}
            </p>
          </div>
        </div>

        {subscriptionTier !== 'PRO' && (
          <button
            onClick={() => handleSelectPlan('PRO', selectedInterval)}
            className="px-5 py-2.5 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            {t('subscription.upgradeToPro')}
          </button>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: FREE */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100">{t('subscription.tierFree')}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isVi ? 'Bộ đếm 20-20-20 & nhắc uống nước' : 'Essential habit reminders'}
              </p>
            </div>
            <div className="font-display text-3xl font-bold text-slate-100">
              {isVi ? '0đ' : '$0'}
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{isVi ? 'Bộ đếm chu kỳ nghỉ mắt 20-20-20' : '20-20-20 Eye break timer'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{isVi ? 'Nhắc nhở uống nước công thái học' : 'Hydration schedule reminders'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{isVi ? 'Theo dõi thời gian dùng màn hình cơ bản' : 'Daily screen time tracking'}</span>
              </li>
            </ul>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 text-center text-xs text-slate-400 font-medium">
            {isVi ? 'Gói Cơ Bản Cục Bộ' : 'Standard Local Plan'}
          </div>
        </div>

        {/* CARD 2: PRO / CÁ NHÂN */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-6 border-teal-500/50 bg-slate-900/90 shadow-2xl shadow-teal-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-teal-500 text-slate-950 text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-bl-xl">
            {isVi ? 'Cá nhân' : 'Personal'}
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-1.5">
                {isVi ? 'Gói Cá nhân (Pro)' : 'Personal Plan (Pro)'}
                <Crown className="w-4 h-4 text-teal-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isVi ? 'Dành cho 1 người dùng cá nhân' : 'For 1 individual workstation user'}
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-teal-400">
                {isVi ? proPlan.priceVi : proPlan.priceEn}
              </span>
              <span className="text-xs text-slate-400">
                {isVi ? proPlan.unitVi : proPlan.unitEn}
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="font-semibold text-slate-100">
                  {isVi ? '1 tài khoản cho 1 người dùng' : '1 account for 1 user'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{isVi ? 'Ước tính góc nghiêng tư thế bằng thị giác máy tính' : 'Continuous posture angle estimation'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{isVi ? 'Giám sát khoảng cách mắt công thái học chuẩn' : 'Smart eye distance monitor'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{isVi ? 'Cảnh báo thích ứng chống mỏi mắt thông minh' : 'Anti-fatigue adaptive alerts'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{isVi ? 'Báo cáo thống kê xu hướng tuần & tháng' : 'Weekly & monthly trend analytics'}</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleSelectPlan('PRO', selectedInterval)}
            disabled={subscriptionTier === 'PRO'}
            className="w-full py-3 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-default"
          >
            {subscriptionTier === 'PRO' ? (
              isVi ? 'Bản quyền Pro đang kích hoạt' : 'Pro License Active'
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                {isVi
                  ? `Nâng cấp Cá nhân (${proPlan.priceVi})`
                  : `Upgrade Personal (${proPlan.priceEn})`}
              </>
            )}
          </button>
        </div>

        {/* CARD 3: FAMILY / GIA ĐÌNH (1 TÀI KHOẢN ĐƯỢC 4 NGƯỜI DÙNG) */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-6 border-indigo-500/40 bg-slate-900/90 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-bl-xl flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>4 Users</span>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-1.5">
                {isVi ? 'Gói Gia đình (Family)' : 'Family Plan (4 Users)'}
                <Users className="w-4 h-4 text-indigo-400" />
              </h3>
              <p className="text-xs text-indigo-300 font-semibold mt-0.5">
                {isVi ? '1 tài khoản được 4 người dùng' : '1 account supports 4 users'}
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-indigo-400">
                {isVi ? familyPlan.priceVi : familyPlan.priceEn}
              </span>
              <span className="text-xs text-slate-400">
                {isVi ? familyPlan.unitVi : familyPlan.unitEn}
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-bold text-slate-100">
                  {isVi ? '⭐ 1 tài khoản được 4 người dùng' : '⭐ 1 account supports 4 users'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{isVi ? 'Đầy đủ tất cả tính năng Chuyên nghiệp (Pro)' : 'All Pro features included'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{isVi ? 'Hồ sơ người lớn & trẻ em không giới hạn' : 'Unlimited child & adult profiles'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{isVi ? 'Kiểm soát phụ huynh & giới hạn giờ màn hình' : 'Stricter parental screen limiters'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{isVi ? 'Đồng bộ hồ sơ trên tối đa 4 thiết bị' : 'Sync profiles across up to 4 devices'}</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleSelectPlan('FAMILY', selectedInterval)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            {isVi
              ? `Chọn gói Gia đình (${familyPlan.priceVi})`
              : `Choose Family Plan (${familyPlan.priceEn})`}
          </button>
        </div>
      </div>

      {/* Feature Matrix Table */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">
          {isVi ? 'So sánh Chi tiết Tính năng các Gói' : 'Detailed Feature Comparison'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5">{isVi ? 'Tính năng' : 'Feature'}</th>
                <th className="py-2.5 text-center">{isVi ? 'Miễn phí' : 'Free'}</th>
                <th className="py-2.5 text-center text-teal-400 font-bold">{isVi ? 'Cá nhân (1 người)' : 'Personal (1 user)'}</th>
                <th className="py-2.5 text-center text-indigo-400 font-bold">{isVi ? 'Gia đình (4 người)' : 'Family (4 users)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {featureMatrix.map((item) => (
                <tr key={item.nameKey}>
                  <td className="py-3 text-slate-300">{t(item.nameKey)}</td>
                  <td className="py-3 text-center">
                    {item.free ? <Check className="w-4 h-4 text-teal-400 mx-auto" /> : '—'}
                  </td>
                  <td className="py-3 text-center">
                    <Check className="w-4 h-4 text-teal-400 mx-auto" />
                  </td>
                  <td className="py-3 text-center">
                    <Check className="w-4 h-4 text-indigo-400 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SePay VietQR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 space-y-5 bg-slate-900/95 border-teal-500/40 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center text-slate-950 font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    {isVi ? 'Thanh toán VietQR qua SePay' : 'VietQR Payment via SePay'}
                  </h3>
                  <p className="text-[11px] text-teal-400 font-medium">
                    {isVi ? currentPlanInfo.titleVi : currentPlanInfo.titleEn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Payment Success State Banner */}
            {paymentSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-3 animate-in fade-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-bold text-emerald-300 text-sm">
                    {isVi ? 'Thanh toán thành công!' : 'Payment Successful!'}
                  </h4>
                  <p className="text-xs text-emerald-200/80">
                    {isVi
                      ? 'Hệ thống đã xác nhận giao dịch SePay. Bản quyền đã được kích hoạt thành công trên máy này.'
                      : 'Payment verified via SePay webhook. Your license is now active.'}
                  </p>
                </div>
              </div>
            )}

            {/* QR & Bank Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-slate-800 min-h-[220px]">
                {isLoadingOrder ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                    <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                    <span className="text-xs">
                      {isVi ? 'Đang tạo mã thanh toán SePay...' : 'Generating payment code...'}
                    </span>
                  </div>
                ) : (
                  <>
                    <img
                      src={activeOrder?.qrUrl || fallbackQrUrl}
                      alt="VietQR SePay"
                      className="w-40 h-40 object-contain rounded-lg bg-white p-1.5 shadow-md"
                    />
                    <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isVi ? 'Cổng thanh toán tự động SePay' : 'Automated SePay Gateway'}
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {isVi ? 'Ngân hàng thụ hưởng' : 'Beneficiary Bank'}
                  </span>
                  <p className="font-semibold text-slate-200">{activeOrder?.bankName || bankCode} (BIDV)</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {isVi ? 'Chủ tài khoản' : 'Account Holder'}
                  </span>
                  <p className="font-semibold text-slate-200 uppercase">{activeOrder?.accountHolder || bankAccountName}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {isVi ? 'Số tài khoản' : 'Account Number'}
                  </span>
                  <div className="flex items-center justify-between bg-slate-950/50 px-2 py-1 rounded border border-slate-800 mt-0.5">
                    <span className="font-mono font-bold text-teal-300">{activeOrder?.accountNumber || bankAccount}</span>
                    <button
                      onClick={() => copyToClipboard(activeOrder?.accountNumber || bankAccount, 'acc')}
                      className="text-[10px] text-slate-400 hover:text-teal-300 p-1"
                      title="Sao chép số tài khoản"
                    >
                      {copiedField === 'acc' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {isVi ? 'Số tiền thanh toán' : 'Amount'}
                  </span>
                  <p className="font-mono font-bold text-emerald-400 text-sm">
                    {(activeOrder?.amount || currentPlanInfo.amountVnd).toLocaleString('vi-VN')} VNĐ
                    {!isVi && <span className="text-xs text-slate-400 font-normal ml-1">({currentPlanInfo.amountUsd})</span>}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {isVi ? 'Nội dung chuyển khoản (bắt buộc)' : 'Transfer Content (Required)'}
                  </span>
                  <div className="flex items-center justify-between bg-slate-950/50 px-2 py-1 rounded border border-slate-800 mt-0.5">
                    <span className="font-mono font-bold text-amber-300 select-all">
                      {activeOrder?.transferContent || currentPlanInfo.content}
                    </span>
                    <button
                      onClick={() => copyToClipboard(activeOrder?.transferContent || currentPlanInfo.content, 'des')}
                      className="text-[10px] text-slate-400 hover:text-amber-300 p-1"
                      title="Sao chép nội dung"
                    >
                      {copiedField === 'des' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instruction and Real-time Listening Banner */}
            <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/20 text-[11px] text-teal-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-teal-300">
                <RefreshCw className="w-3 h-3 animate-spin text-teal-400" />
                {isVi ? 'Hệ thống đang tự động lắng nghe giao dịch SePay...' : 'Listening for incoming SePay transaction...'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isVi
                  ? 'Mở app ngân hàng bất kỳ (Vietcombank, MB, BIDV, Techcombank, MoMo...), quét mã QR trên để chuyển khoản chính xác nội dung. Hệ thống sẽ tự động kích hoạt ngay khi nhận được thanh toán!'
                  : 'Open your banking app, scan the QR code and confirm the transfer. Your license will activate automatically within seconds.'}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
              <button
                onClick={handleSimulateWebhookSuccess}
                disabled={isUpgrading}
                className="flex-1 py-2.5 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isUpgrading
                  ? (isVi ? 'Đang kích hoạt...' : 'Activating...')
                  : (isVi ? 'Kích hoạt thử nghiệm (Demo)' : 'Simulate Success (Demo)')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
