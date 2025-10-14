import { useRef, useEffect } from 'react';
import { PatternRow } from '@/types';
import styles from './RowSelector.module.css';

interface RowSelectorProps {
  selectedRow: PatternRow;
  onRowChange: (row: PatternRow) => void;
  auxLabels?: {
    auxA?: string;
    auxB?: string;
    auxC?: string;
    auxD?: string;
  };
  layout?: 'horizontal' | 'vertical';
}

const ALL_ROWS: PatternRow[] = [
  'note',
  'velocity',
  'length',
  'delay',
  'auxA',
  'auxB',
  'auxC',
  'auxD',
];

const DEFAULT_LABELS: Record<PatternRow, string> = {
  note: 'NOTE',
  velocity: 'VELO',
  length: 'LENGTH',
  delay: 'DELAY',
  auxA: 'AUX A',
  auxB: 'AUX B',
  auxC: 'AUX C',
  auxD: 'AUX D',
};

const RowSelector = ({
  selectedRow,
  onRowChange,
  auxLabels = {},
  layout = 'horizontal',
}: RowSelectorProps) => {
  const tabRefs = useRef<Map<PatternRow, HTMLButtonElement>>(new Map());
  const justClickedRef = useRef(false);

  useEffect(() => {
    if (justClickedRef.current) {
      justClickedRef.current = false;
    }
  }, [selectedRow]);

  const getLabel = (row: PatternRow): string => {
    if (row === 'auxA' && auxLabels.auxA) return auxLabels.auxA;
    if (row === 'auxB' && auxLabels.auxB) return auxLabels.auxB;
    if (row === 'auxC' && auxLabels.auxC) return auxLabels.auxC;
    if (row === 'auxD' && auxLabels.auxD) return auxLabels.auxD;
    return DEFAULT_LABELS[row];
  };

  const handleClick = (row: PatternRow, event: React.MouseEvent) => {
    if (row === selectedRow) {
      return;
    }
    justClickedRef.current = true;
    onRowChange(row);

    // Maintain focus after click
    const target = event.currentTarget as HTMLButtonElement;
    requestAnimationFrame(() => {
      target.focus();
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const currentIndex = ALL_ROWS.indexOf(selectedRow);
    let newIndex = currentIndex;

    const isHorizontal = layout === 'horizontal';
    const isVertical = layout === 'vertical';

    if ((isHorizontal && event.key === 'ArrowRight') || (isVertical && event.key === 'ArrowDown')) {
      event.preventDefault();
      newIndex = (currentIndex + 1) % ALL_ROWS.length;
    } else if ((isHorizontal && event.key === 'ArrowLeft') || (isVertical && event.key === 'ArrowUp')) {
      event.preventDefault();
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = ALL_ROWS.length - 1;
      }
    } else if (event.key === 'Home') {
      event.preventDefault();
      newIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      newIndex = ALL_ROWS.length - 1;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const row = target.getAttribute('data-row') as PatternRow;
      if (row && row !== selectedRow) {
        onRowChange(row);
      }
      return;
    } else {
      return;
    }

    const newRow = ALL_ROWS[newIndex];
    if (newRow) {
      const tabElement = tabRefs.current.get(newRow);
      if (tabElement) {
        tabElement.focus();
      }
      onRowChange(newRow);
    }
  };

  const setTabRef = (row: PatternRow, element: HTMLButtonElement | null) => {
    if (element) {
      tabRefs.current.set(row, element);
    } else {
      tabRefs.current.delete(row);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Pattern row selector"
      aria-orientation={layout}
      className={`${styles.rowSelector} ${styles[layout]}`}
      onKeyDown={handleKeyDown}
    >
      {ALL_ROWS.map((row) => {
        const isSelected = row === selectedRow;
        return (
          <button
            key={row}
            ref={(el) => setTabRef(row, el)}
            role="tab"
            aria-selected={isSelected}
            data-row={row}
            tabIndex={isSelected ? 0 : -1}
            className={`${styles.tab} ${isSelected ? styles.selected : ''}`}
            onClick={(e) => handleClick(row, e)}
          >
            {getLabel(row)}
          </button>
        );
      })}
    </div>
  );
};

export default RowSelector;
