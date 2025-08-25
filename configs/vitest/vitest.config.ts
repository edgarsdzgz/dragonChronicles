import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../apps/web/src/lib')
    }
  },
  test: { 
    // jsdom gives us document/window for the background/HUD tests
    environment: 'jsdom',
    environmentOptions: { 
      jsdom: { 
        pretendToBeVisual: true 
      } 
    },
    globals: true,
    include: ['tests/render/**/*.spec.ts'],
    fakeTimers: { 
      toFake: ['setTimeout','setInterval','clearTimeout','clearInterval','Date'] 
    },
    reporters: ['dot','default'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'tests/.coverage',
      reporter: ['text-summary', 'lcov'],
      exclude: ['**/node_modules/**', 'tests/**'],
    },
  }
});