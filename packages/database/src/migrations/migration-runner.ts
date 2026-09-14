import { IDatabaseDriver } from '../driver/interface.js';
import { migration001 } from './001_initial_schema.js';

export interface Migration {
  version: number;
  name: string;
  up: (driver: IDatabaseDriver) => void;
}

export class MigrationRunner {
  private driver: IDatabaseDriver;
  private migrations: Migration[] = [migration001];

  constructor(driver: IDatabaseDriver) {
    this.driver = driver;
  }

  public runMigrations(): void {
    // Ensure migrations table exists
    this.driver.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);

    const applied = this.driver.all<{ version: number }>('SELECT version FROM schema_migrations');
    const appliedSet = new Set(applied.map((m) => m.version));

    for (const migration of this.migrations) {
      if (!appliedSet.has(migration.version)) {
        migration.up(this.driver);
        this.driver.run(
          'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)',
          [migration.version, migration.name, new Date().toISOString()]
        );
      }
    }
  }

  public getCurrentVersion(): number {
    const row = this.driver.get<{ max_version: number }>(
      'SELECT COALESCE(MAX(version), 0) AS max_version FROM schema_migrations'
    );
    return row ? row.max_version : 0;
  }
}
