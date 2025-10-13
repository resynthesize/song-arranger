/**
 * Song Arranger - Viewport Hook
 * Custom hook for viewport pan/zoom interactions
 */

import { useEffect, useCallback, useRef, RefObject } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setViewportOffset,
  panViewport,
  setViewportDimensions,
  zoomIn,
  zoomOut,
  selectViewport,
} from '@/store/slices/timelineSlice';
import { calculateZoomOffset } from '@/utils/viewport';
import { ZOOM_LEVELS } from '@/constants';
import { last } from '@/utils/array';

interface UseViewportOptions {
  containerRef: RefObject<HTMLElement>;
  wheelZoomEnabled?: boolean;
  panEnabled?: boolean;
}

interface UseViewportReturn {
  viewport: ReturnType<typeof selectViewport>;
  handleWheel: (e: WheelEvent) => void;
  handlePan: (deltaBeats: number) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomToPoint: (mouseX: number, newZoom: number) => void;
}

/**
 * Custom hook for viewport interactions
 * Handles pan, zoom, wheel events, and dimension updates
 */
export function useViewport({
  containerRef,
  wheelZoomEnabled = true,
  panEnabled = true,
}: UseViewportOptions): UseViewportReturn {
  const dispatch = useAppDispatch();
  const viewport = useAppSelector((state) => selectViewport(state));
  const wheelTimeoutRef = useRef<number | null>(null);

  /**
   * Update viewport dimensions when container resizes
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      dispatch(
        setViewportDimensions({
          widthPx: rect.width,
          heightPx: rect.height,
        })
      );
    };

    // Initial dimensions
    updateDimensions();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, dispatch]);

  /**
   * Handle wheel events for zooming and panning
   */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      // Check if Ctrl/Cmd key is pressed for zoom, otherwise pan
      if (e.ctrlKey || e.metaKey) {
        if (!wheelZoomEnabled) return;

        // Zoom with wheel
        const delta = -e.deltaY;
        if (delta > 0) {
          // Zoom in
          const nextZoom = getNextZoomLevel(viewport.zoom);
          const newOffset = calculateZoomOffset(viewport, mouseX, nextZoom);
          dispatch(setViewportOffset(newOffset));
          dispatch(zoomIn());
        } else if (delta < 0) {
          // Zoom out
          const prevZoom = getPreviousZoomLevel(viewport.zoom);
          const newOffset = calculateZoomOffset(viewport, mouseX, prevZoom);
          dispatch(setViewportOffset(newOffset));
          dispatch(zoomOut());
        }
      } else {
        if (!panEnabled) return;

        // Pan horizontally with wheel
        // Convert wheel deltaY to beats
        const panSensitivity = 1.0; // Adjust as needed
        const deltaBeats = (e.deltaY * panSensitivity) / viewport.zoom;

        // Debounce rapid wheel events
        if (wheelTimeoutRef.current) {
          window.clearTimeout(wheelTimeoutRef.current);
        }

        dispatch(panViewport(deltaBeats));

        wheelTimeoutRef.current = window.setTimeout(() => {
          wheelTimeoutRef.current = null;
        }, 100);
      }
    },
    [containerRef, viewport, wheelZoomEnabled, panEnabled, dispatch]
  );

  /**
   * Attach wheel event listener
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, handleWheel]);

  /**
   * Pan the viewport by a delta in beats
   */
  const handlePan = useCallback(
    (deltaBeats: number) => {
      dispatch(panViewport(deltaBeats));
    },
    [dispatch]
  );

  /**
   * Zoom in to next discrete level
   */
  const handleZoomIn = useCallback(() => {
    dispatch(zoomIn());
  }, [dispatch]);

  /**
   * Zoom out to previous discrete level
   */
  const handleZoomOut = useCallback(() => {
    dispatch(zoomOut());
  }, [dispatch]);

  /**
   * Zoom to a specific level while keeping a point fixed
   */
  const handleZoomToPoint = useCallback(
    (mouseX: number, newZoom: number) => {
      const newOffset = calculateZoomOffset(viewport, mouseX, newZoom);
      dispatch(setViewportOffset(newOffset));
    },
    [viewport, dispatch]
  );

  return {
    viewport,
    handleWheel,
    handlePan,
    handleZoomIn,
    handleZoomOut,
    handleZoomToPoint,
  };
}

/**
 * Get the next zoom level (zoom in)
 */
function getNextZoomLevel(currentZoom: number): number {
  for (let i = 0; i < ZOOM_LEVELS.length; i++) {
    const level = ZOOM_LEVELS[i];
    if (level !== undefined && level > currentZoom) {
      return level;
    }
  }
  const lastLevel = last(ZOOM_LEVELS);
  return lastLevel ?? 800;
}

/**
 * Get the previous zoom level (zoom out)
 */
function getPreviousZoomLevel(currentZoom: number): number {
  for (let i = ZOOM_LEVELS.length - 1; i >= 0; i--) {
    const level = ZOOM_LEVELS[i];
    if (level !== undefined && level < currentZoom) {
      return level;
    }
  }
  const firstLevel = ZOOM_LEVELS[0];
  return firstLevel ?? 0.25;
}
