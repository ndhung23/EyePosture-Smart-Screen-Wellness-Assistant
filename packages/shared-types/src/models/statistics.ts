export interface DailyStatistics {
  date: string; // YYYY-MM-DD
  profileId: string;
  totalScreenTimeMinutes: number;
  postureWarningsCount: number;
  distanceWarningsCount: number;
  eyeBreaksCompleted: number;
  eyeBreaksSkipped: number;
  waterGlassesDrank: number;
  wellnessScore: number; // 0 - 100 Screen Wellness Score
}

export interface WeeklyStatistics {
  startDate: string;
  endDate: string;
  averageScreenTimeMinutes: number;
  averageWellnessScore: number;
  totalPostureWarnings: number;
  totalDistanceWarnings: number;
  breakComplianceRate: number; // 0 to 100%
  dailyBreakdown: DailyStatistics[];
}

export interface AggregatedTrends {
  wellnessScoreTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  averageDailyScreenHours: number;
  bestDay: string;
  postureImprovementPercent: number;
}
