/**
 * Song Arranger - Rectangle Selection Hook
 * Custom hook for rectangle selection logic
 */

import { useCallback, useEffect, useState, RefObject } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { selectPattern, togglePatternSelection, clearSelection } from '@/store/slices/selectionSlice';
import { first } from '@/utils/array';
import { LANE_HEADER_WIDTH, RULER_HEIGHT, LANE_HEIGHT } from '@/constants';
import type { Pattern, Track, ID } from '@/types';

interface SelectionRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface Viewport {
  zoom: number;
  offsetBeats: number;
}

interface UseRectangleSelectionOptions {
  timelineRef: RefObject<HTMLDivElement>;
  viewport: Viewport;
  clips: Pattern[];
  lanes: Track[];
}

interface UseRectangleSelectionReturn {
  selectionRect: SelectionRect | null;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Custom hook for rectangle selection
 * Handles mouse interactions for drawing a selection rectangle and selecting clips
 */
export function useRectangleSelection({
  timelineRef,
  viewport,
  clips,
  lanes,
}: UseRectangleSelectionOptions): UseRectangleSelectionReturn {
  const dispatch = useAppDispatch();
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);

  /**
   * Handle mouse down to start rectangle selection
   */
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only start rectangle selection if clicking on the timeline background (not on patterns/tracks)
    const target = e.target as HTMLElement;
    if (
      !target.classList.contains('timeline__lanes') &&
      !target.classList.contains('track__content') &&
      !target.classList.contains('track__grid')
    ) {
      return;
    }

    // Don't interfere with middle mouse button panning
    if (e.button !== 0) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionRect({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  }, []);

  /**
   * Update selection rectangle on mouse move and handle mouse up
   */
  useEffect(() => {
    if (!selectionRect) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setSelectionRect((prev) => {
        if (!prev) return null;
        return { ...prev, currentX: x, currentY: y };
      });
    };

    const handleMouseUp = () => {
      if (!selectionRect || !timelineRef.current) {
        setSelectionRect(null);
        return;
      }

      // Calculate selection bounds in viewport coordinates
      const minX = Math.min(selectionRect.startX, selectionRect.currentX);
      const maxX = Math.max(selectionRect.startX, selectionRect.currentX);
      const minY = Math.min(selectionRect.startY, selectionRect.currentY);
      const maxY = Math.max(selectionRect.startY, selectionRect.currentY);

      // Find all clips within the selection rectangle
      // Do comparison in pixel space to avoid precision loss at low zoom levels
      const selectedIds: ID[] = [];
      clips.forEach((clip) => {
        // Convert clip beat positions to viewport pixels, then add track header offset
        // Patterns are positioned inside track__content, which starts after the track header
        const clipStartPx = LANE_HEADER_WIDTH + (clip.position - viewport.offsetBeats) * viewport.zoom;
        const clipEndPx = LANE_HEADER_WIDTH + (clip.position + clip.duration - viewport.offsetBeats) * viewport.zoom;

        // Check if clip overlaps with selection horizontally (in pixel space)
        const horizontalOverlap = clipStartPx < maxX && clipEndPx > minX;

        if (horizontalOverlap) {
          // Find the lane's Y position to check vertical overlap
          const laneIndex = lanes.findIndex((lane) => lane.id === clip.trackId);
          if (laneIndex !== -1) {
            const laneY = RULER_HEIGHT + laneIndex * LANE_HEIGHT;
            const laneBottom = laneY + LANE_HEIGHT;

            // Check if selection rectangle overlaps with this lane vertically
            if (laneY < maxY && laneBottom > minY) {
              selectedIds.push(clip.id);
            }
          }
        }
      });

      // Update selection
      if (selectedIds.length > 0) {
        // Select first clip and toggle the rest
        const firstClipId = first(selectedIds);
        if (firstClipId) {
          dispatch(selectPattern(firstClipId));
          selectedIds.slice(1).forEach((clipId) => {
            dispatch(togglePatternSelection(clipId));
          });
        }
      } else {
        // Clear selection if no clips were selected
        dispatch(clearSelection());
      }

      setSelectionRect(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectionRect, viewport, clips, lanes, dispatch, timelineRef]);

  return {
    selectionRect,
    handleMouseDown,
  };
}
