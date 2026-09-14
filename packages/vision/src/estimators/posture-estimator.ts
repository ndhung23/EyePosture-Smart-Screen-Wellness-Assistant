import { HeadAngles, CalibrationData } from '@eyeposture/shared-types';
import { KeyFacialLandmarks } from '../types.js';
import { ExponentialMovingAverage } from '../smoothing/temporal-filter.js';

export interface PostureEstimationResult {
  headAngles: HeadAngles;
  slouchDetected: boolean;
  postureScore: number; // 0 to 100
  isPoorInstant: boolean;
}

export class PostureEstimator {
  private baseline: CalibrationData | null = null;
  private emaPitch = new ExponentialMovingAverage(0.2);
  private emaRoll = new ExponentialMovingAverage(0.2);
  private emaYaw = new ExponentialMovingAverage(0.2);
  private emaScore = new ExponentialMovingAverage(0.25);

  public setCalibration(baseline: CalibrationData): void {
    this.baseline = baseline;
    this.emaPitch.reset();
    this.emaRoll.reset();
    this.emaYaw.reset();
    this.emaScore.reset();
  }

  public calculateAngles(landmarks: KeyFacialLandmarks): HeadAngles {
    // Roll: angle of the line connecting inner eye corners
    const dxEyes = landmarks.rightEyeInner.x - landmarks.leftEyeInner.x;
    const dyEyes = landmarks.rightEyeInner.y - landmarks.leftEyeInner.y;
    const rawRoll = (Math.atan2(dyEyes, dxEyes) * 180) / Math.PI;

    // Pitch: angle of vector from chin to forehead
    const dyFace = landmarks.chin.y - landmarks.forehead.y;
    const dzFace = (landmarks.chin.z - landmarks.forehead.z) * 1.5;
    const rawPitch = (Math.atan2(dzFace, dyFace) * 180) / Math.PI;

    // Yaw: asymmetry of nose tip relative to eye midpoint
    const eyeMidX = (landmarks.leftEyeInner.x + landmarks.rightEyeInner.x) / 2;
    const eyeSpan = Math.max(0.01, landmarks.rightEyeOuter.x - landmarks.leftEyeOuter.x);
    const noseOffset = (landmarks.noseTip.x - eyeMidX) / eyeSpan;
    const rawYaw = noseOffset * 90; // approximate yaw angle in degrees

    return {
      pitch: this.emaPitch.update(rawPitch),
      roll: this.emaRoll.update(rawRoll),
      yaw: this.emaYaw.update(rawYaw),
    };
  }

  public estimate(landmarks: KeyFacialLandmarks, sensitivity: number = 3): PostureEstimationResult {
    const angles = this.calculateAngles(landmarks);

    // Compute center Y of face (average of forehead and chin)
    const currentCenterY = (landmarks.forehead.y + landmarks.chin.y) / 2;

    // Baseline adjustments
    let baselinePitch = 0;
    let baselineRoll = 0;
    let baselineY = 0.5;

    if (this.baseline) {
      baselinePitch = this.baseline.baselinePitch;
      baselineRoll = this.baseline.baselineRoll;
      baselineY = this.baseline.baselineY;
    }

    // Delta from baseline
    const deltaPitch = Math.abs(angles.pitch - baselinePitch);
    const deltaRoll = Math.abs(angles.roll - baselineRoll);
    const deltaYaw = Math.abs(angles.yaw);
    const verticalDrop = Math.max(0, currentCenterY - baselineY); // positive means dropped down (slouch)

    // Sensitivity factor (1 = lenient, 5 = strict, default 3)
    const factor = 0.6 + sensitivity * 0.2;

    // Penalty scoring
    let penalty = 0;

    // Pitch penalty: looking down > 12 degrees
    if (deltaPitch > 12 / factor) {
      penalty += (deltaPitch - 12 / factor) * 2.5 * factor;
    }

    // Roll penalty: head tilted sideways > 8 degrees
    if (deltaRoll > 8 / factor) {
      penalty += (deltaRoll - 8 / factor) * 3.0 * factor;
    }

    // Yaw penalty: turned away from screen > 20 degrees
    if (deltaYaw > 20 / factor) {
      penalty += (deltaYaw - 20 / factor) * 1.5 * factor;
    }

    // Vertical slouch penalty: dropped down > 0.05 normalized
    const slouchDetected = verticalDrop > 0.05 / factor;
    if (slouchDetected) {
      penalty += verticalDrop * 250 * factor;
    }

    const rawScore = Math.max(20, Math.min(100, Math.round(100 - penalty)));
    const smoothedScore = Math.round(this.emaScore.update(rawScore));

    return {
      headAngles: angles,
      slouchDetected,
      postureScore: smoothedScore,
      isPoorInstant: smoothedScore < 70,
    };
  }

  public reset(): void {
    this.emaPitch.reset();
    this.emaRoll.reset();
    this.emaYaw.reset();
    this.emaScore.reset();
  }
}
