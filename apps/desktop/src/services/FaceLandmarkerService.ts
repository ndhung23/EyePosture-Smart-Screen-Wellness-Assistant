import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { KeyFacialLandmarks } from '@eyeposture/vision';

export class FaceLandmarkerService {
  private static instance: FaceLandmarkerService | null = null;
  private landmarker: FaceLandmarker | null = null;
  private isInitializing: boolean = false;
  private initialized: boolean = false;
  private lastTimestamp: number = 0;

  public static getInstance(): FaceLandmarkerService {
    if (!FaceLandmarkerService.instance) {
      FaceLandmarkerService.instance = new FaceLandmarkerService();
    }
    return FaceLandmarkerService.instance;
  }

  public isReady(): boolean {
    return this.initialized && this.landmarker !== null;
  }

  public async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;
    console.log('[FaceLandmarkerService] Initializing MediaPipe FaceLandmarker...');

    try {
      // 1. Resolve Vision Tasks Wasm files
      let vision;
      try {
        const wasmPath = window.location.protocol === 'file:' 
          ? 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
          : './wasm';
        vision = await FilesetResolver.forVisionTasks(wasmPath);
      } catch (wasmErr) {
        console.warn('[FaceLandmarkerService] Local wasm failed, falling back to CDN:', wasmErr);
        vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
      }

      // 2. Create FaceLandmarker instance (GPU first with CPU fallback)
      const modelCandidates = [
        window.location.protocol === 'file:' ? null : './models/face_landmarker.task',
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      ].filter(Boolean) as string[];

      let created = false;
      for (const modelPath of modelCandidates) {
        try {
          this.landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: modelPath,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: 0.5,
            minFacePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
          created = true;
          console.log(`[FaceLandmarkerService] Loaded model from: ${modelPath} (GPU mode)`);
          break;
        } catch (gpuErr) {
          console.warn(`[FaceLandmarkerService] GPU init failed for ${modelPath}, trying CPU...`, gpuErr);
          try {
            this.landmarker = await FaceLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: modelPath,
                delegate: 'CPU',
              },
              runningMode: 'VIDEO',
              numFaces: 1,
              minFaceDetectionConfidence: 0.5,
              minFacePresenceConfidence: 0.5,
              minTrackingConfidence: 0.5,
            });
            created = true;
            console.log(`[FaceLandmarkerService] Loaded model from: ${modelPath} (CPU mode)`);
            break;
          } catch (cpuErr) {
            console.warn(`[FaceLandmarkerService] CPU init also failed for ${modelPath}:`, cpuErr);
          }
        }
      }

      if (!created || !this.landmarker) {
        throw new Error('Unable to initialize FaceLandmarker with any model candidate.');
      }

      this.initialized = true;
      console.log('[FaceLandmarkerService] MediaPipe FaceLandmarker successfully initialized.');
      return true;
    } catch (err) {
      console.error('[FaceLandmarkerService] Initialization failed:', err);
      this.initialized = false;
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Detects key facial landmarks from an HTMLVideoElement frame
   */
  public detect(video: HTMLVideoElement, timestampMs: number = performance.now()): KeyFacialLandmarks | null {
    if (!this.landmarker || !this.initialized) {
      return null;
    }

    // Ensure video is playing and has valid dimensions
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0 || video.paused) {
      return null;
    }

    // Ensure timestamps strictly increase
    const currentTs = timestampMs <= this.lastTimestamp ? this.lastTimestamp + 1 : timestampMs;
    this.lastTimestamp = currentTs;

    try {
      const results = this.landmarker.detectForVideo(video, currentTs);
      if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
        return null;
      }

      const pts = results.faceLandmarks[0];
      if (pts.length < 468) {
        return null;
      }

      // Map indices matching MediaPipe FaceMesh & EyePosture documentation:
      // Left Eye: Outer=33, Inner=133, Top=159, Bottom=145
      // Right Eye: Outer=263, Inner=362, Top=386, Bottom=374
      // Forehead=10, Chin=152, NoseTip=1, Ears=234, 454
      return {
        noseTip: { x: pts[1].x, y: pts[1].y, z: pts[1].z },
        forehead: { x: pts[10].x, y: pts[10].y, z: pts[10].z },
        chin: { x: pts[152].x, y: pts[152].y, z: pts[152].z },
        leftEyeOuter: { x: pts[33].x, y: pts[33].y, z: pts[33].z },
        leftEyeInner: { x: pts[133].x, y: pts[133].y, z: pts[133].z },
        rightEyeInner: { x: pts[362].x, y: pts[362].y, z: pts[362].z },
        rightEyeOuter: { x: pts[263].x, y: pts[263].y, z: pts[263].z },
        leftEyeTop: { x: pts[159].x, y: pts[159].y, z: pts[159].z },
        leftEyeBottom: { x: pts[145].x, y: pts[145].y, z: pts[145].z },
        rightEyeTop: { x: pts[386].x, y: pts[386].y, z: pts[386].z },
        rightEyeBottom: { x: pts[374].x, y: pts[374].y, z: pts[374].z },
        leftEar: { x: pts[234].x, y: pts[234].y, z: pts[234].z },
        rightEar: { x: pts[454].x, y: pts[454].y, z: pts[454].z },
      };
    } catch (err) {
      console.warn('[FaceLandmarkerService] Frame detection failed:', err);
      return null;
    }
  }

  public close(): void {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {}
      this.landmarker = null;
    }
    this.initialized = false;
  }
}
