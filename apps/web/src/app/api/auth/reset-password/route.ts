import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const OTP_FILE = path.join(process.cwd(), 'data', 'otp_codes.json');

function verifyAndConsumeOtp(email: string, code: string): boolean {
  try {
    if (!fs.existsSync(OTP_FILE)) return false;
    const map = JSON.parse(fs.readFileSync(OTP_FILE, 'utf8'));
    const entry = map[email.trim().toLowerCase()];
    if (!entry) return false;
    if (entry.expiresAt < Date.now()) return false;
    if (entry.code !== code.trim()) return false;

    delete map[email.trim().toLowerCase()];
    fs.writeFileSync(OTP_FILE, JSON.stringify(map, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !otp || !newPassword) {
      return NextResponse.json({ error: 'Vui lòng cung cấp đầy đủ email, mã OTP và mật khẩu mới' }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 4 ký tự' }, { status: 400 });
    }

    const isValid = verifyAndConsumeOtp(cleanEmail, otp);
    if (!isValid) {
      return NextResponse.json({ error: 'Mã OTP không chính xác hoặc đã hết hạn' }, { status: 400 });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(newPassword, salt);

    const supabase = getAdminSupabase();
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        salt,
        updated_at: new Date().toISOString(),
      })
      .ilike('email', cleanEmail);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
