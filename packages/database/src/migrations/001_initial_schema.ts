import { IDatabaseDriver } from '../driver/interface.js';

export const migration001 = {
  version: 1,
  name: '001_initial_schema',
  up: (driver: IDatabaseDriver): void => {
    driver.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        device_fingerprint TEXT NOT NULL,
        device_name TEXT NOT NULL,
        os TEXT NOT NULL,
        app_version TEXT NOT NULL,
        last_active_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        avatar_url TEXT,
        is_child INTEGER NOT NULL DEFAULT 0,
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS settings (
        profile_id TEXT NOT NULL,
        category TEXT NOT NULL,
        config_json TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (profile_id, category),
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS camera_calibrations (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        camera_device_id TEXT NOT NULL,
        baseline_ratio REAL NOT NULL,
        baseline_face_width REAL NOT NULL,
        baseline_pitch REAL NOT NULL,
        baseline_roll REAL NOT NULL,
        baseline_y REAL NOT NULL,
        calibrated_at TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS posture_events (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        duration_seconds INTEGER NOT NULL,
        severity TEXT NOT NULL,
        average_score REAL NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS distance_events (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        duration_seconds INTEGER NOT NULL,
        min_distance_ratio REAL NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS break_sessions (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        session_type TEXT NOT NULL,
        target_duration_sec INTEGER NOT NULL,
        actual_duration_sec INTEGER NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        skipped INTEGER NOT NULL DEFAULT 0,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS hydration_events (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        glasses_drank INTEGER NOT NULL DEFAULT 1,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS screen_sessions (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        idle_duration_seconds INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS application_usage (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        date TEXT NOT NULL,
        process_name TEXT NOT NULL,
        category TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        reminder_type TEXT NOT NULL,
        state TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        delivered_at TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS daily_statistics (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        date TEXT NOT NULL,
        screen_time_min INTEGER NOT NULL DEFAULT 0,
        posture_warnings INTEGER NOT NULL DEFAULT 0,
        distance_warnings INTEGER NOT NULL DEFAULT 0,
        breaks_completed INTEGER NOT NULL DEFAULT 0,
        breaks_skipped INTEGER NOT NULL DEFAULT 0,
        hydration_glasses INTEGER NOT NULL DEFAULT 0,
        wellness_score INTEGER NOT NULL DEFAULT 100,
        updated_at TEXT NOT NULL,
        UNIQUE(profile_id, date),
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS subscription_cache (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tier TEXT NOT NULL,
        status TEXT NOT NULL,
        current_period_end INTEGER NOT NULL,
        raw_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS license_cache (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        signature TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        tier TEXT NOT NULL,
        features_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      -- Query Optimization Indexes
      CREATE INDEX IF NOT EXISTS idx_posture_profile_time ON posture_events(profile_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_distance_profile_time ON distance_events(profile_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_statistics(profile_id, date);
      CREATE INDEX IF NOT EXISTS idx_app_usage_date ON application_usage(profile_id, date);
      CREATE INDEX IF NOT EXISTS idx_screen_sessions ON screen_sessions(profile_id, started_at);
    `);
  },
};
