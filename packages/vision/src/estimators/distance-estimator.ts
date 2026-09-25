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

    // 3. Angle foreshortening compensation (prevents distance jumping when user rotates or tilts head)
    const dyFace = Math.max(0.01, landmarks.chin.y - landmarks.forehead.y);
    const dzFace = (landmarks.chin.z - landmarks.forehead.z) * 1.5;
    const pitchRad = Math.atan2(dzFace, dyFace);
    const cosPitch = Math.max(0.75, Math.abs(Math.cos(pitchRad)));

    const eyeMidX = (landmarks.leftEyeInner.x + landmarks.rightEyeInner.x) / 2;
    const rawEyeSpan = Math.max(0.01, landmarks.rightEyeOuter.x - landmarks.leftEyeOuter.x);
    const yawOffset = (landmarks.noseTip.x - eyeMidX) / rawEyeSpan;
    const yawRad = (yawOffset * Math.PI) / 2;
    const cosYaw = Math.max(0.75, Math.abs(Math.cos(yawRad)));

    // Combined scale metric with foreshortening compensation
    const compensatedEyeSpan = eyeSpan / cosYaw;
    const compensatedFaceHeight = faceHeight / cosPitch;
    const currentScale = (ipd * 0.4) + (compensatedEyeSpan * 0.3) + (compensatedFaceHeight * 0.3);

    if (!this.baseline || this.baseline.baselineFaceDistanceRatio <= 0) {
      // Default uncalibrated reference: assume normalized scale ~0.185 is standard 60cm
      const uncalibratedBase = 0.185;
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
