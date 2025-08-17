import { test, expect } from '@playwright/test';

test('no legacy overlays remain', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // There should be only our single, canonical overlay.
  const anyLegacy = page.locator('[data-testid="legacy-debug-overlay"], [data-testid="dev-overlay-legacy"]');
  await expect(anyLegacy).toHaveCount(0);
});