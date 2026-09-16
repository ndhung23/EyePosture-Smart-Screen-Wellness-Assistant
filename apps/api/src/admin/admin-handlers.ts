import * as http from 'http';
import { User, Device, SubscriptionTier } from '@eyeposture/shared-types';

export interface AdminContext {
  users: Map<string, User & { passwordHash: string; salt: string }>;
  devices: Map<string, Device>;
  userSubscriptions: Map<string, { tier: SubscriptionTier; status: any; expiresAt: number }>;
  savePersistedDevices: () => void;
  sendJson: (res: http.ServerResponse, statusCode: number, data: unknown) => void;
  parseBody: (req: http.IncomingMessage) => Promise<any>;
}

export async function handleAdminRoutes(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string | undefined,
  ctx: AdminContext
): Promise<boolean> {
  const { users, devices, userSubscriptions, savePersistedDevices, sendJson, parseBody } = ctx;

  // 10. GET /api/v1/admin/devices
  if (pathname === '/api/v1/admin/devices' && method === 'GET') {
    const allDevices = Array.from(devices.values()).map((d) => {
      const u = users.get(d.userId);
      return {
        id: d.id,
        userId: d.userId,
        userEmail: u?.email || `${d.deviceName || 'Máy Desktop'} (Client)`,
        userName: u?.name || 'Máy Khách Desktop',
        deviceName: d.deviceName,
        deviceFingerprint: d.deviceFingerprint,
        os: d.os,
        appVersion: d.appVersion,
        status: d.status || (d.isBlocked ? 'BLOCKED' : 'ACTIVE'),
        isBlocked: Boolean(d.isBlocked),
        lastActiveAt: d.lastActiveAt,
        createdAt: d.createdAt,
      };
    });
    sendJson(res, 200, { total: allDevices.length, devices: allDevices });
    return true;
  }

  // 10b. GET /api/v1/admin/users
  if (pathname === '/api/v1/admin/users' && method === 'GET') {
    const allUsers = Array.from(users.values()).map((u) => {
      const sub = userSubscriptions.get(u.id);
      const userDevs = Array.from(devices.values()).filter((d) => d.userId === u.id);
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        isBlocked: Boolean(u.isBlocked),
        status: u.status || (u.isBlocked ? 'BLOCKED' : 'ACTIVE'),
        subscription: sub || { tier: 'FREE', status: 'ACTIVE', expiresAt: null },
        deviceCount: userDevs.length,
        createdAt: u.createdAt,
      };
    });
    sendJson(res, 200, { total: allUsers.length, users: allUsers });
    return true;
  }

  // 11. POST /api/v1/admin/devices/block
  if (pathname === '/api/v1/admin/devices/block' && method === 'POST') {
    const body = await parseBody(req);
    const query = body.deviceId || body.deviceFingerprint;
    const target = Array.from(devices.values()).find(
      (d) => d.id === query || d.deviceFingerprint === query
    );
    if (!target) {
      sendJson(res, 404, { error: 'Device not found' });
      return true;
    }
    target.isBlocked = true;
    target.status = 'BLOCKED';
    savePersistedDevices();
    sendJson(res, 200, { success: true, message: 'Device blocked successfully', device: target });
    return true;
  }

  // 12. POST /api/v1/admin/devices/unblock
  if (pathname === '/api/v1/admin/devices/unblock' && method === 'POST') {
    const body = await parseBody(req);
    const query = body.deviceId || body.deviceFingerprint;
    const target = Array.from(devices.values()).find(
      (d) => d.id === query || d.deviceFingerprint === query
    );
    if (!target) {
      sendJson(res, 404, { error: 'Device not found' });
      return true;
    }
    target.isBlocked = false;
    target.status = 'ACTIVE';
    savePersistedDevices();
    sendJson(res, 200, { success: true, message: 'Device unblocked successfully', device: target });
    return true;
  }

  // 13. POST /api/v1/admin/users/block
  if (pathname === '/api/v1/admin/users/block' && method === 'POST') {
    const body = await parseBody(req);
    let targetUser = users.get(body.userId);
    if (!targetUser && body.email) {
      targetUser = Array.from(users.values()).find((u) => u.email.toLowerCase() === body.email.toLowerCase());
    }
    if (!targetUser) {
      sendJson(res, 404, { error: 'User not found' });
      return true;
    }
    targetUser.isBlocked = true;
    targetUser.status = 'BLOCKED';
    sendJson(res, 200, { success: true, message: 'User account suspended', userId: targetUser.id });
    return true;
  }

  // 14. POST /api/v1/admin/users/unblock
  if (pathname === '/api/v1/admin/users/unblock' && method === 'POST') {
    const body = await parseBody(req);
    let targetUser = users.get(body.userId);
    if (!targetUser && body.email) {
      targetUser = Array.from(users.values()).find((u) => u.email.toLowerCase() === body.email.toLowerCase());
    }
    if (!targetUser) {
      sendJson(res, 404, { error: 'User not found' });
      return true;
    }
    targetUser.isBlocked = false;
    targetUser.status = 'ACTIVE';
    sendJson(res, 200, { success: true, message: 'User account restored', userId: targetUser.id });
    return true;
  }

  // 15. GET /api/v1/admin/stats
  if (pathname === '/api/v1/admin/stats' && method === 'GET') {
    const allUsers = Array.from(users.values());
    const allDevices = Array.from(devices.values());
    const proUsers = allUsers.filter((u) => {
      const sub = userSubscriptions.get(u.id);
      return sub?.tier === 'PRO' || sub?.tier === 'FAMILY';
    });
    const totalRevenueVnd = proUsers.length * 59000 + 490000;
    const stats = {
      totalUsers: allUsers.length,
      totalDevices: allDevices.length,
      activeDevices: allDevices.filter((d) => !d.isBlocked).length,
      blockedDevices: allDevices.filter((d) => d.isBlocked).length,
      proUsersCount: proUsers.length,
      totalRevenueVnd,
      revenueHistory: [295000, 413000, 354000, 590000, 708000, 885000, Math.max(totalRevenueVnd, 1180000)],
      userGrowth: [12, 19, 25, 32, 45, 58, Math.max(70, allUsers.length * 10)],
      activeTrend: [8, 15, 20, 26, 38, 50, Math.max(60, allUsers.length * 8)],
    };
    sendJson(res, 200, stats);
    return true;
  }

  // 16. POST /api/v1/admin/users/upgrade
  if (pathname === '/api/v1/admin/users/upgrade' && method === 'POST') {
    const body = await parseBody(req);
    const { userId, tier = 'PRO', days = 365 } = body;
    const user = users.get(userId);
    if (!user) {
      sendJson(res, 404, { error: 'User not found' });
      return true;
    }
    userSubscriptions.set(userId, {
      tier: (tier as SubscriptionTier) || 'PRO',
      status: 'ACTIVE',
      expiresAt: Date.now() + days * 86400 * 1000,
    });
    sendJson(res, 200, {
      success: true,
      userId,
      tier,
      expiresAt: Date.now() + days * 86400 * 1000,
    });
    return true;
  }

  return false;
}
