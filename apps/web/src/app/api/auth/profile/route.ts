import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function getUserIdFromToken(token: string): string | null {
  if (token.startsWith('token_')) {
    const parts = token.split('_');
    return parts[1] || null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const supabase = getAdminSupabase();
    const [userRes, subRes] = await Promise.all([
      supabase.from('users').select('id, email, name, role, is_blocked, created_at').eq('id', userId).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    if (userRes.error || !userRes.data) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });
    }

    const dbUser = userRes.data;
    const sub = subRes.data;

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role || 'USER',
        status: dbUser.is_blocked ? 'BLOCKED' : 'ACTIVE',
        isBlocked: Boolean(dbUser.is_blocked),
        createdAt: dbUser.created_at,
        subscription: sub
          ? { tier: sub.tier, status: sub.status, expiresAt: Number(sub.expires_at) }
          : { tier: 'FREE', status: 'ACTIVE', expiresAt: null },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    const supabase = getAdminSupabase();
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !dbUser) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name && typeof name === 'string' && name.trim()) {
      updates.name = name.trim();
    }

    // Change password logic
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu' }, { status: 400 });
      }
      if (newPassword.length < 4) {
        return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 4 ký tự' }, { status: 400 });
      }

      const currentHash = hashPassword(currentPassword, dbUser.salt || '');
      if (currentHash !== dbUser.password_hash) {
        return NextResponse.json({ error: 'Mật khẩu hiện tại không chính xác' }, { status: 400 });
      }

      const newSalt = crypto.randomBytes(16).toString('hex');
      updates.password_hash = hashPassword(newPassword, newSalt);
      updates.salt = newSalt;
    }

    const { error: updateErr } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (updateErr) throw updateErr;

    // Fetch subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const safeUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: updates.name || dbUser.name,
      role: dbUser.role || 'USER',
      status: dbUser.is_blocked ? 'BLOCKED' : 'ACTIVE',
      isBlocked: Boolean(dbUser.is_blocked),
      subscription: sub
        ? { tier: sub.tier, status: sub.status, expiresAt: Number(sub.expires_at) }
        : { tier: 'FREE', status: 'ACTIVE', expiresAt: null },
    };

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: safeUser,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
