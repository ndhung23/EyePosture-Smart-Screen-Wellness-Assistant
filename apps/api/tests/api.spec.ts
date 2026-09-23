import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { EyePostureApiServer } from '../src/server.js';
import { LicenseVerifier } from '@eyeposture/billing';

describe('Cloud API Endpoints & Licensing Integration', () => {
  let server: EyePostureApiServer;
  let baseUrl: string;
  const entitlementSecret = 'integration_test_secret_key_123';
  const verifier = new LicenseVerifier(entitlementSecret);

  const sepayApiKey = 'test_sepay_key_eyeposture';

  beforeAll(async () => {
    server = new EyePostureApiServer({
      jwtSecret: 'test_jwt_secret',
      entitlementSecret,
      sepayApiKey,
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

  it('should authenticate admin account with admin / 1', async () => {
    // 1. Login with username admin and password 1
    const adminLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin', password: '1' }),
    });
    expect(adminLogin.status).toBe(200);
    const adminData = await adminLogin.json();
    expect(adminData.user.role).toBe('ADMIN');
    expect(adminData.token).toBeTruthy();

    // 2. Login with alias admin@eyeposture.com
    const aliasLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@eyeposture.com', password: '1' }),
    });
    expect(aliasLogin.status).toBe(200);

    // 3. Login with wrong password for admin
    const wrongPass = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin', password: 'wrong' }),
    });
    expect(wrongPass.status).toBe(401);
  }, 15000);

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

  it('should process SePay VietQR checkout and automated bank webhook', async () => {
    // 1. Register a new user
    const sepayEmail = `sepay_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sepayEmail, password: 'password123', name: 'SePay User' }),
    });
    const { token, user } = await regRes.json();

    // 2. Request VietQR checkout session
    const checkoutRes = await fetch(`${baseUrl}/api/v1/subscription/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        provider: 'sepay',
        tier: 'PRO',
        interval: 'month',
      }),
    });
    expect(checkoutRes.status).toBe(200);
    const checkoutBody = await checkoutRes.json();
    expect(checkoutBody.provider).toBe('sepay');
    expect(checkoutBody.qrUrl).toContain('https://qr.sepay.vn/img?');
    expect(checkoutBody.amount).toBe(19000);
    expect(checkoutBody.transferContent).toContain(user.id);

    // Verify polling status before payment
    if (checkoutBody.orderCode) {
      const statusBefore = await fetch(`${baseUrl}/api/v1/orders/${checkoutBody.orderCode}/status`);
      expect(statusBefore.status).toBe(200);
      const bodyBefore = await statusBefore.json();
      expect(bodyBefore.status).toBe('PENDING');
    }

    // 3. Reject SePay webhook without valid API key
    const unauthRes = await fetch(`${baseUrl}/api/v1/webhooks/sepay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Apikey invalid_key',
      },
      body: JSON.stringify({ id: 12345, content: `EYEPOSTURE ${user.id}`, transferType: 'in', transferAmount: 30000 }),
    });
    expect(unauthRes.status).toBe(401);

    // 4. Send valid SePay webhook
    const txId = Date.now();
    const webhookRes = await fetch(`${baseUrl}/api/v1/webhooks/sepay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Apikey ${sepayApiKey}`,
      },
      body: JSON.stringify({
        id: txId,
        gateway: 'MBBank',
        transactionDate: '2026-09-15 12:30:00',
        accountNumber: '0333222111',
        code: null,
        content: `EYEPOSTURE ${user.id} ORD123`,
        transferType: 'in',
        transferAmount: 30000,
        accumulated: 1000000,
        referenceCode: `MB.${txId}`,
        description: 'Chuyen khoan nang cap Pro',
      }),
    });
    expect(webhookRes.status).toBe(200);
    const webhookData = await webhookRes.json();
    expect(webhookData.success).toBe(true);
    expect(webhookData.processed).toBe(true);

    // 5. Verify user entitlement is upgraded to PRO
    const proEntRes = await fetch(`${baseUrl}/api/v1/entitlements?deviceId=win11_dev_sepay`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(proEntRes.status).toBe(200);
    const proBody = await proEntRes.json();
    const verifyResult = verifier.verifyToken(proBody.entitlementToken, 'win11_dev_sepay');
    expect(verifyResult.isValid).toBe(true);
    expect(verifyResult.tier).toBe('PRO');

    // 6. Test Idempotency: replay the same transaction
    const dupRes = await fetch(`${baseUrl}/api/v1/webhooks/sepay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Apikey ${sepayApiKey}`,
      },
      body: JSON.stringify({
        id: txId,
        content: `EYEPOSTURE ${user.id} ORD123`,
        transferType: 'in',
        transferAmount: 30000,
      }),
    });
    expect(dupRes.status).toBe(200);
    const dupData = await dupRes.json();
    expect(dupData.idempotent).toBe(true);
  });

  it('should manage devices, enforce seat limits, and allow admin to block and unblock machines and accounts', async () => {
    // 1. Register a user
    const devEmail = `dev_mgmt_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: devEmail, password: 'Password123!', name: 'Device Manager' }),
    });
    const { token, user } = await regRes.json();

    // 2. Register first machine (allowed for Free tier)
    const dev1Res = await fetch(`${baseUrl}/api/v1/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ deviceFingerprint: 'hw_macbook_01', deviceName: 'Hung Laptop', os: 'macOS' }),
    });
    expect(dev1Res.status).toBe(201);
    const { device: dev1 } = await dev1Res.json();
    expect(dev1.deviceFingerprint).toBe('hw_macbook_01');

    // 3. Register second machine on Free tier -> should be rejected due to seat limit (1 machine max for Free)
    const dev2Res = await fetch(`${baseUrl}/api/v1/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ deviceFingerprint: 'hw_desktop_02', deviceName: 'Workstation PC', os: 'Windows 11' }),
    });
    expect(dev2Res.status).toBe(409);

    // 4. List user's devices
    const listRes = await fetch(`${baseUrl}/api/v1/devices`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(listData.devices.length).toBe(1);
    expect(listData.devices[0].deviceName).toBe('Hung Laptop');

    // 5. Admin can see all machines across the system
    const adminDevRes = await fetch(`${baseUrl}/api/v1/admin/devices`);
    expect(adminDevRes.status).toBe(200);
    const adminDevData = await adminDevRes.json();
    expect(adminDevData.total).toBeGreaterThanOrEqual(1);

    // 6. Admin blocks this specific machine
    const blockDevRes = await fetch(`${baseUrl}/api/v1/admin/devices/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceFingerprint: 'hw_macbook_01' }),
    });
    expect(blockDevRes.status).toBe(200);

    // Blocked machine attempts to fetch entitlement -> gets 403 Forbidden
    const blockedEntRes = await fetch(`${baseUrl}/api/v1/entitlements?deviceId=hw_macbook_01`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(blockedEntRes.status).toBe(403);

    // 7. Admin UNBLOCKS this machine -> restored back to normal
    const unblockDevRes = await fetch(`${baseUrl}/api/v1/admin/devices/unblock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceFingerprint: 'hw_macbook_01' }),
    });
    expect(unblockDevRes.status).toBe(200);

    // Machine can fetch entitlement normally again
    const restoredEntRes = await fetch(`${baseUrl}/api/v1/entitlements?deviceId=hw_macbook_01`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(restoredEntRes.status).toBe(200);

    // 8. Admin blocks the user account
    const blockUserRes = await fetch(`${baseUrl}/api/v1/admin/users/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    expect(blockUserRes.status).toBe(200);

    // User cannot log in while blocked
    const blockedLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: devEmail, password: 'Password123!' }),
    });
    expect(blockedLoginRes.status).toBe(403);

    // 9. Admin UNBLOCKS the user account
    const unblockUserRes = await fetch(`${baseUrl}/api/v1/admin/users/unblock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    expect(unblockUserRes.status).toBe(200);

    // User can log in normally again
    const unblockedLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: devEmail, password: 'Password123!' }),
    });
    expect(unblockedLoginRes.status).toBe(200);

    // 10. User unlinks machine to free up slot
    const unlinkRes = await fetch(`${baseUrl}/api/v1/devices?deviceFingerprint=hw_macbook_01`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(unlinkRes.status).toBe(200);
  });

  it('should serve Landing Page at / and redirect Windows download at /download/win', async () => {
    // 1. Landing Page HTML at /
    const homeRes = await fetch(`${baseUrl}/`);
    expect(homeRes.status).toBe(200);
    expect(homeRes.headers.get('content-type')).toContain('text/html');
    const homeHtml = await homeRes.text();
    expect(homeHtml).toContain('EyePosture');
    expect(homeHtml).toContain('Tải Cho Windows');
    expect(homeHtml).toContain('Bảo Vệ Thị Lực');

    // 2. Admin Hub HTML at /admin
    const adminRes = await fetch(`${baseUrl}/admin`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.headers.get('content-type')).toContain('text/html');
    const adminHtml = await adminRes.text();
    expect(adminHtml).toContain('Admin Dashboard');

    // 3. Windows .exe download redirect at /download/win
    const downloadRes = await fetch(`${baseUrl}/download/win`, {
      redirect: 'manual',
    });
    expect(downloadRes.status).toBe(302);
    expect(downloadRes.headers.get('location')).toBeDefined();
    expect(downloadRes.headers.get('location')).toContain('github.com');
  });
});
