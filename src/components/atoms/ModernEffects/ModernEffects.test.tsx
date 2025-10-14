/**
 * Song Arranger - ModernEffects Component Tests
 * Tests for modern visual effects overlay
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ModernEffects from './ModernEffects';
import themeReducer from '@/store/slices/themeSlice';

// Helper to create a test store
const createTestStore = (theme: 'modern' | 'retro') => {
  return configureStore({
    reducer: {
      theme: themeReducer,
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
