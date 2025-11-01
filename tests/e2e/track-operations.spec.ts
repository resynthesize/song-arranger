/**
 * E2E tests for track operations (resize, fold, add)
 */

import { test, expect } from '@playwright/test';
import {
  setupTimeline,
  minimalSong,
  getTrackElement,
  getTrackResizeHandle,
  getTrackFoldButton,
  getAddTrackButton,
  dragBy,
  expectTrackHeight,
  expectHidden,
  getReduxState,
} from '../helpers';

test.describe('Track Operations', () => {
  test.beforeEach(async ({ page }) => {
    await setupTimeline(page, minimalSong());
  });

  test('should resize track by dragging border', async ({ page }) => {
    const track = getTrackElement(page, 0);
    const resizeHandle = getTrackResizeHandle(page, 0);
    const initialHeight = 120;
    const deltaHeight = 50;

    // Drag resize handle down
    await dragBy(resizeHandle, 0, deltaHeight);

    // Wait for Redux state to update with new height (web-first waiting)
    await page.waitForFunction(
      ({ expectedHeight }) => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const trackData = Object.values(state.song._cyclone_metadata.uiMappings.tracks)[0] as any;
        return trackData.height === expectedHeight;
      },
      { expectedHeight: initialHeight + deltaHeight },
      { timeout: 2000 }
    );

    // Verify new height visually
    await expectTrackHeight(track, initialHeight + deltaHeight);

    // Verify height persisted in Redux state
    const state = await getReduxState(page);
    const trackData = Object.values(state.song._cyclone_metadata.uiMappings.tracks)[0] as any;
    expect(trackData.height).toBe(initialHeight + deltaHeight);
  });

  test('should fold/collapse track', async ({ page }) => {
    const foldButton = getTrackFoldButton(page, 0);
    const track = getTrackElement(page, 0);

    // Click fold button
    await foldButton.click();

    // Wait for collapsed state in Redux (web-first waiting)
    await page.waitForFunction(
      () => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const trackData = Object.values(state.song._cyclone_metadata.uiMappings.tracks)[0] as any;
        return trackData.collapsed === true;
      },
      {},
      { timeout: 2000 }
    );

    // Track should collapse to minimal height
    await expectTrackHeight(track, 30); // Collapsed height

    // Verify collapsed state in Redux
    const state = await getReduxState(page);
    const trackData = Object.values(state.song._cyclone_metadata.uiMappings.tracks)[0] as any;
    expect(trackData.collapsed).toBe(true);

    // Click again to expand
    await foldButton.click();

    // Wait for expanded state in Redux (web-first waiting)
    await page.waitForFunction(
      () => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const trackData = Object.values(state.song._cyclone_metadata.uiMappings.tracks)[0] as any;
        return trackData.collapsed === false;
      },
      {},
      { timeout: 2000 }
    );

    // Track should expand back
    const stateAfter = await getReduxState(page);
    const trackDataAfter = Object.values(stateAfter.song._cyclone_metadata.uiMappings.tracks)[0] as any;
    expect(trackDataAfter.collapsed).toBe(false);
  });

  test('should add new track', async ({ page }) => {
    const addButton = getAddTrackButton(page);

    // Get initial track count
    const initialState = await getReduxState(page);
    const initialTrackCount = Object.keys(initialState.song._cyclone_metadata.trackOrder || {}).length;

    // Click add track button
    await addButton.click();

    // Wait for track count to increase (web-first waiting)
    await page.waitForFunction(
      ({ expectedCount }) => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const trackCount = Object.keys(state.song._cyclone_metadata.trackOrder || {}).length;
        return trackCount === expectedCount;
      },
      { expectedCount: initialTrackCount + 1 },
      { timeout: 2000 }
    );

    // Verify new track in Redux
    const newState = await getReduxState(page);
    const newTrackCount = Object.keys(newState.song._cyclone_metadata.trackOrder || {}).length;
    expect(newTrackCount).toBe(initialTrackCount + 1);

    // Verify new track is visible
    const newTrack = getTrackElement(page, initialTrackCount);
    await expect(newTrack).toBeVisible();
  });

  test('should enforce minimum height when resizing track', async ({ page }) => {
    const track = getTrackElement(page, 0);
    const resizeHandle = getTrackResizeHandle(page, 0);
    const minHeight = 30; // MIN_TRACK_HEIGHT constant

    // Try to drag resize handle up beyond minimum (attempt to make it 10px)
    const attemptedHeight = 10;
    const initialHeight = 120;
    const deltaY = attemptedHeight - initialHeight; // Negative value (drag up)

    await dragBy(resizeHandle, 0, deltaY);

    // Wait for Redux state to update
    await page.waitForTimeout(300);

    // Track should be clamped to minimum height
    await expectTrackHeight(track, minHeight);

    // Verify height in Redux is at minimum
    const state = await getReduxState(page);
    const trackData = Object.values(state.song._cyclone_metadata.uiMappings.tracks)[0] as any;
    expect(trackData.height).toBe(minHeight);
  });

  test('should drag track to reorder tracks', async ({ page }) => {
    const addButton = getAddTrackButton(page);

    // Add two more tracks (total: 3 tracks)
    await addButton.click();
    await page.waitForTimeout(200);
    await addButton.click();
    await page.waitForTimeout(200);

    // Get initial track order
    const initialState = await getReduxState(page);
    const initialOrder = [...initialState.song._cyclone_metadata.trackOrder];

    // Drag first track down to position 2
    const firstTrack = getTrackElement(page, 0);
    const secondTrack = getTrackElement(page, 1);

    // Get bounding boxes to calculate drag distance
    const firstBox = await firstTrack.boundingBox();
    const secondBox = await secondTrack.boundingBox();

    if (!firstBox || !secondBox) {
      throw new Error('Track bounding boxes not found');
    }

    // Drag first track down past the second track
    const dragDistance = secondBox.y - firstBox.y + secondBox.height / 2;
    const trackHeader = firstTrack.locator('[data-testid^="track-"][data-testid$="-header"]');
    await dragBy(trackHeader, 0, dragDistance);

    // Wait for track order to update
    await page.waitForFunction(
      ({ firstTrackKey }) => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const order = state.song._cyclone_metadata.trackOrder;
        return order[0] !== firstTrackKey;
      },
      { firstTrackKey: initialOrder[0] },
      { timeout: 2000 }
    );

    // Verify track order changed in Redux
    const newState = await getReduxState(page);
    const newOrder = [...newState.song._cyclone_metadata.trackOrder];

    // First track should now be at position 1
    expect(newOrder[1]).toBe(initialOrder[0]);
    expect(newOrder[0]).toBe(initialOrder[1]);
  });
});
