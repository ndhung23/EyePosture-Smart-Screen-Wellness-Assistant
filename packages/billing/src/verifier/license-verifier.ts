import { LicenseVerificationResult, SubscriptionTier } from '@eyeposture/shared-types';
import { EntitlementSigner } from '../crypto/signer.js';

export const FREE_FEATURES = [
  'basic_reminders',
  'basic_eye_break',
  'basic_hydration',
  'basic_screen_time',
  'single_profile',
];

export const PRO_FEATURES = [
  ...FREE_FEATURES,
  'posture_full',
  'distance_full',
  'advanced_stats',
  'adaptive_reminders',
  'multi_profiles',
  'custom_voice',
  'app_exclusion',
];

export class LicenseVerifier {
  private signer: EntitlementSigner;
  private lastVerifiedTimestamp: number = 0;
  private readonly offlineGracePeriodMs = 14 * 24 * 60 * 60 * 1000; // 14 days

  constructor(publicKeyOrSecret: string) {
    this.signer = new EntitlementSigner(publicKeyOrSecret);
  }

  public verifyToken(
    token: string,
    currentDeviceId: string,
    now: number = Date.now()
  ): LicenseVerificationResult {
    // 1. Clock tampering check (user winding system clock back)
    if (this.lastVerifiedTimestamp > 0 && now < this.lastVerifiedTimestamp - 2 * 3600 * 1000) {
      return {
        isValid: false,
        tier: 'FREE',
        isOfflineGrace: false,
        daysRemaining: 0,
        features: FREE_FEATURES,
        error: 'Clock manipulation detected. System time is earlier than previous verification.',
      };
    }

    // 2. Cryptographic signature verification
    const verifyRes = this.signer.verify(token);
    if (!verifyRes.isValid || !verifyRes.payload) {
      return {
        isValid: false,
        tier: 'FREE',
        isOfflineGrace: false,
        daysRemaining: 0,
        features: FREE_FEATURES,
        error: verifyRes.error ?? 'Invalid signature',
      };
    }

    const payload = verifyRes.payload;

    // 3. Device binding validation
    if (payload.deviceId && payload.deviceId !== currentDeviceId) {
      return {
        isValid: false,
        tier: 'FREE',
        isOfflineGrace: false,
        daysRemaining: 0,
        features: FREE_FEATURES,
        error: 'License is registered to a different device',
      };
    }

    this.lastVerifiedTimestamp = now;

    // 4. Expiration & Grace period
    const msRemaining = payload.expiresAt - now;
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 3600 * 1000)));

    if (msRemaining >= 0) {
      // Valid active subscription
      return {
        isValid: true,
        tier: payload.tier,
        isOfflineGrace: false,
        daysRemaining,
        features: payload.features ?? PRO_FEATURES,
      };
    }

    // Past expiry: check offline grace period
    const msPastExpiry = Math.abs(msRemaining);
    if (msPastExpiry <= this.offlineGracePeriodMs) {
      return {
        isValid: true,
        tier: payload.tier,
        isOfflineGrace: true,
        daysRemaining: 0,
        features: payload.features ?? PRO_FEATURES,
        error: 'Subscription expired. Operating in 14-day offline grace period.',
      };
    }

    // Grace period exceeded -> graceful fallback to FREE
    return {
      isValid: false,
      tier: 'FREE',
      isOfflineGrace: false,
      daysRemaining: 0,
      features: FREE_FEATURES,
      error: 'Subscription expired and grace period elapsed.',
    };
  }
}
