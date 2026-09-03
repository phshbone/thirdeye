const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ context, page }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 40.8, longitude: -74.5 });
  await page.addInitScript(() => {
    localStorage.setItem('te-beta-agreed', JSON.stringify({ name: 'Live Smoke Test', date: new Date().toISOString(), device: 'Playwright' }));
  });
});

test('Third Eye critical deployed shell and golf/photo mode switching', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  // Relative navigation preserves the /thirdeye/ GitHub Pages project path.
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Third Eye/i);
  await expect(page.locator('#splash')).toBeVisible();
  await expect(page.getByRole('button', { name: /lock on/i })).toBeVisible();

  await page.getByRole('button', { name: /lock on/i }).click();
  await expect(page.locator('#app')).toHaveClass(/active/);
  await expect(page.locator('#map')).toBeVisible();
  await expect(page.locator('#tab-map')).toHaveClass(/active/);
  await expect(page.locator('#top-hud')).toBeVisible();

  await page.locator('#tab-photo').click();
  await expect(page.locator('#tab-photo')).toHaveClass(/active/);
  await expect(page.locator('#photo-hud')).toHaveClass(/active/);
  await expect(page.locator('#top-hud')).toBeHidden();

  await page.locator('#tab-map').click();
  await expect(page.locator('#tab-map')).toHaveClass(/active/);
  await expect(page.locator('#top-hud')).toBeVisible();

  expect(pageErrors, `Uncaught page errors: ${pageErrors.join(' | ')}`).toEqual([]);
});

test('Golf target placement remains available in deployed app', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /lock on/i }).click();
  await expect(page.locator('#map')).toBeVisible();

  // Let geolocation settle before interacting with the map.
  await page.waitForTimeout(1500);
  const mapBox = await page.locator('#map').boundingBox();
  if (!mapBox) throw new Error('Map bounding box unavailable');

  await page.mouse.click(mapBox.x + mapBox.width * 0.62, mapBox.y + mapBox.height * 0.42);
  await expect(page.locator('#clear-pins-btn')).toBeVisible();
  await expect(page.locator('#pin-legend .pin-legend-item')).toHaveCount(1);
});
