import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { EyePostureApiServer } from '../src/server.js';
import { LicenseVerifier } from '@eyeposture/billing';

describe('Cloud API Endpoints & Licensing Integration', () => {
  let server: EyePostureApiServer;
  let baseUrl: string;
  const entitlementSecret = 'integration_test_secret_key_123';
  const verifier = new LicenseVerifier(entitlementSecret);

  beforeAll(async () => {
    server = new EyePostureApiServer({
      jwtSecret: 'test_jwt_secret',
      entitlementSecret,
    });
    const port = await server.listen(0);
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(async () => {
    await server.close();
  });

  it('should respond to health check', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  it('should register and login a user', async () => {
    const email = `test_${Date.now()}@eyeposture.com`;
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'SecurePassword123!', name: 'Test User' }),
    });

    expect(regRes.status).toBe(201);
    const regBody = await regRes.json();
    expect(regBody.token).toBeDefined();
    expect(regBody.user.email).toBe(email);

    // Login with valid password
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'SecurePassword123!' }),
    });
    expect(loginRes.status).toBe(200);

    // Login with invalid password
    const badLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'WrongPassword' }),
    });
    expect(badLogin.status).toBe(401);
  });

  it('should complete billing upgrade flow and mint cryptographically verifiable license', async () => {
    const email = `pro_${Date.now()}@eyeposture.com`;
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password999!', name: 'Pro Buyer' }),
    });
    const { token, user } = await regRes.json();

    // 1. Initial entitlement should be FREE
    const freeEntRes = await fetch(`${baseUrl}/api/v1/entitlements?deviceId=win11_dev_1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(freeEntRes.status).toBe(200);
    const freeBody = await freeEntRes.json();
    const freeVerify = verifier.verifyToken(freeBody.entitlementToken, 'win11_dev_1');
    expect(freeVerify.isValid).toBe(true);
    expect(freeVerify.tier).toBe('FREE');

    // 2. Process Stripe Webhook: user upgraded to PRO
    const webhookRes = await fetch(`${baseUrl}/api/v1/webhooks/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `evt_${Date.now()}`,
        type: 'subscription_created',
        data: {
          userId: user.id,
          tier: 'PRO',
          status: 'ACTIVE',
          currentPeriodEnd: Date.now() + 30 * 86400 * 1000,
        },
      }),
    });
    expect(webhookRes.status).toBe(200);

    // 3. Request entitlement again -> must return signed PRO entitlement
    const proEntRes = await fetch(`${baseUrl}/api/v1/entitlements?deviceId=win11_dev_1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(proEntRes.status).toBe(200);
    const proBody = await proEntRes.json();

    // Client verifies signature offline using public key / secret
    const proVerify = verifier.verifyToken(proBody.entitlementToken, 'win11_dev_1');
    expect(proVerify.isValid).toBe(true);
    expect(proVerify.tier).toBe('PRO');
    expect(proVerify.features).toContain('posture_full');
    expect(proVerify.daysRemaining).toBeGreaterThanOrEqual(29);
  });
});
