import { test, expect } from '@playwright/test';

test('dev overlay shows required counters', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  const hud = page.getByTestId('enemy-debug-overlay');
  await expect(hud).toBeVisible();

  const text = await hud.textContent();
  for (const key of [
    'Config loaded:', 'Enemies:', 'Projectiles:', 'Spawns/s:',
    'Cull count:', 'InRange:', 'Tracking:', 'Distance(UI/Worker):'
  ]) {
    expect(text).toContain(key);
  }
});