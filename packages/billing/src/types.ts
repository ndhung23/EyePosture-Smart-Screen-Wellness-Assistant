import {
  SubscriptionTier,
  SubscriptionStatus,
  EntitlementPayload,
  SignedEntitlement,
  LicenseVerificationResult,
} from '@eyeposture/shared-types';

export interface CheckoutSessionOptions {
  userId: string;
  tier: SubscriptionTier;
  interval: 'month' | 'year' | 'lifetime';
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
}

export interface WebhookEventPayload {
  id: string;
  type: string;
  data: {
    userId: string;
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    currentPeriodEnd: number;
  };
}

export interface SePayWebhookPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code?: string | null;
  content: string;
  transferType: 'in' | 'out';
  transferAmount: number;
  accumulated: number;
  subAccount?: string | null;
  referenceCode?: string;
  description?: string;
}

export interface SePayConfig {
  apiKey: string;
  accountNumber: string;
  bankName: string;
  accountHolder?: string;
  transferPrefix?: string;
}

export interface SePayQrResult {
  qrUrl: string;
  accountNumber: string;
  bankName: string;
  accountHolder?: string;
  amount: number;
  transferContent: string;
  orderCode: string;
}

export interface IBillingProvider {
  createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  getSubscriptionStatus(userId: string): Promise<{
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    expiresAt: number;
  }>;
}
