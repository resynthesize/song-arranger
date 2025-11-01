/**
 * E2E test for initial state with 16 default tracks
 * Verifies that the app loads with 16 tracks by default
 */

import { test, expect } from '@playwright/test';
import { getReduxState, waitForStateChange } from '../helpers/redux';
import { getTrackElement } from '../helpers/selectors';

test.describe('Initial State - 16 Default Tracks', () => {
  test('should load with 16 tracks in Redux state', async ({ page }) => {
    // Clear localStorage to ensure fresh state (no template project)
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate to app (fresh load after clearing storage)
    await page.goto('/');

    // Wait for timeline to be ready
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible({ timeout: 5000 });

    // Get Redux state
    const state = await getReduxState(page);
    console.log('Redux State:', JSON.stringify(state, null, 2));

    // Check metadata
    const metadata = state.song.present._cyclone_metadata;
    console.log('Metadata:', JSON.stringify(metadata, null, 2));

    // Verify trackOrder has 16 tracks
    expect(metadata.trackOrder).toHaveLength(16);

    // Verify uiMappings.tracks has 16 entries
    const trackMappings = Object.keys(metadata.uiMappings.tracks);
    expect(trackMappings).toHaveLength(16);
    console.log('Track mappings:', trackMappings);

    // Verify tracks have proper structure
    Object.entries(metadata.uiMappings.tracks).forEach(([trackKey, mapping]: any) => {
      expect(trackKey).toMatch(/^track_\d+$/);
      expect(mapping).toHaveProperty('reactKey');
      expect(mapping).toHaveProperty('color');
      expect(mapping).toHaveProperty('trackNumber');
    });
  });

  test('should render 16 track elements in the DOM', async ({ page }) => {
    // Clear localStorage to ensure fresh state (no template project)
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate to app (fresh load after clearing storage)
    await page.goto('/');

    // Wait for timeline to be ready
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible({ timeout: 5000 });

    // Count track elements in DOM
    const trackElements = page.locator('[data-testid^="track-"]');
    const count = await trackElements.count();

    console.log(`Found ${count} track elements in DOM`);

    // Verify we have at least 16 tracks
    expect(count).toBeGreaterThanOrEqual(16);

    // Verify each track is visible
    for (let i = 0; i < Math.min(16, count); i++) {
      const track = getTrackElement(page, i);
      await expect(track).toBeVisible({ timeout: 5000 });
      console.log(`Track ${i} is visible`);
    }
  });

  test('should have Intro scene with proper structure', async ({ page }) => {
    // Clear localStorage to ensure fresh state (no template project)
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate to app (fresh load after clearing storage)
    await page.goto('/');

    // Wait for timeline to be ready
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible({ timeout: 5000 });

    // Get Redux state
    const state = await getReduxState(page);
    const songData = state.song.present.song_data['Untitled Song'];

    // Verify Intro scene exists
    expect(songData.scenes).toHaveProperty('Intro');

    const introScene = songData.scenes.Intro;
    expect(introScene.gbar).toBe(16); // Standard 4/4 time
    expect(introScene.length).toBe(4);
    expect(introScene.pattern_assignments).toEqual({});

    // Verify scene is in metadata
    const metadata = state.song.present._cyclone_metadata;
    expect(metadata.sceneOrder).toContain('Intro');
    expect(metadata.uiMappings.scenes).toHaveProperty('Intro');
  });

  test('should have correct song state structure', async ({ page }) => {
    // Clear localStorage to ensure fresh state (no template project)
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate to app (fresh load after clearing storage)
    await page.goto('/');

    // Wait for timeline to be ready
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible({ timeout: 5000 });

    // Get Redux state
    const state = await getReduxState(page);
    const songState = state.song.present;

    // Verify basic structure
    expect(songState).toHaveProperty('song_data');
    expect(songState).toHaveProperty('_cyclone_metadata');

    // Verify current song name
    expect(songState._cyclone_metadata.currentSongName).toBe('Untitled Song');

    // Verify song data has the current song
    expect(songState.song_data).toHaveProperty('Untitled Song');

    const currentSong = songState.song_data['Untitled Song'];
    expect(currentSong).toHaveProperty('patterns');
    expect(currentSong).toHaveProperty('scenes');
    expect(currentSong).toHaveProperty('instrument_assignments');
  });
});
