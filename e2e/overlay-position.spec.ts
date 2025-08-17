import { test, expect } from '@playwright/test';

test('debug overlay is unique and bottom-right anchored inside combat', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  const overlays = page.locator('[data-testid="enemy-debug-overlay"]');
  await expect(overlays).toHaveCount(1);

  const overlay = overlays.first();
  await expect(overlay).toBeVisible();

  // Get bounding boxes
  const combat = page.locator('.combat-root');
  const ob = await overlay.boundingBox();
  const cb = await combat.boundingBox();
  if (!ob || !cb) throw new Error('Missing bounding boxes');

  const rightGap  = Math.round(cb.x + cb.width  - (ob.x + ob.width));
  const bottomGap = Math.round(cb.y + cb.height - (ob.y + ob.height));

  // Allow a small rounding tolerance (<= 14px due to device pixel ratio / borders)
  expect(rightGap).toBeGreaterThanOrEqual(0);
  expect(rightGap).toBeLessThanOrEqual(14);
  expect(bottomGap).toBeGreaterThanOrEqual(0);
  expect(bottomGap).toBeLessThanOrEqual(14);
});