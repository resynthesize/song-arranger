/**
 * Song Arranger - Viewport Utilities
 * Coordinate conversion and viewport calculations for infinite scroll timeline
 */

import type { ViewportState } from '@/types';

/**
 * Calculate the visible beat range for the current viewport
 */
export function calculateVisibleRange(viewport: ViewportState): {
  startBeat: number;
  endBeat: number;
} {
  const startBeat = Math.floor(viewport.offsetBeats);
  const endBeat = Math.ceil(
    viewport.offsetBeats + viewport.widthPx / viewport.zoom
  );

  return { startBeat, endBeat };
}

/**
 * Convert a beat position to viewport pixel space
 * @param positionBeats - Position in beats
 * @param viewport - Current viewport state
 * @returns Position in pixels relative to viewport left edge (0 = left edge)
 */
export function beatsToViewportPx(
  positionBeats: number,
  viewport: ViewportState
): number {
  return (positionBeats - viewport.offsetBeats) * viewport.zoom;
}

/**
 * Convert viewport pixel position to beat position
 * @param pixelX - X position in pixels relative to viewport
 * @param viewport - Current viewport state
 * @returns Position in beats
 */
export function viewportPxToBeats(
  pixelX: number,
  viewport: ViewportState
): number {
  return viewport.offsetBeats + pixelX / viewport.zoom;
}

/**
 * Check if a beat range is visible in the viewport
 * @param startBeat - Start position in beats
 * @param endBeat - End position in beats (exclusive)
 * @param viewport - Current viewport state
 * @param margin - Optional margin in pixels for off-screen rendering
 * @returns true if the range is at least partially visible
 */
export function isRangeVisible(
  startBeat: number,
  endBeat: number,
  viewport: ViewportState,
  margin: number = 100
): boolean {
  const startPx = beatsToViewportPx(startBeat, viewport);
  const endPx = beatsToViewportPx(endBeat, viewport);

  // Ensure margin scales with zoom level to maintain consistent beat-based buffer
  // At high zoom levels, a fixed pixel margin becomes too small in terms of beats
  // Minimum 2 beats worth of margin ensures patterns don't disappear at high zoom
  const minMarginForZoom = viewport.zoom * 2;
  const effectiveMargin = Math.max(margin, minMarginForZoom);

  const isVisible = endPx >= -effectiveMargin && startPx <= viewport.widthPx + effectiveMargin;

  return isVisible;
}

/**
 * Clamp viewport offset to prevent negative scrolling
 * @param offsetBeats - Desired offset in beats
 * @returns Clamped offset (minimum 0)
 */
export function clampViewportOffset(offsetBeats: number): number {
  return Math.max(0, offsetBeats);
}

/**
 * Calculate new viewport offset for zoom-around-point
 * @param viewport - Current viewport state
 * @param mouseX - Mouse X position in viewport pixels
 * @param newZoom - New zoom level
 * @returns New offset to keep the beat under the mouse in the same position
 */
export function calculateZoomOffset(
  viewport: ViewportState,
  mouseX: number,
  newZoom: number
): number {
  // Calculate which beat is currently under the mouse
  const beatAtMouse = viewport.offsetBeats + mouseX / viewport.zoom;

  // Calculate new offset so that same beat stays under mouse
  const newOffset = beatAtMouse - mouseX / newZoom;

  return clampViewportOffset(newOffset);
}
