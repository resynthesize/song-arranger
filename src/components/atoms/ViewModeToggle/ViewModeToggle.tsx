/**
 * Cyclone - ViewModeToggle Component
 * Button to toggle between parameters and aux view modes
 */

import type { ViewMode } from '@/types';
import styles from './ViewModeToggle.module.css';

export interface ViewModeToggleProps {
  viewMode: ViewMode;
  onToggle: () => void;
}

const ViewModeToggle = ({ viewMode, onToggle }: ViewModeToggleProps) => {
  const icon = viewMode === 'parameters' ? 'P' : 'A';
  const ariaLabel = `Toggle view mode (currently ${viewMode === 'parameters' ? 'Parameters' : 'Aux'})`;

  return (
    <button
      className={styles.toggle}
      onClick={onToggle}
      aria-label={ariaLabel}
      type="button"
      title={ariaLabel}
    >
      <span className={styles.label}>{icon}</span>
    </button>
  );
};

export default ViewModeToggle;
