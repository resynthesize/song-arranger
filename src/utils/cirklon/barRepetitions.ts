/**
 * Cyclone - Bar Repetition Utilities
 * Helper functions for calculating expanded pattern durations based on bar repetitions
 */

import type { P3PatternData, P3Bar } from '@/types';

/**
 * Calculate the total number of expanded bars accounting for repetitions
 *
 * Example: If a pattern has 2 bars where bar 1 has reps=3 and bar 2 has reps=1,
 * this returns 4 (the expanded total when bar 1 repeats 3 times)
 *
 * @param patternData - The P3 pattern data
 * @returns Total number of bars after expansion, or 0 if no bars
 */
export function calculateExpandedBarCount(patternData: P3PatternData | undefined): number {
  if (!patternData || !patternData.bars || patternData.bars.length === 0) {
    return 0;
  }

  let expandedBarCount = 0;
  for (const bar of patternData.bars) {
    if (!bar) {
      continue;
    }
    // Each bar's reps value indicates how many times it repeats
    // Default to 1 if reps is not set or is invalid
    const reps = Math.max(1, bar.reps || 1);
    expandedBarCount += reps;
  }

  return expandedBarCount;
}

/**
 * Calculate the total number of steps accounting for bar repetitions
 *
 * This multiplies each bar's active steps by its repetition count.
 *
 * @param patternData - The P3 pattern data
 * @returns Total number of steps after expansion, or 0 if no bars
 */
export function calculateExpandedStepCount(patternData: P3PatternData | undefined): number {
  if (!patternData || !patternData.bars || patternData.bars.length === 0) {
    return 0;
  }

  let totalSteps = 0;
  for (const bar of patternData.bars) {
    if (!bar) {
      continue;
    }
    const reps = Math.max(1, bar.reps || 1);
    const stepsInBar = bar.last_step;
    totalSteps += stepsInBar * reps;
  }

  return totalSteps;
}

/**
 * Calculate the expanded duration in beats accounting for bar repetitions
 *
 * @param patternData - The P3 pattern data
 * @param beatsPerBar - Beats per bar (typically 4 for 4/4 time)
 * @returns Duration in beats after expansion, or 0 if no bars
 */
export function calculateExpandedDuration(
  patternData: P3PatternData | undefined,
  beatsPerBar: number = 4
): number {
  const expandedBarCount = calculateExpandedBarCount(patternData);
  return expandedBarCount * beatsPerBar;
}

/**
 * Expand bars array to include repetitions
 *
 * This creates a new array where each bar is repeated according to its reps value.
 * Useful for iteration when you need to process each bar occurrence separately.
 *
 * Example:
 * Input: [bar1(reps=3), bar2(reps=1)]
 * Output: [bar1, bar1, bar1, bar2]
 *
 * @param bars - Array of bars from pattern data
 * @returns Expanded array with repetitions
 */
export function expandBars(bars: P3Bar[]): P3Bar[] {
  const expanded: P3Bar[] = [];

  for (const bar of bars) {
    const reps = Math.max(1, bar.reps || 1);
    for (let i = 0; i < reps; i++) {
      expanded.push(bar);
    }
  }

  return expanded;
}

/**
 * Get metadata about bar repetitions for visualization
 * Returns an array describing each bar occurrence with source bar index
 *
 * @param patternData - The P3 pattern data
 * @returns Array of bar occurrence metadata
 */
export interface BarOccurrence {
  /** Index of the original bar in the bars array (0-based) */
  sourceBarIndex: number;
  /** Which repetition this is (0-based, so first rep = 0) */
  repetitionIndex: number;
  /** The bar data */
  bar: P3Bar;
}

export function getBarOccurrences(patternData: P3PatternData | undefined): BarOccurrence[] {
  if (!patternData || !patternData.bars || patternData.bars.length === 0) {
    return [];
  }

  const occurrences: BarOccurrence[] = [];

  for (let barIndex = 0; barIndex < patternData.bars.length; barIndex++) {
    const bar = patternData.bars[barIndex];
    if (!bar) {
      continue;
    }

    const reps = Math.max(1, bar.reps || 1);
    for (let repIndex = 0; repIndex < reps; repIndex++) {
      occurrences.push({
        sourceBarIndex: barIndex,
        repetitionIndex: repIndex,
        bar,
      });
    }
  }

  return occurrences;
}
