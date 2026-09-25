import React, { useState, useEffect } from 'react';
import { Sparkles, Download, RefreshCw, X, ExternalLink, AlertCircle, ArrowUpCircle } from 'lucide-react';
import { UpdateService, VersionInfo } from '../services/UpdateService.js';

interface UpdateModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  autoCheckOnMount?: boolean;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  autoCheckOnMount = true,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('');

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const handleClose = () => {
    if (downloading) return; // Prevent closing while downloading
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
  };

  const runCheck = async (quiet = false) => {
    setChecking(true);
    setErrorMessage(null);
    try {
      const res = await UpdateService.checkForUpdates();
      setCurrentVersion(res.currentVersion);
      if (res.hasUpdate && res.versionInfo) {
        setVersionInfo(res.versionInfo);
        setInternalOpen(true);
      } else if (!quiet) {
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setErrorMessage('Bạn đang sử dụng phiên bản mới nhất (' + res.currentVersion + ')');
        }
        setInternalOpen(true);
      }
    } catch (e: any) {
      if (!quiet) {
        setErrorMessage(e.message || 'Lỗi kiểm tra cập nhật');
        setInternalOpen(true);
      }
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (autoCheckOnMount) {
      // Delay auto-check 3.5 seconds after app starts so startup is fast
      const timer = setTimeout(() => {
        runCheck(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [autoCheckOnMount]);

  // Listen to manual open events
  useEffect(() => {
    const handleManualCheck = () => {
      runCheck(false);
    };
    window.addEventListener('eyeposture:check-update', handleManualCheck);
    return () => {
      window.removeEventListener('eyeposture:check-update', handleManualCheck);
    };
  }, []);

  const handleStartUpdate = async () => {
    if (!versionInfo?.downloadUrl) return;
    setDownloading(true);
    setDownloadProgress(0);
    setErrorMessage(null);
    setStatusText('Đang tải bản cập nhật... 0%');

    const res = await UpdateService.downloadAndInstall(versionInfo.downloadUrl, (progress) => {
      setDownloadProgress(progress.percent);
      setStatusText(`Đang tải bản cập nhật... ${progress.percent}%`);
      if (progress.percent >= 100) {
        setStatusText('Tải hoàn tất! Đang khởi động bộ cài...');
      }
    });

    if (!res.success) {
      setDownloading(false);
      setErrorMessage(res.error || 'Tải bản cập nhật thất bại. Vui lòng thử tải qua trình duyệt.');
    }
  };

  const handleOpenBrowser = () => {
    if (versionInfo?.downloadUrl) {
      UpdateService.openInBrowser(versionInfo.downloadUrl);
    }
  };

  if (!isOpen) return null;

  const hasNewer = versionInfo && UpdateService.compareVersions(versionInfo.latestVersion, currentVersion) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header Background Glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent pointer-events-none" />

        {/* Top bar */}
        <div className="relative flex items-center justify-between p-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950">
              <Sparkles className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100">
                {hasNewer ? 'Có Bản Cập Nhật Mới!' : 'Kiểm Tra Bản Cập Nhật'}
              </h3>
              <p className="text-xs text-slate-400">
                EyePosture Smart Screen Wellness Assistant
              </p>
            </div>
          </div>
          {!downloading && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="relative p-6 space-y-5">
          {checking ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
              <p className="text-sm text-slate-300">Đang kiểm tra máy chủ...</p>
            </div>
          ) : hasNewer ? (
            <>
              {/* Version Comparison Pill */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Hiện tại:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-700 font-mono text-slate-300 font-semibold">
                    v{currentVersion}
                  </span>
                </div>
                <ArrowUpCircle className="w-4 h-4 text-teal-400" />
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Mới nhất:</span>
                  <span className="px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono font-bold">
                    v{versionInfo?.latestVersion}
                  </span>
                </div>
              </div>

              {/* Release Notes */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Nội dung cập nhật:
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                  {versionInfo?.releaseNotes}
                </div>
              </div>

              {/* Download Progress Bar */}
              {downloading && (
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-800/40 border border-teal-500/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-teal-300 font-medium">{statusText}</span>
                    <span className="font-mono text-slate-300">{downloadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300 ease-out"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Ứng dụng sẽ tự động chạy bộ cài đặt và khởi động lại sau khi tải xong.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-200">
                  Bạn đang sử dụng phiên bản mới nhất!
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Phiên bản hiện tại: <span className="font-mono text-teal-300 font-bold">v{currentVersion}</span>
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
          {hasNewer ? (
            <>
              <button
                type="button"
                onClick={handleOpenBrowser}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Tải qua web</span>
              </button>

              <div className="flex items-center gap-2">
                {!downloading && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Để sau
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleStartUpdate}
                  disabled={downloading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-60"
                >
                  {downloading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Cập nhật ngay</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
