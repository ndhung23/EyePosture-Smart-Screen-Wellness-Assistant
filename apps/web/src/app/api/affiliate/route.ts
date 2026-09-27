import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export type AffiliateTier = 'MEMBER' | 'KOC_PARTNER';

export interface AffiliateAccount {
  userId: string;
  userEmail?: string;
  userName?: string;
  affiliateCode: string;
  tier: AffiliateTier;
  buyerDiscountPercent: number; // 10% cho Member, 15% cho KOC
  commissionPercentLifetime: number; // 35% - 40%
  commissionPercentYearly: number; // 30% - 35%
  commissionPercentMonthly: number; // 20%
  totalClicks: number;
  totalConversions: number;
  totalEarnedVnd: number;
  currentBalanceVnd: number;
  channelInfo?: string;
  payoutInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  };
  createdAt: string;
}

export interface AffiliateReferral {
  id: string;
  affiliateCode: string;
  referrerUserId: string;
  buyerUserId: string;
  buyerName?: string;
  orderCode: string;
  planTier: string;
  planInterval: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  amountVnd: number;
  type: 'BANK_TRANSFER' | 'CONVERT_FAMILY_VIP';
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
}

interface AffiliateDatabase {
  accounts: Record<string, AffiliateAccount>; // Key: userId
  codeToUserId: Record<string, string>; // Key: code -> userId
  referrals: AffiliateReferral[];
  payoutRequests: PayoutRequest[];
}

const DATA_FILE = path.join(process.cwd(), 'data', 'affiliate.json');

function loadDb(): AffiliateDatabase {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[Affiliate] Error loading db:', err);
  }
  return {
    accounts: {},
    codeToUserId: {},
    referrals: [],
    payoutRequests: [],
  };
}

function saveDb(db: AffiliateDatabase) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('[Affiliate] Error saving db:', err);
  }
}

function generateCode(userId: string): string {
  const clean = userId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  const rand = Math.floor(100 + Math.random() * 900);
  return `EYE${clean || rand}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const code = searchParams.get('code');

  const db = loadDb();

  // Validate single affiliate code (for discount voucher lookup)
  if (code) {
    const cleanCode = code.trim().toUpperCase();
    const ownerUserId = db.codeToUserId[cleanCode];
    if (!ownerUserId || !db.accounts[ownerUserId]) {
      return NextResponse.json({ valid: false, error: 'Mã giới thiệu không tồn tại' }, { status: 404 });
    }
    const account = db.accounts[ownerUserId];
    return NextResponse.json({
      valid: true,
      code: account.affiliateCode,
      discountPercent: account.buyerDiscountPercent,
      tier: account.tier,
      ownerUserId,
    });
  }

  // Look up or auto-init user affiliate portal
  if (!userId) {
    return NextResponse.json({ error: 'Thiếu userId hoặc code' }, { status: 400 });
  }

  let account = db.accounts[userId];
  if (!account) {
    const defaultCode = generateCode(userId);
    account = {
      userId,
      affiliateCode: defaultCode,
      tier: 'MEMBER',
      buyerDiscountPercent: 10,
      commissionPercentLifetime: 35,
      commissionPercentYearly: 30,
      commissionPercentMonthly: 20,
      totalClicks: 0,
      totalConversions: 0,
      totalEarnedVnd: 0,
      currentBalanceVnd: 0,
      createdAt: new Date().toISOString(),
    };
    db.accounts[userId] = account;
    db.codeToUserId[defaultCode] = userId;
    saveDb(db);
  }

  const userReferrals = db.referrals.filter((r) => r.referrerUserId === userId);
  const userPayouts = db.payoutRequests.filter((p) => p.userId === userId);

  return NextResponse.json({
    account,
    referrals: userReferrals,
    payoutRequests: userPayouts,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = loadDb();

    // 1. Ghi nhận lượt Click từ tiếp thị
    if (action === 'track_click') {
      const code = String(body.code || '').trim().toUpperCase();
      const ownerId = db.codeToUserId[code];
      if (ownerId && db.accounts[ownerId]) {
        db.accounts[ownerId].totalClicks = (db.accounts[ownerId].totalClicks || 0) + 1;
        saveDb(db);
        return NextResponse.json({ success: true, clicks: db.accounts[ownerId].totalClicks });
      }
      return NextResponse.json({ success: false, message: 'Code not found' }, { status: 404 });
    }

    // 2. Nâng cấp KOC / Creator Partner (30-40% hoa hồng, 15% discount cho fan)
    if (action === 'upgrade_koc') {
      const { userId, channelInfo, preferredCode } = body;
      if (!userId) return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 });

      let account = db.accounts[userId];
      if (!account) {
        account = {
          userId,
          affiliateCode: generateCode(userId),
          tier: 'MEMBER',
          buyerDiscountPercent: 10,
          commissionPercentLifetime: 35,
          commissionPercentYearly: 30,
          commissionPercentMonthly: 20,
          totalClicks: 0,
          totalConversions: 0,
          totalEarnedVnd: 0,
          currentBalanceVnd: 0,
          createdAt: new Date().toISOString(),
        };
        db.accounts[userId] = account;
        db.codeToUserId[account.affiliateCode] = userId;
      }

      account.tier = 'KOC_PARTNER';
      account.buyerDiscountPercent = 15; // Giảm 15% cho fan của KOC
      account.commissionPercentLifetime = 40; // 40% trọn đời
      account.commissionPercentYearly = 35; // 35% theo năm
      account.commissionPercentMonthly = 20; // 20% định kỳ
      if (channelInfo) account.channelInfo = channelInfo;

      if (preferredCode) {
        const clean = preferredCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (clean.length >= 3 && clean.length <= 15) {
          const currentOwner = db.codeToUserId[clean];
          if (!currentOwner || currentOwner === userId) {
            delete db.codeToUserId[account.affiliateCode];
            account.affiliateCode = clean;
            db.codeToUserId[clean] = userId;
          }
        }
      }

      saveDb(db);
      return NextResponse.json({ success: true, account });
    }

    // 3. Tùy chỉnh mã Voucher riêng
    if (action === 'custom_code') {
      const { userId, customCode } = body;
      if (!userId || !customCode) return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });

      const clean = customCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (clean.length < 3 || clean.length > 15) {
        return NextResponse.json({ error: 'Mã voucher phải từ 3 đến 15 ký tự chữ và số' }, { status: 400 });
      }

      const existingOwner = db.codeToUserId[clean];
      if (existingOwner && existingOwner !== userId) {
        return NextResponse.json({ error: 'Mã voucher này đã có người sử dụng. Vui lòng chọn mã khác!' }, { status: 409 });
      }

      const account = db.accounts[userId];
      if (!account) return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });

      delete db.codeToUserId[account.affiliateCode];
      account.affiliateCode = clean;
      db.codeToUserId[clean] = userId;
      saveDb(db);

      return NextResponse.json({ success: true, affiliateCode: clean });
    }

    // 4. Rút tiền về Ngân Hàng hoặc Đổi VIP Family 3 Tháng
    if (action === 'payout') {
      const { userId, type, bankName, accountNumber, accountHolder, amountVnd } = body;
      const account = db.accounts[userId];
      if (!account) return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });

      if (type === 'CONVERT_FAMILY_VIP') {
        const payout: PayoutRequest = {
          id: `pay_${Date.now()}`,
          userId,
          amountVnd: 0,
          type: 'CONVERT_FAMILY_VIP',
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
        };
        db.payoutRequests.unshift(payout);
        saveDb(db);
        return NextResponse.json({
          success: true,
          message: 'Chúc mừng! Bạn đã nhận ưu đãi 3 tháng sử dụng bản Family bản quyền thành công.',
          payout,
        });
      }

      if (type === 'BANK_TRANSFER') {
        const withdrawAmount = Number(amountVnd || 0);
        if (withdrawAmount < 50000) {
          return NextResponse.json({ error: 'Số tiền rút tối thiểu là 50.000 VNĐ' }, { status: 400 });
        }
        if (account.currentBalanceVnd < withdrawAmount) {
          return NextResponse.json({ error: 'Số dư khả dụng không đủ để rút số tiền này' }, { status: 400 });
        }
        if (!bankName || !accountNumber || !accountHolder) {
          return NextResponse.json({ error: 'Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng' }, { status: 400 });
        }

        account.currentBalanceVnd -= withdrawAmount;
        account.payoutInfo = { bankName, accountNumber, accountHolder };

        const payout: PayoutRequest = {
          id: `pay_${Date.now()}`,
          userId,
          amountVnd: withdrawAmount,
          type: 'BANK_TRANSFER',
          bankName,
          accountNumber,
          accountHolder,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };

        db.payoutRequests.unshift(payout);
        saveDb(db);

        return NextResponse.json({
          success: true,
          message: 'Yêu cầu rút tiền đã được tạo thành công và sẽ được chuyển khoản trong vòng 24h làm việc.',
          currentBalanceVnd: account.currentBalanceVnd,
          payout,
        });
      }

      return NextResponse.json({ error: 'Hình thức rút tiền không hợp lệ' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    console.error('[Affiliate API Error]:', err);
    return NextResponse.json({ error: err.message || 'Lỗi xử lý server' }, { status: 500 });
  }
}
