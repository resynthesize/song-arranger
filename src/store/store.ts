/**
 * Song Arranger - Redux Store Configuration
 * Central store setup with Redux Toolkit
 */

import { configureStore } from '@reduxjs/toolkit';
import timelineReducer from './slices/timelineSlice';
import lanesReducer from './slices/lanesSlice';
import clipsReducer from './slices/clipsSlice';
import selectionReducer from './slices/selectionSlice';
import crtEffectsReducer from './slices/crtEffectsSlice';
import projectReducer from './slices/projectSlice';

export const store = configureStore({
  reducer: {
    timeline: timelineReducer,
    lanes: lanesReducer,
    clips: clipsReducer,
    selection: selectionReducer,
    crtEffects: crtEffectsReducer,
    project: projectReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
