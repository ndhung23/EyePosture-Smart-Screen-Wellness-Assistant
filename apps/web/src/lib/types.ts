export type SubscriptionTier = 'FREE' | 'PRO' | 'FAMILY';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  isBlocked: boolean;
  status: 'ACTIVE' | 'BLOCKED';
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    expiresAt: number | null;
  };
  deviceCount?: number;
  createdAt?: string;
}

export interface DeviceItem {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  deviceName: string;
  deviceFingerprint: string;
  os: string;
  appVersion: string;
  status: 'ACTIVE' | 'BLOCKED';
  isBlocked: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export interface VoucherItem {
  id: string;
  code: string;
  discountPercent: number;
  expiresAt: number;
  isActive: boolean;
  createdAt: number;
  usageCount: number;
  maxUsage?: number | null;
}
