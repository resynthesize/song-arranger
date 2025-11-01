/**
 * Cyclone - ModernEffects Component Tests
 * Tests for modern visual effects overlay
 */

import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ModernEffects from './ModernEffects';

describe('ModernEffects', () => {
  describe('when modern theme is enabled', () => {
    it('should render the modern effects container', () => {
      renderWithProviders(<ModernEffects />, {
        preloadedState: {
          theme: { current: 'modern' },
        } as any,
      });

      const container = screen.getByTestId('modern-effects');
      expect(container).toBeInTheDocument();
    });

    it('should render ambient gradient overlay', () => {
      renderWithProviders(<ModernEffects />, {
        preloadedState: {
          theme: { current: 'modern' },
        } as any,
      });

      const gradient = screen.getByTestId('modern-ambient-gradient');
      expect(gradient).toBeInTheDocument();
    });

    it('should render glassmorphism layer', () => {
      renderWithProviders(<ModernEffects />, {
        preloadedState: {
          theme: { current: 'modern' },
        } as any,
      });

      const glassLayer = screen.getByTestId('modern-glass-layer');
      expect(glassLayer).toBeInTheDocument();
    });

    it('should render particles', () => {
      renderWithProviders(<ModernEffects />, {
        preloadedState: {
          theme: { current: 'modern' },
        } as any,
      });

      const particles = screen.getByTestId('modern-particles');
      expect(particles).toBeInTheDocument();
    });

    it('should render ambient glow', () => {
      renderWithProviders(<ModernEffects />, {
        preloadedState: {
          theme: { current: 'modern' },
        } as any,
      });

      const glow = screen.getByTestId('modern-ambient-glow');
      expect(glow).toBeInTheDocument();
    });

    it('should render vignette', () => {
      renderWithProviders(<ModernEffects />, {
        preloadedState: {
          theme: { current: 'modern' },
        } as any,
      });

      const vignette = screen.getByTestId('modern-vignette');
      expect(vignette).toBeInTheDocument();
    });
  });

  describe('when retro theme is enabled', () => {
    it('should not render when theme is retro', () => {
      renderWithProviders(<ModernEffects />, {
        preloadedState: {
          theme: { current: 'retro' },
        } as any,
      });

      const container = screen.queryByTestId('modern-effects');
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be aria-hidden', () => {
      renderWithProviders(<ModernEffects />, {
        preloadedState: {
          theme: { current: 'modern' },
        } as any,
      });

      const container = screen.getByTestId('modern-effects');
      expect(container).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have pointer-events: none via CSS class', () => {
      renderWithProviders(<ModernEffects />, {
        preloadedState: {
          theme: { current: 'modern' },
        } as any,
      });

      const container = screen.getByTestId('modern-effects');
      expect(container).toHaveClass('modern-effects');
    });
  });
});
