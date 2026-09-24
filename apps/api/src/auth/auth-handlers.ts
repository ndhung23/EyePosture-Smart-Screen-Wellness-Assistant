import * as http from 'http';
import * as crypto from 'crypto';
import { User, SubscriptionTier, SubscriptionStatus } from '@eyeposture/shared-types';
import { isAdminIdentifier, ADMIN_USER_ID, seedAdminAccount, savePersistedUsers } from '../admin/admin-seed.js';
import { SupabaseService } from '../supabase-client.js';

export interface AuthContext {
  users: Map<string, User & { passwordHash: string; salt: string }>;
  userSubscriptions: Map<string, { tier: SubscriptionTier; status: SubscriptionStatus; expiresAt: number }>;
  supabase: SupabaseService;
  sendJson: (res: http.ServerResponse, statusCode: number, data: unknown) => void;
  parseBody: (req: http.IncomingMessage) => Promise<any>;
  hashPassword: (password: string, salt: string) => string;
  createJwt: (payload: { userId: string; email: string }) => string;
}

export async function handleAuthRoutes(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string | undefined,
  ctx: AuthContext
): Promise<boolean> {
  const { users, userSubscriptions, supabase, sendJson, parseBody, hashPassword, createJwt } = ctx;

  // 1. POST /api/v1/auth/register
  if (pathname === '/api/v1/auth/register' && method === 'POST') {
    const body = await parseBody(req);
    const { email, password, name } = body;
    if (!email || !password || !name) {
      sendJson(res, 400, { error: 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên' });
      return true;
    }

    if (password.length < 4) {
      sendJson(res, 400, { error: 'Mật khẩu phải có ít nhất 4 ký tự' });
      return true;
    }

    if (isAdminIdentifier(email)) {
      sendJson(res, 409, { error: 'Tên người dùng admin đã được bảo lưu' });
      return true;
    }

    // Check duplicate in memory
    const cleanEmail = email.trim().toLowerCase();
    for (const u of users.values()) {
      if (u.email?.toLowerCase() === cleanEmail) {
        sendJson(res, 409, { error: 'Email này đã được đăng ký trên hệ thống' });
        return true;
      }
    }

    // Check existing in Supabase
    if (supabase.isAvailable()) {
      const existing = await supabase.findUserByEmail(email);
      if (existing) {
        sendJson(res, 409, { error: 'Email already registered' });
        return true;
      }
    }

    const id = crypto.randomUUID();
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const now = new Date().toISOString();

    if (supabase.isAvailable()) {
      await supabase.createUser({
        id,
        email,
        name,
        password_hash: passwordHash,
        salt,
        role: 'USER',
        is_blocked: false,
      });
      await supabase.upsertSubscription(id, 'FREE', 'ACTIVE', Date.now() + 365 * 24 * 3600 * 1000);
    }

    const user: User = { id, email, name, role: 'USER', createdAt: now, updatedAt: now };
    users.set(id, { ...user, passwordHash, salt });
    userSubscriptions.set(id, {
      tier: 'FREE',
      status: 'ACTIVE',
      expiresAt: Date.now() + 365 * 24 * 3600 * 1000,
    });

    const token = createJwt({ userId: id, email });
    savePersistedUsers(users, userSubscriptions);
    sendJson(res, 201, { user, token, message: 'Đăng ký tài khoản thành công!' });
    return true;
  }

  // 2. POST /api/v1/auth/login
  if (pathname === '/api/v1/auth/login' && method === 'POST') {
    const body = await parseBody(req);
    const { email, password } = body;

    let matchedUser: (User & { passwordHash: string; salt: string }) | undefined;
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isAdminIdentifier(cleanEmail)) {
      matchedUser = users.get(ADMIN_USER_ID);
      if (!matchedUser) {
        seedAdminAccount(users, userSubscriptions, supabase);
        matchedUser = users.get(ADMIN_USER_ID);
      }
    } else {
      for (const u of users.values()) {
        if (u.email?.toLowerCase() === cleanEmail) {
          matchedUser = u;
          break;
        }
      }
    }

    // Fallback query Supabase if not in memory
    if (!matchedUser && supabase.isAvailable()) {
      const dbUser = await supabase.findUserByEmail(email || '');
      if (dbUser) {
        matchedUser = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role as any,
          passwordHash: dbUser.password_hash,
          salt: dbUser.salt,
          isBlocked: dbUser.is_blocked,
          createdAt: dbUser.created_at || new Date().toISOString(),
          updatedAt: dbUser.updated_at || new Date().toISOString(),
        };
        users.set(matchedUser.id, matchedUser);
      }
    }

    if (!matchedUser) {
      sendJson(res, 401, { error: 'Tài khoản hoặc mật khẩu không chính xác' });
      return true;
    }

    const hash = hashPassword(password, matchedUser.salt);
    if (hash !== matchedUser.passwordHash) {
      sendJson(res, 401, { error: 'Tài khoản hoặc mật khẩu không chính xác' });
      return true;
    }

    if (matchedUser.isBlocked) {
      sendJson(res, 403, { error: 'Tài khoản đã bị quản trị viên tạm khóa' });
      return true;
    }

    const token = createJwt({ userId: matchedUser.id, email: matchedUser.email });
    const { passwordHash: _ph, salt: _s, ...safeUser } = matchedUser;
    sendJson(res, 200, { user: safeUser, token });
    return true;
  }

  return false;
}
