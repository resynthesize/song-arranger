/**
 * Cyclone - CRTEffects Component Tests
 * Tests for CRT visual effects overlay
 */

import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import CRTEffects from './CRTEffects';

describe('CRTEffects', () => {
  describe('when effects are enabled', () => {
    it('should render the CRT effects container', () => {
      renderWithProviders(<CRTEffects />, {
        preloadedState: {
          crtEffects: { enabled: true },
        } as any,
      });

      const container = screen.getByTestId('crt-effects');
      expect(container).toBeInTheDocument();
    });

    it('should have crt-enabled class', () => {
      renderWithProviders(<CRTEffects />, {
        preloadedState: {
          crtEffects: { enabled: true },
        } as any,
      });

      const container = screen.getByTestId('crt-effects');
      expect(container).toHaveClass('crt-enabled');
    });

    it('should render scanline overlay', () => {
      renderWithProviders(<CRTEffects />, {
        preloadedState: {
          crtEffects: { enabled: true },
        } as any,
      });

      const scanlines = screen.getByTestId('crt-scanlines');
      expect(scanlines).toBeInTheDocument();
    });

    it('should render flicker overlay', () => {
      renderWithProviders(<CRTEffects />, {
        preloadedState: {
          crtEffects: { enabled: true },
        } as any,
      });

      const flicker = screen.getByTestId('crt-flicker');
      expect(flicker).toBeInTheDocument();
    });

    it('should render curvature overlay', () => {
      renderWithProviders(<CRTEffects />, {
        preloadedState: {
          crtEffects: { enabled: true },
        } as any,
      });

      const curvature = screen.getByTestId('crt-curvature');
      expect(curvature).toBeInTheDocument();
    });
  });

  describe('when effects are disabled', () => {
    it('should render the CRT effects container', () => {
      renderWithProviders(<CRTEffects />, {
        preloadedState: {
          crtEffects: { enabled: false },
        } as any,
      });

      const container = screen.getByTestId('crt-effects');
      expect(container).toBeInTheDocument();
    });

    it('should have crt-disabled class', () => {
      renderWithProviders(<CRTEffects />, {
        preloadedState: {
          crtEffects: { enabled: false },
        } as any,
      });

      const container = screen.getByTestId('crt-effects');
      expect(container).toHaveClass('crt-disabled');
    });

    it('should not have crt-enabled class', () => {
      renderWithProviders(<CRTEffects />, {
        preloadedState: {
          crtEffects: { enabled: false },
        } as any,
      });

      const container = screen.getByTestId('crt-effects');
      expect(container).not.toHaveClass('crt-enabled');
    });
  });

  describe('accessibility', () => {
    it('should have crt-effects class for pointer-events: none', () => {
      renderWithProviders(<CRTEffects />, {
        preloadedState: {
          crtEffects: { enabled: true },
        } as any,
      });

      const container = screen.getByTestId('crt-effects');
      expect(container).toHaveClass('crt-effects');
    });

    it('should be aria-hidden', () => {
      renderWithProviders(<CRTEffects />, {
        preloadedState: {
          crtEffects: { enabled: true },
        } as any,
      });

      const container = screen.getByTestId('crt-effects');
      expect(container).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
