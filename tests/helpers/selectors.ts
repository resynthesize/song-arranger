/**
 * Page element selectors - reusable element getters
 */

import type { Page, Locator } from '@playwright/test';

/**
 * Get pattern element by test ID or index
 */
export const getPatternElement = (page: Page, identifier: string | number): Locator => {
  if (typeof identifier === 'number') {
    return page.locator('[data-testid^="pattern-"]').nth(identifier);
  }
  return page.locator(`[data-testid="pattern-${identifier}"]`);
};

/**
 * Get track element by test ID or index
 */
export const getTrackElement = (page: Page, identifier: string | number): Locator => {
  if (typeof identifier === 'number') {
    return page.locator('[data-testid^="track-"]').nth(identifier);
  }
  return page.locator(`[data-testid="track-${identifier}"]`);
};

/**
 * Get track resize handle
 */
export const getTrackResizeHandle = (page: Page, trackIdentifier: string | number): Locator => {
  const track = getTrackElement(page, trackIdentifier);
  return track.locator('[data-testid^="track-resize-handle-"]');
};

/**
 * Get track fold/collapse button
 */
export const getTrackFoldButton = (page: Page, trackIdentifier: string | number): Locator => {
  const track = getTrackElement(page, trackIdentifier);
  return track.locator('[data-testid$="-collapse-button"]');
};

/**
 * Get scene element by ID
 */
export const getSceneElement = (page: Page, sceneId: string): Locator => {
  return page.locator(`[data-testid="scene-marker-${sceneId}"]`);
};

/**
 * Get add track button
 */
export const getAddTrackButton = (page: Page): Locator => {
  return page.locator('[data-testid="add-track-button"]');
};

/**
 * Get pattern editor element
 */
export const getPatternEditor = (page: Page): Locator => {
  return page.locator('[data-testid="pattern-editor"]');
};

/**
 * Get pattern editor bar
 */
export const getPatternEditorBar = (page: Page, barIndex: number): Locator => {
  return page.locator(`[data-testid="pattern-bar-${barIndex}"]`);
};

/**
 * Get pattern editor step
 */
export const getPatternEditorStep = (
  page: Page,
  barIndex: number,
  stepIndex: number
): Locator => {
  return page.locator(`[data-testid="pattern-step-${barIndex}-${stepIndex}"]`);
};
