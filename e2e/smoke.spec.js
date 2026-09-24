import {expect, test} from '@playwright/test';

/** Collects uncaught errors and console errors for the whole test. */
function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  return errors;
}

test('renders the scene', async ({page}) => {
  const errors = trackErrors(page);
  await page.goto('./');

  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('#fallback')).toBeHidden();
  expect(errors).toEqual([]);
});

test('rebuilds the geometry when the subdivision level changes', async ({page}) => {
  const errors = trackErrors(page);
  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();

  const faces = page.locator('#face-count');
  const before = await faces.textContent();
  await page.locator('#detail').fill('5');
  await expect(page.locator('#detail-level')).toContainText('5');
  await expect(faces).not.toHaveText(before ?? '');
  expect(errors).toEqual([]);
});
