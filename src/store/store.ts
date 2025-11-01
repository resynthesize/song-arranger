/**
 * Cyclone - Redux Store Configuration
 * Central store setup with Redux Toolkit
 */

import { configureStore } from '@reduxjs/toolkit';
import undoable, { excludeAction } from 'redux-undo';

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
import sceneEditorReducer from './slices/sceneEditorSlice';
import songReducer from './slices/songSlice/slice'; // Import directly from slice.ts, not barrel export
import consoleReducer from './slices/consoleSlice';
import keyboardContextReducer from './slices/keyboardContextSlice';

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
    sceneEditor: sceneEditorReducer,
    // Wrap song reducer with undoable for undo/redo support
    song: undoable(songReducer, {
      limit: 50, // Keep last 50 states
      filter: excludeAction([
        // Exclude actions that shouldn't trigger undo states
        'song/setEditingScene',
        'song/clearEditingScene',
        'song/addTrackInTimeline', // Adding tracks is structural, not undoable
        'song/setTrackOrder',
        'song/setSceneOrder',
        'song/setTrackColor',
        'song/setSceneColor',
        'song/updateInstrumentAssignment',
        'song/updateTrackSettings',
        'song/loadSong', // TESTING: loadSong should not create undo history
      ]),
      // Clear history when loading a new song (prevents undoing past file loads)
      // clearHistoryType: ['song/loadSong'], // TESTING: Temporarily disabled to test if this is blocking the reducer
    }),
    console: consoleReducer, // NEW: Live coding console
    keyboardContext: keyboardContextReducer, // Keyboard context for input handling
  },
});

// Expose store to window for E2E testing
if (typeof window !== 'undefined') {
  (window as any).__store__ = store;
}

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export undo/redo action creators
export { ActionCreators as UndoActionCreators } from 'redux-undo';
