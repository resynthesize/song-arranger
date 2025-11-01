/**
 * TrackResizeHandle Molecule
 * Draggable handle for resizing track height
 */

import { useState, useEffect, MouseEvent, useCallback } from 'react';
import type { ID } from '@/types';
import { MIN_TRACK_HEIGHT } from '@/constants';
import styles from './TrackResizeHandle.module.css';

export interface TrackResizeHandleProps {
  trackId: ID;
  currentHeight: number;
  onHeightChange: (trackId: ID, newHeight: number) => void;
}

export const TrackResizeHandle: React.FC<TrackResizeHandleProps> = ({
  trackId,
  currentHeight,
  onHeightChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(currentHeight);
  }, [currentHeight]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(MIN_TRACK_HEIGHT, startHeight + deltaY);
      onHeightChange(trackId, newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Add CSS class to body to show resize cursor
    document.body.classList.add('resizing-vertical');

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('resizing-vertical');
    };
  }, [isDragging, startY, startHeight, trackId, onHeightChange]);

  return (
    <div
      className={`${styles.handle} ${isDragging ? styles.dragging : ''}`}
      onMouseDown={handleMouseDown}
      data-testid={`track-resize-handle-${trackId}`}
      title="Drag to resize track height"
    >
      <div className={styles.handleLine} />
    </div>
  );
};
