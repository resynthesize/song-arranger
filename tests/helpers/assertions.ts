/**
 * Custom assertions - reusable test assertions
 */

import { expect, type Locator } from '@playwright/test';
import { getReduxState } from './redux';

/**
 * Assert pattern is at specific position in beats
 */
export const expectPatternAtPosition = async (
  patternElement: Locator,
  expectedBeats: number,
  pixelsPerBeat: number
) => {
  const box = await patternElement.boundingBox();
  if (!box) throw new Error('Pattern has no bounding box');

  const actualPixels = box.x;
  const expectedPixels = expectedBeats * pixelsPerBeat;
  const tolerance = 5; // Allow 5px tolerance

  expect(Math.abs(actualPixels - expectedPixels)).toBeLessThan(tolerance);
};

/**
 * Assert track has specific height
 */
export const expectTrackHeight = async (trackElement: Locator, expectedHeight: number) => {
  const box = await trackElement.boundingBox();
  if (!box) throw new Error('Track has no bounding box');

  const tolerance = 2;
  expect(Math.abs(box.height - expectedHeight)).toBeLessThan(tolerance);
};

/**
 * Assert pattern is in specific track
 */
export const expectPatternInTrack = async (
  patternElement: Locator,
  trackElement: Locator
) => {
  const patternBox = await patternElement.boundingBox();
  const trackBox = await trackElement.boundingBox();

  if (!patternBox || !trackBox) {
    throw new Error('Elements have no bounding box');
  }

  const patternCenterY = patternBox.y + patternBox.height / 2;
  expect(patternCenterY).toBeGreaterThan(trackBox.y);
  expect(patternCenterY).toBeLessThan(trackBox.y + trackBox.height);
};

/**
 * Assert Redux state matches condition
 */
export const expectStateToMatch = async (
  page: Locator['page'],
  condition: (state: any) => boolean,
  message?: string
) => {
  const state = await getReduxState(page);
  expect(condition(state)).toBe(true);
};

/**
 * Assert element is visible
 */
export const expectVisible = async (element: Locator) => {
  await expect(element).toBeVisible();
};

/**
 * Assert element is hidden
 */
export const expectHidden = async (element: Locator) => {
  await expect(element).toBeHidden();
};
