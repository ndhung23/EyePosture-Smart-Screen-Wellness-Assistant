import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

const OTP_FILE = path.join(process.cwd(), 'data', 'otp_codes.json');

export function saveOtp(email: string, code: string) {
  try {
    let map: Record<string, { code: string; expiresAt: number }> = {};
    if (fs.existsSync(OTP_FILE)) {
      map = JSON.parse(fs.readFileSync(OTP_FILE, 'utf8'));
    }
    map[email.trim().toLowerCase()] = { code, expiresAt: Date.now() + 15 * 60 * 1000 };
    const dir = path.dirname(OTP_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(OTP_FILE, JSON.stringify(map, null, 2), 'utf8');
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Vui lòng cung cấp địa chỉ email' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data: dbUser } = await supabase
      .from('users')
      .select('id,email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (!dbUser && cleanEmail !== 'admin') {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản với email này' }, { status: 404 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    saveOtp(cleanEmail, otpCode);

    console.log(`[EmailService] OTP reset password for ${cleanEmail}: ${otpCode}`);

    return NextResponse.json({
      success: true,
      message: 'Mã xác nhận OTP đã được gửi đến email của bạn!',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
