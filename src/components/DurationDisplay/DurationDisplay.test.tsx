/**
 * DurationDisplay Component Tests
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import timelineReducer from '@/store/slices/timelineSlice';
import clipsReducer from '@/store/slices/clipsSlice';
import selectionReducer from '@/store/slices/selectionSlice';
import { DurationDisplay } from './DurationDisplay';
import type { Clip } from '@/types';

// Helper to create a test store with custom state
const createTestStore = (config?: {
  tempo?: number;
  clips?: Clip[];
  selectedClipIds?: string[];
}) => {
  const { tempo = 120, clips = [], selectedClipIds = [] } = config || {};

  return configureStore({
    reducer: {
      timeline: timelineReducer,
      clips: clipsReducer,
      selection: selectionReducer,
    },
    preloadedState: {
      timeline: {
        viewport: {
          offsetBeats: 0,
          zoom: 5,
          widthPx: 1600,
          heightPx: 600,
        },
        playheadPosition: 0,
        isPlaying: false,
        tempo,
        snapValue: 1,
        snapMode: 'grid' as const,
        verticalZoom: 100,
        minimapVisible: false,
      },
      clips: {
        clips,
        editingClipId: null,
      },
      selection: {
        selectedClipIds,
        currentLaneId: null,
      },
    },
  });
};

describe('DurationDisplay', () => {
  describe('Rendering', () => {
    it('should render the component', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-display')).toBeInTheDocument();
    });

    it('should have terminal styling classes', () => {
      const store = createTestStore();
      const { container } = render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(container.querySelector('.duration-display')).toBeInTheDocument();
    });
  });

  describe('Global Duration', () => {
    it('should display global duration label', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByText('GLOBAL')).toBeInTheDocument();
    });

    it('should display 00:00 when no clips exist', () => {
      const store = createTestStore({ clips: [] });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:00');
    });

    it('should calculate and display global duration correctly', () => {
      const clips: Clip[] = [
        { id: '1', laneId: 'lane1', position: 0, duration: 4 },
        { id: '2', laneId: 'lane1', position: 8, duration: 4 },
      ];
      // Rightmost clip ends at position 12 (8 + 4)
      // At 120 BPM: 12 beats = 6 seconds = 00:06
      const store = createTestStore({ tempo: 120, clips });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:06');
    });

    it('should update when tempo changes', () => {
      const clips: Clip[] = [
        { id: '1', laneId: 'lane1', position: 0, duration: 4 },
      ];
      // At 120 BPM: 4 beats = 2 seconds = 00:02
      const store = createTestStore({ tempo: 120, clips });
      const { rerender } = render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:02');

      // At 60 BPM: 4 beats = 4 seconds = 00:04
      const store2 = createTestStore({ tempo: 60, clips });
      rerender(
        <Provider store={store2}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:04');
    });

    it('should format large durations correctly', () => {
      const clips: Clip[] = [
        { id: '1', laneId: 'lane1', position: 0, duration: 240 },
      ];
      // At 120 BPM: 240 beats = 120 seconds = 02:00
      const store = createTestStore({ tempo: 120, clips });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('02:00');
    });
  });

  describe('Selected Duration', () => {
    it('should not display selected duration when no clips are selected', () => {
      const clips: Clip[] = [
        { id: '1', laneId: 'lane1', position: 0, duration: 4 },
      ];
      const store = createTestStore({ clips, selectedClipIds: [] });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.queryByText('SELECTED')).not.toBeInTheDocument();
      expect(screen.queryByTestId('duration-selected')).not.toBeInTheDocument();
    });

    it('should display selected duration label when clips are selected', () => {
      const clips: Clip[] = [
        { id: '1', laneId: 'lane1', position: 0, duration: 4 },
      ];
      const store = createTestStore({ clips, selectedClipIds: ['1'] });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByText('SELECTED')).toBeInTheDocument();
    });

    it('should calculate selected duration correctly', () => {
      const clips: Clip[] = [
        { id: '1', laneId: 'lane1', position: 0, duration: 4 },
        { id: '2', laneId: 'lane2', position: 4, duration: 8 },
        { id: '3', laneId: 'lane3', position: 8, duration: 2 },
      ];
      // Selected clips: 1 (4 beats) + 3 (2 beats) = 6 beats
      // At 120 BPM: 6 beats = 3 seconds = 00:03
      const store = createTestStore({ tempo: 120, clips, selectedClipIds: ['1', '3'] });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:03');
    });

    it('should update when selection changes', () => {
      const clips: Clip[] = [
        { id: '1', laneId: 'lane1', position: 0, duration: 4 },
        { id: '2', laneId: 'lane2', position: 4, duration: 4 },
      ];
      // First: 1 clip selected (4 beats = 2 seconds)
      const store1 = createTestStore({ tempo: 120, clips, selectedClipIds: ['1'] });
      const { rerender } = render(
        <Provider store={store1}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:02');

      // Second: both clips selected (8 beats = 4 seconds)
      const store2 = createTestStore({ tempo: 120, clips, selectedClipIds: ['1', '2'] });
      rerender(
        <Provider store={store2}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:04');

      // Third: no selection
      const store3 = createTestStore({ tempo: 120, clips, selectedClipIds: [] });
      rerender(
        <Provider store={store3}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.queryByTestId('duration-selected')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply retro terminal classes', () => {
      const store = createTestStore();
      const { container } = render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      const display = container.querySelector('.duration-display');
      expect(display).toBeInTheDocument();
    });

    it('should have phosphor glow effect on values', () => {
      const clips: Clip[] = [
        { id: '1', laneId: 'lane1', position: 0, duration: 4 },
      ];
      const store = createTestStore({ clips });
      const { container } = render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      const globalValue = container.querySelector('.duration-display__value');
      expect(globalValue).toBeInTheDocument();
    });

    it('should render ASCII box borders', () => {
      const store = createTestStore();
      const { container } = render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      const display = container.querySelector('.duration-display');
      expect(display?.textContent).toMatch(/[┌└─│]/); // Check for box drawing characters
    });
  });

  describe('Integration', () => {
    it('should display both global and selected durations when clips are selected', () => {
      const clips: Clip[] = [
        { id: '1', laneId: 'lane1', position: 0, duration: 4 },
        { id: '2', laneId: 'lane2', position: 8, duration: 4 },
      ];
      // Global: 12 beats at 120 BPM = 6 seconds
      // Selected: 4 beats at 120 BPM = 2 seconds
      const store = createTestStore({ tempo: 120, clips, selectedClipIds: ['1'] });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:06');
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:02');
    });

    it('should handle edge case of very long durations', () => {
      const clips: Clip[] = [
        { id: '1', laneId: 'lane1', position: 0, duration: 7200 },
      ];
      // At 120 BPM: 7200 beats = 3600 seconds = 60:00
      const store = createTestStore({ tempo: 120, clips });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('60:00');
    });
  });
});
