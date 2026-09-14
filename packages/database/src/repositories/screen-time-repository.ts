import { IDatabaseDriver } from '../driver/interface.js';
import { AppUsageSummary, AppCategory } from '@eyeposture/shared-types';

export class ScreenTimeRepository {
  private driver: IDatabaseDriver;

  constructor(driver: IDatabaseDriver) {
    this.driver = driver;
  }

  public startSession(profileId: string): string {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    this.driver.run(
      `INSERT INTO screen_sessions (id, profile_id, started_at, duration_seconds, idle_duration_seconds)
       VALUES (?, ?, ?, 0, 0)`,
      [id, profileId, now]
    );
    return id;
  }

  public endSession(sessionId: string, durationSeconds: number, idleDurationSeconds: number): void {
    const now = new Date().toISOString();
    this.driver.run(
      `UPDATE screen_sessions 
       SET ended_at = ?, duration_seconds = ?, idle_duration_seconds = ? 
       WHERE id = ?`,
      [now, Math.max(0, durationSeconds), Math.max(0, idleDurationSeconds), sessionId]
    );
  }

  public recordAppUsage(
    profileId: string,
    date: string,
    processName: string,
    category: AppCategory,
    additionalSeconds: number
  ): void {
    const existing = this.driver.get<{ id: string; duration_seconds: number }>(
      `SELECT id, duration_seconds FROM application_usage 
       WHERE profile_id = ? AND date = ? AND process_name = ?`,
      [profileId, date, processName]
    );

    if (existing) {
      this.driver.run(
        `UPDATE application_usage 
         SET duration_seconds = duration_seconds + ? 
         WHERE id = ?`,
        [additionalSeconds, existing.id]
      );
    } else {
      const id = crypto.randomUUID();
      this.driver.run(
        `INSERT INTO application_usage (id, profile_id, date, process_name, category, duration_seconds)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, profileId, date, processName, category, additionalSeconds]
      );
    }
  }

  public getAppUsageForDate(profileId: string, date: string): AppUsageSummary[] {
    const rows = this.driver.all<{
      process_name: string;
      category: string;
      duration_seconds: number;
    }>(
      `SELECT process_name, category, duration_seconds 
       FROM application_usage 
       WHERE profile_id = ? AND date = ? 
       ORDER BY duration_seconds DESC`,
      [profileId, date]
    );

    const totalDuration = rows.reduce((acc, r) => acc + r.duration_seconds, 0);

    return rows.map((r) => ({
      processName: r.process_name,
      category: r.category as AppCategory,
      totalDurationSeconds: r.duration_seconds,
      percentageOfTotal: totalDuration > 0 ? Math.round((r.duration_seconds / totalDuration) * 100) : 0,
    }));
  }

  public getDailyScreenTimeMinutes(profileId: string, date: string): number {
    const row = this.driver.get<{ total_seconds: number }>(
      `SELECT COALESCE(SUM(duration_seconds), 0) as total_seconds 
       FROM application_usage 
       WHERE profile_id = ? AND date = ?`,
      [profileId, date]
    );
    return Math.round((row?.total_seconds ?? 0) / 60);
  }
}
