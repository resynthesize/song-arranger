/**
 * Song Arranger - Clip Component
 * Represents a clip on the timeline with drag and resize functionality
 */

import { useState, useRef, useEffect, MouseEvent, KeyboardEvent } from 'react';
import ContextMenu, { type MenuItem } from '../ContextMenu';
import type { ID, Position, Duration, ViewportState } from '@/types';
import { beatsToViewportPx } from '@/utils/viewport';
import { snapToGrid } from '@/utils/snap';
import './Clip.css';

interface ClipProps {
  id: ID;
  laneId: ID;
  position: Position;
  duration: Duration;
  viewport: ViewportState;
  snapValue: number;
  isSelected: boolean;
  label?: string;
  laneName?: string;
  externalVerticalDragDeltaY?: number;
  onSelect: (clipId: ID, isMultiSelect: boolean) => void;
  onMove: (clipId: ID, newPosition: Position, delta: number) => void;
  onResize: (clipId: ID, newDuration: Duration, edge: 'left' | 'right', startDuration: Duration, startPosition: Position) => void;
  onVerticalDrag?: (clipId: ID, startingLaneId: ID, deltaY: number) => void;
  onVerticalDragUpdate?: (clipId: ID, deltaY: number) => void;
  onCopy?: (clipId: ID) => void;
  onLabelChange?: (clipId: ID, label: string) => void;
  onDelete?: (clipId: ID) => void;
}

const Clip = ({
  id,
  laneId,
  position,
  duration,
  viewport,
  snapValue,
  isSelected,
  label,
  laneName,
  externalVerticalDragDeltaY,
  onSelect,
  onMove,
  onResize,
  onVerticalDrag,
  onVerticalDragUpdate,
  onCopy,
  onLabelChange,
  onDelete,
}: ClipProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [verticalDragDeltaY, setVerticalDragDeltaY] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartPosition = useRef(0);
  const dragStartDuration = useRef(0);
  const dragStartLaneId = useRef<ID>('');
  const verticalDragDeltaYRef = useRef(0); // Store actual value for mouseup handler
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert beats to viewport-relative pixels
  const leftPx = beatsToViewportPx(position, viewport);
  const widthPx = duration * viewport.zoom;

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

    // Check if Alt key is held (for copying)
    if (e.altKey && onCopy) {
      setIsCopying(true);
      onCopy(id);
    }

    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    dragStartPosition.current = position;
    dragStartLaneId.current = laneId; // Track starting lane
  };

  const handleDoubleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (onLabelChange) {
      setIsEditing(true);
    }
  };

  const handleResizeStart = (edge: 'left' | 'right') => (e: MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    setIsResizing(edge);
    dragStartX.current = e.clientX;
    dragStartDuration.current = duration;
    dragStartPosition.current = position;
  };

  const handleLabelInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newLabel = (e.target as HTMLInputElement).value;
      if (onLabelChange) {
        onLabelChange(id, newLabel);
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleLabelInputBlur = () => {
    if (inputRef.current && onLabelChange) {
      const newLabel = inputRef.current.value;
      onLabelChange(id, newLabel);
    }
    setIsEditing(false);
  };

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const deltaY = e.clientY - dragStartY.current;
      const deltaBeats = deltaX / viewport.zoom;

      if (isDragging) {
        // Calculate new position and snap it (same approach as resize)
        const rawNewPosition = dragStartPosition.current + deltaBeats;
        const snappedPosition = snapToGrid(rawNewPosition, snapValue);
        const positionDelta = snappedPosition - dragStartPosition.current;
        onMove(id, snappedPosition, positionDelta);

        // Handle vertical lane dragging - store deltaY for CSS transform
        // Don't update Redux until mouseup to prevent unmount/remount
        if (onVerticalDrag && Math.abs(deltaY) > 5) {
          verticalDragDeltaYRef.current = deltaY;
          setVerticalDragDeltaY(deltaY);

          // Notify Timeline of drag state for other selected clips
          if (onVerticalDragUpdate) {
            onVerticalDragUpdate(id, deltaY);
          }
        }
      } else if (isResizing) {
        if (isResizing === 'right') {
          // Resize from right edge
          const rawNewDuration = dragStartDuration.current + deltaBeats;
          const snappedDuration = Math.max(
            snapValue || 1,
            snapToGrid(rawNewDuration, snapValue)
          );
          onResize(id, snappedDuration, 'right', dragStartDuration.current, dragStartPosition.current);
        } else {
          // Resize from left edge
          const rawNewDuration = dragStartDuration.current - deltaBeats;
          const snappedDuration = Math.max(
            snapValue || 1,
            snapToGrid(rawNewDuration, snapValue)
          );
          onResize(id, snappedDuration, 'left', dragStartDuration.current, dragStartPosition.current);
        }
      }
    };

    const handleMouseUp = () => {
      const wasDraggingVertically = isDragging && verticalDragDeltaYRef.current !== 0;
      const verticalDelta = verticalDragDeltaYRef.current;

      // Clear states first, before calling Redux update
      // This prevents the clip from showing transform when it remounts in new lane
      setIsDragging(false);
      setIsResizing(null);
      setIsCopying(false);
      setVerticalDragDeltaY(0);
      verticalDragDeltaYRef.current = 0;

      // Now update Redux (may cause unmount/remount in new lane)
      if (wasDraggingVertically && onVerticalDrag) {
        onVerticalDrag(id, dragStartLaneId.current, verticalDelta);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, id, viewport.zoom, snapValue, onMove, onResize, onVerticalDrag, onVerticalDragUpdate]);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDeleteClip = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const contextMenuItems: MenuItem[] = [
    {
      label: 'Delete Clip',
      action: handleDeleteClip,
      disabled: !onDelete,
    },
  ];

  // Display label: custom label > lane name > nothing
  const displayLabel = label || laneName;

  // Use external vertical drag deltaY if provided (for multi-clip drag),
  // otherwise use local vertical drag deltaY (for single clip drag)
  const effectiveVerticalDragDeltaY = externalVerticalDragDeltaY ?? verticalDragDeltaY;

  return (
    <div
      data-testid={`clip-${id}`}
      className={`clip ${isSelected ? 'clip--selected' : ''} ${
        isDragging ? 'clip--dragging' : ''
      } ${isResizing ? 'clip--resizing' : ''} ${
        isCopying ? 'clip--copying' : ''
      }`}
      style={{
        left: `${leftPx.toString()}px`,
        width: `${widthPx.toString()}px`,
        transform: effectiveVerticalDragDeltaY !== 0 ? `translateY(${effectiveVerticalDragDeltaY}px)` : undefined,
        zIndex: effectiveVerticalDragDeltaY !== 0 ? 1000 : undefined,
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      <div
        className="clip__handle clip__handle--left"
        data-testid={`clip-${id}-handle-left`}
        onMouseDown={handleResizeStart('left')}
      />
      <div
        className="clip__content"
        onMouseDown={handleDragStart}
        onDoubleClick={handleDoubleClick}
      >
        <div className="clip__corners">
          <span className="clip__corner clip__corner--tl">┌</span>
          <span className="clip__corner clip__corner--tr">┐</span>
        </div>
        {isEditing ? (
          <input
            ref={inputRef}
            className="clip__label-input terminal-input"
            defaultValue={label || ''}
            onKeyDown={handleLabelInputKeyDown}
            onBlur={handleLabelInputBlur}
            onClick={(e) => {
              e.stopPropagation();
            }}
            data-testid={`clip-${id}-label-input`}
          />
        ) : (
          displayLabel && (
            <div className="clip__label" data-testid={`clip-${id}-label`}>
              {displayLabel}
            </div>
          )
        )}
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
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Clip;
