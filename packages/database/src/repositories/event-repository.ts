import { IDatabaseDriver } from '../driver/interface.js';

export interface PostureEventRecord {
  id?: string;
  profileId: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  severity: string;
  averageScore: number;
}

export interface DistanceEventRecord {
  id?: string;
  profileId: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  minDistanceRatio: number;
}

export interface BreakSessionRecord {
  id?: string;
  profileId: string;
  sessionType: string;
  targetDurationSec: number;
  actualDurationSec: number;
  completed: boolean;
  skipped: boolean;
  timestamp: number;
}

export class EventRepository {
  private driver: IDatabaseDriver;

  constructor(driver: IDatabaseDriver) {
    this.driver = driver;
  }

  public logPostureEvent(record: PostureEventRecord): string {
    const id = record.id || crypto.randomUUID();
    const now = new Date().toISOString();
    this.driver.run(
      `INSERT INTO posture_events (
        id, profile_id, start_time, end_time, duration_seconds, severity, average_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        record.profileId,
        record.startTime,
        record.endTime,
        record.durationSeconds,
        record.severity,
        record.averageScore,
        now,
      ]
    );
    return id;
  }

  public logDistanceEvent(record: DistanceEventRecord): string {
    const id = record.id || crypto.randomUUID();
    const now = new Date().toISOString();
    this.driver.run(
      `INSERT INTO distance_events (
        id, profile_id, start_time, end_time, duration_seconds, min_distance_ratio, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        record.profileId,
        record.startTime,
        record.endTime,
        record.durationSeconds,
        record.minDistanceRatio,
        now,
      ]
    );
    return id;
  }

  public logBreakSession(record: BreakSessionRecord): string {
    const id = record.id || crypto.randomUUID();
    this.driver.run(
      `INSERT INTO break_sessions (
        id, profile_id, session_type, target_duration_sec, actual_duration_sec, completed, skipped, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        record.profileId,
        record.sessionType,
        record.targetDurationSec,
        record.actualDurationSec,
        record.completed ? 1 : 0,
        record.skipped ? 1 : 0,
        record.timestamp,
      ]
    );
    return id;
  }

  public logHydration(profileId: string, glasses: number = 1): void {
    const id = crypto.randomUUID();
    this.driver.run(
      `INSERT INTO hydration_events (id, profile_id, glasses_drank, timestamp)
       VALUES (?, ?, ?, ?)`,
      [id, profileId, glasses, Date.now()]
    );
  }

  public getEventsCountForDay(profileId: string, dayStartMs: number, dayEndMs: number): {
    postureCount: number;
    distanceCount: number;
    breaksCompleted: number;
    breaksSkipped: number;
    hydrationGlasses: number;
  } {
    const postureRow = this.driver.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM posture_events 
       WHERE profile_id = ? AND start_time >= ? AND end_time <= ?`,
      [profileId, dayStartMs, dayEndMs]
    );

    const distanceRow = this.driver.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM distance_events 
       WHERE profile_id = ? AND start_time >= ? AND end_time <= ?`,
      [profileId, dayStartMs, dayEndMs]
    );

    const breakRows = this.driver.all<{ completed: number; skipped: number }>(
      `SELECT completed, skipped FROM break_sessions 
       WHERE profile_id = ? AND timestamp >= ? AND timestamp <= ?`,
      [profileId, dayStartMs, dayEndMs]
    );

    const hydrationRow = this.driver.get<{ total: number }>(
      `SELECT COALESCE(SUM(glasses_drank), 0) as total FROM hydration_events 
       WHERE profile_id = ? AND timestamp >= ? AND timestamp <= ?`,
      [profileId, dayStartMs, dayEndMs]
    );

    const breaksCompleted = breakRows.filter((b) => b.completed === 1).length;
    const breaksSkipped = breakRows.filter((b) => b.skipped === 1).length;

    return {
      postureCount: postureRow?.count ?? 0,
      distanceCount: distanceRow?.count ?? 0,
      breaksCompleted,
      breaksSkipped,
      hydrationGlasses: hydrationRow?.total ?? 0,
    };
  }

  public purgeOldEvents(retentionDays: number): { deletedPosture: number; deletedDistance: number } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffIso = cutoffDate.toISOString();

    const postureRes = this.driver.run('DELETE FROM posture_events WHERE created_at < ?', [cutoffIso]);
    const distanceRes = this.driver.run('DELETE FROM distance_events WHERE created_at < ?', [cutoffIso]);

    return {
      deletedPosture: postureRes.changes,
      deletedDistance: distanceRes.changes,
    };
  }
}
