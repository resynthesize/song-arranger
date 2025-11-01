/**
 * E2E test for add track button
 * Verifies that clicking the add track button creates a new track
 */

import { test, expect } from '@playwright/test';
import { getAddTrackButton, getTrackElement } from '../helpers/selectors';

test.describe('Add Track Button', () => {
  test('should add a new track when clicked', async ({ page }) => {
    // Clear localStorage to ensure fresh state (no template project)
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate to app (fresh load after clearing storage)
    await page.goto('/');

    // Wait for timeline to be ready
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible();

    // Click add track button
    const addButton = getAddTrackButton(page);
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Assert new track appears (Playwright auto-waits for the element)
    await expect(getTrackElement(page, 0)).toBeVisible({ timeout: 5000 });

    // Verify track has expected content
    await expect(getTrackElement(page, 0)).toContainText('Track 1');
  });
});
