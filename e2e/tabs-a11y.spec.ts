import { test, expect } from '@playwright/test';

test('tabs are keyboard accessible', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  const enchant = page.getByRole('tab', { name: 'Enchant' });
  const returnBtn = page.getByRole('tab', { name: 'Return to Draconia' });
  const settings = page.getByRole('tab', { name: 'Settings' });

  await expect(enchant).toBeVisible();
  await expect(returnBtn).toBeVisible();
  await expect(settings).toBeVisible();

  await enchant.focus();
  await page.keyboard.press('Enter'); // should select it
  await expect(enchant).toHaveAttribute('aria-selected', 'true');

  await settings.focus();
  await page.keyboard.press('Space'); // should open settings page/section
  await expect(page.getByText('Settings Coming Soon')).toBeVisible();
});