import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getAdminSupabase();
  try {
    const [usersRes, subsRes, devsRes, ordersRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*'),
      supabase.from('devices').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ]);

    const users = usersRes.data || [];
    const subs = subsRes.data || [];
    const devs = devsRes.data || [];
    const orders = ordersRes.data || [];

    const subMap = new Map<string, any>();
    for (const s of subs) subMap.set(s.user_id, s);

    const devsMap = new Map<string, any[]>();
    for (const d of devs) {
      if (d.user_id) {
        const list = devsMap.get(d.user_id) || [];
        list.push({
          id: d.id,
          userId: d.user_id,
          deviceName: d.device_name || 'Thiết bị chưa đặt tên',
          deviceFingerprint: d.device_fingerprint || '',
          os: d.os || 'Unknown OS',
          appVersion: d.app_version || '1.0.0',
          status: d.is_blocked ? 'BLOCKED' : (d.status || 'ACTIVE'),
          isBlocked: Boolean(d.is_blocked),
          lastActiveAt: d.last_active_at || d.created_at,
          createdAt: d.created_at,
        });
        devsMap.set(d.user_id, list);
      }
    }

    const ordersMap = new Map<string, any[]>();
    const spentMap = new Map<string, number>();
    for (const o of orders) {
      if (o.user_id) {
        const list = ordersMap.get(o.user_id) || [];
        list.push({
          orderCode: o.order_code,
          tier: o.tier,
          interval: o.interval,
          amount: Number(o.amount) || 0,
          status: o.status,
          createdAt: o.created_at,
          paidAt: o.paid_at,
        });
        ordersMap.set(o.user_id, list);

        if (o.status === 'PAID') {
          spentMap.set(o.user_id, (spentMap.get(o.user_id) || 0) + (Number(o.amount) || 0));
        }
      }
    }

    const formatted = users.map((u) => {
      const sub = subMap.get(u.id);
      const userDevs = devsMap.get(u.id) || [];
      const userOrders = ordersMap.get(u.id) || [];
      const actualPaid = spentMap.get(u.id) || 0;

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role || 'USER',
        isBlocked: Boolean(u.is_blocked),
        status: u.is_blocked ? 'BLOCKED' : 'ACTIVE',
        subscription: sub
          ? {
              tier: sub.tier,
              status: sub.status,
              expiresAt: Number(sub.expires_at),
              createdAt: sub.created_at,
              updatedAt: sub.updated_at,
            }
          : { tier: 'FREE', status: 'ACTIVE', expiresAt: null },
        deviceCount: userDevs.length,
        devices: userDevs,
        totalSpent: actualPaid,
        orders: userOrders,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      };
    });

    return NextResponse.json({ users: formatted, total: formatted.length, source: 'supabase' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = getAdminSupabase();
  try {
    const body = await req.json();
    const { action, userId, isBlocked, tier } = body;

    if (action === 'block') {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: Boolean(isBlocked), updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      return NextResponse.json({ success: true, isBlocked: Boolean(isBlocked) });
    }

    if (action === 'upgrade') {
      const targetTier = tier || 'PRO';
      const duration = Date.now() + 365 * 86400 * 1000;
      const { error } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        tier: targetTier,
        status: 'ACTIVE',
        expires_at: duration,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return NextResponse.json({ success: true, tier: targetTier, expiresAt: duration });
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
