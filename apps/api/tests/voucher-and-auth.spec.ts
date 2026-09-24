import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { EyePostureApiServer } from '../src/server.js';
import { VoucherService } from '../src/admin/voucher-service.js';

describe('Voucher Management and Extended Auth API', () => {
  let server: EyePostureApiServer;
  let baseUrl: string;

  beforeAll(async () => {
    server = new EyePostureApiServer({
      jwtSecret: 'test_jwt_secret',
      entitlementSecret: 'test_entitlement_secret',
    });
    const port = await server.listen(0);
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(async () => {
    await server.close();
  });

  it('should support admin creating, listing, and toggling vouchers', async () => {
    // 1. Create Voucher
    const createRes = await fetch(`${baseUrl}/api/v1/admin/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'TESTSALE50',
        discountPercent: 50,
        validUntil: new Date(Date.now() + 10 * 86400 * 1000).toISOString(),
        maxUses: 100,
        description: 'Test discount 50%',
      }),
    });

    expect(createRes.status).toBe(201);
    const createBody = await createRes.json();
    expect(createBody.success).toBe(true);
    expect(createBody.voucher.code).toBe('TESTSALE50');
    expect(createBody.voucher.discountPercent).toBe(50);

    // 2. List Vouchers
    const listRes = await fetch(`${baseUrl}/api/v1/admin/vouchers`);
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    expect(listBody.vouchers.some((v: any) => v.code === 'TESTSALE50')).toBe(true);

    // 3. Apply Voucher
    const applyRes = await fetch(`${baseUrl}/api/v1/vouchers/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'TESTSALE50',
        amount: 49000,
      }),
    });

    expect(applyRes.status).toBe(200);
    const applyBody = await applyRes.json();
    expect(applyBody.valid).toBe(true);
    expect(applyBody.discountPercent).toBe(50);
    expect(applyBody.discountAmount).toBe(24500);
    expect(applyBody.finalAmount).toBe(24500);

    // 4. Toggle Voucher
    const toggleRes = await fetch(`${baseUrl}/api/v1/admin/vouchers/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: createBody.voucher.id }),
    });
    expect(toggleRes.status).toBe(200);
    const toggleBody = await toggleRes.json();
    expect(toggleBody.voucher.isActive).toBe(false);

    // Applying inactive voucher should fail
    const applyFailRes = await fetch(`${baseUrl}/api/v1/vouchers/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'TESTSALE50',
        amount: 49000,
      }),
    });
    expect(applyFailRes.status).toBe(400);

    // 5. Delete Voucher
    const deleteRes = await fetch(`${baseUrl}/api/v1/admin/vouchers/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: createBody.voucher.id }),
    });
    expect(deleteRes.status).toBe(200);
  });

  it('should support forgot password and password reset flow', async () => {
    // 1. Register a test user
    const email = `reset_user_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'OldPassword123', name: 'User Reset' }),
    });
    expect(regRes.status).toBe(201);

    // 2. Request OTP for forgot password
    const forgotRes = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    expect(forgotRes.status).toBe(200);
    const forgotBody = await forgotRes.json();
    expect(forgotBody.success).toBe(true);
    expect(forgotBody.testCode).toBeDefined();

    // 3. Reset password using the code
    const resetRes = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        code: forgotBody.testCode,
        newPassword: 'BrandNewPassword456',
      }),
    });
    expect(resetRes.status).toBe(200);

    // 4. Verify user can now log in with the new password
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'BrandNewPassword456' }),
    });
    expect(loginRes.status).toBe(200);

    // Verify old password no longer works
    const oldLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'OldPassword123' }),
    });
    expect(oldLoginRes.status).toBe(401);
  });
});
