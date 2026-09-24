import * as http from 'http';
import { VoucherService } from './voucher-service.js';

export interface VoucherHandlerContext {
  sendJson: (res: http.ServerResponse, statusCode: number, data: unknown) => void;
  parseBody: (req: http.IncomingMessage) => Promise<any>;
}

export async function handleVoucherRoutes(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string | undefined,
  ctx: VoucherHandlerContext
): Promise<boolean> {
  const { sendJson, parseBody } = ctx;

  // 1. GET /api/v1/admin/vouchers - Get all vouchers
  if (pathname === '/api/v1/admin/vouchers' && method === 'GET') {
    const vouchers = VoucherService.getAll();
    sendJson(res, 200, { total: vouchers.length, vouchers });
    return true;
  }

  // 2. POST /api/v1/admin/vouchers - Create a new voucher
  if (pathname === '/api/v1/admin/vouchers' && method === 'POST') {
    const body = await parseBody(req);
    const result = VoucherService.create({
      code: body.code,
      discountPercent: Number(body.discountPercent),
      validUntil: body.validUntil,
      maxUses: body.maxUses !== undefined ? Number(body.maxUses) : 0,
      description: body.description,
    });

    if (!result.success) {
      sendJson(res, 400, { error: result.error });
      return true;
    }

    sendJson(res, 201, { success: true, voucher: result.voucher });
    return true;
  }

  // 3. POST /api/v1/admin/vouchers/toggle - Toggle voucher active status
  if (pathname === '/api/v1/admin/vouchers/toggle' && method === 'POST') {
    const body = await parseBody(req);
    const id = body.id || body.voucherId;
    if (!id) {
      sendJson(res, 400, { error: 'Thiếu voucher ID' });
      return true;
    }
    const result = VoucherService.toggle(id);
    if (!result.success) {
      sendJson(res, 404, { error: result.error });
      return true;
    }
    sendJson(res, 200, { success: true, voucher: result.voucher });
    return true;
  }

  // 4. POST /api/v1/admin/vouchers/delete - Delete voucher
  if ((pathname === '/api/v1/admin/vouchers/delete' || pathname.startsWith('/api/v1/admin/vouchers/')) && (method === 'POST' || method === 'DELETE')) {
    let id: string = '';
    if (pathname.startsWith('/api/v1/admin/vouchers/') && pathname !== '/api/v1/admin/vouchers/delete' && pathname !== '/api/v1/admin/vouchers/toggle') {
      id = pathname.replace('/api/v1/admin/vouchers/', '');
    } else {
      const body = await parseBody(req);
      id = body.id || body.voucherId;
    }

    if (!id) {
      sendJson(res, 400, { error: 'Thiếu voucher ID' });
      return true;
    }

    const deleted = VoucherService.delete(id);
    if (!deleted) {
      sendJson(res, 404, { error: 'Voucher không tồn tại' });
      return true;
    }
    sendJson(res, 200, { success: true, message: 'Đã xóa voucher' });
    return true;
  }

  // 5. POST /api/v1/vouchers/apply - Public check & apply voucher
  if (pathname === '/api/v1/vouchers/apply' && method === 'POST') {
    const body = await parseBody(req);
    const code = body.code || '';
    const originalAmount = Number(body.amount) || 49000;

    const result = VoucherService.apply(code, originalAmount);
    if (!result.valid) {
      sendJson(res, 400, result);
      return true;
    }

    sendJson(res, 200, result);
    return true;
  }

  return false;
}
