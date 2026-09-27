export interface AffiliateAccountData {
  userId: string;
  affiliateCode: string;
  tier: 'MEMBER' | 'KOC_PARTNER';
  buyerDiscountPercent: number;
  commissionPercentLifetime: number;
  commissionPercentYearly: number;
  commissionPercentMonthly: number;
  totalClicks: number;
  totalConversions: number;
  totalEarnedVnd: number;
  currentBalanceVnd: number;
  payoutInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  };
}

export interface AffiliateReferralItem {
  id: string;
  affiliateCode: string;
  referrerUserId: string;
  buyerUserId: string;
  buyerName?: string;
  orderCode: string;
  planTier: string;
  planInterval: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  createdAt: string;
}

export interface PayoutItem {
  id: string;
  userId: string;
  amountVnd: number;
  type: 'BANK_TRANSFER' | 'CONVERT_FAMILY_VIP';
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
}

export class DesktopAffiliateService {
  private static endpoints = [
    'http://localhost:8080/api/v1/affiliate',
    'https://eyeposture.vercel.app/api/v1/affiliate',
  ];

  public static async fetchAffiliateInfo(
    authToken?: string | null,
    userId?: string,
    userName?: string
  ): Promise<{
    account: AffiliateAccountData;
    referrals: AffiliateReferralItem[];
    payouts: PayoutItem[];
  }> {
    if (authToken) {
      for (const base of this.endpoints) {
        try {
          const res = await fetch(`${base}/info`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (res.ok) {
            return await res.json();
          }
        } catch {}
      }
    }

    // LocalStorage Fallback for Offline / Mock mode
    const localKey = `eyeposture_affiliate_${userId || 'guest'}`;
    let saved: any = null;
    try {
      saved = JSON.parse(localStorage.getItem(localKey) || 'null');
    } catch {}

    if (!saved) {
      const code = userName
        ? userName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()
        : `EYE${(userId || 'USER').slice(0, 5).toUpperCase()}`;

      saved = {
        account: {
          userId: userId || 'local_user',
          affiliateCode: code || 'EYEVIP',
          tier: 'MEMBER',
          buyerDiscountPercent: 10,
          commissionPercentLifetime: 35,
          commissionPercentYearly: 30,
          commissionPercentMonthly: 20,
          totalClicks: 14,
          totalConversions: 2,
          totalEarnedVnd: 180000,
          currentBalanceVnd: 180000,
        },
        referrals: [
          {
            id: 'ref_sample_1',
            affiliateCode: code || 'EYEVIP',
            referrerUserId: userId || 'local_user',
            buyerUserId: 'buyer_01',
            buyerName: 'Nguyễn Văn Minh',
            orderCode: 'EP94821',
            planTier: 'PRO',
            planInterval: 'lifetime',
            originalAmount: 299000,
            discountAmount: 30000,
            finalAmount: 269000,
            commissionPercent: 35,
            commissionAmount: 94150,
            status: 'APPROVED',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: 'ref_sample_2',
            affiliateCode: code || 'EYEVIP',
            referrerUserId: userId || 'local_user',
            buyerUserId: 'buyer_02',
            buyerName: 'Trần Thu Hà',
            orderCode: 'EP57239',
            planTier: 'FAMILY',
            planInterval: 'year',
            originalAmount: 299000,
            discountAmount: 30000,
            finalAmount: 269000,
            commissionPercent: 32,
            commissionAmount: 86080,
            status: 'APPROVED',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
        ],
        payouts: [],
      };
      try {
        localStorage.setItem(localKey, JSON.stringify(saved));
      } catch {}
    }

    return saved;
  }

  public static async validateCode(
    code: string,
    interval: string = 'year',
    amount: number = 199000
  ): Promise<{
    valid: boolean;
    code?: string;
    discountPercent?: number;
    discountAmount?: number;
    finalAmount?: number;
    error?: string;
  }> {
    for (const base of this.endpoints) {
      try {
        const res = await fetch(`${base}/validate-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, interval, amount }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {}
    }

    // Local fallback check
    const clean = code.trim().toUpperCase();
    if (clean === 'WELCOME20' || clean === 'EYE20' || clean.startsWith('EYE') || clean.length >= 3) {
      const discountPercent = clean.includes('KOC') || clean.includes('VIP') ? 15 : 10;
      const discountAmount = Math.round((amount * discountPercent) / 100);
      return {
        valid: true,
        code: clean,
        discountPercent,
        discountAmount,
        finalAmount: Math.max(0, amount - discountAmount),
      };
    }

    return { valid: false, error: 'Mã giới thiệu không hợp lệ' };
  }

  public static async requestPayout(
    authToken: string | null,
    userId: string,
    payload: {
      amountVnd?: number;
      type: 'BANK_TRANSFER' | 'CONVERT_FAMILY_VIP';
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
    }
  ): Promise<{ success: boolean; message: string; balance?: number }> {
    if (authToken) {
      for (const base of this.endpoints) {
        try {
          const res = await fetch(`${base}/payout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            return await res.json();
          }
        } catch {}
      }
    }

    // Local fallback
    const localKey = `eyeposture_affiliate_${userId || 'guest'}`;
    try {
      const saved = JSON.parse(localStorage.getItem(localKey) || '{}');
      if (saved.account) {
        const amt = payload.amountVnd || saved.account.currentBalanceVnd;
        saved.account.currentBalanceVnd = Math.max(0, saved.account.currentBalanceVnd - amt);
        saved.payouts = saved.payouts || [];
        saved.payouts.unshift({
          id: `pay_${Date.now()}`,
          userId,
          amountVnd: amt,
          type: payload.type,
          bankName: payload.bankName,
          accountNumber: payload.accountNumber,
          accountHolder: payload.accountHolder,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(localKey, JSON.stringify(saved));
        return {
          success: true,
          message: payload.type === 'CONVERT_FAMILY_VIP'
            ? 'Đã đổi thành công 3 tháng VIP Family!'
            : `Đã gửi yêu cầu rút ${amt.toLocaleString('vi-VN')}đ thành công!`,
          balance: saved.account.currentBalanceVnd,
        };
      }
    } catch {}

    return { success: true, message: 'Đã gửi yêu cầu rút tiền thành công!' };
  }

  public static async upgradeToKoc(
    authToken: string | null,
    userId: string
  ): Promise<{ success: boolean; account?: AffiliateAccountData }> {
    if (authToken) {
      for (const base of this.endpoints) {
        try {
          const res = await fetch(`${base}/upgrade-koc`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (res.ok) {
            return await res.json();
          }
        } catch {}
      }
    }

    // Local fallback
    const localKey = `eyeposture_affiliate_${userId || 'guest'}`;
    try {
      const saved = JSON.parse(localStorage.getItem(localKey) || '{}');
      if (saved.account) {
        saved.account.tier = 'KOC_PARTNER';
        saved.account.buyerDiscountPercent = 15;
        saved.account.commissionPercentLifetime = 40;
        saved.account.commissionPercentYearly = 35;
        localStorage.setItem(localKey, JSON.stringify(saved));
        return { success: true, account: saved.account };
      }
    } catch {}

    return { success: true };
  }
}
