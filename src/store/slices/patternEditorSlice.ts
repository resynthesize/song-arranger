/**
 * Cyclone - Pattern Editor Slice
 * Redux state management for pattern editor UI
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PatternEditorState, ID, PatternRow } from '@/types';
import { logger } from '@/utils/debug';
import { openScene } from './sceneEditorSlice';

const MIN_EDITOR_HEIGHT = 100; // Minimum editor pane height in pixels

const initialState: PatternEditorState = {
  openPatternId: null,
  selectedRow: 'note',
  selectedSteps: [],
  currentBarIndex: 0,
  editorHeight: 400, // Default 400px
  clipboardSteps: null,
  viewMode: 'parameters',
  // All rows visible by default
  visibleRows: {
    note: true,
    velocity: true,
    length: true,
    delay: true,
    auxA: true,
    auxB: true,
    auxC: true,
    auxD: true,
  },
  // No rows collapsed by default
  collapsedRows: {
    note: false,
    velocity: false,
    length: false,
    delay: false,
    auxA: false,
    auxB: false,
    auxC: false,
    auxD: false,
  },
};

const patternEditorSlice = createSlice({
  name: 'patternEditor',
  initialState,
  reducers: {
    /**
     * Open pattern editor for a pattern
     * Resets pattern-specific state but preserves UI preferences (view mode, selected row, height, clipboard)
     */
    openPattern: (state, action: PayloadAction<ID>) => {
      logger.log('[openPattern] Opening pattern', { patternId: action.payload });
      state.openPatternId = action.payload;
      // Reset pattern-specific state when opening pattern
      state.selectedSteps = [];
      state.currentBarIndex = 0;
      // Preserve viewMode, selectedRow, editorHeight, and clipboardSteps
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
     * Toggle view mode between parameters, aux, and bar
     * Cycles through: parameters -> aux -> bar -> parameters
     * Resets selectedRow to first row of new view
     */
    toggleViewMode: (state) => {
      // Cycle through modes
      if (state.viewMode === 'parameters') {
        state.viewMode = 'aux';
        state.selectedRow = 'auxA';
      } else if (state.viewMode === 'aux') {
        state.viewMode = 'bar';
        state.selectedRow = 'note'; // Bar mode doesn't use row selection
      } else {
        state.viewMode = 'parameters';
        state.selectedRow = 'note';
      }
    },

    /**
     * Toggle row visibility
     */
    toggleRowVisibility: (state, action: PayloadAction<PatternRow>) => {
      const row = action.payload;
      state.visibleRows[row] = !state.visibleRows[row];
    },

    /**
     * Set row visibility
     */
    setRowVisibility: (state, action: PayloadAction<{ row: PatternRow; visible: boolean }>) => {
      const { row, visible } = action.payload;
      state.visibleRows[row] = visible;
    },

    /**
     * Toggle row collapsed state
     */
    toggleRowCollapsed: (state, action: PayloadAction<PatternRow>) => {
      const row = action.payload;
      state.collapsedRows[row] = !state.collapsedRows[row];
    },

    /**
     * Set row collapsed state
     */
    setRowCollapsed: (state, action: PayloadAction<{ row: PatternRow; collapsed: boolean }>) => {
      const { row, collapsed } = action.payload;
      state.collapsedRows[row] = collapsed;
    },
  },
  extraReducers: (builder) => {
    // Close pattern editor when scene editor opens (mutual exclusion)
    builder.addCase(openScene, (state) => {
      if (state.openPatternId) {
        logger.log('[patternEditor] Closing pattern editor due to scene editor opening');
        state.openPatternId = null;
        state.selectedRow = 'note';
        state.selectedSteps = [];
        state.currentBarIndex = 0;
        state.viewMode = 'parameters';
      }
    });
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
  toggleRowVisibility,
  setRowVisibility,
  toggleRowCollapsed,
  setRowCollapsed,
} = patternEditorSlice.actions;

export default patternEditorSlice.reducer;
