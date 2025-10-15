/**
 * Cyclone - usePatternResize Hook
 * Handles left and right edge resizing for Pattern component
 */

import { useState, useRef, useEffect, useCallback, MouseEvent } from 'react';
import type { ID, Duration, Position, ViewportState } from '@/types';
import { snapToGrid } from '@/utils/snap';

interface UsePatternResizeParams {
  id: ID;
  position: Position;
  duration: Duration;
  viewport: ViewportState;
  snapValue: number;
  onResize: (patternId: ID, newDuration: Duration, edge: 'left' | 'right', startDuration: Duration, startPosition: Position) => void;
}

interface UsePatternResizeReturn {
  isResizing: 'left' | 'right' | null;
  handleResizeStart: (edge: 'left' | 'right') => (e: MouseEvent) => void;
}

/**
 * Custom hook for pattern resizing (left and right edges)
 */
export const usePatternResize = ({
  id,
  position,
  duration,
  viewport,
  snapValue,
  onResize,
}: UsePatternResizeParams): UsePatternResizeReturn => {
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);

  const dragStartX = useRef(0);
  const dragStartDuration = useRef(0);
  const dragStartPosition = useRef(0);

  /**
   * Handle resize start from left or right edge
   */
  const handleResizeStart = useCallback(
    (edge: 'left' | 'right') => (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();

      setIsResizing(edge);
      dragStartX.current = e.clientX;
      dragStartDuration.current = duration;
      dragStartPosition.current = position;
    },
    [duration, position]
  );

  // Handle mouse move and mouse up during resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const deltaBeats = deltaX / viewport.zoom;

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
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, id, viewport.zoom, snapValue, onResize]);

  return {
    isResizing,
    handleResizeStart,
  };
};
