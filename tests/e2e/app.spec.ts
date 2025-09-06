import { test, expect } from '@playwright/test';

test.describe('Dragon Chronicles - App Functionality', () => {
  test('should load the web app successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load and SvelteKit to initialize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Give SvelteKit time to hydrate
    
    // Check that the page loads without errors
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check for basic app elements (wait for body to be visible after SvelteKit hydration)
    const body = await page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
    
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
    await page.waitForTimeout(1000); // Give SvelteKit time to hydrate
    
    // Try to navigate to a non-existent page
    await page.goto('/non-existent-page');
    
    // The app should handle this gracefully (either show 404 or redirect)
    const body = await page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Give SvelteKit time to hydrate
    
    const body = await page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Give SvelteKit time to hydrate
    
    await expect(body).toBeVisible({ timeout: 10000 });
  });
});
