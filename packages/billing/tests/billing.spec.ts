import { describe, it, expect } from 'vitest';
import {
  EntitlementSigner,
  LicenseVerifier,
  MockBillingProvider,
  SePayBillingProvider,
  FREE_FEATURES,
  PRO_FEATURES,
} from '../src/index.js';
import { EntitlementPayload } from '@eyeposture/shared-types';

describe('Billing & Entitlement Security Layer', () => {
  const secretKey = 'test_secure_entitlement_secret_key_2026';
  const signer = new EntitlementSigner(secretKey);
  const verifier = new LicenseVerifier(secretKey);
  const deviceId = 'device_win11_guid_12345';

  it('should sign and verify valid entitlement payload', () => {
    const payload: EntitlementPayload = {
      sub: 'user-001',
      tier: 'PRO',
      features: PRO_FEATURES,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
      deviceLimit: 3,
      deviceId,
    };

    const token = signer.sign(payload);
    expect(token).toContain('.');

    const verified = signer.verify(token);
    expect(verified.isValid).toBe(true);
    expect(verified.payload?.sub).toBe('user-001');
    expect(verified.payload?.tier).toBe('PRO');
  });

  it('should reject tampered tokens', () => {
    const payload: EntitlementPayload = {
      sub: 'user-001',
      tier: 'PRO',
      features: PRO_FEATURES,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
      deviceLimit: 3,
      deviceId,
    };

    const token = signer.sign(payload);
    // Alter a character in the payload section
    const parts = token.split('.');
    parts[1] = parts[1].substring(0, parts[1].length - 2) + 'AA';
    const tamperedToken = parts.join('.');

    const result = verifier.verifyToken(tamperedToken, deviceId);
    expect(result.isValid).toBe(false);
    expect(result.tier).toBe('FREE');
    expect(result.features).toEqual(FREE_FEATURES);
  });

  it('should reject tokens bound to a different device', () => {
    const payload: EntitlementPayload = {
      sub: 'user-002',
      tier: 'PRO',
      features: PRO_FEATURES,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
      deviceLimit: 1,
      deviceId: 'foreign_device_macbook',
    };

    const token = signer.sign(payload);
    const result = verifier.verifyToken(token, deviceId);

    expect(result.isValid).toBe(false);
    expect(result.tier).toBe('FREE');
    expect(result.error).toContain('different device');
  });

  it('should support 14-day offline grace period for recently expired subscriptions', () => {
    const now = Date.now();
    // Expired 3 days ago (well within 14 days)
    const payload: EntitlementPayload = {
      sub: 'user-003',
      tier: 'PRO',
      features: PRO_FEATURES,
      issuedAt: now - 33 * 24 * 3600 * 1000,
      expiresAt: now - 3 * 24 * 3600 * 1000,
      deviceLimit: 3,
      deviceId,
    };

    const token = signer.sign(payload);
    const result = verifier.verifyToken(token, deviceId, now);

    expect(result.isValid).toBe(true);
    expect(result.tier).toBe('PRO');
    expect(result.isOfflineGrace).toBe(true);
    expect(result.error).toContain('14-day offline grace period');
  });

  it('should downgrade to FREE when expired beyond the 14-day grace period', () => {
    const now = Date.now();
    // Expired 20 days ago (past 14-day grace period)
    const payload: EntitlementPayload = {
      sub: 'user-004',
      tier: 'PRO',
      features: PRO_FEATURES,
      issuedAt: now - 50 * 24 * 3600 * 1000,
      expiresAt: now - 20 * 24 * 3600 * 1000,
      deviceLimit: 3,
      deviceId,
    };

    const token = signer.sign(payload);
    const result = verifier.verifyToken(token, deviceId, now);

    expect(result.isValid).toBe(false);
    expect(result.tier).toBe('FREE');
    expect(result.isOfflineGrace).toBe(false);
  });

  it('should detect clock rollback / system clock manipulation', () => {
    const freshVerifier = new LicenseVerifier(secretKey);
    const now = 1700000000000;

    const payload: EntitlementPayload = {
      sub: 'user-005',
      tier: 'PRO',
      features: PRO_FEATURES,
      issuedAt: now - 10000,
      expiresAt: now + 30 * 24 * 3600 * 1000,
      deviceLimit: 3,
      deviceId,
    };

    const token = signer.sign(payload);
    // Verify at current time
    const res1 = freshVerifier.verifyToken(token, deviceId, now);
    expect(res1.isValid).toBe(true);

    // Now simulate user rolling back computer clock by 10 days
    const rolledBackTime = now - 10 * 24 * 3600 * 1000;
    const res2 = freshVerifier.verifyToken(token, deviceId, rolledBackTime);

    expect(res2.isValid).toBe(false);
    expect(res2.error).toContain('Clock manipulation detected');
  });

  it('should create checkout sessions via MockBillingProvider', async () => {
    const provider = new MockBillingProvider();
    const session = await provider.createCheckoutSession({
      userId: 'usr-999',
      tier: 'PRO',
      interval: 'month',
      successUrl: 'https://app/success',
      cancelUrl: 'https://app/cancel',
    });

    expect(session.sessionId).toContain('mock_sess_');
    expect(session.checkoutUrl).toContain('mock-checkout');
  });

  it('should generate VietQR URL and parse payment content with SePayBillingProvider', async () => {
    const sepay = new SePayBillingProvider({
      apiKey: 'test_sepay_key_123',
      accountNumber: '0333222111',
      bankName: 'MBBank',
      transferPrefix: 'EYEPOSTURE',
    });

    const qrResult = sepay.createQrPayment({
      userId: 'usr_abc123',
      tier: 'PRO',
      interval: 'month',
    });

    expect(qrResult.qrUrl).toContain('https://qr.sepay.vn/img?');
    expect(qrResult.qrUrl).toContain('acc=0333222111');
    expect(qrResult.qrUrl).toContain('bank=MBBank');
    expect(qrResult.amount).toBe(59000);
    expect(qrResult.transferContent).toContain('EYEPOSTURE usr_abc123');

    // Test content parsing
    const parsed = sepay.parsePaymentContent('chuyen khoan EYEPOSTURE usr_abc123 ORD999999');
    expect(parsed.userId).toBe('usr_abc123');
    expect(parsed.tier).toBe('PRO');

    // Test API key verification
    expect(sepay.verifyApiKey('Apikey test_sepay_key_123')).toBe(true);
    expect(sepay.verifyApiKey('Bearer test_sepay_key_123')).toBe(true);
    expect(sepay.verifyApiKey('wrong_key')).toBe(false);
  });
});
