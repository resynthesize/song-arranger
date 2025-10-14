/**
 * Cyclone - Cirklon Conversion Utilities
 * Utilities for converting between Cirklon and Cyclone formats
 */

import type { CirklonScene } from './types';

/**
 * Convert bars to beats
 * @param bars Number of bars
 * @param beatsPerBar Beats per bar (default 4)
 * @returns Number of beats
 */
export function barsToBeats(bars: number, beatsPerBar: number = 4): number {
  return bars * beatsPerBar;
}

/**
 * Convert beats to bars
 * @param beats Number of beats
 * @param beatsPerBar Beats per bar (default 4)
 * @returns Number of bars
 */
export function beatsToBar(beats: number, beatsPerBar: number = 4): number {
  return beats / beatsPerBar;
}

/**
 * Calculate scene duration in beats
 * @param scene Cirklon scene
 * @param beatsPerBar Beats per bar (default 4)
 * @returns Duration in beats
 */
export function calculateSceneDuration(
  scene: CirklonScene,
  beatsPerBar: number = 4
): number {
  return barsToBeats(scene.length, beatsPerBar);
}

/**
 * Generate pattern name from track number and index
 * @param trackNum Track number (1-based)
 * @param index Pattern index
 * @param type Pattern type ('P3' or 'CK')
 * @returns Pattern name (e.g., "T1_P3_00")
 */
export function generatePatternName(
  trackNum: number,
  index: number,
  type: 'P3' | 'CK'
): string {
  const paddedIndex = index.toString().padStart(2, '0');
  return `T${trackNum}_${type}_${paddedIndex}`;
}
