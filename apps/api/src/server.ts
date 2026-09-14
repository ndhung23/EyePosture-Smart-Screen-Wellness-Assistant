import * as http from 'http';
import * as crypto from 'crypto';
import {
  User,
  Device,
  SubscriptionTier,
  SubscriptionStatus,
  EntitlementPayload,
} from '@eyeposture/shared-types';
import { EntitlementSigner, PRO_FEATURES, MockBillingProvider } from '@eyeposture/billing';

export interface ApiServerConfig {
  port?: number;
  jwtSecret?: string;
  entitlementSecret?: string;
}

export class EyePostureApiServer {
  private server: http.Server | null = null;
  private jwtSecret: string;
  private entitlementSigner: EntitlementSigner;
  private billingProvider = new MockBillingProvider();

  // In-memory data store for the modular monolith service
  private users: Map<string, User & { passwordHash: string; salt: string }> = new Map();
  private devices: Map<string, Device> = new Map();
  private userSubscriptions: Map<
    string,
    { tier: SubscriptionTier; status: SubscriptionStatus; expiresAt: number }
  > = new Map();
  private processedWebhookEvents: Set<string> = new Set(); // Idempotency

  constructor(config: ApiServerConfig = {}) {
    this.jwtSecret = config.jwtSecret ?? process.env.JWT_SECRET ?? 'default_jwt_secret_eyeposture';
    const entitlementSecret =
      config.entitlementSecret ??
      process.env.ENTITLEMENT_SECRET ??
      'default_entitlement_secret_eyeposture';
    this.entitlementSigner = new EntitlementSigner(entitlementSecret);
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
    const pathname = url.pathname;
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

    // 4. POST /api/v1/devices
    if (pathname === '/api/v1/devices' && method === 'POST') {
      if (!authResult.valid || !authResult.userId) {
        this.sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      const body = await this.parseBody(req);
      const id = crypto.randomUUID();
      const device: Device = {
        id,
        userId: authResult.userId,
        deviceFingerprint: body.deviceFingerprint || crypto.randomUUID(),
        deviceName: body.deviceName || 'Windows PC',
        os: body.os || 'Windows 11',
        appVersion: body.appVersion || '1.0.0',
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      this.devices.set(id, device);
      this.sendJson(res, 201, { device });
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
      const deviceId = url.searchParams.get('deviceId') || 'default_device';
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

    // 8. POST /api/v1/webhooks/stripe
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
