/**
 * Cyclone - CommandPalette Slice
 * Redux state management for command palette visibility
 */

import { createSlice } from '@reduxjs/toolkit';

export interface CommandPaletteState {
  isOpen: boolean;
}

const initialState: CommandPaletteState = {
  isOpen: false,
};

const commandPaletteSlice = createSlice({
  name: 'commandPalette',
  initialState,
  reducers: {
    openCommandPalette: (state) => {
      state.isOpen = true;
    },
    closeCommandPalette: (state) => {
      state.isOpen = false;
    },
    toggleCommandPalette: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openCommandPalette, closeCommandPalette, toggleCommandPalette } = commandPaletteSlice.actions;

export default commandPaletteSlice.reducer;
