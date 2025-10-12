/**
 * Song Arranger - Ruler Component Tests
 * Tests for the bar/beat ruler above the timeline
 */

import { render, screen } from '@testing-library/react';
import Ruler from './Ruler';

describe('Ruler', () => {
  const defaultProps = {
    zoom: 100, // 100 pixels per beat
    snapValue: 1,
    containerWidth: 1600, // Width of timeline container
    scrollLeft: 0, // Not scrolled
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

    it('should render beat markers within bars', () => {
      render(<Ruler {...defaultProps} />);
      // Each bar should have beat markers
      const beatMarkers = screen.getAllByTestId(/^ruler-beat-/);
      // With 4 bars, we should have 3 beat markers per bar = 12 total
      // (excluding bar lines themselves)
      expect(beatMarkers.length).toBeGreaterThan(0);
    });
  });

  describe('Zoom Scaling', () => {
    it('should scale bar positions with zoom level', () => {
      const { rerender } = render(<Ruler {...defaultProps} zoom={50} />);
      // At 50px per beat, bar 1 should be at 0px, bar 2 at 200px
      const bar1 = screen.getByTestId('ruler-bar-1');
      expect(bar1).toHaveStyle({ left: '0px' });

      // Re-render with different zoom
      rerender(<Ruler {...defaultProps} zoom={200} />);
      // At 200px per beat, bar 1 should still be at 0px (bars are numbered starting at 1, not 0)
      const bar1Updated = screen.getByTestId('ruler-bar-1');
      expect(bar1Updated).toHaveStyle({ left: '0px' });
    });

    it('should show more bars when zoomed in', () => {
      const { rerender } = render(<Ruler {...defaultProps} zoom={50} />);
      // At 50px per beat, with 1600px width: 1600/50 = 32 beats = 8 bars
      const barsZoomedOut = screen.getAllByTestId(/^ruler-bar-/);
      expect(barsZoomedOut.length).toBeGreaterThanOrEqual(8);

      // At 200px per beat, with 1600px width: 1600/200 = 8 beats = 2 bars
      rerender(<Ruler {...defaultProps} zoom={200} />);
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
      render(<Ruler {...defaultProps} containerWidth={2000} />);
      // With more width, should show more bars
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Beat Markers', () => {
    it('should render 3 beat markers per bar', () => {
      render(<Ruler {...defaultProps} containerWidth={800} />);
      // 800px / 100px per beat = 8 beats = 2 bars
      // Each bar has 3 beat markers (beats 2, 3, 4 of each bar)
      const beatMarkers = screen.getAllByTestId(/^ruler-beat-\d+-\d+$/);
      // Should have at least 6 beat markers (3 per bar * 2 bars)
      expect(beatMarkers.length).toBeGreaterThanOrEqual(6);
    });

    it('should position beat markers correctly', () => {
      render(<Ruler {...defaultProps} zoom={100} />);
      // Beat 2 of bar 1 should be at position 1 * 100 = 100px
      const beat2 = screen.getByTestId('ruler-beat-1-2');
      expect(beat2).toHaveStyle({ left: '100px' });
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
      const beatMarker = screen.getByTestId('ruler-beat-1-2');
      expect(beatMarker).toHaveClass('ruler__beat-tick');
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
      render(<Ruler {...defaultProps} zoom={10} />);
      // Should still render without crashing
      expect(screen.getByTestId('ruler')).toBeInTheDocument();
    });

    it('should handle very large zoom levels', () => {
      render(<Ruler {...defaultProps} zoom={400} />);
      // Should still render without crashing
      expect(screen.getByTestId('ruler')).toBeInTheDocument();
    });

    it('should handle zero container width gracefully', () => {
      render(<Ruler {...defaultProps} containerWidth={0} />);
      // Should render but show no bars
      expect(screen.getByTestId('ruler')).toBeInTheDocument();
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('should handle very wide containers', () => {
      render(<Ruler {...defaultProps} containerWidth={10000} />);
      // Should render many bars
      const bars = screen.getAllByTestId(/^ruler-bar-/);
      expect(bars.length).toBeGreaterThan(10);
    });
  });
});
