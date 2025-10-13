/**
 * ClipHandle Molecule
 * Resize handle for clip edges (left/right)
 */

import { MouseEvent } from 'react';
import type { ID } from '@/types';
import './ClipHandle.css';

export interface ClipHandleProps {
  clipId: ID;
  edge: 'left' | 'right';
  onResizeStart: (edge: 'left' | 'right') => (e: MouseEvent) => void;
}

export const ClipHandle: React.FC<ClipHandleProps> = ({
  clipId,
  edge,
  onResizeStart,
}) => {
  return (
    <div
      className={`clip-handle clip-handle--${edge}`}
      data-testid={`clip-${clipId}-handle-${edge}`}
      onMouseDown={onResizeStart(edge)}
    />
  );
};
