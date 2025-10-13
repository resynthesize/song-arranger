/**
 * Song Arranger - Tracks Slice (Legacy export as lanesSlice)
 * Redux state management for tracks
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TracksState, ID } from '@/types';

const initialState: TracksState = {
  tracks: [],
  editingTrackId: null,
  movingTrackId: null,
};

const lanesSlice = createSlice({
  name: 'lanes',
  initialState,
  reducers: {
    addLane: (state, action: PayloadAction<{ name?: string }>) => {
      const { name } = action.payload;
      let laneName = name;

      if (!laneName) {
        // Generate default name based on existing lanes
        const defaultLaneCount = state.tracks.filter((l) =>
          l.name.match(/^Lane \d+$/)
        ).length;
        laneName = `Lane ${(defaultLaneCount + 1).toString()}`;
      }

      state.tracks.push({
        id: `lane-${Date.now().toString()}-${Math.random().toString(36).slice(2, 11)}`,
        name: laneName,
        color: '#00ff00', // Default green terminal color
      });
    },

    removeLane: (state, action: PayloadAction<ID>) => {
      const laneId = action.payload;
      state.tracks = state.tracks.filter((lane) => lane.id !== laneId);

      // Clear editing state if removed lane was being edited
      if (state.editingTrackId === laneId) {
        state.editingTrackId = null;
      }
    },

    renameLane: (
      state,
      action: PayloadAction<{ laneId: ID; name: string }>
    ) => {
      const { laneId, name } = action.payload;
      const trimmedName = name.trim();

      // Don't rename to empty string
      if (!trimmedName) {
        return;
      }

      const lane = state.tracks.find((l) => l.id === laneId);
      if (lane) {
        lane.name = trimmedName;
      }
    },

    setEditingLane: (state, action: PayloadAction<ID>) => {
      state.editingTrackId = action.payload;
    },

    clearEditingLane: (state) => {
      state.editingTrackId = null;
    },

    setLaneColor: (
      state,
      action: PayloadAction<{ laneId: ID; color: string }>
    ) => {
      const { laneId, color } = action.payload;
      const lane = state.tracks.find((l) => l.id === laneId);
      if (lane) {
        lane.color = color;
      }
    },

    moveLaneUp: (state, action: PayloadAction<ID>) => {
      const laneId = action.payload;
      const index = state.tracks.findIndex((l) => l.id === laneId);

      // Can't move first lane up
      if (index > 0) {
        // Swap with previous lane
        const prev = state.tracks[index - 1];
        const current = state.tracks[index];
        if (prev && current) {
          state.tracks[index - 1] = current;
          state.tracks[index] = prev;
        }
      }
    },

    moveLaneDown: (state, action: PayloadAction<ID>) => {
      const laneId = action.payload;
      const index = state.tracks.findIndex((l) => l.id === laneId);

      // Can't move last lane down
      if (index >= 0 && index < state.tracks.length - 1) {
        // Swap with next lane
        const current = state.tracks[index];
        const next = state.tracks[index + 1];
        if (current && next) {
          state.tracks[index] = next;
          state.tracks[index + 1] = current;
        }
      }
    },

    setMovingLane: (state, action: PayloadAction<ID>) => {
      state.movingTrackId = action.payload;
    },

    clearMovingLane: (state) => {
      state.movingTrackId = null;
    },

    setLanes: (state, action: PayloadAction<import('@/types').Lane[]>) => {
      state.tracks = action.payload;
    },
  },
});

export const {
  addLane,
  removeLane,
  renameLane,
  setEditingLane,
  clearEditingLane,
  setLaneColor,
  moveLaneUp,
  moveLaneDown,
  setMovingLane,
  clearMovingLane,
  setLanes,
} = lanesSlice.actions;

export default lanesSlice.reducer;
