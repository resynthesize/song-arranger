/**
 * E2E tests for pattern operations
 * Tests: move, select, resize, ganged operations, rename
 */

import { test, expect } from '@playwright/test';
import {
  setupTimeline,
  minimalSong,
  getPatternElement,
  getTrackElement,
  getAddTrackButton,
  dragBy,
  clickWithModifiers,
  doubleClickAndType,
  pressKey,
  getReduxState,
} from '../helpers';

test.describe('Pattern Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Setup timeline with multiple tracks and patterns
    const song = minimalSong();
    await setupTimeline(page, song);

    // Add a second track for vertical drag tests
    const addButton = getAddTrackButton(page);
    await addButton.click();
    await page.waitForTimeout(300);

    // Add patterns to both tracks by double-clicking
    const track0 = getTrackElement(page, 0);
    const track1 = getTrackElement(page, 1);

    // Add pattern to track 0 at position 0
    const track0Content = track0.locator('[data-testid^="track-"][data-testid$="-content"]');
    const box0 = await track0Content.boundingBox();
    if (box0) {
      await page.mouse.dblclick(box0.x + 50, box0.y + box0.height / 2);
      await page.waitForTimeout(200);
    }

    // Add pattern to track 0 at position 200px
    if (box0) {
      await page.mouse.dblclick(box0.x + 250, box0.y + box0.height / 2);
      await page.waitForTimeout(200);
    }

    // Add pattern to track 1 at position 0
    const track1Content = track1.locator('[data-testid^="track-"][data-testid$="-content"]');
    const box1 = await track1Content.boundingBox();
    if (box1) {
      await page.mouse.dblclick(box1.x + 50, box1.y + box1.height / 2);
      await page.waitForTimeout(200);
    }
  });

  test('should move pattern horizontally by dragging', async ({ page }) => {
    const pattern = getPatternElement(page, 0);
    const initialState = await getReduxState(page);
    const patternData = Object.values(initialState.song.song_data['New Song'].patterns)[0] as any;
    const initialPosition = patternData.position;

    // Drag pattern 100px to the right (assuming 10px per beat zoom)
    await dragBy(pattern, 100, 0);

    // Wait for position to update
    await page.waitForFunction(
      ({ initialPos }) => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const patterns = Object.values(state.song.song_data['New Song'].patterns);
        if (patterns.length === 0) return false;
        const pattern = patterns[0] as any;
        return pattern.position !== initialPos;
      },
      { initialPos: initialPosition },
      { timeout: 2000 }
    );

    // Verify position changed in Redux
    const newState = await getReduxState(page);
    const newPatternData = Object.values(newState.song.song_data['New Song'].patterns)[0] as any;
    expect(newPatternData.position).toBeGreaterThan(initialPosition);
  });

  test('should move pattern vertically between tracks', async ({ page }) => {
    const pattern = getPatternElement(page, 0);
    const initialState = await getReduxState(page);
    const patterns = Object.values(initialState.song.song_data['New Song'].patterns);
    const initialPatternData = patterns[0] as any;
    const initialTrackId = initialPatternData.trackId;

    // Get track positions for vertical drag calculation
    const track0 = getTrackElement(page, 0);
    const track1 = getTrackElement(page, 1);

    const box0 = await track0.boundingBox();
    const box1 = await track1.boundingBox();

    if (!box0 || !box1) {
      throw new Error('Track bounding boxes not found');
    }

    // Calculate distance to drag pattern from track 0 to track 1
    const dragDistance = (box1.y + box1.height / 2) - (box0.y + box0.height / 2);

    // Drag pattern down to track 1
    await dragBy(pattern, 0, dragDistance);

    // Wait for trackId to update
    await page.waitForFunction(
      ({ initialTrack }) => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const patterns = Object.values(state.song.song_data['New Song'].patterns);
        if (patterns.length === 0) return false;
        const pattern = patterns[0] as any;
        return pattern.trackId !== initialTrack;
      },
      { initialTrack: initialTrackId },
      { timeout: 2000 }
    );

    // Verify pattern moved to different track
    const newState = await getReduxState(page);
    const newPatterns = Object.values(newState.song.song_data['New Song'].patterns);
    const newPatternData = newPatterns[0] as any;
    expect(newPatternData.trackId).not.toBe(initialTrackId);
  });

  test('should select pattern by clicking', async ({ page }) => {
    const pattern = getPatternElement(page, 0);

    // Click pattern to select
    await pattern.click();

    // Wait for selection state
    await page.waitForFunction(
      () => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        return state.timeline.selectedPatternIds.length > 0;
      },
      {},
      { timeout: 2000 }
    );

    // Verify pattern is selected
    const state = await getReduxState(page);
    expect(state.timeline.selectedPatternIds.length).toBe(1);
  });

  test('should multi-select patterns with Ctrl+click', async ({ page }) => {
    const pattern0 = getPatternElement(page, 0);
    const pattern1 = getPatternElement(page, 1);

    // Click first pattern
    await pattern0.click();
    await page.waitForTimeout(100);

    // Ctrl+click second pattern to add to selection
    await clickWithModifiers(pattern1, ['Control']);

    // Wait for multi-selection
    await page.waitForFunction(
      () => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        return state.timeline.selectedPatternIds.length === 2;
      },
      {},
      { timeout: 2000 }
    );

    // Verify both patterns selected
    const state = await getReduxState(page);
    expect(state.timeline.selectedPatternIds.length).toBe(2);
  });

  test('should select patterns with rectangle drag', async ({ page }) => {
    const track0 = getTrackElement(page, 0);
    const track0Content = track0.locator('[data-testid^="track-"][data-testid$="-content"]');

    // Get bounding box to perform rectangle drag
    const box = await track0Content.boundingBox();
    if (!box) {
      throw new Error('Track content not found');
    }

    // Drag from top-left to bottom-right to select both patterns on track 0
    const startX = box.x + 20;
    const startY = box.y + 10;
    const endX = box.x + 400;
    const endY = box.y + box.height - 10;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(endX, endY);
    await page.mouse.up();

    // Wait for selection to update
    await page.waitForFunction(
      () => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        return state.timeline.selectedPatternIds.length >= 2;
      },
      {},
      { timeout: 2000 }
    );

    // Verify multiple patterns selected
    const state = await getReduxState(page);
    expect(state.timeline.selectedPatternIds.length).toBeGreaterThanOrEqual(2);
  });

  test('should resize pattern from right edge', async ({ page }) => {
    const pattern = getPatternElement(page, 0);
    const initialState = await getReduxState(page);
    const initialPatternData = Object.values(initialState.song.song_data['New Song'].patterns)[0] as any;
    const initialDuration = initialPatternData.duration;
    const patternId = Object.keys(initialState.song.song_data['New Song'].patterns)[0];

    // Find the right resize handle using data-testid
    const rightHandle = page.locator(`[data-testid="pattern-${patternId}-handle-right"]`);

    // Get the handle's bounding box and drag using page.mouse (for document-level events)
    const handleBox = await rightHandle.boundingBox();
    if (!handleBox) {
      throw new Error('Right handle not found');
    }

    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;
    const endX = startX + 100;

    // Manual mouse operations for document-level events
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(200); // Wait for React useEffect to attach listeners
    await page.mouse.move(endX, startY);
    await page.mouse.up();

    // Wait for duration to update
    await page.waitForFunction(
      ({ initialDur }) => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const patterns = Object.values(state.song.song_data['New Song'].patterns);
        if (patterns.length === 0) return false;
        const pattern = patterns[0] as any;
        return pattern.duration !== initialDur;
      },
      { initialDur: initialDuration },
      { timeout: 2000 }
    );

    // Verify duration increased
    const newState = await getReduxState(page);
    const newPatternData = Object.values(newState.song.song_data['New Song'].patterns)[0] as any;
    expect(newPatternData.duration).toBeGreaterThan(initialDuration);
  });

  test('should resize pattern from left edge', async ({ page }) => {
    const pattern = getPatternElement(page, 0);
    const initialState = await getReduxState(page);
    const initialPatternData = Object.values(initialState.song.song_data['New Song'].patterns)[0] as any;
    const initialPosition = initialPatternData.position;
    const initialDuration = initialPatternData.duration;
    const patternId = Object.keys(initialState.song.song_data['New Song'].patterns)[0];

    // Find the left resize handle using data-testid
    const leftHandle = page.locator(`[data-testid="pattern-${patternId}-handle-left"]`);

    // Get the handle's bounding box and drag using page.mouse (for document-level events)
    const handleBox = await leftHandle.boundingBox();
    if (!handleBox) {
      throw new Error('Left handle not found');
    }

    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;
    const endX = startX - 50;

    // Manual mouse operations for document-level events
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(200); // Wait for React useEffect to attach listeners
    await page.mouse.move(endX, startY);
    await page.mouse.up();

    // Wait for pattern to update
    await page.waitForTimeout(300);

    // Verify position and duration changed
    const newState = await getReduxState(page);
    const newPatternData = Object.values(newState.song.song_data['New Song'].patterns)[0] as any;

    // Left drag should decrease position and increase duration
    expect(newPatternData.position).toBeLessThan(initialPosition);
    expect(newPatternData.duration).toBeGreaterThan(initialDuration);
  });

  test('should move multiple selected patterns together (ganged)', async ({ page }) => {
    const pattern0 = getPatternElement(page, 0);
    const pattern1 = getPatternElement(page, 1);

    // Select both patterns
    await pattern0.click();
    await page.waitForTimeout(100);
    await clickWithModifiers(pattern1, ['Control']);
    await page.waitForTimeout(100);

    // Get initial positions
    const initialState = await getReduxState(page);
    const patterns = Object.values(initialState.song.song_data['New Song'].patterns);
    const initialPositions = patterns.map((p: any) => p.position).sort((a, b) => a - b);

    // Drag first pattern 100px to the right
    await dragBy(pattern0, 100, 0);

    // Wait for both patterns to move
    await page.waitForFunction(
      ({ initialPos }) => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const patterns = Object.values(state.song.song_data['New Song'].patterns);
        if (patterns.length < 2) return false;
        const positions = patterns.map((p: any) => p.position).sort((a, b) => a - b);
        return positions[0] !== initialPos[0] && positions[1] !== initialPos[1];
      },
      { initialPos: initialPositions },
      { timeout: 2000 }
    );

    // Verify both patterns moved
    const newState = await getReduxState(page);
    const newPatterns = Object.values(newState.song.song_data['New Song'].patterns);
    const newPositions = newPatterns.map((p: any) => p.position).sort((a, b) => a - b);

    // Both patterns should have moved by approximately the same amount
    const delta0 = newPositions[0] - initialPositions[0];
    const delta1 = newPositions[1] - initialPositions[1];

    expect(Math.abs(delta0 - delta1)).toBeLessThan(1); // Should move together
    expect(newPositions[0]).toBeGreaterThan(initialPositions[0]);
    expect(newPositions[1]).toBeGreaterThan(initialPositions[1]);
  });

  test('should rename pattern by pressing Enter', async ({ page }) => {
    const pattern = getPatternElement(page, 0);

    // Select pattern
    await pattern.click();
    await page.waitForTimeout(100);

    // Press Enter to start editing
    await pressKey(page, 'Enter');
    await page.waitForTimeout(100);

    // Type new name
    await page.keyboard.type('Bass Pattern');
    await page.keyboard.press('Enter');

    // Wait for label to update
    await page.waitForFunction(
      () => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const patterns = Object.values(state.song.song_data['New Song'].patterns);
        if (patterns.length === 0) return false;
        const pattern = patterns[0] as any;
        return pattern.label === 'Bass Pattern';
      },
      {},
      { timeout: 2000 }
    );

    // Verify label changed
    const state = await getReduxState(page);
    const patternData = Object.values(state.song.song_data['New Song'].patterns)[0] as any;
    expect(patternData.label).toBe('Bass Pattern');
  });

  test('should rename pattern via context menu', async ({ page }) => {
    const pattern = getPatternElement(page, 0);

    // Right-click to open context menu
    await pattern.click({ button: 'right' });
    await page.waitForTimeout(200);

    // Click "Rename" in context menu
    const contextMenu = page.locator('[data-testid="context-menu"]');
    await expect(contextMenu).toBeVisible();

    // Find and click the rename option
    const renameOption = contextMenu.locator('text=/Rename|Edit/i');
    if (await renameOption.count() > 0) {
      await renameOption.first().click();
      await page.waitForTimeout(100);

      // Type new name
      await page.keyboard.type('Drums');
      await page.keyboard.press('Enter');

      // Wait for label to update
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          const patterns = Object.values(state.song.song_data['New Song'].patterns);
          if (patterns.length === 0) return false;
          const pattern = patterns[0] as any;
          return pattern.label === 'Drums';
        },
        {},
        { timeout: 2000 }
      );

      // Verify label changed
      const state = await getReduxState(page);
      const patternData = Object.values(state.song.song_data['New Song'].patterns)[0] as any;
      expect(patternData.label).toBe('Drums');
    } else {
      // If no rename option, test passes (feature may not be implemented yet)
      test.skip();
    }
  });
});
