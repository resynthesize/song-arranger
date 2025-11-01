/**
 * Cyclone - PatternEditor Component
 * Container component for editing P3 pattern data
 */

import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, PatternRow, BarParameter } from '@/types';
import type { P3PatternData, P3Bar } from '@/types/patternData';
import { closePattern, selectRow, selectSteps, setCurrentBar, toggleViewMode, toggleRowVisibility } from '@/store/slices/patternEditorSlice';
import {
  updateStepValueInTimeline,
  updateStepNoteInTimeline,
  toggleGateInTimeline,
  toggleAuxFlagInTimeline,
  updateBarParameterInTimeline,
  updatePatternBarCountInTimeline,
} from '@/store/slices/songSlice/slice';
import { selectPatternById } from '@/store/selectors';
import { ViewModeToggle } from '@/components/atoms/ViewModeToggle';
import { RowVisibilityToolbar } from '@/components/atoms/RowVisibilityToolbar/RowVisibilityToolbar';
import { PatternRow as PatternRowComponent } from '@/components/molecules/PatternRow/PatternRow';
import { BarParametersRow } from '@/components/molecules/BarParametersRow';
import { StepValueEditor, PatternEditorHeader } from '@/components/molecules';
import { usePatternEditorKeyboard } from '@/hooks/usePatternEditorKeyboard';
import styles from './PatternEditor.module.css';

// Row groups for different view modes
const PARAMETER_ROWS: PatternRow[] = ['note', 'velocity', 'length', 'delay'];
const AUX_ROWS: PatternRow[] = ['auxA', 'auxB', 'auxC', 'auxD'];

/**
 * Get label for a row based on pattern data
 * Uses compact abbreviations for space efficiency
 */
const getRowLabel = (row: PatternRow, patternData: P3PatternData): string => {
  switch (row) {
    case 'note':
      return 'N';
    case 'velocity':
      return 'V';
    case 'length':
      return 'L';
    case 'delay':
      return 'D';
    case 'auxA':
      return patternData.aux_A || 'A';
    case 'auxB':
      return patternData.aux_B || 'B';
    case 'auxC':
      return patternData.aux_C || 'C';
    case 'auxD':
      return patternData.aux_D || 'D';
  }
};

/**
 * Get current value for editing step
 */
const getCurrentEditingValue = (
  editingStep: { row: PatternRow; stepIndex: number } | null,
  currentBar: P3Bar | undefined
): number | string => {
  if (!editingStep || !currentBar) {
    return '';
  }

  const { row, stepIndex } = editingStep;

  switch (row) {
    case 'note':
      return currentBar.note[stepIndex] ?? '';
    case 'velocity':
      return currentBar.velo[stepIndex] ?? 64;
    case 'length':
      return currentBar.length[stepIndex] ?? 24;
    case 'delay':
      return currentBar.delay[stepIndex] ?? 0;
    case 'auxA':
      return currentBar.aux_A_value[stepIndex] ?? 0;
    case 'auxB':
      return currentBar.aux_B_value[stepIndex] ?? 0;
    case 'auxC':
      return currentBar.aux_C_value[stepIndex] ?? 0;
    case 'auxD':
      return currentBar.aux_D_value[stepIndex] ?? 0;
    default:
      return '';
  }
};

const PatternEditor = () => {
  const dispatch = useDispatch();

  // Get pattern editor state
  const openPatternId = useSelector((state: RootState) => state.patternEditor.openPatternId);
  const editorHeight = useSelector((state: RootState) => state.patternEditor.editorHeight);
  const selectedRow = useSelector((state: RootState) => state.patternEditor.selectedRow);
  const selectedSteps = useSelector((state: RootState) => state.patternEditor.selectedSteps);
  const currentBarIndex = useSelector((state: RootState) => state.patternEditor.currentBarIndex);
  const viewMode = useSelector((state: RootState) => state.patternEditor.viewMode);
  const visibleRows = useSelector((state: RootState) => state.patternEditor.visibleRows);

  // Local state for editing
  const [editingStep, setEditingStep] = useState<{
    row: PatternRow;
    stepIndex: number;
    position: { top: number; left: number };
  } | null>(null);

  // Track which step has keyboard focus (separate from selection)
  const [focusedStepIndex, setFocusedStepIndex] = useState<number>(0);

  // Get the actual pattern data using the proper selector
  const pattern = useSelector((state: RootState) =>
    openPatternId ? selectPatternById(state, openPatternId) : null
  );

  // Handle step click to open editor
  const handleStepClick = useCallback((row: PatternRow, stepIndex: number) => {
    // Select the row
    dispatch(selectRow(row));

    // Update focused step index
    setFocusedStepIndex(stepIndex);

    // Update selected steps
    dispatch(selectSteps([stepIndex]));

    // Calculate position for the editor (centered on screen for now)
    const position = {
      top: window.innerHeight / 2 - 100,
      left: window.innerWidth / 2 - 125,
    };

    setEditingStep({ row, stepIndex, position });
  }, [dispatch]);

  // Use keyboard navigation hook
  usePatternEditorKeyboard({
    editingStep,
    selectedRow,
    viewMode,
    focusedStepIndex,
    setFocusedStepIndex,
    openPatternId,
    pattern,
    currentBarIndex,
    handleStepClick,
  });

  // Handle value submit from editor
  const handleValueSubmit = useCallback(
    (value: number | string) => {
      if (!openPatternId || !editingStep) {
        return;
      }

      const { row, stepIndex } = editingStep;

      if (row === 'note') {
        // Update note value
        dispatch(
          updateStepNoteInTimeline({
            patternReactId: openPatternId,
            barIndex: currentBarIndex,
            stepIndex,
            note: String(value),
          })
        );
      } else {
        // Update numeric value
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

      // Close editor
      setEditingStep(null);
    },
    [openPatternId, editingStep, currentBarIndex, dispatch]
  );

  // Handle cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingStep(null);
  }, []);

  // Handle gate toggle (Shift+Click on step)
  const handleGateToggle = useCallback(
    (stepIndex: number) => {
      if (!openPatternId) {
        return;
      }

      dispatch(
        toggleGateInTimeline({
          patternReactId: openPatternId,
          barIndex: currentBarIndex,
          stepIndex,
        })
      );
    },
    [openPatternId, currentBarIndex, dispatch]
  );

  // Handle aux flag toggle (Alt+Shift+Click on step in aux row)
  // Returns a handler for a specific aux row
  const createAuxFlagToggleHandler = useCallback(
    (auxRow: 'auxA' | 'auxB' | 'auxC' | 'auxD') => {
      return (stepIndex: number) => {
        if (!openPatternId) {
          return;
        }

        dispatch(
          toggleAuxFlagInTimeline({
            patternReactId: openPatternId,
            barIndex: currentBarIndex,
            stepIndex,
            auxRow,
          })
        );
      };
    },
    [openPatternId, currentBarIndex, dispatch]
  );

  // Create value change handler for a specific row (used for drag-to-adjust)
  const createValueChangeHandler = useCallback(
    (row: PatternRow) => {
      return (stepIndex: number, value: number | string) => {
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
      };
    },
    [openPatternId, currentBarIndex, dispatch]
  );

  // Create bar parameter change handler
  const createBarParameterChangeHandler = useCallback(
    (parameter: BarParameter) => {
      return (barIndex: number, value: number | boolean) => {
        if (!openPatternId) {
          return;
        }

        dispatch(
          updateBarParameterInTimeline({
            patternReactId: openPatternId,
            barIndex,
            parameter,
            value,
          })
        );
      };
    },
    [openPatternId, dispatch]
  );

  // Initialize selection when pattern opens or row changes
  useEffect(() => {
    if (openPatternId && selectedSteps.length === 0) {
      // Select first step by default
      dispatch(selectSteps([0]));
      setFocusedStepIndex(0);
    }
  }, [openPatternId, selectedRow, selectedSteps.length, dispatch]);

  // Handle row visibility toggle (must be before early returns)
  const handleRowVisibilityToggle = useCallback((row: PatternRow) => {
    dispatch(toggleRowVisibility(row));
  }, [dispatch]);

  // Handle bar count change (must be before early returns)
  const handleBarCountChange = useCallback(
    (newBarCount: number) => {
      if (!openPatternId) {
        return;
      }

      dispatch(
        updatePatternBarCountInTimeline({
          patternReactId: openPatternId,
          newBarCount,
        })
      );
    },
    [openPatternId, dispatch]
  );

  // Don't render if no pattern is open (after all hooks have been called)
  if (!openPatternId) {
    return null;
  }

  // Don't render if pattern not found (after all hooks have been called)
  if (!pattern) {
    return null;
  }

  // Handle close button click
  const handleClose = () => {
    dispatch(closePattern());
  };

  // Handle bar navigation
  const handleBarChange = (barIndex: number) => {
    dispatch(setCurrentBar(barIndex));
  };

  // Handle view mode toggle
  const handleViewModeToggle = () => {
    dispatch(toggleViewMode());
  };

  // Show message if pattern type cannot be edited
  if (!pattern.patternData) {
    return (
      <div
        className={styles.editor}
        data-testid="pattern-editor"
        style={{ height: `${editorHeight}px` }}
      >
        <div className={styles.cannotEdit}>
          This pattern type cannot be edited
        </div>
      </div>
    );
  }

  // Extract metadata
  const barCount = pattern.patternData.bars.length;
  const auxA = pattern.patternData.aux_A || 'none';
  const auxB = pattern.patternData.aux_B || 'none';
  const auxC = pattern.patternData.aux_C || 'none';
  const auxD = pattern.patternData.aux_D || 'none';
  const patternLabel = pattern.label || 'Untitled Pattern';

  // Get current bar data
  const currentBar = pattern.patternData.bars[currentBarIndex];

  // Get timebase from current bar
  const timebase = currentBar?.tbase?.trim() || '16';

  // Handle invalid bar index
  if (!currentBar) {
    return (
      <div
        className={styles.editor}
        data-testid="pattern-editor"
        style={{ height: `${editorHeight}px` }}
      >
        <div className={styles.cannotEdit}>
          Invalid bar index
        </div>
      </div>
    );
  }

  // Get rows for current view mode and filter by visibility
  const allRows = viewMode === 'parameters' ? PARAMETER_ROWS : viewMode === 'aux' ? AUX_ROWS : [];
  const currentRows = allRows.filter(row => visibleRows[row]);

  // Create simplified row labels for toolbar (single letter)
  const toolbarRowLabels: Record<PatternRow, string> = {
    note: 'N',
    velocity: 'V',
    length: 'L',
    delay: 'D',
    auxA: 'A',
    auxB: 'B',
    auxC: 'C',
    auxD: 'D',
  };

  return (
    <div
      className={styles.editor}
      data-testid="pattern-editor"
      style={{ height: `${editorHeight}px` }}
    >
      {/* Header */}
      <PatternEditorHeader
        patternLabel={patternLabel}
        barCount={barCount}
        timebase={timebase}
        auxA={auxA}
        auxB={auxB}
        auxC={auxC}
        auxD={auxD}
        currentBarIndex={currentBarIndex}
        onBarChange={handleBarChange}
        onBarCountChange={handleBarCountChange}
        onClose={handleClose}
      />

      {/* Content */}
      <div className={styles.content} data-testid="pattern-editor-content">
        {viewMode === 'bar' ? (
          /* Bar parameters view */
          <div className={styles.multiRowContainer}>
            {/* Icon column - quick operations */}
            <div className={styles.iconColumn}>
              <ViewModeToggle viewMode={viewMode} onToggle={handleViewModeToggle} />
            </div>

            {/* Bar parameters display */}
            <div className={styles.column}>
              <div className={styles.rowWrapper}>
                <div className={styles.rowLabel}>R</div>
                <BarParametersRow
                  bars={pattern.patternData.bars}
                  parameter="reps"
                  currentBarIndex={currentBarIndex}
                  height={70}
                  onBarClick={handleBarChange}
                  onValueChange={createBarParameterChangeHandler('reps')}
                />
              </div>
              <div className={styles.rowWrapper}>
                <div className={styles.rowLabel}>X</div>
                <BarParametersRow
                  bars={pattern.patternData.bars}
                  parameter="xpose"
                  currentBarIndex={currentBarIndex}
                  height={70}
                  onBarClick={handleBarChange}
                  onValueChange={createBarParameterChangeHandler('xpose')}
                />
              </div>
              <div className={styles.rowWrapper}>
                <div className={styles.rowLabel}>G</div>
                <BarParametersRow
                  bars={pattern.patternData.bars}
                  parameter="gbar"
                  currentBarIndex={currentBarIndex}
                  height={70}
                  onBarClick={handleBarChange}
                  onValueChange={createBarParameterChangeHandler('gbar')}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Multi-row pattern display */
          <div className={styles.multiRowContainer}>
            {/* Icon column - quick operations */}
            <div className={styles.iconColumn}>
              <ViewModeToggle viewMode={viewMode} onToggle={handleViewModeToggle} />
              <RowVisibilityToolbar
                rows={allRows}
                visibleRows={visibleRows}
                rowLabels={toolbarRowLabels}
                onToggle={handleRowVisibilityToggle}
              />
            </div>

            {/* Single column - all rows */}
            <div className={styles.column}>
              {currentRows.map((row) => {
                if (!pattern.patternData) return null;

                // Create aux flag handler if this is an aux row
                const auxFlagHandler = (row === 'auxA' || row === 'auxB' || row === 'auxC' || row === 'auxD')
                  ? createAuxFlagToggleHandler(row)
                  : undefined;

                return (
                  <div key={row} className={styles.rowWrapper}>
                    <div className={styles.rowLabel}>
                      {getRowLabel(row, pattern.patternData)}
                    </div>
                    <PatternRowComponent
                      barData={currentBar}
                      row={row}
                      selectedSteps={selectedRow === row ? selectedSteps : []}
                      height={70}
                      onStepClick={(stepIndex) => {
                        handleStepClick(row, stepIndex);
                      }}
                      onGateToggle={handleGateToggle}
                      onAuxFlagToggle={auxFlagHandler}
                      onValueChange={createValueChangeHandler(row)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Value Editor Modal */}
      {editingStep && (
        <StepValueEditor
          row={editingStep.row}
          currentValue={getCurrentEditingValue(editingStep, currentBar)}
          stepIndex={editingStep.stepIndex}
          onSubmit={handleValueSubmit}
          onCancel={handleCancelEdit}
          position={editingStep.position}
        />
      )}
    </div>
  );
};

export default PatternEditor;
