import { KeyFacialLandmarks } from '../types.js';

export class SyntheticVisionHarness {
  /**
   * Generates a base set of standard landmarks for an upright, comfortable posture at ~60cm
   */
  public static createUprightLandmarks(options: {
    scale?: number;      // scale factor (1.0 = standard 60cm, >1.0 = closer, <1.0 = further)
    pitchDeg?: number;   // pitch angle in degrees (positive = tilted down)
    rollDeg?: number;    // roll angle in degrees (positive = tilted right)
    yawDeg?: number;     // yaw angle in degrees (positive = turned right)
    verticalOffset?: number; // normalized Y offset (positive = slumped down)
  } = {}): KeyFacialLandmarks {
    const scale = options.scale ?? 1.0;
    const pitchRad = ((options.pitchDeg ?? 0) * Math.PI) / 180;
    const rollRad = ((options.rollDeg ?? 0) * Math.PI) / 180;
    const yawOffset = (options.yawDeg ?? 0) / 90;
    const yOff = options.verticalOffset ?? 0;

    // Base coordinates centered around (0.5, 0.5, 0)
    const cx = 0.5;
    const cy = 0.45 + yOff;

    const baseHalfSpan = 0.08 * scale;
    const baseHeight = 0.15 * scale;

    // Apply 2D roll rotation helper
    const rotate = (x: number, y: number): { x: number; y: number } => {
      const rx = (x - cx) * Math.cos(rollRad) - (y - cy) * Math.sin(rollRad) + cx;
      const ry = (x - cx) * Math.sin(rollRad) + (y - cy) * Math.cos(rollRad) + cy;
      return { x: rx, y: ry };
    };

    // Forehead and Chin with pitch rotation around X axis (Y and Z shift)
    const chinY = cy + baseHeight * Math.cos(pitchRad);
    const chinZ = baseHeight * Math.sin(pitchRad);
    const foreheadY = cy - baseHeight * 0.7 * Math.cos(pitchRad);
    const foreheadZ = -baseHeight * 0.7 * Math.sin(pitchRad);

    const chinPt = rotate(cx, chinY);
    const foreheadPt = rotate(cx, foreheadY);

    // Left and Right eye positions
    const leftOuter = rotate(cx - baseHalfSpan * 1.5, cy - 0.02);
    const leftInner = rotate(cx - baseHalfSpan * 0.5, cy - 0.02);
    const rightInner = rotate(cx + baseHalfSpan * 0.5, cy - 0.02);
    const rightOuter = rotate(cx + baseHalfSpan * 1.5, cy - 0.02);

    // Nose tip
    const nosePt = rotate(cx + yawOffset * 0.05, cy + 0.03);

    return {
      forehead: { x: foreheadPt.x, y: foreheadPt.y, z: foreheadZ },
      chin: { x: chinPt.x, y: chinPt.y, z: chinZ },
      noseTip: { x: nosePt.x, y: nosePt.y, z: 0.05 },
      leftEyeOuter: { x: leftOuter.x, y: leftOuter.y, z: 0 },
      leftEyeInner: { x: leftInner.x, y: leftInner.y, z: 0 },
      rightEyeInner: { x: rightInner.x, y: rightInner.y, z: 0 },
      rightEyeOuter: { x: rightOuter.x, y: rightOuter.y, z: 0 },
    };
  }

  public static createTooCloseLandmarks(): KeyFacialLandmarks {
    // 1.45x scale = ~40 cm distance (too close)
    return this.createUprightLandmarks({ scale: 1.45 });
  }

  public static createSlouchedLandmarks(): KeyFacialLandmarks {
    // Head pitch down 22° and vertical drop 0.09
    return this.createUprightLandmarks({ pitchDeg: 22, verticalOffset: 0.09 });
  }

  public static createHeadTiltedLandmarks(): KeyFacialLandmarks {
    // Roll sideways 16°
    return this.createUprightLandmarks({ rollDeg: 16 });
  }
}
