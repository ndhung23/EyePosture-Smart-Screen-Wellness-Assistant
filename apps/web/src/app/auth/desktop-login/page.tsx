'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Laptop, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function DesktopLoginContent() {
  const searchParams = useSearchParams();
  const sessionKey = searchParams.get('sessionKey') || '';
  const { user, token, login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Identity Services script
  useEffect(() => {
    const googleClientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '819415316024-emjsufk1u4ql08prjoa4ch1te6327gta.apps.googleusercontent.com';

    const loadGoogleScript = () => {
      if ((window as any).google?.accounts?.id) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogleSignIn();
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (!(window as any).google?.accounts?.id) return;

      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredentialResponse,
      });

      const btnContainer = document.getElementById('google-btn-container');
      if (btnContainer) {
        (window as any).google.accounts.id.renderButton(btnContainer, {
          theme: 'filled_blue',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 280,
        });
      }
    };

    loadGoogleScript();
  }, [sessionKey]);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response.credential) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: response.credential,
          sessionKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng nhập Google thất bại');

      login(data.token, data.user);
      await approveDesktopSession(data.token, data.user);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối khi xác thực Google');
    } finally {
      setLoading(false);
    }
  };

  const approveDesktopSession = async (userToken: string, userData: any) => {
    if (!sessionKey) return;
    try {
      await fetch('/api/auth/desktop-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          sessionKey,
          token: userToken,
          user: userData,
        }),
      });
    } catch (e) {
      console.warn('Lỗi approve desktop session:', e);
    }
  };

  const handleApproveCurrentAccount = async () => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);
    try {
      await approveDesktopSession(token, user);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center text-white shadow-2xl relative">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 mx-auto flex items-center justify-center mb-4">
          <Laptop className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold mb-1">Đăng nhập EyePosture Desktop</h2>
        <p className="text-xs text-slate-400 mb-6">
          Ủy quyền tài khoản an toàn cho ứng dụng máy tính của bạn
        </p>

        {sessionKey && (
          <div className="p-2 mb-6 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            Phiên kết nối: <span className="text-teal-400 font-bold">{sessionKey}</span>
          </div>
        )}

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 py-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-emerald-300">Đã kết nối thành công!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ứng dụng <strong>EyePosture Desktop</strong> trên máy tính của bạn đã nhận diện và tự động đăng nhập. Bạn có thể đóng tab trình duyệt này ngay bây giờ.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Nếu đang đăng nhập sẵn trên Web */}
            {user && (
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-left space-y-3">
                <div className="text-xs text-slate-300">
                  Bạn đang đăng nhập tài khoản: <strong className="text-teal-300">{user.email}</strong>
                </div>
                <button
                  onClick={handleApproveCurrentAccount}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-500/20 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Ủy quyền ngay cho Desktop</span>
                </button>
              </div>
            )}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <span className="bg-slate-900 px-3">
                  {user ? 'Hoặc chọn tài khoản Google khác' : 'Đăng nhập với Google'}
                </span>
              </div>
            </div>

            {/* Google Sign In Button Container */}
            <div className="flex flex-col items-center justify-center min-h-[44px]">
              <div id="google-btn-container" className="flex justify-center" />
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Dữ liệu bản quyền, hồ sơ sức khỏe và thời gian dùng sẽ tự động đồng bộ tức thì về ứng dụng Desktop.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DesktopLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Đang tải...</div>}>
      <DesktopLoginContent />
    </Suspense>
  );
}
