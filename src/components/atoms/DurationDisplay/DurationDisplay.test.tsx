/**
 * DurationDisplay Component Tests
 */

import { render, screen } from '@testing-library/react';
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
import { DurationDisplay } from './DurationDisplay';
import type { Pattern } from '@/types';

// Helper to create a test store with custom state
const createTestStore = (config?: {
  tempo?: number;
  patterns?: Pattern[];
  selectedPatternIds?: string[];
}) => {
  const { tempo = 120, patterns = [], selectedPatternIds = [] } = config || {};

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
      patterns: {
        patterns,
        editingPatternId: null,
      },
      selection: {
        selectedPatternIds,
        currentTrackId: null,
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
      expect(screen.getByText('TOTAL')).toBeInTheDocument();
    });

    it('should display 00:00 when no patterns exist', () => {
      const store = createTestStore({ patterns: [] });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:00');
    });

    it('should calculate and display global duration correctly', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track1', position: 0, duration: 4 },
        { id: '2', trackId: 'track1', position: 8, duration: 4 },
      ];
      // Rightmost pattern ends at position 12 (8 + 4)
      // At 120 BPM: 12 beats = 6 seconds = 00:06
      const store = createTestStore({ tempo: 120, patterns });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:06');
    });

    it('should update when tempo changes', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track1', position: 0, duration: 4 },
      ];
      // At 120 BPM: 4 beats = 2 seconds = 00:02
      const store = createTestStore({ tempo: 120, patterns });
      const { rerender } = render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:02');

      // At 60 BPM: 4 beats = 4 seconds = 00:04
      const store2 = createTestStore({ tempo: 60, patterns });
      rerender(
        <Provider store={store2}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:04');
    });

    it('should format large durations correctly', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track1', position: 0, duration: 240 },
      ];
      // At 120 BPM: 240 beats = 120 seconds = 02:00
      const store = createTestStore({ tempo: 120, patterns });
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
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track1', position: 0, duration: 4 },
      ];
      const store = createTestStore({ patterns, selectedPatternIds: [] });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.queryByText('SELECTED')).not.toBeInTheDocument();
      expect(screen.queryByTestId('duration-selected')).not.toBeInTheDocument();
    });

    it('should display selected duration label when patterns are selected', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track1', position: 0, duration: 4 },
      ];
      const store = createTestStore({ patterns, selectedPatternIds: ['1'] });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByText('SELECTED')).toBeInTheDocument();
    });

    it('should calculate selected duration correctly', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track1', position: 0, duration: 4 },
        { id: '2', trackId: 'track2', position: 4, duration: 8 },
        { id: '3', trackId: 'track3', position: 8, duration: 2 },
      ];
      // Selected patterns: 1 (4 beats) + 3 (2 beats) = 6 beats
      // At 120 BPM: 6 beats = 3 seconds = 00:03
      const store = createTestStore({ tempo: 120, patterns, selectedPatternIds: ['1', '3'] });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:03');
    });

    it('should update when selection changes', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track1', position: 0, duration: 4 },
        { id: '2', trackId: 'track2', position: 4, duration: 4 },
      ];
      // First: 1 pattern selected (4 beats = 2 seconds)
      const store1 = createTestStore({ tempo: 120, patterns, selectedPatternIds: ['1'] });
      const { rerender } = render(
        <Provider store={store1}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:02');

      // Second: both patterns selected (8 beats = 4 seconds)
      const store2 = createTestStore({ tempo: 120, patterns, selectedPatternIds: ['1', '2'] });
      rerender(
        <Provider store={store2}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:04');

      // Third: no selection
      const store3 = createTestStore({ tempo: 120, patterns, selectedPatternIds: [] });
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
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track1', position: 0, duration: 4 },
      ];
      const store = createTestStore({ patterns });
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
    it('should display selected duration when patterns are selected', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track1', position: 0, duration: 4 },
        { id: '2', trackId: 'track2', position: 8, duration: 4 },
      ];
      // Selected: 4 beats at 120 BPM = 2 seconds
      const store = createTestStore({ tempo: 120, patterns, selectedPatternIds: ['1'] });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.queryByTestId('duration-global')).not.toBeInTheDocument(); // Global hidden when selection exists
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:02');
    });

    it('should handle edge case of very long durations', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track1', position: 0, duration: 7200 },
      ];
      // At 120 BPM: 7200 beats = 3600 seconds = 60:00
      const store = createTestStore({ tempo: 120, patterns });
      render(
        <Provider store={store}>
          <DurationDisplay />
        </Provider>
      );
      expect(screen.getByTestId('duration-global')).toHaveTextContent('60:00');
    });
  });
});
