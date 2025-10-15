/**
 * Cyclone - Duration Utilities
 * Functions for calculating and formatting durations
 */

import type { Pattern, ID } from '@/types';

/**
 * Format duration in seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted string in MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  // Handle negative values
  if (seconds < 0) {
    seconds = 0;
  }

  // Round to nearest second
  const totalSeconds = Math.round(seconds);

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  // Pad both minutes and seconds with leading zeros
  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = remainingSeconds.toString().padStart(2, '0');

  return `${minutesStr}:${secondsStr}`;
};

/**
 * Calculate global duration from start to rightmost pattern
 * @param patterns - Array of all patterns
 * @param tempo - Current tempo in BPM
 * @returns Total duration in seconds
 */
export const calculateGlobalDuration = (patterns: Pattern[], tempo: number): number => {
  // Handle empty patterns array
  if (patterns.length === 0) {
    return 0;
  }

  // Find the rightmost position (position + duration)
  let rightmostBeat = 0;
  patterns.forEach((pattern) => {
    const endBeat = pattern.position + pattern.duration;
    if (endBeat > rightmostBeat) {
      rightmostBeat = endBeat;
    }
  });

  // Convert beats to seconds
  // Each beat is a quarter note at the given tempo
  // Seconds per beat = 60 / BPM
  const secondsPerBeat = 60 / tempo;
  return rightmostBeat * secondsPerBeat;
};

/**
 * Calculate total duration of selected patterns
 * @param patterns - Array of all patterns
 * @param selectedIds - Array of selected pattern IDs
 * @param tempo - Current tempo in BPM
 * @returns Total duration of selected patterns in seconds
 */
export const calculateSelectedDuration = (
  patterns: Pattern[],
  selectedIds: ID[],
  tempo: number
): number => {
  // Handle empty selection or no patterns
  if (selectedIds.length === 0 || patterns.length === 0) {
    return 0;
  }

  // Create a Set for faster lookup
  const selectedIdsSet = new Set(selectedIds);

  // Sum durations of selected patterns
  let totalBeats = 0;
  patterns.forEach((pattern) => {
    if (selectedIdsSet.has(pattern.id)) {
      totalBeats += pattern.duration;
    }
  });

  // Convert beats to seconds
  const secondsPerBeat = 60 / tempo;
  return totalBeats * secondsPerBeat;
};
