/**
 * Song Arranger - Timeline Slice
 * Redux state management for timeline operations
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TimelineState, Position, SnapMode } from '@/types';
import { calculateGridSnap } from '@/utils/snap';

// Discrete zoom levels for better UX
// From 0.25px/beat (ultra zoomed out, ~1024 bars visible) to 800px/beat (very zoomed in, 1/16th notes)
const ZOOM_LEVELS = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 200, 400, 800] as const; // pixels per beat
const MIN_ZOOM = ZOOM_LEVELS[0];
const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1];

const initialState: TimelineState = {
  viewport: {
    offsetBeats: 0, // Start at beginning
    zoom: 100, // 100 pixels per beat (default)
    widthPx: 1600, // Default width, will be updated by component
    heightPx: 600, // Default height, will be updated by component
  },
  playheadPosition: 0,
  isPlaying: false,
  tempo: 120, // Default BPM
  snapValue: 1, // Default to quarter note (1 beat)
  snapMode: 'fixed', // Default to fixed snap mode
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
      state.viewport.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, action.payload));
    },

    zoomIn: (state) => {
      state.viewport.zoom = getNextZoomLevel(state.viewport.zoom);
    },

    zoomOut: (state) => {
      state.viewport.zoom = getPreviousZoomLevel(state.viewport.zoom);
    },

    setViewportOffset: (state, action: PayloadAction<number>) => {
      state.viewport.offsetBeats = Math.max(0, action.payload);
    },

    panViewport: (state, action: PayloadAction<number>) => {
      // Pan by a delta in beats
      state.viewport.offsetBeats = Math.max(
        0,
        state.viewport.offsetBeats + action.payload
      );
    },

    setViewportDimensions: (
      state,
      action: PayloadAction<{ widthPx: number; heightPx: number }>
    ) => {
      state.viewport.widthPx = action.payload.widthPx;
      state.viewport.heightPx = action.payload.heightPx;
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

    setSnapMode: (state, action: PayloadAction<SnapMode>) => {
      state.snapMode = action.payload;
    },
  },
});

export const {
  setZoom,
  zoomIn,
  zoomOut,
  setViewportOffset,
  panViewport,
  setViewportDimensions,
  setPlayheadPosition,
  play,
  pause,
  stop,
  togglePlayPause,
  setTempo,
  setSnapValue,
  setSnapMode,
} = timelineSlice.actions;

/**
 * Selector to get the effective snap value
 * Returns the fixed snapValue or calculates grid-based snap depending on snapMode
 * @param state - Timeline state
 * @returns The effective snap value in beats
 */
export const selectEffectiveSnapValue = (state: { timeline: TimelineState }): number => {
  if (state.timeline.snapMode === 'grid') {
    return calculateGridSnap(state.timeline.viewport.zoom);
  }
  return state.timeline.snapValue;
};

/**
 * Selector to get the viewport state
 */
export const selectViewport = (state: { timeline: TimelineState }) => state.timeline.viewport;

export default timelineSlice.reducer;
