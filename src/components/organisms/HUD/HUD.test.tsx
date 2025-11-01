/**
 * Cyclone - HUD Component Tests
 * Terminal-styled information-dense heads-up display
 */

import { screen } from '@testing-library/react';
import HUD from './HUD';
import { renderWithProviders, createTestStore, createTestSongData } from '@/utils/testUtils';
import type { ViewportState, Pattern, Track } from '@/types';

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

describe('HUD', () => {
  it('should render without crashing', () => {
    renderWithProviders(<HUD />);
    expect(screen.getByTestId('hud')).toBeInTheDocument();
  });

  it('should display BPM value from timeline state', () => {
    renderWithProviders(<HUD />, {
      preloadedState: {
        timeline: createTimelineState({ tempo: 140 }),
      },
    });

    expect(screen.getByText(/140/)).toBeInTheDocument();
    expect(screen.getByText(/BPM/i)).toBeInTheDocument();
  });

  it('should display zoom level', () => {
    renderWithProviders(<HUD />, {
      preloadedState: {
        timeline: createTimelineState({ viewport: { ...defaultViewport, zoom: 200 } }),
      },
    });

    expect(screen.getByText(/ZOOM/i)).toBeInTheDocument();
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });

  it('should display snap value with musical notation', () => {
    renderWithProviders(<HUD />, {
      preloadedState: {
        timeline: createTimelineState({ snapValue: 1 }),
      },
    });

    expect(screen.getByText(/SNAP/i)).toBeInTheDocument();
    expect(screen.getByText(/1\/4/)).toBeInTheDocument();
  });

  it('should display playhead position in beats', () => {
    renderWithProviders(<HUD />, {
      preloadedState: {
        timeline: createTimelineState({ playheadPosition: 8.5 }),
      },
    });

    expect(screen.getByText(/TIME/i)).toBeInTheDocument();
    expect(screen.getByText(/8.50/)).toBeInTheDocument();
  });

  it('should display playhead position in bars:beats format', () => {
    renderWithProviders(<HUD />, {
      preloadedState: {
        timeline: createTimelineState({ playheadPosition: 8.5 }),
      },
    });

    // 8.5 beats = bar 3, beat 1 (zero-indexed: bar 2)
    expect(screen.getByText(/3:1/)).toBeInTheDocument();
  });

  it('should display pattern count', () => {
    const patterns: Pattern[] = [
      { id: '1', trackId: 'track-1', position: 0, duration: 4 },
      { id: '2', trackId: 'track-1', position: 4, duration: 4 },
      { id: '3', trackId: 'track-1', position: 8, duration: 4 },
    ];
    const songData = createTestSongData(patterns, 120);
    renderWithProviders(<HUD />, {
      preloadedState: {
        song: songData,
      },
    });

    const patternsSection = screen.getByText(/CLIPS/i).parentElement;
    expect(patternsSection).toHaveTextContent('3');
  });

  it('should display track count', () => {
    const patterns: Pattern[] = [
      { id: '1', trackId: 'track-1', position: 0, duration: 4 },
      { id: '2', trackId: 'track-2', position: 0, duration: 4 },
      { id: '3', trackId: 'track-3', position: 0, duration: 4 },
    ];
    const songData = createTestSongData(patterns, 120);
    renderWithProviders(<HUD />, {
      preloadedState: {
        song: songData,
      },
    });

    const lanesSection = screen.getByText(/LANES/i).parentElement;
    expect(lanesSection).toBeInTheDocument();
    expect(lanesSection).toHaveTextContent('3');
  });

  it('should display selection count', () => {
    renderWithProviders(<HUD />, {
      preloadedState: {
        selection: {
          selectedPatternIds: ['1', '2', '3'],
        },
      },
    });

    expect(screen.getByText(/SELECTED/i)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('should display CRT status', () => {
    renderWithProviders(<HUD />, {
      preloadedState: {
        crtEffects: { enabled: true },
      },
    });

    expect(screen.getByText(/CRT/i)).toBeInTheDocument();
    expect(screen.getByText(/ON/)).toBeInTheDocument();
  });

  it('should update when CRT is disabled', () => {
    renderWithProviders(<HUD />, {
      preloadedState: {
        crtEffects: { enabled: false },
      },
    });

    expect(screen.getByText(/OFF/)).toBeInTheDocument();
  });

  it('should use ASCII box-drawing characters for borders', () => {
    renderWithProviders(<HUD />);
    const hud = screen.getByTestId('hud');

    // Check that the component contains ASCII box-drawing characters
    expect(hud.textContent).toMatch(/[┌┐└┘│─]/);
  });

  it('should have phosphor-glow class for enhanced visual effects', () => {
    renderWithProviders(<HUD />);
    const hud = screen.getByTestId('hud');

    expect(hud).toHaveClass('hud');
    expect(hud.querySelector('.hud__border')).toBeInTheDocument();
  });

  it('should format playhead position to 2 decimal places', () => {
    renderWithProviders(<HUD />, {
      preloadedState: {
        timeline: createTimelineState({ playheadPosition: 10.123456 }),
      },
    });

    expect(screen.getByText(/10.12/)).toBeInTheDocument();
  });

  it('should handle zero playhead position', () => {
    renderWithProviders(<HUD />, {
      preloadedState: {
        timeline: createTimelineState({ playheadPosition: 0 }),
      },
    });

    expect(screen.getByText(/1:1/)).toBeInTheDocument(); // Bar 1, beat 1
    expect(screen.getByText(/0.00/)).toBeInTheDocument();
  });

  it('should display different snap values correctly', () => {
    const { rerender, store } = renderWithProviders(<HUD />, {
      preloadedState: {
        timeline: createTimelineState({ snapValue: 0.25 }),
      },
    });

    expect(screen.getByText(/1\/16/)).toBeInTheDocument();

    // Update snap value
    const newStore = createTestStore({
      timeline: createTimelineState({ snapValue: 4 }),
    });

    // Create new render with updated store
    renderWithProviders(<HUD />, {
      store: newStore,
    });
    expect(screen.getByText(/1 Bar/)).toBeInTheDocument();
  });
});
