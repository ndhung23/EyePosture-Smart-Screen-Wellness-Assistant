import { IDatabaseDriver } from '../driver/interface.js';
import { SubscriptionTier } from '@eyeposture/shared-types';

export interface CachedLicenseRecord {
  id: string;
  token: string;
  signature: string;
  expiresAt: number;
  tier: SubscriptionTier;
  features: string[];
  updatedAt: string;
}

export class LicenseRepository {
  private driver: IDatabaseDriver;

  constructor(driver: IDatabaseDriver) {
    this.driver = driver;
  }

  public saveCachedLicense(
    token: string,
    signature: string,
    expiresAt: number,
    tier: SubscriptionTier,
    features: string[]
  ): void {
    const id = 'active_license';
    const now = new Date().toISOString();
    const featuresJson = JSON.stringify(features);

    this.driver.run('DELETE FROM license_cache');
    this.driver.run(
      `INSERT INTO license_cache (id, token, signature, expires_at, tier, features_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, token, signature, expiresAt, tier, featuresJson, now]
    );
  }

  public getCachedLicense(): CachedLicenseRecord | undefined {
    const row = this.driver.get<{
      id: string;
      token: string;
      signature: string;
      expires_at: number;
      tier: string;
      features_json: string;
      updated_at: string;
    }>('SELECT * FROM license_cache LIMIT 1');

    if (!row) return undefined;

    let features: string[] = [];
    try {
      features = JSON.parse(row.features_json);
    } catch {
      features = [];
    }

    return {
      id: row.id,
      token: row.token,
      signature: row.signature,
      expiresAt: row.expires_at,
      tier: row.tier as SubscriptionTier,
      features,
      updatedAt: row.updated_at,
    };
  }

  public clearCachedLicense(): void {
    this.driver.run('DELETE FROM license_cache');
  }
}
