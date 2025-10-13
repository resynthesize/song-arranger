/**
 * Song Arranger - Selection Selectors Tests
 * Test suite for selection selectors with memoization
 */

import {
  selectSelectedClipIds,
  selectCurrentLaneId,
  selectHasSelection,
  selectSelectionCount,
  selectHasMultipleSelection,
  selectFirstSelectedClipId,
} from './selection';
import type { RootState } from '@/store/store';

// Helper to create mock RootState
const createMockState = (selectedIds: string[] = [], currentLaneId: string | null = null): RootState => {
  return {
    clips: { clips: [], editingClipId: null },
    lanes: { lanes: [], editingLaneId: null, movingLaneId: null },
    selection: { selectedClipIds: selectedIds, currentLaneId },
    timeline: {
      viewport: { offsetBeats: 0, zoom: 50, widthPx: 1000, heightPx: 600 },
      verticalZoom: 100,
      playheadPosition: 0,
      isPlaying: false,
      tempo: 120,
      snapValue: 1,
      snapMode: 'grid',
      minimapVisible: false,
    },
    crtEffects: { enabled: true },
    project: {
      currentProjectId: null,
      currentProjectName: 'Untitled',
      isDirty: false,
      lastSaved: null,
    },
    quickInput: { isOpen: false, command: null },
    commandPalette: { isOpen: false },
  } as RootState;
};

describe('Selection Selectors', () => {
  describe('selectSelectedClipIds', () => {
    it('should return selected clip IDs', () => {
      const state = createMockState(['clip-1', 'clip-2']);

      expect(selectSelectedClipIds(state)).toEqual(['clip-1', 'clip-2']);
    });

    it('should return empty array when nothing selected', () => {
      const state = createMockState([]);

      expect(selectSelectedClipIds(state)).toEqual([]);
    });
  });

  describe('selectCurrentLaneId', () => {
    it('should return current lane ID', () => {
      const state = createMockState([], 'lane-1');

      expect(selectCurrentLaneId(state)).toBe('lane-1');
    });

    it('should return null when no current lane', () => {
      const state = createMockState([], null);

      expect(selectCurrentLaneId(state)).toBeNull();
    });
  });

  describe('selectHasSelection', () => {
    it('should return true when clips are selected', () => {
      const state = createMockState(['clip-1']);

      expect(selectHasSelection(state)).toBe(true);
    });

    it('should return false when nothing selected', () => {
      const state = createMockState([]);

      expect(selectHasSelection(state)).toBe(false);
    });
  });

  describe('selectSelectionCount', () => {
    it('should return number of selected clips', () => {
      const state = createMockState(['clip-1', 'clip-2', 'clip-3']);

      expect(selectSelectionCount(state)).toBe(3);
    });

    it('should return 0 when nothing selected', () => {
      const state = createMockState([]);

      expect(selectSelectionCount(state)).toBe(0);
    });
  });

  describe('selectHasMultipleSelection', () => {
    it('should return true when multiple clips selected', () => {
      const state = createMockState(['clip-1', 'clip-2']);

      expect(selectHasMultipleSelection(state)).toBe(true);
    });

    it('should return false when single clip selected', () => {
      const state = createMockState(['clip-1']);

      expect(selectHasMultipleSelection(state)).toBe(false);
    });

    it('should return false when nothing selected', () => {
      const state = createMockState([]);

      expect(selectHasMultipleSelection(state)).toBe(false);
    });
  });

  describe('selectFirstSelectedClipId', () => {
    it('should return first selected clip ID', () => {
      const state = createMockState(['clip-1', 'clip-2', 'clip-3']);

      expect(selectFirstSelectedClipId(state)).toBe('clip-1');
    });

    it('should return null when nothing selected', () => {
      const state = createMockState([]);

      expect(selectFirstSelectedClipId(state)).toBeNull();
    });
  });
});
