/**
 * Song Arranger - Selection Slice
 * Redux state management for clip selection
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SelectionState, ID } from '@/types';

const initialState: SelectionState = {
  selectedClipIds: [],
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    selectClip: (state, action: PayloadAction<ID>) => {
      state.selectedClipIds = [action.payload];
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

    clearSelection: (state) => {
      state.selectedClipIds = [];
    },
  },
});

export const {
  selectClip,
  deselectClip,
  toggleClipSelection,
  selectMultipleClips,
  clearSelection,
} = selectionSlice.actions;

export default selectionSlice.reducer;
