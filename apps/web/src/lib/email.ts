import nodemailer from 'nodemailer';

interface PaymentSuccessEmailParams {
  toEmail: string;
  userName?: string;
  orderCode: string;
  tier: 'PRO' | 'FAMILY';
  interval: 'month' | 'year' | 'lifetime';
  amount: number;
  expiresAt: number;
  transactionRef?: string;
}

/**
 * Tạo Nodemailer Transporter từ cấu hình môi trường
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  // Gmail port 465 yêu cầu SSL (secure = true), port 587 dùng STARTTLS (secure = false)
  const isPort465 = port === 465;
  const secure = process.env.SMTP_SECURE === 'true' || isPort465;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    }),
    from: process.env.SMTP_FROM || `"EyePosture Assistant" <${user || 'support@eyeposture.com'}>`,
    isConfigured: Boolean(user && pass && pass !== 'your_app_password_here'),
  };
}

/**
 * Gửi email thông báo thanh toán thành công và kích hoạt gói bản quyền
 */
export async function sendPaymentSuccessEmail(params: PaymentSuccessEmailParams): Promise<{ success: boolean; message?: string; error?: string }> {
  const { toEmail, userName, orderCode, tier, interval, amount, expiresAt, transactionRef } = params;
  const { transporter, from, isConfigured } = createTransporter();

  const tierLabel = tier === 'FAMILY' ? 'Gói Gia đình (Family VIP)' : 'Gói Cá nhân (Pro VIP)';
  const intervalLabel =
    interval === 'lifetime'
      ? 'Trọn đời (Vĩnh viễn)'
      : interval === 'year'
      ? '1 Năm (12 Tháng)'
      : '1 Tháng';

  const expiryDateFormatted = new Date(expiresAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedAmount = amount.toLocaleString('vi-VN');
  const greetingName = userName ? userName : toEmail.split('@')[0];

  if (!isConfigured) {
    console.warn(`[Email] SMTP chưa được cấu hình đầy đủ. Bỏ qua gửi email thực tới: ${toEmail}`);
    return { success: false, error: 'SMTP not configured' };
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận thanh toán thành công - EyePosture</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #111827; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Header with Gradient Accent -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #0284c7 50%, #6366f1 100%); padding: 36px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">EyePosture Assistant</h1>
              <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 14px; font-weight: 500;">Xác Nhận Kích Hoạt Gói Bản Quyền Thành Công</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              
              <!-- Greeting & Status Badge -->
              <div style="text-align: center; margin-bottom: 28px;">
                <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 9999px; padding: 6px 18px; color: #34d399; font-size: 13px; font-weight: 700; margin-bottom: 16px;">
                  ✓ GIAO DỊCH ĐÃ ĐƯỢC XÁC THỰC
                </div>
                <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">Cảm ơn bạn, ${greetingName}!</h2>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                  Hệ thống đã nhận được khoản thanh toán của bạn và tự động mở khóa toàn bộ quyền lợi cao cấp trên tài khoản <strong>${toEmail}</strong>.
                </p>
              </div>

              <!-- Order Receipt Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1a2234; border-radius: 14px; border: 1px solid #2d3748; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 24px; border-bottom: 1px solid #2d3748;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Chi tiết đơn hàng</span>
                  </td>
                  <td align="right" style="padding: 20px 24px; border-bottom: 1px solid #2d3748;">
                    <span style="font-family: monospace; font-size: 14px; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 3px 8px; border-radius: 6px;">#${orderCode}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 24px; font-size: 14px; color: #94a3b8;">Gói dịch vụ:</td>
                  <td align="right" style="padding: 14px 24px; font-size: 14px; font-weight: 700; color: #ffffff;">${tierLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 24px; font-size: 14px; color: #94a3b8;">Thời hạn gói:</td>
                  <td align="right" style="padding: 14px 24px; font-size: 14px; font-weight: 600; color: #cbd5e1;">${intervalLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 24px; font-size: 14px; color: #94a3b8;">Số tiền đã thanh toán:</td>
                  <td align="right" style="padding: 14px 24px; font-size: 18px; font-weight: 800; color: #10b981;">${formattedAmount} đ</td>
                </tr>
                <tr>
                  <td style="padding: 14px 24px; font-size: 14px; color: #94a3b8;">Hạn sử dụng đến:</td>
                  <td align="right" style="padding: 14px 24px; font-size: 14px; font-weight: 700; color: #f59e0b;">${expiryDateFormatted}</td>
                </tr>
                ${
                  transactionRef
                    ? `<tr>
                        <td style="padding: 14px 24px; font-size: 13px; color: #64748b;">Mã giao dịch / SePay:</td>
                        <td align="right" style="padding: 14px 24px; font-family: monospace; font-size: 12px; color: #94a3b8;">${transactionRef}</td>
                      </tr>`
                    : ''
                }
              </table>

              <!-- Action Guide -->
              <div style="background: rgba(14, 165, 233, 0.08); border-left: 4px solid #0284c7; padding: 18px 20px; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
                <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #38bdf8;">Hướng dẫn sử dụng ngay:</h3>
                <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                  <li style="margin-bottom: 6px;">Mở ứng dụng <strong>EyePosture Desktop</strong> trên máy tính của bạn.</li>
                  <li style="margin-bottom: 6px;">Đăng nhập với email <strong>${toEmail}</strong>.</li>
                  <li>Hệ thống sẽ tự động đồng bộ giấy phép bản quyền và mở khóa tất cả tính năng AI cao cấp nhất!</li>
                </ol>
              </div>

              <!-- Button CTA -->
              <div style="text-align: center; margin-bottom: 20px;">
                <a href="https://eyeposture.vercel.app" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-size: 14px; font-weight: 700; box-shadow: 0 10px 20px -5px rgba(2, 132, 199, 0.4);">
                  Truy cập EyePosture Website →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b0f19; padding: 24px 30px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Nếu bạn cần hỗ trợ hoặc có thắc mắc, vui lòng liên hệ email: <a href="mailto:support@eyeposture.com" style="color: #38bdf8; text-decoration: none;">support@eyeposture.com</a>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #475569;">
                © ${new Date().getFullYear()} EyePosture Inc. Tất cả quyền được bảo lưu.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from,
      to: toEmail,
      subject: `[EyePosture] Kích hoạt thành công ${tierLabel} - Mã đơn #${orderCode}`,
      text: `Xin chào ${greetingName}, bạn đã thanh toán thành công ${formattedAmount} đ cho mã đơn #${orderCode}. Gói ${tierLabel} có hiệu lực đến ngày ${expiryDateFormatted}.`,
      html: htmlContent,
    });

    console.log(`[Email] Đã gửi email xác nhận thanh toán thành công tới: ${toEmail}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[Email] Lỗi khi gửi email xác nhận thanh toán tới ${toEmail}:`, err);
    return { success: false, error: err.message };
  }
}
