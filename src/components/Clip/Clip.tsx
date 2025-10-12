/**
 * Song Arranger - Clip Component
 * Represents a clip on the timeline with drag and resize functionality
 */

import { useState, useRef, useEffect, MouseEvent } from 'react';
import type { ID, Position, Duration } from '@/types';
import './Clip.css';

interface ClipProps {
  id: ID;
  position: Position;
  duration: Duration;
  zoom: number;
  isSelected: boolean;
  label?: string;
  onSelect: (clipId: ID, isMultiSelect: boolean) => void;
  onMove: (clipId: ID, delta: number) => void;
  onResize: (clipId: ID, newDuration: Duration, edge: 'left' | 'right') => void;
}

const Clip = ({
  id,
  position,
  duration,
  zoom,
  isSelected,
  label,
  onSelect,
  onMove,
  onResize,
}: ClipProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const dragStartX = useRef(0);
  const dragStartPosition = useRef(0);
  const dragStartDuration = useRef(0);

  // Convert beats to pixels
  const leftPx = position * zoom;
  const widthPx = duration * zoom;

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return; // Only left click

    // Prevent text selection during drag
    e.preventDefault();

    const isMultiSelect = e.altKey;
    onSelect(id, isMultiSelect);
  };

  const handleDragStart = (e: MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartPosition.current = position;
  };

  const handleResizeStart = (edge: 'left' | 'right') => (e: MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    setIsResizing(edge);
    dragStartX.current = e.clientX;
    dragStartDuration.current = duration;
    dragStartPosition.current = position;
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const deltaBeats = deltaX / zoom;

      if (isDragging) {
        onMove(id, deltaBeats);
      } else if (isResizing) {
        if (isResizing === 'right') {
          const newDuration = Math.max(1, dragStartDuration.current + deltaBeats);
          onResize(id, newDuration, 'right');
        } else {
          // Left edge resize
          const newDuration = Math.max(
            1,
            dragStartDuration.current - deltaBeats
          );
          onResize(id, newDuration, 'left');
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, id, zoom, onMove, onResize]);

  return (
    <div
      data-testid={`clip-${id}`}
      className={`clip ${isSelected ? 'clip--selected' : ''} ${
        isDragging ? 'clip--dragging' : ''
      } ${isResizing ? 'clip--resizing' : ''}`}
      style={{
        left: `${leftPx.toString()}px`,
        width: `${widthPx.toString()}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="clip__handle clip__handle--left"
        data-testid={`clip-${id}-handle-left`}
        onMouseDown={handleResizeStart('left')}
      />
      <div className="clip__content" onMouseDown={handleDragStart}>
        <div className="clip__corners">
          <span className="clip__corner clip__corner--tl">┌</span>
          <span className="clip__corner clip__corner--tr">┐</span>
        </div>
        {label && <div className="clip__label">{label}</div>}
        <div className="clip__corners clip__corners--bottom">
          <span className="clip__corner clip__corner--bl">└</span>
          <span className="clip__corner clip__corner--br">┘</span>
        </div>
      </div>
      <div
        className="clip__handle clip__handle--right"
        data-testid={`clip-${id}-handle-right`}
        onMouseDown={handleResizeStart('right')}
      />
    </div>
  );
};

export default Clip;
