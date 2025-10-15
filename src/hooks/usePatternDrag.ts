/**
 * Cyclone - usePatternDrag Hook
 * Handles horizontal and vertical dragging for Pattern component
 */

import { useState, useRef, useEffect, useCallback, MouseEvent } from 'react';
import type { ID, Position, ViewportState } from '@/types';
import { snapToGrid } from '@/utils/snap';

interface UsePatternDragParams {
  id: ID;
  trackId: ID;
  position: Position;
  viewport: ViewportState;
  snapValue: number;
  onSelect: (patternId: ID, isMultiSelect: boolean) => void;
  onMove: (patternId: ID, newPosition: Position, delta: number) => void;
  onVerticalDrag?: (patternId: ID, startingTrackId: ID, deltaY: number) => void;
  onVerticalDragUpdate?: (patternId: ID, deltaY: number) => void;
  onCopy?: (patternId: ID) => void;
}

interface UsePatternDragReturn {
  isDragging: boolean;
  isCopying: boolean;
  verticalDragDeltaY: number;
  handleDragStart: (e: MouseEvent) => void;
}

/**
 * Custom hook for pattern dragging (horizontal movement and vertical track switching)
 */
export const usePatternDrag = ({
  id,
  trackId,
  position,
  viewport,
  snapValue,
  onSelect,
  onMove,
  onVerticalDrag,
  onVerticalDragUpdate,
  onCopy,
}: UsePatternDragParams): UsePatternDragReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [verticalDragDeltaY, setVerticalDragDeltaY] = useState(0);

  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartPosition = useRef(0);
  const dragStartTrackId = useRef<ID>('');
  const verticalDragDeltaYRef = useRef(0); // Store actual value for mouseup handler

  /**
   * Handle drag start on pattern content
   */
  const handleDragStart = useCallback(
    (e: MouseEvent) => {
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
    },
    [id, trackId, position, onSelect, onCopy]
  );

  // Handle mouse move and mouse up during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const deltaY = e.clientY - dragStartY.current;
      const deltaBeats = deltaX / viewport.zoom;

      // Calculate new position and snap it
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
    };

    const handleMouseUp = () => {
      const wasDraggingVertically = verticalDragDeltaYRef.current !== 0;
      const verticalDelta = verticalDragDeltaYRef.current;

      // Clear states first, before calling Redux update
      // This prevents the pattern from showing transform when it remounts in new track
      setIsDragging(false);
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
  }, [isDragging, id, viewport.zoom, snapValue, onMove, onVerticalDrag, onVerticalDragUpdate]);

  return {
    isDragging,
    isCopying,
    verticalDragDeltaY,
    handleDragStart,
  };
};
