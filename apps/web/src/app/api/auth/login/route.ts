import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    const supabase = getAdminSupabase();
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (error || !dbUser) {
      return NextResponse.json({ error: 'Tài khoản hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    if (dbUser.is_blocked) {
      return NextResponse.json({ error: 'Tài khoản đã bị quản trị viên khóa' }, { status: 403 });
    }

    const hash = hashPassword(password, dbUser.salt || '');
    if (hash !== dbUser.password_hash) {
      return NextResponse.json({ error: 'Tài khoản hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    // Fetch subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', dbUser.id)
      .maybeSingle();

    const safeUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role || 'USER',
      status: dbUser.is_blocked ? 'BLOCKED' : 'ACTIVE',
      isBlocked: Boolean(dbUser.is_blocked),
      subscription: sub
        ? { tier: sub.tier, status: sub.status, expiresAt: Number(sub.expires_at) }
        : { tier: 'FREE', status: 'ACTIVE', expiresAt: null },
    };

    const token = `token_${dbUser.id}_${Date.now()}`;
    return NextResponse.json({ user: safeUser, token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
