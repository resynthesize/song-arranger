/**
 * Cyclone - BarNavigation Component
 * Navigation controls for switching between pattern bars
 */

import styles from './BarNavigation.module.css';

export interface BarNavigationProps {
  currentBarIndex: number;
  barCount: number;
  onBarChange: (barIndex: number) => void;
}

/**
 * Bar navigation controls for multi-bar patterns
 * Shows current bar and provides Previous/Next buttons
 */
export const BarNavigation: React.FC<BarNavigationProps> = ({
  currentBarIndex,
  barCount,
  onBarChange,
}) => {
  if (barCount <= 1) {
    return null;
  }

  return (
    <div className={styles.barNavigation}>
      <button
        onClick={() => onBarChange(currentBarIndex - 1)}
        disabled={currentBarIndex === 0}
        aria-label="Previous bar"
      >
        Previous
      </button>
      <span className={styles.barIndicator}>
        Bar {currentBarIndex + 1} of {barCount}
      </span>
      <button
        onClick={() => onBarChange(currentBarIndex + 1)}
        disabled={currentBarIndex === barCount - 1}
        aria-label="Next bar"
      >
        Next
      </button>
    </div>
  );
};
