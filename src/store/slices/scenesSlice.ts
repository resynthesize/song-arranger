/**
 * Song Arranger - Scenes Slice
 * Redux state management for scene markers
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ScenesState, Scene, ID } from '@/types';

const initialState: ScenesState = {
  scenes: [],
  editingSceneId: null,
};

const scenesSlice = createSlice({
  name: 'scenes',
  initialState,
  reducers: {
    setScenes: (state, action: PayloadAction<Scene[]>) => {
      state.scenes = action.payload;
    },

    updateSceneName: (
      state,
      action: PayloadAction<{ sceneId: ID; name: string }>
    ) => {
      const { sceneId, name } = action.payload;
      const scene = state.scenes.find((s) => s.id === sceneId);
      if (scene) {
        scene.name = name;
      }
    },

    setEditingScene: (state, action: PayloadAction<ID>) => {
      state.editingSceneId = action.payload;
    },

    clearEditingScene: (state) => {
      state.editingSceneId = null;
    },
  },
});

export const {
  setScenes,
  updateSceneName,
  setEditingScene,
  clearEditingScene,
} = scenesSlice.actions;

export default scenesSlice.reducer;
