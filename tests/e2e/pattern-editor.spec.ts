/**
 * E2E tests for pattern editor value dragging
 */

import { test, expect } from '@playwright/test';
import {
  setupTimeline,
  minimalSong,
  getPatternElement,
  getPatternEditor,
  getPatternEditorStep,
  dragBy,
  getReduxState,
} from '../helpers';

test.describe('Pattern Editor', () => {
  test.beforeEach(async ({ page }) => {
    await setupTimeline(page, minimalSong());

    // Open pattern editor by double-clicking pattern content area
    const pattern = getPatternElement(page, 0);
    // Find the content div inside the pattern (where the double-click handler is attached)
    const patternContent = pattern.locator('> div[class*="content"]');
    await patternContent.dblclick();

    // Wait for pattern editor to be visible (web-first assertion)
    await expect(page.locator('[data-testid="pattern-editor"]')).toBeVisible();
  });

  test('should drag velocity value up/down', async ({ page }) => {
    const editor = getPatternEditor(page);
    await expect(editor).toBeVisible();

    // Get initial velocity value from CKS format (bars at top level in Redux)
    const initialState = await getReduxState(page);
    const initialSongData = Object.values(initialState.song.song_data)[0] as any;
    const initialPattern = Object.values(initialSongData.patterns)[0] as any;
    const initialVelocity = initialPattern.bars[0].velo[0];

    // Find velocity bar for first step - use BarChart which is the draggable element
    const velocityRow = editor.locator('[data-row="velocity"]').first();
    const velocityBar = velocityRow.locator('[data-testid^="bar-chart-bar-"]').first();

    // Drag velocity bar up (increase value)
    // Drag distance of -20 pixels with sensitivity of 2 = +10 velocity units
    await dragBy(velocityBar, 0, -20);

    // Wait for state to update by checking the value changed (CKS format)
    await page.waitForFunction(
      (expectedMinValue) => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const songData = Object.values(state.song.song_data)[0] as any;
        const pattern = Object.values(songData.patterns)[0] as any;
        const velocity = pattern.bars[0].velo[0];
        return velocity > expectedMinValue;
      },
      initialVelocity,
      { timeout: 2000 }
    );

    // Verify velocity increased in Redux (CKS format)
    const state = await getReduxState(page);
    const songData = Object.values(state.song.song_data)[0] as any;
    const pattern = Object.values(songData.patterns)[0] as any;
    const newVelocity = pattern.bars[0].velo[0];

    expect(newVelocity).toBeGreaterThan(initialVelocity);
  });

  test('should drag note value up/down', async ({ page }) => {
    const editor = getPatternEditor(page);
    await expect(editor).toBeVisible();

    // Get initial note value from CKS format (bars at top level in Redux)
    const initialState = await getReduxState(page);
    const initialSongData = Object.values(initialState.song.song_data)[0] as any;
    const initialPattern = Object.values(initialSongData.patterns)[0] as any;
    const initialNote = initialPattern.bars[0].note[0];

    // Find note row - use BarChart which is the draggable element
    const noteRow = editor.locator('[data-row="note"]').first();
    const noteBar = noteRow.locator('[data-testid^="bar-chart-bar-"]').first();

    // Drag note up (increase pitch)
    // Drag distance of -30 pixels with sensitivity of 2 = +15 semitones
    await dragBy(noteBar, 0, -30);

    // Wait for state to update by checking the note changed (CKS format)
    await page.waitForFunction(
      (expectedInitialNote) => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const songData = Object.values(state.song.song_data)[0] as any;
        const pattern = Object.values(songData.patterns)[0] as any;
        const note = pattern.bars[0].note[0];
        return note !== expectedInitialNote;
      },
      initialNote,
      { timeout: 2000 }
    );

    // Verify note changed in Redux (CKS format)
    const state = await getReduxState(page);
    const songData = Object.values(state.song.song_data)[0] as any;
    const pattern = Object.values(songData.patterns)[0] as any;
    const newNote = pattern.bars[0].note[0];

    // Note should have changed from initial value
    expect(newNote).not.toBe(initialNote);
  });

  test('should toggle gate on shift+click', async ({ page }) => {
    const editor = getPatternEditor(page);
    await expect(editor).toBeVisible();

    // Get initial gate state from CKS format (bars at top level in Redux)
    const initialState = await getReduxState(page);
    const songData = Object.values(initialState.song.song_data)[0] as any;
    const pattern = Object.values(songData.patterns)[0] as any;
    const initialGate = pattern.bars[0].gate[0];

    // Find gate indicator for first step in any row
    const firstRow = editor.locator('[data-row]').first();
    const gateIndicator = firstRow.locator('[data-testid^="bar-chart-bar-"]').first();

    // Shift+click to toggle gate (based on PatternRow.tsx logic)
    await gateIndicator.click({ modifiers: ['Shift'] });

    // Wait for state to update by checking the gate toggled (CKS format)
    await page.waitForFunction(
      (expectedInitialGate) => {
        const store = (window as any).__REDUX_STORE__;
        if (!store) return false;
        const state = store.getState();
        const songData = Object.values(state.song.song_data)[0] as any;
        const pattern = Object.values(songData.patterns)[0] as any;
        const gate = pattern.bars[0].gate[0];
        return gate !== expectedInitialGate;
      },
      initialGate,
      { timeout: 2000 }
    );

    // Verify gate toggled in Redux (CKS format)
    const newState = await getReduxState(page);
    const newSongData = Object.values(newState.song.song_data)[0] as any;
    const newPattern = Object.values(newSongData.patterns)[0] as any;
    const newGate = newPattern.bars[0].gate[0];

    expect(newGate).toBe(initialGate === 1 ? 0 : 1);
  });
});
