/**
 * Cyclone - Test Utilities
 * Common utilities for testing React components
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import timelineReducer from '@/store/slices/timelineSlice';
import tracksReducer from '@/store/slices/tracksSlice';
import patternsReducer from '@/store/slices/patternsSlice';
import selectionReducer from '@/store/slices/selectionSlice';
import scenesReducer from '@/store/slices/scenesSlice';
import crtEffectsReducer from '@/store/slices/crtEffectsSlice';
import projectReducer from '@/store/slices/projectSlice';
import quickInputReducer from '@/store/slices/quickInputSlice';
import commandPaletteReducer from '@/store/slices/commandPaletteSlice';
import statusReducer from '@/store/slices/statusSlice';
import themeReducer from '@/store/slices/themeSlice';
import patternEditorReducer from '@/store/slices/patternEditorSlice';
import songReducer from '@/store/slices/songSlice/index';
import consoleReducer from '@/store/slices/consoleSlice';
import undoable, { excludeAction } from 'redux-undo';
import type { RootState } from '@/store/store';
import type { CirklonSongData } from '@/utils/cirklon/types';
import type { Pattern } from '@/types';

/**
 * Wrap CKS song data in undoable structure for testing
 * The song reducer is wrapped with redux-undo, so tests need to provide state in this format
 */
export const wrapSongDataForTest = (songData: CirklonSongData) => ({
  present: songData,
  past: [],
  future: [],
});

/**
 * Create minimal CKS song data for testing
 * Accepts simple pattern array and converts to CKS format
 *
 * IMPORTANT: In CKS, all patterns in a scene start at the SAME position (scene.position).
 * To create patterns at different positions, we need separate scenes.
 *
 * The selector computes scene positions sequentially by accumulating scene durations.
 * So if patterns are at positions 0 and 8, we create:
 * - Scene 1 with length 8 bars (position 0, ends at 8)
 * - Scene 2 with length based on pattern duration (position 8)
 */
export const createTestSongData = (patterns: Pattern[]): CirklonSongData => {
  if (patterns.length === 0) {
    return {
      song_data: {
        'Test Song': {
          patterns: {},
          scenes: {},
        },
      },
      _cyclone_metadata: {
        version: '2.0.0',
        currentSongName: 'Test Song',
        uiMappings: { patterns: {}, tracks: {}, scenes: {} },
        trackOrder: [],
        sceneOrder: [],
      },
    };
  }

  const patternDefs: Record<string, any> = {};
  const scenes: Record<string, any> = {};
  const trackKeys = new Set<string>();
  const uiMappings: any = {
    patterns: {},
    tracks: {},
    scenes: {},
  };

  // Group patterns by position
  const patternsByPosition = new Map<number, Pattern[]>();
  patterns.forEach((pattern) => {
    const existing = patternsByPosition.get(pattern.position) || [];
    existing.push(pattern);
    patternsByPosition.set(pattern.position, existing);
  });

  // Sort positions
  const sortedPositions = Array.from(patternsByPosition.keys()).sort((a, b) => a - b);

  // Create scenes
  sortedPositions.forEach((position, index) => {
    const patternsAtPosition = patternsByPosition.get(position) || [];
    const sceneName = `Scene ${index + 1}`;
    const sceneId = `scene-${index + 1}`;

    // Calculate scene length:
    // - If there's a next position, length is distance to next position
    // - Otherwise, length is the max pattern duration
    const nextPosition = index < sortedPositions.length - 1 ? sortedPositions[index + 1] : undefined;
    const maxPatternDuration = Math.max(...patternsAtPosition.map((p) => p.duration));
    const sceneLength = nextPosition !== undefined
      ? nextPosition - position
      : maxPatternDuration;
    const sceneLengthBars = Math.ceil(sceneLength / 4);

    const pattern_assignments: Record<string, string> = {};

    patternsAtPosition.forEach((pattern) => {
      const trackKey = `track_${pattern.trackId.replace('track-', '')}`;
      trackKeys.add(trackKey);

      const patternName = pattern.label || `Pattern_${pattern.id}`;
      pattern_assignments[trackKey] = patternName;

      // Create pattern definition if not exists
      if (!patternDefs[patternName]) {
        patternDefs[patternName] = {
          type: 'P3',
          creator_track: parseInt(pattern.trackId.replace('track-', ''), 10) || 1,
          saved: false,
          bar_count: Math.ceil(pattern.duration / 4),
        };

        uiMappings.patterns[patternName] = {
          reactKey: pattern.id,
        };
      }
    });

    scenes[sceneName] = {
      gbar: 0, // Will be ignored; scene position computed from order
      length: sceneLengthBars,
      advance: 'auto',
      pattern_assignments,
    };

    uiMappings.scenes[sceneName] = {
      reactKey: sceneId,
    };
  });

  // Create track mappings
  const trackOrder: string[] = [];
  Array.from(trackKeys).sort().forEach((trackKey) => {
    trackOrder.push(trackKey);
    const trackNumber = parseInt(trackKey.replace('track_', ''), 10);
    const reactKey = `track-${trackNumber}`;

    uiMappings.tracks[trackKey] = {
      reactKey,
      color: '#00ff00',
      trackNumber,
    };
  });

  return {
    song_data: {
      'Test Song': {
        patterns: patternDefs,
        scenes,
      },
    },
    _cyclone_metadata: {
      version: '2.0.0',
      currentSongName: 'Test Song',
      uiMappings,
      trackOrder,
      sceneOrder: sortedPositions.map((_, i) => `Scene ${i + 1}`),
    },
  };
};

/**
 * Advance all timers and flush pending updates
 * Useful for components that use setTimeout/setInterval in useEffect
 */
export const advanceTimersAndFlush = async (): Promise<void> => {
  await act(async () => {
    jest.runAllTimers();
  });
};

/**
 * Advance timers by a specific amount of time and restore real timers
 * This is useful for components with setTimeout/setInterval that need real timers afterward
 * @param ms - Milliseconds to advance
 */
export const advanceTimersByTime = async (ms: number): Promise<void> => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    // Restore real timers after advancing for userEvent compatibility
    jest.useRealTimers();
  });
};

/**
 * Setup fake timers before tests
 * Call this in beforeEach to use fake timers in tests
 */
export const setupFakeTimers = (): void => {
  jest.useFakeTimers();
};

/**
 * Cleanup fake timers after tests
 * Call this in afterEach to restore real timers
 */
export const cleanupFakeTimers = (): void => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
};

/**
 * Wrap userEvent operations in act() to prevent act warnings
 * Use this for any userEvent operations that trigger state updates
 */
export const actUser = async <T,>(operation: () => Promise<T>): Promise<T> => {
  let result: T;
  await act(async () => {
    result = await operation();
  });
  return result!;
};

/**
 * Create a test store with all reducers properly configured
 * This matches the production store configuration including the song slice
 */
export const createTestStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
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
      console: consoleReducer,
      song: undoable(songReducer, {
        limit: 50,
        filter: excludeAction([
          'song/setEditingScene',
          'song/clearEditingScene',
          'song/addTrackInTimeline',
          'song/setTrackOrder',
          'song/setSceneOrder',
          'song/setTrackColor',
          'song/setSceneColor',
          'song/updateInstrumentAssignment',
          'song/updateTrackSettings',
        ]),
        clearHistoryType: ['song/loadSong'],
      }),
    } as any,
    preloadedState: preloadedState as any,
  });
};

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof createTestStore>;
}

/**
 * Render a component with Redux Provider wrapper
 * Automatically creates a test store with all reducers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    ...renderOptions
  }: RenderWithProvidersOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <Provider store={store}>{children}</Provider>;
  };

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
