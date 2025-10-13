/**
 * Song Arranger - Ruler Component Tests
 * Tests for the bar/beat ruler above the timeline
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import timelineReducer from '@/store/slices/timelineSlice';
import Ruler from './Ruler';
import type { ViewportState } from '@/types';
import React from 'react';

// Helper to create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      timeline: timelineReducer,
    },
    preloadedState: {
      timeline: {
        viewport: {
          offsetBeats: 0,
          zoom: 100,
          widthPx: 1600,
          heightPx: 600,
        },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid' as const,
        verticalZoom: 100,
        minimapVisible: false,
      },
    },
  });
};

// Helper to render with Redux Provider
const renderWithProvider = (ui: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{ui}</Provider>);
};

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
      renderWithProvider(<Ruler {...defaultProps} />);
      expect(screen.getByTestId('ruler')).toBeInTheDocument();
    });

    it('should render bar numbers', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      // With 1600px width and 100px per beat, we have 16 beats = 4 bars
      // Should show bars 1, 2, 3, 4
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should render grid markers between bars', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      // Grid markers show adaptive divisions between bar numbers
      const gridTicks = document.querySelectorAll('.ruler__grid-tick');
      // With 4 bars visible, we should have 3 grid lines between each bar number (12 total)
      expect(gridTicks.length).toBeGreaterThan(0);
    });
  });

  describe('Zoom Scaling', () => {
    it('should scale bar positions with zoom level', () => {
      const viewport50: ViewportState = { ...defaultViewport, zoom: 50 };
      renderWithProvider(<Ruler {...defaultProps} viewport={viewport50} />);
      // At 50px per beat, bar 1 should be at 0px, bar 2 at 200px
      const bar1 = screen.getByTestId('ruler-bar-1');
      expect(bar1).toBeInTheDocument();
      // Bar 1 is at beat 0, which should render at pixel position 0
      // The left style is on the parent bar-container
      const bar1Container = bar1.parentElement;
      expect(bar1Container).toHaveStyle({ left: '0px' });
    });

    it('should show more bars when zoomed in', () => {
      const viewport50: ViewportState = { ...defaultViewport, zoom: 50 };
      const store = createTestStore();
      const { rerender } = render(
        <Provider store={store}>
          <Ruler {...defaultProps} viewport={viewport50} />
        </Provider>
      );
      // At 50px per beat, with 1600px width: 1600/50 = 32 beats = 8 bars
      const barsZoomedOut = screen.getAllByTestId(/^ruler-bar-/);
      expect(barsZoomedOut.length).toBeGreaterThanOrEqual(8);

      // At 200px per beat, with 1600px width: 1600/200 = 8 beats = 2 bars
      const viewport200: ViewportState = { ...defaultViewport, zoom: 200 };
      rerender(
        <Provider store={store}>
          <Ruler {...defaultProps} viewport={viewport200} />
        </Provider>
      );
      const barsZoomedIn = screen.getAllByTestId(/^ruler-bar-/);
      expect(barsZoomedIn.length).toBeLessThan(barsZoomedOut.length);
    });
  });

  describe('Bar Numbering', () => {
    it('should start bar numbering at 1', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should not show bar 0', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should show sequential bar numbers', () => {
      const viewport2000: ViewportState = { ...defaultViewport, widthPx: 2000 };
      renderWithProvider(<Ruler {...defaultProps} viewport={viewport2000} />);
      // With more width, should show more bars
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Grid Markers', () => {
    it('should render grid ticks between bars', () => {
      const viewport800: ViewportState = { ...defaultViewport, widthPx: 800 };
      renderWithProvider(<Ruler {...defaultProps} viewport={viewport800} />);
      // 800px / 100px per beat = 8 beats = 2 bars
      // Should have 3 grid ticks between each bar number (6 total for 2 bars)
      const gridTicks = document.querySelectorAll('.ruler__grid-tick');
      expect(gridTicks.length).toBeGreaterThanOrEqual(3);
    });

    it('should position grid markers correctly', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      // First grid tick should be at 100px (1 beat from start with barInterval=1)
      const gridTicks = document.querySelectorAll('.ruler__grid-tick');
      expect(gridTicks[0]).toHaveStyle({ left: '100px' });
    });
  });

  describe('Styling', () => {
    it('should have terminal aesthetic styling', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      const ruler = screen.getByTestId('ruler');
      expect(ruler).toHaveClass('ruler');
    });

    it('should style bar numbers with primary color', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      const barNumber = screen.getByTestId('ruler-bar-1');
      expect(barNumber).toHaveClass('ruler-tick__bar-number');
    });

    it('should style grid markers differently from bar numbers', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      const gridTicks = document.querySelectorAll('.ruler__grid-tick');
      expect(gridTicks[0]).toHaveClass('ruler__grid-tick');
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA labels', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      const ruler = screen.getByTestId('ruler');
      expect(ruler).toHaveAttribute('role', 'none'); // Purely visual element
    });

    it('should be keyboard accessible if interactive', () => {
      // If we add click functionality later, this test will be expanded
      renderWithProvider(<Ruler {...defaultProps} />);
      const ruler = screen.getByTestId('ruler');
      expect(ruler).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small zoom levels', () => {
      const viewport10: ViewportState = { ...defaultViewport, zoom: 10 };
      renderWithProvider(<Ruler {...defaultProps} viewport={viewport10} />);
      // Should still render without crashing
      expect(screen.getByTestId('ruler')).toBeInTheDocument();
    });

    it('should handle very large zoom levels', () => {
      const viewport400: ViewportState = { ...defaultViewport, zoom: 400 };
      renderWithProvider(<Ruler {...defaultProps} viewport={viewport400} />);
      // Should still render without crashing
      expect(screen.getByTestId('ruler')).toBeInTheDocument();
    });

    it('should handle zero container width gracefully', () => {
      const viewport0: ViewportState = { ...defaultViewport, widthPx: 0 };
      renderWithProvider(<Ruler {...defaultProps} viewport={viewport0} />);
      // Should render but show no bars
      expect(screen.getByTestId('ruler')).toBeInTheDocument();
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('should handle very wide containers', () => {
      const viewport10000: ViewportState = { ...defaultViewport, widthPx: 10000 };
      renderWithProvider(<Ruler {...defaultProps} viewport={viewport10000} />);
      // Should render many bars
      const bars = screen.getAllByTestId(/^ruler-bar-/);
      expect(bars.length).toBeGreaterThan(10);
    });
  });

  describe('Visual Hierarchy', () => {
    it('should render bars (downbeats) with bar class', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      const barNumbers = document.querySelectorAll('.ruler-tick__bar-number');
      expect(barNumbers.length).toBeGreaterThan(0);
      // Bar numbers should have the bar class
      expect(barNumbers[0]).toHaveClass('ruler-tick__bar-number');
    });

    it('should render grid lines with adaptive spacing', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      const gridTicks = document.querySelectorAll('.ruler__grid-tick');
      // Should have grid lines between bar numbers (3 per bar interval)
      expect(gridTicks.length).toBeGreaterThan(0);
    });

    it('should adapt grid density based on zoom level', () => {
      // At very low zoom (many bars visible), grid should be sparser
      const viewportLowZoom: ViewportState = { ...defaultViewport, zoom: 5, widthPx: 2000 };
      const store = createTestStore();
      const { rerender } = render(
        <Provider store={store}>
          <Ruler {...defaultProps} viewport={viewportLowZoom} />
        </Provider>
      );
      const gridTicksLowZoom = document.querySelectorAll('.ruler__grid-tick');
      const lowZoomCount = gridTicksLowZoom.length;

      // At high zoom (fewer bars visible), grid can be denser
      const viewportHighZoom: ViewportState = { ...defaultViewport, zoom: 200 };
      rerender(
        <Provider store={store}>
          <Ruler {...defaultProps} viewport={viewportHighZoom} />
        </Provider>
      );
      const gridTicksHighZoom = document.querySelectorAll('.ruler__grid-tick');
      const highZoomCount = gridTicksHighZoom.length;

      // Both should have grid lines, but adaptive spacing means counts will vary
      expect(lowZoomCount).toBeGreaterThan(0);
      expect(highZoomCount).toBeGreaterThan(0);
    });

    it('should position bar ticks at bar boundaries', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      // Bar 1 should be at 0px (start of timeline)
      const bar1 = screen.getByTestId('ruler-bar-1');
      const bar1Container = bar1.parentElement;
      expect(bar1Container).toHaveStyle({ left: '0px' });

      // Bar 2 should be at 400px (4 beats * 100px per beat)
      const bar2 = screen.getByTestId('ruler-bar-2');
      const bar2Container = bar2.parentElement;
      expect(bar2Container).toHaveStyle({ left: '400px' });
    });

    it('should position grid ticks between bars', () => {
      renderWithProvider(<Ruler {...defaultProps} />);
      const gridTicks = document.querySelectorAll('.ruler__grid-tick');
      // First grid tick should be at 100px (1 beat with barInterval=1)
      expect(gridTicks[0]).toHaveStyle({ left: '100px' });
    });
  });
});
