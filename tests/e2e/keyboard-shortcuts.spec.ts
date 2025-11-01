/**
 * E2E tests for keyboard shortcuts
 * Tests essential keyboard shortcuts across different domains
 */

import { test, expect } from '@playwright/test';
import {
  setupTimeline,
  dragTestSong,
  getPatternElement,
  getTrackElement,
  getAddTrackButton,
  getReduxState,
} from '../helpers';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await setupTimeline(page, dragTestSong());
  });

  test.describe('Pattern Operations', () => {
    test('should delete pattern with Delete key', async ({ page }) => {
      // Click pattern to select it
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

      // Press Delete key
      await page.keyboard.press('Delete');

      // Wait for pattern to be removed from scene (web-first waiting)
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          const currentSong = state.song.song_data['Drag Test'];
          const scene = currentSong.scenes['Scene 1'];
          return scene.pattern_assignments['track_1'] === undefined;
        },
        {},
        { timeout: 2000 }
      );

      // Verify pattern removed in Redux
      const state = await getReduxState(page);
      const currentSong = state.song.song_data['Drag Test'];
      const scene = currentSong.scenes['Scene 1'];
      expect(scene.pattern_assignments['track_1']).toBeUndefined();
    });

    test('should delete pattern with Backspace key', async ({ page }) => {
      // Click pattern to select it
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

      // Press Backspace key
      await page.keyboard.press('Backspace');

      // Wait for pattern to be removed
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          const currentSong = state.song.song_data['Drag Test'];
          const scene = currentSong.scenes['Scene 1'];
          return scene.pattern_assignments['track_1'] === undefined;
        },
        {},
        { timeout: 2000 }
      );
    });

    test('should select all patterns with Ctrl+A', async ({ page }) => {
      // Press Ctrl+A
      await page.keyboard.press('Control+a');

      // Wait for all patterns to be selected (web-first waiting)
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          // Should select both Pattern A and Pattern B
          return state.selection?.selectedPatternIds?.length === 2;
        },
        {},
        { timeout: 2000 }
      );

      // Verify selection in Redux
      const state = await getReduxState(page);
      expect(state.selection?.selectedPatternIds?.length).toBe(2);
    });

    test('should deselect all with Ctrl+Shift+A', async ({ page }) => {
      // First select a pattern
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

      // Press Ctrl+Shift+A to deselect
      await page.keyboard.press('Control+Shift+A');

      // Wait for deselection (web-first waiting)
      await page.waitForFunction(
        () => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          return state.selection?.selectedPatternIds?.length === 0;
        },
        {},
        { timeout: 2000 }
      );

      // Verify no selection
      const state = await getReduxState(page);
      expect(state.selection?.selectedPatternIds?.length).toBe(0);
    });
  });

  test.describe('Track Operations', () => {
    test('should add track with "i" key', async ({ page }) => {
      // Get initial track count
      const initialState = await getReduxState(page);
      const initialTrackCount = initialState.song._cyclone_metadata.trackOrder.length;

      // Press 'i' to add track
      await page.keyboard.press('i');

      // Wait for track to be added (web-first waiting)
      await page.waitForFunction(
        ({ expectedCount }) => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          return state.song._cyclone_metadata.trackOrder.length === expectedCount;
        },
        { expectedCount: initialTrackCount + 1 },
        { timeout: 2000 }
      );

      // Verify track count increased
      const newState = await getReduxState(page);
      expect(newState.song._cyclone_metadata.trackOrder.length).toBe(initialTrackCount + 1);
    });
  });

  test.describe('View/Zoom Operations', () => {
    test('should zoom in with ] key', async ({ page }) => {
      // Get initial zoom level
      const initialState = await getReduxState(page);
      const initialZoom = initialState.view?.zoom || 1;

      // Press ] to zoom in
      await page.keyboard.press(']');

      // Wait for zoom to change (web-first waiting)
      await page.waitForFunction(
        ({ initialZoom }) => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          const currentZoom = state.view?.zoom || 1;
          return currentZoom > initialZoom;
        },
        { initialZoom },
        { timeout: 2000 }
      );

      // Verify zoom increased
      const newState = await getReduxState(page);
      const newZoom = newState.view?.zoom || 1;
      expect(newZoom).toBeGreaterThan(initialZoom);
    });

    test('should zoom out with [ key', async ({ page }) => {
      // First zoom in a bit to have room to zoom out
      await page.keyboard.press(']');
      await page.keyboard.press(']');

      // Wait for zoom to settle
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

      // Get current zoom level
      const currentState = await getReduxState(page);
      const currentZoom = currentState.view?.zoom || 1;

      // Press [ to zoom out
      await page.keyboard.press('[');

      // Wait for zoom to change (web-first waiting)
      await page.waitForFunction(
        ({ currentZoom }) => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          const newZoom = state.view?.zoom || 1;
          return newZoom < currentZoom;
        },
        { currentZoom },
        { timeout: 2000 }
      );

      // Verify zoom decreased
      const newState = await getReduxState(page);
      const newZoom = newState.view?.zoom || 1;
      expect(newZoom).toBeLessThan(currentZoom);
    });
  });

  test.describe('Arrow Key Navigation', () => {
    test('should navigate with arrow keys', async ({ page }) => {
      // Click first pattern to select
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

      const initialState = await getReduxState(page);
      const initialSelection = initialState.selection?.selectedPatternIds[0];

      // Press ArrowDown to navigate to pattern below
      await page.keyboard.press('ArrowDown');

      // Wait for selection to change (web-first waiting)
      await page.waitForFunction(
        ({ initialSelection }) => {
          const store = (window as any).__REDUX_STORE__;
          if (!store) return false;
          const state = store.getState();
          const currentSelection = state.selection?.selectedPatternIds[0];
          return currentSelection !== initialSelection;
        },
        { initialSelection },
        { timeout: 2000 }
      );

      // Verify selection changed
      const newState = await getReduxState(page);
      const newSelection = newState.selection?.selectedPatternIds[0];
      expect(newSelection).not.toBe(initialSelection);
    });
  });
});
