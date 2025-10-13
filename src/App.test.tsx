/**
 * Song Arranger - App Component Tests
 * Tests for the main App component
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import timelineReducer from './store/slices/timelineSlice';
import tracksReducer from './store/slices/tracksSlice';
import patternsReducer from './store/slices/patternsSlice';
import selectionReducer from './store/slices/selectionSlice';
import crtEffectsReducer from './store/slices/crtEffectsSlice';
import projectReducer from './store/slices/projectSlice';
import quickInputReducer from './store/slices/quickInputSlice';
import commandPaletteReducer from './store/slices/commandPaletteSlice';
import statusReducer from './store/slices/statusSlice';

// Mock the storage util
jest.mock('./utils/storage', () => ({
  getTemplateProject: jest.fn(() => null),
}));

describe('App', () => {
  const createTestStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        timeline: timelineReducer,
        tracks: tracksReducer,
        patterns: patternsReducer,
        selection: selectionReducer,
        crtEffects: crtEffectsReducer,
        project: projectReducer,
        quickInput: quickInputReducer,
        commandPalette: commandPaletteReducer,
        status: statusReducer,
      },
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    // Skip boot sequence for tests
    localStorage.setItem('skipBootSequence', 'true');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render app with menu bar', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByTestId('menu-bar')).toBeInTheDocument();
  });

  it('should render timeline', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('should display default tempo', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByDisplayValue('120')).toBeInTheDocument(); // Default tempo
  });

  it('should have Add Track button', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText('+ TRACK')).toBeInTheDocument();
  });

  it('should show empty state when no tracks', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText(/No tracks yet/i)).toBeInTheDocument();
  });
});
