import * as http from 'http';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  User,
  Device,
  SubscriptionTier,
  SubscriptionStatus,
  EntitlementPayload,
} from '@eyeposture/shared-types';
import {
  EntitlementSigner,
  PRO_FEATURES,
  MockBillingProvider,
  SePayBillingProvider,
  SePayWebhookPayload,
} from '@eyeposture/billing';
import { getAdminDashboardHtml } from './admin/dashboard-html.js';

function loadEnvFile(): void {
  const envCandidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
  ];
  for (const p of envCandidates) {
    if (fs.existsSync(p)) {
      try {
        const text = fs.readFileSync(p, 'utf-8');
        for (const line of text.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch {
        // ignore
      }
      break;
    }
  }
}

loadEnvFile();

export interface ApiServerConfig {
  port?: number;
  jwtSecret?: string;
  entitlementSecret?: string;
  sepayApiKey?: string;
  sepayAccountNumber?: string;
  sepayBankName?: string;
}

export class EyePostureApiServer {
  private server: http.Server | null = null;
  private jwtSecret: string;
  private entitlementSigner: EntitlementSigner;
  private billingProvider = new MockBillingProvider();
  private sepayProvider: SePayBillingProvider;
  private sepayApiKey: string;

  // In-memory data store for the modular monolith service
  private users: Map<string, User & { passwordHash: string; salt: string }> = new Map();
  private devices: Map<string, Device> = new Map();
  private userSubscriptions: Map<
    string,
    { tier: SubscriptionTier; status: SubscriptionStatus; expiresAt: number }
  > = new Map();
  private processedWebhookEvents: Set<string> = new Set(); // Idempotency

  constructor(config: ApiServerConfig = {}) {
    loadEnvFile();
    this.jwtSecret = config.jwtSecret ?? process.env.JWT_SECRET ?? 'default_jwt_secret_eyeposture';
    const entitlementSecret =
      config.entitlementSecret ??
      process.env.ENTITLEMENT_SECRET ??
      'default_entitlement_secret_eyeposture';
    this.entitlementSigner = new EntitlementSigner(entitlementSecret);

    this.sepayApiKey =
      config.sepayApiKey ??
      process.env.SEPAY_WEBHOOK_SECRET ??
      process.env.SECRET_KEY ??
      process.env.SEPAY_API_KEY ??
      'sepay_api_key_eyeposture_demo';
    this.sepayProvider = new SePayBillingProvider({
      apiKey: this.sepayApiKey,
      accountNumber:
        config.sepayAccountNumber ??
        process.env.PAYMENT_BANK_ACCOUNT ??
        process.env.PAYMENT_BANK_VIRTUAL_ACCOUNT ??
        process.env.SEPAY_ACCOUNT_NUMBER,
      bankName:
        config.sepayBankName ??
        process.env.PAYMENT_BANK_CODE ??
        process.env.SEPAY_BANK_NAME,
      accountHolder:
        process.env.PAYMENT_BANK_ACCOUNT_NAME ??
        process.env.SEPAY_ACCOUNT_HOLDER,
    });

    this.loadPersistedDevices();
  }

  private loadPersistedDevices(): void {
    try {
      const candidates = [
        path.join(process.cwd(), 'data/devices.json'),
        '/tmp/eyeposture_devices.json',
        path.join(os.tmpdir(), 'eyeposture_devices.json'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const list = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (Array.isArray(list)) {
            for (const d of list) {
              if (d && d.id) this.devices.set(d.id, d);
            }
          }
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  private savePersistedDevices(): void {
    try {
      const list = Array.from(this.devices.values());
      const target = process.env.VERCEL ? '/tmp/eyeposture_devices.json' : path.join(os.tmpdir(), 'eyeposture_devices.json');
      fs.writeFileSync(target, JSON.stringify(list, null, 2), 'utf8');
    } catch {
      // ignore
    }
  }

  // --- Auth Utilities ---
  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  private createJwt(payload: { userId: string; email: string }): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const expPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 86400 };
    const encodedPayload = Buffer.from(JSON.stringify(expPayload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${encodedPayload}`)
      .digest('base64url');
    return `${header}.${encodedPayload}.${signature}`;
  }

  private verifyJwt(token: string): { valid: boolean; userId?: string; email?: string } {
    try {
      const [header, payload, signature] = token.split('.');
      const expected = crypto
        .createHmac('sha256', this.jwtSecret)
        .update(`${header}.${payload}`)
        .digest('base64url');
      if (signature !== expected) return { valid: false };

      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return { valid: false };

      return { valid: true, userId: decoded.userId, email: decoded.email };
    } catch {
      return { valid: false };
    }
  }

  private extractBearerToken(req: http.IncomingMessage): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  private parseBody(req: http.IncomingMessage): Promise<any> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  }

  private sendJson(res: http.ServerResponse, statusCode: number, data: unknown): void {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end(JSON.stringify(data));
  }

  // --- Request Handler ---
  public async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    
    // Resolve real pathname across Vercel serverless rewrites, Docker, and local execution
    let pathname =
      url.searchParams.get('__url') ||
      (req.headers['x-invoke-path'] as string) ||
      (req.headers['x-matched-path'] as string) ||
      (req.headers['x-forwarded-uri'] as string) ||
      (req.headers['x-original-url'] as string) ||
      url.pathname;

    if (pathname.includes('?')) {
      pathname = pathname.split('?')[0];
    }

    if (pathname === '/api/index.js' || pathname === '/api/index' || pathname === '/api/serverless.js') {
      const alt =
        url.searchParams.get('__url') ||
        (req.headers['x-invoke-path'] as string) ||
        (req.headers['x-matched-path'] as string);
      if (alt && !alt.includes('/api/index')) {
        pathname = alt.split('?')[0];
      } else {
        pathname = '/';
      }
    }

    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    const method = req.method;

    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end();
      return;
    }

    // Health check
    if (pathname === '/api/v1/health') {
      this.sendJson(res, 200, { status: 'ok', service: 'EyePosture Cloud API', timestamp: Date.now() });
      return;
    }

    // Favicon & System Brand Icons
    if ((pathname === '/favicon.ico' || pathname === '/EyePosture.ico') && method === 'GET') {
      const candidates = [
        path.resolve(process.cwd(), 'EyePosture.ico'),
        path.resolve(process.cwd(), 'public/EyePosture.ico'),
        path.resolve(process.cwd(), 'apps/api/public/EyePosture.ico'),
        path.resolve(__dirname, 'EyePosture.ico'),
        path.resolve(__dirname, '../EyePosture.ico'),
        path.resolve(__dirname, '../../EyePosture.ico'),
        path.resolve(__dirname, 'public/EyePosture.ico'),
        path.resolve(__dirname, '../public/EyePosture.ico'),
        path.resolve(__dirname, '../../public/EyePosture.ico'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          res.writeHead(200, {
            'Content-Type': 'image/x-icon',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(buf);
          return;
        }
      }
      res.writeHead(204);
      res.end();
      return;
    }

    if ((pathname === '/EyePosture.png' || pathname === '/icon.png') && method === 'GET') {
      const candidates = [
        path.resolve(process.cwd(), 'EyePosture.png'),
        path.resolve(process.cwd(), 'public/EyePosture.png'),
        path.resolve(process.cwd(), 'apps/api/public/EyePosture.png'),
        path.resolve(__dirname, 'EyePosture.png'),
        path.resolve(__dirname, '../EyePosture.png'),
        path.resolve(__dirname, '../../EyePosture.png'),
        path.resolve(__dirname, 'public/EyePosture.png'),
        path.resolve(__dirname, '../public/EyePosture.png'),
        path.resolve(__dirname, '../../public/EyePosture.png'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(buf);
          return;
        }
      }
      res.writeHead(204);
      res.end();
      return;
    }

    // Serve Web Admin Dashboard
    if ((pathname === '/' || pathname === '/admin' || pathname === '/admin/dashboard') && method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(getAdminDashboardHtml());
      return;
    }

    // 1. POST /api/v1/auth/register
    if (pathname === '/api/v1/auth/register' && method === 'POST') {
      const body = await this.parseBody(req);
      const { email, password, name } = body;
      if (!email || !password || !name) {
        this.sendJson(res, 400, { error: 'Missing email, password, or name' });
        return;
      }
      for (const u of this.users.values()) {
        if (u.email.toLowerCase() === email.toLowerCase()) {
          this.sendJson(res, 409, { error: 'Email already registered' });
          return;
        }
      }

      const id = crypto.randomUUID();
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = this.hashPassword(password, salt);
      const now = new Date().toISOString();

      const user = { id, email, name, role: 'USER' as const, createdAt: now, updatedAt: now };
      this.users.set(id, { ...user, passwordHash, salt });

      // Default to FREE subscription
      this.userSubscriptions.set(id, {
        tier: 'FREE',
        status: 'ACTIVE',
        expiresAt: Date.now() + 365 * 24 * 3600 * 1000,
      });

      const token = this.createJwt({ userId: id, email });
      this.sendJson(res, 201, { user, token });
      return;
    }

    // 2. POST /api/v1/auth/login
    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      const body = await this.parseBody(req);
      const { email, password } = body;
      let matchedUser: (User & { passwordHash: string; salt: string }) | undefined;

      for (const u of this.users.values()) {
        if (u.email.toLowerCase() === (email || '').toLowerCase()) {
          matchedUser = u;
          break;
        }
      }

      if (!matchedUser) {
        this.sendJson(res, 401, { error: 'Invalid credentials' });
        return;
      }

      const hash = this.hashPassword(password, matchedUser.salt);
      if (hash !== matchedUser.passwordHash) {
        this.sendJson(res, 401, { error: 'Invalid credentials' });
        return;
      }

      if (matchedUser.isBlocked) {
        this.sendJson(res, 403, { error: 'Account has been suspended by administrator' });
        return;
      }

      const token = this.createJwt({ userId: matchedUser.id, email: matchedUser.email });
      const { passwordHash, salt, ...safeUser } = matchedUser;
      this.sendJson(res, 200, { user: safeUser, token });
      return;
    }

    // Authenticated endpoints below:
    const bearer = this.extractBearerToken(req);
    const authResult = bearer ? this.verifyJwt(bearer) : { valid: false };

    // 3. GET /api/v1/me
    if (pathname === '/api/v1/me' && method === 'GET') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      const user = this.users.get(authResult.userId);
      if (!user) {
        this.sendJson(res, 404, { error: 'User not found' });
        return;
      }
      const { passwordHash, salt, ...safeUser } = user;
      this.sendJson(res, 200, { user: safeUser });
      return;
    }

    // 4a. GET /api/v1/devices (List all machines registered to the current user)
    if (pathname === '/api/v1/devices' && method === 'GET') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      const userDevices = Array.from(this.devices.values()).filter(
        (d) => d.userId === authResult.userId
      );
      this.sendJson(res, 200, { devices: userDevices });
      return;
    }

    // 4a. POST /api/v1/devices/telemetry (Automatic heartbeat & presence reporting from Desktop app)
    if ((pathname === '/api/v1/devices/telemetry' || pathname === '/api/v1/devices/heartbeat') && method === 'POST') {
      const body = await this.parseBody(req);
      const fingerprint = body.deviceFingerprint || body.fingerprint || 'win_anon_pc';
      const deviceName = body.deviceName || body.name || 'Desktop PC';
      const deviceOs = body.os || 'Windows 11';
      const appVersion = body.appVersion || '1.0.0';

      let existing = Array.from(this.devices.values()).find(
        (d) => d.deviceFingerprint === fingerprint
      );

      if (existing) {
        existing.lastActiveAt = new Date().toISOString();
        if (deviceName) existing.deviceName = deviceName;
        if (deviceOs) existing.os = deviceOs;
        if (appVersion) existing.appVersion = appVersion;
        existing.status = existing.isBlocked ? 'BLOCKED' : 'ACTIVE';
        this.savePersistedDevices();
        this.sendJson(res, 200, {
          success: true,
          status: existing.status,
          isBlocked: Boolean(existing.isBlocked),
          device: existing,
        });
        return;
      }

      const id = crypto.randomUUID();
      const newDev: Device = {
        id,
        userId: body.userId || `device_${fingerprint.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
        deviceFingerprint: fingerprint,
        deviceName,
        os: deviceOs,
        appVersion,
        status: 'ACTIVE',
        isBlocked: false,
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      this.devices.set(id, newDev);
      this.savePersistedDevices();
      this.sendJson(res, 201, {
        success: true,
        status: 'ACTIVE',
        isBlocked: false,
        device: newDev,
      });
      return;
    }

    // 4b. POST /api/v1/devices (Register machine with seat limit validation)
    if (pathname === '/api/v1/devices' && method === 'POST') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      const body = await this.parseBody(req);
      const fingerprint = body.deviceFingerprint || body.fingerprint || crypto.randomUUID();

      // Check if machine already registered
      const existing = Array.from(this.devices.values()).find(
        (d) => d.userId === authResult.userId && d.deviceFingerprint === fingerprint
      );
      if (existing) {
        existing.lastActiveAt = new Date().toISOString();
        if (body.deviceName || body.name) existing.deviceName = body.deviceName || body.name;
        if (body.appVersion) existing.appVersion = body.appVersion;
        this.sendJson(res, 200, { device: existing });
        return;
      }

      // Check seat limits according to subscription tier (Free: 1, Pro: 3, Family: 5)
      const sub = this.userSubscriptions.get(authResult.userId);
      const tier = sub?.tier || 'FREE';
      const limit = tier === 'FAMILY' ? 5 : tier === 'PRO' ? 3 : 1;
      const currentDevices = Array.from(this.devices.values()).filter(
        (d) => d.userId === authResult.userId
      );

      if (currentDevices.length >= limit) {
        this.sendJson(res, 409, {
          error: `Device seat limit reached (${limit} devices max for ${tier} tier). Please unlink an unused machine.`,
          deviceLimit: limit,
          currentCount: currentDevices.length,
        });
        return;
      }

      const id = crypto.randomUUID();
      const device: Device = {
        id,
        userId: authResult.userId,
        deviceFingerprint: fingerprint,
        deviceName: body.deviceName || body.name || 'Windows PC',
        os: body.os || 'Windows 11',
        appVersion: body.appVersion || '1.0.0',
        status: 'ACTIVE',
        isBlocked: false,
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      this.devices.set(id, device);
      this.sendJson(res, 201, { device });
      return;
    }

    // 4c. DELETE /api/v1/devices (Unlink/de-register machine to free up a slot)
    if (pathname === '/api/v1/devices' && method === 'DELETE') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      const deviceId = url.searchParams.get('id') || url.searchParams.get('deviceId');
      const fingerprint = url.searchParams.get('deviceFingerprint');

      let targetId: string | null = null;
      for (const [id, dev] of this.devices.entries()) {
        if (dev.userId === authResult.userId) {
          if ((deviceId && id === deviceId) || (fingerprint && dev.deviceFingerprint === fingerprint)) {
            targetId = id;
            break;
          }
        }
      }

      if (targetId) {
        this.devices.delete(targetId);
        this.sendJson(res, 200, { success: true, message: 'Device unlinked successfully' });
        return;
      }

      this.sendJson(res, 404, { error: 'Device not found' });
      return;
    }

    // 5. GET /api/v1/subscription
    if (pathname === '/api/v1/subscription' && method === 'GET') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      const sub = this.userSubscriptions.get(authResult.userId) ?? {
        tier: 'FREE' as const,
        status: 'ACTIVE' as const,
        expiresAt: Date.now() + 365 * 24 * 3600 * 1000,
      };
      this.sendJson(res, 200, { subscription: sub });
      return;
    }

    // 6. POST /api/v1/subscription/checkout
    if (pathname === '/api/v1/subscription/checkout' && method === 'POST') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      const body = await this.parseBody(req);

      // Support SePay VietQR payment
      if (body.provider === 'sepay' || body.currency === 'VND') {
        const qrPayment = this.sepayProvider.createQrPayment({
          userId: authResult.userId,
          tier: body.tier || 'PRO',
          interval: body.interval || 'month',
        });
        this.sendJson(res, 200, {
          provider: 'sepay',
          ...qrPayment,
          checkoutUrl: qrPayment.qrUrl,
          sessionId: qrPayment.orderCode,
        });
        return;
      }

      const session = await this.billingProvider.createCheckoutSession({
        userId: authResult.userId,
        tier: body.tier || 'PRO',
        interval: body.interval || 'month',
        successUrl: body.successUrl || 'https://eyeposture.com/success',
        cancelUrl: body.cancelUrl || 'https://eyeposture.com/cancel',
      });
      this.sendJson(res, 200, session);
      return;
    }

    // 7. GET /api/v1/entitlements (Mint signed token for desktop app)
    if (pathname === '/api/v1/entitlements' && method === 'GET') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }

      const user = this.users.get(authResult.userId);
      if (user?.isBlocked) {
        this.sendJson(res, 403, { error: 'Account has been suspended by administrator' });
        return;
      }

      const deviceId = url.searchParams.get('deviceId') || 'default_device';
      const dev = Array.from(this.devices.values()).find(
        (d) => d.deviceFingerprint === deviceId || d.id === deviceId
      );
      if (dev?.isBlocked) {
        this.sendJson(res, 403, { error: 'This device has been blocked by administrator' });
        return;
      }

      const sub = this.userSubscriptions.get(authResult.userId) ?? {
        tier: 'FREE' as const,
        status: 'ACTIVE' as const,
        expiresAt: Date.now() + 365 * 24 * 3600 * 1000,
      };

      const payload: EntitlementPayload = {
        sub: authResult.userId,
        tier: sub.tier,
        features: sub.tier === 'FREE' ? ['basic_reminders'] : PRO_FEATURES,
        issuedAt: Date.now(),
        expiresAt: sub.expiresAt,
        deviceLimit: sub.tier === 'FAMILY' ? 5 : 3,
        deviceId,
      };

      const signedToken = this.entitlementSigner.sign(payload);
      this.sendJson(res, 200, { entitlementToken: signedToken, payload });
      return;
    }

    // 8. POST /api/v1/webhooks/sepay (SePay Automated Bank Transfer Webhook)
    if (pathname === '/api/v1/webhooks/sepay' && method === 'POST') {
      const authHeader = (req.headers.authorization as string) || (req.headers['apikey'] as string);
      if (!this.sepayProvider.verifyApiKey(authHeader)) {
        this.sendJson(res, 401, { error: 'Unauthorized: Invalid SePay API key' });
        return;
      }

      const body: SePayWebhookPayload = await this.parseBody(req);
      const eventId = `sepay_${body.id || body.referenceCode || Date.now()}`;

      // Idempotent processing
      if (this.processedWebhookEvents.has(eventId)) {
        this.sendJson(res, 200, { success: true, idempotent: true });
        return;
      }
      this.processedWebhookEvents.add(eventId);

      // Only process incoming money ('in')
      if (body.transferType !== 'in') {
        this.sendJson(res, 200, { success: true, ignored: true, reason: 'transferType is not in' });
        return;
      }

      // Parse payment content: e.g. "EYEPOSTURE usr_12345"
      const parsed = this.sepayProvider.parsePaymentContent(body.content);
      const userId = parsed.userId;

      if (userId && this.users.has(userId)) {
        const isYearly = body.transferAmount >= 490000;
        const durationMs = isYearly ? 365 * 86400 * 1000 : 30 * 86400 * 1000;
        const tier =
          parsed.tier || (body.transferAmount >= 99000 && /family/i.test(body.content) ? 'FAMILY' : 'PRO');

        this.userSubscriptions.set(userId, {
          tier,
          status: 'ACTIVE',
          expiresAt: Date.now() + durationMs,
        });
      }

      this.sendJson(res, 200, { success: true, processed: true, userId });
      return;
    }

    // 9. POST /api/v1/webhooks/stripe (Stripe Webhook Fallback)
    if (pathname === '/api/v1/webhooks/stripe' && method === 'POST') {
      const body = await this.parseBody(req);
      const eventId = body.id || crypto.randomUUID();

      // Idempotent processing
      if (this.processedWebhookEvents.has(eventId)) {
        this.sendJson(res, 200, { received: true, idempotent: true });
        return;
      }
      this.processedWebhookEvents.add(eventId);

      const { userId, tier, status, currentPeriodEnd } = body.data || {};
      if (userId) {
        this.userSubscriptions.set(userId, {
          tier: tier || 'PRO',
          status: status || 'ACTIVE',
          expiresAt: currentPeriodEnd || Date.now() + 30 * 86400 * 1000,
        });
      }

      this.sendJson(res, 200, { received: true, processed: true });
      return;
    }

    // 9. POST /api/v1/sync
    if (pathname === '/api/v1/sync' && method === 'POST') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      const body = await this.parseBody(req);
      // Echo synced status with server timestamp
      this.sendJson(res, 200, {
        synced: true,
        serverTimestamp: Date.now(),
        acceptedItems: (body.items || []).length,
      });
      return;
    }

    // --- Admin Device & Account Management Endpoints ---

    // 10. GET /api/v1/admin/devices (View all machines using the app)
    if (pathname === '/api/v1/admin/devices' && method === 'GET') {
      const allDevices = Array.from(this.devices.values()).map((d) => {
        const u = this.users.get(d.userId);
        return {
          id: d.id,
          userId: d.userId,
          userEmail: u?.email || `${d.deviceName || 'Máy Desktop'} (Client)`,
          userName: u?.name || 'Máy Khách Desktop',
          deviceName: d.deviceName,
          deviceFingerprint: d.deviceFingerprint,
          os: d.os,
          appVersion: d.appVersion,
          status: d.status || (d.isBlocked ? 'BLOCKED' : 'ACTIVE'),
          isBlocked: Boolean(d.isBlocked),
          lastActiveAt: d.lastActiveAt,
          createdAt: d.createdAt,
        };
      });
      this.sendJson(res, 200, { total: allDevices.length, devices: allDevices });
      return;
    }

    // 10b. GET /api/v1/admin/users (View all accounts with subscription status and device count)
    if (pathname === '/api/v1/admin/users' && method === 'GET') {
      const allUsers = Array.from(this.users.values()).map((u) => {
        const sub = this.userSubscriptions.get(u.id);
        const userDevs = Array.from(this.devices.values()).filter((d) => d.userId === u.id);
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          isBlocked: Boolean(u.isBlocked),
          status: u.status || (u.isBlocked ? 'BLOCKED' : 'ACTIVE'),
          subscription: sub || { tier: 'FREE', status: 'ACTIVE', expiresAt: null },
          deviceCount: userDevs.length,
          createdAt: u.createdAt,
        };
      });
      this.sendJson(res, 200, { total: allUsers.length, users: allUsers });
      return;
    }

    // 11. POST /api/v1/admin/devices/block (Block/ban a specific machine)
    if (pathname === '/api/v1/admin/devices/block' && method === 'POST') {
      const body = await this.parseBody(req);
      const query = body.deviceId || body.deviceFingerprint;
      const target = Array.from(this.devices.values()).find(
        (d) => d.id === query || d.deviceFingerprint === query
      );
      if (!target) {
        this.sendJson(res, 404, { error: 'Device not found' });
        return;
      }
      target.isBlocked = true;
      target.status = 'BLOCKED';
      this.savePersistedDevices();
      this.sendJson(res, 200, { success: true, message: 'Device blocked successfully', device: target });
      return;
    }

    // 12. POST /api/v1/admin/devices/unblock (Unblock/restore a banned machine)
    if (pathname === '/api/v1/admin/devices/unblock' && method === 'POST') {
      const body = await this.parseBody(req);
      const query = body.deviceId || body.deviceFingerprint;
      const target = Array.from(this.devices.values()).find(
        (d) => d.id === query || d.deviceFingerprint === query
      );
      if (!target) {
        this.sendJson(res, 404, { error: 'Device not found' });
        return;
      }
      target.isBlocked = false;
      target.status = 'ACTIVE';
      this.savePersistedDevices();
      this.sendJson(res, 200, { success: true, message: 'Device unblocked successfully', device: target });
      return;
    }

    // 13. POST /api/v1/admin/users/block (Suspend/block an account)
    if (pathname === '/api/v1/admin/users/block' && method === 'POST') {
      const body = await this.parseBody(req);
      let targetUser = this.users.get(body.userId);
      if (!targetUser && body.email) {
        targetUser = Array.from(this.users.values()).find((u) => u.email.toLowerCase() === body.email.toLowerCase());
      }
      if (!targetUser) {
        this.sendJson(res, 404, { error: 'User not found' });
        return;
      }
      targetUser.isBlocked = true;
      targetUser.status = 'BLOCKED';
      this.sendJson(res, 200, { success: true, message: 'User account suspended', userId: targetUser.id });
      return;
    }

    // 14. POST /api/v1/admin/users/unblock (Restore/unblock a suspended account)
    if (pathname === '/api/v1/admin/users/unblock' && method === 'POST') {
      const body = await this.parseBody(req);
      let targetUser = this.users.get(body.userId);
      if (!targetUser && body.email) {
        targetUser = Array.from(this.users.values()).find((u) => u.email.toLowerCase() === body.email.toLowerCase());
      }
      if (!targetUser) {
        this.sendJson(res, 404, { error: 'User not found' });
        return;
      }
      targetUser.isBlocked = false;
      targetUser.status = 'ACTIVE';
      this.sendJson(res, 200, { success: true, message: 'User account restored', userId: targetUser.id });
      return;
    }

    // 15. GET /api/v1/admin/stats
    if (pathname === '/api/v1/admin/stats' && method === 'GET') {
      const allUsers = Array.from(this.users.values());
      const allDevices = Array.from(this.devices.values());
      const proUsers = allUsers.filter((u) => {
        const sub = this.userSubscriptions.get(u.id);
        return sub?.tier === 'PRO' || sub?.tier === 'FAMILY';
      });
      const totalRevenueVnd = proUsers.length * 59000 + 490000;
      const stats = {
        totalUsers: allUsers.length,
        totalDevices: allDevices.length,
        activeDevices: allDevices.filter((d) => !d.isBlocked).length,
        blockedDevices: allDevices.filter((d) => d.isBlocked).length,
        proUsersCount: proUsers.length,
        totalRevenueVnd,
        revenueHistory: [295000, 413000, 354000, 590000, 708000, 885000, Math.max(totalRevenueVnd, 1180000)],
        userGrowth: [12, 19, 25, 32, 45, 58, Math.max(70, allUsers.length * 10)],
        activeTrend: [8, 15, 20, 26, 38, 50, Math.max(60, allUsers.length * 8)],
      };
      this.sendJson(res, 200, stats);
      return;
    }

    // 16. POST /api/v1/admin/users/upgrade
    if (pathname === '/api/v1/admin/users/upgrade' && method === 'POST') {
      const body = await this.parseBody(req);
      const { userId, tier = 'PRO', days = 365 } = body;
      const user = this.users.get(userId);
      if (!user) {
        this.sendJson(res, 404, { error: 'User not found' });
        return;
      }
      this.userSubscriptions.set(userId, {
        tier: (tier as SubscriptionTier) || 'PRO',
        status: 'ACTIVE',
        expiresAt: Date.now() + days * 86400 * 1000,
      });
      this.sendJson(res, 200, {
        success: true,
        userId,
        tier,
        expiresAt: Date.now() + days * 86400 * 1000,
      });
      return;
    }

    this.sendJson(res, 404, { error: 'Endpoint not found' });
  }

  public listen(port: number = 0): Promise<number> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res).catch((err) => {
          this.sendJson(res, 500, { error: 'Internal Server Error', message: String(err) });
        });
      });
      this.server.listen(port, () => {
        const address = this.server?.address();
        const assignedPort = typeof address === 'object' && address ? address.port : port;
        resolve(assignedPort);
      });
    });
  }

  public close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}

// Serverless function handler for Vercel / Cloud Functions
let serverlessInstance: EyePostureApiServer | null = null;

export function handleServerless(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  if (!serverlessInstance) {
    serverlessInstance = new EyePostureApiServer();
  }
  return serverlessInstance.handleRequest(req, res);
}

// Guarantee both CommonJS and ES Module interop for Vercel / serverless runtimes
(handleServerless as any).default = handleServerless;
(handleServerless as any).handleServerless = handleServerless;
(handleServerless as any).EyePostureApiServer = EyePostureApiServer;

const modRef = typeof (globalThis as any).module !== 'undefined' ? (globalThis as any).module : null;
if (modRef && modRef.exports) {
  modRef.exports = handleServerless;
  modRef.exports.default = handleServerless;
  modRef.exports.handleServerless = handleServerless;
  modRef.exports.EyePostureApiServer = EyePostureApiServer;
}

export default handleServerless;

