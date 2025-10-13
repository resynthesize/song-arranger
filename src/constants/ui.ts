/**
 * Song Arranger - UI Constants
 * Color scheme and styling constants for retro terminal aesthetic
 */

/**
 * Terminal color palette
 * Retro VT terminal aesthetic inspired by Monolake 8bit
 */
export const TERMINAL_COLORS = {
  /** Background color (pure black) */
  bg: '#000000',
  /** Primary terminal green */
  primary: '#00ff00',
  /** Secondary terminal green (darker) */
  secondary: '#008800',
  /** Highlight green (brighter) */
  highlight: '#66ff66',
  /** Grid line green (dark) */
  grid: '#003300',
  /** Dim grid line green (very dark) */
  gridDim: '#004400',
  /** Text color (matches primary) */
  text: '#00ff00',
  /** Error/warning red */
  error: '#ff0000',
  /** Muted/disabled gray-green */
  muted: '#005500',
} as const;

/**
 * Default lane colors
 * Used when no custom color is set
 */
export const DEFAULT_LANE_COLOR = TERMINAL_COLORS.primary;

/**
 * Available preset colors for lanes and clips
 */
export const PRESET_COLORS = [
  '#00ff00', // Green (default)
  '#00ffff', // Cyan
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
  '#ff8800', // Orange
  '#0088ff', // Blue
  '#ff0088', // Pink
  '#88ff00', // Lime
] as const;
