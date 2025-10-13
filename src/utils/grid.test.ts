/**
 * Song Arranger - Grid Calculation Utilities Tests
 */

import { calculateGridMetrics } from './grid';
import { BEATS_PER_BAR } from '@/constants';
import type { ViewportState } from '@/types';

describe('calculateGridMetrics', () => {

  const createViewport = (zoom: number, widthPx: number, offsetBeats: number = 0): ViewportState => ({
    zoom,
    widthPx,
    heightPx: 600,
    offsetBeats,
  });

  describe('barInterval calculation', () => {
    it('should use interval of 1 for 16 or fewer visible bars', () => {
      // 16 bars visible: 16 * 4 = 64 beats visible
      // If viewport is 1600px wide at 25px/beat: 1600/25 = 64 beats
      const viewport = createViewport(25, 1600);
      const metrics = calculateGridMetrics(viewport, BEATS_PER_BAR);

      expect(metrics.barsVisible).toBe(16);
      expect(metrics.barInterval).toBe(1);
      expect(metrics.gridIntervalBeats).toBe(1); // (1 * 4) / 4
    });

    it('should use interval of 2 for more than 16 bars visible', () => {
      // 32 bars visible: 32 * 4 = 128 beats visible
      const viewport = createViewport(12.5, 1600);
      const metrics = calculateGridMetrics(viewport, BEATS_PER_BAR);

      expect(metrics.barsVisible).toBe(32);
      expect(metrics.barInterval).toBe(2);
      expect(metrics.gridIntervalBeats).toBe(2); // (2 * 4) / 4
    });

    it('should use interval of 4 for more than 32 bars visible', () => {
      // 64 bars visible: 64 * 4 = 256 beats visible
      const viewport = createViewport(6.25, 1600);
      const metrics = calculateGridMetrics(viewport, BEATS_PER_BAR);

      expect(metrics.barsVisible).toBe(64);
      expect(metrics.barInterval).toBe(4);
      expect(metrics.gridIntervalBeats).toBe(4); // (4 * 4) / 4
    });

    it('should use interval of 8 for more than 64 bars visible', () => {
      // 128 bars visible: 128 * 4 = 512 beats visible
      const viewport = createViewport(3.125, 1600);
      const metrics = calculateGridMetrics(viewport, BEATS_PER_BAR);

      expect(metrics.barsVisible).toBe(128);
      expect(metrics.barInterval).toBe(8);
      expect(metrics.gridIntervalBeats).toBe(8); // (8 * 4) / 4
    });

    it('should use interval of 16 for more than 128 bars visible', () => {
      // 256 bars visible: 256 * 4 = 1024 beats visible
      const viewport = createViewport(1.5625, 1600);
      const metrics = calculateGridMetrics(viewport, BEATS_PER_BAR);

      expect(metrics.barsVisible).toBe(256);
      expect(metrics.barInterval).toBe(16);
      expect(metrics.gridIntervalBeats).toBe(16); // (16 * 4) / 4
    });
  });

  describe('gridIntervalBeats calculation', () => {
    it('should always create 4 divisions between bar numbers', () => {
      const testCases = [
        { barInterval: 1, expectedGridInterval: 1 },
        { barInterval: 2, expectedGridInterval: 2 },
        { barInterval: 4, expectedGridInterval: 4 },
        { barInterval: 8, expectedGridInterval: 8 },
        { barInterval: 16, expectedGridInterval: 16 },
      ];

      testCases.forEach(({ barInterval, expectedGridInterval }) => {
        // Create viewport that results in desired barInterval
        const barsVisible = barInterval === 1 ? 16 : (barInterval * 8) + 1;
        const beatsVisible = barsVisible * BEATS_PER_BAR;
        const zoom = 1600 / beatsVisible;
        const viewport = createViewport(zoom, 1600);

        const metrics = calculateGridMetrics(viewport, BEATS_PER_BAR);

        expect(metrics.barInterval).toBe(barInterval);
        expect(metrics.gridIntervalBeats).toBe(expectedGridInterval);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle viewport offset correctly', () => {
      // Offset shouldn't affect bar interval calculation
      const viewport1 = createViewport(25, 1600, 0);
      const viewport2 = createViewport(25, 1600, 100);

      const metrics1 = calculateGridMetrics(viewport1, BEATS_PER_BAR);
      const metrics2 = calculateGridMetrics(viewport2, BEATS_PER_BAR);

      expect(metrics1.barInterval).toBe(metrics2.barInterval);
      expect(metrics1.gridIntervalBeats).toBe(metrics2.gridIntervalBeats);
    });

    it('should handle different beats per bar', () => {
      const viewport = createViewport(25, 1600);

      const metrics3_4 = calculateGridMetrics(viewport, 4);
      const metrics6_8 = calculateGridMetrics(viewport, 6);

      // Both should adapt to visible bars, not beats
      expect(metrics3_4.gridIntervalBeats).toBe(1); // (1 * 4) / 4
      expect(metrics6_8.gridIntervalBeats).toBe(1.5); // (1 * 6) / 4
    });

    it('should handle zero width viewport gracefully', () => {
      const viewport = createViewport(100, 0);
      const metrics = calculateGridMetrics(viewport, BEATS_PER_BAR);

      expect(metrics.barsVisible).toBe(0);
      expect(metrics.barInterval).toBe(1);
      expect(metrics.gridIntervalBeats).toBe(1);
    });

    it('should handle very small zoom (wide view)', () => {
      // Very zoomed out: 0.25px per beat, 6400 beats visible = 1600 bars
      const viewport = createViewport(0.25, 1600);
      const metrics = calculateGridMetrics(viewport, BEATS_PER_BAR);

      expect(metrics.barsVisible).toBe(1600);
      expect(metrics.barInterval).toBe(16);
      expect(metrics.gridIntervalBeats).toBe(16);
    });

    it('should handle very large zoom (narrow view)', () => {
      // Very zoomed in: 800px per beat, 2 beats visible = 0.5 bars
      const viewport = createViewport(800, 1600);
      const metrics = calculateGridMetrics(viewport, BEATS_PER_BAR);

      expect(metrics.barsVisible).toBe(1); // ceil(2/4) = 1
      expect(metrics.barInterval).toBe(1);
      expect(metrics.gridIntervalBeats).toBe(1);
    });
  });

  describe('consistency with original implementation', () => {
    it('should match the logic from Lane.tsx lines 188-200', () => {
      // Test the exact thresholds from the original code
      const testThresholds = [
        { barsVisible: 15, expectedInterval: 1 },
        { barsVisible: 16, expectedInterval: 1 },
        { barsVisible: 17, expectedInterval: 2 },
        { barsVisible: 32, expectedInterval: 2 },
        { barsVisible: 33, expectedInterval: 4 },
        { barsVisible: 64, expectedInterval: 4 },
        { barsVisible: 65, expectedInterval: 8 },
        { barsVisible: 128, expectedInterval: 8 },
        { barsVisible: 129, expectedInterval: 16 },
      ];

      testThresholds.forEach(({ barsVisible, expectedInterval }) => {
        const beatsVisible = barsVisible * BEATS_PER_BAR;
        const zoom = 1600 / beatsVisible;
        const viewport = createViewport(zoom, 1600);

        const metrics = calculateGridMetrics(viewport, BEATS_PER_BAR);

        expect(metrics.barInterval).toBe(expectedInterval);
        expect(metrics.gridIntervalBeats).toBe((expectedInterval * BEATS_PER_BAR) / 4);
      });
    });
  });
});
