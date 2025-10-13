/**
 * Song Arranger - Navigation Utilities
 * Functions for finding patterns in different directions for arrow key navigation
 */

import type { Pattern, Track } from '@/types';
import { logger } from './debug';

/**
 * Calculate the center position of a pattern
 */
const getPatternCenter = (pattern: Pattern): number => {
  return pattern.position + pattern.duration / 2;
};

/**
 * Find the nearest pattern to the east (right) in the same track
 * @param currentPattern - The currently selected pattern
 * @param allPatterns - All patterns in the timeline
 * @returns The nearest pattern to the right, or null if none exists
 */
export const findNearestClipEast = (
  currentPattern: Pattern,
  allPatterns: Pattern[]
): Pattern | null => {
  // Filter patterns in same track that are to the right (greater position)
  const patternsToRight = allPatterns.filter(
    (pattern) =>
      pattern.id !== currentPattern.id &&
      pattern.trackId === currentPattern.trackId &&
      pattern.position > currentPattern.position
  );

  if (patternsToRight.length === 0) {
    return null;
  }

  // Find pattern with smallest position (nearest)
  return patternsToRight.reduce((nearest, pattern) =>
    pattern.position < nearest.position ? pattern : nearest
  );
};

/**
 * Find the nearest pattern to the west (left) in the same track
 * @param currentPattern - The currently selected pattern
 * @param allPatterns - All patterns in the timeline
 * @returns The nearest pattern to the left, or null if none exists
 */
export const findNearestClipWest = (
  currentPattern: Pattern,
  allPatterns: Pattern[]
): Pattern | null => {
  // Filter patterns in same track that are to the left (lesser position)
  const patternsToLeft = allPatterns.filter(
    (pattern) =>
      pattern.id !== currentPattern.id &&
      pattern.trackId === currentPattern.trackId &&
      pattern.position < currentPattern.position
  );

  if (patternsToLeft.length === 0) {
    return null;
  }

  // Find pattern with largest position (nearest)
  return patternsToLeft.reduce((nearest, pattern) =>
    pattern.position > nearest.position ? pattern : nearest
  );
};

/**
 * Find the nearest pattern to the north (up) in the previous track
 * Searches for pattern in previous track with center position closest to current pattern's center
 * @param currentPattern - The currently selected pattern
 * @param allPatterns - All patterns in the timeline
 * @param tracks - All tracks in order
 * @returns The nearest pattern above, or null if none exists
 */
export const findNearestClipNorth = (
  currentPattern: Pattern,
  allPatterns: Pattern[],
  tracks: Track[]
): Pattern | null => {
  // Find index of current track
  const currentTrackIndex = tracks.findIndex((track) => track.id === currentPattern.trackId);

  // If first track or track not found, can't go north
  if (currentTrackIndex <= 0) {
    return null;
  }

  // Get previous track
  const previousTrack = tracks[currentTrackIndex - 1];
  if (!previousTrack) {
    return null;
  }

  // Filter patterns in previous track
  const patternsInPreviousTrack = allPatterns.filter(
    (pattern) => pattern.trackId === previousTrack.id
  );

  if (patternsInPreviousTrack.length === 0) {
    return null;
  }

  // Find pattern with center closest to current pattern's center
  const currentCenter = getPatternCenter(currentPattern);

  return patternsInPreviousTrack.reduce((nearest, pattern) => {
    const patternCenter = getPatternCenter(pattern);
    const nearestCenter = getPatternCenter(nearest);

    const patternDistance = Math.abs(patternCenter - currentCenter);
    const nearestDistance = Math.abs(nearestCenter - currentCenter);

    return patternDistance < nearestDistance ? pattern : nearest;
  });
};

/**
 * Find the nearest pattern to the south (down) in the next track
 * Searches for pattern in next track with center position closest to current pattern's center
 * @param currentPattern - The currently selected pattern
 * @param allPatterns - All patterns in the timeline
 * @param tracks - All tracks in order
 * @returns The nearest pattern below, or null if none exists
 */
export const findNearestClipSouth = (
  currentPattern: Pattern,
  allPatterns: Pattern[],
  tracks: Track[]
): Pattern | null => {
  // Find index of current track
  const currentTrackIndex = tracks.findIndex((track) => track.id === currentPattern.trackId);

  // If last track or track not found, can't go south
  if (currentTrackIndex === -1 || currentTrackIndex >= tracks.length - 1) {
    return null;
  }

  // Get next track
  const nextTrack = tracks[currentTrackIndex + 1];
  if (!nextTrack) {
    return null;
  }

  // Filter patterns in next track
  const patternsInNextTrack = allPatterns.filter(
    (pattern) => pattern.trackId === nextTrack.id
  );

  if (patternsInNextTrack.length === 0) {
    return null;
  }

  // Find pattern with center closest to current pattern's center
  const currentCenter = getPatternCenter(currentPattern);

  return patternsInNextTrack.reduce((nearest, pattern) => {
    const patternCenter = getPatternCenter(pattern);
    const nearestCenter = getPatternCenter(nearest);

    const patternDistance = Math.abs(patternCenter - currentCenter);
    const nearestDistance = Math.abs(nearestCenter - currentCenter);

    return patternDistance < nearestDistance ? pattern : nearest;
  });
};

/**
 * Find the nearest neighboring pattern after deleting the current pattern
 * Priority: 1) Right in same track, 2) Left in same track, 3) Closest in any other track
 * @param deletedPattern - The pattern being deleted
 * @param allPatterns - All patterns in the timeline (excluding the deleted one)
 * @returns The nearest neighbor pattern, or null if no patterns exist
 */
export const findNearestNeighbor = (
  deletedPattern: Pattern,
  allPatterns: Pattern[]
): Pattern | null => {
  logger.log('[findNearestNeighbor] Starting search', {
    deletedPattern: { id: deletedPattern.id, trackId: deletedPattern.trackId, position: deletedPattern.position },
    totalPatterns: allPatterns.length
  });

  // Filter out the deleted pattern from consideration
  const otherPatterns = allPatterns.filter((pattern) => pattern.id !== deletedPattern.id);

  logger.log('[findNearestNeighbor] After filtering deleted pattern:', {
    remainingPatterns: otherPatterns.length
  });

  if (otherPatterns.length === 0) {
    logger.log('[findNearestNeighbor] No other patterns remaining');
    return null;
  }

  // Priority 1: Try to find pattern to the right in same track
  const patternToRight = findNearestClipEast(deletedPattern, otherPatterns);
  if (patternToRight) {
    logger.log('[findNearestNeighbor] Found pattern to the right (Priority 1):', patternToRight.id);
    return patternToRight;
  }

  // Priority 2: Try to find pattern to the left in same track
  const patternToLeft = findNearestClipWest(deletedPattern, otherPatterns);
  if (patternToLeft) {
    logger.log('[findNearestNeighbor] Found pattern to the left (Priority 2):', patternToLeft.id);
    return patternToLeft;
  }

  // Priority 3: Find closest pattern in any track
  // Calculate distance based on pattern center positions
  const deletedCenter = getPatternCenter(deletedPattern);

  const closestPattern = otherPatterns.reduce((nearest, pattern) => {
    const patternCenter = getPatternCenter(pattern);
    const nearestCenter = getPatternCenter(nearest);

    const patternDistance = Math.abs(patternCenter - deletedCenter);
    const nearestDistance = Math.abs(nearestCenter - deletedCenter);

    return patternDistance < nearestDistance ? pattern : nearest;
  });

  logger.log('[findNearestNeighbor] Found closest pattern in any track (Priority 3):', closestPattern.id);
  return closestPattern;
};
