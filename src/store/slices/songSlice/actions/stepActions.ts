/**
 * Step Timeline Actions
 * All step-related timeline operations
 */

/**
 * Cyclone - Timeline Adapter Actions
 * Reducers that translate timeline UI operations to CKS mutations
 *
 * These actions work with React view model IDs and handle scene management automatically
 */

import type { PayloadAction, CaseReducer } from '@reduxjs/toolkit';
import { logger } from '@/utils/debug';
import type { CirklonSongData } from '@/utils/cirklon/types';
import { TimelinePayloads } from '../types';
import * as adapters from '../adapters';
import * as mutations from '../mutations';
import { DEFAULT_SCENE_LENGTH } from '../constants';
import { generateId } from '@/utils/id';

export const updateStepValueInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.UpdateStepValue>
> = (state, action) => {
  const { patternReactId, barIndex, stepIndex, row, value } = action.payload;

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const pattern = currentSong.patterns[location.patternName];
  if (!pattern || !pattern.bars || pattern.bars.length === 0) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bar = pattern.bars[barIndex] as any;
  if (!bar || !bar.velo || !bar.length || !bar.delay) return;

  // Apply value constraints based on row type
  let constrainedValue = value;

  switch (row) {
    case 'velocity':
      constrainedValue = Math.min(Math.max(value, 1), 127);
      bar.velo[stepIndex] = constrainedValue;
      break;
    case 'length':
      constrainedValue = Math.max(value, 0);
      bar.length[stepIndex] = constrainedValue;
      break;
    case 'delay':
      constrainedValue = Math.min(Math.max(value, 0), 47);
      bar.delay[stepIndex] = constrainedValue;
      break;
    case 'auxA':
      constrainedValue = Math.min(Math.max(value, 0), 127);
      bar.aux_A_value[stepIndex] = constrainedValue;
      break;
    case 'auxB':
      constrainedValue = Math.min(Math.max(value, 0), 127);
      bar.aux_B_value[stepIndex] = constrainedValue;
      break;
    case 'auxC':
      constrainedValue = Math.min(Math.max(value, 0), 127);
      bar.aux_C_value[stepIndex] = constrainedValue;
      break;
    case 'auxD':
      constrainedValue = Math.min(Math.max(value, 0), 127);
      bar.aux_D_value[stepIndex] = constrainedValue;
      break;
    case 'note':
      // Note is handled by updateStepNote
      break;
  }
};

/**
 * Update step note in pattern
 */
export const updateStepNoteInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.UpdateStepNote>
> = (state, action) => {
  const { patternReactId, barIndex, stepIndex, note } = action.payload;

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const pattern = currentSong.patterns[location.patternName];
  if (!pattern || !pattern.bars || pattern.bars.length === 0) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bar = pattern.bars[barIndex] as any;
  if (!bar || !bar.note) return;

  bar.note[stepIndex] = note;
};
