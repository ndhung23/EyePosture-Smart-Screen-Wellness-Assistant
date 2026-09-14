import { DistanceState, PostureState } from '@eyeposture/shared-types';

export class ExponentialMovingAverage {
  private alpha: number;
  private current: number | null = null;

  constructor(alpha: number = 0.25) {
    this.alpha = Math.max(0.01, Math.min(1.0, alpha));
  }

  public update(val: number): number {
    if (this.current === null) {
      this.current = val;
    } else {
      this.current = this.alpha * val + (1 - this.alpha) * this.current;
    }
    return this.current;
  }

  public get value(): number {
    return this.current ?? 0;
  }

  public reset(): void {
    this.current = null;
  }
}

export interface DistanceStateOptions {
  warningDelayMs: number; // e.g. 5000ms
  recoveryDelayMs: number; // e.g. 1500ms
}

export class DistanceStateFilter {
  private state: DistanceState = 'SAFE';
  private enteredPendingAt: number | null = null;
  private enteredRecoveringAt: number | null = null;
  private options: DistanceStateOptions;

  constructor(options: Partial<DistanceStateOptions> = {}) {
    this.options = {
      warningDelayMs: options.warningDelayMs ?? 5000,
      recoveryDelayMs: options.recoveryDelayMs ?? 1500,
    };
  }

  public update(isTooCloseInstant: boolean, now: number = Date.now()): DistanceState {
    switch (this.state) {
      case 'SAFE':
        if (isTooCloseInstant) {
          this.state = 'TOO_CLOSE_PENDING';
          this.enteredPendingAt = now;
        }
        break;

      case 'TOO_CLOSE_PENDING':
        if (!isTooCloseInstant) {
          // False alarm or instantaneous lean forward
          this.state = 'SAFE';
          this.enteredPendingAt = null;
        } else if (this.enteredPendingAt && now - this.enteredPendingAt >= this.options.warningDelayMs) {
          this.state = 'TOO_CLOSE';
          this.enteredPendingAt = null;
        }
        break;

      case 'TOO_CLOSE':
        if (!isTooCloseInstant) {
          this.state = 'RECOVERING';
          this.enteredRecoveringAt = now;
        }
        break;

      case 'RECOVERING':
        if (isTooCloseInstant) {
          // Slid back into bad distance
          this.state = 'TOO_CLOSE';
          this.enteredRecoveringAt = null;
        } else if (this.enteredRecoveringAt && now - this.enteredRecoveringAt >= this.options.recoveryDelayMs) {
          this.state = 'SAFE';
          this.enteredRecoveringAt = null;
        }
        break;
    }

    return this.state;
  }

  public getState(): DistanceState {
    return this.state;
  }

  public reset(): void {
    this.state = 'SAFE';
    this.enteredPendingAt = null;
    this.enteredRecoveringAt = null;
  }
}

export interface PostureStateOptions {
  warningDelayMs: number; // e.g. 5000ms
  recoveryDelayMs: number; // e.g. 2000ms
}

export class PostureStateFilter {
  private state: PostureState = 'GOOD';
  private enteredBadAt: number | null = null;
  private enteredRecoveringAt: number | null = null;
  private options: PostureStateOptions;

  constructor(options: Partial<PostureStateOptions> = {}) {
    this.options = {
      warningDelayMs: options.warningDelayMs ?? 5000,
      recoveryDelayMs: options.recoveryDelayMs ?? 2000,
    };
  }

  public update(instantScore: number, now: number = Date.now()): PostureState {
    const isBad = instantScore < 70;
    const isAcceptable = instantScore >= 70 && instantScore < 90;

    if (this.state === 'GOOD') {
      if (isBad) {
        if (!this.enteredBadAt) this.enteredBadAt = now;
        if (now - this.enteredBadAt >= this.options.warningDelayMs) {
          this.state = 'POOR';
          this.enteredBadAt = null;
        }
      } else if (isAcceptable) {
        this.enteredBadAt = null;
        this.state = 'ACCEPTABLE';
      } else {
        this.enteredBadAt = null;
      }
    } else if (this.state === 'ACCEPTABLE') {
      if (isBad) {
        if (!this.enteredBadAt) this.enteredBadAt = now;
        if (now - this.enteredBadAt >= this.options.warningDelayMs) {
          this.state = 'POOR';
          this.enteredBadAt = null;
        }
      } else if (!isBad && !isAcceptable) {
        this.state = 'GOOD';
        this.enteredBadAt = null;
      } else {
        this.enteredBadAt = null;
      }
    } else if (this.state === 'POOR') {
      if (!isBad) {
        if (!this.enteredRecoveringAt) this.enteredRecoveringAt = now;
        if (now - this.enteredRecoveringAt >= this.options.recoveryDelayMs) {
          this.state = isAcceptable ? 'ACCEPTABLE' : 'GOOD';
          this.enteredRecoveringAt = null;
        }
      } else {
        this.enteredRecoveringAt = null;
      }
    }

    return this.state;
  }

  public getState(): PostureState {
    return this.state;
  }

  public reset(): void {
    this.state = 'GOOD';
    this.enteredBadAt = null;
    this.enteredRecoveringAt = null;
  }
}
