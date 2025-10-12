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
 * Snap a position to the left edge of its grid cell
 * Used for creating clips - if you click in a grid cell, the clip starts at the left edge
 * @param position - The position in beats to snap
 * @param snapValue - The snap interval in beats
 * @returns The snapped position (left edge of grid cell) in beats
 */
export function snapToGridFloor(position: number, snapValue: number): number {
  // Handle zero snap value (no snapping)
  if (snapValue === 0) {
    return position;
  }

  // Don't allow negative positions
  if (position < 0) {
    return 0;
  }

  // Floor to left edge of snap interval
  const snapped = Math.floor(position / snapValue) * snapValue;

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

/**
 * Calculate the dynamic grid snap value based on zoom level
 * This matches the ruler's bar number interval, divided by 4 to create
 * 4 evenly-spaced grid markers between consecutive bar numbers.
 * @param zoom - Pixels per beat
 * @param containerWidth - Optional container width (defaults to 1600px reference)
 * @returns The grid snap interval in beats
 */
export function calculateGridSnap(zoom: number, containerWidth: number = 1600): number {
  const BEATS_PER_BAR = 4;

  // Calculate visible range in beats and bars
  const beatsVisible = containerWidth / zoom;
  const barsVisible = beatsVisible / BEATS_PER_BAR;

  // Determine bar number interval based on visible bars
  // This matches the logic in Ruler.tsx
  let barInterval = 1;
  if (barsVisible > 128) {
    barInterval = 16; // Very zoomed out: every 16 bars
  } else if (barsVisible > 64) {
    barInterval = 8; // Every 8 bars
  } else if (barsVisible > 32) {
    barInterval = 4; // Every 4 bars
  } else if (barsVisible > 16) {
    barInterval = 2; // Every 2 bars
  }
  // else: show every bar (barInterval = 1)

  // Calculate grid snap: divide the interval between bar numbers into 4 parts
  // If barInterval = 8 bars (32 beats between numbers), grid snap = 8 beats
  const gridSnapBeats = barInterval * BEATS_PER_BAR / 4;

  return gridSnapBeats;
}
