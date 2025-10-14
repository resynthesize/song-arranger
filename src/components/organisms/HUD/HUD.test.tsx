/**
 * Cyclone - HUD Component Tests
 * Terminal-styled information-dense heads-up display
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import HUD from './HUD';
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
import type { ViewportState } from '@/types';

// Default viewport for tests
const defaultViewport: ViewportState = {
  offsetBeats: 0,
  zoom: 100,
  widthPx: 1600,
  heightPx: 600,
};

// Helper to create timeline state with viewport structure
const createTimelineState = (overrides = {}) => {
  return {
    viewport: { ...defaultViewport },
    playheadPosition: 0,
    isPlaying: false,
    tempo: 120,
    snapValue: 1,
    snapMode: 'fixed' as const,
    ...overrides,
  };
};

// Helper to create a test store with initial state
const createTestStore = (preloadedState = {}) => {
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
    preloadedState,
  });
};

// Helper to render component with store
const renderWithStore = (component: React.ReactElement, preloadedState = {}) => {
  const store = createTestStore(preloadedState);
  return render(<Provider store={store}>{component}</Provider>);
};

describe('HUD', () => {
  it('should render without crashing', () => {
    renderWithStore(<HUD />);
    expect(screen.getByTestId('hud')).toBeInTheDocument();
  });

  it('should display BPM value from timeline state', () => {
    renderWithStore(<HUD />, {
      timeline: createTimelineState({ tempo: 140 }),
    });

    expect(screen.getByText(/140/)).toBeInTheDocument();
    expect(screen.getByText(/BPM/i)).toBeInTheDocument();
  });

  it('should display zoom level', () => {
    renderWithStore(<HUD />, {
      timeline: createTimelineState({ viewport: { ...defaultViewport, zoom: 200 } }),
    });

    expect(screen.getByText(/ZOOM/i)).toBeInTheDocument();
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });

  it('should display snap value with musical notation', () => {
    renderWithStore(<HUD />, {
      timeline: createTimelineState({ snapValue: 1 }),
    });

    expect(screen.getByText(/SNAP/i)).toBeInTheDocument();
    expect(screen.getByText(/1\/4/)).toBeInTheDocument();
  });

  it('should display playhead position in beats', () => {
    renderWithStore(<HUD />, {
      timeline: createTimelineState({ playheadPosition: 8.5 }),
    });

    expect(screen.getByText(/TIME/i)).toBeInTheDocument();
    expect(screen.getByText(/8.50/)).toBeInTheDocument();
  });

  it('should display playhead position in bars:beats format', () => {
    renderWithStore(<HUD />, {
      timeline: createTimelineState({ playheadPosition: 8.5 }),
    });

    // 8.5 beats = bar 3, beat 1 (zero-indexed: bar 2)
    expect(screen.getByText(/3:1/)).toBeInTheDocument();
  });

  it('should display pattern count', () => {
    renderWithStore(<HUD />, {
      patterns: {
        patterns: [
          { id: '1', trackId: 'track1', position: 0, duration: 4 },
          { id: '2', trackId: 'track1', position: 4, duration: 4 },
          { id: '3', trackId: 'track1', position: 8, duration: 4 },
        ],
      },
    });

    const patternsSection = screen.getByText(/CLIPS/i).parentElement;
    expect(patternsSection).toHaveTextContent('3');
  });

  it('should display track count', () => {
    renderWithStore(<HUD />, {
      tracks: {
        tracks: [
          { id: 'track1', name: 'Track 1' },
          { id: 'track2', name: 'Track 2' },
          { id: 'track3', name: 'Track 3' },
        ],
      },
    });

    expect(screen.getByText(/LANES/i)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('should display selection count', () => {
    renderWithStore(<HUD />, {
      selection: {
        selectedPatternIds: ['1', '2', '3'],
      },
    });

    expect(screen.getByText(/SELECTED/i)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('should display CRT status', () => {
    renderWithStore(<HUD />, {
      crtEffects: { enabled: true },
    });

    expect(screen.getByText(/CRT/i)).toBeInTheDocument();
    expect(screen.getByText(/ON/)).toBeInTheDocument();
  });

  it('should update when CRT is disabled', () => {
    renderWithStore(<HUD />, {
      crtEffects: { enabled: false },
    });

    expect(screen.getByText(/OFF/)).toBeInTheDocument();
  });

  it('should use ASCII box-drawing characters for borders', () => {
    renderWithStore(<HUD />);
    const hud = screen.getByTestId('hud');

    // Check that the component contains ASCII box-drawing characters
    expect(hud.textContent).toMatch(/[┌┐└┘│─]/);
  });

  it('should have phosphor-glow class for enhanced visual effects', () => {
    renderWithStore(<HUD />);
    const hud = screen.getByTestId('hud');

    expect(hud).toHaveClass('hud');
    expect(hud.querySelector('.hud__border')).toBeInTheDocument();
  });

  it('should format playhead position to 2 decimal places', () => {
    renderWithStore(<HUD />, {
      timeline: createTimelineState({ playheadPosition: 10.123456 }),
    });

    expect(screen.getByText(/10.12/)).toBeInTheDocument();
  });

  it('should handle zero playhead position', () => {
    renderWithStore(<HUD />, {
      timeline: createTimelineState({ playheadPosition: 0 }),
    });

    expect(screen.getByText(/1:1/)).toBeInTheDocument(); // Bar 1, beat 1
    expect(screen.getByText(/0.00/)).toBeInTheDocument();
  });

  it('should display different snap values correctly', () => {
    const { rerender } = renderWithStore(<HUD />, {
      timeline: createTimelineState({ snapValue: 0.25 }),
    });

    expect(screen.getByText(/1\/16/)).toBeInTheDocument();

    // Update snap value
    const store = createTestStore({
      timeline: createTimelineState({ snapValue: 4 }),
    });

    rerender(<Provider store={store}><HUD /></Provider>);
    expect(screen.getByText(/1 Bar/)).toBeInTheDocument();
  });
});
