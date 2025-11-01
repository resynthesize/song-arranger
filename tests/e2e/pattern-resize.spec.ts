import { test, expect } from '@playwright/test';
import { setupTimeline, dragTestSong } from '../helpers';

test.describe('Pattern Resize', () => {
  test.beforeEach(async ({ page }) => {
    await setupTimeline(page, dragTestSong());
  });

  test('should resize pattern from right handle', async ({ page }) => {
    // Find first pattern on timeline
    const pattern = page.locator('[class*="Pattern_pattern"]').first();
    await expect(pattern).toBeVisible();

    // Get the pattern's initial width
    const initialBox = await pattern.boundingBox();
    if (!initialBox) throw new Error('Pattern not found');
    const initialWidth = initialBox.width;

    // Find the right resize handle
    const rightHandle = pattern.locator('[class*="pattern__handle--right"]').first();
    await expect(rightHandle).toBeVisible();

    // Get handle position
    const handleBox = await rightHandle.boundingBox();
    if (!handleBox) throw new Error('Handle not found');

    // Resize by dragging the handle to the right
    await rightHandle.hover();
    await page.mouse.down();
    await page.mouse.move(handleBox.x + 100, handleBox.y);
    await page.mouse.up();

    // Wait for resize to complete
    await page.waitForTimeout(500);

    // Get new width
    const newBox = await pattern.boundingBox();
    if (!newBox) throw new Error('Pattern not found after resize');
    const newWidth = newBox.width;

    // Pattern should be wider
    expect(newWidth).toBeGreaterThan(initialWidth);
  });

  test('should show resize cursor on hover', async ({ page }) => {
    // Find first pattern
    const pattern = page.locator('[class*="Pattern_pattern"]').first();
    await expect(pattern).toBeVisible();

    // Find right handle
    const rightHandle = pattern.locator('[class*="pattern__handle--right"]').first();
    await expect(rightHandle).toBeVisible();

    await rightHandle.hover();

    // Check cursor style
    const cursor = await rightHandle.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });

    expect(cursor).toContain('resize');
  });
});
