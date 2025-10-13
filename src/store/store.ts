/**
 * Song Arranger - Redux Store Configuration
 * Central store setup with Redux Toolkit
 */

import { configureStore } from '@reduxjs/toolkit';
import timelineReducer from './slices/timelineSlice';
import tracksReducer from './slices/tracksSlice';
import patternsReducer from './slices/patternsSlice';
import selectionReducer from './slices/selectionSlice';
import crtEffectsReducer from './slices/crtEffectsSlice';
import projectReducer from './slices/projectSlice';
import quickInputReducer from './slices/quickInputSlice';
import commandPaletteReducer from './slices/commandPaletteSlice';
import statusReducer from './slices/statusSlice';

export const store = configureStore({
  reducer: {
    timeline: timelineReducer,
    tracks: tracksReducer,
    patterns: patternsReducer,
    selection: selectionReducer,
    crtEffects: crtEffectsReducer,
    project: projectReducer,
    quickInput: quickInputReducer,
    commandPalette: commandPaletteReducer,
    status: statusReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
