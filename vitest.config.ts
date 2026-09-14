import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@eyeposture/shared-types': path.resolve(__dirname, 'packages/shared-types/src/index.ts'),
      '@eyeposture/i18n': path.resolve(__dirname, 'packages/i18n/src/index.ts'),
      '@eyeposture/database': path.resolve(__dirname, 'packages/database/src/index.ts'),
      '@eyeposture/vision': path.resolve(__dirname, 'packages/vision/src/index.ts'),
      '@eyeposture/reminder-engine': path.resolve(__dirname, 'packages/reminder-engine/src/index.ts'),
      '@eyeposture/billing': path.resolve(__dirname, 'packages/billing/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.spec.ts', 'packages/**/*.test.ts', 'apps/**/*.spec.ts', 'apps/**/*.test.ts'],
  },
});

