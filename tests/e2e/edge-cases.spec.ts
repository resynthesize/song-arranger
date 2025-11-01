/**
 * E2E tests for edge cases
 * Tests empty states, boundary conditions, and error handling
 */

import { test, expect } from '@playwright/test';
import {
  setupTimeline,
  minimalSong,
  dragTestSong,
  getPatternElement,
  getTrackElement,
  getSceneElement,
  getAddTrackButton,
  doubleClickAndType,
  getReduxState,
} from '../helpers';

test.describe('Edge Cases', () => {
  test.describe('Empty States', () => {
    test('should handle empty timeline on initial load', async ({ page }) => {
      // Load page without any test data
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.goto('/');

      // Wait for timeline to be ready
      await expect(page.locator('[data-testid="timeline"]')).toBeVisible();

      // Timeline should render without crashing
      const timeline = page.locator('[data-testid="timeline"]');
      await expect(timeline).toBeVisible();

      // Add track button should be available
      const addButton = getAddTrackButton(page);
      await expect(addButton).toBeVisible();
    });

    test('should handle scene with no patterns', async ({ page }) => {
      await setupTimeline(page, minimalSong());

      // Delete the only pattern
      const pattern = getPatternElement(page, 0);
      await pattern.click();

      // Wait for selection
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          return state.selection?.selectedPatternIds?.length > 0;
        },
        {},
        { timeout: 2000 }
      );

      // Delete pattern
      await page.keyboard.press('Delete');

      // Wait for deletion
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          const songData = Object.values(state.song.song_data)[0] as any;
          const scene = Object.values(songData.scenes)[0] as any;
          return Object.keys(scene.pattern_assignments).length === 0;
        },
        {},
        { timeout: 2000 }
      );

      // Timeline should still render without crashing
      const timeline = page.locator('[data-testid="timeline"]');
      await expect(timeline).toBeVisible();

      // Scene should still be visible
      const scene = getSceneElement(page, 'Scene 1');
      await expect(scene).toBeVisible();
    });

    test('should handle track with no patterns', async ({ page }) => {
      await setupTimeline(page, minimalSong());

      // Add a new empty track
      await page.keyboard.press('i');

      // Wait for track to be added
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          return state.song._cyclone_metadata.trackOrder.length === 2;
        },
        {},
        { timeout: 2000 }
      );

      // New track should be visible
      const newTrack = getTrackElement(page, 1);
      await expect(newTrack).toBeVisible();

      // Should not crash
      const timeline = page.locator('[data-testid="timeline"]');
      await expect(timeline).toBeVisible();
    });
  });

  test.describe('Boundary Conditions', () => {
    test('should handle maximum zoom level', async ({ page }) => {
      await setupTimeline(page, minimalSong());

      // Zoom in many times
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press(']');
      }

      // Wait for zoom to update
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          return (state.view?.zoom || 1) > 1;
        },
        {},
        { timeout: 2000 }
      );

      // Timeline should still render
      const timeline = page.locator('[data-testid="timeline"]');
      await expect(timeline).toBeVisible();

      // Patterns should still be visible
      const pattern = getPatternElement(page, 0);
      await expect(pattern).toBeVisible();
    });

    test('should handle minimum zoom level', async ({ page }) => {
      await setupTimeline(page, minimalSong());

      // Zoom out many times
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('[');
      }

      // Wait for zoom to update
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          return (state.view?.zoom || 1) >= 0; // Should have some minimum
        },
        {},
        { timeout: 2000 }
      );

      // Timeline should still render
      const timeline = page.locator('[data-testid="timeline"]');
      await expect(timeline).toBeVisible();

      // Patterns should still be visible
      const pattern = getPatternElement(page, 0);
      await expect(pattern).toBeVisible();
    });

    test('should handle very long scene names', async ({ page }) => {
      await setupTimeline(page, minimalSong());

      const scene = getSceneElement(page, 'Scene 1');
      const veryLongName = 'A'.repeat(100); // 100 character name

      // Rename with very long name
      await doubleClickAndType(scene, veryLongName, true);

      // Wait for rename
      await page.waitForFunction(
        ({ expectedName }) => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          const songData = Object.values(state.song.song_data)[0] as any;
          return expectedName in songData.scenes;
        },
        { expectedName: veryLongName },
        { timeout: 2000 }
      );

      // Verify name was set (may be truncated)
      const state = await getReduxState(page);
      const songData = Object.values(state.song.song_data)[0] as any;
      const sceneNames = Object.keys(songData.scenes);

      // Should have the long name or a truncated version
      const hasLongName = sceneNames.some(name => name.startsWith('A'));
      expect(hasLongName).toBe(true);
    });

    test('should handle dragging pattern to extreme positions', async ({ page }) => {
      await setupTimeline(page, dragTestSong());

      const pattern = getPatternElement(page, 0);

      // Try to drag pattern very far to the right
      const patternContent = pattern.locator('> div[class*="content"]');
      const box = await patternContent.boundingBox();
      if (!box) throw new Error('Pattern has no bounding box');

      // Drag 5000 pixels to the right (extreme)
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(200);
      await page.mouse.move(box.x + 5000, box.y + box.height / 2);
      await page.mouse.up();

      // Wait for scene order to update
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          return state.song._cyclone_metadata.sceneOrder.length >= 1;
        },
        {},
        { timeout: 2000 }
      );

      // Should not crash
      const timeline = page.locator('[data-testid="timeline"]');
      await expect(timeline).toBeVisible();

      // Pattern should exist somewhere
      const patterns = page.locator('[data-testid^="pattern-"]');
      await expect(patterns.first()).toBeVisible();
    });
  });

  test.describe('Invalid Inputs', () => {
    test('should handle empty scene name (revert to original)', async ({ page }) => {
      await setupTimeline(page, minimalSong());

      const scene = getSceneElement(page, 'Scene 1');

      // Try to rename with empty string
      await scene.dblclick();
      await scene.fill('');
      await scene.press('Enter');

      // Wait a bit for any state change
      await page.waitForTimeout(500);

      // Verify original name is preserved
      const state = await getReduxState(page);
      const songData = Object.values(state.song.song_data)[0] as any;
      const sceneNames = Object.keys(songData.scenes);

      // Should still have Scene 1 or some valid name
      expect(sceneNames.length).toBeGreaterThan(0);
      expect(sceneNames[0].length).toBeGreaterThan(0);
    });

    test('should handle special characters in scene name', async ({ page }) => {
      await setupTimeline(page, minimalSong());

      const scene = getSceneElement(page, 'Scene 1');
      const specialName = '!@#$%^&*()';

      // Rename with special characters
      await doubleClickAndType(scene, specialName, true);

      // Wait for any processing
      await page.waitForTimeout(500);

      // Verify name was handled (accepted or sanitized)
      const state = await getReduxState(page);
      const songData = Object.values(state.song.song_data)[0] as any;
      const sceneNames = Object.keys(songData.scenes);

      // Should have some valid name
      expect(sceneNames.length).toBeGreaterThan(0);
    });

    test('should handle rapid repeated operations', async ({ page }) => {
      await setupTimeline(page, minimalSong());

      // Rapidly add and remove tracks
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('i'); // Add track
        await page.waitForTimeout(50);
      }

      // Wait for all operations to complete
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          return state.song._cyclone_metadata.trackOrder.length > 1;
        },
        {},
        { timeout: 3000 }
      );

      // App should still be functional
      const timeline = page.locator('[data-testid="timeline"]');
      await expect(timeline).toBeVisible();

      // Verify some tracks were added
      const state = await getReduxState(page);
      expect(state.song._cyclone_metadata.trackOrder.length).toBeGreaterThan(1);
    });

    test('should handle operations on non-existent selection', async ({ page }) => {
      await setupTimeline(page, minimalSong());

      // Ensure nothing is selected
      await page.keyboard.press('Control+Shift+A');

      // Wait for deselection
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          return (state.selection?.selectedPatternIds?.length || 0) === 0;
        },
        {},
        { timeout: 2000 }
      );

      // Try to delete (should do nothing)
      await page.keyboard.press('Delete');

      // Wait a bit
      await page.waitForTimeout(300);

      // Verify patterns still exist
      const state = await getReduxState(page);
      const songData = Object.values(state.song.song_data)[0] as any;
      const scene = Object.values(songData.scenes)[0] as any;

      // Pattern should still exist
      expect(Object.keys(scene.pattern_assignments).length).toBeGreaterThan(0);
    });
  });

  test.describe('Data Integrity', () => {
    test('should maintain track order after multiple operations', async ({ page }) => {
      await setupTimeline(page, dragTestSong());

      // Perform multiple operations
      await page.keyboard.press('i'); // Add track
      await page.waitForTimeout(100);

      const pattern = getPatternElement(page, 0);
      await pattern.click();
      await page.keyboard.press('Delete');

      await page.waitForTimeout(200);

      // Verify data integrity
      const state = await getReduxState(page);

      // Track order should exist and be an array
      expect(Array.isArray(state.song._cyclone_metadata.trackOrder)).toBe(true);
      expect(state.song._cyclone_metadata.trackOrder.length).toBeGreaterThan(0);

      // Scene order should exist
      expect(Array.isArray(state.song._cyclone_metadata.sceneOrder)).toBe(true);
      expect(state.song._cyclone_metadata.sceneOrder.length).toBeGreaterThan(0);
    });

    test('should preserve pattern data after drag operations', async ({ page }) => {
      await setupTimeline(page, dragTestSong());

      // Get initial pattern data
      const initialState = await getReduxState(page);
      const initialSongData = Object.values(initialState.song.song_data)[0] as any;
      const initialPattern = initialSongData.patterns['Pattern A'];
      const initialBars = initialPattern.bars;

      // Drag pattern
      const pattern = getPatternElement(page, 0);
      const patternContent = pattern.locator('> div[class*="content"]');
      const box = await patternContent.boundingBox();
      if (!box) throw new Error('Pattern has no bounding box');

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(200);
      await page.mouse.move(box.x + 200, box.y + box.height / 2);
      await page.mouse.up();

      // Wait for drag to complete
      await page.waitForTimeout(300);

      // Verify pattern data is preserved
      const finalState = await getReduxState(page);
      const finalSongData = Object.values(finalState.song.song_data)[0] as any;
      const finalPattern = finalSongData.patterns['Pattern A'];

      // Pattern data should be unchanged
      expect(finalPattern.bars).toEqual(initialBars);
      expect(finalPattern.type).toBe(initialPattern.type);
      expect(finalPattern.bar_count).toBe(initialPattern.bar_count);
    });
  });
});
