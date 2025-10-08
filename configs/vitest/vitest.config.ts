import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../apps/web/src/lib'),
    },
  },
  test: {
    // Use Node.js environment for tests that don't need DOM
    environment: 'node',
    globals: true,
    include: ['tests/**/*.{test,spec}.{js,ts,mjs}'],
    exclude: ['tests/render/**/*.spec.ts', 'tests/e2e/**/*.spec.ts'], // Exclude render tests (need jsdom) and E2E tests (need Playwright)
    setupFiles: ['tests/setup-global.ts'], // Global setup for all tests
    fakeTimers: {
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'Date'],
    },
    reporters: ['dot', 'default'],
    testTimeout: 30000, // 30 seconds for economic simulation tests
    coverage: {
      provider: 'v8',
      reportsDirectory: 'tests/.coverage',
      reporter: ['text-summary', 'lcov'],
      exclude: ['**/node_modules/**', 'tests/**'],
    },
  },
});
