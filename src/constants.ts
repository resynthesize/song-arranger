/**
 * Cyclone - Constants
 * Shared constants used across the application
 */

/** Number of beats per bar (4/4 time signature) */
export const BEATS_PER_BAR = 4;

/** Base lane height in pixels (before vertical zoom) */
export const LANE_HEIGHT = 80;
export const TRACK_HEIGHT = LANE_HEIGHT; // Alias for renamed concept

/** Ruler height in pixels */
export const RULER_HEIGHT = 50;

/** Lane header width in pixels */
export const LANE_HEADER_WIDTH = 150;

/** Default lane color (legacy) */
export const DEFAULT_LANE_COLOR = '#00ff00';

// Import and re-export color palettes from centralized location
export {
  RETRO_COLOR_PALETTE,
  MODERN_COLOR_PALETTE,
  MODERN_TRACK_COLORS,
  RETRO_TRACK_COLORS,
  DEFAULT_TRACK_COLOR,
} from './constants/colors';

/** Default clip duration in beats */
export const DEFAULT_CLIP_DURATION = 4;

/** Discrete zoom levels for timeline (pixels per beat) */
export const ZOOM_LEVELS = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 200, 400, 800] as const;

/** Minimum zoom level (pixels per beat) */
export const MIN_ZOOM: number = 0.25;

/** Maximum zoom level (pixels per beat) */
export const MAX_ZOOM: number = 800;

/** Minimum vertical zoom percentage */
export const MIN_VERTICAL_ZOOM = 10;

/** Maximum vertical zoom percentage */
export const MAX_VERTICAL_ZOOM = 150;

/** Vertical zoom step size (percentage) */
export const VERTICAL_ZOOM_STEP = 10;

/** Minimum tempo in BPM */
export const MIN_TEMPO = 20;

/** Maximum tempo in BPM */
export const MAX_TEMPO = 300;

/** Default tempo in BPM */
export const DEFAULT_TEMPO = 120;

/** Minimap embedded height in pixels */
export const MINIMAP_EMBEDDED_HEIGHT = 40;

/** Minimap embedded minimum width in pixels */
export const MINIMAP_EMBEDDED_MIN_WIDTH = 200;

/** Minimap embedded padding in pixels */
export const MINIMAP_EMBEDDED_PADDING = 4;

/** Minimap overlay width in pixels */
export const MINIMAP_OVERLAY_WIDTH = 300;

/** Minimap lane height in pixels */
export const MINIMAP_LANE_HEIGHT = 8;

/** Minimap padding in pixels */
export const MINIMAP_PADDING = 8;
