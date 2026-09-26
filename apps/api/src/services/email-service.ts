import nodemailer from 'nodemailer';

export interface ResetCodeEntry {
  code: string;
  expiresAt: number;
}

export class EmailService {
  private static resetCodes = new Map<string, ResetCodeEntry>();

  public static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public static storeResetCode(email: string, code: string, ttlMs: number = 15 * 60 * 1000): void {
    const cleanEmail = email.trim().toLowerCase();
    EmailService.resetCodes.set(cleanEmail, {
      code,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public static verifyResetCode(email: string, code: string): boolean {
    const cleanEmail = email.trim().toLowerCase();
    const entry = EmailService.resetCodes.get(cleanEmail);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      EmailService.resetCodes.delete(cleanEmail);
      return false;
    }
    const isValid = entry.code === code.trim();
    if (isValid) {
      EmailService.resetCodes.delete(cleanEmail);
    }
    return isValid;
  }

  public static async sendPasswordResetEmail(
    toEmail: string,
    code: string
  ): Promise<{ success: boolean; simulated?: boolean; message?: string; error?: string }> {
    const cleanEmail = toEmail.trim().toLowerCase();
    EmailService.storeResetCode(cleanEmail, code);

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';
    const smtpFrom = process.env.SMTP_FROM || `"EyePosture Assistant" <${smtpUser || 'support@eyeposture.com'}>`;

    const isSimulated =
      !smtpUser ||
      !smtpPass ||
      smtpPass === 'your_app_password_here' ||
      smtpUser === 'your_email@gmail.com';

    if (isSimulated) {
      console.log(`[EmailService] SIMULATED EMAIL to ${cleanEmail}: Mã xác thực đặt lại mật khẩu là [${code}] (Hiệu lực trong 15 phút)`);
      return {
        success: true,
        simulated: true,
        message: `Mã xác thực đã được tạo: ${code}. Vui lòng nhập mã này để đặt lại mật khẩu.`,
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: #0f172a; padding: 28px 24px; text-align: center;">
            <h1 style="color: #2dd4bf; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">EyePosture Assistant</h1>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Trợ lý Sức khỏe Màn hình & Thị lực Thông minh</p>
          </div>
          <div style="padding: 32px 28px;">
            <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Yêu cầu đặt lại mật khẩu</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Xin chào,<br>
              Chúng tôi nhận được yêu cầu khôi phục / đặt lại mật khẩu cho tài khoản ứng dụng EyePosture liên kết với email này.
            </p>
            <div style="margin: 28px 0; text-align: center;">
              <span style="display: inline-block; background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 14px 28px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f766e; font-family: monospace;">
                ${code}
              </span>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
              Mã xác thực này có hiệu lực trong vòng <strong>15 phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể yên tâm bỏ qua email này.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 11px;">
            © ${new Date().getFullYear()} EyePosture Inc. Tất cả quyền được bảo lưu.
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: smtpFrom,
        to: cleanEmail,
        subject: `[EyePosture] Mã xác nhận đặt lại mật khẩu: ${code}`,
        text: `Mã xác nhận đặt lại mật khẩu EyePosture của bạn là: ${code}. Mã có hiệu lực trong 15 phút.`,
        html: htmlContent,
      });

      console.log(`[EmailService] Email sent successfully to ${cleanEmail}`);
      return { success: true, message: 'Mã xác thực đã được gửi đến email của bạn.' };
    } catch (err: any) {
      console.error('[EmailService] Failed to send email via SMTP:', err);
      return {
        success: true,
        simulated: true,
        message: `Mã xác thực: ${code} (SMTP máy chủ đang bận hoặc chưa đúng cấu hình).`,
      };
    }
  }

  public static async sendPaymentSuccessEmail(params: {
    toEmail: string;
    userName?: string;
    orderCode: string;
    tier: string;
    amount: number;
    expiresAt: number;
  }): Promise<boolean> {
    const { toEmail, userName, orderCode, tier, amount, expiresAt } = params;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';
    const smtpFrom = process.env.SMTP_FROM || `"EyePosture Assistant" <${smtpUser || 'support@eyeposture.com'}>`;

    if (!smtpUser || !smtpPass || smtpPass === 'your_app_password_here') {
      console.log(`[EmailService] SIMULATED PAYMENT EMAIL to ${toEmail}: Đơn hàng ${orderCode} thành công (${amount}đ)`);
      return true;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const formattedDate = new Date(expiresAt).toLocaleDateString('vi-VN');
      const tierText = tier === 'FAMILY' ? 'Gói Gia đình (Family VIP)' : 'Gói Cá nhân (Pro VIP)';

      await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject: `[EyePosture] Xác nhận thanh toán thành công - Kích hoạt ${tierText}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
            <div style="background: #0f172a; padding: 24px; text-align: center;">
              <h1 style="color: #2dd4bf; margin: 0; font-size: 22px;">EyePosture Assistant</h1>
              <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Xác nhận thanh toán đơn hàng #${orderCode}</p>
            </div>
            <div style="padding: 28px;">
              <h2 style="color: #0f172a; font-size: 18px;">Xin chào ${userName || toEmail},</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                Hệ thống đã nhận được khoản thanh toán <strong>${amount.toLocaleString('vi-VN')} đ</strong> của bạn và tự động kích hoạt thành công <strong>${tierText}</strong>.
              </p>
              <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 14px; color: #334155;">
                <p style="margin: 4px 0;"><strong>Mã đơn hàng:</strong> #${orderCode}</p>
                <p style="margin: 4px 0;"><strong>Gói:</strong> ${tierText}</p>
                <p style="margin: 4px 0;"><strong>Thời hạn:</strong> Đến ngày ${formattedDate}</p>
              </div>
              <p style="color: #64748b; font-size: 13px;">
                Bạn có thể mở ứng dụng EyePosture Desktop trên máy tính và đăng nhập để trải nghiệm toàn bộ tính năng cao cấp ngay bây giờ.
              </p>
            </div>
          </div>
        `,
      });
      console.log(`[EmailService] Đã gửi email kích hoạt tới ${toEmail}`);
      return true;
    } catch (err) {
      console.error('[EmailService] Lỗi gửi email thanh toán:', err);
      return false;
    }
  }
}
