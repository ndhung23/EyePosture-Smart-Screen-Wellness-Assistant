import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface DesktopSession {
  sessionKey: string;
  createdAt: number;
  expiresAt: number;
  authenticated: boolean;
  token?: string;
  user?: any;
}

// In-memory desktop auth session store (valid for 10 minutes)
const desktopSessions = new Map<string, DesktopSession>();

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [key, session] of desktopSessions.entries()) {
    if (session.expiresAt < now) {
      desktopSessions.delete(key);
    }
  }
}

export async function GET(req: NextRequest) {
  cleanupExpiredSessions();
  const sessionKey = req.nextUrl.searchParams.get('sessionKey');

  if (!sessionKey) {
    return NextResponse.json({ error: 'Missing sessionKey' }, { status: 400 });
  }

  const session = desktopSessions.get(sessionKey);
  if (!session || session.expiresAt < Date.now()) {
    return NextResponse.json({ authenticated: false, expired: true });
  }

  if (session.authenticated && session.token && session.user) {
    // Session đã đăng nhập thành công từ trình duyệt Web
    const result = {
      authenticated: true,
      token: session.token,
      user: session.user,
    };
    // Xóa session sau khi đã bàn giao token cho desktop
    desktopSessions.delete(sessionKey);
    return NextResponse.json(result);
  }

  return NextResponse.json({ authenticated: false, pending: true });
}

export async function POST(req: NextRequest) {
  cleanupExpiredSessions();
  const { action, sessionKey, token, user } = await req.json().catch(() => ({}));

  if (action === 'start') {
    // Desktop bắt đầu một phiên đăng nhập Google
    const newKey = `DSK_${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const now = Date.now();
    desktopSessions.set(newKey, {
      sessionKey: newKey,
      createdAt: now,
      expiresAt: now + 10 * 60 * 1000, // 10 phút
      authenticated: false,
    });

    return NextResponse.json({
      success: true,
      sessionKey: newKey,
      authUrl: `https://eyeposture.vercel.app/auth/desktop-login?sessionKey=${newKey}`,
    });
  }

  if (action === 'approve') {
    // Trình duyệt Web xác nhận đăng nhập thành công cho phiên Desktop
    if (!sessionKey || !token || !user) {
      return NextResponse.json({ error: 'Missing sessionKey, token or user' }, { status: 400 });
    }

    const session = desktopSessions.get(sessionKey);
    if (!session || session.expiresAt < Date.now()) {
      return NextResponse.json({ error: 'Phiên đăng nhập đã hết hạn' }, { status: 400 });
    }

    session.authenticated = true;
    session.token = token;
    session.user = user;
    desktopSessions.set(sessionKey, session);

    return NextResponse.json({ success: true, message: 'Đã ủy quyền đăng nhập thành công cho bản Desktop!' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
