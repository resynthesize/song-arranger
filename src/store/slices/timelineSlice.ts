/**
 * Cyclone - Timeline Slice
 * Redux state management for timeline operations
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TimelineState, Position, SnapMode } from '@/types';
import { calculateGridSnap } from '@/utils/snap';
import {
  ZOOM_LEVELS,
  MIN_ZOOM,
  MAX_ZOOM,
  MIN_VERTICAL_ZOOM,
  MAX_VERTICAL_ZOOM,
  VERTICAL_ZOOM_STEP,
  BEATS_PER_BAR,
  MIN_TEMPO,
  MAX_TEMPO,
  DEFAULT_TEMPO,
} from '@/constants';

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
  tempo: DEFAULT_TEMPO,
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

    /**
     * Set zoom to a specific value while keeping a focus point at the same screen position
     * Used for smooth drag-to-zoom interactions (Ableton-style)
     * @param payload - Object with newZoom and focusBeats
     */
    setZoomFocused: (state, action: PayloadAction<{ zoom: number; focusBeats: number }>) => {
      const { zoom: newZoom, focusBeats } = action.payload;
      const oldZoom = state.viewport.zoom;

      // Clamp zoom to valid range
      const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

      // Calculate where the focus point is on screen before zoom
      const focusScreenPx = (focusBeats - state.viewport.offsetBeats) * oldZoom;

      // After zoom, adjust offset so focus point stays at same screen position
      state.viewport.zoom = clampedZoom;
      state.viewport.offsetBeats = Math.max(0, focusBeats - (focusScreenPx / clampedZoom));
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
      state.tempo = Math.max(MIN_TEMPO, Math.min(MAX_TEMPO, action.payload));
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
      // Move playhead by N bars
      state.playheadPosition = Math.max(0, state.playheadPosition + (action.payload * BEATS_PER_BAR));
    },

    movePlayheadToPosition: (state, action: PayloadAction<Position>) => {
      state.playheadPosition = Math.max(0, action.payload);
    },

    adjustTempo: (state, action: PayloadAction<number>) => {
      // Adjust tempo by delta
      state.tempo = Math.max(MIN_TEMPO, Math.min(MAX_TEMPO, state.tempo + action.payload));
    },

    frameViewport: (state, action: PayloadAction<{ startBeats: number; endBeats: number }>) => {
      const { startBeats, endBeats } = action.payload;
      const durationBeats = endBeats - startBeats;

      if (durationBeats > 0) {
        // Calculate zoom to fit content with 10% padding
        const targetZoom = (state.viewport.widthPx * 0.9) / durationBeats;

        // Clamp to valid zoom range
        state.viewport.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));

        // Center the content with 5% left padding
        const paddingBeats = durationBeats * 0.05;
        state.viewport.offsetBeats = Math.max(0, startBeats - paddingBeats);
      }
    },

    loadTimeline: (state, action: PayloadAction<Partial<TimelineState>>) => {
      // Load timeline data but preserve current viewport dimensions
      const { viewport, ...rest } = action.payload;
      Object.assign(state, rest);
      if (viewport) {
        // Merge viewport but keep current width/height
        state.viewport.offsetBeats = viewport.offsetBeats ?? state.viewport.offsetBeats;
        state.viewport.zoom = viewport.zoom ?? state.viewport.zoom;
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
  setZoomFocused,
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
  loadTimeline,
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
