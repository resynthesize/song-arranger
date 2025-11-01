/**
 * Bar Timeline Actions
 * All bar-related timeline operations (bar-level parameters)
 */

import type { PayloadAction, CaseReducer } from '@reduxjs/toolkit';
import type { CirklonSongData } from '@/utils/cirklon/types';
import { TimelinePayloads } from '../types';
import * as adapters from '../adapters';

/**
 * Update a bar parameter value (xpose, reps, or gbar)
 */
export const updateBarParameterInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.UpdateBarParameter>
> = (state, action) => {
  const { patternReactId, barIndex, parameter, value } = action.payload;

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const pattern = currentSong.patterns[location.patternName];
  if (!pattern || !pattern.bars || pattern.bars.length === 0) return;

  const bar = pattern.bars[barIndex];
  if (!bar) return;

  // Apply value constraints and update based on parameter type
  switch (parameter) {
    case 'xpose': {
      // Transpose: -60 to +60 semitones (5 octaves up/down)
      const constrainedValue = Math.min(Math.max(Number(value), -60), 60);
      bar.xpos = constrainedValue;
      break;
    }
    case 'reps': {
      // Repetitions: 1 to 99
      const constrainedValue = Math.min(Math.max(Number(value), 1), 99);
      bar.reps = constrainedValue;
      break;
    }
    case 'gbar': {
      // Global bar sync: boolean
      bar.gbar = Boolean(value);
      break;
    }
  }
};
