import { t } from '@eyeposture/i18n';

export const applyThemeToDOM = (resolvedTheme: 'dark' | 'light') => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolvedTheme === 'light') {
    root.classList.remove('dark', 'theme-dark');
    root.classList.add('light', 'theme-light');
  } else {
    root.classList.remove('light', 'theme-light');
    root.classList.add('dark', 'theme-dark');
  }
};

export const triggerOverlayAlert = (type: string = 'DISTANCE', title?: string, message?: string) => {
  let defTitle = 'Cảnh báo khoảng cách màn hình';
  let defMsg = 'Bạn đang ngồi quá gần màn hình (<45cm). Vui lòng lùi lại!';
  if (type.includes('POSTURE')) {
    defTitle = 'Cảnh báo tư thế ngồi';
    defMsg = 'Phát hiện gù lưng hoặc cúi đầu quá thấp. Hãy ngồi thẳng lưng!';
  } else if (type.includes('BLINK')) {
    defTitle = 'Nhắc nhở chớp mắt';
    defMsg = 'Hãy chớp mắt vài lần để duy trì độ ẩm giác mạc!';
  } else if (type.includes('BREAK')) {
    defTitle = 'Đã đến giờ nghỉ mắt!';
    defMsg = 'Quy tắc 20-20-20: Hãy nhìn xa 20 feet trong 20 giây.';
  }
  (window as any).electronApi?.showOverlayAlert?.({
    type,
    title: title || defTitle,
    message: message || defMsg,
    durationMs: 4500,
  });
};

export const syncElectronStartup = (enabled: boolean) => {
  try {
    if (typeof (window as any).electronApi?.setStartup === 'function') {
      (window as any).electronApi.setStartup(Boolean(enabled));
    }
  } catch (err) {
    console.warn('[Startup] Sync error:', err);
  }
};

export const createFallbackBaseline = (
  currentCamId: string,
  distanceRatio: number,
  headAngles?: { pitch?: number; roll?: number }
) => ({
  baselineFaceDistanceRatio: distanceRatio > 0 ? 0.185 * distanceRatio : 0.185,
  baselineFaceWidth: 0.22,
  baselinePitch: headAngles?.pitch ?? 8,
  baselineRoll: headAngles?.roll ?? 0,
  baselineY: 0.52,
  cameraDeviceId: currentCamId,
  calibratedAt: new Date().toISOString(),
});
