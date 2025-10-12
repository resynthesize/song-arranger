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

// Vertical zoom constants
const MIN_VERTICAL_ZOOM = 50; // 50% - 40px lane height
const MAX_VERTICAL_ZOOM = 150; // 150% - 120px lane height
const VERTICAL_ZOOM_STEP = 10; // Zoom in/out by 10% at a time

const initialState: TimelineState = {
  viewport: {
    offsetBeats: 0, // Start at beginning
    zoom: 5, // 5 pixels per beat (shows ~64-80 bars on typical screen)
    widthPx: 1600, // Default width, will be updated by component
    heightPx: 600, // Default height, will be updated by component
  },
  verticalZoom: 100, // Default 100% vertical zoom
  playheadPosition: 0,
  isPlaying: false,
  tempo: 120, // Default BPM
  snapValue: 1, // Default to quarter note (1 beat)
  snapMode: 'grid', // Default to grid snap mode
  minimapVisible: false, // Minimap hidden by default
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

    /**
     * Zoom in while keeping a focus point at the same screen position
     * @param focusBeats - The beat position to keep stable (typically center of selection)
     */
    zoomInFocused: (state, action: PayloadAction<number>) => {
      const focusBeats = action.payload;
      const oldZoom = state.viewport.zoom;
      const newZoom = getNextZoomLevel(oldZoom);

      // Calculate where the focus point is on screen before zoom
      const focusScreenPx = (focusBeats - state.viewport.offsetBeats) * oldZoom;

      // After zoom, adjust offset so focus point stays at same screen position
      // focusScreenPx = (focusBeats - newOffset) * newZoom
      // newOffset = focusBeats - (focusScreenPx / newZoom)
      state.viewport.zoom = newZoom;
      state.viewport.offsetBeats = Math.max(0, focusBeats - (focusScreenPx / newZoom));
    },

    /**
     * Zoom out while keeping a focus point at the same screen position
     * @param focusBeats - The beat position to keep stable (typically center of selection)
     */
    zoomOutFocused: (state, action: PayloadAction<number>) => {
      const focusBeats = action.payload;
      const oldZoom = state.viewport.zoom;
      const newZoom = getPreviousZoomLevel(oldZoom);

      // Calculate where the focus point is on screen before zoom
      const focusScreenPx = (focusBeats - state.viewport.offsetBeats) * oldZoom;

      // After zoom, adjust offset so focus point stays at same screen position
      state.viewport.zoom = newZoom;
      state.viewport.offsetBeats = Math.max(0, focusBeats - (focusScreenPx / newZoom));
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

    toggleMinimap: (state) => {
      state.minimapVisible = !state.minimapVisible;
    },

    setMinimapVisible: (state, action: PayloadAction<boolean>) => {
      state.minimapVisible = action.payload;
    },

    setVerticalZoom: (state, action: PayloadAction<number>) => {
      state.verticalZoom = Math.max(MIN_VERTICAL_ZOOM, Math.min(MAX_VERTICAL_ZOOM, action.payload));
    },

    verticalZoomIn: (state) => {
      state.verticalZoom = Math.min(MAX_VERTICAL_ZOOM, state.verticalZoom + VERTICAL_ZOOM_STEP);
    },

    verticalZoomOut: (state) => {
      state.verticalZoom = Math.max(MIN_VERTICAL_ZOOM, state.verticalZoom - VERTICAL_ZOOM_STEP);
    },

    movePlayheadByBars: (state, action: PayloadAction<number>) => {
      // Move playhead by N bars (4 beats per bar)
      const beatsPerBar = 4;
      state.playheadPosition = Math.max(0, state.playheadPosition + (action.payload * beatsPerBar));
    },

    movePlayheadToPosition: (state, action: PayloadAction<Position>) => {
      state.playheadPosition = Math.max(0, action.payload);
    },

    adjustTempo: (state, action: PayloadAction<number>) => {
      // Adjust tempo by delta
      state.tempo = Math.max(20, Math.min(300, state.tempo + action.payload));
    },

    frameViewport: (state, action: PayloadAction<{ startBeats: number; endBeats: number }>) => {
      const { startBeats, endBeats } = action.payload;
      const durationBeats = endBeats - startBeats;

      if (durationBeats > 0) {
        // Calculate zoom to fit content with 10% padding
        const targetZoom = (state.viewport.widthPx * 0.9) / durationBeats;

        // Clamp to valid zoom range
        const MIN_ZOOM = 0.25;
        const MAX_ZOOM = 800;
        state.viewport.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));

        // Center the content with 5% left padding
        const paddingBeats = durationBeats * 0.05;
        state.viewport.offsetBeats = Math.max(0, startBeats - paddingBeats);
      }
    },
  },
});

export const {
  setZoom,
  zoomIn,
  zoomOut,
  zoomInFocused,
  zoomOutFocused,
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
  toggleMinimap,
  setMinimapVisible,
  setVerticalZoom,
  verticalZoomIn,
  verticalZoomOut,
  movePlayheadByBars,
  movePlayheadToPosition,
  adjustTempo,
  frameViewport,
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
