import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../apps/web/src/lib'),
    },
  },
  test: {
    // Use Node.js environment for db tests since IndexedDB is not available in jsdom
    environment: 'node',
    globals: true,
    include: ['tests/db/**/*.spec.ts'],
    fakeTimers: {
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'Date'],
    },
    reporters: ['dot', 'default'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'tests/.coverage',
      reporter: ['text-summary', 'lcov'],
      exclude: ['**/node_modules/**', 'tests/**'],
    },
    // Setup IndexedDB polyfill for Node.js environment
    setupFiles: ['tests/db/setup.ts'],
  },
});
