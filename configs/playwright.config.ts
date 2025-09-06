import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: '../tests/e2e',
  timeout: 30_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
  ],
  reporter: [['line'], ['html', { outputFolder: 'playwright-report' }]],
});
