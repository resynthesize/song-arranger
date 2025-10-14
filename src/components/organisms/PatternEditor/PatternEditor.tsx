/**
 * Cyclone - PatternEditor Component
 * Container component for editing P3 pattern data
 */

import { useSelector, useDispatch } from 'react-redux';
import type { RootState, PatternRow } from '@/types';
import type { P3PatternData } from '@/types/patternData';
import { closePattern, selectRow, setCurrentBar, toggleViewMode } from '@/store/slices/patternEditorSlice';
import { ViewModeToggle } from '@/components/atoms/ViewModeToggle';
import { PatternRow as PatternRowComponent } from '@/components/molecules/PatternRow/PatternRow';
import styles from './PatternEditor.module.css';

// Row groups for different view modes
const PARAMETER_ROWS: PatternRow[] = ['note', 'velocity', 'length', 'delay'];
const AUX_ROWS: PatternRow[] = ['auxA', 'auxB', 'auxC', 'auxD'];

/**
 * Get label for a row based on pattern data
 */
const getRowLabel = (row: PatternRow, patternData: P3PatternData): string => {
  switch (row) {
    case 'note':
      return 'NOTE';
    case 'velocity':
      return 'VELO';
    case 'length':
      return 'LENGTH';
    case 'delay':
      return 'DELAY';
    case 'auxA':
      return patternData.aux_A || 'AUX A';
    case 'auxB':
      return patternData.aux_B || 'AUX B';
    case 'auxC':
      return patternData.aux_C || 'AUX C';
    case 'auxD':
      return patternData.aux_D || 'AUX D';
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

  // Get the actual pattern data
  const pattern = useSelector((state: RootState) => {
    if (!openPatternId) {
      return null;
    }
    return state.patterns.patterns.find(p => p.id === openPatternId);
  });

  // Don't render if no pattern is open
  if (!openPatternId) {
    return null;
  }

  // Don't render if pattern not found
  if (!pattern) {
    return null;
  }

  // Handle close button click
  const handleClose = () => {
    dispatch(closePattern());
  };

  // Handle row click
  const handleRowClick = (row: PatternRow) => {
    dispatch(selectRow(row));
  };

  // Handle bar navigation
  const handleBarChange = (barIndex: number) => {
    dispatch(setCurrentBar(barIndex));
  };

  // Handle view mode toggle
  const handleViewModeToggle = () => {
    dispatch(toggleViewMode());
  };

  // Get rows for current view mode
  const currentRows = viewMode === 'parameters' ? PARAMETER_ROWS : AUX_ROWS;

  // Split rows into left and right columns (2 rows each)
  const leftRows = currentRows.slice(0, 2);
  const rightRows = currentRows.slice(2, 4);

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

  return (
    <div
      className={styles.editor}
      data-testid="pattern-editor"
      style={{ height: `${editorHeight}px` }}
    >
      {/* Header */}
      <header className={styles.header} data-testid="pattern-editor-header">
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>{patternLabel}</h2>
          <div className={styles.metadata}>
            <span className={styles.barCount}>
              {barCount} {barCount === 1 ? 'bar' : 'bars'}
            </span>
            <span className={styles.timebase}>
              tbase: {timebase}
            </span>
            <span className={styles.auxInfo}>
              aux_A: {auxA}
            </span>
            <span className={styles.auxInfo}>
              aux_B: {auxB}
            </span>
            <span className={styles.auxInfo}>
              aux_C: {auxC}
            </span>
            <span className={styles.auxInfo}>
              aux_D: {auxD}
            </span>
          </div>
        </div>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close pattern editor"
        >
          Close
        </button>
      </header>

      {/* Content */}
      <div className={styles.content} data-testid="pattern-editor-content">
        {/* Bar navigation (if multiple bars) */}
        {barCount > 1 && (
          <div className={styles.barNavigation}>
            <button
              onClick={() => handleBarChange(currentBarIndex - 1)}
              disabled={currentBarIndex === 0}
              aria-label="Previous bar"
            >
              Previous
            </button>
            <span className={styles.barIndicator}>
              Bar {currentBarIndex + 1} of {barCount}
            </span>
            <button
              onClick={() => handleBarChange(currentBarIndex + 1)}
              disabled={currentBarIndex === barCount - 1}
              aria-label="Next bar"
            >
              Next
            </button>
          </div>
        )}

        {/* Multi-row pattern display */}
        <div className={styles.multiRowContainer}>
          {/* Icon column - quick operations */}
          <div className={styles.iconColumn}>
            <ViewModeToggle viewMode={viewMode} onToggle={handleViewModeToggle} />
          </div>

          {/* Left column - first 2 rows */}
          <div className={styles.column}>
            {leftRows.map((row) => {
              if (!pattern.patternData) return null;
              return (
                <div key={row} className={styles.rowWrapper}>
                  <div className={styles.rowLabel}>{getRowLabel(row, pattern.patternData)}</div>
                  <PatternRowComponent
                    barData={currentBar}
                    row={row}
                    selectedSteps={selectedRow === row ? selectedSteps : []}
                    onStepClick={(stepIndex) => {
                      handleRowClick(row);
                      // TODO: Implement step editing in next phase
                      console.log('Step clicked:', row, stepIndex);
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Right column - last 2 rows */}
          <div className={styles.column}>
            {rightRows.map((row) => {
              if (!pattern.patternData) return null;
              return (
                <div key={row} className={styles.rowWrapper}>
                  <div className={styles.rowLabel}>{getRowLabel(row, pattern.patternData)}</div>
                  <PatternRowComponent
                    barData={currentBar}
                    row={row}
                    selectedSteps={selectedRow === row ? selectedSteps : []}
                    onStepClick={(stepIndex) => {
                      handleRowClick(row);
                      // TODO: Implement step editing in next phase
                      console.log('Step clicked:', row, stepIndex);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternEditor;
