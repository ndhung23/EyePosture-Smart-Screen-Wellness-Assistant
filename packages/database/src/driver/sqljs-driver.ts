import initSqlJs, { Database, SqlValue } from 'sql.js';
import { IDatabaseDriver, RunResult } from './interface.js';

export class SqlJsDriver implements IDatabaseDriver {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public static async create(initialData?: Uint8Array): Promise<SqlJsDriver> {
    const SQL = await initSqlJs();
    const db = initialData ? new SQL.Database(initialData) : new SQL.Database();
    return new SqlJsDriver(db);
  }

  public exec(sql: string): void {
    this.db.exec(sql);
  }

  public run(sql: string, params: unknown[] = []): RunResult {
    this.db.run(sql, params as SqlValue[]);
    const changesRes = this.db.exec('SELECT changes() AS changes, last_insert_rowid() AS lastId');
    let changes = 0;
    let lastInsertRowid = 0;
    if (changesRes.length > 0 && changesRes[0].values.length > 0) {
      changes = (changesRes[0].values[0][0] as number) || 0;
      lastInsertRowid = (changesRes[0].values[0][1] as number) || 0;
    }
    return { changes, lastInsertRowid };
  }

  public get<T>(sql: string, params: unknown[] = []): T | undefined {
    const stmt = this.db.prepare(sql);
    stmt.bind(params as SqlValue[]);
    let result: T | undefined = undefined;
    if (stmt.step()) {
      result = stmt.getAsObject() as T;
    }
    stmt.free();
    return result;
  }

  public all<T>(sql: string, params: unknown[] = []): T[] {
    const stmt = this.db.prepare(sql);
    stmt.bind(params as SqlValue[]);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return results;
  }

  public exportBinary(): Uint8Array {
    return this.db.export();
  }

  public close(): void {
    this.db.close();
  }
}
