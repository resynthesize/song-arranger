/**
 * Song Arranger - Clips Slice
 * Redux state management for clips
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ClipsState, Clip, ID, Position, Duration } from '@/types';

const initialState: ClipsState = {
  clips: [],
};

const MIN_DURATION = 1; // Minimum clip duration in beats

const clipsSlice = createSlice({
  name: 'clips',
  initialState,
  reducers: {
    addClip: (
      state,
      action: PayloadAction<{
        laneId: ID;
        position: Position;
        duration?: Duration;
        label?: string;
      }>
    ) => {
      const { laneId, position, duration = 4, label } = action.payload;
      const newClip: Clip = {
        id: `clip-${Date.now().toString()}-${Math.random().toString(36).slice(2, 11)}`,
        laneId,
        position,
        duration,
        label,
      };
      state.clips.push(newClip);
    },

    removeClip: (state, action: PayloadAction<ID>) => {
      state.clips = state.clips.filter((clip) => clip.id !== action.payload);
    },

    removeClips: (state, action: PayloadAction<ID[]>) => {
      const idsToRemove = new Set(action.payload);
      state.clips = state.clips.filter((clip) => !idsToRemove.has(clip.id));
    },

    moveClip: (
      state,
      action: PayloadAction<{ clipId: ID; position: Position }>
    ) => {
      const { clipId, position } = action.payload;
      const clip = state.clips.find((c) => c.id === clipId);
      if (clip) {
        clip.position = Math.max(0, position);
      }
    },

    moveClips: (
      state,
      action: PayloadAction<{ clipIds: ID[]; delta: number }>
    ) => {
      const { clipIds, delta } = action.payload;
      const clipIdsSet = new Set(clipIds);

      state.clips.forEach((clip) => {
        if (clipIdsSet.has(clip.id)) {
          clip.position = Math.max(0, clip.position + delta);
        }
      });
    },

    resizeClip: (
      state,
      action: PayloadAction<{ clipId: ID; duration: Duration }>
    ) => {
      const { clipId, duration } = action.payload;
      const clip = state.clips.find((c) => c.id === clipId);
      if (clip) {
        clip.duration = Math.max(MIN_DURATION, duration);
      }
    },

    resizeClips: (
      state,
      action: PayloadAction<{ clipIds: ID[]; factor: number }>
    ) => {
      const { clipIds, factor } = action.payload;
      const clipIdsSet = new Set(clipIds);

      state.clips.forEach((clip) => {
        if (clipIdsSet.has(clip.id)) {
          clip.duration = Math.max(MIN_DURATION, clip.duration * factor);
        }
      });
    },

    updateClip: (
      state,
      action: PayloadAction<{ clipId: ID; updates: Partial<Clip> }>
    ) => {
      const { clipId, updates } = action.payload;
      const clip = state.clips.find((c) => c.id === clipId);
      if (clip) {
        Object.assign(clip, updates);
      }
    },

    duplicateClip: (state, action: PayloadAction<ID>) => {
      const clipId = action.payload;
      const originalClip = state.clips.find((c) => c.id === clipId);
      if (originalClip) {
        const newClip: Clip = {
          ...originalClip,
          id: `clip-${Date.now().toString()}-${Math.random().toString(36).slice(2, 11)}`,
        };
        state.clips.push(newClip);
      }
    },

    duplicateClips: (state, action: PayloadAction<ID[]>) => {
      const clipIds = action.payload;
      const clipIdsSet = new Set(clipIds);
      const clipsToDuplicate = state.clips.filter((c) => clipIdsSet.has(c.id));

      clipsToDuplicate.forEach((clip) => {
        const newClip: Clip = {
          ...clip,
          id: `clip-${Date.now().toString()}-${Math.random().toString(36).slice(2, 11)}`,
        };
        state.clips.push(newClip);
      });
    },

    updateClipLane: (
      state,
      action: PayloadAction<{ clipId: ID | ID[]; laneId: ID }>
    ) => {
      const { clipId, laneId } = action.payload;
      const clipIds = Array.isArray(clipId) ? clipId : [clipId];
      const clipIdsSet = new Set(clipIds);

      state.clips.forEach((clip) => {
        if (clipIdsSet.has(clip.id)) {
          // Only mutate if actually changing - prevents unnecessary re-renders
          // This makes the reducer idempotent: calling it with the same lane is a no-op
          if (clip.laneId !== laneId) {
            clip.laneId = laneId;
          }
        }
      });
    },

    duplicateClipsWithOffset: (state, action: PayloadAction<ID[]>) => {
      const clipIds = action.payload;
      const clipIdsSet = new Set(clipIds);
      const clipsToDuplicate = state.clips.filter((c) => clipIdsSet.has(c.id));

      clipsToDuplicate.forEach((clip) => {
        const newClip: Clip = {
          ...clip,
          id: `clip-${Date.now().toString()}-${Math.random().toString(36).slice(2, 11)}`,
          position: clip.position + clip.duration, // Offset by duration
        };
        state.clips.push(newClip);
      });
    },

    splitClip: (
      state,
      action: PayloadAction<{ clipId: ID; position: Position }>
    ) => {
      const { clipId, position } = action.payload;
      const clip = state.clips.find((c) => c.id === clipId);

      if (clip && position > clip.position && position < clip.position + clip.duration) {
        // Create second half
        const newClip: Clip = {
          ...clip,
          id: `clip-${Date.now().toString()}-${Math.random().toString(36).slice(2, 11)}`,
          position,
          duration: clip.duration - (position - clip.position),
        };

        // Truncate first half
        clip.duration = position - clip.position;

        state.clips.push(newClip);
      }
    },

    setClipsDuration: (
      state,
      action: PayloadAction<{ clipIds: ID[]; duration: Duration }>
    ) => {
      const { clipIds, duration } = action.payload;
      const clipIdsSet = new Set(clipIds);

      state.clips.forEach((clip) => {
        if (clipIdsSet.has(clip.id)) {
          clip.duration = Math.max(MIN_DURATION, duration);
        }
      });
    },

    trimClipStart: (
      state,
      action: PayloadAction<{ clipId: ID; amount: number }>
    ) => {
      const { clipId, amount } = action.payload;
      const clip = state.clips.find((c) => c.id === clipId);

      if (clip && amount < clip.duration - MIN_DURATION) {
        clip.position += amount;
        clip.duration -= amount;
      }
    },

    trimClipEnd: (
      state,
      action: PayloadAction<{ clipId: ID; amount: number }>
    ) => {
      const { clipId, amount } = action.payload;
      const clip = state.clips.find((c) => c.id === clipId);

      if (clip) {
        clip.duration = Math.max(MIN_DURATION, clip.duration - amount);
      }
    },
  },
});

export const {
  addClip,
  removeClip,
  removeClips,
  moveClip,
  moveClips,
  resizeClip,
  resizeClips,
  updateClip,
  duplicateClip,
  duplicateClips,
  updateClipLane,
  duplicateClipsWithOffset,
  splitClip,
  setClipsDuration,
  trimClipStart,
  trimClipEnd,
} = clipsSlice.actions;

export default clipsSlice.reducer;
