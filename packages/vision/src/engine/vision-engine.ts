import {
  VisionFrameAnalysis,
  CalibrationData,
  DistanceState,
  PostureState,
} from '@eyeposture/shared-types';
import { KeyFacialLandmarks } from '../types.js';
import { DistanceEstimator } from '../estimators/distance-estimator.js';
import { PostureEstimator } from '../estimators/posture-estimator.js';
import { BlinkEstimator, BlinkEstimatorConfig } from '../estimators/blink-estimator.js';
import { DistanceStateFilter, PostureStateFilter } from '../smoothing/temporal-filter.js';

export interface VisionEngineConfig {
  distanceWarningDelayMs?: number;
  postureWarningDelayMs?: number;
  sensitivity?: number; // 1 to 5
  blinkConfig?: BlinkEstimatorConfig;
}

export class VisionEngine {
  private distanceEstimator: DistanceEstimator;
  private postureEstimator: PostureEstimator;
  private blinkEstimator: BlinkEstimator;
  private distanceStateFilter: DistanceStateFilter;
  private postureStateFilter: PostureStateFilter;
  private sensitivity: number = 3;

  // Calibration accumulator
  private calibrationSamples: KeyFacialLandmarks[] = [];

  constructor(config: VisionEngineConfig = {}) {
    this.distanceEstimator = new DistanceEstimator();
    this.postureEstimator = new PostureEstimator();
    this.blinkEstimator = new BlinkEstimator(config.blinkConfig);
    this.distanceStateFilter = new DistanceStateFilter({
      warningDelayMs: config.distanceWarningDelayMs ?? 5000,
    });
    this.postureStateFilter = new PostureStateFilter({
      warningDelayMs: config.postureWarningDelayMs ?? 5000,
    });
    if (config.sensitivity) {
      this.sensitivity = config.sensitivity;
    }
  }

  public setCalibration(calibration: CalibrationData): void {
    this.distanceEstimator.setCalibration(calibration);
    this.postureEstimator.setCalibration(calibration);
    this.distanceStateFilter.reset();
    this.postureStateFilter.reset();
    this.blinkEstimator.reset();
  }

  public setSensitivity(sensitivity: number): void {
    this.sensitivity = Math.max(1, Math.min(5, sensitivity));
  }

  public updateDelays(distanceDelayMs: number, postureDelayMs: number): void {
    this.distanceStateFilter = new DistanceStateFilter({ warningDelayMs: distanceDelayMs });
    this.postureStateFilter = new PostureStateFilter({ warningDelayMs: postureDelayMs });
  }

  public updateBlinkConfig(config: BlinkEstimatorConfig): void {
    this.blinkEstimator.updateConfig(config);
  }

  public resetBlink(now: number = Date.now()): void {
    this.blinkEstimator.reset(now);
  }

  /**
   * Processes a single set of facial landmarks
   */
  public processLandmarks(
    landmarks: KeyFacialLandmarks | null,
    now: number = Date.now()
  ): VisionFrameAnalysis {
    if (!landmarks) {
      return {
        timestamp: now,
        faceDetected: false,
        confidence: 0,
        distanceEstimateCm: 0,
        distanceRatio: 1.0,
        distanceState: 'SAFE',
        postureScore: 100,
        postureState: 'GOOD',
        headAngles: { pitch: 0, roll: 0, yaw: 0 },
        slouchDetected: false,
        blinkMetrics: this.blinkEstimator.estimate(null, now),
      };
    }

    // 1. Distance analysis
    const distResult = this.distanceEstimator.estimate(landmarks);
    const distanceState = this.distanceStateFilter.update(distResult.isTooCloseInstant, now);

    // 2. Posture analysis
    const postureResult = this.postureEstimator.estimate(landmarks, this.sensitivity);
    const postureState = this.postureStateFilter.update(postureResult.postureScore, now);

    // 3. Blink & Eye strain analysis (ErgoBlink integration)
    const blinkMetrics = this.blinkEstimator.estimate(landmarks, now);

    return {
      timestamp: now,
      faceDetected: true,
      confidence: 0.95,
      distanceEstimateCm: distResult.estimatedDistanceCm,
      distanceRatio: Number(distResult.distanceRatio.toFixed(2)),
      distanceState,
      postureScore: postureResult.postureScore,
      postureState,
      headAngles: {
        pitch: Number(postureResult.headAngles.pitch.toFixed(1)),
        roll: Number(postureResult.headAngles.roll.toFixed(1)),
        yaw: Number(postureResult.headAngles.yaw.toFixed(1)),
      },
      slouchDetected: postureResult.slouchDetected,
      eyeAspectRatios: {
        left: blinkMetrics.leftEar,
        right: blinkMetrics.rightEar,
      },
      blinkMetrics,
      faceBoundingBox: {
        xMin: Math.min(landmarks.leftEyeOuter.x, landmarks.rightEyeOuter.x),
        yMin: landmarks.forehead.y,
        width: Math.abs(landmarks.rightEyeOuter.x - landmarks.leftEyeOuter.x),
        height: Math.abs(landmarks.chin.y - landmarks.forehead.y),
      },
    };
  }

  /**
   * Calibration session accumulator
   */
  public addCalibrationSample(landmarks: KeyFacialLandmarks): void {
    this.calibrationSamples.push(landmarks);
  }

  public finalizeCalibration(cameraDeviceId: string = 'default'): CalibrationData | null {
    if (this.calibrationSamples.length < 3) {
      return null;
    }

    let totalIpd = 0;
    let totalFaceWidth = 0;
    let totalPitch = 0;
    let totalRoll = 0;
    let totalY = 0;

    for (const s of this.calibrationSamples) {
      const ipd = this.distanceEstimator.calculatePointDistance(s.leftEyeInner, s.rightEyeInner);
      const faceWidth = this.distanceEstimator.calculatePointDistance(s.leftEyeOuter, s.rightEyeOuter);
      const faceHeight = this.distanceEstimator.calculatePointDistance(s.chin, s.forehead);
      const scale = ipd * 0.4 + faceWidth * 0.3 + faceHeight * 0.3;
      const angles = this.postureEstimator.calculateAngles(s);
      const centerY = (s.forehead.y + s.chin.y) / 2;

      totalIpd += scale;
      totalFaceWidth += faceWidth;
      totalPitch += angles.pitch;
      totalRoll += angles.roll;
      totalY += centerY;
    }

    const n = this.calibrationSamples.length;
    this.calibrationSamples = [];

    const baseline: CalibrationData = {
      baselineFaceDistanceRatio: totalIpd / n,
      baselineFaceWidth: totalFaceWidth / n,
      baselinePitch: Number((totalPitch / n).toFixed(1)),
      baselineRoll: Number((totalRoll / n).toFixed(1)),
      baselineY: Number((totalY / n).toFixed(3)),
      cameraDeviceId,
      calibratedAt: new Date().toISOString(),
    };

    this.setCalibration(baseline);
    return baseline;
  }

  public reset(): void {
    this.distanceEstimator.reset();
    this.postureEstimator.reset();
    this.distanceStateFilter.reset();
    this.postureStateFilter.reset();
    this.calibrationSamples = [];
  }
}
