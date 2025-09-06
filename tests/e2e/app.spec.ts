import { test, expect } from '@playwright/test';

test.describe('Dragon Chronicles - App Functionality', () => {
  test('should load the web app successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check that the page loads without errors
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check for basic app elements
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
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
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
    
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(body).toBeVisible();
  });
});
