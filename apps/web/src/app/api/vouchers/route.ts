import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// In-memory & JSON file persistent fallback
const VOUCHER_FILE = path.join(process.cwd(), 'data', 'vouchers.json');

function loadVouchers(): any[] {
  try {
    if (fs.existsSync(VOUCHER_FILE)) {
      return JSON.parse(fs.readFileSync(VOUCHER_FILE, 'utf8'));
    }
  } catch {}
  return [
    {
      id: 'v_welcome',
      code: 'WELCOME20',
      discountPercent: 20,
      expiresAt: Date.now() + 90 * 86400 * 1000,
      isActive: true,
      usageCount: 12,
      createdAt: Date.now() - 5 * 86400 * 1000,
    },
    {
      id: 'v_eye50',
      code: 'VIP50',
      discountPercent: 50,
      expiresAt: Date.now() + 30 * 86400 * 1000,
      isActive: true,
      usageCount: 5,
      createdAt: Date.now() - 2 * 86400 * 1000,
    },
  ];
}

function saveVouchers(list: any[]) {
  try {
    const dir = path.dirname(VOUCHER_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(VOUCHER_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const vouchers = loadVouchers();

  if (code) {
    const clean = code.trim().toUpperCase();
    const found = vouchers.find((v) => v.code === clean);
    if (!found) {
      return NextResponse.json({ valid: false, error: 'Mã voucher không tồn tại' }, { status: 404 });
    }
    if (!found.isActive) {
      return NextResponse.json({ valid: false, error: 'Mã voucher đang tạm dừng' }, { status: 400 });
    }
    if (found.expiresAt < Date.now()) {
      return NextResponse.json({ valid: false, error: 'Mã voucher đã hết hạn sử dụng' }, { status: 400 });
    }
    return NextResponse.json({
      valid: true,
      code: found.code,
      discountPercent: found.discountPercent,
    });
  }

  return NextResponse.json({ vouchers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, discountPercent, daysValid } = body;

    if (!code || !discountPercent) {
      return NextResponse.json({ error: 'Thiếu thông tin mã voucher hoặc phần trăm' }, { status: 400 });
    }

    const vouchers = loadVouchers();
    const clean = String(code).trim().toUpperCase();

    if (vouchers.some((v) => v.code === clean)) {
      return NextResponse.json({ error: 'Mã voucher này đã tồn tại' }, { status: 409 });
    }

    const newVoucher = {
      id: `v_${Date.now()}`,
      code: clean,
      discountPercent: Math.min(100, Math.max(1, Number(discountPercent))),
      expiresAt: Date.now() + (Number(daysValid) || 30) * 86400 * 1000,
      isActive: true,
      usageCount: 0,
      createdAt: Date.now(),
    };

    vouchers.unshift(newVoucher);
    saveVouchers(vouchers);

    return NextResponse.json({ voucher: newVoucher }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive } = body;
    const vouchers = loadVouchers();
    const target = vouchers.find((v) => v.id === id);
    if (!target) {
      return NextResponse.json({ error: 'Không tìm thấy voucher' }, { status: 404 });
    }
    target.isActive = Boolean(isActive);
    saveVouchers(vouchers);
    return NextResponse.json({ voucher: target });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

    let vouchers = loadVouchers();
    vouchers = vouchers.filter((v) => v.id !== id);
    saveVouchers(vouchers);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
