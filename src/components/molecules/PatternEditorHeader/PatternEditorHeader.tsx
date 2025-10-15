/**
 * Cyclone - PatternEditorHeader Component
 * Header section for the PatternEditor organism
 */

import styles from './PatternEditorHeader.module.css';

export interface PatternEditorHeaderProps {
  patternLabel: string;
  barCount: number;
  timebase: string;
  auxA: string;
  auxB: string;
  auxC: string;
  auxD: string;
  onClose: () => void;
}

/**
 * Header for PatternEditor showing pattern metadata and close button
 */
export const PatternEditorHeader: React.FC<PatternEditorHeaderProps> = ({
  patternLabel,
  barCount,
  timebase,
  auxA,
  auxB,
  auxC,
  auxD,
  onClose,
}) => {
  return (
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
        onClick={onClose}
        aria-label="Close pattern editor"
      >
        Close
      </button>
    </header>
  );
};
