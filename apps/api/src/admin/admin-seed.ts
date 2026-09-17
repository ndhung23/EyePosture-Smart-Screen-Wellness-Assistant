import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { User, SubscriptionTier, SubscriptionStatus } from '@eyeposture/shared-types';
import { SupabaseService } from '../supabase-client.js';

export const ADMIN_USER_ID = '00000000-0000-4000-8000-000000000001';
export const ADMIN_SALT = 'eyeposture_admin_salt_2026';
export const ADMIN_NAME = 'Quản Trị Viên (Admin)';
export const ADMIN_ROLE = 'ADMIN' as const;

export function hashAdminPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function getAdminUserData(): User & { passwordHash: string; salt: string } {
  const passwordHash = hashAdminPassword('1', ADMIN_SALT);
  const now = '2026-01-01T00:00:00.000Z';

  return {
    id: ADMIN_USER_ID,
    email: 'admin',
    name: ADMIN_NAME,
    role: ADMIN_ROLE,
    status: 'ACTIVE',
    isBlocked: false,
    createdAt: now,
    updatedAt: now,
    passwordHash,
    salt: ADMIN_SALT,
  };
}

export function isAdminIdentifier(email: string): boolean {
  const clean = (email || '').trim().toLowerCase();
  return (
    clean === 'admin' ||
    clean === 'admin@eyeposture.com' ||
    clean === 'admin@gmail.com' ||
    clean === 'administrator'
  );
}

export function seedAdminAccount(
  users: Map<string, User & { passwordHash: string; salt: string }>,
  userSubscriptions: Map<string, { tier: SubscriptionTier; status: SubscriptionStatus; expiresAt: number }>,
  supabase?: SupabaseService
): void {
  const adminUser = getAdminUserData();
  users.set(ADMIN_USER_ID, adminUser);

  userSubscriptions.set(ADMIN_USER_ID, {
    tier: 'FAMILY',
    status: 'ACTIVE',
    expiresAt: Date.now() + 10 * 365 * 24 * 3600 * 1000,
  });

  if (supabase && supabase.isAvailable()) {
    supabase.findUserById(ADMIN_USER_ID).then((existing) => {
      if (!existing) {
        return supabase.createUser({
          id: ADMIN_USER_ID,
          email: 'admin',
          name: ADMIN_NAME,
          password_hash: adminUser.passwordHash,
          salt: ADMIN_SALT,
          role: 'ADMIN',
          is_blocked: false,
        });
      }
    }).catch(() => {});

    supabase.upsertSubscription(
      ADMIN_USER_ID,
      'FAMILY',
      'ACTIVE',
      Date.now() + 10 * 365 * 24 * 3600 * 1000
    ).catch(() => {});
  }
}

export function loadPersistedUsers(
  users: Map<string, User & { passwordHash: string; salt: string }>,
  userSubscriptions: Map<string, { tier: SubscriptionTier; status: SubscriptionStatus; expiresAt: number }>
): void {
  try {
    const candidates = [
      path.join(process.cwd(), 'data/users.json'),
      '/tmp/eyeposture_users.json',
      path.join(os.tmpdir(), 'eyeposture_users.json'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const list = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (Array.isArray(list)) {
          for (const u of list) {
            if (u && u.id) {
              users.set(u.id, u);
              if (u.subscription) {
                userSubscriptions.set(u.id, u.subscription);
              }
            }
          }
        }
        break;
      }
    }
  } catch {
    // Ignore error
  }
}

export function savePersistedUsers(
  users: Map<string, User & { passwordHash: string; salt: string }>,
  userSubscriptions: Map<string, { tier: SubscriptionTier; status: SubscriptionStatus; expiresAt: number }>
): void {
  try {
    const list = Array.from(users.values()).map((u) => ({
      ...u,
      subscription: userSubscriptions.get(u.id) || { tier: 'FREE', status: 'ACTIVE', expiresAt: null },
    }));
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {
        // ignore
      }
    }
    const target = fs.existsSync(dir)
      ? path.join(dir, 'users.json')
      : process.env.VERCEL
      ? '/tmp/eyeposture_users.json'
      : path.join(os.tmpdir(), 'eyeposture_users.json');

    fs.writeFileSync(target, JSON.stringify(list, null, 2), 'utf8');
  } catch {
    // Ignore error
  }
}
