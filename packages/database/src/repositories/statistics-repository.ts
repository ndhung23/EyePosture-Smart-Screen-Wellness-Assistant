import { IDatabaseDriver } from '../driver/interface.js';
import { DailyStatistics, WeeklyStatistics } from '@eyeposture/shared-types';

export class StatisticsRepository {
  private driver: IDatabaseDriver;

  constructor(driver: IDatabaseDriver) {
    this.driver = driver;
  }

  /**
   * Computes Screen Wellness Score (0 - 100) based on habit metrics:
   * Base: 100 points
   * Deduct 2 pts per posture warning (max 30 pts)
   * Deduct 3 pts per distance warning (max 30 pts)
   * Deduct 10 pts per skipped break
   * Bonus 5 pts per completed break (up to max 100)
   * Bonus 2 pts per water glass (up to max 100)
   */
  public calculateScreenWellnessScore(
    postureWarnings: number,
    distanceWarnings: number,
    breaksCompleted: number,
    breaksSkipped: number,
    hydrationGlasses: number
  ): number {
    let score = 100;
    score -= Math.min(30, postureWarnings * 2);
    score -= Math.min(30, distanceWarnings * 3);
    score -= breaksSkipped * 10;
    score += Math.min(15, breaksCompleted * 5);
    score += Math.min(10, hydrationGlasses * 2);
    return Math.max(10, Math.min(100, Math.round(score)));
  }

  public upsertDailyStats(stats: DailyStatistics): void {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    this.driver.run(
      `INSERT INTO daily_statistics (
        id, profile_id, date, screen_time_min, posture_warnings, distance_warnings,
        breaks_completed, breaks_skipped, hydration_glasses, wellness_score, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(profile_id, date) DO UPDATE SET
        screen_time_min = excluded.screen_time_min,
        posture_warnings = excluded.posture_warnings,
        distance_warnings = excluded.distance_warnings,
        breaks_completed = excluded.breaks_completed,
        breaks_skipped = excluded.breaks_skipped,
        hydration_glasses = excluded.hydration_glasses,
        wellness_score = excluded.wellness_score,
        updated_at = excluded.updated_at`,
      [
        id,
        stats.profileId,
        stats.date,
        stats.totalScreenTimeMinutes,
        stats.postureWarningsCount,
        stats.distanceWarningsCount,
        stats.eyeBreaksCompleted,
        stats.eyeBreaksSkipped,
        stats.waterGlassesDrank,
        stats.wellnessScore,
        now,
      ]
    );
  }

  public getDailyStats(profileId: string, date: string): DailyStatistics {
    const row = this.driver.get<{
      date: string;
      profile_id: string;
      screen_time_min: number;
      posture_warnings: number;
      distance_warnings: number;
      breaks_completed: number;
      breaks_skipped: number;
      hydration_glasses: number;
      wellness_score: number;
    }>('SELECT * FROM daily_statistics WHERE profile_id = ? AND date = ?', [profileId, date]);

    if (!row) {
      return {
        date,
        profileId,
        totalScreenTimeMinutes: 0,
        postureWarningsCount: 0,
        distanceWarningsCount: 0,
        eyeBreaksCompleted: 0,
        eyeBreaksSkipped: 0,
        waterGlassesDrank: 0,
        wellnessScore: 100,
      };
    }

    return {
      date: row.date,
      profileId: row.profile_id,
      totalScreenTimeMinutes: row.screen_time_min,
      postureWarningsCount: row.posture_warnings,
      distanceWarningsCount: row.distance_warnings,
      eyeBreaksCompleted: row.breaks_completed,
      eyeBreaksSkipped: row.breaks_skipped,
      waterGlassesDrank: row.hydration_glasses,
      wellnessScore: row.wellness_score,
    };
  }

  public getWeeklyStats(profileId: string, startDate: string, endDate: string): WeeklyStatistics {
    const rows = this.driver.all<{
      date: string;
      profile_id: string;
      screen_time_min: number;
      posture_warnings: number;
      distance_warnings: number;
      breaks_completed: number;
      breaks_skipped: number;
      hydration_glasses: number;
      wellness_score: number;
    }>(
      `SELECT * FROM daily_statistics 
       WHERE profile_id = ? AND date >= ? AND date <= ? 
       ORDER BY date ASC`,
      [profileId, startDate, endDate]
    );

    const dailyBreakdown: DailyStatistics[] = rows.map((r) => ({
      date: r.date,
      profileId: r.profile_id,
      totalScreenTimeMinutes: r.screen_time_min,
      postureWarningsCount: r.posture_warnings,
      distanceWarningsCount: r.distance_warnings,
      eyeBreaksCompleted: r.breaks_completed,
      eyeBreaksSkipped: r.breaks_skipped,
      waterGlassesDrank: r.hydration_glasses,
      wellnessScore: r.wellness_score,
    }));

    const totalDays = Math.max(1, dailyBreakdown.length);
    const avgScreenTime = Math.round(
      dailyBreakdown.reduce((sum, d) => sum + d.totalScreenTimeMinutes, 0) / totalDays
    );
    const avgScore = Math.round(
      dailyBreakdown.reduce((sum, d) => sum + d.wellnessScore, 0) / totalDays
    );
    const totalPosture = dailyBreakdown.reduce((sum, d) => sum + d.postureWarningsCount, 0);
    const totalDistance = dailyBreakdown.reduce((sum, d) => sum + d.distanceWarningsCount, 0);
    const totalBreaks = dailyBreakdown.reduce(
      (sum, d) => sum + d.eyeBreaksCompleted + d.eyeBreaksSkipped,
      0
    );
    const completedBreaks = dailyBreakdown.reduce((sum, d) => sum + d.eyeBreaksCompleted, 0);
    const complianceRate = totalBreaks > 0 ? Math.round((completedBreaks / totalBreaks) * 100) : 100;

    return {
      startDate,
      endDate,
      averageScreenTimeMinutes: avgScreenTime,
      averageWellnessScore: avgScore,
      totalPostureWarnings: totalPosture,
      totalDistanceWarnings: totalDistance,
      breakComplianceRate: complianceRate,
      dailyBreakdown,
    };
  }
}
