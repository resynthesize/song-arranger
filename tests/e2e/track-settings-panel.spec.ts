/**
 * E2E test for track settings panel
 * Verifies that track settings button opens the bottom pane
 */

import { test, expect } from '@playwright/test';

test.describe('Track Settings Panel', () => {
  test('should open track settings panel when clicking track settings button', async ({ page }) => {
    // Clear localStorage to ensure fresh state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate to app
    await page.goto('/');

    // Wait for timeline to be ready
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible({ timeout: 5000 });

    // Wait for first track to be visible
    const firstTrack = page.locator('[data-testid^="track-"]').first();
    await expect(firstTrack).toBeVisible({ timeout: 5000 });

    // Find track settings button (gear icon)
    // It should be in the track header
    const trackHeader = firstTrack.locator('[class*="header"]').first();

    // Look for settings button - it might have different selectors
    const settingsButton = firstTrack.locator('button[title*="Settings"], button[aria-label*="Settings"], button:has-text("⚙")').first();

    // Log what we found
    const buttonCount = await firstTrack.locator('button').count();
    console.log(`Found ${buttonCount} buttons in first track`);

    // Try to find and click the settings button
    if (await settingsButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('Clicking settings button...');
      await settingsButton.click();

      // Wait a bit for any animations
      await page.waitForTimeout(500);

      // Take screenshot immediately after click
      await page.screenshot({ path: '/tmp/track-settings-after-click.png' });
      console.log('Screenshot after click saved to /tmp/track-settings-after-click.png');

      // Wait for the bottom pane to appear
      const bottomPane = page.locator('[data-testid="bottom-pane-track-settings"]');

      try {
        await expect(bottomPane).toBeVisible({ timeout: 5000 });
        console.log('Bottom pane is visible!');
      } catch (error) {
        console.error('Bottom pane did not appear!');
        await page.screenshot({ path: '/tmp/track-settings-panel-error.png' });
        throw error;
      }

      // Verify the pane has the track name in subtitle
      const subtitle = bottomPane.locator('.subtitle, [class*="subtitle"]');
      await expect(subtitle).toBeVisible();

      // Take screenshot with panel open
      await page.screenshot({ path: '/tmp/track-settings-panel-open.png' });
      console.log('Screenshot with panel open saved to /tmp/track-settings-panel-open.png');

      // Close the panel
      const closeButton = bottomPane.locator('[data-testid="bottom-pane-close-track-settings"]');
      await closeButton.click();

      // Verify panel is closed
      await expect(bottomPane).not.toBeVisible({ timeout: 3000 });

      // Take final screenshot
      await page.screenshot({ path: '/tmp/track-settings-panel-closed.png' });
      console.log('Screenshot after closing saved to /tmp/track-settings-panel-closed.png');
    } else {
      console.log('Settings button not found, listing all buttons:');
      const buttons = firstTrack.locator('button');
      const count = await buttons.count();
      for (let i = 0; i < count; i++) {
        const btn = buttons.nth(i);
        const text = await btn.textContent();
        const title = await btn.getAttribute('title');
        const ariaLabel = await btn.getAttribute('aria-label');
        console.log(`Button ${i}: text="${text}", title="${title}", aria-label="${ariaLabel}"`);
      }

      // Take screenshot for debugging
      await page.screenshot({ path: '/tmp/track-settings-missing-button.png' });
      throw new Error('Track settings button not found');
    }
  });
});
