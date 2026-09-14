import { describe, it, expect, beforeEach } from 'vitest';
import {
  VisionEngine,
  SyntheticVisionHarness,
  DistanceEstimator,
  PostureEstimator,
  DistanceStateFilter,
  PostureStateFilter,
} from '../src/index.js';

describe('Vision Engine & Synthetic Processing', () => {
  let engine: VisionEngine;

  beforeEach(() => {
    engine = new VisionEngine({
      distanceWarningDelayMs: 5000,
      postureWarningDelayMs: 5000,
      sensitivity: 3,
    });
  });

  it('should process null landmarks gracefully without throwing', () => {
    const analysis = engine.processLandmarks(null);
    expect(analysis.faceDetected).toBe(false);
    expect(analysis.distanceState).toBe('SAFE');
    expect(analysis.postureState).toBe('GOOD');
  });

  it('should detect upright posture with high wellness score', () => {
    const upright = SyntheticVisionHarness.createUprightLandmarks();
    const analysis = engine.processLandmarks(upright);

    expect(analysis.faceDetected).toBe(true);
    expect(analysis.postureScore).toBeGreaterThanOrEqual(90);
    expect(analysis.postureState).toBe('GOOD');
    expect(analysis.slouchDetected).toBe(false);
    expect(analysis.distanceState).toBe('SAFE');
  });

  it('should calibrate baseline accurately and normalize distance measurements', () => {
    const upright = SyntheticVisionHarness.createUprightLandmarks();

    // Accumulate 5 calibration samples
    for (let i = 0; i < 5; i++) {
      engine.addCalibrationSample(upright);
    }

    const baseline = engine.finalizeCalibration('webcam-1');
    expect(baseline).not.toBeNull();
    expect(baseline?.cameraDeviceId).toBe('webcam-1');
    expect(baseline?.baselineFaceDistanceRatio).toBeGreaterThan(0);

    // After calibration, processing upright should give ratio ~1.0
    const analysis = engine.processLandmarks(upright);
    expect(analysis.distanceRatio).toBeCloseTo(1.0, 1);
  });

  it('should flag slouched posture with reduced score', () => {
    const slouched = SyntheticVisionHarness.createSlouchedLandmarks();
    const analysis = engine.processLandmarks(slouched);

    expect(analysis.postureScore).toBeLessThan(75);
    expect(analysis.slouchDetected).toBe(true);
  });

  it('should prevent false alarms for brief 1-second posture lapses (Temporal Smoothing)', () => {
    const filter = new PostureStateFilter({ warningDelayMs: 5000, recoveryDelayMs: 1500 });
    const startTime = 10000;

    // Initially GOOD
    expect(filter.update(95, startTime)).toBe('GOOD');

    // 1-second slouch (score = 55) -> should NOT trigger POOR state
    expect(filter.update(55, startTime + 1000)).toBe('GOOD');

    // After 5+ seconds of persistent slouch (since startTime + 1000) -> triggers POOR at startTime + 6100
    expect(filter.update(55, startTime + 6100)).toBe('POOR');

    // User straightens up (score = 95) -> enters recovery
    expect(filter.update(95, startTime + 6500)).toBe('POOR');

    // Recovery period completes (1500ms later at 8100) -> restored to GOOD
    expect(filter.update(95, startTime + 8100)).toBe('GOOD');
  });

  it('should prevent false alarms for brief 1-second distance lean (Temporal Smoothing)', () => {
    const filter = new DistanceStateFilter({ warningDelayMs: 5000, recoveryDelayMs: 1500 });
    const startTime = 10000;

    // Normal distance
    expect(filter.update(false, startTime)).toBe('SAFE');

    // User quickly glances at screen for 1 second
    expect(filter.update(true, startTime + 1000)).toBe('TOO_CLOSE_PENDING');

    // User moves back before delay expires
    expect(filter.update(false, startTime + 2000)).toBe('SAFE');

    // User stays too close continuously for 5+ seconds
    filter.update(true, startTime + 3000);
    expect(filter.update(true, startTime + 8100)).toBe('TOO_CLOSE');

    // User steps back
    expect(filter.update(false, startTime + 8500)).toBe('RECOVERING');

    // Fully recovered after 1500ms
    expect(filter.update(false, startTime + 10100)).toBe('SAFE');
  });
});
