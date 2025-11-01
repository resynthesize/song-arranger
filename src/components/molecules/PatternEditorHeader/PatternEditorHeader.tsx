/**
 * Cyclone - PatternEditorHeader Component
 * Header section for the PatternEditor organism
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setKeyboardContext, resetKeyboardContext } from '@/store/slices/keyboardContextSlice';
import styles from './PatternEditorHeader.module.css';

export interface PatternEditorHeaderProps {
  patternLabel: string;
  barCount: number;
  timebase: string;
  auxA: string;
  auxB: string;
  auxC: string;
  auxD: string;
  currentBarIndex?: number;
  onBarChange?: (barIndex: number) => void;
  onBarCountChange?: (newBarCount: number) => void;
  onClose: () => void;
}

/**
 * Format aux assignment compactly (e.g., "Vel" -> "Vel", "none" -> "--")
 */
const formatAux = (auxValue: string): string => {
  if (!auxValue || auxValue.toLowerCase() === 'none') {
    return '--';
  }
  return auxValue;
};

/**
 * Header for PatternEditor showing pattern metadata and close button
 * Compact inline layout with integrated bar navigation
 */
export const PatternEditorHeader: React.FC<PatternEditorHeaderProps> = ({
  patternLabel,
  barCount,
  timebase,
  auxA,
  auxB,
  auxC,
  auxD,
  currentBarIndex,
  onBarChange,
  onBarCountChange,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [isEditingBarCount, setIsEditingBarCount] = useState(false);
  const barCountInputRef = useRef<HTMLInputElement>(null);

  // Build compact aux display string
  const auxDisplay = `A:${formatAux(auxA)} B:${formatAux(auxB)} C:${formatAux(auxC)} D:${formatAux(auxD)}`;

  // Auto-focus input when editing starts and set keyboard context
  useEffect(() => {
    if (isEditingBarCount) {
      dispatch(setKeyboardContext({ context: 'editing', editor: 'bar-count' }));
      if (barCountInputRef.current) {
        barCountInputRef.current.focus();
        barCountInputRef.current.select();
      }
    } else {
      dispatch(resetKeyboardContext());
    }
  }, [isEditingBarCount, dispatch]);

  const handleBarCountDoubleClick = () => {
    if (onBarCountChange) {
      setIsEditingBarCount(true);
    }
  };

  const handleBarCountKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Stop propagation to prevent global shortcuts
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission or other Enter handlers
      const newBarCount = parseInt((e.target as HTMLInputElement).value, 10);
      if (!isNaN(newBarCount) && newBarCount > 0 && onBarCountChange) {
        onBarCountChange(newBarCount);
      }
      setIsEditingBarCount(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditingBarCount(false);
    }
  };

  const handleBarCountBlur = () => {
    if (barCountInputRef.current && onBarCountChange) {
      const newBarCount = parseInt(barCountInputRef.current.value, 10);
      if (!isNaN(newBarCount) && newBarCount > 0) {
        onBarCountChange(newBarCount);
      }
    }
    setIsEditingBarCount(false);
  };

  return (
    <header className={styles.header} data-testid="pattern-editor-header">
      <div className={styles.headerContent}>
        <span className={styles.title}>{patternLabel}</span>
        <span className={styles.separator}>|</span>
        {isEditingBarCount ? (
          <input
            ref={barCountInputRef}
            className={`${styles.barCountInput} terminal-input`}
            type="number"
            min="1"
            defaultValue={barCount}
            onKeyDown={handleBarCountKeyDown}
            onBlur={handleBarCountBlur}
            onClick={(e) => e.stopPropagation()}
            data-testid="bar-count-input"
          />
        ) : (
          <span
            className={styles.metadata}
            onDoubleClick={handleBarCountDoubleClick}
            style={{ cursor: onBarCountChange ? 'pointer' : 'default' }}
            title={onBarCountChange ? 'Double-click to edit bar count' : undefined}
          >
            {barCount} {barCount === 1 ? 'bar' : 'bars'}
          </span>
        )}
        <span className={styles.separator}>|</span>
        <span className={styles.metadata}>tbase:{timebase}</span>
        <span className={styles.separator}>|</span>
        <span className={styles.auxInfo}>{auxDisplay}</span>
      </div>

      <div className={styles.headerControls}>
        {/* Bar navigation (if multiple bars) */}
        {barCount > 1 && currentBarIndex !== undefined && onBarChange && (
          <div className={styles.barNav}>
            <button
              className={styles.navButton}
              onClick={() => onBarChange(currentBarIndex - 1)}
              disabled={currentBarIndex === 0}
              aria-label="Previous bar"
              title="Previous bar"
            >
              ←
            </button>
            <span className={styles.barIndicator}>
              {currentBarIndex + 1}/{barCount}
            </span>
            <button
              className={styles.navButton}
              onClick={() => onBarChange(currentBarIndex + 1)}
              disabled={currentBarIndex === barCount - 1}
              aria-label="Next bar"
              title="Next bar"
            >
              →
            </button>
          </div>
        )}

        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close pattern editor"
        >
          ✕
        </button>
      </div>
    </header>
  );
};
