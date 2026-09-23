import http from 'http';
import crypto from 'crypto';
import { EmailService } from '../services/email-service.js';
import { User } from '@eyeposture/shared-types';
import { savePersistedUsers } from '../admin/admin-seed.js';
import { SupabaseService } from '../supabase-client.js';

export interface PasswordResetContext {
  users: Map<string, User & { passwordHash: string; salt: string }>;
  userSubscriptions: Map<string, any>;
  supabase: SupabaseService;
  sendJson: (res: http.ServerResponse, statusCode: number, data: any) => void;
  parseBody: (req: http.IncomingMessage) => Promise<any>;
  hashPassword: (password: string, salt: string) => string;
}

export async function handlePasswordResetRoutes(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string | undefined,
  ctx: PasswordResetContext
): Promise<boolean> {
  // 1. POST /api/v1/auth/forgot-password
  if (pathname === '/api/v1/auth/forgot-password' && method === 'POST') {
    const body = await ctx.parseBody(req);
    const email = (body.email || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      ctx.sendJson(res, 400, { error: 'Email không hợp lệ' });
      return true;
    }

    const code = EmailService.generateCode();
    const result = await EmailService.sendPasswordResetEmail(email, code);

    ctx.sendJson(res, 200, {
      success: true,
      message: result.message || 'Mã xác thực đã được gửi đến email của bạn.',
      simulated: result.simulated,
      // Include code in simulated/testing mode so developers can test without real SMTP
      testCode: result.simulated ? code : undefined,
    });
    return true;
  }

  // 2. POST /api/v1/auth/reset-password
  if (pathname === '/api/v1/auth/reset-password' && method === 'POST') {
    const body = await ctx.parseBody(req);
    const { email, code, newPassword } = body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !code || !newPassword) {
      ctx.sendJson(res, 400, { error: 'Vui lòng cung cấp đầy đủ email, mã xác thực và mật khẩu mới' });
      return true;
    }

    if (newPassword.length < 4) {
      ctx.sendJson(res, 400, { error: 'Mật khẩu mới phải có ít nhất 4 ký tự' });
      return true;
    }

    const isValid = EmailService.verifyResetCode(cleanEmail, code);
    if (!isValid) {
      ctx.sendJson(res, 400, { error: 'Mã xác thực không chính xác hoặc đã hết hạn' });
      return true;
    }

    // Find and update user in users map
    let targetUser: (User & { passwordHash: string; salt: string }) | undefined;
    for (const u of ctx.users.values()) {
      if (u.email?.toLowerCase() === cleanEmail) {
        targetUser = u;
        break;
      }
    }

    if (targetUser) {
      const salt = targetUser.salt || crypto.randomBytes(16).toString('hex');
      const passwordHash = ctx.hashPassword(newPassword, salt);
      targetUser.passwordHash = passwordHash;
      targetUser.salt = salt;
      targetUser.updatedAt = new Date().toISOString();

      if (ctx.supabase.isAvailable()) {
        await ctx.supabase.updateUserPassword(targetUser.id, passwordHash, salt);
      }
      savePersistedUsers(ctx.users, ctx.userSubscriptions);
    }

    ctx.sendJson(res, 200, {
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.',
    });
    return true;
  }

  return false;
}
