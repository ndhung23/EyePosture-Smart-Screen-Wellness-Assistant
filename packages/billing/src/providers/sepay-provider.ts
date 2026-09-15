import {
  IBillingProvider,
  CheckoutSessionOptions,
  CheckoutSessionResult,
  SePayConfig,
  SePayQrResult,
  SePayWebhookPayload,
} from '../types.js';
import { SubscriptionTier, SubscriptionStatus } from '@eyeposture/shared-types';

export class SePayBillingProvider implements IBillingProvider {
  private config: SePayConfig;

  // Standard plan pricing in VND
  public static readonly PRICES_VND: Record<SubscriptionTier, { month: number; year: number }> = {
    FREE: { month: 0, year: 0 },
    PRO: { month: 59000, year: 499000 },
    FAMILY: { month: 99000, year: 899000 },
  };

  constructor(config?: Partial<SePayConfig>) {
    this.config = {
      apiKey:
        config?.apiKey ||
        process.env.SEPAY_WEBHOOK_SECRET ||
        process.env.SECRET_KEY ||
        process.env.SEPAY_API_KEY ||
        'sepay_api_key_eyeposture_demo',
      accountNumber:
        config?.accountNumber ||
        process.env.PAYMENT_BANK_ACCOUNT ||
        process.env.PAYMENT_BANK_VIRTUAL_ACCOUNT ||
        process.env.SEPAY_ACCOUNT_NUMBER ||
        '4661398013',
      bankName:
        config?.bankName ||
        process.env.PAYMENT_BANK_CODE ||
        process.env.SEPAY_BANK_NAME ||
        'BIDV',
      accountHolder:
        config?.accountHolder ||
        process.env.PAYMENT_BANK_ACCOUNT_NAME ||
        process.env.SEPAY_ACCOUNT_HOLDER ||
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
    interval?: 'month' | 'year';
  }): SePayQrResult {
    const tier = options.tier || 'PRO';
    const interval = options.interval || 'month';
    const amount = SePayBillingProvider.PRICES_VND[tier]?.[interval] ?? 59000;
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
    const validKeys = Array.from(
      new Set(
        [
          this.config.apiKey,
          process.env.SEPAY_WEBHOOK_SECRET,
          process.env.SECRET_KEY,
          process.env.SEPAY_API_KEY,
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
