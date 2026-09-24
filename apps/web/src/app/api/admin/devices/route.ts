import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getAdminSupabase();
  try {
    const [devsRes, usersRes] = await Promise.all([
      supabase.from('devices').select('*').order('last_active_at', { ascending: false }),
      supabase.from('users').select('id,email,name'),
    ]);

    const devs = devsRes.data || [];
    const users = usersRes.data || [];

    const userMap = new Map<string, any>();
    for (const u of users) userMap.set(u.id, u);

    const formatted = devs.map((d) => {
      const u = d.user_id ? userMap.get(d.user_id) : null;
      return {
        id: d.id,
        userId: d.user_id || 'anonymous',
        userName: u?.name || 'Máy Khách Desktop',
        userEmail: u?.email || `${d.device_name || 'Máy Desktop'} (Client)`,
        deviceName: d.device_name || 'Máy tính Desktop',
        deviceFingerprint: d.device_fingerprint,
        os: d.os || 'Windows 11',
        appVersion: d.app_version || '1.0.0',
        status: d.is_blocked ? 'BLOCKED' : 'ACTIVE',
        isBlocked: Boolean(d.is_blocked),
        lastActiveAt: d.last_active_at || d.created_at || new Date().toISOString(),
        createdAt: d.created_at || new Date().toISOString(),
      };
    });

    return NextResponse.json({ devices: formatted, total: formatted.length, source: 'supabase' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = getAdminSupabase();
  try {
    const body = await req.json();
    const { deviceId, isBlocked } = body;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(deviceId);
    const filter = isUuid ? { id: deviceId } : { device_fingerprint: deviceId };

    const { error } = await supabase
      .from('devices')
      .update({ is_blocked: Boolean(isBlocked) })
      .match(filter);

    if (error) throw error;
    return NextResponse.json({ success: true, isBlocked: Boolean(isBlocked) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
