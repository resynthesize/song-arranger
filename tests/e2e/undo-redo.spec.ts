/**
 * Cyclone - Undo/Redo E2E Tests
 * Test undo/redo functionality across patterns, tracks, and scenes
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('Undo/Redo Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start with a clean state
    await page.goto('http://localhost:5175');
    await page.evaluate(() => localStorage.clear());

    // Reload after clearing
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for app to be ready
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible();
  });

  test('should undo/redo pattern deletion', async ({ page }) => {
    // Get initial track count
    const initialTrackCount = await page.locator('[data-testid^="track-"]').count();

    // Add a track
    await page.click('[data-testid="add-track-button"]');
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(initialTrackCount + 1);

    // Get track ID from the last track
    const trackId = await page.locator('[data-testid^="track-"]').last().getAttribute('data-testid');

    // Add a pattern
    const timeline = page.locator('[data-testid="timeline"]');
    const box = await timeline.boundingBox();
    if (!box) throw new Error('Timeline not found');

    // Double-click to create pattern
    await timeline.dblclick({
      position: { x: 100, y: box.height / 2 }
    });

    // Wait for pattern to appear
    await expect(page.locator('[data-testid^="pattern-"]')).toHaveCount(1);
    const initialPatternCount = await page.locator('[data-testid^="pattern-"]').count();

    // Get the pattern label for verification
    const patternLabel = await page.locator('[data-testid^="pattern-"]').first().textContent();

    // Right-click on pattern to open context menu
    await page.locator('[data-testid^="pattern-"]').first().click({ button: 'right' });

    // Click delete
    await page.click('text=Delete Pattern');

    // Verify pattern is deleted
    await expect(page.locator('[data-testid^="pattern-"]')).toHaveCount(initialPatternCount - 1);

    // Undo deletion (Cmd+Z on Mac, Ctrl+Z on others)
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+z' : 'Control+z');

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify pattern is restored
    await expect(page.locator('[data-testid^="pattern-"]')).toHaveCount(initialPatternCount);

    // Verify the pattern still has the same label
    const restoredPatternLabel = await page.locator('[data-testid^="pattern-"]').first().textContent();
    expect(restoredPatternLabel).toContain(patternLabel);

    // Redo deletion (Cmd+Shift+Z on Mac, Ctrl+Shift+Z on others)
    await page.keyboard.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify pattern is deleted again
    await expect(page.locator('[data-testid^="pattern-"]')).toHaveCount(initialPatternCount - 1);
  });

  test('should undo/redo pattern creation', async ({ page }) => {
    // Get initial track count
    const initialTrackCount = await page.locator('[data-testid^="track-"]').count();

    // Add a track
    await page.click('[data-testid="add-track-button"]');
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(initialTrackCount + 1);

    const initialPatternCount = await page.locator('[data-testid^="pattern-"]').count();

    // Add a pattern
    const timeline = page.locator('[data-testid="timeline"]');
    const box = await timeline.boundingBox();
    if (!box) throw new Error('Timeline not found');

    // Double-click to create pattern
    await timeline.dblclick({
      position: { x: 100, y: box.height / 2 }
    });

    // Wait for pattern to appear
    await expect(page.locator('[data-testid^="pattern-"]')).toHaveCount(initialPatternCount + 1);

    // Undo creation
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+z' : 'Control+z');

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify pattern is removed
    await expect(page.locator('[data-testid^="pattern-"]')).toHaveCount(initialPatternCount);

    // Redo creation
    await page.keyboard.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify pattern is back
    await expect(page.locator('[data-testid^="pattern-"]')).toHaveCount(initialPatternCount + 1);
  });

  test('should undo/redo pattern move', async ({ page }) => {
    // Get initial track count
    const initialTrackCount = await page.locator('[data-testid^="track-"]').count();

    // Add a track
    await page.click('[data-testid="add-track-button"]');
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(initialTrackCount + 1);

    // Add a pattern
    const timeline = page.locator('[data-testid="timeline"]');
    const box = await timeline.boundingBox();
    if (!box) throw new Error('Timeline not found');

    // Double-click to create pattern
    await timeline.dblclick({
      position: { x: 100, y: box.height / 2 }
    });

    // Wait for pattern to appear
    await expect(page.locator('[data-testid^="pattern-"]')).toHaveCount(1);

    // Get initial position
    const pattern = page.locator('[data-testid^="pattern-"]').first();
    const initialBox = await pattern.boundingBox();
    if (!initialBox) throw new Error('Pattern not found');

    const initialLeft = initialBox.x;

    // Drag pattern to new position
    await pattern.hover();
    await page.mouse.down();
    await page.mouse.move(initialBox.x + 200, initialBox.y);
    await page.mouse.up();

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify pattern moved
    const movedBox = await pattern.boundingBox();
    if (!movedBox) throw new Error('Pattern not found');

    expect(movedBox.x).toBeGreaterThan(initialLeft);

    // Undo move
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+z' : 'Control+z');

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify pattern is back at original position (within a small tolerance)
    const restoredBox = await pattern.boundingBox();
    if (!restoredBox) throw new Error('Pattern not found');

    expect(Math.abs(restoredBox.x - initialLeft)).toBeLessThan(10);

    // Redo move
    await page.keyboard.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify pattern moved again
    const redoneBox = await pattern.boundingBox();
    if (!redoneBox) throw new Error('Pattern not found');

    expect(redoneBox.x).toBeGreaterThan(initialLeft);
  });

  test('should undo/redo track deletion', async ({ page }) => {
    // Get initial track count
    const initialTrackCount = await page.locator('[data-testid^="track-"]').count();

    // Add a track
    await page.click('[data-testid="add-track-button"]');
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(initialTrackCount + 1);

    const trackCount = await page.locator('[data-testid^="track-"]').count();

    // Right-click on track to open context menu
    await page.locator('[data-testid^="track-"]').first().click({ button: 'right' });

    // Click delete track
    await page.click('text=Delete Track');

    // Verify track is deleted
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(trackCount - 1);

    // Undo deletion
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+z' : 'Control+z');

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify track is restored
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(trackCount);

    // Redo deletion
    await page.keyboard.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify track is deleted again
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(trackCount - 1);
  });

  test('should undo/redo track creation', async ({ page }) => {
    const initialTrackCount = await page.locator('[data-testid^="track-"]').count();

    // Add a track
    await page.click('[data-testid="add-track-button"]');
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(initialTrackCount + 1);

    // Undo creation
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+z' : 'Control+z');

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify track is removed
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(initialTrackCount);

    // Redo creation
    await page.keyboard.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify track is back
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(initialTrackCount + 1);
  });

  test('should undo multiple operations in sequence', async ({ page }) => {
    // Get initial track count
    const initialTrackCount = await page.locator('[data-testid^="track-"]').count();

    // Add first track
    await page.click('[data-testid="add-track-button"]');
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(initialTrackCount + 1);

    // Add second track
    await page.click('[data-testid="add-track-button"]');
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(initialTrackCount + 2);

    // Add a pattern on first track
    const timeline = page.locator('[data-testid="timeline"]');
    const box = await timeline.boundingBox();
    if (!box) throw new Error('Timeline not found');

    await timeline.dblclick({
      position: { x: 100, y: box.height / 4 }
    });

    await expect(page.locator('[data-testid^="pattern-"]')).toHaveCount(1);

    // Undo pattern creation
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+z' : 'Control+z');
    await page.waitForTimeout(100);

    await expect(page.locator('[data-testid^="pattern-"]')).toHaveCount(0);

    // Undo second track creation
    await page.keyboard.press(isMac ? 'Meta+z' : 'Control+z');
    await page.waitForTimeout(100);

    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(1);

    // Undo first track creation
    await page.keyboard.press(isMac ? 'Meta+z' : 'Control+z');
    await page.waitForTimeout(100);

    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(0);

    // Redo all operations
    await page.keyboard.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');
    await page.waitForTimeout(100);
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(1);

    await page.keyboard.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');
    await page.waitForTimeout(100);
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(2);

    await page.keyboard.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');
    await page.waitForTimeout(100);
    await expect(page.locator('[data-testid^="pattern-"]')).toHaveCount(1);
  });
});
