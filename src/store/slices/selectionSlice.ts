/**
 * Song Arranger - Selection Slice
 * Redux state management for clip selection
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SelectionState, ID } from '@/types';
import { first, last } from '@/utils/array';
import { logger } from '@/utils/debug';

const initialState: SelectionState = {
  selectedClipIds: [],
  currentLaneId: null,
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    selectClip: (state, action: PayloadAction<ID>) => {
      logger.log('[selectClip reducer] Selecting clip', {
        clipId: action.payload,
        previousSelection: state.selectedClipIds
      });
      state.selectedClipIds = [action.payload];
      // Clear current lane when selecting a clip
      state.currentLaneId = null;
    },

    deselectClip: (state, action: PayloadAction<ID>) => {
      state.selectedClipIds = state.selectedClipIds.filter(
        (id) => id !== action.payload
      );
    },

    toggleClipSelection: (state, action: PayloadAction<ID>) => {
      const clipId = action.payload;
      const index = state.selectedClipIds.indexOf(clipId);

      if (index === -1) {
        // Add to selection
        state.selectedClipIds.push(clipId);
      } else {
        // Remove from selection
        state.selectedClipIds.splice(index, 1);
      }
    },

    selectMultipleClips: (state, action: PayloadAction<ID[]>) => {
      // Remove duplicates using Set
      state.selectedClipIds = Array.from(new Set(action.payload));
    },

    selectAllClips: (state, action: PayloadAction<ID[]>) => {
      // Select all clips - payload contains all clip IDs
      state.selectedClipIds = action.payload;
    },

    clearSelection: (state) => {
      logger.log('[clearSelection reducer] Clearing selection', {
        previousSelection: state.selectedClipIds
      });
      state.selectedClipIds = [];
    },

    cycleSelection: (state, action: PayloadAction<{ clipIds: ID[]; direction: 'forward' | 'backward' }>) => {
      const { clipIds, direction } = action.payload;

      if (clipIds.length === 0) {
        state.selectedClipIds = [];
        return;
      }

      // If nothing selected, select first/last
      if (state.selectedClipIds.length === 0) {
        const firstOrLast = direction === 'forward' ? first(clipIds) : last(clipIds);
        if (firstOrLast) {
          state.selectedClipIds = [firstOrLast];
        }
        return;
      }

      // Find current selection index
      const currentId = first(state.selectedClipIds);
      if (!currentId) return;

      const currentIndex = clipIds.indexOf(currentId);

      if (currentIndex === -1) {
        // Current selection not in list, select first/last
        const firstOrLast = direction === 'forward' ? first(clipIds) : last(clipIds);
        if (firstOrLast) {
          state.selectedClipIds = [firstOrLast];
        }
        return;
      }

      // Cycle to next/previous
      let nextIndex;
      if (direction === 'forward') {
        nextIndex = (currentIndex + 1) % clipIds.length;
      } else {
        nextIndex = (currentIndex - 1 + clipIds.length) % clipIds.length;
      }

      const nextId = clipIds[nextIndex];
      if (nextId) {
        state.selectedClipIds = [nextId];
      }
    },

    setCurrentLane: (state, action: PayloadAction<ID>) => {
      state.currentLaneId = action.payload;
    },

    clearCurrentLane: (state) => {
      state.currentLaneId = null;
    },

    navigateUp: (state, action: PayloadAction<ID[]>) => {
      const laneIds = action.payload;

      if (laneIds.length === 0) {
        return;
      }

      if (state.currentLaneId === null) {
        // No current lane, select last lane
        const lastLane = last(laneIds);
        state.currentLaneId = lastLane || null;
      } else {
        // Find current lane index
        const currentIndex = laneIds.indexOf(state.currentLaneId);

        if (currentIndex > 0) {
          // Move to previous lane
          const prevLane = laneIds[currentIndex - 1];
          state.currentLaneId = prevLane || null;
        }
        // If at first lane or not found, stay at current lane
      }
    },

    navigateDown: (state, action: PayloadAction<ID[]>) => {
      const laneIds = action.payload;

      if (laneIds.length === 0) {
        return;
      }

      if (state.currentLaneId === null) {
        // No current lane, select first lane
        const firstLane = first(laneIds);
        state.currentLaneId = firstLane || null;
      } else {
        // Find current lane index
        const currentIndex = laneIds.indexOf(state.currentLaneId);

        if (currentIndex !== -1 && currentIndex < laneIds.length - 1) {
          // Move to next lane
          const nextLane = laneIds[currentIndex + 1];
          state.currentLaneId = nextLane || null;
        }
        // If at last lane or not found, stay at current lane
      }
    },
  },
});

export const {
  selectClip,
  deselectClip,
  toggleClipSelection,
  selectMultipleClips,
  selectAllClips,
  clearSelection,
  cycleSelection,
  setCurrentLane,
  clearCurrentLane,
  navigateUp,
  navigateDown,
} = selectionSlice.actions;

export default selectionSlice.reducer;
