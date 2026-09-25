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
  Bell,
  Lock,
  Crown,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';
import { CalibrationModal } from '../components/CalibrationModal.js';

export const MonitorPage: React.FC = () => {
  const {
    settings,
    liveAnalysis,
    connectedCameras,
    selectedCameraId,
    selectCamera,
    cameraStream,
    cameraError,
    startCamera,
    stopCamera,
    useSimulatedCamera,
    setUseSimulatedCamera,
    simulationMode,
    setSimulationMode,
    triggerOverlayAlert,
    currentUser,
    subscriptionTier,
    openAuthModal,
  } = useApp();

  const isProOrFamily = subscriptionTier === 'PRO' || subscriptionTier === 'FAMILY';

  const [isCalibOpen, setIsCalibOpen] = useState<boolean>(false);
  const [guestSimulatorMode, setGuestSimulatorMode] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // If user is not logged in and not in guest simulator demo, stop camera
  useEffect(() => {
    if (!currentUser && cameraStream) {
      stopCamera();
    }
  }, [currentUser, cameraStream, stopCamera]);

  // Auto-start camera when entering MonitorPage if logged in and camera not running
  useEffect(() => {
    if (currentUser && !cameraStream && !useSimulatedCamera && !cameraError) {
      startCamera();
    }
  }, [currentUser, cameraStream, useSimulatedCamera, cameraError, startCamera]);

  // Bind live camera stream to HTMLVideoElement
  useEffect(() => {
    if (videoRef.current && cameraStream && !useSimulatedCamera && currentUser) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((err) => {
        console.warn('Video stream autoplay failed:', err);
      });
    }
  }, [cameraStream, useSimulatedCamera, currentUser]);

  // 1. GATEKEEPER LOCK SCREEN FOR GUEST / NOT LOGGED IN
  if (!currentUser && !guestSimulatorMode) {
    return (
      <div className="p-8 space-y-8 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-100 flex items-center gap-2.5">
              <span>{t('monitor.title')}</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Yêu cầu Đăng nhập
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t('monitor.subtitle')}
            </p>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 active:scale-95 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Đăng nhập ngay</span>
          </button>
        </div>

        {/* Hero Lock Gatekeeper Box */}
        <div className="glass-card p-8 md:p-12 relative overflow-hidden border-teal-500/40 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 shadow-2xl flex flex-col items-center text-center">
          {/* Decorative neon background blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Central Pulsing Lock Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500/20 via-cyan-500/20 to-indigo-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shadow-xl shadow-teal-500/10">
              <Camera className="w-10 h-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <span className="text-[11px] font-black tracking-widest text-teal-400 uppercase mb-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
            TÍNH NĂNG CÔNG THÁI HỌC AI ĐỘC QUYỀN
          </span>
          <h3 className="font-display font-black text-2xl md:text-3xl text-slate-100 max-w-xl leading-tight">
            Đăng Nhập Để Kích Hoạt Giám Sát Camera & Nhận Diện Tư Thế AI
          </h3>
          <p className="text-sm text-slate-300 mt-3 max-w-xl leading-relaxed">
            Hệ thống thị giác máy tính độc quyền của EyePosture sử dụng trí tuệ nhân tạo để phân tích tư thế ngồi, khoảng cách mắt đến màn hình và tần số chớp mắt trong thời gian thực.
          </p>

          {/* 4 Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-2xl text-left">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                <ScanFace className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">Nhận diện tư thế & Gù lưng</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Cảnh báo ngay lập tức khi bạn gập cổ, chùng lưng hoặc ngồi xiêu vẹo gây hại cột sống.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">Đo khoảng cách mắt an toàn</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Tự động ước tính khoảng cách mắt chuẩn 50–70cm, phòng ngừa suy giảm thị lực và tăng độ cận.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">Chống mỏi mắt ErgoBlink</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Theo dõi chớp mắt, giảm thiểu hội chứng khô giác mạc và căng thẳng thần kinh thị giác.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">Bảo mật 100% On-Device</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Toàn bộ khung hình camera được tính toán cục bộ, cam kết không ghi hình hay gửi dữ liệu ra ngoài.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8 w-full max-w-md">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3.5 px-6 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-xl shadow-teal-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              <span>Đăng nhập tài khoản ngay</span>
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs active:scale-95 transition-all"
            >
              <span>Tạo tài khoản mới</span>
            </button>
          </div>

          {/* Guest Simulator Option */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 w-full max-w-md flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Muốn xem thử giao diện hoạt động?</span>
            <button
              onClick={() => {
                setGuestSimulatorMode(true);
                setUseSimulatedCamera(true);
              }}
              className="text-teal-400 hover:underline font-semibold"
            >
              Mở chế độ Giả lập (Simulator Demo)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">{t('monitor.title')}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('monitor.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerOverlayAlert('DISTANCE')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 hover:border-teal-500/40 border border-slate-700 text-slate-200 font-semibold text-xs transition-all active:scale-95"
            title="Thử nghiệm popup cảnh báo nhảy ra đè lên mọi màn hình"
          >
            <Bell className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            <span>Thử popup đè màn hình</span>
          </button>
          <button
            onClick={() => setIsCalibOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
          >
            <Target className="w-4 h-4" />
            <span>{t('calibration.recalibrateButton')}</span>
          </button>
        </div>
      </div>

      {/* Tier Warning / Guest Banner */}
      {!currentUser ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>Chế độ Khách (Giả lập Demo)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">CAMERA THỰC TẾ ĐANG KHÓA</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bạn đang xem thử giao diện mô phỏng thuật toán AI. Đăng nhập tài khoản để mở khóa camera webcam thật.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGuestSimulatorMode(false)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Thoát giả lập
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 active:scale-95 transition-all whitespace-nowrap"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      ) : !isProOrFamily ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <span>Tài khoản Miễn phí (Free Edition)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">CƠ BẢN</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nâng cấp lên PRO hoặc FAMILY để mở khóa Phân tích Góc nghiêng 3D y khoa & Phân tích chớp mắt nâng cao.
              </p>
            </div>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('eyeposture:navigate', { detail: 'subscription' }))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap ml-3"
          >
            <Crown className="w-4 h-4" />
            <span>Nâng PRO</span>
          </button>
        </div>
      ) : null}

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
                title={t('monitor.reconnectCamera')}
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
                if (!currentUser) {
                  openAuthModal('login');
                  return;
                }
                setUseSimulatedCamera(false);
                if (!cameraStream) startCamera();
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                !useSimulatedCamera && currentUser
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {!currentUser && <Lock className="w-3 h-3 text-amber-400" />}
              <Camera className="w-3.5 h-3.5" />
              <span>{t('monitor.liveWebcam')} {!currentUser ? '(Khóa)' : ''}</span>
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
              <span>{t('monitor.simulator')}</span>
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
                          !liveAnalysis.faceDetected
                            ? 'border-slate-600/60 border-dashed text-slate-400'
                            : liveAnalysis.distanceState === 'TOO_CLOSE'
                            ? 'border-rose-400/90 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                            : liveAnalysis.postureState === 'POOR'
                            ? 'border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                            : 'border-teal-400/80 shadow-[0_0_25px_rgba(20,184,166,0.3)]'
                        }`}
                        style={{
                          width: `${Math.min(340, Math.max(180, 200 * (liveAnalysis.faceDetected ? liveAnalysis.distanceRatio : 1.0)))}px`,
                          height: `${Math.min(360, Math.max(220, 240 * (liveAnalysis.faceDetected ? liveAnalysis.distanceRatio : 1.0)))}px`,
                          transform: `rotate(${liveAnalysis.faceDetected ? liveAnalysis.headAngles.roll : 0}deg)`,
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
                            {!liveAnalysis.faceDetected
                              ? 'CHƯA PHÁT HIỆN MẶT'
                              : liveAnalysis.distanceState === 'TOO_CLOSE'
                              ? t('monitor.statusTooClose')
                              : liveAnalysis.slouchDetected
                              ? t('monitor.statusSlouch')
                              : t('monitor.statusAligned')}
                          </span>
                          <span className="w-3 h-3 border-b-2 border-r-2 border-current" />
                        </div>
                      </div>
                    </div>

                    {/* Top live watermark */}
                    <div className="absolute top-3 left-4 flex items-center gap-2 text-[11px] font-mono text-slate-200 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/60 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{t('monitor.liveCameraStream')}</span>
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
                        <h4 className="text-sm font-semibold text-slate-200">{t('monitor.cameraErrorTitle')}</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">{cameraError}</p>
                        <div className="pt-2 flex items-center justify-center gap-3">
                          <button
                            onClick={() => startCamera(selectedCameraId)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-md"
                          >
                            {t('monitor.retryConnection')}
                          </button>
                          <button
                            onClick={() => setUseSimulatedCamera(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs border border-slate-700"
                          >
                            {t('monitor.useSimulator')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto opacity-70" />
                        <h4 className="text-sm font-semibold text-slate-200">{t('monitor.cameraInitializing')}</h4>
                        <p className="text-xs text-slate-400">{t('monitor.cameraInitWait')}</p>
                        <div className="pt-2">
                          <button
                            onClick={() => startCamera(selectedCameraId)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs hover:bg-teal-500/30 transition font-medium"
                          >
                            Bật Camera
                          </button>
                        </div>
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
                      ? t('monitor.statusTooClose')
                      : liveAnalysis.slouchDetected
                      ? t('monitor.statusSlouch')
                      : t('monitor.statusAligned')}
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
              <span className="flex items-center gap-3">
                <span>Scale: <b className="text-slate-200">{liveAnalysis.faceDetected ? `${liveAnalysis.distanceRatio}x` : '--'}</b></span>
                <span>EAR: <b className="text-slate-200">{liveAnalysis.faceDetected ? (liveAnalysis.blinkMetrics?.averageEar ?? 0.28) : '--'}</b></span>
              </span>
            </div>
          </div>

          {/* Synthetic Testing Harness Controls (Visible when Simulator is active) */}
          {useSimulatedCamera && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">{t('monitor.testHarness')}</span>
                <span className="text-[11px] text-teal-400">{t('monitor.testHarnessHint')}</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                {(['UPRIGHT', 'SLOUCH', 'TOO_CLOSE', 'TILT', 'PROLONGED_STARE', 'BLINKING'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSimulationMode(mode)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all ${
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
              <span>{t('common.status')}</span>
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
                {liveAnalysis.faceDetected ? `~${liveAnalysis.distanceEstimateCm} ${t('monitor.distanceUnit')}` : `-- ${t('monitor.distanceUnit')}`}
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
                {t('monitor.safeDistance')}
              </div>
              <div
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center ${
                  liveAnalysis.distanceState === 'TOO_CLOSE'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {t('monitor.tooCloseDistance')}
              </div>
            </div>
          </div>

          {/* Eye Blink & Ocular Comfort Card (ErgoBlink Integration) */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-400" />
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  {t('blink.title')}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                !settings?.blink?.enabled
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : (liveAnalysis.blinkMetrics?.eyeStrainScore ?? 0) < 35
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : (liveAnalysis.blinkMetrics?.eyeStrainScore ?? 0) < 70
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {!settings?.blink?.enabled
                  ? t('blink.disabledStatus')
                  : (liveAnalysis.blinkMetrics?.eyeStrainScore ?? 0) < 35
                  ? t('blink.normalEyeStrain')
                  : (liveAnalysis.blinkMetrics?.eyeStrainScore ?? 0) < 70
                  ? t('blink.moderateEyeStrain')
                  : t('blink.highEyeStrain')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">{t('blink.blinkRate')}</span>
                <span className="font-mono text-lg font-bold text-slate-100">
                  {liveAnalysis.blinkMetrics?.blinksPerMinute ?? 16}
                </span>
                <span className="text-[10px] text-slate-500 block">{t('blink.blinksPerMin')}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">{t('blink.comfortScore')}</span>
                <span className="font-mono text-lg font-bold text-teal-400">
                  {Math.max(0, 100 - (liveAnalysis.blinkMetrics?.eyeStrainScore ?? 15))}%
                </span>
                <span className="text-[10px] text-slate-500 block">Index</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">{t('blink.secondsSinceLast')}</span>
                <span className="font-mono text-lg font-bold text-slate-100">
                  {liveAnalysis.blinkMetrics?.secondsSinceLastBlink ?? 1.5}s
                </span>
                <span className="text-[10px] text-slate-500 block">Ago</span>
              </div>
            </div>

            {settings?.blink?.enabled && liveAnalysis.blinkMetrics?.prolongedStareDetected && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{t('blink.staringAlertDesc').replace('{seconds}', String(Math.round(liveAnalysis.blinkMetrics.secondsSinceLastBlink)))}</span>
              </div>
            )}
          </div>

          {/* Biometric Angles */}
          <div className="glass-card p-6 space-y-4 relative overflow-hidden">
            {!isProOrFamily && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-5 text-center z-10 border border-amber-500/30 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-2 shadow-inner">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" /> DÀNH RIÊNG CHO PRO & FAMILY
                </span>
                <p className="text-[11px] text-slate-300 mt-1 max-w-[240px] leading-relaxed">
                  Đo lường góc nghiêng 3D (Pitch / Roll / Yaw) phát hiện hội chứng cổ rùa và sai lệch cột sống.
                </p>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      openAuthModal('login');
                    } else {
                      window.dispatchEvent(new CustomEvent('eyeposture:navigate', { detail: 'subscription' }));
                    }
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{!currentUser ? 'Đăng nhập để mở khóa' : 'Nâng cấp mở khóa'}</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                {t('monitor.facialAngles')}
              </h4>
              {isProOrFamily && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {subscriptionTier === 'FAMILY' ? '💎 FAMILY' : '👑 PRO'}
                </span>
              )}
            </div>

            <div className={`space-y-3 ${!isProOrFamily ? 'opacity-30 filter blur-[1px]' : ''}`}>
              {/* Pitch */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{t('monitor.headPitch')} {t('monitor.lookingDown')}</span>
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
                  <span>{t('monitor.headRoll')} {t('monitor.tiltingSideways')}</span>
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
                  <span>{t('monitor.headYaw')}</span>
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
