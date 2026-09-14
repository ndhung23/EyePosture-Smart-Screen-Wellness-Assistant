import { IDatabaseDriver } from '../driver/interface.js';
import { CalibrationData } from '@eyeposture/shared-types';

export class CalibrationRepository {
  private driver: IDatabaseDriver;

  constructor(driver: IDatabaseDriver) {
    this.driver = driver;
  }

  public saveCalibration(profileId: string, calibration: CalibrationData): void {
    const id = crypto.randomUUID();
    this.driver.run(
      `INSERT INTO camera_calibrations (
        id, profile_id, camera_device_id, baseline_ratio, baseline_face_width,
        baseline_pitch, baseline_roll, baseline_y, calibrated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        profileId,
        calibration.cameraDeviceId,
        calibration.baselineFaceDistanceRatio,
        calibration.baselineFaceWidth,
        calibration.baselinePitch,
        calibration.baselineRoll,
        calibration.baselineY,
        calibration.calibratedAt,
      ]
    );
  }

  public getLatestCalibration(profileId: string, cameraDeviceId?: string): CalibrationData | undefined {
    let sql = `SELECT * FROM camera_calibrations WHERE profile_id = ?`;
    const params: unknown[] = [profileId];
    if (cameraDeviceId) {
      sql += ` AND camera_device_id = ?`;
      params.push(cameraDeviceId);
    }
    sql += ` ORDER BY calibrated_at DESC LIMIT 1`;

    const row = this.driver.get<{
      camera_device_id: string;
      baseline_ratio: number;
      baseline_face_width: number;
      baseline_pitch: number;
      baseline_roll: number;
      baseline_y: number;
      calibrated_at: string;
    }>(sql, params);

    if (!row) return undefined;

    return {
      cameraDeviceId: row.camera_device_id,
      baselineFaceDistanceRatio: row.baseline_ratio,
      baselineFaceWidth: row.baseline_face_width,
      baselinePitch: row.baseline_pitch,
      baselineRoll: row.baseline_roll,
      baselineY: row.baseline_y,
      calibratedAt: row.calibrated_at,
    };
  }
}
