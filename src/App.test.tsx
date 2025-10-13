/**
 * Song Arranger - App Component Tests
 * Tests for the main App component
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import timelineReducer from './store/slices/timelineSlice';
import lanesReducer from './store/slices/lanesSlice';
import clipsReducer from './store/slices/clipsSlice';
import selectionReducer from './store/slices/selectionSlice';
import crtEffectsReducer from './store/slices/crtEffectsSlice';
import projectReducer from './store/slices/projectSlice';
import quickInputReducer from './store/slices/quickInputSlice';
import commandPaletteReducer from './store/slices/commandPaletteSlice';

// Mock the storage util
jest.mock('./utils/storage', () => ({
  getTemplateProject: jest.fn(() => null),
}));

describe('App', () => {
  const createTestStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        timeline: timelineReducer,
        lanes: lanesReducer,
        clips: clipsReducer,
        selection: selectionReducer,
        crtEffects: crtEffectsReducer,
        project: projectReducer,
        quickInput: quickInputReducer,
        commandPalette: commandPaletteReducer,
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

  it('should have Add Lane button', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText('+ LANE')).toBeInTheDocument();
  });

  it('should show empty state when no lanes', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText(/No lanes yet/i)).toBeInTheDocument();
  });
});
