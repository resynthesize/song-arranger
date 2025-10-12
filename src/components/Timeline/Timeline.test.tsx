/**
 * Song Arranger - Timeline Component Tests
 * Tests for the Timeline component with Redux integration
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Timeline from './Timeline';
import timelineReducer from '@/store/slices/timelineSlice';
import lanesReducer from '@/store/slices/lanesSlice';
import clipsReducer from '@/store/slices/clipsSlice';
import selectionReducer from '@/store/slices/selectionSlice';
import crtEffectsReducer from '@/store/slices/crtEffectsSlice';
import type { RootState } from '@/types';

const createMockStore = (initialState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      timeline: timelineReducer,
      lanes: lanesReducer,
      clips: clipsReducer,
      selection: selectionReducer,
      crtEffects: crtEffectsReducer,
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
      lanes: {
        lanes: [
          { id: 'lane-1', name: 'Kick' },
          { id: 'lane-2', name: 'Snare' },
        ],
        editingLaneId: null,
      },
      clips: { clips: [] },
      selection: { selectedClipIds: [] },
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
      lanes: {
        lanes: [{ id: 'lane-1', name: 'Kick' }],
        editingLaneId: null,
      },
      clips: {
        clips: [
          {
            id: 'clip-1',
            laneId: 'lane-1',
            position: 0,
            duration: 4,
            label: 'Intro',
          },
        ],
      },
      selection: { selectedClipIds: [] },
    });

    render(
      <Provider store={store}>
        <Timeline />
      </Provider>
    );

    expect(screen.getByTestId('clip-clip-1')).toBeInTheDocument();
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
        zoom: 200,
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
      },
      lanes: {
        lanes: [{ id: 'lane-1', name: 'Kick' }],
        editingLaneId: null,
      },
      clips: {
        clips: [
          { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4 },
        ],
      },
      selection: { selectedClipIds: [] },
    });

    render(
      <Provider store={store}>
        <Timeline />
      </Provider>
    );

    const clip = screen.getByTestId('clip-clip-1');
    expect(clip).toHaveStyle({ width: '800px' }); // 4 beats * 200 zoom
  });
});
