import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface Voucher {
  id: string;
  code: string;
  discountPercent: number; // 1 to 100
  validUntil: string; // ISO String
  maxUses: number; // 0 = unlimited
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  description?: string;
}

export class VoucherService {
  private static vouchers: Map<string, Voucher> = new Map();
  private static initialized = false;

  private static getFilePath(): string {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }
    return fs.existsSync(dir)
      ? path.join(dir, 'vouchers.json')
      : process.env.VERCEL
      ? '/tmp/eyeposture_vouchers.json'
      : path.join(os.tmpdir(), 'eyeposture_vouchers.json');
  }

  public static initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const p = this.getFilePath();
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const v of list) {
            if (v && v.id) this.vouchers.set(v.id, v);
          }
        }
      }
    } catch {
      // ignore
    }

    // If empty, seed initial production vouchers
    if (this.vouchers.size === 0) {
      const defaults: Voucher[] = [
        {
          id: 'vouch-chao-ban-moi',
          code: 'CHAOBANMOI',
          discountPercent: 20,
          validUntil: '2026-12-31T23:59:59.000Z',
          maxUses: 500,
          usedCount: 28,
          isActive: true,
          createdAt: '2026-09-01T00:00:00.000Z',
          description: 'Giảm 20% cho thành viên mới nâng cấp trải nghiệm Pro',
        },
        {
          id: 'vouch-eye-health-50',
          code: 'EYEHEALTH50',
          discountPercent: 50,
          validUntil: '2026-10-31T23:59:59.000Z',
          maxUses: 200,
          usedCount: 84,
          isActive: true,
          createdAt: '2026-09-15T00:00:00.000Z',
          description: 'Ưu đãi Tuần Lễ Bảo Vệ Mắt - Giảm sâu 50% bản quyền 1 năm',
        },
        {
          id: 'vouch-fpt-student',
          code: 'FPTSTUDENT',
          discountPercent: 35,
          validUntil: '2026-12-31T23:59:59.000Z',
          maxUses: 0,
          usedCount: 65,
          isActive: true,
          createdAt: '2026-09-10T00:00:00.000Z',
          description: 'Hỗ trợ 35% cho sinh viên, học sinh và giảng viên CNTT',
        },
      ];

      for (const v of defaults) {
        this.vouchers.set(v.id, v);
      }
      this.persist();
    }
  }

  public static persist(): void {
    try {
      const p = this.getFilePath();
      const list = Array.from(this.vouchers.values());
      fs.writeFileSync(p, JSON.stringify(list, null, 2), 'utf8');
    } catch {
      // ignore
    }
  }

  public static getAll(): Voucher[] {
    this.initialize();
    return Array.from(this.vouchers.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public static getById(id: string): Voucher | undefined {
    this.initialize();
    return this.vouchers.get(id);
  }

  public static getByCode(code: string): Voucher | undefined {
    this.initialize();
    const clean = (code || '').trim().toUpperCase();
    for (const v of this.vouchers.values()) {
      if (v.code.toUpperCase() === clean) return v;
    }
    return undefined;
  }

  public static create(data: {
    code: string;
    discountPercent: number;
    validUntil: string;
    maxUses?: number;
    description?: string;
  }): { success: boolean; voucher?: Voucher; error?: string } {
    this.initialize();
    const cleanCode = (data.code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: 'Mã voucher không được để trống' };
    }

    if (this.getByCode(cleanCode)) {
      return { success: false, error: `Mã voucher "${cleanCode}" đã tồn tại` };
    }

    const pct = Math.max(1, Math.min(100, Math.round(Number(data.discountPercent) || 10)));
    const validUntilDate = data.validUntil ? new Date(data.validUntil) : new Date(Date.now() + 30 * 86400 * 1000);

    const voucher: Voucher = {
      id: `vouch-${crypto.randomUUID()}`,
      code: cleanCode,
      discountPercent: pct,
      validUntil: validUntilDate.toISOString(),
      maxUses: Math.max(0, Number(data.maxUses) || 0),
      usedCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      description: data.description?.trim() || `Giảm ${pct}% bản quyền EyePosture`,
    };

    this.vouchers.set(voucher.id, voucher);
    this.persist();
    return { success: true, voucher };
  }

  public static toggle(id: string): { success: boolean; voucher?: Voucher; error?: string } {
    this.initialize();
    const v = this.vouchers.get(id);
    if (!v) return { success: false, error: 'Voucher không tồn tại' };

    v.isActive = !v.isActive;
    this.persist();
    return { success: true, voucher: v };
  }

  public static delete(id: string): boolean {
    this.initialize();
    const deleted = this.vouchers.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  public static apply(
    code: string,
    originalAmount: number = 49000
  ): {
    valid: boolean;
    message: string;
    voucher?: Voucher;
    discountPercent?: number;
    discountAmount?: number;
    finalAmount?: number;
  } {
    this.initialize();
    const clean = (code || '').trim().toUpperCase();
    if (!clean) {
      return { valid: false, message: 'Vui lòng nhập mã giảm giá' };
    }

    const v = this.getByCode(clean);
    if (!v) {
      return { valid: false, message: 'Mã giảm giá không tồn tại hoặc đã bị xóa' };
    }

    if (!v.isActive) {
      return { valid: false, message: 'Mã giảm giá này hiện đang tạm ngưng áp dụng' };
    }

    const now = Date.now();
    const expiry = new Date(v.validUntil).getTime();
    if (now > expiry) {
      return { valid: false, message: 'Mã giảm giá đã hết hạn sử dụng' };
    }

    if (v.maxUses > 0 && v.usedCount >= v.maxUses) {
      return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' };
    }

    const discountAmount = Math.round((originalAmount * v.discountPercent) / 100);
    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return {
      valid: true,
      message: `Áp dụng thành công voucher ${v.code} (-${v.discountPercent}%)`,
      voucher: v,
      discountPercent: v.discountPercent,
      discountAmount,
      finalAmount,
    };
  }

  public static recordUsage(code: string): void {
    this.initialize();
    const v = this.getByCode(code);
    if (v) {
      v.usedCount = (v.usedCount || 0) + 1;
      this.persist();
    }
  }
}
