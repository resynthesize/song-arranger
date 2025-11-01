/**
 * Cyclone - usePatternEditorKeyboard Hook
 * Handles keyboard navigation and shortcuts for PatternEditor
 */

import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { Pattern, PatternRow } from '@/types';
import type { P3Bar } from '@/types/patternData';
import { selectRow, selectSteps } from '@/store/slices/patternEditorSlice';
import { updateStepValueInTimeline, updateStepNoteInTimeline } from '@/store/slices/songSlice/slice';

const PARAMETER_ROWS: PatternRow[] = ['note', 'velocity', 'length', 'delay'];
const AUX_ROWS: PatternRow[] = ['auxA', 'auxB', 'auxC', 'auxD'];

interface UsePatternEditorKeyboardParams {
  editingStep: {
    row: PatternRow;
    stepIndex: number;
    position: { top: number; left: number };
  } | null;
  selectedRow: PatternRow;
  viewMode: 'parameters' | 'aux';
  focusedStepIndex: number;
  setFocusedStepIndex: (index: number) => void;
  openPatternId: string | null;
  pattern: Pattern | null | undefined;
  currentBarIndex: number;
  handleStepClick: (row: PatternRow, stepIndex: number) => void;
}

/**
 * Get current step value from bar data
 */
const getCurrentStepValue = (bar: P3Bar, row: PatternRow, stepIndex: number): number => {
  switch (row) {
    case 'note':
      return 0; // Notes are strings, can't increment
    case 'velocity':
      return bar.velo[stepIndex] ?? 64;
    case 'length':
      return bar.length[stepIndex] ?? 24;
    case 'delay':
      return bar.delay[stepIndex] ?? 0;
    case 'auxA':
      return bar.aux_A_value[stepIndex] ?? 0;
    case 'auxB':
      return bar.aux_B_value[stepIndex] ?? 0;
    case 'auxC':
      return bar.aux_C_value[stepIndex] ?? 0;
    case 'auxD':
      return bar.aux_D_value[stepIndex] ?? 0;
    default:
      return 0;
  }
};

/**
 * Custom hook for PatternEditor keyboard navigation
 * Handles arrow keys, Enter, +/- for value adjustment
 */
export const usePatternEditorKeyboard = ({
  editingStep,
  selectedRow,
  viewMode,
  focusedStepIndex,
  setFocusedStepIndex,
  openPatternId,
  pattern,
  currentBarIndex,
  handleStepClick,
}: UsePatternEditorKeyboardParams) => {
  const dispatch = useDispatch();

  /**
   * Update a step value (numeric or note)
   */
  const updateValue = useCallback(
    (row: PatternRow, stepIndex: number, value: number | string) => {
      if (!openPatternId) {
        return;
      }

      if (row === 'note') {
        // For note row, dispatch note update with string value
        dispatch(
          updateStepNoteInTimeline({
            patternReactId: openPatternId,
            barIndex: currentBarIndex,
            stepIndex,
            note: String(value),
          })
        );
      } else {
        // For numeric rows, dispatch value update
        dispatch(
          updateStepValueInTimeline({
            patternReactId: openPatternId,
            barIndex: currentBarIndex,
            stepIndex,
            row,
            value: Number(value),
          })
        );
      }
    },
    [openPatternId, currentBarIndex, dispatch]
  );

  /**
   * Handle keyboard events for navigation and editing
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle keyboard when editor is open
      if (editingStep) {
        return;
      }

      // Don't handle if no row is selected
      if (!selectedRow) {
        return;
      }

      const currentRows = viewMode === 'parameters' ? PARAMETER_ROWS : AUX_ROWS;
      const currentRowIndex = currentRows.indexOf(selectedRow);

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (focusedStepIndex > 0) {
            const newIndex = focusedStepIndex - 1;
            setFocusedStepIndex(newIndex);
            dispatch(selectSteps([newIndex]));
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (focusedStepIndex < 15) {
            const newIndex = focusedStepIndex + 1;
            setFocusedStepIndex(newIndex);
            dispatch(selectSteps([newIndex]));
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (currentRowIndex > 0) {
            const newRow = currentRows[currentRowIndex - 1];
            if (newRow) {
              dispatch(selectRow(newRow));
              // Keep the same focused step index
              dispatch(selectSteps([focusedStepIndex]));
            }
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (currentRowIndex < currentRows.length - 1) {
            const newRow = currentRows[currentRowIndex + 1];
            if (newRow) {
              dispatch(selectRow(newRow));
              // Keep the same focused step index
              dispatch(selectSteps([focusedStepIndex]));
            }
          }
          break;

        case 'Enter':
          e.preventDefault();
          handleStepClick(selectedRow, focusedStepIndex);
          break;

        case '+':
        case '=':
          e.preventDefault();
          if (openPatternId && pattern && pattern.patternData) {
            const bar = pattern.patternData.bars[currentBarIndex];
            if (bar) {
              const currentVal = getCurrentStepValue(bar, selectedRow, focusedStepIndex);
              const newVal = currentVal + (e.shiftKey ? 10 : 1);
              updateValue(selectedRow, focusedStepIndex, newVal);
            }
          }
          break;

        case '-':
        case '_':
          e.preventDefault();
          if (openPatternId && pattern && pattern.patternData) {
            const bar = pattern.patternData.bars[currentBarIndex];
            if (bar) {
              const currentVal = getCurrentStepValue(bar, selectedRow, focusedStepIndex);
              const newVal = currentVal - (e.shiftKey ? 10 : 1);
              updateValue(selectedRow, focusedStepIndex, newVal);
            }
          }
          break;
      }
    },
    [
      editingStep,
      selectedRow,
      viewMode,
      focusedStepIndex,
      setFocusedStepIndex,
      dispatch,
      handleStepClick,
      openPatternId,
      pattern,
      currentBarIndex,
      updateValue,
    ]
  );

  // Attach keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
