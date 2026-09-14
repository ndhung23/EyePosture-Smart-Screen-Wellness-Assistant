import React, { useState } from 'react';
import { Sparkles, Check, Crown, Laptop, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const SubscriptionPage: React.FC = () => {
  const { subscriptionTier, upgradeToPro } = useApp();
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    await upgradeToPro();
    setTimeout(() => {
      setIsUpgrading(false);
    }, 800);
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
          Flexible commercial licensing tailored for individual professionals and families.
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
                ? 'Cryptographically verified license active with full CV posture & distance models.'
                : 'Free tier with basic eye-breaks and hydration reminders.'}
            </p>
          </div>
        </div>

        {subscriptionTier !== 'PRO' && (
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="px-5 py-2.5 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 active:scale-95 transition-all"
          >
            {isUpgrading ? 'Upgrading...' : t('subscription.upgradeToPro')}
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
            onClick={handleUpgrade}
            disabled={subscriptionTier === 'PRO'}
            className="w-full py-3 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 transition-all"
          >
            {subscriptionTier === 'PRO' ? 'Active Subscription' : 'Upgrade to Pro'}
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
              <span className="font-display text-3xl font-bold text-slate-100">$8.99</span>
              <span className="text-xs text-slate-400">/ month</span>
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
          <button className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all">
            Choose Family Plan
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
    </div>
  );
};
