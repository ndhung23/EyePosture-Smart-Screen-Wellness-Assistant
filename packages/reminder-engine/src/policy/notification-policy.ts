import {
  ReminderType,
  ReminderPriority,
  NotificationSettings,
  ActiveAppInfo,
} from '@eyeposture/shared-types';

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason?: string;
  adjustedPriority?: ReminderPriority;
}

export class NotificationPolicyEngine {
  private settings: NotificationSettings;
  private recentNotificationTimestamps: Map<ReminderType, number[]> = new Map();
  private lastDeliveredAt: Map<ReminderType, number> = new Map();

  constructor(settings: NotificationSettings) {
    this.settings = settings;
  }

  public updateSettings(settings: NotificationSettings): void {
    this.settings = settings;
  }

  /**
   * Checks if current local time is within quiet hours
   */
  public isQuietHours(now: Date = new Date()): boolean {
    if (!this.settings.quietHoursEnabled) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = this.settings.quietHoursStart.split(':').map(Number);
    const [endH, endM] = this.settings.quietHoursEnd.split(':').map(Number);

    const startMinutes = (startH || 0) * 60 + (startM || 0);
    const endMinutes = (endH || 0) * 60 + (endM || 0);

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Overnight span (e.g. 22:00 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }

  /**
   * Evaluates whether a notification is allowed to fire
   */
  public evaluate(
    type: ReminderType,
    requestedPriority: ReminderPriority = 'NORMAL',
    activeApp?: ActiveAppInfo,
    now: number = Date.now()
  ): PolicyEvaluationResult {
    // 1. Quiet hours suppression
    if (this.isQuietHours(new Date(now))) {
      return { allowed: false, reason: 'Quiet hours active' };
    }

    // 2. Fullscreen suppression (e.g. movies, games, presentations)
    if (this.settings.suppressInFullscreen && activeApp?.isFullScreen) {
      // Urgent alerts (like daily screen time exceeded) can downgrade, but posture/distance are suppressed
      if (type === 'POSTURE' || type === 'DISTANCE') {
        return { allowed: false, reason: 'Fullscreen application active' };
      }
    }

    // 3. Cooldown & Anti-Fatigue Backoff:
    // If >= 3 alerts of this type happened within last 5 minutes, enforce an extended cooldown
    const timestamps = this.recentNotificationTimestamps.get(type) ?? [];
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const recentInWindow = timestamps.filter((t) => t >= fiveMinutesAgo);

    if (recentInWindow.length >= 3) {
      // Require at least 2 minutes between subsequent notifications to avoid fatigue
      const lastDelivered = this.lastDeliveredAt.get(type) ?? 0;
      if (now - lastDelivered < 2 * 60 * 1000) {
        return { allowed: false, reason: 'Anti-fatigue backoff active (3+ alerts in 5 mins)' };
      }
    }

    return { allowed: true, adjustedPriority: requestedPriority };
  }

  public recordDelivery(type: ReminderType, now: number = Date.now()): void {
    const timestamps = this.recentNotificationTimestamps.get(type) ?? [];
    timestamps.push(now);

    // Keep timestamps trimmed to last 15 minutes
    const cutoff = now - 15 * 60 * 1000;
    const trimmed = timestamps.filter((t) => t >= cutoff);
    this.recentNotificationTimestamps.set(type, trimmed);
    this.lastDeliveredAt.set(type, now);
  }

  public resetHistory(type?: ReminderType): void {
    if (type) {
      this.recentNotificationTimestamps.delete(type);
      this.lastDeliveredAt.delete(type);
    } else {
      this.recentNotificationTimestamps.clear();
      this.lastDeliveredAt.clear();
    }
  }
}
