/**
 * Cyclone - Selection Slice
 * Redux state management for pattern selection
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SelectionState, ID } from '@/types';
import { first, last } from '@/utils/array';
import { logger } from '@/utils/debug';

const initialState: SelectionState = {
  selectedPatternIds: [],
  currentTrackId: null,
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    selectPattern: (state, action: PayloadAction<ID>) => {
      logger.log('[selectPattern reducer] Selecting pattern', {
        patternId: action.payload,
        previousSelection: state.selectedPatternIds
      });
      state.selectedPatternIds = [action.payload];
      // Clear current track when selecting a pattern
      state.currentTrackId = null;
    },

    deselectPattern: (state, action: PayloadAction<ID>) => {
      state.selectedPatternIds = state.selectedPatternIds.filter(
        (id) => id !== action.payload
      );
    },

    togglePatternSelection: (state, action: PayloadAction<ID>) => {
      const patternId = action.payload;
      const index = state.selectedPatternIds.indexOf(patternId);

      if (index === -1) {
        // Add to selection
        state.selectedPatternIds.push(patternId);
      } else {
        // Remove from selection
        state.selectedPatternIds.splice(index, 1);
      }
    },

    selectMultiplePatterns: (state, action: PayloadAction<ID[]>) => {
      // Remove duplicates using Set
      state.selectedPatternIds = Array.from(new Set(action.payload));
    },

    selectAllPatterns: (state, action: PayloadAction<ID[]>) => {
      // Select all patterns - payload contains all pattern IDs
      state.selectedPatternIds = action.payload;
    },

    clearSelection: (state) => {
      logger.log('[clearSelection reducer] Clearing selection', {
        previousSelection: state.selectedPatternIds
      });
      state.selectedPatternIds = [];
    },

    cycleSelection: (state, action: PayloadAction<{ patternIds: ID[]; direction: 'forward' | 'backward' }>) => {
      const { patternIds, direction } = action.payload;

      if (patternIds.length === 0) {
        state.selectedPatternIds = [];
        return;
      }

      // If nothing selected, select first/last
      if (state.selectedPatternIds.length === 0) {
        const firstOrLast = direction === 'forward' ? first(patternIds) : last(patternIds);
        if (firstOrLast) {
          state.selectedPatternIds = [firstOrLast];
        }
        return;
      }

      // Find current selection index
      const currentId = first(state.selectedPatternIds);
      if (!currentId) return;

      const currentIndex = patternIds.indexOf(currentId);

      if (currentIndex === -1) {
        // Current selection not in list, select first/last
        const firstOrLast = direction === 'forward' ? first(patternIds) : last(patternIds);
        if (firstOrLast) {
          state.selectedPatternIds = [firstOrLast];
        }
        return;
      }

      // Cycle to next/previous
      let nextIndex;
      if (direction === 'forward') {
        nextIndex = (currentIndex + 1) % patternIds.length;
      } else {
        nextIndex = (currentIndex - 1 + patternIds.length) % patternIds.length;
      }

      const nextId = patternIds[nextIndex];
      if (nextId) {
        state.selectedPatternIds = [nextId];
      }
    },

    setCurrentTrack: (state, action: PayloadAction<ID>) => {
      state.currentTrackId = action.payload;
    },

    clearCurrentTrack: (state) => {
      state.currentTrackId = null;
    },

    navigateUp: (state, action: PayloadAction<ID[]>) => {
      const trackIds = action.payload;

      if (trackIds.length === 0) {
        return;
      }

      if (state.currentTrackId === null) {
        // No current track, select last track
        const lastTrack = last(trackIds);
        state.currentTrackId = lastTrack || null;
      } else {
        // Find current track index
        const currentIndex = trackIds.indexOf(state.currentTrackId);

        if (currentIndex > 0) {
          // Move to previous track
          const prevTrack = trackIds[currentIndex - 1];
          state.currentTrackId = prevTrack || null;
        }
        // If at first track or not found, stay at current track
      }
    },

    navigateDown: (state, action: PayloadAction<ID[]>) => {
      const trackIds = action.payload;

      if (trackIds.length === 0) {
        return;
      }

      if (state.currentTrackId === null) {
        // No current track, select first track
        const firstTrack = first(trackIds);
        state.currentTrackId = firstTrack || null;
      } else {
        // Find current track index
        const currentIndex = trackIds.indexOf(state.currentTrackId);

        if (currentIndex !== -1 && currentIndex < trackIds.length - 1) {
          // Move to next track
          const nextTrack = trackIds[currentIndex + 1];
          state.currentTrackId = nextTrack || null;
        }
        // If at last track or not found, stay at current track
      }
    },
  },
});

export const {
  selectPattern,
  deselectPattern,
  togglePatternSelection,
  selectMultiplePatterns,
  selectAllPatterns,
  clearSelection,
  cycleSelection,
  setCurrentTrack,
  clearCurrentTrack,
  navigateUp,
  navigateDown,
} = selectionSlice.actions;

export default selectionSlice.reducer;
