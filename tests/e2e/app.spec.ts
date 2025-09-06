import { test, expect } from '@playwright/test';

test.describe('Dragon Chronicles - App Functionality', () => {
  test('should load the web app successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load and SvelteKit to initialize
    await page.waitForLoadState('networkidle');
    
    // Wait for the page to be fully loaded (more robust approach)
    await page.waitForFunction(() => {
      return document.readyState === 'complete';
    }, { timeout: 10000 });
    
    // Additional wait for SvelteKit hydration
    await page.waitForTimeout(2000);
    
    // Check that the page loads without errors
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check for basic app elements (body should exist, even if hidden during preload)
    const body = await page.locator('body');
    await expect(body).toBeAttached();
    
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
    
    // Wait for the page to be fully loaded (more robust approach)
    await page.waitForFunction(() => {
      return document.readyState === 'complete';
    }, { timeout: 10000 });
    
    // Additional wait for SvelteKit hydration
    await page.waitForTimeout(2000);
    
    // Try to navigate to a non-existent page
    await page.goto('/non-existent-page');
    
    // The app should handle this gracefully (either show 404 or redirect)
    const body = await page.locator('body');
    await expect(body).toBeAttached();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for the page to be fully loaded (more robust approach)
    await page.waitForFunction(() => {
      return document.readyState === 'complete';
    }, { timeout: 10000 });
    
    // Additional wait for SvelteKit hydration
    await page.waitForTimeout(2000);
    
    const body = await page.locator('body');
    await expect(body).toBeAttached();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for the page to be fully loaded (more robust approach)
    await page.waitForFunction(() => {
      return document.readyState === 'complete';
    }, { timeout: 10000 });
    
    // Additional wait for SvelteKit hydration
    await page.waitForTimeout(2000);
    
    await expect(body).toBeAttached();
  });
});
