import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { 
    // jsdom gives us document/window for the background/HUD tests
    environment: 'jsdom',
    globals: true,
    include: ['tests/render/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'tests/.coverage',
      reporter: ['text-summary', 'lcov'],
      exclude: ['**/node_modules/**', 'tests/**'],
    },
  }
});