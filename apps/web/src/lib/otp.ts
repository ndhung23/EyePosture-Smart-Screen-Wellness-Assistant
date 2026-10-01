import crypto from 'crypto';

const OTP_SECRET =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SECRET_KEY ||
  'eyeposture_otp_secure_secret_2026';

// In-memory fallback map for hot lambda instance / local dev
const inMemoryOtpStore = new Map<string, { code: string; expiresAt: number }>();

/**
 * Sinh mã OTP 6 số
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Ký mã token xác thực OTP (stateless, an toàn trên multi-instance Vercel Serverless)
 */
export function createOtpSignature(email: string, code: string, expiresAt: number): string {
  const cleanEmail = email.trim().toLowerCase();
  const data = `${cleanEmail}:${code}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');
  return `${expiresAt}.${hmac}`;
}

/**
 * Lưu OTP vào bộ nhớ tạm
 */
export function saveOtpInMemory(email: string, code: string, expiresAt: number) {
  const cleanEmail = email.trim().toLowerCase();
  inMemoryOtpStore.set(cleanEmail, { code, expiresAt });
}

/**
 * Kiểm tra mã OTP:
 * Ưu tiên kiểm tra chữ ký signedToken (hoạt động 100% trên serverless Vercel).
 * Nếu không có signedToken thì kiểm tra qua in-memory cache.
 */
export function verifyOtp(email: string, code: string, signedToken?: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  // 1. Kiểm tra chữ ký signedToken nếu có
  if (signedToken && signedToken.includes('.')) {
    const [expiresAtStr, signature] = signedToken.split('.');
    const expiresAt = Number(expiresAtStr);
    if (!isNaN(expiresAt) && expiresAt > Date.now()) {
      const expectedHmac = crypto
        .createHmac('sha256', OTP_SECRET)
        .update(`${cleanEmail}:${cleanCode}:${expiresAt}`)
        .digest('hex');

      if (signature === expectedHmac) {
        // Xóa khỏi memory nếu có
        inMemoryOtpStore.delete(cleanEmail);
        return true;
      }
    }
  }

  // 2. Fallback in-memory
  const cached = inMemoryOtpStore.get(cleanEmail);
  if (cached && cached.expiresAt > Date.now() && cached.code === cleanCode) {
    inMemoryOtpStore.delete(cleanEmail);
    return true;
  }

  return false;
}
