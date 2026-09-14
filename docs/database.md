# SQLite Database Schema & Storage Strategy

## 1. Local-First Storage Architecture

EyePosture stores all operational and statistical information locally in an embedded SQLite database using `sql.js` (pure JS / WebAssembly runtime). This ensures zero native compiler dependencies and instant compatibility across Windows, macOS, Linux, and web environments.

---

## 2. Table Schemas & Relationships

### `users` & `devices`
- Stores optional cloud identity and device registration metadata.
- Keys: `id`, `email`, `name`, `role`, `device_fingerprint`, `os`, `app_version`.

### `profiles`
- Isolates multi-user and family accounts on a single machine.
- Keys: `id`, `user_id`, `name`, `is_child`, `is_default`, `created_at`.

### `settings`
- JSON-backed modular configuration store per profile and subsystem.
- Primary Key: `(profile_id, category)`. Categories: `general`, `camera`, `posture`, `distance`, `breaks`, `hydration`, `screenTime`, `notifications`, `privacy`.

### `camera_calibrations`
- Stores personal ergonomic baselines captured during the 5-step calibration wizard.
- Keys: `profile_id`, `camera_device_id`, `baseline_ratio`, `baseline_face_width`, `baseline_pitch`, `baseline_roll`, `baseline_y`.

### `posture_events` & `distance_events`
- **Summarized Incident Records**: Never logs raw frames. Logs only bounded ergonomic lapses:
  - `start_time`, `end_time`, `duration_seconds`, `severity`, `average_score`.

### `break_sessions` & `hydration_events`
- Tracks 20-20-20 eye breaks (`target_duration`, `completed`, `skipped`) and water intake records.

### `daily_statistics`
- Daily habit rollups per profile:
  - `date`, `screen_time_min`, `posture_warnings`, `distance_warnings`, `breaks_completed`, `breaks_skipped`, `hydration_glasses`, `wellness_score`.

### `license_cache`
- Caches digitally signed entitlements locally for offline operation.

---

## 3. Migration Management

Schema evolution is governed by `MigrationRunner`:
1. Every migration implements `up(driver: IDatabaseDriver): void`.
2. Applied migrations are recorded in the `schema_migrations` table with version, name, and ISO timestamp.
3. Migrations execute automatically upon application startup.

---

## 4. Retention Purges & Data Sovereignty

- **Detailed Event Purge**: Detailed `posture_events` and `distance_events` are automatically purged after 30 to 90 days (configurable in Privacy Settings) to minimize disk usage:
  ```sql
  DELETE FROM posture_events WHERE created_at < datetime('now', '-60 days');
  DELETE FROM distance_events WHERE created_at < datetime('now', '-60 days');
  ```
- **Long-Term Aggregates**: Daily summarized rows in `daily_statistics` are retained for 1–2 years to visualize annual wellness trends.
- **User Data Sovereignty**: Users can trigger `clearLocalData()` from the Privacy page to wipe all historical records instantly.
