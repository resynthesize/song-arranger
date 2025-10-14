/**
 * Song Arranger - CRTEffects Component Tests
 * Tests for CRT visual effects overlay
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CRTEffects from './CRTEffects';
import crtEffectsReducer from '@/store/slices/crtEffectsSlice';
import themeReducer from '@/store/slices/themeSlice';

// Helper to create a test store
const createTestStore = (enabled: boolean) => {
  return configureStore({
    reducer: {
      crtEffects: crtEffectsReducer,
      theme: themeReducer,
    },
    preloadedState: {
      crtEffects: { enabled },
    },
  });
};

describe('CRTEffects', () => {
  describe('when effects are enabled', () => {
    it('should render the CRT effects container', () => {
      const store = createTestStore(true);
      render(
        <Provider store={store}>
          <CRTEffects />
        </Provider>
      );

      const container = screen.getByTestId('crt-effects');
      expect(container).toBeInTheDocument();
    });

    it('should have crt-enabled class', () => {
      const store = createTestStore(true);
      render(
        <Provider store={store}>
          <CRTEffects />
        </Provider>
      );

      const container = screen.getByTestId('crt-effects');
      expect(container).toHaveClass('crt-enabled');
    });

    it('should render scanline overlay', () => {
      const store = createTestStore(true);
      render(
        <Provider store={store}>
          <CRTEffects />
        </Provider>
      );

      const scanlines = screen.getByTestId('crt-scanlines');
      expect(scanlines).toBeInTheDocument();
    });

    it('should render flicker overlay', () => {
      const store = createTestStore(true);
      render(
        <Provider store={store}>
          <CRTEffects />
        </Provider>
      );

      const flicker = screen.getByTestId('crt-flicker');
      expect(flicker).toBeInTheDocument();
    });

    it('should render curvature overlay', () => {
      const store = createTestStore(true);
      render(
        <Provider store={store}>
          <CRTEffects />
        </Provider>
      );

      const curvature = screen.getByTestId('crt-curvature');
      expect(curvature).toBeInTheDocument();
    });
  });

  describe('when effects are disabled', () => {
    it('should render the CRT effects container', () => {
      const store = createTestStore(false);
      render(
        <Provider store={store}>
          <CRTEffects />
        </Provider>
      );

      const container = screen.getByTestId('crt-effects');
      expect(container).toBeInTheDocument();
    });

    it('should have crt-disabled class', () => {
      const store = createTestStore(false);
      render(
        <Provider store={store}>
          <CRTEffects />
        </Provider>
      );

      const container = screen.getByTestId('crt-effects');
      expect(container).toHaveClass('crt-disabled');
    });

    it('should not have crt-enabled class', () => {
      const store = createTestStore(false);
      render(
        <Provider store={store}>
          <CRTEffects />
        </Provider>
      );

      const container = screen.getByTestId('crt-effects');
      expect(container).not.toHaveClass('crt-enabled');
    });
  });

  describe('accessibility', () => {
    it('should have crt-effects class for pointer-events: none', () => {
      const store = createTestStore(true);
      render(
        <Provider store={store}>
          <CRTEffects />
        </Provider>
      );

      const container = screen.getByTestId('crt-effects');
      expect(container).toHaveClass('crt-effects');
    });

    it('should be aria-hidden', () => {
      const store = createTestStore(true);
      render(
        <Provider store={store}>
          <CRTEffects />
        </Provider>
      );

      const container = screen.getByTestId('crt-effects');
      expect(container).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
