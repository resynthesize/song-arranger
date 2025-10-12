/**
 * Song Arranger - Duration Utilities
 * Utilities for calculating and formatting durations
 */

import type { Clip, ID } from '@/types';

/**
 * Convert beats to seconds based on tempo
 * @param beats - Number of beats (quarter notes in 4/4 time)
 * @param tempo - Tempo in BPM (beats per minute)
 * @returns Duration in seconds
 */
export const beatsToSeconds = (beats: number, tempo: number): number => {
  // BPM is beats per minute
  // So beats per second = BPM / 60
  // Time for N beats = N / (BPM / 60) = (N * 60) / BPM
  return (beats * 60) / tempo;
};

/**
 * Format duration in seconds as MM:SS
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (MM:SS)
 */
export const formatDuration = (seconds: number): string => {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = remainingSeconds.toString().padStart(2, '0');

  return `${minutesStr}:${secondsStr}`;
};

/**
 * Calculate global duration from start to the end of the rightmost clip
 * @param clips - Array of clips
 * @returns Duration in beats
 */
export const calculateGlobalDuration = (clips: Clip[]): number => {
  if (clips.length === 0) {
    return 0;
  }

  // Find the rightmost clip end position
  let maxEndPosition = 0;
  for (const clip of clips) {
    const endPosition = clip.position + clip.duration;
    if (endPosition > maxEndPosition) {
      maxEndPosition = endPosition;
    }
  }

  return maxEndPosition;
};

/**
 * Calculate total duration of selected clips
 * @param clips - Array of all clips
 * @param selectedIds - Array of selected clip IDs
 * @returns Sum of durations in beats
 */
export const calculateSelectedDuration = (clips: Clip[], selectedIds: ID[]): number => {
  if (clips.length === 0 || selectedIds.length === 0) {
    return 0;
  }

  const selectedIdsSet = new Set(selectedIds);
  let totalDuration = 0;

  for (const clip of clips) {
    if (selectedIdsSet.has(clip.id)) {
      totalDuration += clip.duration;
    }
  }

  return totalDuration;
};
