/**
 * Song Arranger - Duration Utilities
 * Functions for calculating and formatting durations
 */

import type { Clip, ID } from '@/types';

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

  // Pad seconds with leading zero if needed
  const secondsStr = remainingSeconds.toString().padStart(2, '0');

  return `${minutes}:${secondsStr}`;
};

/**
 * Calculate global duration from start to rightmost clip
 * @param clips - Array of all clips
 * @param tempo - Current tempo in BPM
 * @returns Total duration in seconds
 */
export const calculateGlobalDuration = (clips: Clip[], tempo: number): number => {
  // Handle empty clips array
  if (clips.length === 0) {
    return 0;
  }

  // Find the rightmost position (position + duration)
  let rightmostBeat = 0;
  clips.forEach((clip) => {
    const endBeat = clip.position + clip.duration;
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
 * Calculate total duration of selected clips
 * @param clips - Array of all clips
 * @param selectedIds - Array of selected clip IDs
 * @param tempo - Current tempo in BPM
 * @returns Total duration of selected clips in seconds
 */
export const calculateSelectedDuration = (
  clips: Clip[],
  selectedIds: ID[],
  tempo: number
): number => {
  // Handle empty selection or no clips
  if (selectedIds.length === 0 || clips.length === 0) {
    return 0;
  }

  // Create a Set for faster lookup
  const selectedIdsSet = new Set(selectedIds);

  // Sum durations of selected clips
  let totalBeats = 0;
  clips.forEach((clip) => {
    if (selectedIdsSet.has(clip.id)) {
      totalBeats += clip.duration;
    }
  });

  // Convert beats to seconds
  const secondsPerBeat = 60 / tempo;
  return totalBeats * secondsPerBeat;
};
