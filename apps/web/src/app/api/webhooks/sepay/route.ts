import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { sendPaymentSuccessEmail } from '@/lib/email';
import crypto from 'crypto';

interface SePayPayload {
  id?: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  code?: string | null;
  content?: string;
  transferType?: 'in' | 'out' | string;
  transferAmount?: number;
  accumulated?: number;
  subAccount?: string | null;
  referenceCode?: string;
  description?: string;
}

function getSepaySecrets(): string[] {
  const secrets = new Set<string>();
  if (process.env.SEPAY_WEBHOOK_SECRET) secrets.add(process.env.SEPAY_WEBHOOK_SECRET.trim());
  if (process.env.SECRET_KEY) secrets.add(process.env.SECRET_KEY.trim());
  if (process.env.SEPAY_API_KEY) secrets.add(process.env.SEPAY_API_KEY.trim());
  return Array.from(secrets).filter(Boolean);
}

/**
 * Kiểm tra tính hợp lệ của Webhook từ SePay
 * Hỗ trợ cả API Key (Header Authorization / Apikey) và HMAC-SHA256
 */
function verifySepayRequest(req: NextRequest, rawBodyText: string): boolean {
  const authHeader = req.headers.get('authorization') || req.headers.get('apikey') || '';
  const signatureHeader = req.headers.get('x-sepay-signature') || '';

  const validSecrets = getSepaySecrets();

  // Nếu không có secret nào cấu hình thì bỏ qua kiểm tra để không chặn
  if (validSecrets.length === 0) return true;

  // 1. Kiểm tra API Key trong header
  if (authHeader) {
    const cleanHeader = authHeader.trim();
    for (const secret of validSecrets) {
      if (
        cleanHeader === secret ||
        cleanHeader === `Apikey ${secret}` ||
        cleanHeader === `Bearer ${secret}` ||
        cleanHeader.includes(secret)
      ) {
        return true;
      }
    }
  }

  // 2. Kiểm tra HMAC SHA256 Signature (nếu SePay gửi qua header x-sepay-signature)
  if (signatureHeader && rawBodyText) {
    for (const secret of validSecrets) {
      try {
        const computedSignature = crypto
          .createHmac('sha256', secret)
          .update(rawBodyText)
          .digest('hex');
        if (crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(computedSignature))) {
          return true;
        }
      } catch {}
    }
  }

  return false;
}

// GET: Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'EyePosture SePay Webhook Endpoint',
    time: new Date().toISOString(),
  });
}

// POST: Nhận thông báo giao dịch chuyển khoản từ SePay
export async function POST(req: NextRequest) {
  try {
    const rawBodyText = await req.text();
    let body: SePayPayload;

    try {
      body = JSON.parse(rawBodyText);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    console.log('[SePay Webhook] Nhận dữ liệu webhook:', JSON.stringify(body));

    // Xác thực request
    const isAuthorized = verifySepayRequest(req, rawBodyText);
    if (!isAuthorized) {
      console.warn('[SePay Webhook] Cảnh báo: Unauthorized request - Secret/API Key không khớp.');
      return NextResponse.json({ error: 'Unauthorized: Invalid SePay signature or key' }, { status: 401 });
    }

    // Chỉ xử lý các giao dịch nhận tiền vào (transferType === 'in')
    if (body.transferType && body.transferType.toLowerCase() !== 'in') {
      console.log(`[SePay Webhook] Bỏ qua vì transferType = ${body.transferType}`);
      return NextResponse.json({ success: true, message: 'Bỏ qua giao dịch không phải tiền vào' });
    }

    const content = (body.content || '').toUpperCase();
    const transferAmount = Number(body.transferAmount) || 0;

    // Trích xuất mã đơn hàng từ nội dung: tìm cụm EPxxxxxx (ví dụ EP123456)
    const match = content.match(/EP[\s_-]?([A-Z0-9]{4,10})/i);
    let extractedOrderCode: string | null = null;
    if (match) {
      extractedOrderCode = `EP${match[1]}`.toUpperCase();
    }

    const supabase = getAdminSupabase();
    let matchedOrder: any = null;

    // 1. Tìm đơn hàng theo mã đơn hàng đã trích xuất
    if (extractedOrderCode) {
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', extractedOrderCode)
        .maybeSingle();

      if (order) {
        matchedOrder = order;
      }
    }

    // 2. Nếu không tìm thấy bằng mã chính xác, tìm đơn hàng PENDING gần nhất khớp số tiền
    if (!matchedOrder && transferAmount > 0) {
      const { data: fallbackOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'PENDING')
        .eq('amount', transferAmount)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fallbackOrders && fallbackOrders.length > 0) {
        matchedOrder = fallbackOrders[0];
        console.log(`[SePay Webhook] Khớp fallback đơn hàng theo số tiền ${transferAmount}: ${matchedOrder.order_code}`);
      }
    }

    if (!matchedOrder) {
      console.warn(`[SePay Webhook] Không tìm thấy đơn hàng tương ứng với nội dung: "${content}" - Số tiền: ${transferAmount}`);
      return NextResponse.json({
        success: true,
        message: 'Giao dịch đã được ghi nhận nhưng không tìm thấy mã đơn hàng phù hợp',
        rawContent: content,
      });
    }

    // 3. Nếu đơn hàng đã được thanh toán từ trước
    if (matchedOrder.status === 'PAID') {
      console.log(`[SePay Webhook] Đơn hàng ${matchedOrder.order_code} đã thanh toán trước đó.`);
      return NextResponse.json({
        success: true,
        message: 'Đơn hàng đã được thanh toán trước đó',
        orderCode: matchedOrder.order_code,
      });
    }

    // 4. Cập nhật trạng thái đơn hàng sang PAID
    const paidAt = new Date().toISOString();
    await supabase
      .from('orders')
      .update({
        status: 'PAID',
        paid_at: paidAt,
      })
      .eq('order_code', matchedOrder.order_code);

    // 5. Tính toán thời hạn gói bản quyền
    const interval = matchedOrder.interval || 'year';
    let durationDays = 30; // tháng
    if (interval === 'year' || transferAmount >= 199000) {
      durationDays = 365;
    } else if (interval === 'lifetime' || transferAmount >= 299000) {
      durationDays = 36500; // Trọn đời (~100 năm)
    }

    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    const targetTier = (matchedOrder.tier || 'PRO').toUpperCase();

    // 6. Cập nhật hoặc cấp mới Subscription cho User
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: matchedOrder.user_id,
          tier: targetTier,
          status: 'ACTIVE',
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (subError) {
      console.error('[SePay Webhook] Lỗi khi cập nhật subscriptions:', subError);
    } else {
      console.log(`[SePay Webhook] Đã kích hoạt gói ${targetTier} cho User: ${matchedOrder.user_id}`);
    }

    // 7. Lấy thông tin email và gửi thư xác nhận thanh toán thành công
    const { data: userData } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', matchedOrder.user_id)
      .maybeSingle();

    if (userData?.email) {
      console.log(`[SePay Webhook] Bắt đầu gửi email thông báo tới: ${userData.email}`);
      await sendPaymentSuccessEmail({
        toEmail: userData.email,
        userName: userData.name || userData.email.split('@')[0],
        orderCode: matchedOrder.order_code,
        tier: targetTier as 'PRO' | 'FAMILY',
        interval: interval as any,
        amount: Number(matchedOrder.amount) || transferAmount,
        expiresAt,
        transactionRef: body.referenceCode || String(body.id || ''),
      });
    } else {
      console.warn(`[SePay Webhook] Không tìm thấy email của user ${matchedOrder.user_id} để gửi thông báo.`);
    }

    return NextResponse.json({
      success: true,
      message: 'Xử lý thanh toán và nâng cấp gói thành công!',
      orderCode: matchedOrder.order_code,
      tier: targetTier,
      userEmail: userData?.email || null,
    });
  } catch (err: any) {
    console.error('[SePay Webhook] Lỗi nghiêm trọng:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
