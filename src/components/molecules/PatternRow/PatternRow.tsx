import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BarChart } from '@/components/atoms/BarChart/BarChart';
import type { P3Bar, PatternRow as PatternRowType } from '@/types';
import { noteToMidi, midiToNote } from '@/utils/noteConversion';
import styles from './PatternRow.module.css';

const DRAG_THRESHOLD = 3; // Pixels of movement to trigger drag mode
const DRAG_SENSITIVITY = 2; // Pixels per unit of value change

export interface PatternRowProps {
  barData: P3Bar;
  row: PatternRowType;
  selectedSteps?: number[];
  onStepClick?: (stepIndex: number) => void;
  onGateToggle?: (stepIndex: number) => void;
  onAuxFlagToggle?: (stepIndex: number) => void;
  onValueChange?: (stepIndex: number, newValue: number | string) => void;
}

interface RowDataConfig {
  getValue: (barData: P3Bar, stepIndex: number) => number;
  getLabel: (barData: P3Bar, stepIndex: number) => string | undefined;
  maxValue: number;
}

/**
 * Configuration for extracting data from P3Bar based on row type
 */
const ROW_CONFIGS: Record<PatternRowType, RowDataConfig> = {
  note: {
    getValue: (barData, stepIndex) => {
      // For notes, convert the note string to MIDI value for visual display
      const noteStr = barData.note[stepIndex];
      const midiValue = noteToMidi(noteStr || '');
      // If invalid note, return 0 (will show as empty bar)
      return midiValue === -1 ? 0 : midiValue;
    },
    getLabel: (barData, stepIndex) => barData.note[stepIndex],
    maxValue: 127,
  },
  velocity: {
    getValue: (barData, stepIndex) => barData.velo[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.velo[stepIndex] ?? 0),
    maxValue: 127,
  },
  length: {
    getValue: (barData, stepIndex) => barData.length[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.length[stepIndex] ?? 0),
    maxValue: 127,
  },
  delay: {
    getValue: (barData, stepIndex) => barData.delay[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.delay[stepIndex] ?? 0),
    maxValue: 47, // Delay range is 0-47
  },
  auxA: {
    getValue: (barData, stepIndex) => barData.aux_A_value[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.aux_A_value[stepIndex] ?? 0),
    maxValue: 127,
  },
  auxB: {
    getValue: (barData, stepIndex) => barData.aux_B_value[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.aux_B_value[stepIndex] ?? 0),
    maxValue: 127,
  },
  auxC: {
    getValue: (barData, stepIndex) => barData.aux_C_value[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.aux_C_value[stepIndex] ?? 0),
    maxValue: 127,
  },
  auxD: {
    getValue: (barData, stepIndex) => barData.aux_D_value[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.aux_D_value[stepIndex] ?? 0),
    maxValue: 127,
  },
};

export const PatternRow: React.FC<PatternRowProps> = ({
  barData,
  row,
  selectedSteps = [],
  onStepClick,
  onGateToggle,
  onAuxFlagToggle,
  onValueChange,
}) => {
  const config = ROW_CONFIGS[row];

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number>(0);
  const dragStartValue = useRef<number>(0);
  const dragStepIndex = useRef<number>(-1);
  const hasMoved = useRef<boolean>(false);
  const justFinishedDrag = useRef<boolean>(false);

  // Helper to check if current row is an aux row
  const isAuxRow = (rowType: PatternRowType): boolean => {
    return rowType === 'auxA' || rowType === 'auxB' || rowType === 'auxC' || rowType === 'auxD';
  };

  // Helper to check if a step is selected
  const isStepSelected = (stepIndex: number): boolean => {
    return selectedSteps.includes(stepIndex);
  };

  // Handle mouse move during drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || dragStepIndex.current === -1 || !onValueChange) {
        return;
      }

      const deltaY = dragStartY.current - e.clientY; // Inverted: dragging up increases value
      const distance = Math.abs(deltaY);

      // Mark as moved if threshold exceeded
      if (distance > DRAG_THRESHOLD) {
        hasMoved.current = true;
      }

      // Only update value if we've moved past threshold
      if (hasMoved.current) {
        const valueDelta = Math.floor(deltaY / DRAG_SENSITIVITY);
        let newValue = dragStartValue.current + valueDelta;

        // Clamp to valid range
        newValue = Math.max(0, Math.min(config.maxValue, newValue));

        // For note row, convert MIDI back to note string
        if (row === 'note') {
          const noteString = midiToNote(newValue);
          onValueChange(dragStepIndex.current, noteString);
        } else {
          onValueChange(dragStepIndex.current, newValue);
        }
      }
    },
    [isDragging, onValueChange, config.maxValue, row]
  );

  // Handle mouse up to end drag
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const stepIndex = dragStepIndex.current;

      setIsDragging(false);
      dragStepIndex.current = -1;

      // If we didn't move much, treat as a click
      if (!hasMoved.current && onStepClick && stepIndex !== -1) {
        // Check for modifier keys
        const mouseEvent = e as unknown as React.MouseEvent;
        if (mouseEvent.altKey && mouseEvent.shiftKey && onAuxFlagToggle && isAuxRow(row)) {
          onAuxFlagToggle(stepIndex);
        } else if (mouseEvent.shiftKey && onGateToggle) {
          onGateToggle(stepIndex);
        } else {
          onStepClick(stepIndex);
        }
      } else if (hasMoved.current) {
        // If we did move (completed a drag), set flag to prevent click handler
        justFinishedDrag.current = true;
        // Reset flag after a short delay
        setTimeout(() => {
          justFinishedDrag.current = false;
        }, 50);
      }

      hasMoved.current = false;
    },
    [onStepClick, onGateToggle, onAuxFlagToggle, row]
  );

  // Attach/detach mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Helper to create mouse down handler for a step
  const createStepMouseDownHandler = (stepIndex: number) => {
    if (!onStepClick && !onGateToggle && !onAuxFlagToggle && !onValueChange) {
      return undefined;
    }

    return (e: React.MouseEvent) => {
      // Don't start drag if modifier keys are pressed (they trigger instant actions)
      if (e.shiftKey || e.altKey) {
        return;
      }

      e.preventDefault();

      let currentValue: number;

      // For note row, convert note string to MIDI number for dragging
      if (row === 'note') {
        const noteStr = config.getLabel(barData, stepIndex);
        const midiNote = noteToMidi(noteStr || '');
        // If invalid note, start from middle C (MIDI 60)
        currentValue = midiNote === -1 ? 60 : midiNote;
      } else {
        currentValue = config.getValue(barData, stepIndex);
      }

      dragStartY.current = e.clientY;
      dragStartValue.current = currentValue;
      dragStepIndex.current = stepIndex;
      hasMoved.current = false;
      justFinishedDrag.current = false; // Reset flag when starting new drag
      setIsDragging(true);
    };
  };

  // Helper to create click handler for modifier key clicks and note row clicks
  // This handles Shift+Click, Alt+Shift+Click, and regular clicks on note row
  const createStepClickHandler = (stepIndex: number) => {
    if (!onGateToggle && !onAuxFlagToggle && !(row === 'note' && onStepClick)) {
      return undefined;
    }
    return (e: React.MouseEvent) => {
      // Don't handle click if we just finished a drag
      if (justFinishedDrag.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Handle modifier key clicks
      if (e.altKey && e.shiftKey && onAuxFlagToggle && isAuxRow(row)) {
        e.preventDefault();
        e.stopPropagation();
        onAuxFlagToggle(stepIndex);
      } else if (e.shiftKey && onGateToggle) {
        e.preventDefault();
        e.stopPropagation();
        onGateToggle(stepIndex);
      } else if (row === 'note' && onStepClick && !e.shiftKey && !e.altKey) {
        // Handle regular clicks on note row (to open editor)
        e.preventDefault();
        e.stopPropagation();
        onStepClick(stepIndex);
      }
    };
  };

  // Render 16 BarChart components
  const renderSteps = () => {
    const steps: JSX.Element[] = [];
    const lastStepIndex = barData.last_step - 1; // Convert 1-indexed to 0-indexed

    for (let i = 0; i < 16; i++) {
      const value = config.getValue(barData, i);
      const label = config.getLabel(barData, i);
      const isActive = barData.gate[i] === 1;
      const isTied = barData.tie[i] === 1;
      const isSkipped = barData.skip[i] === 1;
      const isSelected = isStepSelected(i);
      const isLastStep = i === lastStepIndex;
      const isBeyondLast = i > lastStepIndex;

      const clickHandler = createStepClickHandler(i);
      const mouseDownHandler = createStepMouseDownHandler(i);
      const hasInteraction = clickHandler || mouseDownHandler || onStepClick;

      steps.push(
        <div
          key={i}
          className={styles.stepContainer}
          data-testid="step-container"
          onClick={clickHandler}
          onMouseDown={mouseDownHandler}
          role={hasInteraction ? 'button' : undefined}
          tabIndex={hasInteraction ? 0 : undefined}
          aria-label={hasInteraction ? `Step ${i + 1}` : undefined}
          style={{ cursor: hasInteraction ? 'pointer' : 'default' }}
        >
          <BarChart
            value={value}
            maxValue={config.maxValue}
            label={label}
            isActive={isActive}
            isTied={isTied}
            isSkipped={isSkipped}
            isSelected={isSelected}
            isLastStep={isLastStep}
            isBeyondLast={isBeyondLast}
          />
          <div className={styles.stepNumber}>{i + 1}</div>
        </div>
      );
    }

    return steps;
  };

  return (
    <div className={styles.patternRow} data-testid="pattern-row">
      {renderSteps()}
    </div>
  );
};
