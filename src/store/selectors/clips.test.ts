/**
 * Song Arranger - Clip Selectors Tests
 * Test suite for clip selectors with memoization
 */

import {
  selectAllClips,
  selectClipsByLane,
  selectSelectedClips,
  selectClipEndPosition,
  selectTimelineEndPosition,
  selectClipById,
  selectClipCount,
} from './clips';
import type { RootState } from '@/store/store';
import type { Clip } from '@/types';

// Helper to create mock RootState
const createMockState = (clips: Clip[], selectedIds: string[] = []): RootState => {
  return {
    clips: { clips, editingClipId: null },
    lanes: { lanes: [], editingLaneId: null, movingLaneId: null },
    selection: { selectedClipIds: selectedIds, currentLaneId: null },
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

describe('Clip Selectors', () => {
  describe('selectAllClips', () => {
    it('should return all clips from state', () => {
      const clips: Clip[] = [
        { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4 },
        { id: 'clip-2', laneId: 'lane-1', position: 8, duration: 4 },
      ];
      const state = createMockState(clips);

      expect(selectAllClips(state)).toEqual(clips);
    });

    it('should return empty array when no clips', () => {
      const state = createMockState([]);

      expect(selectAllClips(state)).toEqual([]);
    });
  });

  describe('selectClipsByLane', () => {
    it('should return only clips in specified lane', () => {
      const clips: Clip[] = [
        { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4 },
        { id: 'clip-2', laneId: 'lane-2', position: 0, duration: 4 },
        { id: 'clip-3', laneId: 'lane-1', position: 8, duration: 4 },
      ];
      const state = createMockState(clips);

      const result = selectClipsByLane(state, 'lane-1');

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('clip-1');
      expect(result[1]?.id).toBe('clip-3');
    });

    it('should return empty array when lane has no clips', () => {
      const clips: Clip[] = [
        { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4 },
      ];
      const state = createMockState(clips);

      const result = selectClipsByLane(state, 'lane-99');

      expect(result).toEqual([]);
    });

    it('should memoize result for same input', () => {
      const clips: Clip[] = [
        { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4 },
      ];
      const state = createMockState(clips);

      const result1 = selectClipsByLane(state, 'lane-1');
      const result2 = selectClipsByLane(state, 'lane-1');

      // Same reference = memoized
      expect(result1).toBe(result2);
    });
  });

  describe('selectSelectedClips', () => {
    it('should return only selected clips', () => {
      const clips: Clip[] = [
        { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4 },
        { id: 'clip-2', laneId: 'lane-1', position: 8, duration: 4 },
        { id: 'clip-3', laneId: 'lane-1', position: 16, duration: 4 },
      ];
      const state = createMockState(clips, ['clip-1', 'clip-3']);

      const result = selectSelectedClips(state);

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('clip-1');
      expect(result[1]?.id).toBe('clip-3');
    });

    it('should return empty array when nothing selected', () => {
      const clips: Clip[] = [
        { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4 },
      ];
      const state = createMockState(clips, []);

      const result = selectSelectedClips(state);

      expect(result).toEqual([]);
    });
  });

  describe('selectClipEndPosition', () => {
    it('should calculate clip end position', () => {
      const clip: Clip = { id: 'clip-1', laneId: 'lane-1', position: 8, duration: 4 };

      const result = selectClipEndPosition(clip);

      expect(result).toBe(12);
    });
  });

  describe('selectTimelineEndPosition', () => {
    it('should return furthest clip end position', () => {
      const clips: Clip[] = [
        { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4 },
        { id: 'clip-2', laneId: 'lane-1', position: 8, duration: 8 },
        { id: 'clip-3', laneId: 'lane-1', position: 4, duration: 4 },
      ];
      const state = createMockState(clips);

      const result = selectTimelineEndPosition(state);

      // clip-2 ends at position 16
      expect(result).toBe(16);
    });

    it('should return 0 when no clips', () => {
      const state = createMockState([]);

      const result = selectTimelineEndPosition(state);

      expect(result).toBe(0);
    });
  });

  describe('selectClipById', () => {
    it('should return clip with matching ID', () => {
      const clips: Clip[] = [
        { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4 },
        { id: 'clip-2', laneId: 'lane-1', position: 8, duration: 4 },
      ];
      const state = createMockState(clips);

      const result = selectClipById(state, 'clip-2');

      expect(result).toEqual(clips[1]);
    });

    it('should return undefined when clip not found', () => {
      const clips: Clip[] = [
        { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4 },
      ];
      const state = createMockState(clips);

      const result = selectClipById(state, 'clip-99');

      expect(result).toBeUndefined();
    });
  });

  describe('selectClipCount', () => {
    it('should return total number of clips', () => {
      const clips: Clip[] = [
        { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4 },
        { id: 'clip-2', laneId: 'lane-1', position: 8, duration: 4 },
        { id: 'clip-3', laneId: 'lane-2', position: 0, duration: 4 },
      ];
      const state = createMockState(clips);

      const result = selectClipCount(state);

      expect(result).toBe(3);
    });

    it('should return 0 when no clips', () => {
      const state = createMockState([]);

      const result = selectClipCount(state);

      expect(result).toBe(0);
    });
  });
});
