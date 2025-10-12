/**
 * Song Arranger - Clips Slice Tests
 * Tests for clips Redux reducer
 */

import reducer, {
  addClip,
  removeClip,
  removeClips,
  moveClip,
  moveClips,
  resizeClip,
  resizeClips,
  updateClip,
} from './clipsSlice';
import type { ClipsState, Clip } from '@/types';

describe('clipsSlice', () => {
  const initialState: ClipsState = {
    clips: [],
  };

  const clip1: Clip = {
    id: 'clip-1',
    laneId: 'lane-1',
    position: 0,
    duration: 4,
    label: 'Intro',
  };

  const clip2: Clip = {
    id: 'clip-2',
    laneId: 'lane-1',
    position: 8,
    duration: 4,
  };

  const clip3: Clip = {
    id: 'clip-3',
    laneId: 'lane-2',
    position: 0,
    duration: 8,
  };

  const stateWithClips: ClipsState = {
    clips: [clip1, clip2, clip3],
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('addClip', () => {
    it('should add a new clip', () => {
      const newState = reducer(
        initialState,
        addClip({ laneId: 'lane-1', position: 0, duration: 4 })
      );
      expect(newState.clips).toHaveLength(1);
      expect(newState.clips[0]!.laneId).toBe('lane-1');
      expect(newState.clips[0]!.position).toBe(0);
      expect(newState.clips[0]!.duration).toBe(4);
      expect(newState.clips[0]!.id).toBeDefined();
    });

    it('should add a clip with optional label', () => {
      const newState = reducer(
        initialState,
        addClip({ laneId: 'lane-1', position: 0, duration: 4, label: 'Verse' })
      );
      expect(newState.clips[0]!.label).toBe('Verse');
    });

    it('should use default duration if not provided', () => {
      const newState = reducer(
        initialState,
        addClip({ laneId: 'lane-1', position: 0 })
      );
      expect(newState.clips[0]!.duration).toBe(4);
    });
  });

  describe('removeClip', () => {
    it('should remove clip by id', () => {
      const newState = reducer(stateWithClips, removeClip('clip-2'));
      expect(newState.clips).toHaveLength(2);
      expect(newState.clips.find((c) => c.id === 'clip-2')).toBeUndefined();
    });

    it('should do nothing if clip not found', () => {
      const newState = reducer(stateWithClips, removeClip('non-existent'));
      expect(newState.clips).toHaveLength(3);
    });
  });

  describe('removeClips', () => {
    it('should remove multiple clips by ids', () => {
      const newState = reducer(
        stateWithClips,
        removeClips(['clip-1', 'clip-3'])
      );
      expect(newState.clips).toHaveLength(1);
      expect(newState.clips[0]!.id).toBe('clip-2');
    });

    it('should handle empty array', () => {
      const newState = reducer(stateWithClips, removeClips([]));
      expect(newState.clips).toHaveLength(3);
    });
  });

  describe('moveClip', () => {
    it('should move clip to new position', () => {
      const newState = reducer(
        stateWithClips,
        moveClip({ clipId: 'clip-1', position: 16 })
      );
      const movedClip = newState.clips.find((c) => c.id === 'clip-1');
      expect(movedClip?.position).toBe(16);
    });

    it('should not allow negative position', () => {
      const newState = reducer(
        stateWithClips,
        moveClip({ clipId: 'clip-1', position: -5 })
      );
      const movedClip = newState.clips.find((c) => c.id === 'clip-1');
      expect(movedClip?.position).toBe(0);
    });

    it('should do nothing if clip not found', () => {
      const newState = reducer(
        stateWithClips,
        moveClip({ clipId: 'non-existent', position: 10 })
      );
      expect(newState.clips).toEqual(stateWithClips.clips);
    });
  });

  describe('moveClips', () => {
    it('should move multiple clips by delta', () => {
      const newState = reducer(
        stateWithClips,
        moveClips({ clipIds: ['clip-1', 'clip-2'], delta: 4 })
      );
      expect(newState.clips[0]!.position).toBe(4);
      expect(newState.clips[1]!.position).toBe(12);
      expect(newState.clips[2]!.position).toBe(0); // clip-3 unchanged
    });

    it('should not move clips to negative positions', () => {
      const newState = reducer(
        stateWithClips,
        moveClips({ clipIds: ['clip-1', 'clip-2'], delta: -10 })
      );
      expect(newState.clips[0]!.position).toBe(0);
      expect(newState.clips[1]!.position).toBe(0);
    });
  });

  describe('resizeClip', () => {
    it('should resize clip to new duration', () => {
      const newState = reducer(
        stateWithClips,
        resizeClip({ clipId: 'clip-1', duration: 8 })
      );
      const resizedClip = newState.clips.find((c) => c.id === 'clip-1');
      expect(resizedClip?.duration).toBe(8);
    });

    it('should enforce minimum duration of 1 beat', () => {
      const newState = reducer(
        stateWithClips,
        resizeClip({ clipId: 'clip-1', duration: 0.5 })
      );
      const resizedClip = newState.clips.find((c) => c.id === 'clip-1');
      expect(resizedClip?.duration).toBe(1);
    });

    it('should do nothing if clip not found', () => {
      const newState = reducer(
        stateWithClips,
        resizeClip({ clipId: 'non-existent', duration: 10 })
      );
      expect(newState.clips).toEqual(stateWithClips.clips);
    });
  });

  describe('resizeClips', () => {
    it('should resize multiple clips proportionally', () => {
      const newState = reducer(
        stateWithClips,
        resizeClips({ clipIds: ['clip-1', 'clip-3'], factor: 2 })
      );
      expect(newState.clips[0]!.duration).toBe(8); // 4 * 2
      expect(newState.clips[1]!.duration).toBe(4); // clip-2 unchanged
      expect(newState.clips[2]!.duration).toBe(16); // 8 * 2
    });

    it('should not resize below minimum duration', () => {
      const newState = reducer(
        stateWithClips,
        resizeClips({ clipIds: ['clip-1'], factor: 0.1 })
      );
      expect(newState.clips[0]!.duration).toBe(1);
    });
  });

  describe('updateClip', () => {
    it('should update clip properties', () => {
      const newState = reducer(
        stateWithClips,
        updateClip({ clipId: 'clip-1', updates: { label: 'Updated', duration: 6 } })
      );
      const updatedClip = newState.clips.find((c) => c.id === 'clip-1');
      expect(updatedClip?.label).toBe('Updated');
      expect(updatedClip?.duration).toBe(6);
      expect(updatedClip?.position).toBe(0); // unchanged
    });

    it('should do nothing if clip not found', () => {
      const newState = reducer(
        stateWithClips,
        updateClip({ clipId: 'non-existent', updates: { label: 'Test' } })
      );
      expect(newState.clips).toEqual(stateWithClips.clips);
    });
  });
});
