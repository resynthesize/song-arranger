/**
 * Song Arranger - Ruler Component Tests
 * Tests for the bar/beat ruler above the timeline
 */

import { render, screen } from '@testing-library/react';
import Ruler from './Ruler';
import type { ViewportState } from '@/types';

describe('Ruler', () => {
  const defaultViewport: ViewportState = {
    offsetBeats: 0, // Not scrolled
    zoom: 100, // 100 pixels per beat
    widthPx: 1600, // Width of timeline container
    heightPx: 600,
  };

  const defaultProps = {
    viewport: defaultViewport,
    snapValue: 1,
  };

  describe('Rendering', () => {
    it('should render the ruler component', () => {
      render(<Ruler {...defaultProps} />);
      expect(screen.getByTestId('ruler')).toBeInTheDocument();
    });

    it('should render bar numbers', () => {
      render(<Ruler {...defaultProps} />);
      // With 1600px width and 100px per beat, we have 16 beats = 4 bars
      // Should show bars 1, 2, 3, 4
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should render grid markers between bars', () => {
      render(<Ruler {...defaultProps} />);
      // Grid markers are always 4 divisions between consecutive bar numbers
      // With barInterval = 1 (every bar), we should have 4 grid markers per bar
      const gridMarkers = document.querySelectorAll('.ruler__grid-tick');
      // With 4 bars visible, expect multiple grid markers
      expect(gridMarkers.length).toBeGreaterThan(0);
    });
  });

  describe('Zoom Scaling', () => {
    it('should scale bar positions with zoom level', () => {
      const viewport50: ViewportState = { ...defaultViewport, zoom: 50 };
      const { rerender } = render(<Ruler {...defaultProps} viewport={viewport50} />);
      // At 50px per beat, bar 1 should be at 0px, bar 2 at 200px
      const bar1 = screen.getByTestId('ruler-bar-1');
      expect(bar1).toHaveStyle({ left: '0px' });

      // Re-render with different zoom
      const viewport200: ViewportState = { ...defaultViewport, zoom: 200 };
      rerender(<Ruler {...defaultProps} viewport={viewport200} />);
      // At 200px per beat, bar 1 should still be at 0px (bars are numbered starting at 1, not 0)
      const bar1Updated = screen.getByTestId('ruler-bar-1');
      expect(bar1Updated).toHaveStyle({ left: '0px' });
    });

    it('should show more bars when zoomed in', () => {
      const viewport50: ViewportState = { ...defaultViewport, zoom: 50 };
      const { rerender } = render(<Ruler {...defaultProps} viewport={viewport50} />);
      // At 50px per beat, with 1600px width: 1600/50 = 32 beats = 8 bars
      const barsZoomedOut = screen.getAllByTestId(/^ruler-bar-/);
      expect(barsZoomedOut.length).toBeGreaterThanOrEqual(8);

      // At 200px per beat, with 1600px width: 1600/200 = 8 beats = 2 bars
      const viewport200: ViewportState = { ...defaultViewport, zoom: 200 };
      rerender(<Ruler {...defaultProps} viewport={viewport200} />);
      const barsZoomedIn = screen.getAllByTestId(/^ruler-bar-/);
      expect(barsZoomedIn.length).toBeLessThan(barsZoomedOut.length);
    });
  });

  describe('Bar Numbering', () => {
    it('should start bar numbering at 1', () => {
      render(<Ruler {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should not show bar 0', () => {
      render(<Ruler {...defaultProps} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should show sequential bar numbers', () => {
      const viewport2000: ViewportState = { ...defaultViewport, widthPx: 2000 };
      render(<Ruler {...defaultProps} viewport={viewport2000} />);
      // With more width, should show more bars
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Grid Markers', () => {
    it('should render 4 grid divisions between bar numbers', () => {
      const viewport800: ViewportState = { ...defaultViewport, widthPx: 800 };
      render(<Ruler {...defaultProps} viewport={viewport800} />);
      // 800px / 100px per beat = 8 beats = 2 bars
      // With barInterval = 1, there should be 4 grid markers per bar (excluding bar numbers)
      const gridMarkers = document.querySelectorAll('.ruler__grid-tick');
      // With 2 bars visible, expect at least 4 grid markers
      expect(gridMarkers.length).toBeGreaterThanOrEqual(4);
    });

    it('should position grid markers correctly', () => {
      render(<Ruler {...defaultProps} />);
      // With barInterval = 1 (every bar), grid interval is 1 beat
      // First grid marker should be at 100px (1 beat)
      const gridMarkers = document.querySelectorAll('.ruler__grid-tick');
      expect(gridMarkers[0]).toHaveStyle({ left: '100px' });
    });
  });

  describe('Styling', () => {
    it('should have terminal aesthetic styling', () => {
      render(<Ruler {...defaultProps} />);
      const ruler = screen.getByTestId('ruler');
      expect(ruler).toHaveClass('ruler');
    });

    it('should style bar numbers with primary color', () => {
      render(<Ruler {...defaultProps} />);
      const barNumber = screen.getByTestId('ruler-bar-1');
      expect(barNumber).toHaveClass('ruler__bar-number');
    });

    it('should style grid markers differently from bar numbers', () => {
      render(<Ruler {...defaultProps} />);
      const gridMarkers = document.querySelectorAll('.ruler__grid-tick');
      expect(gridMarkers[0]).toHaveClass('ruler__grid-tick');
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA labels', () => {
      render(<Ruler {...defaultProps} />);
      const ruler = screen.getByTestId('ruler');
      expect(ruler).toHaveAttribute('role', 'none'); // Purely visual element
    });

    it('should be keyboard accessible if interactive', () => {
      // If we add click functionality later, this test will be expanded
      render(<Ruler {...defaultProps} />);
      const ruler = screen.getByTestId('ruler');
      expect(ruler).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small zoom levels', () => {
      const viewport10: ViewportState = { ...defaultViewport, zoom: 10 };
      render(<Ruler {...defaultProps} viewport={viewport10} />);
      // Should still render without crashing
      expect(screen.getByTestId('ruler')).toBeInTheDocument();
    });

    it('should handle very large zoom levels', () => {
      const viewport400: ViewportState = { ...defaultViewport, zoom: 400 };
      render(<Ruler {...defaultProps} viewport={viewport400} />);
      // Should still render without crashing
      expect(screen.getByTestId('ruler')).toBeInTheDocument();
    });

    it('should handle zero container width gracefully', () => {
      const viewport0: ViewportState = { ...defaultViewport, widthPx: 0 };
      render(<Ruler {...defaultProps} viewport={viewport0} />);
      // Should render but show no bars
      expect(screen.getByTestId('ruler')).toBeInTheDocument();
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('should handle very wide containers', () => {
      const viewport10000: ViewportState = { ...defaultViewport, widthPx: 10000 };
      render(<Ruler {...defaultProps} viewport={viewport10000} />);
      // Should render many bars
      const bars = screen.getAllByTestId(/^ruler-bar-/);
      expect(bars.length).toBeGreaterThan(10);
    });
  });
});
