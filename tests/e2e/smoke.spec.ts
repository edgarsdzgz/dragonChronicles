import { test, expect } from '@playwright/test';

test.describe('Dragon Chronicles - Smoke Tests', () => {
  test('should load the main page', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title is set
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check that the page has loaded (basic content check)
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have basic app structure', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for basic HTML structure
    const html = await page.locator('html');
    await expect(html).toBeVisible();
    
    const head = await page.locator('head');
    await expect(head).toBeVisible();
    
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for any async operations
    await page.waitForTimeout(2000);
    
    // Check that there are no console errors
    expect(consoleErrors).toHaveLength(0);
  });
});
