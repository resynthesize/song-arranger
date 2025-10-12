/**
 * Song Arranger - QuickInput Slice
 * Redux state management for quick input modal dialog
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type QuickInputCommand = 'tempo' | 'zoom' | 'snap' | 'length' | 'position';

export interface QuickInputState {
  isOpen: boolean;
  command: QuickInputCommand | null;
}

const initialState: QuickInputState = {
  isOpen: false,
  command: null,
};

const quickInputSlice = createSlice({
  name: 'quickInput',
  initialState,
  reducers: {
    openQuickInput: (state, action: PayloadAction<QuickInputCommand>) => {
      state.isOpen = true;
      state.command = action.payload;
    },
    closeQuickInput: (state) => {
      state.isOpen = false;
      state.command = null;
    },
  },
});

export const { openQuickInput, closeQuickInput } = quickInputSlice.actions;

export default quickInputSlice.reducer;
