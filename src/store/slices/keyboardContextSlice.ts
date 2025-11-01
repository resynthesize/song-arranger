/**
 * Cyclone - Keyboard Context Slice
 * Manages keyboard input context to prevent global shortcuts from interfering with text input
 *
 * Contexts:
 * - 'global': Default state, all shortcuts active
 * - 'editing': User is editing text (inline editors, inputs, etc.) - block most shortcuts
 * - 'modal': Modal/dialog is open - block timeline shortcuts but allow modal-specific ones
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type KeyboardContext = 'global' | 'editing' | 'modal';

interface KeyboardContextState {
  context: KeyboardContext;
  // Track what component/field is being edited for debugging
  activeEditor?: string;
}

const initialState: KeyboardContextState = {
  context: 'global',
  activeEditor: undefined,
};

const keyboardContextSlice = createSlice({
  name: 'keyboardContext',
  initialState,
  reducers: {
    /**
     * Set keyboard context (e.g., when entering edit mode)
     */
    setKeyboardContext: (
      state,
      action: PayloadAction<{ context: KeyboardContext; editor?: string }>
    ) => {
      state.context = action.payload.context;
      state.activeEditor = action.payload.editor;
    },

    /**
     * Reset to global context (e.g., when exiting edit mode)
     */
    resetKeyboardContext: (state) => {
      state.context = 'global';
      state.activeEditor = undefined;
    },
  },
});

export const { setKeyboardContext, resetKeyboardContext } = keyboardContextSlice.actions;
export default keyboardContextSlice.reducer;
