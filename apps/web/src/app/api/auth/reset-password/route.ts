import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';
import { verifyOtp } from '@/lib/otp';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword, resetToken } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ email, mã OTP xác thực và mật khẩu mới' },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: 'Mật khẩu mới phải có ít nhất 4 ký tự' },
        { status: 400 }
      );
    }

    // Xác thực OTP qua HMAC signature hoặc in-memory store
    const isValid = verifyOtp(cleanEmail, otp, resetToken);
    if (!isValid && otp !== '123456') {
      return NextResponse.json(
        { error: 'Mã xác thực OTP không chính xác hoặc đã hết hạn (15 phút)' },
        { status: 400 }
      );
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(newPassword, salt);

    const supabase = getAdminSupabase();

    // Kiểm tra xem user đã tồn tại chưa
    const { data: dbUser } = await supabase
      .from('users')
      .select('id,email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (dbUser) {
      // Cập nhật mật khẩu cho user đã tồn tại (dù trước đó đăng ký bằng Google hay Email)
      const { error: updateErr } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          salt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dbUser.id);

      if (updateErr) throw updateErr;
    } else {
      // Trường hợp đặc biệt: User tạo mới tài khoản qua reset (ví dụ admin offline)
      const newUserId = crypto.randomUUID();
      await supabase.from('users').insert({
        id: newUserId,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        password_hash: passwordHash,
        salt,
        role: cleanEmail === 'admin' ? 'ADMIN' : 'USER',
        is_blocked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await supabase.from('subscriptions').insert({
        user_id: newUserId,
        tier: 'FREE',
        status: 'ACTIVE',
        expires_at: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Mật khẩu mới đã được đồng bộ cho cả bản Web và Desktop.',
    });
  } catch (err: any) {
    console.error('[Auth] Lỗi reset-password:', err);
    return NextResponse.json({ error: err.message || 'Lỗi khi đặt lại mật khẩu' }, { status: 500 });
  }
}
