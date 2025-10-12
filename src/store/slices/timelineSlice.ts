/**
 * Song Arranger - Timeline Slice
 * Redux state management for timeline operations
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TimelineState, Position } from '@/types';

// Discrete zoom levels for better UX
const ZOOM_LEVELS = [25, 50, 100, 200, 400] as const; // pixels per beat
const MIN_ZOOM = ZOOM_LEVELS[0] ?? 25;
const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1] ?? 400;

const initialState: TimelineState = {
  zoom: 100, // 100 pixels per beat (default)
  playheadPosition: 0,
  isPlaying: false,
  tempo: 120, // Default BPM
  snapValue: 1, // Default to quarter note (1 beat)
};

/**
 * Get the next zoom level (zoom in)
 */
const getNextZoomLevel = (currentZoom: number): number => {
  // Find the next level that is greater than current zoom
  for (let i = 0; i < ZOOM_LEVELS.length; i++) {
    const level = ZOOM_LEVELS[i];
    if (level !== undefined && level > currentZoom) {
      return level;
    }
  }
  return MAX_ZOOM;
};

/**
 * Get the previous zoom level (zoom out)
 */
const getPreviousZoomLevel = (currentZoom: number): number => {
  // Find the previous level that is less than current zoom
  for (let i = ZOOM_LEVELS.length - 1; i >= 0; i--) {
    const level = ZOOM_LEVELS[i];
    if (level !== undefined && level < currentZoom) {
      return level;
    }
  }
  return MIN_ZOOM;
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.max(10, Math.min(500, action.payload));
    },

    zoomIn: (state) => {
      state.zoom = getNextZoomLevel(state.zoom);
    },

    zoomOut: (state) => {
      state.zoom = getPreviousZoomLevel(state.zoom);
    },

    setPlayheadPosition: (state, action: PayloadAction<Position>) => {
      state.playheadPosition = Math.max(0, action.payload);
    },

    play: (state) => {
      state.isPlaying = true;
    },

    pause: (state) => {
      state.isPlaying = false;
    },

    stop: (state) => {
      state.isPlaying = false;
      state.playheadPosition = 0;
    },

    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },

    setTempo: (state, action: PayloadAction<number>) => {
      state.tempo = Math.max(20, Math.min(300, action.payload));
    },

    setSnapValue: (state, action: PayloadAction<number>) => {
      state.snapValue = Math.max(0, action.payload);
    },
  },
});

export const {
  setZoom,
  zoomIn,
  zoomOut,
  setPlayheadPosition,
  play,
  pause,
  stop,
  togglePlayPause,
  setTempo,
  setSnapValue,
} = timelineSlice.actions;

export default timelineSlice.reducer;
