/**
 * PatternHandle Molecule
 * Resize handle for clip edges (left/right)
 */

import { MouseEvent } from 'react';
import type { ID } from '@/types';
import './PatternHandle.css';

export interface PatternHandleProps {
  patternId: ID;
  edge: 'left' | 'right';
  onResizeStart: (edge: 'left' | 'right') => (e: MouseEvent) => void;
}

export const PatternHandle: React.FC<PatternHandleProps> = ({
  patternId,
  edge,
  onResizeStart,
}) => {
  return (
    <div
      className={`pattern__handle pattern__handle--${edge}`}
      data-testid={`pattern-${patternId}-handle-${edge}`}
      onMouseDown={onResizeStart(edge)}
    />
  );
};
