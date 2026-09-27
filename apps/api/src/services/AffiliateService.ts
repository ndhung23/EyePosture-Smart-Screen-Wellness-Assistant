import fs from 'fs';
import path from 'path';

export type AffiliateTier = 'MEMBER' | 'KOC_PARTNER';

export interface AffiliateAccount {
  userId: string;
  affiliateCode: string;
  tier: AffiliateTier;
  buyerDiscountPercent: number; // 10% cho Member, 15% cho KOC
  commissionPercentLifetime: number; // 35% - 40%
  commissionPercentYearly: number; // 30% - 35%
  commissionPercentMonthly: number; // 20%
  totalClicks: number;
  totalConversions: number;
  totalEarnedVnd: number;
  currentBalanceVnd: number;
  payoutInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  };
  createdAt: string;
}

export interface AffiliateReferral {
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

export interface PayoutRequest {
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

export class AffiliateService {
  private static instance: AffiliateService;
  private filePath = path.join(process.cwd(), 'data', 'affiliate.json');
  private accounts: Map<string, AffiliateAccount> = new Map();
  private codeToUserId: Map<string, string> = new Map();
  private referrals: AffiliateReferral[] = [];
  private payouts: PayoutRequest[] = [];

  private constructor() {
    this.loadData();
  }

  public static getInstance(): AffiliateService {
    if (!AffiliateService.instance) {
      AffiliateService.instance = new AffiliateService();
    }
    return AffiliateService.instance;
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const data = JSON.parse(raw);
        if (data.accounts && Array.isArray(data.accounts)) {
          for (const acc of data.accounts) {
            this.accounts.set(acc.userId, acc);
            this.codeToUserId.set(acc.affiliateCode.toUpperCase(), acc.userId);
          }
        }
        if (data.referrals && Array.isArray(data.referrals)) {
          this.referrals = data.referrals;
        }
        if (data.payouts && Array.isArray(data.payouts)) {
          this.payouts = data.payouts;
        }
      }
    } catch (err) {
      console.warn('[AffiliateService] Load data error:', err);
    }
  }

  private saveData(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const payload = {
        accounts: Array.from(this.accounts.values()),
        referrals: this.referrals,
        payouts: this.payouts,
      };
      fs.writeFileSync(this.filePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (err) {
      console.warn('[AffiliateService] Save data error:', err);
    }
  }

  public getOrCreateAccount(userId: string, userName?: string): AffiliateAccount {
    let acc = this.accounts.get(userId);
    if (!acc) {
      let code = userName
        ? userName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()
        : '';
      if (!code || code.length < 3 || this.codeToUserId.has(code)) {
        code = `EYE${userId.slice(0, 5).toUpperCase()}`;
      }
      if (this.codeToUserId.has(code)) {
        code = `EP${Math.floor(1000 + Math.random() * 9000)}`;
      }

      acc = {
        userId,
        affiliateCode: code,
        tier: 'MEMBER',
        buyerDiscountPercent: 10,
        commissionPercentLifetime: 35,
        commissionPercentYearly: 30,
        commissionPercentMonthly: 20,
        totalClicks: 0,
        totalConversions: 0,
        totalEarnedVnd: 0,
        currentBalanceVnd: 0,
        createdAt: new Date().toISOString(),
      };

      this.accounts.set(userId, acc);
      this.codeToUserId.set(code, userId);
      this.saveData();
    }
    return acc;
  }

  public upgradeToKoc(userId: string): AffiliateAccount {
    const acc = this.getOrCreateAccount(userId);
    acc.tier = 'KOC_PARTNER';
    acc.buyerDiscountPercent = 15; // Fan được giảm 15%
    acc.commissionPercentLifetime = 40; // 40% trọn đời
    acc.commissionPercentYearly = 35; // 35% năm
    acc.commissionPercentMonthly = 20;
    this.saveData();
    return acc;
  }

  public validateCode(
    rawCode: string,
    interval: string = 'year',
    amount: number = 199000
  ): {
    valid: boolean;
    code?: string;
    discountPercent?: number;
    discountAmount?: number;
    finalAmount?: number;
    error?: string;
  } {
    const code = rawCode.trim().toUpperCase();
    const userId = this.codeToUserId.get(code);

    // Standard preset coupons fallback
    if (!userId) {
      if (code === 'WELCOME20' || code === 'EYE20') {
        const disc = Math.round(amount * 0.2);
        return {
          valid: true,
          code,
          discountPercent: 20,
          discountAmount: disc,
          finalAmount: amount - disc,
        };
      }
      return { valid: false, error: 'Mã giới thiệu không tồn tại hoặc không hợp lệ' };
    }

    const acc = this.accounts.get(userId);
    if (!acc) {
      return { valid: false, error: 'Tài khoản người giới thiệu không khả dụng' };
    }

    acc.totalClicks += 1;
    this.saveData();

    const discountPercent = acc.buyerDiscountPercent || 10;
    const discountAmount = Math.round((amount * discountPercent) / 100);
    const finalAmount = Math.max(0, amount - discountAmount);

    return {
      valid: true,
      code: acc.affiliateCode,
      discountPercent,
      discountAmount,
      finalAmount,
    };
  }

  public recordOrderCommission(
    orderCode: string,
    affiliateCode: string,
    buyerUserId: string,
    planTier: string,
    planInterval: string,
    finalAmountPaid: number,
    buyerName?: string
  ): AffiliateReferral | null {
    const code = affiliateCode.trim().toUpperCase();
    const referrerUserId = this.codeToUserId.get(code);
    if (!referrerUserId) return null;

    const acc = this.accounts.get(referrerUserId);
    if (!acc) return null;

    // Determine commission rate based on plan interval and partner tier
    let commPercent = acc.commissionPercentYearly;
    if (planInterval === 'lifetime') {
      commPercent = acc.commissionPercentLifetime;
    } else if (planInterval === 'month') {
      commPercent = acc.commissionPercentMonthly;
    }

    const commissionAmount = Math.round((finalAmountPaid * commPercent) / 100);

    const ref: AffiliateReferral = {
      id: `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      affiliateCode: acc.affiliateCode,
      referrerUserId,
      buyerUserId,
      buyerName: buyerName || 'Khách hàng',
      orderCode,
      planTier,
      planInterval,
      originalAmount: Math.round(finalAmountPaid / (1 - (acc.buyerDiscountPercent || 10) / 100)),
      discountAmount: Math.round(finalAmountPaid / (1 - (acc.buyerDiscountPercent || 10) / 100)) - finalAmountPaid,
      finalAmount: finalAmountPaid,
      commissionPercent: commPercent,
      commissionAmount,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
    };

    this.referrals.unshift(ref);
    acc.totalConversions += 1;
    acc.totalEarnedVnd += commissionAmount;
    acc.currentBalanceVnd += commissionAmount;
    this.saveData();

    return ref;
  }

  public getReferrals(userId: string): AffiliateReferral[] {
    return this.referrals.filter((r) => r.referrerUserId === userId);
  }

  public requestPayout(
    userId: string,
    payload: {
      amountVnd?: number;
      type: 'BANK_TRANSFER' | 'CONVERT_FAMILY_VIP';
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
    }
  ): { success: boolean; message: string; balance: number } {
    const acc = this.accounts.get(userId);
    if (!acc) return { success: false, message: 'Tài khoản không tồn tại', balance: 0 };

    if (payload.type === 'CONVERT_FAMILY_VIP') {
      // Đổi 1 lượt quy đổi hoặc trừ 150.000đ để lấy 3 tháng VIP Family
      const cost = 150000;
      if (acc.currentBalanceVnd < cost) {
        return {
          success: false,
          message: `Số dư cần tối thiểu 150.000đ để đổi 3 tháng bản Family (Số dư hiện tại: ${acc.currentBalanceVnd.toLocaleString('vi-VN')}đ)`,
          balance: acc.currentBalanceVnd,
        };
      }
      acc.currentBalanceVnd -= cost;
      this.payouts.unshift({
        id: `pay_${Date.now()}`,
        userId,
        amountVnd: cost,
        type: 'CONVERT_FAMILY_VIP',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      });
      this.saveData();
      return {
        success: true,
        message: 'Đã đổi thành công 3 tháng bản Family VIP cho tài khoản của bạn!',
        balance: acc.currentBalanceVnd,
      };
    }

    const amount = Number(payload.amountVnd) || acc.currentBalanceVnd;
    if (amount < 100000) {
      return {
        success: false,
        message: 'Số tiền rút tối thiểu là 100.000đ',
        balance: acc.currentBalanceVnd,
      };
    }
    if (amount > acc.currentBalanceVnd) {
      return {
        success: false,
        message: 'Số dư khả dụng không đủ để thực hiện yêu cầu',
        balance: acc.currentBalanceVnd,
      };
    }

    acc.currentBalanceVnd -= amount;
    acc.payoutInfo = {
      bankName: payload.bankName,
      accountNumber: payload.accountNumber,
      accountHolder: payload.accountHolder,
    };

    this.payouts.unshift({
      id: `pay_${Date.now()}`,
      userId,
      amountVnd: amount,
      type: 'BANK_TRANSFER',
      bankName: payload.bankName,
      accountNumber: payload.accountNumber,
      accountHolder: payload.accountHolder,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Đã gửi yêu cầu rút ${amount.toLocaleString('vi-VN')}đ thành công! Tiền sẽ được chuyển về tài khoản trong 24h làm việc.`,
      balance: acc.currentBalanceVnd,
    };
  }

  public updateCustomCode(userId: string, newCode: string): { success: boolean; message: string; code?: string } {
    const clean = newCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length < 3 || clean.length > 15) {
      return { success: false, message: 'Mã giới thiệu phải từ 3 đến 15 ký tự chữ và số' };
    }
    const existing = this.codeToUserId.get(clean);
    if (existing && existing !== userId) {
      return { success: false, message: 'Mã này đã có người sử dụng, vui lòng chọn mã khác' };
    }
    const acc = this.getOrCreateAccount(userId);
    this.codeToUserId.delete(acc.affiliateCode);
    acc.affiliateCode = clean;
    this.codeToUserId.set(clean, userId);
    this.saveData();
    return { success: true, message: 'Cập nhật mã giới thiệu thành công!', code: clean };
  }

  public async handleHttpRoute(
    pathname: string,
    method: string,
    body: any,
    authResult: { valid: boolean; userId?: string },
    user?: any
  ): Promise<{ handled: boolean; status: number; data: any }> {
    // 1. POST /api/v1/affiliate/validate-code (Public)
    if (pathname === '/api/v1/affiliate/validate-code' && method === 'POST') {
      const { code, interval, amount } = body || {};
      if (!code) {
        return { handled: true, status: 400, data: { valid: false, error: 'Thiếu mã giới thiệu' } };
      }
      const val = this.validateCode(code, interval, amount);
      return { handled: true, status: val.valid ? 200 : 400, data: val };
    }

    // Authenticated affiliate endpoints
    if (pathname.startsWith('/api/v1/affiliate')) {
      if (!authResult.valid || !authResult.userId) {
        return { handled: true, status: 401, data: { error: 'Unauthorized' } };
      }
      const userId = authResult.userId;

      if (pathname === '/api/v1/affiliate/info' && method === 'GET') {
        const account = this.getOrCreateAccount(userId, user?.name);
        const referrals = this.getReferrals(userId);
        const userPayouts = this.payouts.filter((p) => p.userId === userId);
        return { handled: true, status: 200, data: { account, referrals, payouts: userPayouts } };
      }

      if (pathname === '/api/v1/affiliate/upgrade-koc' && method === 'POST') {
        const account = this.upgradeToKoc(userId);
        return { handled: true, status: 200, data: { success: true, account } };
      }

      if (pathname === '/api/v1/affiliate/custom-code' && method === 'POST') {
        const res = this.updateCustomCode(userId, body.newCode || '');
        return { handled: true, status: res.success ? 200 : 400, data: res };
      }

      if (pathname === '/api/v1/affiliate/payout' && method === 'POST') {
        const res = this.requestPayout(userId, body);
        return { handled: true, status: res.success ? 200 : 400, data: res };
      }
    }

    return { handled: false, status: 404, data: null };
  }
}

