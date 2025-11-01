/**
 * Cyclone - Scene Editor Slice
 * Manages UI state for the scene editor panel
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ID } from '@/types';
import { openPattern } from './patternEditorSlice';

export interface SceneEditorState {
  /** React ID of the currently open scene (null if closed) */
  openSceneId: ID | null;

  /** Height of the editor panel in pixels */
  editorHeight: number;
}

const initialState: SceneEditorState = {
  openSceneId: null,
  editorHeight: 300, // Default editor height
};

const sceneEditorSlice = createSlice({
  name: 'sceneEditor',
  initialState,
  reducers: {
    /**
     * Open a scene in the editor
     */
    openScene: (state, action: PayloadAction<ID>) => {
      state.openSceneId = action.payload;
    },

    /**
     * Close the scene editor
     */
    closeScene: (state) => {
      state.openSceneId = null;
    },

    /**
     * Set the editor panel height
     */
    setEditorHeight: (state, action: PayloadAction<number>) => {
      state.editorHeight = Math.max(200, Math.min(600, action.payload));
    },
  },
  extraReducers: (builder) => {
    // Close scene editor when pattern editor opens (mutual exclusion)
    builder.addCase(openPattern, (state) => {
      if (state.openSceneId) {
        state.openSceneId = null;
      }
    });
  },
});

export const {
  openScene,
  closeScene,
  setEditorHeight,
} = sceneEditorSlice.actions;

export default sceneEditorSlice.reducer;
