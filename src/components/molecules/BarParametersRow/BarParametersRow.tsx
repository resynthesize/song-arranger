/**
 * Cyclone - BarParametersRow Component
 * Displays bar-level parameters (xpose, reps, gbar) for all bars in the pattern
 */

import { useMemo, useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import type { P3Bar, BarParameter } from '@/types';
import styles from './BarParametersRow.module.css';

const DRAG_THRESHOLD = 3; // Pixels of movement to trigger drag mode
const DRAG_SENSITIVITY = 2; // Pixels per unit of value change

interface BarParametersRowProps {
  bars: P3Bar[]; // All bars in the pattern
  parameter: BarParameter; // Which parameter to display
  currentBarIndex: number; // Currently selected bar
  height?: number; // Row height in pixels
  onBarClick?: (barIndex: number) => void; // Click handler for bar selection
  onValueChange?: (barIndex: number, value: number | boolean) => void; // Value change handler
}

/**
 * Get value for a specific bar parameter
 */
const getBarParameterValue = (bar: P3Bar, parameter: BarParameter): number | boolean => {
  switch (parameter) {
    case 'xpose':
      return bar.xpos;
    case 'reps':
      return bar.reps;
    case 'gbar':
      return bar.gbar;
  }
};

/**
 * Format value for display
 */
const formatValue = (value: number | boolean, parameter: BarParameter): string => {
  if (parameter === 'gbar') {
    return value ? '1' : '0';
  }
  if (parameter === 'xpose' && typeof value === 'number') {
    // Show + for positive transpose values
    return value > 0 ? `+${value}` : String(value);
  }
  return String(value);
};

/**
 * Get min/max range for a parameter
 */
const getParameterRange = (parameter: BarParameter): { min: number; max: number } => {
  switch (parameter) {
    case 'xpose':
      return { min: -60, max: 60 }; // Transpose: -60 to +60 semitones
    case 'reps':
      return { min: 1, max: 99 }; // Repetitions: 1 to 99
    case 'gbar':
      return { min: 0, max: 1 }; // Boolean: 0 or 1
  }
};

/**
 * BarParametersRow - Displays a row of bar-level parameters
 */
export const BarParametersRow = ({
  bars,
  parameter,
  currentBarIndex,
  height = 70,
  onBarClick,
  onValueChange,
}: BarParametersRowProps) => {
  // Calculate bar widths as percentages
  const barWidthPercent = useMemo(() => {
    if (bars.length === 0) return 0;
    return 100 / bars.length;
  }, [bars.length]);

  // Editing state
  const [editingBarIndex, setEditingBarIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number>(0);
  const dragStartValue = useRef<number>(0);
  const dragBarIndex = useRef<number>(-1);
  const hasMoved = useRef<boolean>(false);
  const justFinishedDrag = useRef<boolean>(false);

  // Get parameter range
  const paramRange = getParameterRange(parameter);

  // Auto-focus and select text when editing starts
  useEffect(() => {
    if (editingBarIndex !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingBarIndex]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || dragBarIndex.current === -1 || !onValueChange) {
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
        newValue = Math.max(paramRange.min, Math.min(paramRange.max, newValue));

        // For gbar, convert to boolean
        if (parameter === 'gbar') {
          onValueChange(dragBarIndex.current, newValue === 1);
        } else {
          onValueChange(dragBarIndex.current, newValue);
        }
      }
    },
    [isDragging, onValueChange, paramRange, parameter]
  );

  // Handle mouse up to end drag
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const barIndex = dragBarIndex.current;

      setIsDragging(false);
      dragBarIndex.current = -1;

      // If we didn't move much, treat as a click
      if (!hasMoved.current && onBarClick && barIndex !== -1) {
        onBarClick(barIndex);
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
    [onBarClick]
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

  // Handle bar cell click (for selection)
  const handleBarClick = (barIndex: number) => {
    // Don't handle if we just finished a drag
    if (justFinishedDrag.current) {
      return;
    }
    if (onBarClick) {
      onBarClick(barIndex);
    }
  };

  // Handle value mouse down (start drag)
  const handleValueMouseDown = (e: React.MouseEvent, barIndex: number) => {
    e.stopPropagation();
    e.preventDefault();

    const bar = bars[barIndex];
    if (!bar || !onValueChange) return;

    const currentValue = getBarParameterValue(bar, parameter);
    const numValue = typeof currentValue === 'boolean' ? (currentValue ? 1 : 0) : currentValue;

    dragStartY.current = e.clientY;
    dragStartValue.current = numValue;
    dragBarIndex.current = barIndex;
    hasMoved.current = false;
    justFinishedDrag.current = false;
    setIsDragging(true);
  };

  // Handle value double click (start editing)
  const handleValueDoubleClick = (e: React.MouseEvent, barIndex: number) => {
    e.stopPropagation();
    e.preventDefault();

    // Don't allow editing gbar (it's boolean, just toggle)
    if (parameter === 'gbar') {
      return;
    }

    setEditingBarIndex(barIndex);
  };

  // Handle input key down
  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>, barIndex: number) => {
    if (e.key === 'Enter') {
      const newValueStr = (e.target as HTMLInputElement).value;
      const newValue = parseInt(newValueStr, 10);

      if (!isNaN(newValue) && onValueChange) {
        // Clamp to valid range
        const clampedValue = Math.max(paramRange.min, Math.min(paramRange.max, newValue));
        onValueChange(barIndex, clampedValue);
      }

      setEditingBarIndex(null);
    } else if (e.key === 'Escape') {
      setEditingBarIndex(null);
    }
  };

  // Handle input blur
  const handleInputBlur = (barIndex: number) => {
    if (inputRef.current && onValueChange) {
      const newValueStr = inputRef.current.value;
      const newValue = parseInt(newValueStr, 10);

      if (!isNaN(newValue)) {
        // Clamp to valid range
        const clampedValue = Math.max(paramRange.min, Math.min(paramRange.max, newValue));
        onValueChange(barIndex, clampedValue);
      }
    }
    setEditingBarIndex(null);
  };

  return (
    <div className={styles.barParametersRow} style={{ height: `${height}px` }}>
      {bars.map((bar, barIndex) => {
        const value = getBarParameterValue(bar, parameter);
        const formattedValue = formatValue(value, parameter);
        const isCurrentBar = barIndex === currentBarIndex;
        const isActive = parameter === 'gbar' ? Boolean(value) : value !== 0;
        const isEditing = editingBarIndex === barIndex;

        return (
          <div
            key={barIndex}
            className={`${styles.barCell} ${isCurrentBar ? styles.currentBar : ''} ${isActive ? styles.active : ''}`}
            style={{
              width: `${barWidthPercent}%`,
              height: `${height}px`,
            }}
            onClick={() => handleBarClick(barIndex)}
            data-testid={`bar-param-${parameter}-${barIndex}`}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                className={styles.valueInput}
                type="number"
                min={paramRange.min}
                max={paramRange.max}
                defaultValue={typeof value === 'number' ? value : 0}
                onKeyDown={(e) => handleInputKeyDown(e, barIndex)}
                onBlur={() => handleInputBlur(barIndex)}
                onClick={(e) => e.stopPropagation()}
                data-testid={`bar-param-${parameter}-${barIndex}-input`}
              />
            ) : (
              <div
                className={styles.valueDisplay}
                onMouseDown={(e) => handleValueMouseDown(e, barIndex)}
                onDoubleClick={(e) => handleValueDoubleClick(e, barIndex)}
                title={`${parameter}: ${formattedValue} (drag to adjust, double-click to edit)`}
              >
                {formattedValue}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
