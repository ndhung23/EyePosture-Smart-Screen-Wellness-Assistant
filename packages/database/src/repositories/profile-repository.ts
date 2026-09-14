import { IDatabaseDriver } from '../driver/interface.js';
import { Profile } from '@eyeposture/shared-types';

export class ProfileRepository {
  private driver: IDatabaseDriver;

  constructor(driver: IDatabaseDriver) {
    this.driver = driver;
  }

  public create(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Profile {
    const id = profile.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const isDefault = profile.isDefault ? 1 : 0;
    const isChild = profile.isChild ? 1 : 0;

    if (isDefault) {
      this.driver.run('UPDATE profiles SET is_default = 0');
    }

    this.driver.run(
      `INSERT INTO profiles (id, user_id, name, avatar_url, is_child, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, profile.userId || null, profile.name, profile.avatarUrl || null, isChild, isDefault, now, now]
    );

    return {
      id,
      userId: profile.userId,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      isChild: profile.isChild,
      isDefault: profile.isDefault,
      createdAt: now,
      updatedAt: now,
    };
  }

  public findById(id: string): Profile | undefined {
    const row = this.driver.get<{
      id: string;
      user_id: string | null;
      name: string;
      avatar_url: string | null;
      is_child: number;
      is_default: number;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM profiles WHERE id = ?', [id]);

    if (!row) return undefined;

    return {
      id: row.id,
      userId: row.user_id || undefined,
      name: row.name,
      avatarUrl: row.avatar_url || undefined,
      isChild: Boolean(row.is_child),
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public findAll(): Profile[] {
    const rows = this.driver.all<{
      id: string;
      user_id: string | null;
      name: string;
      avatar_url: string | null;
      is_child: number;
      is_default: number;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM profiles ORDER BY is_default DESC, created_at ASC');

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id || undefined,
      name: row.name,
      avatarUrl: row.avatar_url || undefined,
      isChild: Boolean(row.is_child),
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  public getDefault(): Profile | undefined {
    const row = this.driver.get<{
      id: string;
      user_id: string | null;
      name: string;
      avatar_url: string | null;
      is_child: number;
      is_default: number;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM profiles WHERE is_default = 1 LIMIT 1');

    if (!row) return undefined;
    return {
      id: row.id,
      userId: row.user_id || undefined,
      name: row.name,
      avatarUrl: row.avatar_url || undefined,
      isChild: Boolean(row.is_child),
      isDefault: true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public setDefault(id: string): void {
    this.driver.run('UPDATE profiles SET is_default = 0');
    this.driver.run('UPDATE profiles SET is_default = 1, updated_at = ? WHERE id = ?', [
      new Date().toISOString(),
      id,
    ]);
  }

  public update(id: string, updates: Partial<Profile>): void {
    const now = new Date().toISOString();
    if (updates.isDefault) {
      this.driver.run('UPDATE profiles SET is_default = 0');
    }
    const current = this.findById(id);
    if (!current) return;

    this.driver.run(
      `UPDATE profiles 
       SET name = ?, avatar_url = ?, is_child = ?, is_default = ?, updated_at = ? 
       WHERE id = ?`,
      [
        updates.name ?? current.name,
        updates.avatarUrl !== undefined ? updates.avatarUrl : current.avatarUrl,
        updates.isChild !== undefined ? (updates.isChild ? 1 : 0) : current.isChild ? 1 : 0,
        updates.isDefault !== undefined ? (updates.isDefault ? 1 : 0) : current.isDefault ? 1 : 0,
        now,
        id,
      ]
    );
  }

  public delete(id: string): void {
    this.driver.run('DELETE FROM profiles WHERE id = ?', [id]);
  }
}
