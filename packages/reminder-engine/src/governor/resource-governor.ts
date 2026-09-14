import { GovernorMode, GovernorStatus } from '@eyeposture/shared-types';

export interface GovernorInputs {
  isOnBattery: boolean;
  batteryLevelPercent: number; // 0 to 100
  cpuLoadPercent: number;     // 0 to 100
  isUserIdle: boolean;        // e.g. no keyboard/mouse for 3+ minutes
  cameraAvailable: boolean;
}

export class ResourceGovernor {
  private currentMode: GovernorMode = 'BALANCED';
  private targetFps: number = 5;
  private cameraActive: boolean = true;

  public evaluate(inputs: GovernorInputs): GovernorStatus {
    // 1. Camera unavailable -> pause vision processing
    if (!inputs.cameraAvailable) {
      this.currentMode = 'IDLE';
      this.targetFps = 0;
      this.cameraActive = false;
      return this.getStatus(inputs);
    }

    // 2. User idle (> 3 min away) -> pause camera inference to save power and thermal load
    if (inputs.isUserIdle) {
      this.currentMode = 'IDLE';
      this.targetFps = 0;
      this.cameraActive = false;
      return this.getStatus(inputs);
    }

    // 3. Laptop on battery or high CPU (>65%) -> Power Saver (2 FPS)
    if (inputs.isOnBattery || inputs.cpuLoadPercent > 65) {
      this.currentMode = 'POWER_SAVER';
      this.targetFps = 2;
      this.cameraActive = true;
      return this.getStatus(inputs);
    }

    // 4. Low CPU (<30%) and plugged in -> Balanced (5 FPS)
    this.currentMode = 'BALANCED';
    this.targetFps = 5;
    this.cameraActive = true;
    return this.getStatus(inputs);
  }

  public forceMode(mode: GovernorMode): void {
    this.currentMode = mode;
    switch (mode) {
      case 'PERFORMANCE':
        this.targetFps = 8;
        this.cameraActive = true;
        break;
      case 'BALANCED':
        this.targetFps = 5;
        this.cameraActive = true;
        break;
      case 'POWER_SAVER':
        this.targetFps = 2;
        this.cameraActive = true;
        break;
      case 'IDLE':
        this.targetFps = 0;
        this.cameraActive = false;
        break;
    }
  }

  public getStatus(inputs?: GovernorInputs): GovernorStatus {
    return {
      mode: this.currentMode,
      targetFps: this.targetFps,
      isOnBattery: inputs?.isOnBattery ?? false,
      isUserIdle: inputs?.isUserIdle ?? false,
      cpuLoadPercent: inputs?.cpuLoadPercent ?? 10,
      cameraActive: this.cameraActive,
    };
  }
}
