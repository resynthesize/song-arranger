/**
 * Cyclone - Patterns Slice
 * Redux state management for patterns
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PatternsState, Pattern, ID, Position, Duration, PatternRow } from '@/types';
import { logger } from '@/utils/debug';
import { generateId } from '@/utils/id';

const initialState: PatternsState = {
  patterns: [],
  editingPatternId: null,
};

const MIN_DURATION = 1; // Minimum pattern duration in beats

const patternsSlice = createSlice({
  name: 'patterns',
  initialState,
  reducers: {
    addPattern: (
      state,
      action: PayloadAction<{
        trackId: ID;
        position: Position;
        duration?: Duration;
        label?: string;
      }>
    ) => {
      const { trackId, position, duration = 4, label } = action.payload;
      const newPattern: Pattern = {
        id: generateId('pattern'),
        trackId,
        position,
        duration,
        label,
      };
      state.patterns.push(newPattern);
    },

    removePattern: (state, action: PayloadAction<ID>) => {
      state.patterns = state.patterns.filter((pattern) => pattern.id !== action.payload);
    },

    removePatterns: (state, action: PayloadAction<ID[]>) => {
      logger.log('[removePatterns reducer] Removing patterns', {
        patternIds: action.payload,
        beforeCount: state.patterns.length
      });
      const idsToRemove = new Set(action.payload);
      state.patterns = state.patterns.filter((pattern) => !idsToRemove.has(pattern.id));
      logger.log('[removePatterns reducer] After removal', {
        afterCount: state.patterns.length
      });
    },

    movePattern: (
      state,
      action: PayloadAction<{ patternId: ID; position: Position }>
    ) => {
      const { patternId, position } = action.payload;
      const pattern = state.patterns.find((c) => c.id === patternId);
      if (pattern) {
        pattern.position = Math.max(0, position);
      }
    },

    movePatterns: (
      state,
      action: PayloadAction<{ patternIds: ID[]; delta: number }>
    ) => {
      const { patternIds, delta } = action.payload;
      const patternIdsSet = new Set(patternIds);

      state.patterns.forEach((pattern) => {
        if (patternIdsSet.has(pattern.id)) {
          pattern.position = Math.max(0, pattern.position + delta);
        }
      });
    },

    resizePattern: (
      state,
      action: PayloadAction<{ patternId: ID; duration: Duration }>
    ) => {
      const { patternId, duration } = action.payload;
      const pattern = state.patterns.find((c) => c.id === patternId);
      if (pattern) {
        pattern.duration = Math.max(MIN_DURATION, duration);
      }
    },

    resizePatterns: (
      state,
      action: PayloadAction<{ patternIds: ID[]; factor: number }>
    ) => {
      const { patternIds, factor } = action.payload;
      const patternIdsSet = new Set(patternIds);

      state.patterns.forEach((pattern) => {
        if (patternIdsSet.has(pattern.id)) {
          pattern.duration = Math.max(MIN_DURATION, pattern.duration * factor);
        }
      });
    },

    updatePattern: (
      state,
      action: PayloadAction<{ patternId: ID; updates: Partial<Pattern> }>
    ) => {
      const { patternId, updates } = action.payload;
      const pattern = state.patterns.find((c) => c.id === patternId);
      if (pattern) {
        Object.assign(pattern, updates);
      }
    },

    duplicatePattern: (state, action: PayloadAction<ID>) => {
      const patternId = action.payload;
      const originalPattern = state.patterns.find((c) => c.id === patternId);
      if (originalPattern) {
        const newPattern: Pattern = {
          ...originalPattern,
          id: generateId('pattern'),
        };
        state.patterns.push(newPattern);
      }
    },

    duplicatePatterns: (state, action: PayloadAction<ID[]>) => {
      const patternIds = action.payload;
      const patternIdsSet = new Set(patternIds);
      const patternsToDuplicate = state.patterns.filter((c) => patternIdsSet.has(c.id));

      patternsToDuplicate.forEach((pattern) => {
        const newPattern: Pattern = {
          ...pattern,
          id: generateId('pattern'),
        };
        state.patterns.push(newPattern);
      });
    },

    updatePatternTrack: (
      state,
      action: PayloadAction<{ patternId: ID | ID[]; trackId: ID }>
    ) => {
      const { patternId, trackId } = action.payload;
      const patternIds = Array.isArray(patternId) ? patternId : [patternId];
      const patternIdsSet = new Set(patternIds);

      state.patterns.forEach((pattern) => {
        if (patternIdsSet.has(pattern.id)) {
          // Only mutate if actually changing - prevents unnecessary re-renders
          // This makes the reducer idempotent: calling it with the same track is a no-op
          if (pattern.trackId !== trackId) {
            pattern.trackId = trackId;
          }
        }
      });
    },

    duplicatePatternsWithOffset: (state, action: PayloadAction<ID[]>) => {
      const patternIds = action.payload;
      const patternIdsSet = new Set(patternIds);
      const patternsToDuplicate = state.patterns.filter((c) => patternIdsSet.has(c.id));

      patternsToDuplicate.forEach((pattern) => {
        const newPattern: Pattern = {
          ...pattern,
          id: generateId('pattern'),
          position: pattern.position + pattern.duration, // Offset by duration
        };
        state.patterns.push(newPattern);
      });
    },

    splitPattern: (
      state,
      action: PayloadAction<{ patternId: ID; position: Position }>
    ) => {
      const { patternId, position } = action.payload;
      const pattern = state.patterns.find((c) => c.id === patternId);

      if (pattern && position > pattern.position && position < pattern.position + pattern.duration) {
        // Create second half
        const newPattern: Pattern = {
          ...pattern,
          id: generateId('pattern'),
          position,
          duration: pattern.duration - (position - pattern.position),
        };

        // Truncate first half
        pattern.duration = position - pattern.position;

        state.patterns.push(newPattern);
      }
    },

    setPatternsDuration: (
      state,
      action: PayloadAction<{ patternIds: ID[]; duration: Duration }>
    ) => {
      const { patternIds, duration } = action.payload;
      const patternIdsSet = new Set(patternIds);

      state.patterns.forEach((pattern) => {
        if (patternIdsSet.has(pattern.id)) {
          pattern.duration = Math.max(MIN_DURATION, duration);
        }
      });
    },

    trimPatternStart: (
      state,
      action: PayloadAction<{ patternId: ID; amount: number }>
    ) => {
      const { patternId, amount } = action.payload;
      const pattern = state.patterns.find((c) => c.id === patternId);

      if (pattern && amount < pattern.duration - MIN_DURATION) {
        pattern.position += amount;
        pattern.duration -= amount;
      }
    },

    trimPatternEnd: (
      state,
      action: PayloadAction<{ patternId: ID; amount: number }>
    ) => {
      const { patternId, amount } = action.payload;
      const pattern = state.patterns.find((c) => c.id === patternId);

      if (pattern) {
        pattern.duration = Math.max(MIN_DURATION, pattern.duration - amount);
      }
    },

    setPatternMuted: (
      state,
      action: PayloadAction<{ patternId: ID; muted: boolean }>
    ) => {
      const { patternId, muted } = action.payload;
      const pattern = state.patterns.find((p) => p.id === patternId);
      if (pattern) {
        pattern.muted = muted;
      }
    },

    setPatternType: (
      state,
      action: PayloadAction<{ patternId: ID; patternType: 'P3' | 'CK' }>
    ) => {
      const { patternId, patternType } = action.payload;
      const pattern = state.patterns.find((p) => p.id === patternId);
      if (pattern) {
        pattern.patternType = patternType;
      }
    },

    setEditingPattern: (state, action: PayloadAction<ID>) => {
      state.editingPatternId = action.payload;
    },

    clearEditingPattern: (state) => {
      state.editingPatternId = null;
    },

    setPatterns: (state, action: PayloadAction<Pattern[]>) => {
      state.patterns = action.payload;
    },

    /**
     * Update a step value in a pattern's bar
     * Handles velocity, length, delay, and aux values with proper constraints
     */
    updateStepValue: (
      state,
      action: PayloadAction<{
        patternId: ID;
        barIndex: number;
        stepIndex: number;
        row: PatternRow;
        value: number;
      }>
    ) => {
      const { patternId, barIndex, stepIndex, row, value } = action.payload;
      const pattern = state.patterns.find((p) => p.id === patternId);

      if (!pattern || !pattern.patternData) {
        return;
      }

      const bar = pattern.patternData.bars[barIndex];
      if (!bar) {
        return;
      }

      // Apply value constraints based on row type
      let constrainedValue = value;

      switch (row) {
        case 'velocity':
          // Velocity: 1-127
          constrainedValue = Math.min(Math.max(value, 1), 127);
          bar.velo[stepIndex] = constrainedValue;
          break;

        case 'length':
          // Length: 0-47 ticks for fractional, up to larger values for whole steps
          // For now, we'll allow 0-127 to support various length values
          constrainedValue = Math.max(value, 0);
          bar.length[stepIndex] = constrainedValue;
          break;

        case 'delay':
          // Delay: 0-47
          constrainedValue = Math.min(Math.max(value, 0), 47);
          bar.delay[stepIndex] = constrainedValue;
          break;

        case 'auxA':
          // Aux A: 0-127 for MIDI CCs
          constrainedValue = Math.min(Math.max(value, 0), 127);
          bar.aux_A_value[stepIndex] = constrainedValue;
          break;

        case 'auxB':
          // Aux B: 0-127 for MIDI CCs
          constrainedValue = Math.min(Math.max(value, 0), 127);
          bar.aux_B_value[stepIndex] = constrainedValue;
          break;

        case 'auxC':
          // Aux C: 0-127 for MIDI CCs
          constrainedValue = Math.min(Math.max(value, 0), 127);
          bar.aux_C_value[stepIndex] = constrainedValue;
          break;

        case 'auxD':
          // Aux D: 0-127 for MIDI CCs
          constrainedValue = Math.min(Math.max(value, 0), 127);
          bar.aux_D_value[stepIndex] = constrainedValue;
          break;

        case 'note':
          // Note is handled by updateStepNote
          break;
      }
    },

    /**
     * Update a step note value
     * Notes are strings like "C 4", "D#5", etc.
     */
    updateStepNote: (
      state,
      action: PayloadAction<{
        patternId: ID;
        barIndex: number;
        stepIndex: number;
        note: string;
      }>
    ) => {
      const { patternId, barIndex, stepIndex, note } = action.payload;
      const pattern = state.patterns.find((p) => p.id === patternId);

      if (!pattern || !pattern.patternData) {
        return;
      }

      const bar = pattern.patternData.bars[barIndex];
      if (!bar) {
        return;
      }

      bar.note[stepIndex] = note;
    },

    /**
     * Toggle gate flag for a step
     */
    toggleGate: (
      state,
      action: PayloadAction<{
        patternId: ID;
        barIndex: number;
        stepIndex: number;
      }>
    ) => {
      const { patternId, barIndex, stepIndex } = action.payload;
      const pattern = state.patterns.find((p) => p.id === patternId);

      if (!pattern || !pattern.patternData) {
        return;
      }

      const bar = pattern.patternData.bars[barIndex];
      if (!bar) {
        return;
      }

      // Toggle: 0 -> 1, 1 -> 0
      bar.gate[stepIndex] = bar.gate[stepIndex] === 1 ? 0 : 1;
    },

    /**
     * Toggle aux flag for a step
     */
    toggleAuxFlag: (
      state,
      action: PayloadAction<{
        patternId: ID;
        barIndex: number;
        stepIndex: number;
        auxRow: 'auxA' | 'auxB' | 'auxC' | 'auxD';
      }>
    ) => {
      const { patternId, barIndex, stepIndex, auxRow } = action.payload;
      const pattern = state.patterns.find((p) => p.id === patternId);

      if (!pattern || !pattern.patternData) {
        return;
      }

      const bar = pattern.patternData.bars[barIndex];
      if (!bar) {
        return;
      }

      // Toggle the appropriate aux flag
      switch (auxRow) {
        case 'auxA':
          bar.aux_A_flag[stepIndex] = bar.aux_A_flag[stepIndex] === 1 ? 0 : 1;
          break;
        case 'auxB':
          bar.aux_B_flag[stepIndex] = bar.aux_B_flag[stepIndex] === 1 ? 0 : 1;
          break;
        case 'auxC':
          bar.aux_C_flag[stepIndex] = bar.aux_C_flag[stepIndex] === 1 ? 0 : 1;
          break;
        case 'auxD':
          bar.aux_D_flag[stepIndex] = bar.aux_D_flag[stepIndex] === 1 ? 0 : 1;
          break;
      }
    },
  },
});

export const {
  addPattern,
  removePattern,
  removePatterns,
  movePattern,
  movePatterns,
  resizePattern,
  resizePatterns,
  updatePattern,
  duplicatePattern,
  duplicatePatterns,
  updatePatternTrack,
  duplicatePatternsWithOffset,
  splitPattern,
  setPatternsDuration,
  trimPatternStart,
  trimPatternEnd,
  setPatternMuted,
  setPatternType,
  setEditingPattern,
  clearEditingPattern,
  setPatterns,
  updateStepValue,
  updateStepNote,
  toggleGate,
  toggleAuxFlag,
} = patternsSlice.actions;

export default patternsSlice.reducer;
