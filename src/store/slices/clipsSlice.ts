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
        id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
} = clipsSlice.actions;

export default clipsSlice.reducer;
