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
  horizontalDragDeltaX: number;
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
  const [horizontalDragDeltaX, setHorizontalDragDeltaX] = useState(0);

  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartPosition = useRef(0);
  const dragStartTrackId = useRef<ID>('');
  const verticalDragDeltaYRef = useRef(0); // Store actual value for mouseup handler
  const horizontalDragDeltaXRef = useRef(0); // Store actual value for mouseup handler
  const hasDragStarted = useRef(false); // Track if we've actually started dragging (moved > threshold)

  /**
   * Handle drag start on pattern content
   */
  const handleDragStart = useCallback(
    (e: MouseEvent) => {
      console.log(`[usePatternDrag] handleDragStart called`, {
        id,
        button: e.button,
        target: (e.target as HTMLElement).className,
        currentTarget: (e.currentTarget as HTMLElement).className,
        clientX: e.clientX,
        clientY: e.clientY
      });

      if (e.button !== 0) return;

      // Don't stop propagation here - let double-click events work
      // We'll handle event propagation in mousemove if actually dragging

      // Always select on mousedown (before starting potential drag)
      const isMultiSelect = e.altKey;
      onSelect(id, isMultiSelect);

      // Check if Alt key is held (for copying)
      if (e.altKey && onCopy) {
        setIsCopying(true);
        onCopy(id);
      }

      console.log(`[usePatternDrag] Starting drag`, { id });
      // Don't set isDragging yet - wait for mousemove threshold
      // This allows double-click to work properly
      dragStartX.current = e.clientX;
      dragStartY.current = e.clientY;
      dragStartPosition.current = position;
      dragStartTrackId.current = trackId; // Track starting track

      // Add listeners immediately to detect movement
      setIsDragging(true);
    },
    [id, trackId, position, onSelect, onCopy]
  );

  // Handle mouse move and mouse up during drag
  useEffect(() => {
    if (!isDragging) return;

    const DRAG_THRESHOLD = 5; // pixels - must move this much to start drag

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const deltaY = e.clientY - dragStartY.current;
      const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Only start actual drag if we've moved beyond threshold
      if (!hasDragStarted.current && totalDelta < DRAG_THRESHOLD) {
        return; // Not enough movement yet - don't start drag
      }

      // Mark that we've started dragging
      if (!hasDragStarted.current) {
        hasDragStarted.current = true;
      }

      // Store horizontal drag deltaX for CSS transform (smooth visual movement)
      // Don't update Redux until mouseup to allow smooth dragging across multiple scenes
      horizontalDragDeltaXRef.current = deltaX;
      setHorizontalDragDeltaX(deltaX);

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
      const wasDraggingHorizontally = horizontalDragDeltaXRef.current !== 0;
      const wasDraggingVertically = verticalDragDeltaYRef.current !== 0;
      const horizontalDelta = horizontalDragDeltaXRef.current;
      const verticalDelta = verticalDragDeltaYRef.current;

      // Calculate final snapped position from horizontal delta
      if (wasDraggingHorizontally) {
        const deltaBeats = horizontalDelta / viewport.zoom;
        const rawNewPosition = dragStartPosition.current + deltaBeats;
        const snappedPosition = snapToGrid(rawNewPosition, snapValue);
        const positionDelta = snappedPosition - dragStartPosition.current;

        // Update Redux with final snapped position
        onMove(id, snappedPosition, positionDelta);
      }

      // Clear states first, before calling vertical Redux update
      // This prevents the pattern from showing transform when it remounts in new track
      setIsDragging(false);
      setIsCopying(false);
      setVerticalDragDeltaY(0);
      setHorizontalDragDeltaX(0);
      verticalDragDeltaYRef.current = 0;
      horizontalDragDeltaXRef.current = 0;
      hasDragStarted.current = false; // Reset for next drag

      // Now update Redux for vertical movement (may cause unmount/remount in new track)
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
    horizontalDragDeltaX,
    handleDragStart,
  };
};
