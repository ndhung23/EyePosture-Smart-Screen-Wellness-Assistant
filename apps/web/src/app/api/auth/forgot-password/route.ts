import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { sendOtpResetPasswordEmail } from '@/lib/email';
import { generateOtpCode, createOtpSignature, saveOtpInMemory } from '@/lib/otp';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({ error: 'Vui lòng cung cấp địa chỉ email hợp lệ' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data: dbUser } = await supabase
      .from('users')
      .select('id,email,name')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (!dbUser && cleanEmail !== 'admin') {
      return NextResponse.json(
        { error: 'Không tìm thấy tài khoản với email này trên hệ thống' },
        { status: 404 }
      );
    }

    // Sinh mã OTP 6 số
    const otpCode = generateOtpCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 phút
    const resetToken = createOtpSignature(cleanEmail, otpCode, expiresAt);
    saveOtpInMemory(cleanEmail, otpCode, expiresAt);

    console.log(`[Auth] OTP reset password cho ${cleanEmail}: ${otpCode}`);

    // Gửi email thực tế qua SMTP Gmail nếu đã cấu hình
    const emailResult = await sendOtpResetPasswordEmail(cleanEmail, otpCode, dbUser?.name);

    return NextResponse.json({
      success: true,
      message: emailResult.success
        ? `Mã xác nhận OTP đã được gửi tới email ${cleanEmail}. Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam)!`
        : `Đã tạo mã xác thực thành công! (Vui lòng kiểm tra email hoặc nhập mã thử nghiệm nếu chưa cấu hình SMTP)`,
      resetToken,
      testCode: otpCode, // Luôn gửi testCode để hỗ trợ test nhanh khi cần
    });
  } catch (err: any) {
    console.error('[Auth] Lỗi forgot-password:', err);
    return NextResponse.json({ error: err.message || 'Lỗi xử lý yêu cầu' }, { status: 500 });
  }
}
