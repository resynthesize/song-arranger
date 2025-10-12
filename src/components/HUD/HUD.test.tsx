/**
 * Song Arranger - HUD Component Tests
 * Terminal-styled information-dense heads-up display
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import HUD from './HUD';
import timelineReducer from '@/store/slices/timelineSlice';
import lanesReducer from '@/store/slices/lanesSlice';
import selectionReducer from '@/store/slices/selectionSlice';
import clipsReducer from '@/store/slices/clipsSlice';
import crtEffectsReducer from '@/store/slices/crtEffectsSlice';

// Helper to create a test store with initial state
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      timeline: timelineReducer,
      lanes: lanesReducer,
      selection: selectionReducer,
      clips: clipsReducer,
      crtEffects: crtEffectsReducer,
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
      timeline: { tempo: 140, zoom: 100, playheadPosition: 0, isPlaying: false, snapValue: 1 },
    });

    expect(screen.getByText(/140/)).toBeInTheDocument();
    expect(screen.getByText(/BPM/i)).toBeInTheDocument();
  });

  it('should display zoom level', () => {
    renderWithStore(<HUD />, {
      timeline: { tempo: 120, zoom: 200, playheadPosition: 0, isPlaying: false, snapValue: 1 },
    });

    expect(screen.getByText(/ZOOM/i)).toBeInTheDocument();
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });

  it('should display snap value with musical notation', () => {
    renderWithStore(<HUD />, {
      timeline: { tempo: 120, zoom: 100, playheadPosition: 0, isPlaying: false, snapValue: 1 },
    });

    expect(screen.getByText(/SNAP/i)).toBeInTheDocument();
    expect(screen.getByText(/1\/4/)).toBeInTheDocument();
  });

  it('should display playhead position in beats', () => {
    renderWithStore(<HUD />, {
      timeline: { tempo: 120, zoom: 100, playheadPosition: 8.5, isPlaying: false, snapValue: 1 },
    });

    expect(screen.getByText(/TIME/i)).toBeInTheDocument();
    expect(screen.getByText(/8.50/)).toBeInTheDocument();
  });

  it('should display playhead position in bars:beats format', () => {
    renderWithStore(<HUD />, {
      timeline: { tempo: 120, zoom: 100, playheadPosition: 8.5, isPlaying: false, snapValue: 1 },
    });

    // 8.5 beats = bar 3, beat 1 (zero-indexed: bar 2)
    expect(screen.getByText(/3:1/)).toBeInTheDocument();
  });

  it('should display clip count', () => {
    renderWithStore(<HUD />, {
      clips: {
        clips: [
          { id: '1', laneId: 'lane1', position: 0, duration: 4 },
          { id: '2', laneId: 'lane1', position: 4, duration: 4 },
          { id: '3', laneId: 'lane1', position: 8, duration: 4 },
        ],
      },
    });

    const clipsSection = screen.getByText(/CLIPS/i).parentElement;
    expect(clipsSection).toHaveTextContent('3');
  });

  it('should display lane count', () => {
    renderWithStore(<HUD />, {
      lanes: {
        lanes: [
          { id: 'lane1', name: 'Lane 1' },
          { id: 'lane2', name: 'Lane 2' },
          { id: 'lane3', name: 'Lane 3' },
        ],
      },
    });

    expect(screen.getByText(/LANES/i)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('should display selection count', () => {
    renderWithStore(<HUD />, {
      selection: {
        selectedClipIds: ['1', '2', '3'],
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
      timeline: { tempo: 120, zoom: 100, playheadPosition: 10.123456, isPlaying: false, snapValue: 1 },
    });

    expect(screen.getByText(/10.12/)).toBeInTheDocument();
  });

  it('should handle zero playhead position', () => {
    renderWithStore(<HUD />, {
      timeline: { tempo: 120, zoom: 100, playheadPosition: 0, isPlaying: false, snapValue: 1 },
    });

    expect(screen.getByText(/1:1/)).toBeInTheDocument(); // Bar 1, beat 1
    expect(screen.getByText(/0.00/)).toBeInTheDocument();
  });

  it('should display different snap values correctly', () => {
    const { rerender } = renderWithStore(<HUD />, {
      timeline: { tempo: 120, zoom: 100, playheadPosition: 0, isPlaying: false, snapValue: 0.25 },
    });

    expect(screen.getByText(/1\/16/)).toBeInTheDocument();

    // Update snap value
    const store = createTestStore({
      timeline: { tempo: 120, zoom: 100, playheadPosition: 0, isPlaying: false, snapValue: 4 },
    });

    rerender(<Provider store={store}><HUD /></Provider>);
    expect(screen.getByText(/1 Bar/)).toBeInTheDocument();
  });
});
