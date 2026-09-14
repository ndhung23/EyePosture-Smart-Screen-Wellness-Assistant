export type BreakTimerStatus = 'IDLE' | 'RUNNING' | 'BREAK_READY' | 'BREAK_IN_PROGRESS' | 'PAUSED';

export interface BreakTimerOptions {
  intervalMinutes: number; // e.g. 20
  durationSeconds: number; // e.g. 20
}

export class BreakTimer {
  private intervalMinutes: number;
  private durationSeconds: number;
  private elapsedSeconds: number = 0;
  private breakRemainingSeconds: number = 0;
  private status: BreakTimerStatus = 'RUNNING';

  constructor(options: Partial<BreakTimerOptions> = {}) {
    this.intervalMinutes = options.intervalMinutes ?? 20;
    this.durationSeconds = options.durationSeconds ?? 20;
  }

  public updateConfig(intervalMinutes: number, durationSeconds: number): void {
    this.intervalMinutes = Math.max(1, intervalMinutes);
    this.durationSeconds = Math.max(5, durationSeconds);
  }

  public tick(deltaSeconds: number = 1): { status: BreakTimerStatus; triggered: boolean } {
    if (this.status === 'PAUSED' || this.status === 'IDLE') {
      return { status: this.status, triggered: false };
    }

    if (this.status === 'BREAK_IN_PROGRESS') {
      this.breakRemainingSeconds -= deltaSeconds;
      if (this.breakRemainingSeconds <= 0) {
        this.status = 'RUNNING';
        this.elapsedSeconds = 0;
      }
      return { status: this.status, triggered: false };
    }

    this.elapsedSeconds += deltaSeconds;
    const targetSeconds = this.intervalMinutes * 60;

    if (this.elapsedSeconds >= targetSeconds && this.status !== 'BREAK_READY') {
      this.status = 'BREAK_READY';
      return { status: this.status, triggered: true };
    }

    return { status: this.status, triggered: false };
  }

  public startBreak(): void {
    this.status = 'BREAK_IN_PROGRESS';
    this.breakRemainingSeconds = this.durationSeconds;
  }

  public completeBreak(): void {
    this.status = 'RUNNING';
    this.elapsedSeconds = 0;
    this.breakRemainingSeconds = 0;
  }

  public skipBreak(): void {
    this.status = 'RUNNING';
    this.elapsedSeconds = 0;
    this.breakRemainingSeconds = 0;
  }

  public snooze(snoozeMinutes: number = 5): void {
    this.status = 'RUNNING';
    // Rewind elapsed seconds so next break triggers in snoozeMinutes
    const targetSeconds = this.intervalMinutes * 60;
    this.elapsedSeconds = Math.max(0, targetSeconds - snoozeMinutes * 60);
  }

  public pause(): void {
    this.status = 'PAUSED';
  }

  public resume(): void {
    if (this.status === 'PAUSED') {
      this.status = 'RUNNING';
    }
  }

  public getStatus(): BreakTimerStatus {
    return this.status;
  }

  public getProgress(): {
    elapsedSeconds: number;
    totalIntervalSeconds: number;
    remainingSeconds: number;
    percentComplete: number;
  } {
    const total = this.intervalMinutes * 60;
    const remaining = Math.max(0, total - this.elapsedSeconds);
    const percent = Math.min(100, Math.round((this.elapsedSeconds / total) * 100));
    return {
      elapsedSeconds: this.elapsedSeconds,
      totalIntervalSeconds: total,
      remainingSeconds: remaining,
      percentComplete: percent,
    };
  }
}
