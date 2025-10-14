/**
 * Song Arranger - Pattern Color Tests
 * Tests to verify pattern colors work correctly, especially white colors
 */

import { render, screen } from '@testing-library/react';
import Pattern from './Pattern';
import type { ViewportState } from '@/types';

describe('Pattern - Color Handling', () => {
  const mockViewport: ViewportState = {
    offsetBeats: 0,
    zoom: 100,
    widthPx: 1000,
    heightPx: 800,
  };

  const baseProps = {
    id: 'pattern-1',
    trackId: 'track-1',
    position: 0,
    duration: 4,
    viewport: mockViewport,
    snapValue: 1,
    isSelected: false,
    onSelect: jest.fn(),
    onMove: jest.fn(),
    onResize: jest.fn(),
  };

  it('should apply white color to pattern', () => {
    render(<Pattern {...baseProps} color="#ffffff" />);

    const pattern = screen.getByTestId('pattern-pattern-1');

    // Check that the CSS variable is set
    expect(pattern).toHaveStyle({ '--pattern-color': '#ffffff' });
  });

  it('should apply green color to pattern', () => {
    render(<Pattern {...baseProps} color="#00ff00" />);

    const pattern = screen.getByTestId('pattern-pattern-1');

    // Check that the CSS variable is set
    expect(pattern).toHaveStyle({ '--pattern-color': '#00ff00' });
  });

  it('should not set CSS variable when color is undefined', () => {
    render(<Pattern {...baseProps} color={undefined} />);

    const pattern = screen.getByTestId('pattern-pattern-1');

    // When color is undefined, the CSS variable should not be set
    // The pattern will fall back to CSS default (var(--color-secondary))
    const style = pattern.getAttribute('style');
    expect(style).not.toContain('--pattern-color');
  });

  it('should handle color change from green to white', () => {
    const { rerender } = render(<Pattern {...baseProps} color="#00ff00" />);

    let pattern = screen.getByTestId('pattern-pattern-1');
    expect(pattern).toHaveStyle({ '--pattern-color': '#00ff00' });

    // Change color to white
    rerender(<Pattern {...baseProps} color="#ffffff" />);

    pattern = screen.getByTestId('pattern-pattern-1');
    expect(pattern).toHaveStyle({ '--pattern-color': '#ffffff' });
  });

  it('should handle color change from undefined to white', () => {
    const { rerender } = render(<Pattern {...baseProps} color={undefined} />);

    let pattern = screen.getByTestId('pattern-pattern-1');
    let style = pattern.getAttribute('style');
    expect(style).not.toContain('--pattern-color');

    // Change color to white
    rerender(<Pattern {...baseProps} color="#ffffff" />);

    pattern = screen.getByTestId('pattern-pattern-1');
    expect(pattern).toHaveStyle({ '--pattern-color': '#ffffff' });
  });
});
