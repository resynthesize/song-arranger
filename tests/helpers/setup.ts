/**
 * Base test setup - common initialization for E2E tests
 */

import type { Page } from '@playwright/test';
import type { CirklonSongData } from '../../src/utils/cirklon/types';
import { minimalSong } from './fixtures';

/**
 * Load app with test data
 */
export const setupTimeline = async (page: Page, songData?: CirklonSongData) => {
  await page.goto('/');

  // Wait for app to be ready
  await page.waitForSelector('[data-testid="timeline"]', { timeout: 10000 });

  // Load test data if provided
  if (songData) {
    await loadTestData(page, songData);
  }

  return page;
};

/**
 * Load CKS data into the app via Redux
 */
export const loadTestData = async (page: Page, songData: CirklonSongData) => {
  await page.evaluate((data) => {
    const store = (window as any).__REDUX_STORE__;
    if (!store) throw new Error('Redux store not exposed');

    // Use the loadSong action which properly initializes metadata
    store.dispatch({
      type: 'song/loadSong',
      payload: data,
    });
  }, songData);

  // Wait for song data to be loaded in Redux (web-first waiting)
  await page.waitForFunction(
    ({ expectedSongName }) => {
      const store = (window as any).__REDUX_STORE__;
      if (!store) return false;
      const state = store.getState();
      // Song state is wrapped in undoable wrapper (present/past/future)
      return state.song.present?._cyclone_metadata?.currentSongName === expectedSongName;
    },
    { expectedSongName: songData._cyclone_metadata.currentSongName },
    { timeout: 2000 }
  );
};

/**
 * Create default test context with minimal song
 */
export const createTestContext = async (page: Page) => {
  await setupTimeline(page, minimalSong());
  return {
    page,
    // Common values
    pixelsPerBeat: 25, // Default zoom level
    defaultTrackHeight: 120,
  };
};
