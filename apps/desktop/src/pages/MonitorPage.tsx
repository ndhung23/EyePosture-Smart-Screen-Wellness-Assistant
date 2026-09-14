import React, { useState, useRef, useEffect } from 'react';
import {
  ScanFace,
  Eye,
  ShieldCheck,
  Video,
  Target,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Camera,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';
import { CalibrationModal } from '../components/CalibrationModal.js';

export const MonitorPage: React.FC = () => {
  const {
    liveAnalysis,
    connectedCameras,
    selectedCameraId,
    selectCamera,
    cameraStream,
    cameraError,
    startCamera,
    useSimulatedCamera,
    setUseSimulatedCamera,
    simulationMode,
    setSimulationMode,
  } = useApp();

  const [isCalibOpen, setIsCalibOpen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Bind live camera stream to HTMLVideoElement
  useEffect(() => {
    if (videoRef.current && cameraStream && !useSimulatedCamera) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((err) => {
        console.warn('Video stream autoplay failed:', err);
      });
    }
  }, [cameraStream, useSimulatedCamera]);

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">{t('monitor.title')}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time biometric posture angle and viewing distance estimation
          </p>
        </div>
        <button
          onClick={() => setIsCalibOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
        >
          <Target className="w-4 h-4" />
          <span>{t('calibration.recalibrateButton')}</span>
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
        <p className="text-xs text-teal-200 leading-relaxed">{t('monitor.privacyNote')}</p>
      </div>

      {/* Main Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Camera Feed / Visualizer (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
              <Video className="w-4 h-4 text-teal-400" />
              <span>{t('monitor.livePreview')}</span>
            </div>

            {/* Camera selector & Mode selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCameraId}
                onChange={(e) => selectCamera(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                {connectedCameras.map((cam) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => startCamera(selectedCameraId)}
                title="Khởi động lại Camera"
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mode Switch Pills */}
          <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setUseSimulatedCamera(false);
                if (!cameraStream) startCamera();
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                !useSimulatedCamera
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera thật (Live Webcam)</span>
            </button>
            <button
              onClick={() => setUseSimulatedCamera(true)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                useSimulatedCamera
                  ? 'bg-indigo-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chế độ mô phỏng (Simulator)</span>
            </button>
          </div>

          {/* Camera Viewport Canvas */}
          <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            {/* 1. REAL WEBCAM MODE */}
            {!useSimulatedCamera && (
              <>
                {cameraStream ? (
                  <div className="relative w-full h-full">
                    {/* Live Video Element */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100 rounded-2xl"
                    />

                    {/* Dark gradient overlay on edges for sleek modern aesthetics */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

                    {/* Biometric AR HUD Target Box */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div
                        className={`relative border-2 rounded-3xl transition-all duration-300 flex flex-col items-center justify-between p-3 ${
                          liveAnalysis.distanceState === 'TOO_CLOSE'
                            ? 'border-rose-400/90 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                            : liveAnalysis.postureState === 'POOR'
                            ? 'border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                            : 'border-teal-400/80 shadow-[0_0_25px_rgba(20,184,166,0.3)]'
                        }`}
                        style={{
                          width: `${Math.min(340, Math.max(180, 200 * liveAnalysis.distanceRatio))}px`,
                          height: `${Math.min(360, Math.max(220, 240 * liveAnalysis.distanceRatio))}px`,
                          transform: `rotate(${liveAnalysis.headAngles.roll}deg)`,
                        }}
                      >
                        {/* Corner Reticles */}
                        <div className="w-full flex justify-between">
                          <span className="w-3 h-3 border-t-2 border-l-2 border-current" />
                          <span className="w-3 h-3 border-t-2 border-r-2 border-current" />
                        </div>

                        {/* Center Target Crosshair */}
                        <div className="w-10 h-10 rounded-full border border-current/40 flex items-center justify-center text-current">
                          <ScanFace className="w-5 h-5 opacity-70" />
                        </div>

                        <div className="w-full flex justify-between items-end">
                          <span className="w-3 h-3 border-b-2 border-l-2 border-current" />
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-slate-950/80 px-2 py-0.5 rounded-full border border-current/40">
                            {liveAnalysis.distanceState === 'TOO_CLOSE'
                              ? 'QUÁ GẦN MÀN HÌNH'
                              : liveAnalysis.slouchDetected
                              ? 'CẦN THẲNG LƯNG'
                              : 'TƯ THẾ CHUẨN'}
                          </span>
                          <span className="w-3 h-3 border-b-2 border-r-2 border-current" />
                        </div>
                      </div>
                    </div>

                    {/* Top live watermark */}
                    <div className="absolute top-3 left-4 flex items-center gap-2 text-[11px] font-mono text-slate-200 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/60 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>LIVE CAMERA STREAM</span>
                    </div>
                  </div>
                ) : (
                  /* Camera Connecting / Error State */
                  <div className="text-center p-6 space-y-3">
                    {cameraError ? (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-200">Không thể kết nối Camera</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">{cameraError}</p>
                        <div className="pt-2 flex items-center justify-center gap-3">
                          <button
                            onClick={() => startCamera(selectedCameraId)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-md"
                          >
                            Thử lại kết nối
                          </button>
                          <button
                            onClick={() => setUseSimulatedCamera(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs border border-slate-700"
                          >
                            Dùng mô phỏng
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto opacity-70" />
                        <h4 className="text-sm font-semibold text-slate-200">Đang kích hoạt Camera...</h4>
                        <p className="text-xs text-slate-400">Vui lòng đợi vài giây để nạp luồng video từ thiết bị</p>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* 2. SIMULATOR MODE */}
            {useSimulatedCamera && (
              <>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

                <div
                  className={`relative border-2 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-4 ${
                    liveAnalysis.distanceState === 'TOO_CLOSE'
                      ? 'border-rose-400/80 bg-rose-500/10 scale-110 shadow-lg shadow-rose-500/20'
                      : liveAnalysis.postureState === 'POOR'
                      ? 'border-amber-400/80 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                      : 'border-teal-400/80 bg-teal-500/10 shadow-lg shadow-teal-500/20'
                  }`}
                  style={{
                    width: `${Math.min(320, 160 * liveAnalysis.distanceRatio)}px`,
                    height: `${Math.min(380, 200 * liveAnalysis.distanceRatio)}px`,
                    transform: `rotate(${liveAnalysis.headAngles.roll}deg)`,
                  }}
                >
                  <div className="w-12 h-12 rounded-full border border-current opacity-40 flex items-center justify-center">
                    <ScanFace className="w-6 h-6" />
                  </div>

                  <div className="absolute top-8 left-12 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  <div className="absolute top-8 right-12 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  <div className="absolute bottom-8 w-2 h-2 rounded-full bg-cyan-400" />

                  <span className="absolute bottom-2 text-[10px] font-mono uppercase tracking-wider opacity-80">
                    {liveAnalysis.distanceState === 'TOO_CLOSE'
                      ? 'TOO CLOSE'
                      : liveAnalysis.slouchDetected
                      ? 'SLOUCHING'
                      : 'ALIGNED'}
                  </span>
                </div>
              </>
            )}

            {/* Bottom Status bar overlay */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${!useSimulatedCamera && cameraStream ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                {!useSimulatedCamera && cameraStream ? 'Live Video Active' : 'Simulation Landmark Stream'}
              </span>
              <span>
                Scale Ratio: <b className="text-slate-200">{liveAnalysis.distanceRatio}x</b>
              </span>
            </div>
          </div>

          {/* Synthetic Testing Harness Controls (Visible when Simulator is active) */}
          {useSimulatedCamera && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Test Simulation Harness (Mock CV)</span>
                <span className="text-[11px] text-teal-400">Click to test instant reminder triggers</span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {(['UPRIGHT', 'SLOUCH', 'TOO_CLOSE', 'TILT'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSimulationMode(mode)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                      simulationMode === mode
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Metrics & Angle Gauges (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Posture Score Gauge */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                {t('monitor.postureScore')}
              </span>
              <span className="font-mono text-2xl font-bold text-slate-100">
                {liveAnalysis.postureScore} / 100
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  liveAnalysis.postureScore >= 90
                    ? 'gradient-emerald'
                    : liveAnalysis.postureScore >= 70
                    ? 'gradient-teal'
                    : 'gradient-amber'
                }`}
                style={{ width: `${liveAnalysis.postureScore}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Status</span>
              <span className="font-semibold text-slate-200">
                {liveAnalysis.slouchDetected ? t('monitor.slouchDetected') : t('monitor.slouchNormal')}
              </span>
            </div>
          </div>

          {/* Eye Distance Metric */}
          <div className="glass-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                {t('monitor.currentDistance')}
              </span>
              <span className="font-mono text-2xl font-bold text-slate-100">
                ~{liveAnalysis.distanceEstimateCm} {t('monitor.distanceUnit')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center ${
                  liveAnalysis.distanceState === 'SAFE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                Safe (50-70cm)
              </div>
              <div
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center ${
                  liveAnalysis.distanceState === 'TOO_CLOSE'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                Too Close (&lt;45cm)
              </div>
            </div>
          </div>

          {/* Biometric Angles */}
          <div className="glass-card p-6 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Facial Rotation Angles
            </h4>

            <div className="space-y-3">
              {/* Pitch */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{t('monitor.headPitch')} (Looking Down)</span>
                  <span className="font-mono">{liveAnalysis.headAngles.pitch}°</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.abs(liveAnalysis.headAngles.pitch) * 3)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Roll */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{t('monitor.headRoll')} (Tilting Sideways)</span>
                  <span className="font-mono">{liveAnalysis.headAngles.roll}°</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.abs(liveAnalysis.headAngles.roll) * 3)}%` }}
                  />
                </div>
              </div>

              {/* Yaw */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Head Rotation (Yaw)</span>
                  <span className="font-mono">{liveAnalysis.headAngles.yaw}°</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.abs(liveAnalysis.headAngles.yaw) * 3)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CalibrationModal isOpen={isCalibOpen} onClose={() => setIsCalibOpen(false)} />
    </div>
  );
};
