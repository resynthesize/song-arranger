/**
 * Cyclone - Tracks Slice
 * Redux state management for tracks
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TracksState, ID } from '@/types';
import { DEFAULT_TRACK_COLOR } from '@/constants';
import { generateId } from '@/utils/id';

const initialState: TracksState = {
  tracks: [],
  editingTrackId: null,
  movingTrackId: null,
};

const tracksSlice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    addTrack: (state, action: PayloadAction<{ name?: string }>) => {
      const { name } = action.payload;
      let trackName = name;

      if (!trackName) {
        // Generate default name based on existing tracks
        const defaultTrackCount = state.tracks.filter((t) =>
          t.name.match(/^Track \d+$/)
        ).length;
        trackName = `Track ${(defaultTrackCount + 1).toString()}`;
      }

      state.tracks.push({
        id: generateId('track'),
        name: trackName,
        color: DEFAULT_TRACK_COLOR, // Default muted blue - works well in both modern and retro themes
      });
    },

    removeTrack: (state, action: PayloadAction<ID>) => {
      const trackId = action.payload;
      state.tracks = state.tracks.filter((track) => track.id !== trackId);

      // Clear editing state if removed track was being edited
      if (state.editingTrackId === trackId) {
        state.editingTrackId = null;
      }
    },

    renameTrack: (
      state,
      action: PayloadAction<{ trackId: ID; name: string }>
    ) => {
      const { trackId, name } = action.payload;
      const trimmedName = name.trim();

      // Don't rename to empty string
      if (!trimmedName) {
        return;
      }

      const track = state.tracks.find((t) => t.id === trackId);
      if (track) {
        track.name = trimmedName;
      }
    },

    setEditingTrack: (state, action: PayloadAction<ID>) => {
      state.editingTrackId = action.payload;
    },

    clearEditingTrack: (state) => {
      state.editingTrackId = null;
    },

    setTrackColor: (
      state,
      action: PayloadAction<{ trackId: ID; color: string }>
    ) => {
      const { trackId, color } = action.payload;
      const track = state.tracks.find((t) => t.id === trackId);
      if (track) {
        track.color = color;
      }
    },

    setTrackHeight: (
      state,
      action: PayloadAction<{ trackId: ID; height: number }>
    ) => {
      const { trackId, height } = action.payload;
      const track = state.tracks.find((t) => t.id === trackId);
      if (track) {
        // Enforce minimum height of 40px and maximum of 400px
        track.height = Math.max(40, Math.min(400, height));
      }
    },

    toggleTrackCollapse: (state, action: PayloadAction<ID>) => {
      const trackId = action.payload;
      const track = state.tracks.find((t) => t.id === trackId);
      if (track) {
        track.collapsed = !track.collapsed;
      }
    },

    moveTrackUp: (state, action: PayloadAction<ID>) => {
      const trackId = action.payload;
      const index = state.tracks.findIndex((t) => t.id === trackId);

      // Can't move first track up
      if (index > 0) {
        // Swap with previous track
        const prev = state.tracks[index - 1];
        const current = state.tracks[index];
        if (prev && current) {
          state.tracks[index - 1] = current;
          state.tracks[index] = prev;
        }
      }
    },

    moveTrackDown: (state, action: PayloadAction<ID>) => {
      const trackId = action.payload;
      const index = state.tracks.findIndex((t) => t.id === trackId);

      // Can't move last track down
      if (index >= 0 && index < state.tracks.length - 1) {
        // Swap with next track
        const current = state.tracks[index];
        const next = state.tracks[index + 1];
        if (current && next) {
          state.tracks[index] = next;
          state.tracks[index + 1] = current;
        }
      }
    },

    setMovingTrack: (state, action: PayloadAction<ID>) => {
      state.movingTrackId = action.payload;
    },

    clearMovingTrack: (state) => {
      state.movingTrackId = null;
    },

    setTracks: (state, action: PayloadAction<import('@/types').Track[]>) => {
      state.tracks = action.payload;
    },

    reorderTrack: (state, action: PayloadAction<{ trackId: ID; newIndex: number }>) => {
      const { trackId, newIndex } = action.payload;
      const currentIndex = state.tracks.findIndex((t) => t.id === trackId);

      if (currentIndex === -1 || currentIndex === newIndex) {
        return; // Track not found or already at target position
      }

      // Bounds check
      const clampedNewIndex = Math.max(0, Math.min(newIndex, state.tracks.length - 1));

      // Remove track from current position
      const [track] = state.tracks.splice(currentIndex, 1);

      // Insert at new position
      if (track) {
        state.tracks.splice(clampedNewIndex, 0, track);
      }
    },
  },
});

export const {
  addTrack,
  removeTrack,
  renameTrack,
  setEditingTrack,
  clearEditingTrack,
  setTrackColor,
  setTrackHeight,
  toggleTrackCollapse,
  moveTrackUp,
  moveTrackDown,
  setMovingTrack,
  clearMovingTrack,
  setTracks,
  reorderTrack,
} = tracksSlice.actions;

export default tracksSlice.reducer;
