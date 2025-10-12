/**
 * Song Arranger - App Component Tests
 * Tests for the main App component
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import timelineReducer from './store/slices/timelineSlice';

describe('App', () => {
  const createTestStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        timeline: timelineReducer,
      },
      preloadedState: initialState,
    });
  };

  it('should render app title', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText('SONG ARRANGER')).toBeInTheDocument();
  });

  it('should display current zoom level', () => {
    const store = createTestStore({
      timeline: {
        zoom: 150,
        playheadPosition: 0,
        isPlaying: false,
      },
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText(/ZOOM: 150px\/beat/i)).toBeInTheDocument();
  });

  it('should display stopped status when not playing', () => {
    const store = createTestStore({
      timeline: {
        zoom: 100,
        playheadPosition: 0,
        isPlaying: false,
      },
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText(/STATUS: STOPPED/i)).toBeInTheDocument();
  });

  it('should display playing status when playing', () => {
    const store = createTestStore({
      timeline: {
        zoom: 100,
        playheadPosition: 0,
        isPlaying: true,
      },
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText(/STATUS: PLAYING/i)).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText(/SYSTEM INITIALIZED/i)).toBeInTheDocument();
    expect(screen.getByText(/READY FOR ARRANGEMENT/i)).toBeInTheDocument();
  });
});
