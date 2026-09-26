import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 4 ký tự' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const reservedAdminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (reservedAdminEmails.includes(cleanEmail)) {
      return NextResponse.json({ error: 'Email này đã được bảo lưu' }, { status: 409 });
    }

    const supabase = getAdminSupabase();

    // Check existing
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Email này đã được đăng ký trên hệ thống' }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const now = new Date().toISOString();

    const { error: insertErr } = await supabase.from('users').insert({
      id,
      email: cleanEmail,
      name: name.trim(),
      password_hash: passwordHash,
      salt,
      role: 'USER',
      is_blocked: false,
      created_at: now,
      updated_at: now,
    });

    if (insertErr) throw insertErr;

    // Create free subscription
    await supabase.from('subscriptions').insert({
      user_id: id,
      tier: 'FREE',
      status: 'ACTIVE',
      expires_at: Date.now() + 365 * 86400 * 1000,
      created_at: now,
      updated_at: now,
    });

    const user = {
      id,
      email: cleanEmail,
      name: name.trim(),
      role: 'USER' as const,
      isBlocked: false,
      status: 'ACTIVE' as const,
      subscription: {
        tier: 'FREE' as const,
        status: 'ACTIVE' as const,
        expiresAt: Date.now() + 365 * 86400 * 1000,
      },
    };

    const token = `token_${id}_${Date.now()}`;
    return NextResponse.json({ user, token, message: 'Đăng ký thành công!' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
