import {
  IBillingProvider,
  CheckoutSessionOptions,
  CheckoutSessionResult,
  SePayConfig,
  SePayQrResult,
  SePayWebhookPayload,
} from '../types.js';
import { SubscriptionTier, SubscriptionStatus } from '@eyeposture/shared-types';

function getEnv(): Record<string, string | undefined> {
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) {
    return (globalThis as any).process.env;
  }
  return {};
}

export class SePayBillingProvider implements IBillingProvider {
  private config: SePayConfig;

  // Standard plan pricing in VND
  public static readonly PRICES_VND: Record<SubscriptionTier, { month: number; year: number; lifetime?: number }> = {
    FREE: { month: 0, year: 0, lifetime: 0 },
    PRO: { month: 19000, year: 199000, lifetime: 299000 },
    FAMILY: { month: 49000, year: 299000, lifetime: 499000 },
  };

  // Standard plan pricing in USD (International)
  public static readonly PRICES_USD: Record<SubscriptionTier, { month: number; year: number; lifetime?: number }> = {
    FREE: { month: 0, year: 0, lifetime: 0 },
    PRO: { month: 0.99, year: 9.99, lifetime: 19.99 },
    FAMILY: { month: 4.99, year: 19.99, lifetime: 29.99 },
  };

  constructor(config?: Partial<SePayConfig>) {
    const env = getEnv();
    this.config = {
      apiKey:
        config?.apiKey ||
        env.SEPAY_WEBHOOK_SECRET ||
        env.SECRET_KEY ||
        env.SEPAY_API_KEY ||
        'sepay_api_key_eyeposture_demo',
      accountNumber:
        config?.accountNumber ||
        env.PAYMENT_BANK_ACCOUNT ||
        env.PAYMENT_BANK_VIRTUAL_ACCOUNT ||
        env.SEPAY_ACCOUNT_NUMBER ||
        '4661398013',
      bankName:
        config?.bankName ||
        env.PAYMENT_BANK_CODE ||
        env.SEPAY_BANK_NAME ||
        'BIDV',
      accountHolder:
        config?.accountHolder ||
        env.PAYMENT_BANK_ACCOUNT_NAME ||
        env.SEPAY_ACCOUNT_HOLDER ||
        'NGUYEN DUY HUNG',
      transferPrefix: config?.transferPrefix || 'EYEPOSTURE',
    };
  }

  /**
   * Generates a VietQR URL using the official SePay QR image service
   */
  public generateVietQrUrl(params: {
    accountNumber?: string;
    bankName?: string;
    amount: number;
    content: string;
  }): string {
    const acc = params.accountNumber || this.config.accountNumber;
    const bank = params.bankName || this.config.bankName;
    const amount = Math.max(0, Math.round(params.amount));
    const des = encodeURIComponent(params.content.trim());
    return `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${des}`;
  }

  /**
   * Creates a VietQR payment code & details for desktop app
   */
  public createQrPayment(options: {
    userId: string;
    tier?: SubscriptionTier;
    interval?: 'month' | 'year' | 'lifetime';
    customAmount?: number;
    deviceCount?: 1 | 4;
  }): SePayQrResult {
    const tier = options.tier || 'PRO';
    const interval = options.interval || 'month';
    let amount = options.customAmount;
    if (amount === undefined) {
      if (tier === 'FAMILY' || options.deviceCount === 4) {
        if (interval === 'lifetime') amount = 499000;
        else if (interval === 'year') amount = 299000;
        else amount = 49000;
      } else {
        if (interval === 'lifetime') amount = 299000;
        else if (interval === 'year') amount = 199000;
        else amount = 19000;
      }
    }
    const orderCode = `ORD${Date.now().toString().slice(-6)}`;
    const transferContent = `${this.config.transferPrefix} ${options.userId} ${orderCode}`;

    const qrUrl = this.generateVietQrUrl({
      amount,
      content: transferContent,
    });

    return {
      qrUrl,
      accountNumber: this.config.accountNumber,
      bankName: this.config.bankName,
      accountHolder: this.config.accountHolder,
      amount,
      transferContent,
      orderCode,
    };
  }

  /**
   * Implements IBillingProvider.createCheckoutSession
   */
  public async createCheckoutSession(
    options: CheckoutSessionOptions
  ): Promise<CheckoutSessionResult> {
    const qrPayment = this.createQrPayment({
      userId: options.userId,
      tier: options.tier,
      interval: options.interval,
    });

    return {
      sessionId: qrPayment.orderCode,
      checkoutUrl: qrPayment.qrUrl,
    };
  }

  public async cancelSubscription(_subscriptionId: string): Promise<boolean> {
    return true;
  }

  public async getSubscriptionStatus(_userId: string): Promise<{
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    expiresAt: number;
  }> {
    return {
      tier: 'PRO',
      status: 'ACTIVE',
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
  }

  /**
   * Parses the payment content from the bank transaction string
   * e.g., "EYEPOSTURE usr_94a2b1c8 ORD123456" -> userId = "usr_94a2b1c8"
   */
  public parsePaymentContent(content: string): {
    userId: string | null;
    orderCode: string | null;
    tier: SubscriptionTier;
  } {
    if (!content) {
      return { userId: null, orderCode: null, tier: 'PRO' };
    }

    const clean = content.trim();
    const prefix = this.config.transferPrefix || 'EYEPOSTURE';

    // Pattern: EYEPOSTURE <userId> <orderCode?>
    const regex = new RegExp(
      `(?:${prefix}|EP)[_\\s]+([a-zA-Z0-9_-]+)(?:[_\\s]+(ORD[0-9]+))?`,
      'i'
    );
    const match = clean.match(regex);

    if (match) {
      const userId = match[1];
      const orderCode = match[2] || null;
      const tier: SubscriptionTier = /family/i.test(clean) ? 'FAMILY' : 'PRO';
      return { userId, orderCode, tier };
    }

    return { userId: null, orderCode: null, tier: 'PRO' };
  }

  /**
   * Verifies the SePay Webhook authorization header
   * SePay sends header format: "Authorization: Apikey <API_KEY>"
   */
  public verifyApiKey(authHeader?: string): boolean {
    if (!authHeader) return false;
    const cleanHeader = authHeader.trim();
    const env = getEnv();
    const validKeys = Array.from(
      new Set(
        [
          this.config.apiKey,
          env.SEPAY_WEBHOOK_SECRET,
          env.SECRET_KEY,
          env.SEPAY_API_KEY,
        ].filter(Boolean) as string[]
      )
    );

    for (const key of validKeys) {
      if (cleanHeader === key) return true;
      if (cleanHeader === `Apikey ${key}`) return true;
      if (cleanHeader === `Bearer ${key}`) return true;
    }

    return false;
  }
}
