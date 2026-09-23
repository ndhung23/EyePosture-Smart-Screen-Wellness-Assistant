export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type DistanceState = 'SAFE' | 'TOO_CLOSE_PENDING' | 'TOO_CLOSE' | 'RECOVERING';
export type PostureState = 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'UNKNOWN';

export interface HeadAngles {
  pitch: number; // degrees: positive is looking down (forward head / slouch)
  roll: number;  // degrees: head tilt sideways left/right
  yaw: number;   // degrees: turning face left/right
}

export interface BlinkMetrics {
  leftEar: number;
  rightEar: number;
  averageEar: number;
  blinkCount: number;
  blinksPerMinute: number;
  secondsSinceLastBlink: number;
  prolongedStareDetected: boolean;
  eyeStrainScore: number; // 0 (healthy) - 100 (fatigued)
}

export interface VisionFrameAnalysis {
  timestamp: number;
  faceDetected: boolean;
  confidence: number;
  distanceEstimateCm: number; // estimated distance from screen
  distanceRatio: number;      // raw ratio vs calibrated baseline
  distanceState: DistanceState;
  postureScore: number;       // 0 - 100
  postureState: PostureState;
  headAngles: HeadAngles;
  slouchDetected: boolean;
  eyeAspectRatios?: { left: number; right: number };
  blinkMetrics?: BlinkMetrics;
  faceBoundingBox?: { xMin: number; yMin: number; width: number; height: number };
}

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
  isDefault: boolean;
}

export type GovernorMode = 'PERFORMANCE' | 'BALANCED' | 'POWER_SAVER' | 'IDLE';

export interface GovernorStatus {
  mode: GovernorMode;
  targetFps: number;
  isOnBattery: boolean;
  isUserIdle: boolean;
  cpuLoadPercent: number;
  cameraActive: boolean;
}
