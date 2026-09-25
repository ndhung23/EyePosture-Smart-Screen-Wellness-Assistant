import { AuthService } from './AuthService.js';

export interface VersionInfo {
  latestVersion: string;
  releaseNotes: string;
  downloadUrl: string;
  mandatory?: boolean;
  publishedAt?: string;
}

export class UpdateService {
  /**
   * Compare two semver strings: returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  public static compareVersions(v1: string, v2: string): number {
    const clean1 = (v1 || '').replace(/^[vV]/, '').trim();
    const clean2 = (v2 || '').replace(/^[vV]/, '').trim();

    const parts1 = clean1.split('.').map((p) => parseInt(p, 10) || 0);
    const parts2 = clean2.split('.').map((p) => parseInt(p, 10) || 0);

    const length = Math.max(parts1.length, parts2.length);
    for (let i = 0; i < length; i++) {
      const p1 = parts1[i] ?? 0;
      const p2 = parts2[i] ?? 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }

  public static async getCurrentVersion(): Promise<string> {
    try {
      const electronApi = (window as any).electronApi;
      if (electronApi?.getAppVersion) {
        const ver = await electronApi.getAppVersion();
        if (ver) return ver;
      }
    } catch {}
    return '1.0.0';
  }

  public static async checkForUpdates(): Promise<{
    hasUpdate: boolean;
    currentVersion: string;
    versionInfo?: VersionInfo;
    error?: string;
  }> {
    const currentVersion = await UpdateService.getCurrentVersion();
    try {
      const res = await AuthService.apiFetch('/api/version');
      if (!res.ok) {
        return { hasUpdate: false, currentVersion, error: 'Không thể kiểm tra phiên bản mới' };
      }
      const data: VersionInfo = await res.json();
      const hasUpdate = UpdateService.compareVersions(data.latestVersion, currentVersion) > 0;
      return {
        hasUpdate,
        currentVersion,
        versionInfo: data,
      };
    } catch (err: any) {
      return { hasUpdate: false, currentVersion, error: err.message || 'Lỗi mạng' };
    }
  }

  public static async downloadAndInstall(
    downloadUrl: string,
    onProgress?: (progress: { percent: number; receivedBytes: number; totalBytes: number }) => void
  ): Promise<{ success: boolean; error?: string }> {
    const electronApi = (window as any).electronApi;
    if (electronApi?.downloadAndInstallUpdate) {
      let cleanup: (() => void) | undefined;
      if (onProgress && electronApi.onUpdateDownloadProgress) {
        cleanup = electronApi.onUpdateDownloadProgress(onProgress);
      }
      try {
        const res = await electronApi.downloadAndInstallUpdate(downloadUrl);
        if (cleanup) cleanup();
        return res;
      } catch (e: any) {
        if (cleanup) cleanup();
        return { success: false, error: e.message };
      }
    } else {
      // Fallback: open in browser
      return UpdateService.openInBrowser(downloadUrl);
    }
  }

  public static async openInBrowser(url: string): Promise<{ success: boolean; error?: string }> {
    const electronApi = (window as any).electronApi;
    if (electronApi?.openExternal) {
      await electronApi.openExternal(url);
      return { success: true };
    } else {
      window.open(url, '_blank');
      return { success: true };
    }
  }
}
