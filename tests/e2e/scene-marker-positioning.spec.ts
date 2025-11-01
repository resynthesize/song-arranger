/**
 * E2E test for scene marker positioning
 * Verifies that scene markers don't overlay tracks
 */

import { test, expect } from '@playwright/test';

test.describe('Scene Marker Positioning', () => {
  test('should not overlay first track', async ({ page }) => {
    // Clear localStorage to ensure fresh state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate to app
    await page.goto('/');

    // Wait for timeline to be ready
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible({ timeout: 5000 });

    // Get the first track element
    const firstTrack = page.locator('[data-testid^="track-"]').first();
    await expect(firstTrack).toBeVisible({ timeout: 5000 });

    // Get the scene marker
    const sceneMarker = page.locator('[data-testid^="scene-marker-"]').first();
    await expect(sceneMarker).toBeVisible({ timeout: 5000 });

    // Get bounding boxes
    const trackBox = await firstTrack.boundingBox();
    const markerBox = await sceneMarker.boundingBox();

    expect(trackBox).not.toBeNull();
    expect(markerBox).not.toBeNull();

    console.log('Track box:', trackBox);
    console.log('Marker box:', markerBox);

    // Scene marker should be above the first track (lower Y = higher on screen)
    // The marker bottom should not extend into the track
    if (trackBox && markerBox) {
      const markerBottom = markerBox.y + markerBox.height;
      const trackTop = trackBox.y;

      console.log('Marker bottom:', markerBottom);
      console.log('Track top:', trackTop);

      // Marker should end before (or at) track begins
      expect(markerBottom).toBeLessThanOrEqual(trackTop + 5); // Allow 5px tolerance for rounding
    }

    // Take screenshot for visual verification
    await page.screenshot({ path: '/tmp/scene-marker-positioning.png' });
    console.log('Screenshot saved to /tmp/scene-marker-positioning.png');
  });
});
