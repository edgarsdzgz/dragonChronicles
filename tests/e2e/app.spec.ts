import { test, expect } from '@playwright/test';

test.describe('Dragon Chronicles - App Functionality', () => {
  test('should load the web app successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load and SvelteKit to initialize
    await page.waitForLoadState('networkidle');
    
    // Wait for SvelteKit to remove the preload data attribute
    await page.waitForFunction(() => {
      const body = document.body;
      return !body.hasAttribute('data-sveltekit-preload-data');
    }, { timeout: 10000 });
    
    // Check that the page loads without errors
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check for basic app elements (body should be visible after preload data is removed)
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    
    // Check that the app has loaded (look for common app indicators)
    const appElement = await page.locator('#app, [data-testid="app"], main, .app').first();
    if (await appElement.count() > 0) {
      await expect(appElement).toBeVisible();
    }
  });

  test('should handle navigation gracefully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load and SvelteKit to initialize
    await page.waitForLoadState('networkidle');
    
    // Wait for SvelteKit to remove the preload data attribute
    await page.waitForFunction(() => {
      const body = document.body;
      return !body.hasAttribute('data-sveltekit-preload-data');
    }, { timeout: 10000 });
    
    // Try to navigate to a non-existent page
    await page.goto('/non-existent-page');
    
    // The app should handle this gracefully (either show 404 or redirect)
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for SvelteKit to remove the preload data attribute
    await page.waitForFunction(() => {
      const body = document.body;
      return !body.hasAttribute('data-sveltekit-preload-data');
    }, { timeout: 10000 });
    
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for SvelteKit to remove the preload data attribute
    await page.waitForFunction(() => {
      const body = document.body;
      return !body.hasAttribute('data-sveltekit-preload-data');
    }, { timeout: 10000 });
    
    await expect(body).toBeVisible();
  });
});
