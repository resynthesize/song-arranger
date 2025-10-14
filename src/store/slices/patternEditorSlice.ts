/**
 * Cyclone - Pattern Editor Slice
 * Redux state management for pattern editor UI
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PatternEditorState, ID, PatternRow } from '@/types';
import { logger } from '@/utils/debug';

const MIN_EDITOR_HEIGHT = 100; // Minimum editor pane height in pixels

const initialState: PatternEditorState = {
  openPatternId: null,
  selectedRow: 'note',
  selectedSteps: [],
  currentBarIndex: 0,
  editorHeight: 400, // Default 400px
  clipboardSteps: null,
  viewMode: 'parameters',
};

const patternEditorSlice = createSlice({
  name: 'patternEditor',
  initialState,
  reducers: {
    /**
     * Open pattern editor for a pattern
     * Resets editing state but preserves height and clipboard
     */
    openPattern: (state, action: PayloadAction<ID>) => {
      logger.log('[openPattern] Opening pattern', { patternId: action.payload });
      state.openPatternId = action.payload;
      // Reset editing state when opening pattern
      state.selectedRow = 'note';
      state.selectedSteps = [];
      state.currentBarIndex = 0;
      state.viewMode = 'parameters';
      // Preserve editorHeight and clipboardSteps
    },

    /**
     * Close pattern editor
     * Resets editing state but preserves height and clipboard
     */
    closePattern: (state) => {
      logger.log('[closePattern] Closing pattern editor');
      state.openPatternId = null;
      state.selectedRow = 'note';
      state.selectedSteps = [];
      state.currentBarIndex = 0;
      state.viewMode = 'parameters';
      // Preserve editorHeight and clipboardSteps
    },

    /**
     * Select a row for editing
     */
    selectRow: (state, action: PayloadAction<PatternRow>) => {
      state.selectedRow = action.payload;
    },

    /**
     * Set selected steps (replaces current selection)
     */
    selectSteps: (state, action: PayloadAction<number[]>) => {
      state.selectedSteps = action.payload;
    },

    /**
     * Toggle a single step selection
     * Adds step if not selected, removes if already selected
     */
    toggleStepSelection: (state, action: PayloadAction<number>) => {
      const stepIndex = action.payload;
      const currentIndex = state.selectedSteps.indexOf(stepIndex);

      if (currentIndex === -1) {
        // Step not selected, add it
        state.selectedSteps.push(stepIndex);
      } else {
        // Step already selected, remove it
        state.selectedSteps.splice(currentIndex, 1);
      }
    },

    /**
     * Clear all selected steps
     */
    clearStepSelection: (state) => {
      state.selectedSteps = [];
    },

    /**
     * Navigate to a different bar
     */
    setCurrentBar: (state, action: PayloadAction<number>) => {
      state.currentBarIndex = Math.max(0, action.payload);
    },

    /**
     * Update editor pane height
     */
    setEditorHeight: (state, action: PayloadAction<number>) => {
      state.editorHeight = Math.max(MIN_EDITOR_HEIGHT, action.payload);
    },

    /**
     * Copy steps to clipboard
     */
    copySteps: (
      state,
      action: PayloadAction<{
        steps: number[];
        barIndex: number;
        row: PatternRow;
        values: unknown[];
      }>
    ) => {
      const { steps, barIndex, row, values } = action.payload;
      logger.log('[copySteps] Copying steps to clipboard', {
        steps,
        barIndex,
        row,
        valueCount: values.length,
      });

      state.clipboardSteps = {
        steps,
        barIndex,
        row,
        values,
      };
    },

    /**
     * Clear clipboard
     */
    clearClipboard: (state) => {
      logger.log('[clearClipboard] Clearing clipboard');
      state.clipboardSteps = null;
    },

    /**
     * Toggle view mode between parameters and aux
     * Resets selectedRow to first row of new view
     */
    toggleViewMode: (state) => {
      state.viewMode = state.viewMode === 'parameters' ? 'aux' : 'parameters';
      // Reset selected row to first row of new view
      state.selectedRow = state.viewMode === 'parameters' ? 'note' : 'auxA';
    },
  },
});

export const {
  openPattern,
  closePattern,
  selectRow,
  selectSteps,
  toggleStepSelection,
  clearStepSelection,
  setCurrentBar,
  setEditorHeight,
  copySteps,
  clearClipboard,
  toggleViewMode,
} = patternEditorSlice.actions;

export default patternEditorSlice.reducer;
