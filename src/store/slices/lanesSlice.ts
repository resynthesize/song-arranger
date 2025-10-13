/**
 * Song Arranger - Lanes Slice
 * Redux state management for lanes
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LanesState, ID } from '@/types';

const initialState: LanesState = {
  lanes: [],
  editingLaneId: null,
  movingLaneId: null,
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
        const defaultLaneCount = state.lanes.filter((l) =>
          l.name.match(/^Lane \d+$/)
        ).length;
        laneName = `Lane ${(defaultLaneCount + 1).toString()}`;
      }

      state.lanes.push({
        id: `lane-${Date.now().toString()}-${Math.random().toString(36).slice(2, 11)}`,
        name: laneName,
        color: '#00ff00', // Default green terminal color
      });
    },

    removeLane: (state, action: PayloadAction<ID>) => {
      const laneId = action.payload;
      state.lanes = state.lanes.filter((lane) => lane.id !== laneId);

      // Clear editing state if removed lane was being edited
      if (state.editingLaneId === laneId) {
        state.editingLaneId = null;
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

      const lane = state.lanes.find((l) => l.id === laneId);
      if (lane) {
        lane.name = trimmedName;
      }
    },

    setEditingLane: (state, action: PayloadAction<ID>) => {
      state.editingLaneId = action.payload;
    },

    clearEditingLane: (state) => {
      state.editingLaneId = null;
    },

    setLaneColor: (
      state,
      action: PayloadAction<{ laneId: ID; color: string }>
    ) => {
      const { laneId, color } = action.payload;
      const lane = state.lanes.find((l) => l.id === laneId);
      if (lane) {
        lane.color = color;
      }
    },

    moveLaneUp: (state, action: PayloadAction<ID>) => {
      const laneId = action.payload;
      const index = state.lanes.findIndex((l) => l.id === laneId);

      // Can't move first lane up
      if (index > 0) {
        // Swap with previous lane
        const temp = state.lanes[index - 1];
        state.lanes[index - 1] = state.lanes[index];
        state.lanes[index] = temp;
      }
    },

    moveLaneDown: (state, action: PayloadAction<ID>) => {
      const laneId = action.payload;
      const index = state.lanes.findIndex((l) => l.id === laneId);

      // Can't move last lane down
      if (index >= 0 && index < state.lanes.length - 1) {
        // Swap with next lane
        const temp = state.lanes[index + 1];
        state.lanes[index + 1] = state.lanes[index];
        state.lanes[index] = temp;
      }
    },

    setMovingLane: (state, action: PayloadAction<ID>) => {
      state.movingLaneId = action.payload;
    },

    clearMovingLane: (state) => {
      state.movingLaneId = null;
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
} = lanesSlice.actions;

export default lanesSlice.reducer;
