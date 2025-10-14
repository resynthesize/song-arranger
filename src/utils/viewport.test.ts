/**
 * Cyclone - Viewport Utilities Tests
 * Tests for viewport coordinate conversion and visibility calculations
 */

import {
  beatsToViewportPx,
  viewportPxToBeats,
  isRangeVisible,
  calculateVisibleRange,
  calculateZoomOffset,
  clampViewportOffset,
} from './viewport';
import type { ViewportState } from '@/types';

describe('viewport utilities', () => {
  describe('beatsToViewportPx', () => {
    it('should convert beat position to viewport pixels', () => {
      const viewport: ViewportState = {
        offsetBeats: 10,
        zoom: 5,
        widthPx: 1000,
        heightPx: 600,
      };

      expect(beatsToViewportPx(10, viewport)).toBe(0); // At viewport offset
      expect(beatsToViewportPx(15, viewport)).toBe(25); // 5 beats * 5 px/beat
      expect(beatsToViewportPx(5, viewport)).toBe(-25); // Before viewport
    });
  });

  describe('viewportPxToBeats', () => {
    it('should convert viewport pixels to beat position', () => {
      const viewport: ViewportState = {
        offsetBeats: 10,
        zoom: 5,
        widthPx: 1000,
        heightPx: 600,
      };

      expect(viewportPxToBeats(0, viewport)).toBe(10); // Left edge
      expect(viewportPxToBeats(25, viewport)).toBe(15); // 25px / 5 px/beat = 5 beats
      expect(viewportPxToBeats(1000, viewport)).toBe(210); // Right edge
    });
  });

  describe('isRangeVisible', () => {
    it('should detect visible ranges at low zoom', () => {
      const viewport: ViewportState = {
        offsetBeats: 0,
        zoom: 5, // Low zoom: 5 px per beat
        widthPx: 1600,
        heightPx: 600,
      };

      // Pattern at beats 40-44 (well within viewport)
      expect(isRangeVisible(40, 44, viewport, 200)).toBe(true);

      // Pattern at beats 100-104 (within viewport)
      expect(isRangeVisible(100, 104, viewport, 200)).toBe(true);

      // Pattern far outside viewport (beyond margin)
      expect(isRangeVisible(500, 504, viewport, 200)).toBe(false);
    });

    it('should detect visible ranges at high zoom with scaled margin', () => {
      const viewport: ViewportState = {
        offsetBeats: 80,
        zoom: 400, // High zoom: 400 px per beat
        widthPx: 1600,
        heightPx: 600,
      };

      // Visible range: 80 to 84 beats (1600px / 400 px/beat = 4 beats)

      // Pattern just outside viewport should still be visible due to scaled margin
      // At 400 px/beat, the minimum margin is 400 * 2 = 800px = 2 beats
      expect(isRangeVisible(78, 79, viewport, 200)).toBe(true); // 1-2 beats before viewport
      expect(isRangeVisible(85, 86, viewport, 200)).toBe(true); // 1-2 beats after viewport

      // Pattern far outside margin should not be visible
      expect(isRangeVisible(100, 104, viewport, 200)).toBe(false); // 16 beats after viewport
      expect(isRangeVisible(60, 64, viewport, 200)).toBe(false); // 16 beats before viewport
    });

    it('should ensure minimum 2 beats of margin at high zoom', () => {
      const viewport: ViewportState = {
        offsetBeats: 40,
        zoom: 400, // 400 px per beat
        widthPx: 1600,
        heightPx: 600,
      };

      // Visible range: 40 to 44 beats
      // With 400 px/beat zoom, minimum margin = 400 * 2 = 800px = 2 beats

      // Pattern at 38-39 (1 beat before viewport start)
      expect(isRangeVisible(38, 39, viewport, 200)).toBe(true);

      // Pattern at 45-46 (1 beat after viewport end)
      expect(isRangeVisible(45, 46, viewport, 200)).toBe(true);

      // Pattern at 37-38 (2 beats before viewport start, at margin edge)
      expect(isRangeVisible(37, 38, viewport, 200)).toBe(true);

      // Pattern at 36-37 (3 beats before viewport start, beyond margin)
      expect(isRangeVisible(36, 37, viewport, 200)).toBe(false);
    });

    it('should use fixed margin at low zoom when larger than scaled margin', () => {
      const viewport: ViewportState = {
        offsetBeats: 0,
        zoom: 0.25, // Very low zoom: 0.25 px per beat
        widthPx: 1600,
        heightPx: 600,
      };

      // Visible range: 0 to 6400 beats (1600px / 0.25 px/beat)
      // At 0.25 px/beat, scaled margin would be 0.25 * 2 = 0.5px
      // Fixed margin of 200px is larger, so it's used instead

      // Pattern at 6500 beats (within 200px margin)
      expect(isRangeVisible(6500, 6504, viewport, 200)).toBe(true);
    });
  });

  describe('calculateVisibleRange', () => {
    it('should calculate visible beat range', () => {
      const viewport: ViewportState = {
        offsetBeats: 10,
        zoom: 5,
        widthPx: 1000,
        heightPx: 600,
      };

      const range = calculateVisibleRange(viewport);
      expect(range.startBeat).toBe(10);
      expect(range.endBeat).toBe(210); // 10 + (1000 / 5)
    });
  });

  describe('clampViewportOffset', () => {
    it('should prevent negative offsets', () => {
      expect(clampViewportOffset(-10)).toBe(0);
      expect(clampViewportOffset(0)).toBe(0);
      expect(clampViewportOffset(100)).toBe(100);
    });
  });

  describe('calculateZoomOffset', () => {
    it('should maintain beat position under mouse during zoom', () => {
      const viewport: ViewportState = {
        offsetBeats: 10,
        zoom: 5,
        widthPx: 1000,
        heightPx: 600,
      };

      // Mouse at 500px (middle of viewport)
      const mouseX = 500;
      const newZoom = 10; // Doubling zoom

      const newOffset = calculateZoomOffset(viewport, mouseX, newZoom);

      // Beat under mouse: 10 + 500/5 = 110 beats
      // New offset should keep beat 110 at pixel 500
      // newOffset + 500/10 = 110
      // newOffset = 110 - 50 = 60
      expect(newOffset).toBe(60);
    });

    it('should clamp offset to prevent negative scrolling', () => {
      const viewport: ViewportState = {
        offsetBeats: 5,
        zoom: 10,
        widthPx: 1000,
        heightPx: 600,
      };

      const mouseX = 500;
      const newZoom = 2; // Zooming out significantly

      const newOffset = calculateZoomOffset(viewport, mouseX, newZoom);

      // Should not be negative
      expect(newOffset).toBeGreaterThanOrEqual(0);
    });
  });
});
