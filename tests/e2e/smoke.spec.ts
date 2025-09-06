import { test, expect } from '@playwright/test';

test.describe('Dragon Chronicles - Smoke Tests', () => {
  test('should load the main page', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load and SvelteKit to initialize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Give SvelteKit time to hydrate
    
    // Check that the page title is set
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check that the page has loaded (wait for body to be visible after SvelteKit hydration)
    const body = await page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
  });

  test('should have basic app structure', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load and SvelteKit to initialize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Give SvelteKit time to hydrate
    
    // Check for basic HTML structure
    const html = await page.locator('html');
    await expect(html).toBeVisible();
    
    // Head should always be visible
    const head = await page.locator('head');
    await expect(head).toBeVisible();
    
    // Body should be visible after SvelteKit hydration
    const body = await page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
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
    
    // Wait for the page to load and SvelteKit to initialize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give SvelteKit time to hydrate
    
    // Filter out 404 errors for missing resources (common in static builds)
    const filteredErrors = consoleErrors.filter(error => 
      !error.includes('404') && 
      !error.includes('Failed to load resource')
    );
    
    // Check that there are no significant console errors
    expect(filteredErrors).toHaveLength(0);
  });
});
