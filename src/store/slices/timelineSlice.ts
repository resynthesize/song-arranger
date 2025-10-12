/**
 * Song Arranger - Timeline Slice
 * Redux state management for timeline operations
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TimelineState, Position } from '@/types';

const initialState: TimelineState = {
  zoom: 100, // 100 pixels per beat (default)
  playheadPosition: 0,
  isPlaying: false,
  tempo: 120, // Default BPM
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.max(10, Math.min(500, action.payload));
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
  },
});

export const {
  setZoom,
  setPlayheadPosition,
  play,
  pause,
  stop,
  togglePlayPause,
  setTempo,
} = timelineSlice.actions;

export default timelineSlice.reducer;
