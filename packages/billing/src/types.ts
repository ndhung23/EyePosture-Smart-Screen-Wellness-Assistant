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
  interval: 'month' | 'year';
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

export interface IBillingProvider {
  createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  getSubscriptionStatus(userId: string): Promise<{
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    expiresAt: number;
  }>;
}
