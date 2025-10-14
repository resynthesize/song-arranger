/**
 * Cyclone - Selection Selectors Tests
 * Test suite for selection selectors with memoization
 */

import {
  selectSelectedPatternIds,
  selectCurrentTrackId,
  selectHasSelection,
  selectSelectionCount,
  selectHasMultipleSelection,
  selectFirstSelectedPatternId,
} from './selection';
import type { RootState } from '@/store/store';

// Helper to create mock RootState
const createMockState = (selectedIds: string[] = [], currentTrackId: string | null = null): RootState => {
  return {
    patterns: { patterns: [], editingPatternId: null },
    tracks: { tracks: [], editingTrackId: null, movingTrackId: null },
    selection: { selectedPatternIds: selectedIds, currentTrackId },
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
    status: { currentMessage: null },
  } as RootState;
};

describe('Selection Selectors', () => {
  describe('selectSelectedPatternIds', () => {
    it('should return selected pattern IDs', () => {
      const state = createMockState(['pattern-1', 'pattern-2']);

      expect(selectSelectedPatternIds(state)).toEqual(['pattern-1', 'pattern-2']);
    });

    it('should return empty array when nothing selected', () => {
      const state = createMockState([]);

      expect(selectSelectedPatternIds(state)).toEqual([]);
    });
  });

  describe('selectCurrentTrackId', () => {
    it('should return current track ID', () => {
      const state = createMockState([], 'track-1');

      expect(selectCurrentTrackId(state)).toBe('track-1');
    });

    it('should return null when no current track', () => {
      const state = createMockState([], null);

      expect(selectCurrentTrackId(state)).toBeNull();
    });
  });

  describe('selectHasSelection', () => {
    it('should return true when patterns are selected', () => {
      const state = createMockState(['pattern-1']);

      expect(selectHasSelection(state)).toBe(true);
    });

    it('should return false when nothing selected', () => {
      const state = createMockState([]);

      expect(selectHasSelection(state)).toBe(false);
    });
  });

  describe('selectSelectionCount', () => {
    it('should return number of selected patterns', () => {
      const state = createMockState(['pattern-1', 'pattern-2', 'pattern-3']);

      expect(selectSelectionCount(state)).toBe(3);
    });

    it('should return 0 when nothing selected', () => {
      const state = createMockState([]);

      expect(selectSelectionCount(state)).toBe(0);
    });
  });

  describe('selectHasMultipleSelection', () => {
    it('should return true when multiple patterns selected', () => {
      const state = createMockState(['pattern-1', 'pattern-2']);

      expect(selectHasMultipleSelection(state)).toBe(true);
    });

    it('should return false when single pattern selected', () => {
      const state = createMockState(['pattern-1']);

      expect(selectHasMultipleSelection(state)).toBe(false);
    });

    it('should return false when nothing selected', () => {
      const state = createMockState([]);

      expect(selectHasMultipleSelection(state)).toBe(false);
    });
  });

  describe('selectFirstSelectedPatternId', () => {
    it('should return first selected pattern ID', () => {
      const state = createMockState(['pattern-1', 'pattern-2', 'pattern-3']);

      expect(selectFirstSelectedPatternId(state)).toBe('pattern-1');
    });

    it('should return null when nothing selected', () => {
      const state = createMockState([]);

      expect(selectFirstSelectedPatternId(state)).toBeNull();
    });
  });
});
