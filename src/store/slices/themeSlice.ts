/**
 * Cyclone - Theme Management Slice
 * Redux slice for managing application theme (retro/modern/minimalist)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'retro' | 'modern' | 'minimalist';

export interface ThemeState {
  current: Theme;
}

const initialState: ThemeState = {
  current: 'modern', // Modern theme is the default
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.current = action.payload;
    },
    toggleTheme: (state) => {
      // Cycle through themes: retro -> modern -> minimalist -> retro
      if (state.current === 'retro') {
        state.current = 'modern';
      } else if (state.current === 'modern') {
        state.current = 'minimalist';
      } else {
        state.current = 'retro';
      }
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
