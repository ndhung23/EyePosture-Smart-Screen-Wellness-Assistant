import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (url && key) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

export interface DbUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  salt: string;
  role: string;
  is_blocked: boolean;
  created_at?: string;
  updated_at?: string;
}

import { SubscriptionTier, SubscriptionStatus } from '@eyeposture/shared-types';

export interface DbSubscription {
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expires_at: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbOrder {
  order_code: string;
  user_id: string;
  tier: 'PRO' | 'FAMILY';
  interval: 'month' | 'year' | 'lifetime';
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  created_at?: string;
  paid_at?: string | null;
}

export interface DbDevice {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string;
  os: string;
  app_version: string;
  status: string;
  is_blocked: boolean;
  last_active_at?: string;
  created_at?: string;
}

export class SupabaseService {
  private client: SupabaseClient | null;

  constructor() {
    this.client = getSupabaseClient();
  }

  public isAvailable(): boolean {
    return this.client !== null;
  }

  // --- Users ---
  async findUserByEmail(email: string): Promise<DbUser | null> {
    if (!this.client) return null;
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .ilike('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error || !data) return null;
    return data as DbUser;
  }

  async findUserById(id: string): Promise<DbUser | null> {
    if (!this.client) return null;
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return data as DbUser;
  }

  async createUser(user: Omit<DbUser, 'created_at' | 'updated_at'>): Promise<DbUser | null> {
    if (!this.client) return null;
    const { data, error } = await this.client
      .from('users')
      .insert({
        id: user.id,
        email: user.email.toLowerCase(),
        name: user.name,
        password_hash: user.password_hash,
        salt: user.salt,
        role: user.role || 'USER',
        is_blocked: Boolean(user.is_blocked),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase createUser error:', error);
      return null;
    }
    return data as DbUser;
  }

  // --- Subscriptions ---
  async getSubscription(userId: string): Promise<DbSubscription | null> {
    if (!this.client) return null;
    const { data, error } = await this.client
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as DbSubscription;
  }

  async upsertSubscription(
    userId: string,
    tier: SubscriptionTier,
    status: SubscriptionStatus,
    expiresAt: number
  ): Promise<DbSubscription | null> {
    if (!this.client) return null;
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from('subscriptions')
      .upsert({
        user_id: userId,
        tier,
        status,
        expires_at: expiresAt,
        updated_at: now,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase upsertSubscription error:', error);
      return null;
    }
    return data as DbSubscription;
  }

  // --- Orders ---
  async createOrder(order: Omit<DbOrder, 'created_at' | 'paid_at'>): Promise<DbOrder | null> {
    if (!this.client) return null;
    const { data, error } = await this.client
      .from('orders')
      .insert({
        order_code: order.order_code,
        user_id: order.user_id,
        tier: order.tier,
        interval: order.interval,
        amount: order.amount,
        status: order.status || 'PENDING',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase createOrder error:', error);
      return null;
    }
    return data as DbOrder;
  }

  async getOrderByCode(orderCode: string): Promise<DbOrder | null> {
    if (!this.client) return null;
    const { data, error } = await this.client
      .from('orders')
      .select('*')
      .eq('order_code', orderCode)
      .maybeSingle();

    if (error || !data) return null;
    return data as DbOrder;
  }

  async markOrderPaid(orderCode: string): Promise<DbOrder | null> {
    if (!this.client) return null;
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from('orders')
      .update({
        status: 'PAID',
        paid_at: now,
      })
      .eq('order_code', orderCode)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase markOrderPaid error:', error);
      return null;
    }
    return data as DbOrder;
  }

  // --- Devices ---
  async getDeviceByFingerprint(fingerprint: string): Promise<DbDevice | null> {
    if (!this.client) return null;
    const { data, error } = await this.client
      .from('devices')
      .select('*')
      .eq('device_fingerprint', fingerprint)
      .maybeSingle();

    if (error || !data) return null;
    return data as DbDevice;
  }

  async getDevicesByUserId(userId: string): Promise<DbDevice[]> {
    if (!this.client) return [];
    const { data, error } = await this.client
      .from('devices')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data as DbDevice[];
  }

  async upsertDevice(device: Partial<DbDevice> & { device_fingerprint: string; user_id: string }): Promise<DbDevice | null> {
    if (!this.client) return null;
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from('devices')
      .upsert(
        {
          user_id: device.user_id,
          device_fingerprint: device.device_fingerprint,
          device_name: device.device_name || 'Desktop PC',
          os: device.os || 'Windows 11',
          app_version: device.app_version || '1.0.0',
          status: device.status || 'ACTIVE',
          is_blocked: Boolean(device.is_blocked),
          last_active_at: now,
        },
        { onConflict: 'user_id,device_fingerprint' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('Supabase upsertDevice error:', error);
      return null;
    }
    return data as DbDevice;
  }

  async deleteDevice(deviceId: string, userId: string): Promise<boolean> {
    if (!this.client) return false;
    const { error } = await this.client
      .from('devices')
      .delete()
      .eq('id', deviceId)
      .eq('user_id', userId);

    return !error;
  }
}
