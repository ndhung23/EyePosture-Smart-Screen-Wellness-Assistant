import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

const PRO_FEATURES = [
  'advanced_posture',
  'eye_strain_telemetry',
  'custom_break_intervals',
  'export_reports',
  'smart_distance_alerts',
];

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    // Token format: token_{userId}_{timestamp} or custom JWT
    let userId = '';
    if (token.startsWith('token_')) {
      const parts = token.split('_');
      userId = parts[1] || '';
    }

    const deviceId = req.nextUrl.searchParams.get('deviceId') || 'desktop_device';
    const supabase = getAdminSupabase();

    let user: any = null;
    let sub: any = null;

    if (userId) {
      const [userRes, subRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).maybeSingle(),
        supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
      ]);
      user = userRes.data;
      sub = subRes.data;
    }

    if (user?.is_blocked) {
      return NextResponse.json(
        { error: 'Tài khoản của bạn đã bị quản trị viên khóa' },
        { status: 403 }
      );
    }

    // Check device blocking if registered
    if (deviceId) {
      const { data: dev } = await supabase
        .from('devices')
        .select('is_blocked')
        .or(`device_fingerprint.eq.${deviceId},id.eq.${deviceId}`)
        .maybeSingle();

      if (dev?.is_blocked) {
        return NextResponse.json(
          { error: 'Thiết bị này đã bị quản trị viên khóa' },
          { status: 403 }
        );
      }
    }

    const tier = (sub?.tier || 'FREE').toUpperCase();
    const expiresAt = Number(sub?.expires_at) || Date.now() + 365 * 86400 * 1000;

    const payload = {
      sub: userId || 'anonymous',
      tier,
      features: tier === 'FREE' ? ['basic_reminders'] : PRO_FEATURES,
      issuedAt: Date.now(),
      expiresAt,
      deviceLimit: tier === 'FAMILY' ? 5 : 3,
      deviceId,
    };

    return NextResponse.json({
      entitlementToken: `ent_${userId || 'anon'}_${Date.now()}`,
      payload,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
