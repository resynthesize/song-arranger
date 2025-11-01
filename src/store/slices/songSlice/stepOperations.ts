/**
 * Step Operations - Pattern step-level operations
 * Composable functions for toggling gates and aux flags
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import type { CirklonSongData } from '@/utils/cirklon/types';
import type { ID } from '@/types';
import * as adapters from './adapters';

/**
 * Toggle gate for a step in a pattern
 */
export function toggleGateInTimeline(
  state: CirklonSongData,
  action: PayloadAction<{
    patternReactId: ID;
    barIndex: number;
    stepIndex: number;
  }>
) {
  const { patternReactId, barIndex, stepIndex } = action.payload;

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  // Find pattern location from React ID
  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) return;

  const pattern = currentSong.patterns[location.patternName];
  if (!pattern || !pattern.bars) return;

  const bar = (pattern.bars as any)[barIndex];
  if (!bar || !bar.gate) return;

  // Toggle gate: 0 -> 1, 1 -> 0
  bar.gate[stepIndex] = bar.gate[stepIndex] === 1 ? 0 : 1;
}

/**
 * Toggle aux flag for a step in a pattern
 */
export function toggleAuxFlagInTimeline(
  state: CirklonSongData,
  action: PayloadAction<{
    patternReactId: ID;
    barIndex: number;
    stepIndex: number;
    auxRow: 'auxA' | 'auxB' | 'auxC' | 'auxD';
  }>
) {
  const { patternReactId, barIndex, stepIndex, auxRow } = action.payload;

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  // Find pattern location from React ID
  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) return;

  const pattern = currentSong.patterns[location.patternName];
  if (!pattern || !pattern.bars) return;

  const bar = (pattern.bars as any)[barIndex];
  if (!bar) return;

  // Toggle the appropriate aux flag
  const flagField = `${auxRow.slice(0, 3)}_${auxRow[3]}_flag`; // "auxA" -> "aux_A_flag"
  if (!bar[flagField]) return;

  bar[flagField][stepIndex] = bar[flagField][stepIndex] === 1 ? 0 : 1;
}
