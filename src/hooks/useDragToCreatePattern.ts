/**
 * Cyclone - useDragToCreatePattern Hook
 * Custom hook for drag-to-create pattern functionality
 */

import { useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react';
import type { Position, Duration, ViewportState } from '@/types';
import { snapToGridFloor, snapToGrid } from '@/utils/snap';
import { beatsToViewportPx } from '@/utils/viewport';
import { DEFAULT_CLIP_DURATION } from '@/constants';

interface DragCreateState {
  startX: number;
  startY: number;
  startPositionBeats: Position;
  currentPositionBeats: Position;
}

interface GhostClipData {
  position: Position;
  duration: Duration;
  leftPx: number;
  widthPx: number;
}

interface UseDragToCreatePatternOptions {
  viewport: ViewportState;
  snapValue: number;
  onCreatePattern: (position: Position, duration?: Duration) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

interface UseDragToCreatePatternResult {
  handleMouseDown: (e: ReactMouseEvent<HTMLDivElement>) => void;
  ghostPattern: GhostClipData | null;
}

/**
 * Custom hook for drag-to-create pattern functionality
 * Handles double-click detection, drag state, and ghost pattern preview
 */
export function useDragToCreatePattern({
  viewport,
  snapValue,
  onCreatePattern,
  containerRef,
}: UseDragToCreatePatternOptions): UseDragToCreatePatternResult {
  const [dragCreateState, setDragCreateState] = useState<DragCreateState | null>(null);

  // Track click timing for double-click detection
  const lastClickTimeRef = useRef<number>(0);
  const lastClickPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle drag-to-create mousemove and mouseup
  useEffect(() => {
    if (!dragCreateState) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !dragCreateState) return;

      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentPositionBeats = viewport.offsetBeats + currentX / viewport.zoom;

      setDragCreateState((prev) => {
        if (!prev) return null;
        return { ...prev, currentPositionBeats };
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!containerRef.current || !dragCreateState) {
        setDragCreateState(null);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();

      // Check if mouse is still within track boundaries vertically
      const mouseY = e.clientY;
      const laneTop = rect.top;
      const laneBottom = rect.bottom;
      const isInsideTrack = mouseY >= laneTop && mouseY <= laneBottom;

      if (!isInsideTrack) {
        // Cancel creation if dragged outside track
        setDragCreateState(null);
        return;
      }

      // Calculate final position and duration
      const startPos = dragCreateState.startPositionBeats;
      const endPos = dragCreateState.currentPositionBeats;

      // Calculate raw duration to detect direction
      const rawDuration = endPos - startPos;

      // Snap duration to grid and enforce minimum
      const minDuration = Math.max(snapValue, 0.25); // Minimum is snap value or 0.25 beats
      let clipPosition: Position;
      let duration: Duration;

      if (Math.abs(rawDuration) < 0.01) {
        // Quick click without drag - create default pattern at start position
        clipPosition = snapToGridFloor(startPos, snapValue);
        duration = DEFAULT_CLIP_DURATION;
      } else if (rawDuration >= 0) {
        // Dragging forward (left to right)
        clipPosition = snapToGridFloor(startPos, snapValue);
        const snappedEnd = snapToGrid(endPos, snapValue);
        duration = Math.max(minDuration, snappedEnd - clipPosition);
      } else {
        // Dragging backward (right to left)
        // For backward drag, floor the end position and use the ceiling of start to include the full grid cell
        const snappedEnd = snapToGridFloor(endPos, snapValue);
        const snappedStart = snapToGrid(startPos, snapValue);
        clipPosition = snappedEnd;
        duration = Math.max(minDuration, snappedStart - snappedEnd);
      }

      // Create the clip
      onCreatePattern(clipPosition, duration);

      // Clear drag state
      setDragCreateState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragCreateState, viewport, snapValue, onCreatePattern, containerRef]);

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    // Only handle left mouse button
    if (e.button !== 0) return;

    // Don't trigger if clicking on a clip
    if ((e.target as HTMLElement).closest('.clip')) {
      return;
    }

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    const distanceFromLastClick = Math.hypot(
      e.clientX - lastClickPosRef.current.x,
      e.clientY - lastClickPosRef.current.y
    );

    // Double-click threshold: within 500ms and within 5px of last click
    const isDoubleClick = timeSinceLastClick < 500 && distanceFromLastClick < 5;

    if (isDoubleClick && containerRef.current) {
      // This is the second click - start drag-to-create
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const positionInBeats = viewport.offsetBeats + clickX / viewport.zoom;

      setDragCreateState({
        startX: e.clientX,
        startY: e.clientY,
        startPositionBeats: positionInBeats,
        currentPositionBeats: positionInBeats,
      });

      // Prevent default and stop propagation to avoid text selection and drag selection
      e.preventDefault();
      e.stopPropagation();
    } else {
      // This is a single click - just track it for next potential double-click
      lastClickTimeRef.current = now;
      lastClickPosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Calculate ghost pattern data if dragging
  const ghostPattern: GhostClipData | null = dragCreateState ? (() => {
    const startPos = dragCreateState.startPositionBeats;
    const endPos = dragCreateState.currentPositionBeats;

    // Calculate direction and duration
    const rawDuration = endPos - startPos;
    const minDuration = Math.max(snapValue, 0.25);

    let clipPosition: Position;
    let duration: Duration;

    if (rawDuration >= 0) {
      // Dragging forward (left to right)
      clipPosition = snapToGridFloor(startPos, snapValue);
      const snappedEnd = snapToGrid(endPos, snapValue);
      duration = Math.max(minDuration, snappedEnd - clipPosition);
    } else {
      // Dragging backward (right to left)
      // For backward drag, floor the end position and use the ceiling of start to include the full grid cell
      const snappedEnd = snapToGridFloor(endPos, snapValue);
      const snappedStart = snapToGrid(startPos, snapValue);
      clipPosition = snappedEnd;
      duration = Math.max(minDuration, snappedStart - snappedEnd);
    }

    // Calculate pixel position and width
    const leftPx = beatsToViewportPx(clipPosition, viewport);
    const widthPx = duration * viewport.zoom;

    return {
      position: clipPosition,
      duration,
      leftPx,
      widthPx,
    };
  })() : null;

  return {
    handleMouseDown,
    ghostPattern,
  };
}
