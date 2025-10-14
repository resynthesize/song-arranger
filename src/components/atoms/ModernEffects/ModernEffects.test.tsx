/**
 * Cyclone - ModernEffects Component Tests
 * Tests for modern visual effects overlay
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ModernEffects from './ModernEffects';
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

// Helper to create a test store
const createTestStore = (theme: 'modern' | 'retro') => {
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
      theme: { current: theme },
    },
  });
};

describe('ModernEffects', () => {
  describe('when modern theme is enabled', () => {
    it('should render the modern effects container', () => {
      const store = createTestStore('modern');
      render(
        <Provider store={store}>
          <ModernEffects />
        </Provider>
      );

      const container = screen.getByTestId('modern-effects');
      expect(container).toBeInTheDocument();
    });

    it('should render ambient gradient overlay', () => {
      const store = createTestStore('modern');
      render(
        <Provider store={store}>
          <ModernEffects />
        </Provider>
      );

      const gradient = screen.getByTestId('modern-ambient-gradient');
      expect(gradient).toBeInTheDocument();
    });

    it('should render glassmorphism layer', () => {
      const store = createTestStore('modern');
      render(
        <Provider store={store}>
          <ModernEffects />
        </Provider>
      );

      const glassLayer = screen.getByTestId('modern-glass-layer');
      expect(glassLayer).toBeInTheDocument();
    });

    it('should render particles', () => {
      const store = createTestStore('modern');
      render(
        <Provider store={store}>
          <ModernEffects />
        </Provider>
      );

      const particles = screen.getByTestId('modern-particles');
      expect(particles).toBeInTheDocument();
    });

    it('should render ambient glow', () => {
      const store = createTestStore('modern');
      render(
        <Provider store={store}>
          <ModernEffects />
        </Provider>
      );

      const glow = screen.getByTestId('modern-ambient-glow');
      expect(glow).toBeInTheDocument();
    });

    it('should render vignette', () => {
      const store = createTestStore('modern');
      render(
        <Provider store={store}>
          <ModernEffects />
        </Provider>
      );

      const vignette = screen.getByTestId('modern-vignette');
      expect(vignette).toBeInTheDocument();
    });
  });

  describe('when retro theme is enabled', () => {
    it('should not render when theme is retro', () => {
      const store = createTestStore('retro');
      render(
        <Provider store={store}>
          <ModernEffects />
        </Provider>
      );

      const container = screen.queryByTestId('modern-effects');
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be aria-hidden', () => {
      const store = createTestStore('modern');
      render(
        <Provider store={store}>
          <ModernEffects />
        </Provider>
      );

      const container = screen.getByTestId('modern-effects');
      expect(container).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have pointer-events: none via CSS class', () => {
      const store = createTestStore('modern');
      render(
        <Provider store={store}>
          <ModernEffects />
        </Provider>
      );

      const container = screen.getByTestId('modern-effects');
      expect(container).toHaveClass('modern-effects');
    });
  });
});
