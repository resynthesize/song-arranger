/**
 * Cyclone - Song Slice Constants
 * Configuration values for CKS scene management
 */

/**
 * Default scene length in beats
 * Cirklon typically works in bars, so 16 beats = 4 bars at 4/4 time
 */
export const DEFAULT_SCENE_LENGTH = 16;

/**
 * Default beats per bar for time signature
 */
export const DEFAULT_BEATS_PER_BAR = 4;

/**
 * Scene boundary snap granularity in beats
 * Patterns snap to this grid when creating/moving
 */
export const SCENE_SNAP_GRANULARITY = 16; // Match default scene length
