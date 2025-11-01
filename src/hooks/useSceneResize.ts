/**
 * Cyclone - useSceneResize Hook
 * Handles right-edge resizing for Scene markers in the ruler
 */

import { useState, useRef, useEffect, useCallback, MouseEvent } from 'react';
import type { ID, Duration, ViewportState } from '@/types';
import { snapToGrid } from '@/utils/snap';

interface UseSceneResizeParams {
  sceneId: ID;
  duration: Duration;
  viewport: ViewportState;
  snapValue: number;
  minDuration?: Duration; // Minimum scene duration (default: 4 beats = 1 bar)
  onResize: (sceneId: ID, newDuration: Duration) => void;
}

interface UseSceneResizeReturn {
  isResizing: boolean;
  handleResizeStart: (e: MouseEvent) => void;
}

/**
 * Custom hook for scene resizing (right edge only)
 *
 * Scenes resize from the right edge, which adjusts their duration.
 * When a scene is resized, subsequent scenes are shifted to maintain
 * the contiguous timeline.
 */
export const useSceneResize = ({
  sceneId,
  duration,
  viewport,
  snapValue,
  minDuration = 4, // Default: 1 bar = 4 beats
  onResize,
}: UseSceneResizeParams): UseSceneResizeReturn => {
  const [isResizing, setIsResizing] = useState(false);

  const dragStartX = useRef(0);
  const dragStartDuration = useRef(0);
  const lastAppliedDuration = useRef(0);

  /**
   * Handle resize start from right edge
   */
  const handleResizeStart = useCallback(
    (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      e.preventDefault();
      e.stopPropagation(); // Prevent double-click on parent

      console.log('[useSceneResize] handleResizeStart:', {
        sceneId,
        duration,
        'dragStartDuration (will set to)': duration,
        'lastAppliedDuration (will set to)': duration,
      });

      setIsResizing(true);
      dragStartX.current = e.clientX;
      dragStartDuration.current = duration;
      lastAppliedDuration.current = duration;
    },
    [duration, sceneId]
  );

  // Handle mouse move and mouse up during resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const deltaBeats = deltaX / viewport.zoom;

      // Calculate new duration from right edge resize
      const rawNewDuration = dragStartDuration.current + deltaBeats;

      // Snap to grid and enforce minimum duration
      const snappedDuration = Math.max(
        minDuration,
        snapToGrid(rawNewDuration, snapValue)
      );

      console.log('[useSceneResize] handleMouseMove:', {
        sceneId,
        deltaX,
        'viewport.zoom': viewport.zoom,
        deltaBeats,
        'dragStartDuration.current': dragStartDuration.current,
        rawNewDuration,
        snapValue,
        'snappedDuration (after snap)': snappedDuration,
        'lastAppliedDuration.current': lastAppliedDuration.current,
        'will call onResize?': snappedDuration !== lastAppliedDuration.current,
      });

      // Only update if the snapped duration is different from the last applied duration
      // This prevents jumping when first grabbing the handle
      if (snappedDuration !== lastAppliedDuration.current) {
        console.log('[useSceneResize] Calling onResize with:', {
          sceneId,
          snappedDuration,
        });
        lastAppliedDuration.current = snappedDuration;
        onResize(sceneId, snappedDuration);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sceneId, viewport.zoom, snapValue, minDuration, onResize]);

  return {
    isResizing,
    handleResizeStart,
  };
};
