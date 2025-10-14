/**
 * Song Arranger - Theme Management Slice
 * Redux slice for managing application theme (modern/retro)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'modern' | 'retro';

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
      state.current = state.current === 'modern' ? 'retro' : 'modern';
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
