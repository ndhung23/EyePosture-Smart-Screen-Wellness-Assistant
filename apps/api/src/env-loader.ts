import * as fs from 'fs';
import * as path from 'path';

export function loadEnvFile(): void {
  const envCandidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
  ];
  for (const p of envCandidates) {
    if (fs.existsSync(p)) {
      try {
        const text = fs.readFileSync(p, 'utf-8');
        for (const line of text.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch {
        // ignore
      }
      break;
    }
  }
}
