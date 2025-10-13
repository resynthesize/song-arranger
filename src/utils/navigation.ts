/**
 * Song Arranger - Navigation Utilities
 * Functions for finding clips in different directions for arrow key navigation
 */

import type { Clip, Lane } from '@/types';

/**
 * Calculate the center position of a clip
 */
const getClipCenter = (clip: Clip): number => {
  return clip.position + clip.duration / 2;
};

/**
 * Find the nearest clip to the east (right) in the same lane
 * @param currentClip - The currently selected clip
 * @param allClips - All clips in the timeline
 * @returns The nearest clip to the right, or null if none exists
 */
export const findNearestClipEast = (
  currentClip: Clip,
  allClips: Clip[]
): Clip | null => {
  // Filter clips in same lane that are to the right (greater position)
  const clipsToRight = allClips.filter(
    (clip) =>
      clip.id !== currentClip.id &&
      clip.laneId === currentClip.laneId &&
      clip.position > currentClip.position
  );

  if (clipsToRight.length === 0) {
    return null;
  }

  // Find clip with smallest position (nearest)
  return clipsToRight.reduce((nearest, clip) =>
    clip.position < nearest.position ? clip : nearest
  );
};

/**
 * Find the nearest clip to the west (left) in the same lane
 * @param currentClip - The currently selected clip
 * @param allClips - All clips in the timeline
 * @returns The nearest clip to the left, or null if none exists
 */
export const findNearestClipWest = (
  currentClip: Clip,
  allClips: Clip[]
): Clip | null => {
  // Filter clips in same lane that are to the left (lesser position)
  const clipsToLeft = allClips.filter(
    (clip) =>
      clip.id !== currentClip.id &&
      clip.laneId === currentClip.laneId &&
      clip.position < currentClip.position
  );

  if (clipsToLeft.length === 0) {
    return null;
  }

  // Find clip with largest position (nearest)
  return clipsToLeft.reduce((nearest, clip) =>
    clip.position > nearest.position ? clip : nearest
  );
};

/**
 * Find the nearest clip to the north (up) in the previous lane
 * Searches for clip in previous lane with center position closest to current clip's center
 * @param currentClip - The currently selected clip
 * @param allClips - All clips in the timeline
 * @param lanes - All lanes in order
 * @returns The nearest clip above, or null if none exists
 */
export const findNearestClipNorth = (
  currentClip: Clip,
  allClips: Clip[],
  lanes: Lane[]
): Clip | null => {
  // Find index of current lane
  const currentLaneIndex = lanes.findIndex((lane) => lane.id === currentClip.laneId);

  // If first lane or lane not found, can't go north
  if (currentLaneIndex <= 0) {
    return null;
  }

  // Get previous lane
  const previousLane = lanes[currentLaneIndex - 1];
  if (!previousLane) {
    return null;
  }

  // Filter clips in previous lane
  const clipsInPreviousLane = allClips.filter(
    (clip) => clip.laneId === previousLane.id
  );

  if (clipsInPreviousLane.length === 0) {
    return null;
  }

  // Find clip with center closest to current clip's center
  const currentCenter = getClipCenter(currentClip);

  return clipsInPreviousLane.reduce((nearest, clip) => {
    const clipCenter = getClipCenter(clip);
    const nearestCenter = getClipCenter(nearest);

    const clipDistance = Math.abs(clipCenter - currentCenter);
    const nearestDistance = Math.abs(nearestCenter - currentCenter);

    return clipDistance < nearestDistance ? clip : nearest;
  });
};

/**
 * Find the nearest clip to the south (down) in the next lane
 * Searches for clip in next lane with center position closest to current clip's center
 * @param currentClip - The currently selected clip
 * @param allClips - All clips in the timeline
 * @param lanes - All lanes in order
 * @returns The nearest clip below, or null if none exists
 */
export const findNearestClipSouth = (
  currentClip: Clip,
  allClips: Clip[],
  lanes: Lane[]
): Clip | null => {
  // Find index of current lane
  const currentLaneIndex = lanes.findIndex((lane) => lane.id === currentClip.laneId);

  // If last lane or lane not found, can't go south
  if (currentLaneIndex === -1 || currentLaneIndex >= lanes.length - 1) {
    return null;
  }

  // Get next lane
  const nextLane = lanes[currentLaneIndex + 1];
  if (!nextLane) {
    return null;
  }

  // Filter clips in next lane
  const clipsInNextLane = allClips.filter(
    (clip) => clip.laneId === nextLane.id
  );

  if (clipsInNextLane.length === 0) {
    return null;
  }

  // Find clip with center closest to current clip's center
  const currentCenter = getClipCenter(currentClip);

  return clipsInNextLane.reduce((nearest, clip) => {
    const clipCenter = getClipCenter(clip);
    const nearestCenter = getClipCenter(nearest);

    const clipDistance = Math.abs(clipCenter - currentCenter);
    const nearestDistance = Math.abs(nearestCenter - currentCenter);

    return clipDistance < nearestDistance ? clip : nearest;
  });
};

/**
 * Find the nearest neighboring clip after deleting the current clip
 * Priority: 1) Right in same lane, 2) Left in same lane, 3) Closest in any other lane
 * @param deletedClip - The clip being deleted
 * @param allClips - All clips in the timeline (excluding the deleted one)
 * @returns The nearest neighbor clip, or null if no clips exist
 */
export const findNearestNeighbor = (
  deletedClip: Clip,
  allClips: Clip[]
): Clip | null => {
  console.log('[findNearestNeighbor] Starting search', {
    deletedClip: { id: deletedClip.id, laneId: deletedClip.laneId, position: deletedClip.position },
    totalClips: allClips.length
  });

  // Filter out the deleted clip from consideration
  const otherClips = allClips.filter((clip) => clip.id !== deletedClip.id);

  console.log('[findNearestNeighbor] After filtering deleted clip:', {
    remainingClips: otherClips.length
  });

  if (otherClips.length === 0) {
    console.log('[findNearestNeighbor] No other clips remaining');
    return null;
  }

  // Priority 1: Try to find clip to the right in same lane
  const clipToRight = findNearestClipEast(deletedClip, otherClips);
  if (clipToRight) {
    console.log('[findNearestNeighbor] Found clip to the right (Priority 1):', clipToRight.id);
    return clipToRight;
  }

  // Priority 2: Try to find clip to the left in same lane
  const clipToLeft = findNearestClipWest(deletedClip, otherClips);
  if (clipToLeft) {
    console.log('[findNearestNeighbor] Found clip to the left (Priority 2):', clipToLeft.id);
    return clipToLeft;
  }

  // Priority 3: Find closest clip in any lane
  // Calculate distance based on clip center positions
  const deletedCenter = getClipCenter(deletedClip);

  const closestClip = otherClips.reduce((nearest, clip) => {
    const clipCenter = getClipCenter(clip);
    const nearestCenter = getClipCenter(nearest);

    const clipDistance = Math.abs(clipCenter - deletedCenter);
    const nearestDistance = Math.abs(nearestCenter - deletedCenter);

    return clipDistance < nearestDistance ? clip : nearest;
  });

  console.log('[findNearestNeighbor] Found closest clip in any lane (Priority 3):', closestClip.id);
  return closestClip;
};
