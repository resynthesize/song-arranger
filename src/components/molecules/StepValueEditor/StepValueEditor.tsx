import React, { useState, useEffect, useRef } from 'react';
import type { PatternRow } from '@/types';
import styles from './StepValueEditor.module.css';

export interface StepValueEditorProps {
  row: PatternRow;
  currentValue: number | string;
  stepIndex: number;
  onSubmit: (value: number | string) => void;
  onCancel: () => void;
  position: { top: number; left: number };
}

/**
 * Inline editor for step values
 * Appears as a small modal/popup when a step is clicked
 */
export const StepValueEditor: React.FC<StepValueEditorProps> = ({
  row,
  currentValue,
  stepIndex,
  onSubmit,
  onCancel,
  position,
}) => {
  const [value, setValue] = useState(String(currentValue));
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (row === 'note') {
      // For notes, submit as string
      onSubmit(value);
    } else {
      // For numeric values, parse and submit
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        onSubmit(numValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // Increment/decrement for numeric values
      if (row !== 'note') {
        e.preventDefault();
        const currentNum = parseInt(value, 10);
        if (!isNaN(currentNum)) {
          const delta = e.key === 'ArrowUp' ? 1 : -1;
          const modifier = e.shiftKey ? 10 : 1;
          setValue(String(currentNum + delta * modifier));
        }
      }
    }
  };

  // Get label for the row
  const getRowLabel = (): string => {
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
        return 'AUX A';
      case 'auxB':
        return 'AUX B';
      case 'auxC':
        return 'AUX C';
      case 'auxD':
        return 'AUX D';
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={onCancel}
      data-testid="step-value-editor-overlay"
    >
      <div
        className={styles.editor}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid="step-value-editor"
      >
        <form onSubmit={handleSubmit}>
          <div className={styles.header}>
            <span className={styles.label}>
              {getRowLabel()} - Step {stepIndex + 1}
            </span>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onCancel}
              aria-label="Cancel"
            >
              ×
            </button>
          </div>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            data-testid="step-value-input"
          />
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              OK
            </button>
          </div>
          {row !== 'note' && (
            <div className={styles.hint}>
              Use ↑/↓ to adjust (Shift for ±10)
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
