/**
 * E2E test for scene markers
 * Verifies that scene markers display correctly with name visible
 */

import { test, expect } from '@playwright/test';

test.describe('Scene Markers', () => {
  test('should display scene marker with visible name and background', async ({ page }) => {
    // Clear localStorage to ensure fresh state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate to app
    await page.goto('/');

    // Wait for timeline to be ready
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible({ timeout: 5000 });

    // Check that scene marker is visible
    const sceneMarker = page.locator('[data-testid^="scene-marker-"]');
    await expect(sceneMarker.first()).toBeVisible({ timeout: 5000 });

    // Check that scene marker label is visible
    const sceneLabel = page.locator('[data-testid$="-label"]').first();
    await expect(sceneLabel).toBeVisible();

    // Verify the label has text content
    const labelText = await sceneLabel.textContent();
    expect(labelText?.length).toBeGreaterThan(0);
    console.log(`Scene marker label text: "${labelText}"`);

    // Get the bounding box to verify visibility
    const labelBox = await sceneLabel.boundingBox();
    expect(labelBox).not.toBeNull();
    expect(labelBox?.height).toBeGreaterThan(0);
    expect(labelBox?.width).toBeGreaterThan(0);

    // Take a screenshot to verify visual appearance
    await page.screenshot({ path: '/tmp/scene-marker-test.png' });
    console.log('Screenshot saved to /tmp/scene-marker-test.png');
  });
});
