/**
 * TrackHeaderResizeHandle Molecule
 * Draggable handle for resizing track header width
 */

import { useState, useEffect, MouseEvent, useCallback } from 'react';
import styles from './TrackHeaderResizeHandle.module.css';

export interface TrackHeaderResizeHandleProps {
  currentWidth: number;
  onWidthChange: (newWidth: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export const TrackHeaderResizeHandle: React.FC<TrackHeaderResizeHandleProps> = ({
  currentWidth,
  onWidthChange,
  minWidth = 100,
  maxWidth = 400,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartX(e.clientX);
    setStartWidth(currentWidth);
  }, [currentWidth]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Add CSS class to body to show resize cursor
    document.body.classList.add('resizing-horizontal');

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('resizing-horizontal');
    };
  }, [isDragging, startX, startWidth, minWidth, maxWidth, onWidthChange]);

  return (
    <div
      className={`${styles.handle} ${isDragging ? styles.dragging : ''}`}
      onMouseDown={handleMouseDown}
      data-testid="track-header-resize-handle"
      title="Drag to resize track header width"
    >
      <div className={styles.handleLine} />
    </div>
  );
};
