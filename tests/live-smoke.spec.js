const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ context, page }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 40.8, longitude: -74.5 });
  await page.addInitScript(() => {
    localStorage.setItem('te-beta-agreed', JSON.stringify({ name: 'Live Smoke Test', date: new Date().toISOString(), device: 'Playwright' }));
    localStorage.setItem('ce-golf-courses', JSON.stringify(['Test Course A', 'Test Course B']));
    localStorage.setItem('ce-active-golf', JSON.stringify('Test Course A'));
  });
});

async function launch(page) {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Third Eye/i);
  await expect(page.locator('#splash')).toBeVisible();
  await page.getByRole('button', { name: /lock on/i }).click();
  await expect(page.locator('#app')).toHaveClass(/active/);
  await expect(page.locator('#map')).toBeVisible();
  await page.waitForTimeout(1200);
}

test('critical shell, bench HUD, and Golf / Photo mode ownership remain clean', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await launch(page);
  await expect(page.locator('#tab-map')).toHaveClass(/active/);
  await expect(page.locator('#top-hud')).toBeVisible();
  await expect(page.locator('#hud-bar')).toBeVisible();
  await expect(page.locator('#hud-wind-tab')).toBeVisible();
  await expect(page.locator('#hud-switch-tab')).toBeVisible();
  await expect(page.locator('#course-name-display')).toContainText(/TEST COURSE A/i);

  await page.locator('#tab-photo').click();
  await expect(page.locator('#tab-photo')).toHaveClass(/active/);
  await expect(page.locator('#photo-hud')).toHaveClass(/active/);
  await expect(page.locator('#top-hud')).toBeHidden();
  await expect(page.locator('#toast')).toContainText(/drag from the lens marker/i);

  await page.locator('#tab-map').click();
  await expect(page.locator('#tab-map')).toHaveClass(/active/);
  await expect(page.locator('#top-hud')).toBeVisible();

  expect(pageErrors, `Uncaught page errors: ${pageErrors.join(' | ')}`).toEqual([]);
});

test('Golf keeps more than six targets, supports Undo, and isolates a course switch', async ({ page }) => {
  await launch(page);
  const mapBox = await page.locator('#map').boundingBox();
  if (!mapBox) throw new Error('Map bounding box unavailable');

  const points = [
    [0.62, 0.42], [0.68, 0.46], [0.58, 0.50], [0.72, 0.54],
    [0.55, 0.38], [0.75, 0.34], [0.64, 0.58],
  ];
  for (const [x, y] of points) {
    await page.mouse.click(mapBox.x + mapBox.width * x, mapBox.y + mapBox.height * y);
    await page.waitForTimeout(80);
  }

  await expect(page.locator('#pin-legend .pin-legend-item')).toHaveCount(7);
  await expect(page.locator('#undo-pin-btn')).toBeVisible();
  await page.locator('#undo-pin-btn').click();
  await expect(page.locator('#pin-legend .pin-legend-item')).toHaveCount(6);

  await page.locator('#hud-switch-tab').click();
  await expect(page.locator('#course-name-display')).toContainText(/TEST COURSE B/i);
  await expect(page.locator('#pin-legend .pin-legend-item')).toHaveCount(0);
  await expect(page.locator('#clear-pins-btn')).toBeHidden();
});

test('Dime drawer survives SVG tap, previous ball becomes breadcrumb, and Photo hides Golf shot markers', async ({ page, context }) => {
  await launch(page);
  await expect(page.getByRole('button', { name: /drop ball marker/i })).toBeVisible();
  await expect(page.locator('#coin-btn')).toContainText('10¢');

  // Click the nested SVG deliberately: this reproduced the original outside-click race.
  await page.locator('#coin-btn svg').click({ position: { x: 12, y: 12 } });
  await expect(page.locator('#club-sheet')).toHaveClass(/open/);
  await page.locator('.sheet-close').click();

  await context.setGeolocation({ latitude: 40.80018, longitude: -74.5 });
  await page.waitForTimeout(700);
  await page.locator('#coin-btn svg').click({ position: { x: 12, y: 12 } });
  await expect(page.locator('#club-sheet')).toHaveClass(/open/);

  const historyCount = await page.evaluate(() => S.coinMarkers.length);
  expect(historyCount).toBe(1);
  await page.locator('.sheet-close').click();

  await page.locator('#tab-photo').click();
  const golfMarkersHidden = await page.evaluate(() => {
    const currentHidden = !S.coinMarker || !map.hasLayer(S.coinMarker);
    const historyHidden = S.coinMarkers.every(m => !map.hasLayer(m.marker));
    return currentHidden && historyHidden;
  });
  expect(golfMarkersHidden).toBe(true);
});

test('Photo intended drag gesture creates a photo measurement pin', async ({ page }) => {
  await launch(page);
  await page.locator('#tab-photo').click();
  await expect(page.locator('#photo-hud')).toHaveClass(/active/);

  const origin = await page.evaluate(() => {
    const p = map.latLngToContainerPoint([S.gpsPos.lat, S.gpsPos.lng]);
    return { x: p.x, y: p.y };
  });
  const mapBox = await page.locator('#map').boundingBox();
  if (!mapBox) throw new Error('Map bounding box unavailable');

  await page.mouse.move(mapBox.x + origin.x, mapBox.y + origin.y);
  await page.mouse.down();
  await page.mouse.move(mapBox.x + origin.x + 90, mapBox.y + origin.y - 100, { steps: 8 });
  await page.mouse.up();

  await expect(page.locator('#pin-legend .pin-legend-item')).toHaveCount(1);
  await expect(page.locator('#pin-legend')).toContainText(/🔭1/);
});
