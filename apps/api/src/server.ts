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
import { getLandingPageHtml } from './landing/landing-html.js';
import { handleAdminRoutes } from './admin/admin-handlers.js';
import { handlePasswordResetRoutes } from './auth/password-reset-handlers.js';
import { handleAuthRoutes } from './auth/auth-handlers.js';
import { handleVoucherRoutes } from './admin/voucher-handlers.js';
import { EmailService } from './services/email-service.js';
import { SupabaseService } from './supabase-client.js';
import {
  seedAdminAccount,
  isAdminIdentifier,
  ADMIN_USER_ID,
  loadPersistedUsers,
  savePersistedUsers,
} from './admin/admin-seed.js';

import { loadEnvFile } from './env-loader.js';

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
  private supabase = new SupabaseService();

  // In-memory data store for caching and fallback
  private users: Map<string, User & { passwordHash: string; salt: string }> = new Map();
  private devices: Map<string, Device> = new Map();
  private userSubscriptions: Map<
    string,
    { tier: SubscriptionTier; status: SubscriptionStatus; expiresAt: number }
  > = new Map();
  private orders: Map<string, any> = new Map();
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
    loadPersistedUsers(this.users, this.userSubscriptions);
    seedAdminAccount(this.users, this.userSubscriptions, this.supabase);
    if (this.supabase.isAvailable()) {
      this.syncFromSupabase().catch(() => {});
    }
  }

  public async syncFromSupabase(): Promise<void> {
    if (!this.supabase.isAvailable()) return;
    try {
      const [dbUsers, dbSubs, dbDevs] = await Promise.all([
        this.supabase.getAllUsers(),
        this.supabase.getAllSubscriptions(),
        this.supabase.getAllDevices(),
      ]);

      const subMap = new Map<string, any>();
      for (const s of dbSubs) subMap.set(s.user_id, s);

      for (const u of dbUsers) {
        this.users.set(u.id, {
          id: u.id,
          email: u.email,
          name: u.name,
          role: (u.role as any) || 'USER',
          passwordHash: u.password_hash,
          salt: u.salt,
          isBlocked: Boolean(u.is_blocked),
          createdAt: u.created_at || new Date().toISOString(),
          updatedAt: u.updated_at || new Date().toISOString(),
        });
        const sub = subMap.get(u.id);
        if (sub) {
          this.userSubscriptions.set(u.id, {
            tier: sub.tier,
            status: sub.status,
            expiresAt: Number(sub.expires_at),
          });
        }
      }

      for (const d of dbDevs) {
        this.devices.set(d.id, {
          id: d.id,
          userId: d.user_id || 'anonymous',
          deviceName: d.device_name,
          deviceFingerprint: d.device_fingerprint,
          os: d.os,
          appVersion: d.app_version,
          status: (d.status as any) || (d.is_blocked ? 'BLOCKED' : 'ACTIVE'),
          isBlocked: Boolean(d.is_blocked),
          lastActiveAt: d.last_active_at || new Date().toISOString(),
          createdAt: d.created_at || new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('[Supabase] Initial sync failed:', err);
    }
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
      const dir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch {}
      }
      const target = fs.existsSync(dir)
        ? path.join(dir, 'devices.json')
        : process.env.VERCEL
        ? '/tmp/eyeposture_devices.json'
        : path.join(os.tmpdir(), 'eyeposture_devices.json');
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
      this.sendJson(res, 200, {
        status: 'ok',
        service: 'EyePosture Cloud API',
        supabaseConnected: this.supabase.isAvailable(),
        timestamp: Date.now(),
      });
      return;
    }

    // Favicon & System Brand Icons
    // Static Brand Assets (.ico & .png)
    if (
      (pathname === '/favicon.ico' ||
        pathname === '/EyePosture.ico' ||
        pathname === '/EyePosture.png' ||
        pathname === '/icon.png') &&
      method === 'GET'
    ) {
      const filename = pathname.endsWith('.ico') ? 'EyePosture.ico' : 'EyePosture.png';
      const contentType = pathname.endsWith('.ico') ? 'image/x-icon' : 'image/png';
      const candidates = [
        path.resolve(process.cwd(), filename),
        path.resolve(process.cwd(), 'public', filename),
        path.resolve(process.cwd(), 'apps/api/public', filename),
        path.resolve(__dirname, filename),
        path.resolve(__dirname, '..', filename),
        path.resolve(__dirname, '../..', filename),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          res.writeHead(200, {
            'Content-Type': contentType,
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

    // Direct Windows .exe download redirect
    if (
      (pathname === '/download' ||
        pathname === '/download/win' ||
        pathname === '/download/windows' ||
        pathname === '/download/EyePosture.exe') &&
      method === 'GET'
    ) {
      const downloadUrl =
        process.env.WINDOWS_DOWNLOAD_URL ||
        'https://github.com/ndhung23/EyePosture-Smart-Screen-Wellness-Assistant/releases/latest/download/EyePosture.exe';
      res.writeHead(302, {
        Location: downloadUrl,
        'Cache-Control': 'no-cache',
      });
      res.end();
      return;
    }

    // Serve Landing Page (Homepage)
    if ((pathname === '/' || pathname === '/home') && method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(getLandingPageHtml());
      return;
    }

    // Serve Web Admin Dashboard
    if ((pathname === '/admin' || pathname === '/admin/dashboard') && method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(getAdminDashboardHtml());
      return;
    }

    // 1 & 2. Delegate Auth Routes (Register & Login)
    const authHandled = await handleAuthRoutes(req, res, pathname, method, {
      users: this.users,
      userSubscriptions: this.userSubscriptions,
      supabase: this.supabase,
      sendJson: (sRes, code, data) => this.sendJson(sRes, code, data),
      parseBody: (sReq) => this.parseBody(sReq),
      hashPassword: (p, s) => this.hashPassword(p, s),
      createJwt: (payload) => this.createJwt(payload),
    });
    if (authHandled) return;


    // 2b. GET /api/v1/orders/:orderCode/status (Realtime Polling for QR Payment)
    if (pathname.startsWith('/api/v1/orders/') && pathname.endsWith('/status') && method === 'GET') {
      const parts = pathname.split('/');
      const orderCode = parts[parts.length - 2];

      let order = this.orders.get(orderCode) || null;
      if (!order && this.supabase.isAvailable()) {
        order = await this.supabase.getOrderByCode(orderCode);
        if (order) this.orders.set(orderCode, order);
      }

      if (!order) {
        this.sendJson(res, 404, { error: 'Order not found' });
        return;
      }

      let entitlementToken = null;
      if (order.status === 'PAID') {
        const deviceId = url.searchParams.get('deviceId') || 'default_device';
        const payload: EntitlementPayload = {
          sub: order.user_id,
          tier: order.tier,
          features: PRO_FEATURES,
          issuedAt: Date.now(),
          expiresAt: Date.now() + (order.interval === 'year' ? 365 : 30) * 86400 * 1000,
          deviceLimit: order.tier === 'FAMILY' ? 5 : 3,
          deviceId,
        };
        entitlementToken = this.entitlementSigner.sign(payload);
      }

      this.sendJson(res, 200, {
        orderCode: order.order_code,
        status: order.status,
        tier: order.tier,
        amount: order.amount,
        paidAt: order.paid_at,
        entitlementToken,
      });
      return;
    }

    // 8. POST /api/v1/webhooks/sepay or /api/v1/billing/webhook/sepay (SePay Webhook)
    if ((pathname === '/api/v1/webhooks/sepay' || pathname === '/api/v1/billing/webhook/sepay') && method === 'POST') {
      const authHeader = (req.headers.authorization as string) || (req.headers['apikey'] as string);
      if (!this.sepayProvider.verifyApiKey(authHeader)) {
        this.sendJson(res, 401, { error: 'Unauthorized: Invalid SePay API key' });
        return;
      }

      const body: SePayWebhookPayload = await this.parseBody(req);
      const eventId = `sepay_${body.id || body.referenceCode || Date.now()}`;

      if (this.processedWebhookEvents.has(eventId)) {
        this.sendJson(res, 200, { success: true, idempotent: true });
        return;
      }
      this.processedWebhookEvents.add(eventId);

      if (body.transferType !== 'in') {
        this.sendJson(res, 200, { success: true, ignored: true, reason: 'transferType is not in' });
        return;
      }

      // Parse payment content: e.g. "EP 123456" or "EP123456"
      const content = body.content || '';
      const orderMatch = content.match(/EP[\s_-]?([a-zA-Z0-9]+)/i);
      const extractedOrderCode = orderMatch
        ? orderMatch[0].replace(/[\s_-]/g, '').toUpperCase()
        : null;

      let matchedUserId: string | null = null;
      let targetTier: SubscriptionTier = 'PRO';

      if (extractedOrderCode) {
        let order = this.orders.get(extractedOrderCode) || null;
        if (!order && this.supabase.isAvailable()) {
          order = await this.supabase.getOrderByCode(extractedOrderCode);
        }
        if (order) {
          order.status = 'PAID';
          this.orders.set(extractedOrderCode, order);
          if (this.supabase.isAvailable()) {
            await this.supabase.markOrderPaid(extractedOrderCode);
          }
          matchedUserId = order.user_id;
          targetTier = order.tier;
          const isYearly = order.interval === 'year' || body.transferAmount >= 490000;
          const durationMs = isYearly ? 365 * 86400 * 1000 : 30 * 86400 * 1000;
          if (matchedUserId) {
            if (this.supabase.isAvailable()) {
              await this.supabase.upsertSubscription(matchedUserId, targetTier, 'ACTIVE', Date.now() + durationMs);
            }
            this.userSubscriptions.set(matchedUserId, {
              tier: targetTier,
              status: 'ACTIVE',
              expiresAt: Date.now() + durationMs,
            });
          }
        }
      }

      if (!matchedUserId) {
        const parsed = this.sepayProvider.parsePaymentContent(content);
        matchedUserId = parsed.userId || null;
        if (matchedUserId) {
          const isYearly = body.transferAmount >= 490000;
          const durationMs = isYearly ? 365 * 86400 * 1000 : 30 * 86400 * 1000;
          targetTier = parsed.tier || (body.transferAmount >= 99000 && /family/i.test(content) ? 'FAMILY' : 'PRO');
          if (this.supabase.isAvailable()) {
            await this.supabase.upsertSubscription(matchedUserId, targetTier, 'ACTIVE', Date.now() + durationMs);
          }
          this.userSubscriptions.set(matchedUserId, {
            tier: targetTier,
            status: 'ACTIVE',
            expiresAt: Date.now() + durationMs,
          });
        }
      }

      if (matchedUserId) {
        const u = this.users.get(matchedUserId) || (this.supabase.isAvailable() ? await this.supabase.findUserById(matchedUserId) : null);
        if (u?.email) {
          EmailService.sendPaymentSuccessEmail({
            toEmail: u.email,
            userName: u.name,
            orderCode: extractedOrderCode || `EP${Date.now()}`,
            tier: targetTier,
            amount: body.transferAmount,
            expiresAt: Date.now() + 30 * 86400 * 1000,
          }).catch(() => {});
        }
      }

      this.sendJson(res, 200, { success: true, processed: true, userId: matchedUserId });
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
      let user = this.users.get(authResult.userId);
      if (!user && this.supabase.isAvailable()) {
        const dbUser = await this.supabase.findUserById(authResult.userId);
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role as any,
            passwordHash: dbUser.password_hash,
            salt: dbUser.salt,
            createdAt: dbUser.created_at || new Date().toISOString(),
            updatedAt: dbUser.updated_at || new Date().toISOString(),
          };
          this.users.set(user.id, user);
        }
      }

      if (!user) {
        this.sendJson(res, 404, { error: 'User not found' });
        return;
      }
      const { passwordHash, salt, ...safeUser } = user;
      this.sendJson(res, 200, { user: safeUser });
      return;
    }

    // 4a. GET /api/v1/devices
    if (pathname === '/api/v1/devices' && method === 'GET') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      let userDevices = Array.from(this.devices.values()).filter(
        (d) => d.userId === authResult.userId
      );
      if (userDevices.length === 0 && this.supabase.isAvailable()) {
        const dbDevices = await this.supabase.getDevicesByUserId(authResult.userId);
        userDevices = dbDevices.map((d) => ({
          id: d.id,
          userId: d.user_id,
          deviceFingerprint: d.device_fingerprint,
          deviceName: d.device_name,
          os: d.os,
          appVersion: d.app_version,
          status: d.status as any,
          isBlocked: d.is_blocked,
          lastActiveAt: d.last_active_at || new Date().toISOString(),
          createdAt: d.created_at || new Date().toISOString(),
        }));
      }
      this.sendJson(res, 200, { devices: userDevices });
      return;
    }

    // 4b. POST /api/v1/devices/telemetry
    if ((pathname === '/api/v1/devices/telemetry' || pathname === '/api/v1/devices/heartbeat') && method === 'POST') {
      const body = await this.parseBody(req);
      const fingerprint = body.deviceFingerprint || body.fingerprint || 'win_anon_pc';
      const deviceName = body.deviceName || body.name || 'Desktop PC';
      const deviceOs = body.os || 'Windows 11';
      const appVersion = body.appVersion || '1.0.0';
      const isUuid = Boolean(
        body.userId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.userId)
      );
      const userId = isUuid ? body.userId : null;

      if (this.supabase.isAvailable()) {
        await this.supabase.upsertDevice({
          user_id: userId,
          device_fingerprint: fingerprint,
          device_name: deviceName,
          os: deviceOs,
          app_version: appVersion,
          status: 'ACTIVE',
          is_blocked: false,
        });
      }

      this.sendJson(res, 200, { success: true, status: 'ACTIVE', isBlocked: false });
      return;
    }

    // 4c. POST /api/v1/devices (Register machine with seat limit validation)
    if (pathname === '/api/v1/devices' && method === 'POST') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      const body = await this.parseBody(req);
      const fingerprint = body.deviceFingerprint || body.fingerprint || crypto.randomUUID();

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

      let sub = this.userSubscriptions.get(authResult.userId);
      if (!sub && this.supabase.isAvailable()) {
        const dbSub = await this.supabase.getSubscription(authResult.userId);
        if (dbSub) {
          sub = { tier: dbSub.tier, status: dbSub.status, expiresAt: Number(dbSub.expires_at) };
          this.userSubscriptions.set(authResult.userId, sub);
        }
      }
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
      if (this.supabase.isAvailable()) {
        await this.supabase.upsertDevice({
          id,
          user_id: authResult.userId,
          device_fingerprint: fingerprint,
          device_name: device.deviceName,
          os: device.os,
          app_version: device.appVersion,
          status: 'ACTIVE',
          is_blocked: false,
        });
      }
      this.sendJson(res, 201, { device });
      return;
    }

    // 4d. DELETE /api/v1/devices
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
        if (this.supabase.isAvailable()) {
          await this.supabase.deleteDevice(targetId, authResult.userId);
        }
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
      let sub = this.userSubscriptions.get(authResult.userId);
      if (this.supabase.isAvailable()) {
        const dbSub = await this.supabase.getSubscription(authResult.userId);
        if (dbSub) {
          const loadedSub = {
            tier: dbSub.tier,
            status: dbSub.status,
            expiresAt: Number(dbSub.expires_at),
          };
          sub = loadedSub;
          this.userSubscriptions.set(authResult.userId, loadedSub);
        }
      }

      const activeSub = sub ?? {
        tier: 'FREE' as const,
        status: 'ACTIVE' as const,
        expiresAt: Date.now() + 365 * 24 * 3600 * 1000,
      };
      this.sendJson(res, 200, { subscription: activeSub });
      return;
    }

    // 6. POST /api/v1/subscription/checkout
    if (pathname === '/api/v1/subscription/checkout' && method === 'POST') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      const body = await this.parseBody(req);
      const tier = (body.tier || 'PRO') as 'PRO' | 'FAMILY';
      const interval = (body.interval || 'month') as 'month' | 'year' | 'lifetime';
      const amount = body.amount || (SePayBillingProvider.PRICES_VND[tier]?.[interval] ?? 19000);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const orderCode = `EP${Date.now().toString().slice(-6)}${randomSuffix}`;
      const transferContent = `EYEPOSTURE ${authResult.userId} ${orderCode}`;

      const orderRecord = { order_code: orderCode, user_id: authResult.userId, tier, interval, amount, status: 'PENDING' as const };
      this.orders.set(orderCode, orderRecord);
      if (this.supabase.isAvailable()) {
        await this.supabase.createOrder(orderRecord);
      }

      const qrUrl = this.sepayProvider.generateVietQrUrl({
        amount,
        content: transferContent,
      });

      this.sendJson(res, 200, {
        provider: 'sepay',
        orderCode,
        qrUrl,
        checkoutUrl: qrUrl,
        sessionId: orderCode,
        amount,
        transferContent,
        accountNumber: process.env.PAYMENT_BANK_ACCOUNT || '4661398013',
        bankName: process.env.PAYMENT_BANK_CODE || 'BIDV',
        accountHolder: process.env.PAYMENT_BANK_ACCOUNT_NAME || 'NGUYEN DUY HUNG',
      });
      return;
    }

    // 7. GET /api/v1/entitlements
    if (pathname === '/api/v1/entitlements' && method === 'GET') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }

      let sub = this.userSubscriptions.get(authResult.userId);
      if (this.supabase.isAvailable()) {
        const dbSub = await this.supabase.getSubscription(authResult.userId);
        if (dbSub) {
          sub = {
            tier: dbSub.tier,
            status: dbSub.status,
            expiresAt: Number(dbSub.expires_at),
          };
        }
      }

      const currentSub = sub ?? {
        tier: 'FREE' as const,
        status: 'ACTIVE' as const,
        expiresAt: Date.now() + 365 * 24 * 3600 * 1000,
      };

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
      const payload: EntitlementPayload = {
        sub: authResult.userId,
        tier: currentSub.tier,
        features: currentSub.tier === 'FREE' ? ['basic_reminders'] : PRO_FEATURES,
        issuedAt: Date.now(),
        expiresAt: currentSub.expiresAt,
        deviceLimit: currentSub.tier === 'FAMILY' ? 5 : 3,
        deviceId,
      };

      const signedToken = this.entitlementSigner.sign(payload);
      this.sendJson(res, 200, { entitlementToken: signedToken, payload });
      return;
    }

    // 8b. POST /api/v1/webhooks/stripe (Stripe Webhook Fallback)
    if (pathname === '/api/v1/webhooks/stripe' && method === 'POST') {
      const body = await this.parseBody(req);
      const eventId = body.id || crypto.randomUUID();

      if (this.processedWebhookEvents.has(eventId)) {
        this.sendJson(res, 200, { received: true, idempotent: true });
        return;
      }
      this.processedWebhookEvents.add(eventId);

      const { userId, tier, status, currentPeriodEnd } = body.data || {};
      if (userId) {
        const duration = currentPeriodEnd || Date.now() + 30 * 86400 * 1000;
        const subTier = (tier as SubscriptionTier) || 'PRO';
        const subStatus = (status as SubscriptionStatus) || 'ACTIVE';
        this.userSubscriptions.set(userId, {
          tier: subTier,
          status: subStatus,
          expiresAt: duration,
        });
        if (this.supabase.isAvailable()) {
          await this.supabase.upsertSubscription(userId, subTier, subStatus, duration);
        }
      }

      this.sendJson(res, 200, { received: true, processed: true });
      return;
    }

    // Delegate Admin Routes to modular handler
    const adminHandled = await handleAdminRoutes(req, res, pathname, method, {
      users: this.users,
      devices: this.devices,
      userSubscriptions: this.userSubscriptions,
      supabase: this.supabase,
      savePersistedDevices: () => this.savePersistedDevices(),
      sendJson: (sRes, code, data) => this.sendJson(sRes, code, data),
      parseBody: (sReq) => this.parseBody(sReq),
    });

    if (adminHandled) return;

    // Delegate Password Reset & Forgot Password Routes
    const resetHandled = await handlePasswordResetRoutes(req, res, pathname, method, {
      users: this.users,
      userSubscriptions: this.userSubscriptions,
      supabase: this.supabase,
      sendJson: (sRes, code, data) => this.sendJson(sRes, code, data),
      parseBody: (sReq) => this.parseBody(sReq),
      hashPassword: (p, s) => this.hashPassword(p, s),
    });
    if (resetHandled) return;

    // Delegate Voucher Routes
    const voucherHandled = await handleVoucherRoutes(req, res, pathname, method, {
      sendJson: (sRes, code, data) => this.sendJson(sRes, code, data),
      parseBody: (sReq) => this.parseBody(sReq),
    });
    if (voucherHandled) return;

    this.sendJson(res, 404, { error: 'Endpoint not found' });
  }

  public async listen(port: number = 0): Promise<number> {
    if (this.supabase.isAvailable()) {
      await this.syncFromSupabase().catch(() => {});
    }
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
