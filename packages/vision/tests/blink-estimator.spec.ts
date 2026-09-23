import { describe, it, expect, beforeEach } from 'vitest';
import { BlinkEstimator } from '../src/estimators/blink-estimator.js';
import { SyntheticVisionHarness } from '../src/mocks/synthetic-harness.js';
import { VisionEngine } from '../src/engine/vision-engine.js';

describe('BlinkEstimator (ErgoBlink EAR & Blink Rate Integration)', () => {
  let estimator: BlinkEstimator;

  beforeEach(() => {
    estimator = new BlinkEstimator({
      earThreshold: 0.22,
      minClosedFrames: 2,
      prolongedStareThresholdSec: 7,
      minBlinksPerMinute: 10,
    });
  });

  it('should calculate nominal open-eye EAR above threshold for upright face', () => {
    const landmarks = SyntheticVisionHarness.createUprightLandmarks();
    const metrics = estimator.estimate(landmarks);

    expect(metrics.leftEar).toBeGreaterThan(0.22);
    expect(metrics.rightEar).toBeGreaterThan(0.22);
    expect(metrics.averageEar).toBeGreaterThan(0.22);
    expect(metrics.blinkCount).toBe(0);
    expect(metrics.prolongedStareDetected).toBe(false);
  });

  it('should calculate closed-eye EAR well below threshold for blinking landmarks', () => {
    const closedLandmarks = SyntheticVisionHarness.createBlinkingLandmarks();
    const metrics = estimator.estimate(closedLandmarks);

    expect(metrics.averageEar).toBeLessThan(0.15);
  });

  it('should detect and count a completed blink when eyes close and reopen', () => {
    const openLandmarks = SyntheticVisionHarness.createUprightLandmarks();
    const closedLandmarks = SyntheticVisionHarness.createBlinkingLandmarks();
    const t0 = 100000;

    // Frame 1: Eyes open
    let m = estimator.estimate(openLandmarks, t0);
    expect(m.blinkCount).toBe(0);

    // Frame 2: Eyes closing
    m = estimator.estimate(closedLandmarks, t0 + 100);
    expect(m.blinkCount).toBe(0);

    // Frame 3: Eyes still closed (2 consecutive frames reached)
    m = estimator.estimate(closedLandmarks, t0 + 200);
    expect(m.blinkCount).toBe(0);

    // Frame 4: Eyes reopen -> Blink should be registered!
    m = estimator.estimate(openLandmarks, t0 + 300);
    expect(m.blinkCount).toBe(1);
    expect(m.secondsSinceLastBlink).toBe(0);
  });

  it('should detect prolonged stare when user does not blink for > 7 seconds', () => {
    const openLandmarks = SyntheticVisionHarness.createProlongedStareLandmarks();
    const t0 = 200000;

    // Initial frame
    estimator.estimate(openLandmarks, t0);

    // 4 seconds later: still normal stare
    let m = estimator.estimate(openLandmarks, t0 + 4000);
    expect(m.prolongedStareDetected).toBe(false);
    expect(m.secondsSinceLastBlink).toBe(4.0);

    // 8 seconds later: prolonged stare detected (> 7s)
    m = estimator.estimate(openLandmarks, t0 + 8000);
    expect(m.prolongedStareDetected).toBe(true);
    expect(m.secondsSinceLastBlink).toBe(8.0);
    expect(m.eyeStrainScore).toBeGreaterThan(30);
  });

  it('should compute blinks per minute (BPM) over rolling window', () => {
    const open = SyntheticVisionHarness.createUprightLandmarks();
    const closed = SyntheticVisionHarness.createBlinkingLandmarks();
    let time = 300000;

    estimator.reset(time);

    // Simulate 3 blinks in sequence
    for (let i = 0; i < 3; i++) {
      estimator.estimate(open, time);
      time += 100;
      estimator.estimate(closed, time);
      time += 100;
      estimator.estimate(closed, time);
      time += 100;
      estimator.estimate(open, time);
      time += 2000;
    }

    const metrics = estimator.estimate(open, time);
    expect(metrics.blinkCount).toBe(3);
    expect(metrics.blinksPerMinute).toBeGreaterThan(0);
  });

  it('should seamlessly provide blink metrics inside VisionEngine', () => {
    const engine = new VisionEngine();
    const open = SyntheticVisionHarness.createUprightLandmarks();

    const analysis = engine.processLandmarks(open);
    expect(analysis.blinkMetrics).toBeDefined();
    expect(analysis.blinkMetrics?.averageEar).toBeGreaterThan(0.20);
    expect(analysis.eyeAspectRatios?.left).toBeDefined();
  });
});
