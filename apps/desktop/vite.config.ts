import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@eyeposture/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@eyeposture/i18n': path.resolve(__dirname, '../../packages/i18n/src/index.ts'),
      '@eyeposture/database': path.resolve(__dirname, '../../packages/database/src/index.ts'),
      '@eyeposture/vision': path.resolve(__dirname, '../../packages/vision/src/index.ts'),
      '@eyeposture/reminder-engine': path.resolve(__dirname, '../../packages/reminder-engine/src/index.ts'),
      '@eyeposture/billing': path.resolve(__dirname, '../../packages/billing/src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
});
