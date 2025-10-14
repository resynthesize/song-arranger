/**
 * Song Arranger - Color Palette Constants
 * Centralized color palettes for theme-aware track colors
 */

/**
 * Retro terminal-inspired color palette - bright, saturated colors
 * Perfect for the classic VT terminal aesthetic
 */
export const RETRO_COLOR_PALETTE: readonly (readonly string[])[] = [
  // Green variants (classic terminal)
  ['#001100', '#002200', '#003300', '#004400', '#005500', '#006600', '#007700', '#008800', '#00ff00'],
  // Amber/Yellow variants
  ['#221100', '#443300', '#665500', '#887700', '#aa9900', '#ccbb00', '#ffdd00', '#ffee00', '#ffff00'],
  // Blue variants
  ['#000033', '#000066', '#000099', '#0000cc', '#0000ff', '#0033ff', '#0066ff', '#0099ff', '#00ccff'],
  // Red variants
  ['#330000', '#660000', '#990000', '#cc0000', '#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00'],
  // Purple/Magenta variants
  ['#330033', '#660066', '#990099', '#cc00cc', '#ff00ff', '#ff33ff', '#ff66ff', '#ff99ff', '#ffccff'],
  // White/Gray variants
  ['#111111', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd', '#eeeeee', '#ffffff'],
];

/**
 * Modern professional palette - muted, desaturated colors
 * Inspired by Ableton Live & Logic Pro for a professional DAW appearance
 */
export const MODERN_COLOR_PALETTE: readonly (readonly string[])[] = [
  // Blues - professional, calming
  ['#2d4a5e', '#3d5a6e', '#4d6a7e', '#5d7a8e', '#6d8a9e', '#7d9aae', '#8daabd', '#9dbacd', '#adcadd'],
  // Greens - muted, earthy
  ['#3d4d3e', '#4d5d4e', '#5d6d5e', '#6d7d6e', '#7d8d7e', '#8d9d8e', '#9dad9d', '#adbdad', '#bdcdbd'],
  // Oranges/Ambers - warm but subdued
  ['#5d4a3d', '#6d5a4d', '#7d6a5d', '#8d7a6d', '#9d8a7d', '#ad9a8d', '#bdaa9d', '#cdbaad', '#ddcabd'],
  // Reds/Pinks - desaturated, professional
  ['#5d3d3d', '#6d4d4d', '#7d5d5d', '#8d6d6d', '#9d7d7d', '#ad8d8d', '#bd9d9d', '#cdadad', '#ddbdbd'],
  // Purples - subtle, elegant
  ['#4d3d5d', '#5d4d6d', '#6d5d7d', '#7d6d8d', '#8d7d9d', '#9d8dad', '#ad9dbd', '#bdadcd', '#cdbddd'],
  // Grays/Neutrals - professional, versatile
  ['#2d2d2d', '#3d3d3d', '#4d4d4d', '#5d5d5d', '#7d7d7d', '#9d9d9d', '#bdbdbd', '#cdcdcd', '#efefef'],
];

/**
 * Modern track color sequence - used for assigning colors to imported/created tracks
 * Flattened selection of the most distinguishable colors from the modern palette
 */
export const MODERN_TRACK_COLORS = [
  '#6d8a9e', // Muted blue
  '#7d8d7e', // Muted green
  '#8d7a6d', // Muted amber/orange
  '#8d6d6d', // Muted red/pink
  '#7d6d8d', // Muted purple
  '#7d7d7d', // Neutral gray
  '#9dbacd', // Lighter blue
  '#9dad9d', // Lighter green
] as const;

/**
 * Retro track color sequence - used for assigning colors to imported/created tracks
 * Bright, saturated colors for the terminal aesthetic
 */
export const RETRO_TRACK_COLORS = [
  '#00ff00', // Green
  '#00ffff', // Cyan
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
  '#ff8800', // Orange
  '#0088ff', // Blue
  '#88ff00', // Lime
  '#ff0088', // Pink
] as const;

/**
 * Default track color - muted blue that works well in both themes
 */
export const DEFAULT_TRACK_COLOR = '#6d8a9e';
