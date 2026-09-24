import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getAdminSupabase();
  try {
    const [usersRes, subsRes, devsRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*'),
      supabase.from('devices').select('user_id'),
    ]);

    const users = usersRes.data || [];
    const subs = subsRes.data || [];
    const devs = devsRes.data || [];

    const subMap = new Map<string, any>();
    for (const s of subs) subMap.set(s.user_id, s);

    const devCountMap = new Map<string, number>();
    for (const d of devs) {
      if (d.user_id) devCountMap.set(d.user_id, (devCountMap.get(d.user_id) || 0) + 1);
    }

    const formatted = users.map((u) => {
      const sub = subMap.get(u.id);
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role || 'USER',
        isBlocked: Boolean(u.is_blocked),
        status: u.is_blocked ? 'BLOCKED' : 'ACTIVE',
        subscription: sub
          ? { tier: sub.tier, status: sub.status, expiresAt: Number(sub.expires_at) }
          : { tier: 'FREE', status: 'ACTIVE', expiresAt: null },
        deviceCount: devCountMap.get(u.id) || 0,
        createdAt: u.created_at,
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
