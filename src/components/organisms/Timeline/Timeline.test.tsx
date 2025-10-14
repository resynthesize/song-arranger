/**
 * Cyclone - Timeline Component Tests
 * Tests for the Timeline component with Redux integration
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Timeline from './Timeline';
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
import type { RootState } from '@/types';

const createMockStore = (initialState?: Partial<RootState>) => {
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
    },
    preloadedState: initialState as RootState,
  });
};

describe('Timeline', () => {
  it('should render empty timeline', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Timeline />
      </Provider>
    );

    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('should render lanes', () => {
    const store = createMockStore({
      tracks: {
        tracks: [
          { id: 'lane-1', name: 'Kick' },
          { id: 'lane-2', name: 'Snare' },
        ],
        editingTrackId: null,
        movingTrackId: null,
      },
      patterns: { patterns: [], editingPatternId: null },
      selection: { selectedPatternIds: [], currentTrackId: null },
    });

    render(
      <Provider store={store}>
        <Timeline />
      </Provider>
    );

    expect(screen.getByText('Kick')).toBeInTheDocument();
    expect(screen.getByText('Snare')).toBeInTheDocument();
  });

  it('should render clips in their lanes', () => {
    const store = createMockStore({
      tracks: {
        tracks: [{ id: 'lane-1', name: 'Kick' }],
        editingTrackId: null,
        movingTrackId: null,
      },
      patterns: {
        patterns: [
          {
            id: 'clip-1',
            trackId: 'lane-1',
            position: 0,
            duration: 4,
            label: 'Intro',
          },
        ],
        editingPatternId: null,
      },
      selection: { selectedPatternIds: [], currentTrackId: null },
    });

    render(
      <Provider store={store}>
        <Timeline />
      </Provider>
    );

    expect(screen.getByTestId('pattern-clip-1')).toBeInTheDocument();
    expect(screen.getByText('Intro')).toBeInTheDocument();
  });

  it('should show empty state when no lanes', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Timeline />
      </Provider>
    );

    expect(
      screen.getByText(/No lanes yet/i)
    ).toBeInTheDocument();
  });

  it('should apply zoom from Redux state', () => {
    const store = createMockStore({
      timeline: {
        viewport: {
          offsetBeats: 0,
          zoom: 200,
          widthPx: 1600,
          heightPx: 600,
        },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'fixed',
        verticalZoom: 100,
        minimapVisible: false,
      },
      tracks: {
        tracks: [{ id: 'lane-1', name: 'Kick' }],
        editingTrackId: null,
        movingTrackId: null,
      },
      patterns: {
        patterns: [
          { id: 'clip-1', trackId: 'lane-1', position: 0, duration: 4 },
        ],
        editingPatternId: null,
      },
      selection: { selectedPatternIds: [], currentTrackId: null },
    });

    render(
      <Provider store={store}>
        <Timeline />
      </Provider>
    );

    const clip = screen.getByTestId('pattern-clip-1');
    expect(clip).toHaveStyle({ width: '800px' }); // 4 beats * 200 zoom
  });

  it('should dispatch openPattern when pattern is double-clicked', async () => {
    const store = createMockStore({
      tracks: {
        tracks: [{ id: 'lane-1', name: 'Kick' }],
        editingTrackId: null,
        movingTrackId: null,
      },
      patterns: {
        patterns: [
          { id: 'pattern-1', trackId: 'lane-1', position: 0, duration: 4 },
        ],
        editingPatternId: null,
      },
      selection: { selectedPatternIds: [], currentTrackId: null },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <Timeline />
      </Provider>
    );

    // Find the pattern and double-click it
    const pattern = getByTestId('pattern-pattern-1');
    const content = pattern.querySelector('.pattern__content');

    if (content) {
      await userEvent.dblClick(content);
    }

    // Check that openPattern action was dispatched
    const state = store.getState();
    expect(state.patternEditor.openPatternId).toBe('pattern-1');
  });
});
