import { BlinkMetrics, Point3D } from '@eyeposture/shared-types';
import { KeyFacialLandmarks } from '../types.js';

export interface BlinkEstimatorConfig {
  earThreshold?: number;
  minClosedFrames?: number;
  prolongedStareThresholdSec?: number;
  minBlinksPerMinute?: number;
}

export class BlinkEstimator {
  private earThreshold: number;
  private minClosedFrames: number;
  private prolongedStareThresholdSec: number;
  private minBlinksPerMinute: number;

  private isEyesClosed: boolean = false;
  private consecutiveClosedFrames: number = 0;
  private totalBlinks: number = 0;
  private lastBlinkTimestamp: number = 0;
  private blinkHistory: number[] = []; // Timestamps of recent blinks within 60s
  private sessionStartTime: number = 0;

  constructor(config: BlinkEstimatorConfig = {}) {
    this.earThreshold = config.earThreshold ?? 0.22;
    this.minClosedFrames = config.minClosedFrames ?? 2;
    this.prolongedStareThresholdSec = config.prolongedStareThresholdSec ?? 7;
    this.minBlinksPerMinute = config.minBlinksPerMinute ?? 10;
  }

  public updateConfig(config: Partial<BlinkEstimatorConfig>): void {
    if (config.earThreshold !== undefined) this.earThreshold = config.earThreshold;
    if (config.minClosedFrames !== undefined) this.minClosedFrames = config.minClosedFrames;
    if (config.prolongedStareThresholdSec !== undefined) {
      this.prolongedStareThresholdSec = config.prolongedStareThresholdSec;
    }
    if (config.minBlinksPerMinute !== undefined) {
      this.minBlinksPerMinute = config.minBlinksPerMinute;
    }
  }

  public reset(now: number = Date.now()): void {
    this.isEyesClosed = false;
    this.consecutiveClosedFrames = 0;
    this.totalBlinks = 0;
    this.lastBlinkTimestamp = now;
    this.blinkHistory = [];
    this.sessionStartTime = now;
  }

  /**
   * Calculates Eye Aspect Ratio (EAR) for a single eye
   * EAR = ||top - bottom|| / ||outer - inner||
   */
  public calculateEyeEar(
    outer: Point3D,
    inner: Point3D,
    top?: Point3D,
    bottom?: Point3D
  ): number {
    const horizontal = this.euclideanDistance2D(outer, inner);
    if (horizontal <= 0.0001) return 0.28; // Fallback to nominal open eye EAR

    if (!top || !bottom) {
      // If no eyelid landmarks are available, assume eyes are open
      return 0.28;
    }

    const vertical = this.euclideanDistance2D(top, bottom);
    return Number((vertical / horizontal).toFixed(3));
  }

  /**
   * Estimates blink metrics for the current frame
   */
  public estimate(
    landmarks: KeyFacialLandmarks | null,
    now: number = Date.now()
  ): BlinkMetrics {
    if (this.sessionStartTime === 0 || this.lastBlinkTimestamp === 0) {
      this.sessionStartTime = now;
      this.lastBlinkTimestamp = now;
    }

    if (!landmarks) {
      const elapsedSec = Math.max(0, (now - this.lastBlinkTimestamp) / 1000);
      return {
        leftEar: 0.28,
        rightEar: 0.28,
        averageEar: 0.28,
        blinkCount: this.totalBlinks,
        blinksPerMinute: this.calculateBPM(now),
        secondsSinceLastBlink: Number(elapsedSec.toFixed(1)),
        prolongedStareDetected: false,
        eyeStrainScore: 0,
      };
    }

    // 1. Calculate EAR for left and right eyes
    const leftEar = this.calculateEyeEar(
      landmarks.leftEyeOuter,
      landmarks.leftEyeInner,
      landmarks.leftEyeTop,
      landmarks.leftEyeBottom
    );

    const rightEar = this.calculateEyeEar(
      landmarks.rightEyeOuter,
      landmarks.rightEyeInner,
      landmarks.rightEyeTop,
      landmarks.rightEyeBottom
    );

    const averageEar = Number(((leftEar + rightEar) / 2).toFixed(3));

    // 2. Evaluate eye closure state machine
    if (averageEar < this.earThreshold) {
      this.consecutiveClosedFrames++;
      if (this.consecutiveClosedFrames >= this.minClosedFrames) {
        this.isEyesClosed = true;
      }
    } else {
      // Eyes are open now
      if (this.isEyesClosed) {
        // Successful blink completion
        this.totalBlinks++;
        this.lastBlinkTimestamp = now;
        this.blinkHistory.push(now);
        this.isEyesClosed = false;
      }
      this.consecutiveClosedFrames = 0;
    }

    // 3. Purge blink history older than 60s
    const cutoff = now - 60000;
    while (this.blinkHistory.length > 0 && this.blinkHistory[0] < cutoff) {
      this.blinkHistory.shift();
    }

    // 4. Calculate BPM & Seconds since last blink
    const blinksPerMinute = this.calculateBPM(now);
    const secondsSinceLastBlink = Number(
      (Math.max(0, now - this.lastBlinkTimestamp) / 1000).toFixed(1)
    );

    const prolongedStareDetected = secondsSinceLastBlink >= this.prolongedStareThresholdSec;

    // 5. Compute eye strain score (0 - 100)
    const eyeStrainScore = this.calculateEyeStrain(
      blinksPerMinute,
      secondsSinceLastBlink,
      prolongedStareDetected,
      now
    );

    return {
      leftEar,
      rightEar,
      averageEar,
      blinkCount: this.totalBlinks,
      blinksPerMinute,
      secondsSinceLastBlink,
      prolongedStareDetected,
      eyeStrainScore,
    };
  }

  private calculateBPM(now: number): number {
    const elapsedMinutes = Math.max(0.1, (now - this.sessionStartTime) / 60000);
    if (elapsedMinutes < 1.0) {
      // During first minute, extrapolate rolling count or return exact count
      const extrapolated = Math.round(this.blinkHistory.length / elapsedMinutes);
      return Math.min(60, Math.max(0, extrapolated));
    }
    return this.blinkHistory.length;
  }

  private calculateEyeStrain(
    bpm: number,
    stareSec: number,
    prolongedStare: boolean,
    now: number
  ): number {
    let score = 0;

    // Penalty for low blink rate (< minBlinksPerMinute, usually < 10 BPM)
    if (bpm < this.minBlinksPerMinute) {
      const deficit = this.minBlinksPerMinute - bpm;
      score += Math.min(45, deficit * 6);
    }

    // Penalty for prolonged stare without blinking (> 7s)
    if (prolongedStare) {
      const extraStare = stareSec - this.prolongedStareThresholdSec;
      score += Math.min(50, 30 + extraStare * 5);
    } else if (stareSec >= 4) {
      score += Math.round((stareSec - 3) * 5);
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private euclideanDistance2D(p1: Point3D, p2: Point3D): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
