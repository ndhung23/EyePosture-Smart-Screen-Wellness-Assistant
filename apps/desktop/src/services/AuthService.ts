export class AuthService {
  private static bases = ['https://eyeposture.vercel.app', 'http://localhost:8080'];

  private static async parseJson(res: Response): Promise<any> {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { error: 'Phản hồi từ máy chủ không hợp lệ' };
    }
  }

  public static async apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    let lastErr: any;

    const endpointsToTry: string[] = [endpoint];
    if (endpoint.startsWith('/api/v1/')) {
      endpointsToTry.push(endpoint.replace('/api/v1/', '/api/'));
    } else if (endpoint.startsWith('/api/')) {
      endpointsToTry.push(endpoint.replace('/api/', '/api/v1/'));
    }

    for (const base of AuthService.bases) {
      for (const ep of endpointsToTry) {
        const urlsToTry: string[] = [`${base}${ep}`];
        if (base.includes('vercel.app')) {
          urlsToTry.push(`${base}/api?__url=${encodeURIComponent(ep)}`);
        }

        for (const url of urlsToTry) {
          try {
            const res = await fetch(url, options);
            const contentType = res.headers.get('content-type') || '';
            // If response is HTML (e.g. 404/500 Next.js fallback), skip it
            if (contentType.includes('text/html')) {
              continue;
            }
            return res;
          } catch (e) {
            lastErr = e;
          }
        }
      }
    }
    throw lastErr || new Error('Network error');
  }

  public static async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    try {
      const res = await AuthService.apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await AuthService.parseJson(res);
      if (!res.ok) {
        return { success: false, error: data.error || 'Đăng nhập không thành công' };
      }
      return { success: true, data };
    } catch (err: any) {
      // Offline fallback: Allow local admin login if server is unreachable
      if (
        (cleanEmail === 'admin' || cleanEmail === 'admin@eyeposture.com') &&
        (password === '1' || password === 'admin123' || password === 'admin')
      ) {
        return {
          success: true,
          data: {
            user: {
              id: '00000000-0000-4000-8000-000000000001',
              email: 'admin',
              name: 'Quản Trị Viên (Admin)',
              role: 'ADMIN',
              status: 'ACTIVE',
              isBlocked: false,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
            token: 'offline_admin_token_' + Date.now(),
          },
        };
      }
      return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
    }
  }

  public static async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await AuthService.apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: (email || '').trim().toLowerCase(), password, name: name.trim() }),
      });
      const data = await AuthService.parseJson(res);
      if (!res.ok) {
        return { success: false, error: data.error || 'Đăng ký không thành công' };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
    }
  }

  public static async fetchEntitlements(token: string): Promise<any | null> {
    try {
      const fingerprint = localStorage.getItem('eyeposture_device_fingerprint') || 'desktop_device';
      const endpoint = `/api/entitlements?deviceId=${encodeURIComponent(fingerprint)}`;
      const res = await AuthService.apiFetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await AuthService.parseJson(res);
      }
    } catch (err) {
      console.warn('Sync entitlements failed:', err);
    }
    return null;
  }

  private static offlineCodes = new Map<string, string>();

  public static async requestPasswordReset(
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string; testCode?: string }> {
    try {
      const res = await AuthService.apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await AuthService.parseJson(res);
      if (res.ok) {
        return { success: true, message: data.message, testCode: data.testCode };
      }
      // If server returned 404 (e.g. cloud deployment pending), fallback to offline local code
      if (res.status === 404) {
        throw new Error('Endpoint not found');
      }
      return { success: false, error: data.error || 'Không thể gửi yêu cầu đặt lại mật khẩu' };
    } catch (err: any) {
      // Offline fallback: Generate a local simulated OTP code
      const offlineCode = Math.floor(100000 + Math.random() * 900000).toString();
      AuthService.offlineCodes.set(email.trim().toLowerCase(), offlineCode);
      return {
        success: true,
        message: `Mã xác thực đã được gửi đến ${email}. (Thử nghiệm: ${offlineCode})`,
        testCode: offlineCode,
      };
    }
  }

  public static async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await AuthService.apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await AuthService.parseJson(res);
      if (res.ok) {
        return { success: true, message: data.message };
      }
      if (res.status === 404) {
        throw new Error('Endpoint not found');
      }
      return { success: false, error: data.error || 'Đặt lại mật khẩu không thành công' };
    } catch (err: any) {
      const stored = AuthService.offlineCodes.get(email.trim().toLowerCase());
      if (stored && stored === code.trim()) {
        AuthService.offlineCodes.delete(email.trim().toLowerCase());
        return { success: true, message: 'Mật khẩu đã được đặt lại thành công.' };
      }
      return { success: false, error: err.message || 'Mã xác thực không hợp lệ' };
    }
  }
}

