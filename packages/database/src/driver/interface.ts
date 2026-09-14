export interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

export interface IDatabaseDriver {
  exec(sql: string): void;
  run(sql: string, params?: unknown[]): RunResult;
  get<T>(sql: string, params?: unknown[]): T | undefined;
  all<T>(sql: string, params?: unknown[]): T[];
  exportBinary?(): Uint8Array;
  close(): void;
}
