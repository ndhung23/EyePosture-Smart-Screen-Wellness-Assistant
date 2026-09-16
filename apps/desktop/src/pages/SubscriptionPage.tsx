import React, { useState } from 'react';
import { Sparkles, Check, Crown, QrCode, Copy, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const SubscriptionPage: React.FC = () => {
  const { subscriptionTier, upgradeToPro, currentUser, authToken, openAuthModal, syncEntitlements } = useApp();
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<'PRO_MONTH' | 'PRO_YEAR' | 'FAMILY_MONTH'>('PRO_MONTH');
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

  const planDetails = {
    PRO_MONTH: {
      title: 'EyePosture Pro (1 Tháng)',
      amountVnd: 59000,
      amountUsd: '$4.99',
      content: 'EYEPOSTURE PRO',
    },
    PRO_YEAR: {
      title: 'EyePosture Pro (1 Năm - Tiết kiệm 30%)',
      amountVnd: 499000,
      amountUsd: '$39.99',
      content: 'EYEPOSTURE PRO YEAR',
    },
    FAMILY_MONTH: {
      title: 'EyePosture Family (1 Tháng - 5 máy)',
      amountVnd: 99000,
      amountUsd: '$8.99',
      content: 'EYEPOSTURE FAMILY',
    },
  };

  const bankCode = ((import.meta as any).env?.PAYMENT_BANK_CODE as string) || 'BIDV';
  const bankAccount = ((import.meta as any).env?.PAYMENT_BANK_ACCOUNT as string) || '4661398013';
  const bankAccountName = ((import.meta as any).env?.PAYMENT_BANK_ACCOUNT_NAME as string) || 'NGUYEN DUY HUNG';

  const currentPlanInfo = planDetails[selectedPlan];
  const fallbackQrUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankCode}&amount=${currentPlanInfo.amountVnd}&des=${encodeURIComponent(
    currentPlanInfo.content
  )}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSelectPlan = async (plan: 'PRO_MONTH' | 'PRO_YEAR' | 'FAMILY_MONTH') => {
    setSelectedPlan(plan);
    if (!currentUser || !authToken) {
      openAuthModal('login');
      return;
    }

    setShowQrModal(true);
    setIsLoadingOrder(true);
    setPaymentSuccess(false);

    try {
      const tier = plan === 'FAMILY_MONTH' ? 'FAMILY' : 'PRO';
      const interval = plan === 'PRO_YEAR' ? 'year' : 'month';

      const res = await fetch('http://localhost:8080/api/v1/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ provider: 'sepay', tier, interval }),
      }).catch(() =>
        fetch('https://eyeposture.vercel.app/api/v1/subscription/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ provider: 'sepay', tier, interval }),
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
    <div className="p-8 space-y-8 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-100">{t('subscription.title')}</h2>
        <p className="text-sm text-slate-400 mt-1">
          {t('subscription.subtitle')}
        </p>
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
            onClick={() => {
              setSelectedPlan('PRO_MONTH');
              setShowQrModal(true);
            }}
            className="px-5 py-2.5 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            {t('subscription.upgradeToPro')}
          </button>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FREE */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100">{t('subscription.tierFree')}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Essential habit reminders</p>
            </div>
            <div className="font-display text-3xl font-bold text-slate-100">$0</div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>20-20-20 Eye break timer</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Hydration schedule reminders</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Daily screen time tracking</span>
              </li>
            </ul>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 text-center text-xs text-slate-400 font-medium">
            Standard Local Plan
          </div>
        </div>

        {/* PRO */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-6 border-teal-500/50 bg-slate-900/90 shadow-2xl shadow-teal-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-teal-500 text-slate-950 text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-bl-xl">
            Popular
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-1.5">
                {t('subscription.tierPro')}
                <Crown className="w-4 h-4 text-teal-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Full computer vision ergonomics</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-slate-100">$4.99</span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Continuous posture angle estimation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Smart eye distance monitor</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Anti-fatigue adaptive alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Weekly & monthly trend analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Up to 3 registered PCs</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => {
              setSelectedPlan('PRO_MONTH');
              setShowQrModal(true);
            }}
            disabled={subscriptionTier === 'PRO'}
            className="w-full py-3 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-1.5"
          >
            {subscriptionTier === 'PRO' ? (
              'Bản quyền Pro đang kích hoạt'
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                Nâng cấp Pro qua VietQR (59.000đ)
              </>
            )}
          </button>
        </div>

        {/* FAMILY */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100">{t('subscription.tierFamily')}</h3>
              <p className="text-xs text-slate-400 mt-0.5">For shared household workstations</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-slate-100">99.000đ</span>
              <span className="text-xs text-slate-400">/ tháng ($8.99)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>All Pro features included</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Unlimited child & adult profiles</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Stricter parental screen limiters</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Up to 5 devices</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => {
              setSelectedPlan('FAMILY_MONTH');
              setShowQrModal(true);
            }}
            className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            Chọn gói Family qua VietQR (99.000đ)
          </button>
        </div>
      </div>

      {/* Feature Matrix Table */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Detailed Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5">Feature</th>
                <th className="py-2.5 text-center">Free</th>
                <th className="py-2.5 text-center text-teal-400 font-bold">Pro</th>
                <th className="py-2.5 text-center">Family</th>
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
                    <Check className="w-4 h-4 text-teal-400 mx-auto" />
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
                  <h3 className="font-bold text-sm text-slate-100">Thanh toán VietQR qua SePay</h3>
                  <p className="text-[11px] text-teal-400 font-medium">{currentPlanInfo.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR & Bank Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <img
                  src={qrUrl}
                  alt="VietQR SePay"
                  className="w-40 h-40 object-contain rounded-lg bg-white p-1.5 shadow-md"
                />
                <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cổng thanh toán tự động SePay
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Ngân hàng thụ hưởng</span>
                  <p className="font-semibold text-slate-200">{bankCode} (Ngân hàng TMCP Đầu tư và Phát triển)</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Chủ tài khoản</span>
                  <p className="font-semibold text-slate-200 uppercase">{bankAccountName}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Số tài khoản</span>
                  <div className="flex items-center justify-between bg-slate-950/50 px-2 py-1 rounded border border-slate-800 mt-0.5">
                    <span className="font-mono font-bold text-teal-300">{bankAccount}</span>
                    <button
                      onClick={() => copyToClipboard(bankAccount, 'acc')}
                      className="text-[10px] text-slate-400 hover:text-teal-300"
                    >
                      {copiedField === 'acc' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Số tiền</span>
                  <p className="font-mono font-bold text-emerald-400 text-sm">
                    {currentPlanInfo.amountVnd.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Nội dung chuyển khoản</span>
                  <div className="flex items-center justify-between bg-slate-950/50 px-2 py-1 rounded border border-slate-800 mt-0.5">
                    <span className="font-mono font-bold text-amber-300">{currentPlanInfo.content}</span>
                    <button
                      onClick={() => copyToClipboard(currentPlanInfo.content, 'des')}
                      className="text-[10px] text-slate-400 hover:text-amber-300"
                    >
                      {copiedField === 'des' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instruction and Simulation Button */}
            <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/20 text-[11px] text-teal-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-teal-300">
                <RefreshCw className="w-3 h-3 animate-spin text-teal-400" />
                Hệ thống tự động lắng nghe SePay Webhook
              </p>
              <p className="text-[10px] text-slate-400">
                Mở app ngân hàng bất kỳ (Vietcombank, MB, Techcombank, Momo...), quét mã QR trên để chuyển khoản chính xác nội dung. Hệ thống sẽ tự động kích hoạt bản quyền trong 3 giây.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all"
              >
                Đóng
              </button>
              <button
                onClick={handleSimulateWebhookSuccess}
                disabled={isUpgrading}
                className="flex-1 py-2.5 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                {isUpgrading ? 'Đang kích hoạt...' : 'Xác nhận kích hoạt Pro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
