/**
 * Cyclone - Redux Store Configuration
 * Central store setup with Redux Toolkit
 */

import { configureStore } from '@reduxjs/toolkit';
import timelineReducer from './slices/timelineSlice';
import tracksReducer from './slices/tracksSlice';
import patternsReducer from './slices/patternsSlice';
import selectionReducer from './slices/selectionSlice';
import scenesReducer from './slices/scenesSlice';
import crtEffectsReducer from './slices/crtEffectsSlice';
import projectReducer from './slices/projectSlice';
import quickInputReducer from './slices/quickInputSlice';
import commandPaletteReducer from './slices/commandPaletteSlice';
import statusReducer from './slices/statusSlice';
import themeReducer from './slices/themeSlice';
import patternEditorReducer from './slices/patternEditorSlice';

export const store = configureStore({
  reducer: {
    timeline: timelineReducer,
    tracks: tracksReducer,
    patterns: patternsReducer,
    selection: selectionReducer,
    scenes: scenesReducer,
    crtEffects: crtEffectsReducer,
    project: projectReducer,
    quickInput: quickInputReducer,
    commandPalette: commandPaletteReducer,
    status: statusReducer,
    theme: themeReducer,
    patternEditor: patternEditorReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
