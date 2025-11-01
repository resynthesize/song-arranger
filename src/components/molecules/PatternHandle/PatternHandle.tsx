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
  const handleMouseDown = (e: React.MouseEvent) => {
    console.log(`[PatternHandle] MouseDown on ${edge} handle`, {
      patternId,
      edge,
      target: e.target,
      currentTarget: e.currentTarget,
      clientX: e.clientX,
      clientY: e.clientY,
      button: e.button
    });
    onResizeStart(edge)(e);
  };

  return (
    <div
      className={`pattern__handle pattern__handle--${edge}`}
      data-testid={`pattern-${patternId}-handle-${edge}`}
      onMouseDown={handleMouseDown}
    />
  );
};
