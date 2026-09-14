import {
  IBillingProvider,
  CheckoutSessionOptions,
  CheckoutSessionResult,
} from '../types.js';
import { SubscriptionTier, SubscriptionStatus } from '@eyeposture/shared-types';

export class MockBillingProvider implements IBillingProvider {
  public async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult> {
    return {
      sessionId: `mock_sess_${crypto.randomUUID()}`,
      checkoutUrl: `https://billing.eyeposture.com/mock-checkout?user=${options.userId}&tier=${options.tier}`,
    };
  }

  public async cancelSubscription(subscriptionId: string): Promise<boolean> {
    return true;
  }

  public async getSubscriptionStatus(userId: string): Promise<{
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
}

export class StripeBillingProvider implements IBillingProvider {
  private stripeApiKey: string;

  constructor(stripeApiKey: string) {
    this.stripeApiKey = stripeApiKey;
  }

  public async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult> {
    // In production backend, this uses the Stripe SDK:
    // const session = await stripe.checkout.sessions.create({ ... })
    return {
      sessionId: `cs_${crypto.randomUUID()}`,
      checkoutUrl: `https://checkout.stripe.com/pay/cs_${options.userId}`,
    };
  }

  public async cancelSubscription(subscriptionId: string): Promise<boolean> {
    // await stripe.subscriptions.cancel(subscriptionId);
    return true;
  }

  public async getSubscriptionStatus(userId: string): Promise<{
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
}
