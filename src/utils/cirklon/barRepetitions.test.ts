/**
 * Cyclone - Bar Repetition Utilities Tests
 */

import type { P3PatternData, P3Bar } from '@/types';
import {
  calculateExpandedBarCount,
  calculateExpandedStepCount,
  calculateExpandedDuration,
  expandBars,
  getBarOccurrences,
} from './barRepetitions';

// Helper to create a test bar
const createTestBar = (lastStep: number = 16, reps: number = 1): P3Bar => ({
  direction: 'forward',
  tbase: ' 16',
  last_step: lastStep,
  xpos: 0,
  reps,
  gbar: false,
  note: Array(16).fill('C 4'),
  velo: Array(16).fill(100),
  length: Array(16).fill(24),
  delay: Array(16).fill(0),
  aux_A_value: Array(16).fill(0),
  aux_B_value: Array(16).fill(0),
  aux_C_value: Array(16).fill(0),
  aux_D_value: Array(16).fill(0),
  gate: Array(16).fill(1),
  tie: Array(16).fill(0),
  skip: Array(16).fill(0),
  note_X: Array(16).fill(0),
  aux_A_flag: Array(16).fill(0),
  aux_B_flag: Array(16).fill(0),
  aux_C_flag: Array(16).fill(0),
  aux_D_flag: Array(16).fill(0),
});

describe('Bar Repetition Utilities', () => {
  describe('calculateExpandedBarCount', () => {
    it('should return 0 for undefined pattern data', () => {
      expect(calculateExpandedBarCount(undefined)).toBe(0);
    });

    it('should return 0 for pattern with no bars', () => {
      const patternData: P3PatternData = { bars: [] };
      expect(calculateExpandedBarCount(patternData)).toBe(0);
    });

    it('should return correct count for single bar with no repetitions', () => {
      const patternData: P3PatternData = {
        bars: [createTestBar(16, 1)],
      };
      expect(calculateExpandedBarCount(patternData)).toBe(1);
    });

    it('should return correct count for single bar with repetitions', () => {
      const patternData: P3PatternData = {
        bars: [createTestBar(16, 3)],
      };
      expect(calculateExpandedBarCount(patternData)).toBe(3);
    });

    it('should return correct count for multiple bars with different repetitions', () => {
      const patternData: P3PatternData = {
        bars: [
          createTestBar(16, 3), // First bar repeats 3 times
          createTestBar(16, 1), // Second bar repeats 1 time
        ],
      };
      // Total: 3 + 1 = 4 bars
      expect(calculateExpandedBarCount(patternData)).toBe(4);
    });

    it('should handle bars with reps=0 (treat as 1)', () => {
      const patternData: P3PatternData = {
        bars: [createTestBar(16, 0)],
      };
      expect(calculateExpandedBarCount(patternData)).toBe(1);
    });
  });

  describe('calculateExpandedStepCount', () => {
    it('should return 0 for undefined pattern data', () => {
      expect(calculateExpandedStepCount(undefined)).toBe(0);
    });

    it('should return correct count for single bar without repetitions', () => {
      const patternData: P3PatternData = {
        bars: [createTestBar(16, 1)],
      };
      expect(calculateExpandedStepCount(patternData)).toBe(16);
    });

    it('should return correct count for single bar with repetitions', () => {
      const patternData: P3PatternData = {
        bars: [createTestBar(16, 3)],
      };
      // 16 steps * 3 reps = 48 steps
      expect(calculateExpandedStepCount(patternData)).toBe(48);
    });

    it('should return correct count for multiple bars with different repetitions', () => {
      const patternData: P3PatternData = {
        bars: [
          createTestBar(16, 3), // 16 * 3 = 48 steps
          createTestBar(16, 1), // 16 * 1 = 16 steps
        ],
      };
      // Total: 48 + 16 = 64 steps
      expect(calculateExpandedStepCount(patternData)).toBe(64);
    });

    it('should account for last_step when calculating', () => {
      const patternData: P3PatternData = {
        bars: [
          createTestBar(8, 2), // 8 steps * 2 reps = 16 steps
          createTestBar(12, 1), // 12 steps * 1 rep = 12 steps
        ],
      };
      // Total: 16 + 12 = 28 steps
      expect(calculateExpandedStepCount(patternData)).toBe(28);
    });
  });

  describe('calculateExpandedDuration', () => {
    it('should return 0 for undefined pattern data', () => {
      expect(calculateExpandedDuration(undefined, 4)).toBe(0);
    });

    it('should calculate correct duration for single bar', () => {
      const patternData: P3PatternData = {
        bars: [createTestBar(16, 1)],
      };
      // 1 bar * 4 beats/bar = 4 beats
      expect(calculateExpandedDuration(patternData, 4)).toBe(4);
    });

    it('should calculate correct duration with repetitions', () => {
      const patternData: P3PatternData = {
        bars: [createTestBar(16, 3)],
      };
      // 3 bars * 4 beats/bar = 12 beats
      expect(calculateExpandedDuration(patternData, 4)).toBe(12);
    });

    it('should calculate correct duration for the example: bar1 reps=3, bar2 reps=1', () => {
      const patternData: P3PatternData = {
        bars: [
          createTestBar(16, 3), // 3 bars
          createTestBar(16, 1), // 1 bar
        ],
      };
      // (3 + 1) bars * 4 beats/bar = 16 beats
      expect(calculateExpandedDuration(patternData, 4)).toBe(16);
    });

    it('should work with different beats per bar', () => {
      const patternData: P3PatternData = {
        bars: [createTestBar(16, 2)],
      };
      // 2 bars * 3 beats/bar = 6 beats
      expect(calculateExpandedDuration(patternData, 3)).toBe(6);
    });
  });

  describe('expandBars', () => {
    it('should return empty array for empty input', () => {
      expect(expandBars([])).toEqual([]);
    });

    it('should return same bar once if reps=1', () => {
      const bar = createTestBar(16, 1);
      const expanded = expandBars([bar]);
      expect(expanded).toHaveLength(1);
      expect(expanded[0]).toBe(bar);
    });

    it('should repeat bar according to reps value', () => {
      const bar = createTestBar(16, 3);
      const expanded = expandBars([bar]);
      expect(expanded).toHaveLength(3);
      expect(expanded[0]).toBe(bar);
      expect(expanded[1]).toBe(bar);
      expect(expanded[2]).toBe(bar);
    });

    it('should handle multiple bars with different reps', () => {
      const bar1 = createTestBar(16, 3);
      const bar2 = createTestBar(8, 1);
      const expanded = expandBars([bar1, bar2]);
      // Should be [bar1, bar1, bar1, bar2]
      expect(expanded).toHaveLength(4);
      expect(expanded[0]).toBe(bar1);
      expect(expanded[1]).toBe(bar1);
      expect(expanded[2]).toBe(bar1);
      expect(expanded[3]).toBe(bar2);
    });
  });

  describe('getBarOccurrences', () => {
    it('should return empty array for undefined pattern data', () => {
      expect(getBarOccurrences(undefined)).toEqual([]);
    });

    it('should return single occurrence for bar with reps=1', () => {
      const bar = createTestBar(16, 1);
      const patternData: P3PatternData = { bars: [bar] };
      const occurrences = getBarOccurrences(patternData);

      expect(occurrences).toHaveLength(1);
      expect(occurrences[0]).toEqual({
        sourceBarIndex: 0,
        repetitionIndex: 0,
        bar,
      });
    });

    it('should return multiple occurrences for bar with reps>1', () => {
      const bar = createTestBar(16, 3);
      const patternData: P3PatternData = { bars: [bar] };
      const occurrences = getBarOccurrences(patternData);

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0]).toEqual({
        sourceBarIndex: 0,
        repetitionIndex: 0,
        bar,
      });
      expect(occurrences[1]).toEqual({
        sourceBarIndex: 0,
        repetitionIndex: 1,
        bar,
      });
      expect(occurrences[2]).toEqual({
        sourceBarIndex: 0,
        repetitionIndex: 2,
        bar,
      });
    });

    it('should handle the example case: bar1 reps=3, bar2 reps=1', () => {
      const bar1 = createTestBar(16, 3);
      const bar2 = createTestBar(8, 1);
      const patternData: P3PatternData = { bars: [bar1, bar2] };
      const occurrences = getBarOccurrences(patternData);

      expect(occurrences).toHaveLength(4);

      // First 3 occurrences should be from bar1
      expect(occurrences[0].sourceBarIndex).toBe(0);
      expect(occurrences[0].repetitionIndex).toBe(0);
      expect(occurrences[1].sourceBarIndex).toBe(0);
      expect(occurrences[1].repetitionIndex).toBe(1);
      expect(occurrences[2].sourceBarIndex).toBe(0);
      expect(occurrences[2].repetitionIndex).toBe(2);

      // Last occurrence should be from bar2
      expect(occurrences[3].sourceBarIndex).toBe(1);
      expect(occurrences[3].repetitionIndex).toBe(0);
    });
  });
});
