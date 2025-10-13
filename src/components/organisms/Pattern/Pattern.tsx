/**
 * Song Arranger - Pattern Component
 * Represents a pattern on the timeline with drag and resize functionality
 */

import { useState, useRef, useEffect, MouseEvent, KeyboardEvent, memo } from 'react';
import ContextMenu, { type MenuItem } from '../ContextMenu';
import { PatternHandle } from '../../molecules/PatternHandle';
import type { ID, Position, Duration, ViewportState } from '@/types';
import { beatsToViewportPx } from '@/utils/viewport';
import { snapToGrid } from '@/utils/snap';
import { logger } from '@/utils/debug';
import './Pattern.css';

interface PatternProps {
  id: ID;
  trackId: ID;
  position: Position;
  duration: Duration;
  viewport: ViewportState;
  snapValue: number;
  isSelected: boolean;
  isEditing?: boolean;
  label?: string;
  trackName?: string;
  color?: string;
  externalVerticalDragDeltaY?: number;
  onSelect: (patternId: ID, isMultiSelect: boolean) => void;
  onMove: (patternId: ID, newPosition: Position, delta: number) => void;
  onResize: (patternId: ID, newDuration: Duration, edge: 'left' | 'right', startDuration: Duration, startPosition: Position) => void;
  onVerticalDrag?: (patternId: ID, startingTrackId: ID, deltaY: number) => void;
  onVerticalDragUpdate?: (patternId: ID, deltaY: number) => void;
  onCopy?: (patternId: ID) => void;
  onStartEditing?: (patternId: ID) => void;
  onStopEditing?: () => void;
  onLabelChange?: (patternId: ID, label: string) => void;
  onDelete?: (patternId: ID) => void;
}

const Pattern = ({
  id,
  trackId,
  position,
  duration,
  viewport,
  snapValue,
  isSelected,
  isEditing = false,
  label,
  trackName,
  color,
  externalVerticalDragDeltaY,
  onSelect,
  onMove,
  onResize,
  onVerticalDrag,
  onVerticalDragUpdate,
  onCopy,
  onStartEditing,
  onStopEditing,
  onLabelChange,
  onDelete,
}: PatternProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [verticalDragDeltaY, setVerticalDragDeltaY] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isNew, setIsNew] = useState(true);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartPosition = useRef(0);
  const dragStartDuration = useRef(0);
  const dragStartTrackId = useRef<ID>('');
  const verticalDragDeltaYRef = useRef(0); // Store actual value for mouseup handler
  const inputRef = useRef<HTMLInputElement>(null);
  const patternRef = useRef<HTMLDivElement>(null);

  // Remove 'new' state after animation completes (400ms as defined in CSS)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNew(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Convert beats to viewport-relative pixels
  const leftPx = beatsToViewportPx(position, viewport);
  const widthPx = duration * viewport.zoom;

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return; // Only left click

    // Prevent text selection during drag and stop event from bubbling to Timeline
    e.preventDefault();
    e.stopPropagation();

    // Selection is handled in handleDragStart (on content area) or here (on handles)
    // Only select here if clicking on handles, not content
    if ((e.target as HTMLElement).classList.contains('pattern__handle')) {
      const isMultiSelect = e.altKey;
      onSelect(id, isMultiSelect);
    }
  };

  const handleDragStart = (e: MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    // Always select on mousedown (before starting potential drag)
    const isMultiSelect = e.altKey;
    onSelect(id, isMultiSelect);

    // Check if Alt key is held (for copying)
    if (e.altKey && onCopy) {
      setIsCopying(true);
      onCopy(id);
    }

    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    dragStartPosition.current = position;
    dragStartTrackId.current = trackId; // Track starting track
  };

  const handleDoubleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (onStartEditing) {
      onStartEditing(id);
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
      if (onStopEditing) {
        onStopEditing();
      }
    } else if (e.key === 'Escape') {
      if (onStopEditing) {
        onStopEditing();
      }
    }
  };

  const handleLabelInputBlur = () => {
    if (inputRef.current && onLabelChange) {
      const newLabel = inputRef.current.value;
      onLabelChange(id, newLabel);
    }
    if (onStopEditing) {
      onStopEditing();
    }
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

        // Handle vertical track dragging - store deltaY for CSS transform
        // Don't update Redux until mouseup to prevent unmount/remount
        if (onVerticalDrag && Math.abs(deltaY) > 5) {
          verticalDragDeltaYRef.current = deltaY;
          setVerticalDragDeltaY(deltaY);

          // Notify Timeline of drag state for other selected patterns
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
      // This prevents the pattern from showing transform when it remounts in new track
      setIsDragging(false);
      setIsResizing(null);
      setIsCopying(false);
      setVerticalDragDeltaY(0);
      verticalDragDeltaYRef.current = 0;

      // Now update Redux (may cause unmount/remount in new track)
      if (wasDraggingVertically && onVerticalDrag) {
        onVerticalDrag(id, dragStartTrackId.current, verticalDelta);
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

  const handleDeletePattern = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const contextMenuItems: MenuItem[] = [
    {
      label: 'Delete Pattern',
      action: handleDeletePattern,
      disabled: !onDelete,
    },
  ];

  // Display label: custom label > track name > nothing
  const displayLabel = label || trackName;

  // Use external vertical drag deltaY if provided (for multi-pattern drag),
  // otherwise use local vertical drag deltaY (for single pattern drag)
  const effectiveVerticalDragDeltaY = externalVerticalDragDeltaY ?? verticalDragDeltaY;

  // Debug logging for vertical drag
  useEffect(() => {
    if (effectiveVerticalDragDeltaY !== 0 && patternRef.current) {
      const patternEl = patternRef.current;
      const trackContent = patternEl.parentElement;
      const track = trackContent?.parentElement;

      logger.log('Pattern vertical drag debug:', {
        patternId: id,
        isDragging,
        effectiveVerticalDragDeltaY,
        patternTransform: getComputedStyle(patternEl).transform,
        patternZIndex: getComputedStyle(patternEl).zIndex,
        trackContentOverflow: trackContent ? getComputedStyle(trackContent).overflow : 'N/A',
        trackContentOverflowY: trackContent ? getComputedStyle(trackContent).overflowY : 'N/A',
        trackOverflow: track ? getComputedStyle(track).overflow : 'N/A',
        trackOverflowY: track ? getComputedStyle(track).overflowY : 'N/A',
      });
    }
  }, [effectiveVerticalDragDeltaY, isDragging, id]);

  return (
    <div
      ref={patternRef}
      data-testid={`pattern-${id}`}
      className={`pattern ${isNew ? 'pattern--new' : ''} ${
        isSelected ? 'pattern--selected' : ''
      } ${isDragging ? 'pattern--dragging' : ''} ${
        isResizing ? 'pattern--resizing' : ''
      } ${isCopying ? 'pattern--copying' : ''}`}
      style={{
        left: `${leftPx.toString()}px`,
        width: `${widthPx.toString()}px`,
        transform: effectiveVerticalDragDeltaY !== 0 ? `translateY(${effectiveVerticalDragDeltaY}px)` : undefined,
        zIndex: (isDragging || isResizing || effectiveVerticalDragDeltaY !== 0) ? 1000 : undefined,
        ...(color ? { '--pattern-color': color } as React.CSSProperties : {}),
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      <PatternHandle patternId={id} edge="left" onResizeStart={handleResizeStart} />
      <div
        className="pattern__content"
        onMouseDown={handleDragStart}
        onDoubleClick={handleDoubleClick}
      >
        <div className="pattern__corners">
          <span className="pattern__corner pattern__corner--tl">┌</span>
          <span className="pattern__corner pattern__corner--tr">┐</span>
        </div>
        {isEditing ? (
          <input
            ref={inputRef}
            className="pattern__label-input terminal-input"
            defaultValue={label || ''}
            onKeyDown={handleLabelInputKeyDown}
            onBlur={handleLabelInputBlur}
            onClick={(e) => {
              e.stopPropagation();
            }}
            data-testid={`pattern-${id}-label-input`}
          />
        ) : (
          displayLabel && (
            <div className="pattern__label" data-testid={`pattern-${id}-label`}>
              {displayLabel}
            </div>
          )
        )}
        <div className="pattern__corners pattern__corners--bottom">
          <span className="pattern__corner pattern__corner--bl">└</span>
          <span className="pattern__corner pattern__corner--br">┘</span>
        </div>
      </div>
      <PatternHandle patternId={id} edge="right" onResizeStart={handleResizeStart} />
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

// Memoize the component to prevent unnecessary re-renders
// Only re-render if props actually change
export default memo(Pattern);
