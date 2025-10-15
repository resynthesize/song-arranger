/**
 * Cyclone - Design Tokens
 * Centralized design tokens for programmatic access in TypeScript/React
 * These values mirror the CSS variables in theme.css
 */

// Color Palette - Terminal Green
export const colors = {
  bg: '#000000',
  bgElevated: '#001100',
  primary: '#00ff00',
  secondary: '#008800',
  tertiary: '#006600',
  highlight: '#66ff66',
  grid: '#003300',
  dim: '#004400',
  disabled: '#002200',
  error: '#ff0000',
  warning: '#ffff00',
} as const;

// Typography
export const fonts = {
  primary: "'VT323', monospace",
  secondary: "'Share Tech Mono', monospace",
  fallback: "'Courier', monospace",
} as const;

// Font Sizes (using VT323 which requires larger sizes)
export const fontSizes = {
  xs: 14,
  sm: 16,
  base: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// Line Heights
export const lineHeights = {
  tight: 1.2,
  base: 1.5,
  relaxed: 1.8,
} as const;

// Font Weights
export const fontWeights = {
  normal: 400,
  bold: 700,
} as const;

// Spacing (8px grid system)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 2,
  md: 4,
} as const;

// Border Widths
export const borderWidths = {
  thin: 1,
  base: 2,
  thick: 3,
} as const;

// CRT Effects
export const crtEffects = {
  scanlineOpacity: 0.04,
  glowIntensity: {
    sm: 1,
    md: 2,
    lg: 4,
    xl: 6,
  },
  phosphorPersistence: 150, // ms
} as const;

// Z-Index Layers
export const zIndex = {
  base: 1,
  controls: 10,
  hud: 15,
  dropdown: 50,
  modal: 100,
  tooltip: 1000,
} as const;

// Transitions
export const transitions = {
  fast: '150ms ease-in-out',
  base: '250ms ease-in-out',
  slow: '350ms ease-in-out',
} as const;

// Animation Durations (in milliseconds)
export const durations = {
  instant: 0,
  fast: 150,
  base: 250,
  slow: 350,
  slower: 500,
} as const;

// Animation Timing Functions
export const easings = {
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Opacity Levels
export const opacity = {
  disabled: 0.4,
  muted: 0.6,
  hover: 0.8,
  full: 1,
} as const;

// Component Specific
export const components = {
  button: {
    paddingX: spacing.md,
    paddingY: spacing.sm,
  },
  input: {
    paddingX: spacing.sm,
    paddingY: spacing.xs,
  },
  panel: {
    padding: spacing.md,
  },
  footer: {
    height: 50,
  },
  cursor: {
    blinkDuration: 1000, // ms
  },
} as const;

// Type exports for better TypeScript inference
export type Color = typeof colors[keyof typeof colors];
export type Font = typeof fonts[keyof typeof fonts];
export type FontSize = typeof fontSizes[keyof typeof fontSizes];
export type LineHeight = typeof lineHeights[keyof typeof lineHeights];
export type FontWeight = typeof fontWeights[keyof typeof fontWeights];
export type Spacing = typeof spacing[keyof typeof spacing];
export type BorderRadius = typeof borderRadius[keyof typeof borderRadius];
export type BorderWidth = typeof borderWidths[keyof typeof borderWidths];
export type ZIndex = typeof zIndex[keyof typeof zIndex];
export type Transition = typeof transitions[keyof typeof transitions];
export type Duration = typeof durations[keyof typeof durations];
export type Easing = typeof easings[keyof typeof easings];
export type Opacity = typeof opacity[keyof typeof opacity];

// Helper function to convert numeric values to CSS pixel strings
export const px = (value: number): string => `${value}px`;

// Helper function to convert numeric values to CSS millisecond strings
export const ms = (value: number): string => `${value}ms`;

// Default export with all tokens
export default {
  colors,
  fonts,
  fontSizes,
  lineHeights,
  fontWeights,
  spacing,
  borderRadius,
  borderWidths,
  crtEffects,
  zIndex,
  transitions,
  durations,
  easings,
  opacity,
  components,
  px,
  ms,
} as const;
