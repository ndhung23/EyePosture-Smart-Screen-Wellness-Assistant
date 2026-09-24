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

  async updateUserPassword(id: string, password_hash: string, salt: string): Promise<boolean> {
    if (!this.client) return false;
    const { error } = await this.client
      .from('users')
      .update({
        password_hash,
        salt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase updateUserPassword error:', error);
      return false;
    }
    return true;
  }

  async getAllUsers(): Promise<DbUser[]> {
    if (!this.client) return [];
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Supabase getAllUsers error:', error);
      return [];
    }
    return data as DbUser[];
  }

  async setUserBlocked(id: string, isBlocked: boolean): Promise<boolean> {
    if (!this.client) return false;
    const { error } = await this.client
      .from('users')
      .update({
        is_blocked: isBlocked,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase setUserBlocked error:', error);
      return false;
    }
    return true;
  }

  // --- Subscriptions ---
  async getAllSubscriptions(): Promise<DbSubscription[]> {
    if (!this.client) return [];
    const { data, error } = await this.client
      .from('subscriptions')
      .select('*');

    if (error || !data) {
      console.error('Supabase getAllSubscriptions error:', error);
      return [];
    }
    return data as DbSubscription[];
  }

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
  async getAllDevices(): Promise<DbDevice[]> {
    if (!this.client) return [];
    const { data, error } = await this.client
      .from('devices')
      .select('*')
      .order('last_active_at', { ascending: false });

    if (error || !data) {
      console.error('Supabase getAllDevices error:', error);
      return [];
    }
    return data as DbDevice[];
  }

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

  async upsertDevice(device: Partial<DbDevice> & { device_fingerprint: string; user_id?: string | null }): Promise<DbDevice | null> {
    if (!this.client) return null;
    const now = new Date().toISOString();

    // Validate UUID format to prevent PostgreSQL 22P02 error
    const isUuid = Boolean(
      device.user_id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(device.user_id)
    );
    const cleanUserId = isUuid ? device.user_id : null;

    try {
      const existing = await this.getDeviceByFingerprint(device.device_fingerprint);
      if (existing) {
        const updatePayload: Record<string, any> = {
          device_name: device.device_name || existing.device_name,
          os: device.os || existing.os,
          app_version: device.app_version || existing.app_version,
          status: device.status || existing.status,
          last_active_at: now,
        };
        if (device.is_blocked !== undefined) {
          updatePayload.is_blocked = Boolean(device.is_blocked);
        }
        if (cleanUserId) {
          updatePayload.user_id = cleanUserId;
        }

        const { data, error } = await this.client
          .from('devices')
          .update(updatePayload)
          .eq('id', existing.id)
          .select('*')
          .single();

        if (error) {
          console.error('Supabase updateDevice error:', error);
          return null;
        }
        return data as DbDevice;
      } else {
        const insertPayload: Record<string, any> = {
          device_fingerprint: device.device_fingerprint,
          device_name: device.device_name || 'Desktop PC',
          os: device.os || 'Windows 11',
          app_version: device.app_version || '1.0.0',
          status: device.status || 'ACTIVE',
          is_blocked: Boolean(device.is_blocked),
          last_active_at: now,
        };
        if (cleanUserId) {
          insertPayload.user_id = cleanUserId;
        }

        const { data, error } = await this.client
          .from('devices')
          .insert(insertPayload)
          .select('*')
          .single();

        if (error) {
          console.error('Supabase insertDevice error:', error);
          return null;
        }
        return data as DbDevice;
      }
    } catch (err) {
      console.error('Supabase upsertDevice catch error:', err);
      return null;
    }
  }

  async setDeviceBlocked(query: string, isBlocked: boolean): Promise<boolean> {
    if (!this.client) return false;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query);
    const filter = isUuid ? `id.eq.${query}` : `device_fingerprint.eq.${query}`;

    const { error } = await this.client
      .from('devices')
      .update({
        is_blocked: isBlocked,
        status: isBlocked ? 'BLOCKED' : 'ACTIVE',
      })
      .or(filter);

    if (error) {
      console.error('Supabase setDeviceBlocked error:', error);
      return false;
    }
    return true;
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
