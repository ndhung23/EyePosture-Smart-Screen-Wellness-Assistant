import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

// POST: Tạo đơn hàng mới khi khách hàng mở modal VietQR
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderCode, userId, tier, interval, amount } = body;

    if (!orderCode || !userId || !tier || !amount) {
      return NextResponse.json(
        { error: 'Thiếu thông tin đơn hàng bắt buộc' },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const newOrder = {
      order_code: orderCode.trim().toUpperCase(),
      user_id: userId,
      tier: tier.toUpperCase(),
      interval: interval || 'year',
      amount: Number(amount),
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('orders')
      .upsert(newOrder, { onConflict: 'order_code' })
      .select()
      .single();

    if (error) {
      console.error('[Order API] Lỗi lưu đơn hàng:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Đơn hàng đã được khởi tạo',
      order: data,
    });
  } catch (err: any) {
    console.error('[Order API] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: Kiểm tra trạng thái đơn hàng (cho realtime polling ở phía client)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderCode = searchParams.get('orderCode');

    if (!orderCode) {
      return NextResponse.json({ error: 'Thiếu orderCode' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', orderCode.trim().toUpperCase())
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    return NextResponse.json({
      orderCode: order.order_code,
      status: order.status,
      tier: order.tier,
      interval: order.interval,
      amount: order.amount,
      paidAt: order.paid_at,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
