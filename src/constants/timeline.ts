/**
 * Cyclone - Timeline Constants
 * Zoom levels, layout dimensions, and viewport configuration
 */

/**
 * Discrete zoom levels for better UX
 * From 0.25px/beat (ultra zoomed out, ~1024 bars visible) to 800px/beat (very zoomed in, 1/16th notes)
 */
export const ZOOM_LEVELS = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 200, 400, 800] as const;

/**
 * Minimum horizontal zoom level (pixels per beat)
 */
export const MIN_ZOOM = ZOOM_LEVELS[0];

/**
 * Maximum horizontal zoom level (pixels per beat)
 */
export const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1];

/**
 * Minimum vertical zoom percentage (10% = 8px lane height, ~75 tracks in 600px viewport)
 */
export const MIN_VERTICAL_ZOOM = 10;

/**
 * Maximum vertical zoom percentage (150% = 120px lane height, ~5 tracks in 600px viewport)
 */
export const MAX_VERTICAL_ZOOM = 150;

/**
 * Vertical zoom step size (percentage points)
 */
export const VERTICAL_ZOOM_STEP = 10;

/**
 * Lane height in pixels (base size at 100% vertical zoom)
 */
export const LANE_HEIGHT = 80;

/**
 * Ruler height in pixels
 */
export const RULER_HEIGHT = 50;

/**
 * Lane header width in pixels
 */
export const LANE_HEADER_WIDTH = 150;

/**
 * Minimap lane height in pixels (overlay mode)
 */
export const MINIMAP_LANE_HEIGHT = 20;

/**
 * Minimap padding in pixels (overlay mode)
 */
export const MINIMAP_PADDING = 4;

/**
 * Minimap embedded height in pixels (menu bar mode)
 */
export const MINIMAP_EMBEDDED_HEIGHT = 32;

/**
 * Minimap embedded minimum width in pixels
 */
export const MINIMAP_EMBEDDED_MIN_WIDTH = 300;

/**
 * Minimap embedded padding in pixels
 */
export const MINIMAP_EMBEDDED_PADDING = 2;

/**
 * Minimap overlay width in pixels (floating window mode)
 */
export const MINIMAP_OVERLAY_WIDTH = 400;

/**
 * Track collapsed height in pixels (minimal height when track is folded)
 */
export const TRACK_COLLAPSED_HEIGHT = 30;

/**
 * Minimum track height in pixels (cannot resize smaller than this)
 */
export const MIN_TRACK_HEIGHT = TRACK_COLLAPSED_HEIGHT;
