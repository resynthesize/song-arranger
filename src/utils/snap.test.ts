/**
 * Cyclone - Snap Utility Tests
 * Tests for snap-to-grid functionality
 */

import { snapToGrid, getSnapIncrement } from './snap';

describe('snap utilities', () => {
  describe('snapToGrid', () => {
    it('should snap position to nearest quarter note (1 beat)', () => {
      expect(snapToGrid(0.4, 1)).toBe(0);
      expect(snapToGrid(0.5, 1)).toBe(1);
      expect(snapToGrid(0.6, 1)).toBe(1);
      expect(snapToGrid(1.2, 1)).toBe(1);
      expect(snapToGrid(1.5, 1)).toBe(2);
    });

    it('should snap position to nearest 1/16th note (0.25 beats)', () => {
      expect(snapToGrid(0.1, 0.25)).toBe(0);
      expect(snapToGrid(0.13, 0.25)).toBe(0.25);
      expect(snapToGrid(0.2, 0.25)).toBe(0.25);
      expect(snapToGrid(0.4, 0.25)).toBe(0.5);
      expect(snapToGrid(0.87, 0.25)).toBe(0.75);
    });

    it('should snap position to nearest 1/8th note (0.5 beats)', () => {
      expect(snapToGrid(0.2, 0.5)).toBe(0);
      expect(snapToGrid(0.26, 0.5)).toBe(0.5);
      expect(snapToGrid(0.7, 0.5)).toBe(0.5);
      expect(snapToGrid(0.8, 0.5)).toBe(1);
      expect(snapToGrid(1.3, 0.5)).toBe(1.5);
    });

    it('should snap position to nearest half note (2 beats)', () => {
      expect(snapToGrid(0.8, 2)).toBe(0);
      expect(snapToGrid(1.1, 2)).toBe(2);
      expect(snapToGrid(2.9, 2)).toBe(2);
      expect(snapToGrid(3.1, 2)).toBe(4);
    });

    it('should snap position to nearest bar (4 beats)', () => {
      expect(snapToGrid(1.5, 4)).toBe(0);
      expect(snapToGrid(2.1, 4)).toBe(4);
      expect(snapToGrid(5.9, 4)).toBe(4);
      expect(snapToGrid(6.1, 4)).toBe(8);
    });

    it('should handle negative positions by snapping to 0', () => {
      expect(snapToGrid(-0.5, 1)).toBe(0);
      expect(snapToGrid(-1.2, 0.25)).toBe(0);
      expect(snapToGrid(-5, 4)).toBe(0);
    });

    it('should handle zero snap value by returning original position', () => {
      expect(snapToGrid(1.5, 0)).toBe(1.5);
      expect(snapToGrid(3.7, 0)).toBe(3.7);
    });

    it('should handle exact multiples correctly', () => {
      expect(snapToGrid(1, 1)).toBe(1);
      expect(snapToGrid(4, 1)).toBe(4);
      expect(snapToGrid(0.5, 0.5)).toBe(0.5);
      expect(snapToGrid(8, 4)).toBe(8);
    });
  });

  describe('getSnapIncrement', () => {
    it('should return the snap value as increment', () => {
      expect(getSnapIncrement(0.25)).toBe(0.25);
      expect(getSnapIncrement(0.5)).toBe(0.5);
      expect(getSnapIncrement(1)).toBe(1);
      expect(getSnapIncrement(2)).toBe(2);
      expect(getSnapIncrement(4)).toBe(4);
    });

    it('should handle zero snap value', () => {
      expect(getSnapIncrement(0)).toBe(0);
    });

    it('should handle very small snap values', () => {
      expect(getSnapIncrement(0.125)).toBe(0.125);
      expect(getSnapIncrement(0.0625)).toBe(0.0625);
    });
  });
});
