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

    it('should render beat markers between bars', () => {
      render(<Ruler {...defaultProps} />);
      // Beat markers show quarter notes between bars
      const beatTicks = document.querySelectorAll('.ruler__beat-tick');
      // With 4 bars visible (16 beats), we should have multiple beat markers
      expect(beatTicks.length).toBeGreaterThan(0);
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

  describe('Beat Markers', () => {
    it('should render beat ticks between bars', () => {
      const viewport800: ViewportState = { ...defaultViewport, widthPx: 800 };
      render(<Ruler {...defaultProps} viewport={viewport800} />);
      // 800px / 100px per beat = 8 beats = 2 bars
      // Should have 6 beat ticks (excluding the 2 bar boundaries)
      const beatTicks = document.querySelectorAll('.ruler__beat-tick');
      expect(beatTicks.length).toBe(6);
    });

    it('should position beat markers correctly', () => {
      render(<Ruler {...defaultProps} />);
      // First beat tick should be at 100px (1 beat from start)
      const beatTicks = document.querySelectorAll('.ruler__beat-tick');
      expect(beatTicks[0]).toHaveStyle({ left: '100px' });
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

    it('should style beat markers differently from bar numbers', () => {
      render(<Ruler {...defaultProps} />);
      const beatTicks = document.querySelectorAll('.ruler__beat-tick');
      expect(beatTicks[0]).toHaveClass('ruler__beat-tick');
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

  describe('Visual Hierarchy', () => {
    it('should render bars (downbeats) with bar class', () => {
      render(<Ruler {...defaultProps} />);
      const barNumbers = document.querySelectorAll('.ruler__bar-number');
      expect(barNumbers.length).toBeGreaterThan(0);
      // Bar numbers should have the bar class
      expect(barNumbers[0]).toHaveClass('ruler__bar-number');
    });

    it('should render beats with beat class', () => {
      render(<Ruler {...defaultProps} />);
      const beatTicks = document.querySelectorAll('.ruler__beat-tick');
      // Should have beat ticks between bars
      expect(beatTicks.length).toBeGreaterThan(0);
    });

    it('should render sub-beats only at high zoom', () => {
      // At low zoom (50), sub-beats should not be visible
      const viewportLowZoom: ViewportState = { ...defaultViewport, zoom: 50 };
      const { rerender } = render(<Ruler {...defaultProps} viewport={viewportLowZoom} />);
      let subBeatTicks = document.querySelectorAll('.ruler__subbeat-tick');
      expect(subBeatTicks.length).toBe(0);

      // At high zoom (200), sub-beats should be visible
      const viewportHighZoom: ViewportState = { ...defaultViewport, zoom: 200 };
      rerender(<Ruler {...defaultProps} viewport={viewportHighZoom} />);
      subBeatTicks = document.querySelectorAll('.ruler__subbeat-tick');
      expect(subBeatTicks.length).toBeGreaterThan(0);
    });

    it('should show current snap grid with highlight class', () => {
      const propsWithSnap = { ...defaultProps, snapValue: 0.25 }; // 16th notes
      render(<Ruler {...propsWithSnap} />);
      // Should have highlighted snap grid markers
      const snapHighlights = document.querySelectorAll('.ruler__snap-highlight');
      // At least some markers should be highlighted
      expect(snapHighlights.length).toBeGreaterThan(0);
    });

    it('should position bar ticks at bar boundaries', () => {
      render(<Ruler {...defaultProps} />);
      // Bar 1 should be at 0px (start of timeline)
      const bar1 = screen.getByTestId('ruler-bar-1');
      expect(bar1).toHaveStyle({ left: '0px' });

      // Bar 2 should be at 400px (4 beats * 100px per beat)
      const bar2 = screen.getByTestId('ruler-bar-2');
      expect(bar2).toHaveStyle({ left: '400px' });
    });

    it('should position beat ticks between bars', () => {
      render(<Ruler {...defaultProps} />);
      const beatTicks = document.querySelectorAll('.ruler__beat-tick');
      // First beat tick should be at 100px (1 beat)
      expect(beatTicks[0]).toHaveStyle({ left: '100px' });
    });
  });
});
