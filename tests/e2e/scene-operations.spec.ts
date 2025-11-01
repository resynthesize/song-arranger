/**
 * E2E tests for scene operations (renaming)
 */

import { test, expect } from '@playwright/test';
import {
  setupTimeline,
  minimalSong,
  getSceneElement,
  doubleClickAndType,
  getReduxState,
} from '../helpers';

test.describe('Scene Operations', () => {
  test.beforeEach(async ({ page }) => {
    await setupTimeline(page, minimalSong());
  });

  test('should rename scene on double-click and Enter', async ({ page }) => {
    const scene = getSceneElement(page, 'Scene 1');
    const newName = 'Intro';

    // Double-click and type new name
    await doubleClickAndType(scene, newName, true);

    // Wait for scene name to change in Redux (web-first waiting)
    await page.waitForFunction(
      ({ expectedName }) => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const songData = Object.values(state.song.song_data)[0] as any;
        const sceneNames = Object.keys(songData.scenes);
        return sceneNames.includes(expectedName) && !sceneNames.includes('Scene 1');
      },
      { expectedName: newName },
      { timeout: 2000 }
    );

    // Verify name changed in Redux
    const state = await getReduxState(page);
    const songData = Object.values(state.song.song_data)[0] as any;
    const sceneNames = Object.keys(songData.scenes);

    // Old name should be replaced with new name
    expect(sceneNames).not.toContain('Scene 1');
    expect(sceneNames).toContain(newName);

    // Verify UI shows new name
    const renamedScene = getSceneElement(page, newName);
    await expect(renamedScene).toBeVisible();
  });

  test('should preserve patterns when renaming scene', async ({ page }) => {
    // Get initial pattern count
    const initialState = await getReduxState(page);
    const initialSongData = Object.values(initialState.song.song_data)[0] as any;
    const initialPatterns = Object.keys(initialSongData.scenes['Scene 1'].patterns);

    const scene = getSceneElement(page, 'Scene 1');

    // Rename scene
    await doubleClickAndType(scene, 'Verse', true);

    // Wait for scene to be renamed (web-first waiting)
    await page.waitForFunction(
      () => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const songData = Object.values(state.song.song_data)[0] as any;
        return 'Verse' in songData.scenes && !('Scene 1' in songData.scenes);
      },
      {},
      { timeout: 2000 }
    );

    // Verify patterns still exist
    const newState = await getReduxState(page);
    const newSongData = Object.values(newState.song.song_data)[0] as any;
    const newPatterns = Object.keys(newSongData.scenes['Verse'].patterns);

    expect(newPatterns).toEqual(initialPatterns);
  });

  test('should cancel rename on Escape', async ({ page }) => {
    const scene = getSceneElement(page, 'Scene 1');

    // Start editing
    await scene.dblclick();
    await scene.fill('TempName');

    // Press Escape to cancel
    await scene.press('Escape');

    // Wait for edit mode to exit by checking the element is no longer an input
    await expect(scene).not.toBeFocused();

    // Verify name unchanged in Redux
    const state = await getReduxState(page);
    const songData = Object.values(state.song.song_data)[0] as any;
    const sceneNames = Object.keys(songData.scenes);

    expect(sceneNames).toContain('Scene 1');
    expect(sceneNames).not.toContain('TempName');
  });
});
