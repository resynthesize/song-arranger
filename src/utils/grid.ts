/**
 * Song Arranger - Grid Calculation Utilities
 * Shared grid metrics calculation for ruler and lane components
 */

import type { ViewportState } from '@/types';

/**
 * Metrics for adaptive grid rendering
 */
export interface GridMetrics {
  /** Interval between numbered bar lines (1, 2, 4, 8, or 16) */
  barInterval: number;
  /** Beat distance between grid lines */
  gridIntervalBeats: number;
  /** Number of bars visible in the viewport */
  barsVisible: number;
}

/**
 * Calculate adaptive grid metrics based on viewport and time signature
 *
 * The grid adapts to zoom level:
 * - More than 128 bars visible: show every 16th bar
 * - More than 64 bars visible: show every 8th bar
 * - More than 32 bars visible: show every 4th bar
 * - More than 16 bars visible: show every 2nd bar
 * - Otherwise: show every bar
 *
 * Grid lines always divide the space between numbered bars into 4 equal sections
 *
 * @param viewport - Current viewport state (zoom, offset, dimensions)
 * @param beatsPerBar - Number of beats per bar (typically 4 for 4/4 time)
 * @returns Grid metrics for rendering
 */
export function calculateGridMetrics(
  viewport: ViewportState,
  beatsPerBar: number
): GridMetrics {
  // Calculate visible range in beats using viewport
  const startBeat = viewport.offsetBeats;
  const beatsVisible = viewport.widthPx / viewport.zoom;
  const endBeat = startBeat + beatsVisible;

  // Calculate visible bars
  const startBar = Math.floor(startBeat / beatsPerBar);
  const endBar = Math.ceil(endBeat / beatsPerBar);
  const barsVisible = endBar - startBar;

  // Determine bar line interval based on visible bars
  // Show fewer bar numbers when zoomed out, more when zoomed in
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

  // Calculate grid interval: always 4 divisions between consecutive bar numbers
  const gridIntervalBeats = (barInterval * beatsPerBar) / 4;

  return {
    barInterval,
    gridIntervalBeats,
    barsVisible,
  };
}
