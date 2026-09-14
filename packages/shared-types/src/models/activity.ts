export type AppCategory = 
  | 'PRODUCTIVITY'
  | 'DEVELOPMENT'
  | 'BROWSING'
  | 'GAMING'
  | 'MEDIA'
  | 'COMMUNICATION'
  | 'OTHER';

export interface ActiveAppInfo {
  processName: string;
  windowTitle: string;
  category: AppCategory;
  isFullScreen: boolean;
  timestamp: number;
}

export interface AppUsageSummary {
  processName: string;
  category: AppCategory;
  totalDurationSeconds: number;
  percentageOfTotal: number;
}

export interface ScreenSession {
  id: string;
  profileId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  idleDurationSeconds: number;
}
