/**
 * Cyclone - RowVisibilityToolbar Component
 * Compact toolbar for toggling row visibility in pattern editor
 */

import type { PatternRow } from '@/types';
import styles from './RowVisibilityToolbar.module.css';

export interface RowVisibilityToolbarProps {
  rows: PatternRow[];
  visibleRows: Record<PatternRow, boolean>;
  rowLabels: Record<PatternRow, string>;
  onToggle: (row: PatternRow) => void;
}

/**
 * Compact vertical toolbar for toggling row visibility
 * Shows abbreviated labels for each row with visual feedback
 */
export const RowVisibilityToolbar = ({
  rows,
  visibleRows,
  rowLabels,
  onToggle,
}: RowVisibilityToolbarProps) => {
  return (
    <div className={styles.toolbar} data-testid="row-visibility-toolbar">
      {rows.map((row) => {
        const isVisible = visibleRows[row];
        const label = rowLabels[row];

        return (
          <button
            key={row}
            className={`${styles.button} ${isVisible ? styles.visible : styles.hidden}`}
            onClick={() => onToggle(row)}
            aria-label={`${isVisible ? 'Hide' : 'Show'} ${row} row`}
            title={`${isVisible ? 'Hide' : 'Show'} ${row}`}
            data-testid={`row-visibility-${row}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
