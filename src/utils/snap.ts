/**
 * Song Arranger - Snap Utility Functions
 * Functions for snapping positions and durations to musical grid
 */

/**
 * Snap a position to the nearest snap value
 * @param position - The position in beats to snap
 * @param snapValue - The snap interval in beats (e.g., 0.25 for 1/16th note, 1 for quarter note)
 * @returns The snapped position in beats
 */
export function snapToGrid(position: number, snapValue: number): number {
  // Handle zero snap value (no snapping)
  if (snapValue === 0) {
    return position;
  }

  // Don't allow negative positions
  if (position < 0) {
    return 0;
  }

  // Round to nearest snap interval
  const snapped = Math.round(position / snapValue) * snapValue;

  // Ensure we don't go negative after snapping
  return Math.max(0, snapped);
}

/**
 * Get the snap increment for drag operations
 * This returns the snap value itself, which represents the smallest
 * increment that positions can be moved by.
 * @param snapValue - The snap interval in beats
 * @returns The snap increment in beats
 */
export function getSnapIncrement(snapValue: number): number {
  return snapValue;
}
