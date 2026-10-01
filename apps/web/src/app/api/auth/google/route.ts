import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, sessionKey, email: directEmail, name: directName } = body;

    let email = '';
    let name = '';
    let googleId = '';

    // 1. Nếu nhận Google ID Token Credential từ Google Identity Services (GSI)
    if (credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );
        if (!verifyRes.ok) {
          const errText = await verifyRes.text();
          console.warn('[GoogleAuth] Google token verification failed:', errText);
          return NextResponse.json({ error: 'Mã xác thực Google không hợp lệ hoặc đã hết hạn' }, { status: 401 });
        }

        const tokenInfo = await verifyRes.json();
        email = (tokenInfo.email || '').trim().toLowerCase();
        name = tokenInfo.name || email.split('@')[0];
        googleId = tokenInfo.sub || '';

        // Kiểm tra email_verified
        if (tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true) {
          return NextResponse.json({ error: 'Email Google này chưa được xác thực' }, { status: 403 });
        }
      } catch (verifyErr: any) {
        console.error('[GoogleAuth] Lỗi kết nối Google verification:', verifyErr);
        return NextResponse.json({ error: 'Không thể kết nối đến máy chủ Google để xác thực' }, { status: 502 });
      }
    } else if (directEmail) {
      // Cho phép test hoặc luồng redirect nội bộ
      email = directEmail.trim().toLowerCase();
      name = directName || email.split('@')[0];
    } else {
      return NextResponse.json({ error: 'Thiếu thông tin xác thực Google' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 2. Tìm tài khoản trong bảng users theo email
    const { data: existingUser, error: findErr } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (findErr) {
      console.warn('[GoogleAuth] Lỗi tìm user:', findErr);
    }

    let dbUser = existingUser;

    if (dbUser) {
      // User đã có tài khoản (có thể từng đăng ký bằng mật khẩu hoặc Google trước đó)
      if (dbUser.is_blocked) {
        return NextResponse.json({ error: 'Tài khoản của bạn đã bị quản trị viên khóa' }, { status: 403 });
      }

      // Cập nhật tên nếu trước đó chưa có tên
      if (!dbUser.name && name) {
        await supabase.from('users').update({ name, updated_at: new Date().toISOString() }).eq('id', dbUser.id);
        dbUser.name = name;
      }
    } else {
      // 3. Người dùng mới lần đầu đăng nhập Google -> Tự động khởi tạo tài khoản đồng bộ
      const newUserId = crypto.randomUUID();
      const adminEmails = (process.env.ADMIN_EMAILS || 'ndhung.work@gmail.com,admin').toLowerCase().split(',');
      const role = adminEmails.includes(email) ? 'ADMIN' : 'USER';

      const newUserPayload = {
        id: newUserId,
        email,
        name,
        role,
        is_blocked: false,
        password_hash: '', // Người dùng Google chưa thiết lập mật khẩu riêng (có thể đặt sau qua Quên mật khẩu)
        salt: 'google_oauth_' + (googleId || 'user'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: insertedUser, error: insertErr } = await supabase
        .from('users')
        .insert(newUserPayload)
        .select()
        .single();

      if (insertErr) {
        console.error('[GoogleAuth] Lỗi tạo user mới:', insertErr);
        throw insertErr;
      }

      dbUser = insertedUser;

      // Tạo gói đăng ký FREE mặc định
      await supabase.from('subscriptions').insert({
        user_id: newUserId,
        tier: 'FREE',
        status: 'ACTIVE',
        expires_at: 0,
      });
    }

    // 4. Lấy thông tin gói đăng ký (Subscription)
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', dbUser.id)
      .maybeSingle();

    const safeUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role || 'USER',
      status: dbUser.is_blocked ? 'BLOCKED' : 'ACTIVE',
      isBlocked: Boolean(dbUser.is_blocked),
      hasCustomPassword: Boolean(dbUser.password_hash && dbUser.password_hash.length > 0),
      authProvider: dbUser.password_hash ? 'BOTH' : 'GOOGLE',
      subscription: sub
        ? { tier: sub.tier, status: sub.status, expiresAt: Number(sub.expires_at) }
        : { tier: 'FREE', status: 'ACTIVE', expiresAt: null },
    };

    const token = `token_${dbUser.id}_${Date.now()}`;

    // 5. Nếu có sessionKey từ Desktop, tự động ủy quyền phiên Desktop
    if (sessionKey) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eyeposture.vercel.app';
        await fetch(`${baseUrl}/api/auth/desktop-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'approve',
            sessionKey,
            token,
            user: safeUser,
          }),
        }).catch(() => {});
      } catch {}
    }

    return NextResponse.json({
      success: true,
      token,
      user: safeUser,
      message: 'Đăng nhập bằng Google thành công!',
    });
  } catch (err: any) {
    console.error('[GoogleAuth] Lỗi server:', err);
    return NextResponse.json({ error: err.message || 'Lỗi xử lý đăng nhập Google' }, { status: 500 });
  }
}
