export type SubscriptionTier = 'FREE' | 'PRO' | 'FAMILY';

export type SubscriptionStatus = 
  | 'ACTIVE'
  | 'TRIAL'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'EXPIRED'
  | 'INACTIVE';

export interface PlanFeature {
  id: string;
  nameKey: string;
  descriptionKey: string;
  includedInTiers: SubscriptionTier[];
}

export interface EntitlementPayload {
  sub: string; // userId or deviceId
  tier: SubscriptionTier;
  features: string[];
  issuedAt: number;
  expiresAt: number;
  deviceLimit: number;
  deviceId: string;
}

export interface SignedEntitlement {
  payload: EntitlementPayload;
  signature: string; // Base64 HMAC-SHA256 or Ed25519 signature
  algorithm: 'HMAC-SHA256' | 'Ed25519';
}

export interface LicenseVerificationResult {
  isValid: boolean;
  tier: SubscriptionTier;
  isOfflineGrace: boolean;
  daysRemaining: number;
  features: string[];
  error?: string;
}
