import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../apps/web/src/lib'),
    },
  },
  test: {
    // Use jsdom for render tests that need DOM access
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        pretendToBeVisual: true,
        // Enable IndexedDB for db tests
        resources: 'usable',
      },
    },
    globals: true,
    include: ['tests/render/**/*.spec.ts'],
    setupFiles: ['tests/setup-global.ts'], // Still use our global setup
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
  },
});
