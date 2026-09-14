export interface HydrationTimerOptions {
  intervalMinutes: number; // e.g. 45
  dailyGoalGlasses: number; // e.g. 8
}

export class HydrationTimer {
  private intervalMinutes: number;
  private dailyGoalGlasses: number;
  private elapsedSeconds: number = 0;
  private glassesToday: number = 0;
  private isPaused: boolean = false;

  constructor(options: Partial<HydrationTimerOptions> = {}) {
    this.intervalMinutes = options.intervalMinutes ?? 45;
    this.dailyGoalGlasses = options.dailyGoalGlasses ?? 8;
  }

  public updateConfig(intervalMinutes: number, dailyGoalGlasses: number): void {
    this.intervalMinutes = Math.max(15, intervalMinutes);
    this.dailyGoalGlasses = Math.max(1, dailyGoalGlasses);
  }

  public tick(deltaSeconds: number = 1): { triggered: boolean } {
    if (this.isPaused) {
      return { triggered: false };
    }

    this.elapsedSeconds += deltaSeconds;
    const targetSeconds = this.intervalMinutes * 60;

    if (this.elapsedSeconds >= targetSeconds) {
      this.elapsedSeconds = 0; // reset for next cycle
      return { triggered: true };
    }

    return { triggered: false };
  }

  public logGlass(count: number = 1): void {
    this.glassesToday += count;
    // Reset timer on glass logged
    this.elapsedSeconds = 0;
  }

  public setGlassesToday(count: number): void {
    this.glassesToday = Math.max(0, count);
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public getProgress(): {
    glassesToday: number;
    dailyGoalGlasses: number;
    remainingSeconds: number;
    percentComplete: number;
  } {
    const total = this.intervalMinutes * 60;
    const remaining = Math.max(0, total - this.elapsedSeconds);
    const goalPercent = Math.min(100, Math.round((this.glassesToday / this.dailyGoalGlasses) * 100));

    return {
      glassesToday: this.glassesToday,
      dailyGoalGlasses: this.dailyGoalGlasses,
      remainingSeconds: remaining,
      percentComplete: goalPercent,
    };
  }
}
