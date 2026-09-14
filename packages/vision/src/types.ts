import { Point3D } from '@eyeposture/shared-types';

export interface KeyFacialLandmarks {
  noseTip: Point3D;
  chin: Point3D;
  forehead: Point3D;
  leftEyeOuter: Point3D;
  leftEyeInner: Point3D;
  rightEyeOuter: Point3D;
  rightEyeInner: Point3D;
  leftEar?: Point3D;
  rightEar?: Point3D;
}

export interface RawVisionMetrics {
  timestamp: number;
  faceDetected: boolean;
  confidence: number;
  faceWidth: number;
  interPupillaryDistance: number;
  centerY: number;
  pitch: number; // degrees
  roll: number;  // degrees
  yaw: number;   // degrees
}
