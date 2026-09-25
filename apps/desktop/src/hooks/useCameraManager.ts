import { useState, useRef, useEffect, useCallback } from 'react';
import { CameraDeviceInfo } from '@eyeposture/shared-types';

export interface UseCameraManagerOptions {
  onStreamActive?: (stream: MediaStream) => void;
  onStreamStopped?: () => void;
}

export function useCameraManager(options: UseCameraManagerOptions = {}) {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [connectedCameras, setConnectedCameras] = useState<CameraDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('default');
  const [useSimulatedCamera, setUseSimulatedCamera] = useState<boolean>(false);

  const activeStreamRef = useRef<MediaStream | null>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const isStartingRef = useRef<boolean>(false);
  const optionsRef = useRef(options);
  const selectedCameraIdRef = useRef(selectedCameraId);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    selectedCameraIdRef.current = selectedCameraId;
  }, [selectedCameraId]);

  // Stop and release all tracks on the active hardware camera stream
  const releaseStream = useCallback(() => {
    if (activeStreamRef.current) {
      try {
        activeStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (err) {
        console.warn('[CameraManager] Error stopping tracks:', err);
      }
      activeStreamRef.current = null;
    }
    if (hiddenVideoRef.current) {
      hiddenVideoRef.current.srcObject = null;
    }
  }, []);

  const enumerateCameras = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      if (videoDevices.length > 0) {
        setConnectedCameras(
          videoDevices.map((d, idx) => ({
            deviceId: d.deviceId || `cam-${idx}`,
            label: d.label || `Camera ${idx + 1}`,
            isDefault: idx === 0,
          }))
        );
      }
    } catch (err) {
      console.warn('[CameraManager] Failed to enumerate cameras:', err);
    }
  }, []);

  const startCamera = useCallback(
    async (deviceId?: string) => {
      if (isStartingRef.current) return;
      isStartingRef.current = true;
      try {
        setCameraError(null);
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera API (getUserMedia) not supported in this environment');
        }

        // Always release prior hardware stream lock before acquiring new one
        releaseStream();

        const targetId = deviceId || selectedCameraIdRef.current;
        let stream: MediaStream | null = null;

        // Attempt 1: Exact target device
        if (targetId && targetId !== 'default') {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: targetId }, width: { ideal: 640 }, height: { ideal: 480 } },
              audio: false,
            });
          } catch (devErr) {
            console.warn(`[CameraManager] Exact deviceId ${targetId} failed, trying ideal:`, devErr);
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { ideal: targetId }, width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
              });
            } catch {
              stream = null;
            }
          }
        }

        // Attempt 2: Standard desktop resolution fallback
        if (!stream) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 640 }, height: { ideal: 480 } },
              audio: false,
            });
          } catch {
            // Attempt 3: Bare minimum constraint fallback
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          }
        }

        activeStreamRef.current = stream;
        setCameraStream(stream);
        setUseSimulatedCamera(false);

        // Bind stream to hidden processing video element
        if (hiddenVideoRef.current) {
          const v = hiddenVideoRef.current;
          v.srcObject = stream;
          v.onloadedmetadata = () => {
            v.play().catch((playErr) => console.warn('[CameraManager] Hidden video play failed:', playErr));
          };
          v.play().catch(() => {});
        }

        optionsRef.current.onStreamActive?.(stream);
        await enumerateCameras();
      } catch (err: any) {
        console.warn('[CameraManager] Webcam start failed:', err);
        releaseStream();
        setCameraStream(null);
        setCameraError(err.message || 'Không thể truy cập camera thực tế');
        setUseSimulatedCamera(true);
      } finally {
        isStartingRef.current = false;
      }
    },
    [releaseStream, enumerateCameras]
  );

  const stopCamera = useCallback(() => {
    releaseStream();
    setCameraStream(null);
    optionsRef.current.onStreamStopped?.();
  }, [releaseStream]);

  // Initialize hidden video element on mount
  useEffect(() => {
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
    v.style.position = 'fixed';
    v.style.top = '-9999px';
    v.style.left = '-9999px';
    v.style.width = '640px';
    v.style.height = '480px';
    v.style.opacity = '0';
    v.style.pointerEvents = 'none';
    document.body.appendChild(v);
    hiddenVideoRef.current = v;

    enumerateCameras();

    return () => {
      releaseStream();
      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.srcObject = null;
        hiddenVideoRef.current.remove();
        hiddenVideoRef.current = null;
      }
    };
  }, [enumerateCameras, releaseStream]);

  return {
    cameraStream,
    cameraError,
    connectedCameras,
    selectedCameraId,
    setSelectedCameraId,
    useSimulatedCamera,
    setUseSimulatedCamera,
    hiddenVideoRef,
    startCamera,
    stopCamera,
    enumerateCameras,
  };
}
