/**
 * Redux test helpers - inspect store state in E2E tests
 */

import type { Page } from '@playwright/test';

/**
 * Evaluate Redux state from the page's window object
 */
export const getReduxState = async (page: Page) => {
  return page.evaluate(() => {
    // Access store from window (exposed in dev mode)
    const store = (window as any).__REDUX_STORE__;
    if (!store) throw new Error('Redux store not exposed on window');
    return store.getState();
  });
};

/**
 * Get song data from Redux state
 */
export const getSongData = async (page: Page) => {
  const state = await getReduxState(page);
  return state.song.present;
};

/**
 * Get specific pattern by reactId
 */
export const getPattern = async (page: Page, reactId: string) => {
  const state = await getReduxState(page);
  // Find pattern in metadata
  const metadata = state.song.present._cyclone_metadata;
  if (!metadata?.uiMappings?.patterns) return null;

  return Object.entries(metadata.uiMappings.patterns).find(
    ([, mapping]: [string, any]) => mapping.reactKey === reactId
  );
};

/**
 * Get track by reactId
 */
export const getTrack = async (page: Page, reactId: string) => {
  const state = await getReduxState(page);
  const metadata = state.song.present._cyclone_metadata;
  if (!metadata?.uiMappings?.tracks) return null;

  return Object.entries(metadata.uiMappings.tracks).find(
    ([, mapping]: [string, any]) => mapping.reactKey === reactId
  );
};

/**
 * Wait for Redux state to match condition
 */
export const waitForStateChange = async (
  page: Page,
  condition: (state: any) => boolean,
  timeout = 3000
) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const state = await getReduxState(page);
    if (condition(state)) return true;
    await page.waitForTimeout(50);
  }
  throw new Error('State condition not met within timeout');
};
