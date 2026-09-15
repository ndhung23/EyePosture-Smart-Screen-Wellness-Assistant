import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '../../'), '');
  return {
    base: './',
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
    define: {
      'import.meta.env.PAYMENT_BANK_CODE': JSON.stringify(env.PAYMENT_BANK_CODE || 'BIDV'),
      'import.meta.env.PAYMENT_BANK_ACCOUNT': JSON.stringify(env.PAYMENT_BANK_ACCOUNT || '4661398013'),
      'import.meta.env.PAYMENT_BANK_ACCOUNT_NAME': JSON.stringify(env.PAYMENT_BANK_ACCOUNT_NAME || 'NGUYEN DUY HUNG'),
      'import.meta.env.PAYMENT_BANK_VIRTUAL_ACCOUNT': JSON.stringify(env.PAYMENT_BANK_VIRTUAL_ACCOUNT || '96247BLHK7'),
    },
    server: {
      port: 5173,
    },
  };
});
