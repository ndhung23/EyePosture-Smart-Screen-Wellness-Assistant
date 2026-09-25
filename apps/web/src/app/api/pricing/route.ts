import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { SubscriptionPlan } from '@/lib/types';
import fs from 'fs';
import path from 'path';

const PRICING_FILE = path.join(process.cwd(), 'data', 'pricing.json');

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'PRO_MONTH',
    tier: 'PRO',
    interval: 'month',
    nameVi: 'Gói Cá nhân (1 Tháng)',
    nameEn: 'Personal Plan (1 Month)',
    descriptionVi: 'Mở khóa toàn bộ tính năng AI 3D, đo khoảng cách và tư thế',
    descriptionEn: 'Full 3D AI posture & distance tracking',
    priceVnd: 19000,
    priceUsd: 0.99,
    originalPriceVnd: 39000,
    isActive: true,
    sortOrder: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRO_YEAR',
    tier: 'PRO',
    interval: 'year',
    nameVi: 'Gói Cá nhân (1 Năm)',
    nameEn: 'Personal Plan (1 Year)',
    descriptionVi: 'Tiết kiệm 50% so với gói tháng, đầy đủ báo cáo chuyên sâu',
    descriptionEn: 'Save 50% vs monthly, in-depth reports',
    priceVnd: 199000,
    priceUsd: 9.99,
    originalPriceVnd: 399000,
    isActive: true,
    sortOrder: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRO_LIFETIME',
    tier: 'PRO',
    interval: 'lifetime',
    nameVi: 'Gói Cá nhân (Trọn đời)',
    nameEn: 'Personal Plan (Lifetime)',
    descriptionVi: 'Thanh toán 1 lần duy nhất, sở hữu vĩnh viễn mọi bản cập nhật',
    descriptionEn: 'One-time payment, lifetime updates',
    priceVnd: 299000,
    priceUsd: 19.99,
    originalPriceVnd: 699000,
    isActive: true,
    sortOrder: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'FAMILY_MONTH',
    tier: 'FAMILY',
    interval: 'month',
    nameVi: 'Gói Gia đình (1 Tháng - 5 thiết bị)',
    nameEn: 'Family Plan (1 Month - 5 devices)',
    descriptionVi: 'Bảo vệ tư thế và mắt cho cả gia đình, kết nối 5 thiết bị cùng lúc',
    descriptionEn: 'Protect whole family posture, 5 concurrent devices',
    priceVnd: 49000,
    priceUsd: 4.99,
    originalPriceVnd: 99000,
    isActive: true,
    sortOrder: 4,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'FAMILY_YEAR',
    tier: 'FAMILY',
    interval: 'year',
    nameVi: 'Gói Gia đình (1 Năm - 5 thiết bị)',
    nameEn: 'Family Plan (1 Year - 5 devices)',
    descriptionVi: 'Gói tiết kiệm nhất cho cả gia đình sử dụng trong 1 năm',
    descriptionEn: 'Best value for family with 1-year coverage',
    priceVnd: 299000,
    priceUsd: 19.99,
    originalPriceVnd: 599000,
    isActive: true,
    sortOrder: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'FAMILY_LIFETIME',
    tier: 'FAMILY',
    interval: 'lifetime',
    nameVi: 'Gói Gia đình (Trọn đời - 5 thiết bị)',
    nameEn: 'Family Plan (Lifetime - 5 devices)',
    descriptionVi: 'Trọn đời không giới hạn cho gia đình, cam kết tính năng VIP mãi mãi',
    descriptionEn: 'Lifetime unlimited for family, VIP features forever',
    priceVnd: 499000,
    priceUsd: 29.99,
    originalPriceVnd: 999000,
    isActive: true,
    sortOrder: 6,
    updatedAt: new Date().toISOString(),
  },
];

function loadLocalPlans(): SubscriptionPlan[] {
  try {
    if (fs.existsSync(PRICING_FILE)) {
      const data = JSON.parse(fs.readFileSync(PRICING_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Load pricing.json error, using defaults:', err);
  }
  return DEFAULT_PLANS;
}

function saveLocalPlans(plans: SubscriptionPlan[]) {
  try {
    const dir = path.dirname(PRICING_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PRICING_FILE, JSON.stringify(plans, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save pricing.json:', err);
  }
}

// GET: Fetch all active pricing plans
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminSupabase();
    // Try to fetch from Supabase if table exists
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: SubscriptionPlan[] = data.map((d: any) => ({
          id: d.id,
          tier: d.tier,
          interval: d.interval,
          nameVi: d.name_vi,
          nameEn: d.name_en,
          descriptionVi: d.description_vi,
          descriptionEn: d.description_en,
          priceVnd: Number(d.price_vnd),
          priceUsd: Number(d.price_usd),
          originalPriceVnd: d.original_price_vnd ? Number(d.original_price_vnd) : undefined,
          isActive: Boolean(d.is_active),
          sortOrder: Number(d.sort_order) || 1,
          updatedAt: d.updated_at,
        }));
        saveLocalPlans(mapped); // Cache locally
        return NextResponse.json({ plans: mapped, source: 'supabase' });
      }
    } catch {}

    // Fallback to local persistent plans
    const localPlans = loadLocalPlans();
    return NextResponse.json({ plans: localPlans, source: 'local' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Admin updates a plan's pricing or details
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, priceVnd, priceUsd, originalPriceVnd, nameVi, nameEn, descriptionVi, descriptionEn, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu plan id cần cập nhật' }, { status: 400 });
    }

    const currentPlans = loadLocalPlans();
    const planIndex = currentPlans.findIndex((p) => p.id === id);

    if (planIndex === -1) {
      return NextResponse.json({ error: 'Không tìm thấy gói này' }, { status: 404 });
    }

    const updatedPlan: SubscriptionPlan = {
      ...currentPlans[planIndex],
      priceVnd: priceVnd !== undefined ? Number(priceVnd) : currentPlans[planIndex].priceVnd,
      priceUsd: priceUsd !== undefined ? Number(priceUsd) : currentPlans[planIndex].priceUsd,
      originalPriceVnd: originalPriceVnd !== undefined ? Number(originalPriceVnd) : currentPlans[planIndex].originalPriceVnd,
      nameVi: nameVi !== undefined ? String(nameVi) : currentPlans[planIndex].nameVi,
      nameEn: nameEn !== undefined ? String(nameEn) : currentPlans[planIndex].nameEn,
      descriptionVi: descriptionVi !== undefined ? String(descriptionVi) : currentPlans[planIndex].descriptionVi,
      descriptionEn: descriptionEn !== undefined ? String(descriptionEn) : currentPlans[planIndex].descriptionEn,
      isActive: isActive !== undefined ? Boolean(isActive) : currentPlans[planIndex].isActive,
      updatedAt: new Date().toISOString(),
    };

    currentPlans[planIndex] = updatedPlan;
    saveLocalPlans(currentPlans);

    // Also attempt update in Supabase
    try {
      const supabase = getAdminSupabase();
      await supabase.from('subscription_plans').upsert({
        id: updatedPlan.id,
        tier: updatedPlan.tier,
        interval: updatedPlan.interval,
        name_vi: updatedPlan.nameVi,
        name_en: updatedPlan.nameEn,
        description_vi: updatedPlan.descriptionVi,
        description_en: updatedPlan.descriptionEn,
        price_vnd: updatedPlan.priceVnd,
        price_usd: updatedPlan.priceUsd,
        original_price_vnd: updatedPlan.originalPriceVnd,
        is_active: updatedPlan.isActive,
        sort_order: updatedPlan.sortOrder,
        updated_at: updatedPlan.updatedAt,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật giá gói ${updatedPlan.nameVi} thành công!`,
      plan: updatedPlan,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Reset all plans to default or batch update
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'reset') {
      saveLocalPlans(DEFAULT_PLANS);
      try {
        const supabase = getAdminSupabase();
        for (const p of DEFAULT_PLANS) {
          await supabase.from('subscription_plans').upsert({
            id: p.id,
            tier: p.tier,
            interval: p.interval,
            name_vi: p.nameVi,
            name_en: p.nameEn,
            description_vi: p.descriptionVi,
            description_en: p.descriptionEn,
            price_vnd: p.priceVnd,
            price_usd: p.priceUsd,
            original_price_vnd: p.originalPriceVnd,
            is_active: p.isActive,
            sort_order: p.sortOrder,
            updated_at: new Date().toISOString(),
          });
        }
      } catch {}
      return NextResponse.json({ success: true, plans: DEFAULT_PLANS });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
