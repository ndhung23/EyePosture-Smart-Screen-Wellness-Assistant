import { CalibrationData } from '@eyeposture/shared-types';
import { KeyFacialLandmarks } from '../types.js';
import { ExponentialMovingAverage } from '../smoothing/temporal-filter.js';

export interface DistanceEstimationResult {
  distanceRatio: number;      // current scale vs baseline (>1.0 means closer than baseline)
  estimatedDistanceCm: number; // approximate cm (e.g. 60cm / ratio)
  isTooCloseInstant: boolean;
}

export class DistanceEstimator {
  private baseline: CalibrationData | null = null;
  private emaRatio = new ExponentialMovingAverage(0.2);
  private defaultBaselineDistanceCm = 60; // standard comfortable desktop distance

  public setCalibration(baseline: CalibrationData): void {
    this.baseline = baseline;
    this.emaRatio.reset();
  }

  public getCalibration(): CalibrationData | null {
    return this.baseline;
  }

  /**
   * Calculates Euclidean distance between 2 3D points
   */
  public calculatePointDistance(p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z - p2.z) * 0.5; // lower weight on estimated Z
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Estimates distance ratio from landmarks compared to calibrated baseline
   */
  public estimate(landmarks: KeyFacialLandmarks, thresholdMultiplier: number = 1.25): DistanceEstimationResult {
    // 1. Compute inter-pupillary / inner eye distance
    const ipd = this.calculatePointDistance(landmarks.leftEyeInner, landmarks.rightEyeInner);
    
    // 2. Compute face width (outer eye to outer eye or chin to forehead)
    const eyeSpan = this.calculatePointDistance(landmarks.leftEyeOuter, landmarks.rightEyeOuter);
    const faceHeight = this.calculatePointDistance(landmarks.chin, landmarks.forehead);

    // Combined scale metric
    const currentScale = (ipd * 0.4) + (eyeSpan * 0.3) + (faceHeight * 0.3);

    if (!this.baseline || this.baseline.baselineFaceDistanceRatio <= 0) {
      // Default uncalibrated reference: assume normalized scale ~0.25 is standard 60cm
      const uncalibratedBase = 0.25;
      const rawRatio = currentScale / uncalibratedBase;
      const smoothedRatio = this.emaRatio.update(rawRatio);
      const estCm = Math.round(this.defaultBaselineDistanceCm / Math.max(0.2, smoothedRatio));

      return {
        distanceRatio: smoothedRatio,
        estimatedDistanceCm: Math.max(20, Math.min(150, estCm)),
        isTooCloseInstant: smoothedRatio > thresholdMultiplier,
      };
    }

    const baselineScale = this.baseline.baselineFaceDistanceRatio;
    const rawRatio = currentScale / baselineScale;
    const smoothedRatio = this.emaRatio.update(rawRatio);
    const estCm = Math.round(this.defaultBaselineDistanceCm / Math.max(0.2, smoothedRatio));

    return {
      distanceRatio: smoothedRatio,
      estimatedDistanceCm: Math.max(20, Math.min(150, estCm)),
      isTooCloseInstant: smoothedRatio > thresholdMultiplier,
    };
  }

  public reset(): void {
    this.emaRatio.reset();
  }
}
