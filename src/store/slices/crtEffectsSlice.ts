/**
 * Cyclone - CRT Effects Slice
 * Redux state management for CRT effects settings
 */

import { createSlice } from '@reduxjs/toolkit';

export interface CRTEffectsState {
  enabled: boolean;
}

// Load initial state from localStorage or default to true
const getInitialState = (): CRTEffectsState => {
  const stored = localStorage.getItem('crtEffectsEnabled');
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Respect prefers-reduced-motion, otherwise use stored preference or default to true
  const enabled = prefersReducedMotion
    ? false
    : stored !== null
      ? stored === 'true'
      : true;

  return { enabled };
};

const initialState: CRTEffectsState = getInitialState();

const crtEffectsSlice = createSlice({
  name: 'crtEffects',
  initialState,
  reducers: {
    toggleCRTEffects: (state) => {
      state.enabled = !state.enabled;
      localStorage.setItem('crtEffectsEnabled', state.enabled.toString());
    },
    enableCRTEffects: (state) => {
      state.enabled = true;
      localStorage.setItem('crtEffectsEnabled', 'true');
    },
    disableCRTEffects: (state) => {
      state.enabled = false;
      localStorage.setItem('crtEffectsEnabled', 'false');
    },
  },
});

export const { toggleCRTEffects, enableCRTEffects, disableCRTEffects } =
  crtEffectsSlice.actions;

export default crtEffectsSlice.reducer;
