import initSqlJs, { Database, SqlValue } from 'sql.js';
import { IDatabaseDriver, RunResult } from './interface.js';

declare global {
  interface Window {
    electronApi?: {
      getSqlWasmBinary?: () => Promise<Uint8Array | null> | Uint8Array | null;
      [key: string]: unknown;
    };
  }
}

export class SqlJsDriver implements IDatabaseDriver {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public static async create(initialData?: Uint8Array): Promise<SqlJsDriver> {
    let wasmBinary: ArrayBuffer | undefined;
    if (typeof window !== 'undefined' && typeof window.electronApi?.getSqlWasmBinary === 'function') {
      try {
        const bin = await window.electronApi.getSqlWasmBinary();
        if (bin && bin.byteLength > 0) {
          wasmBinary = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength) as ArrayBuffer;
        }
      } catch (err) {
        console.warn('Could not load wasm binary from electronApi:', err);
      }
    }

    const config = wasmBinary
      ? { wasmBinary }
      : (typeof window !== 'undefined' ? { locateFile: (file: string) => `./${file}` } : undefined);

    const SQL = await initSqlJs(config);
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
