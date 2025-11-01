/**
 * Cyclone - Minimap Component
 * Provides an overview of the entire arrangement with navigation
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { logger } from '@/utils/debug';
import { useAppSelector } from '@/store/hooks';
import type { ViewportState, Track, Pattern } from '@/types';
import {
  MINIMAP_EMBEDDED_HEIGHT,
  MINIMAP_EMBEDDED_MIN_WIDTH,
  MINIMAP_EMBEDDED_PADDING,
  MINIMAP_OVERLAY_WIDTH,
  MINIMAP_LANE_HEIGHT,
  MINIMAP_PADDING,
} from '@/constants';
import './Minimap.css';

interface MinimapProps {
  lanes: Track[];
  clips: Pattern[];
  viewport: ViewportState;
  timelineLength: number; // Total timeline length in beats
  visible: boolean;
  embedded?: boolean; // Whether embedded in menu bar
  onViewportChange: (offsetBeats: number) => void;
  onToggle: () => void;
}

const Minimap = ({
  lanes,
  clips,
  viewport,
  timelineLength,
  visible,
  embedded = false,
  onViewportChange,
  onToggle,
}: MinimapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(MINIMAP_EMBEDDED_MIN_WIDTH);
  const currentTheme = useAppSelector((state) => state.theme.current);

  // Theme-aware colors
  const getMinimapColors = useCallback(() => {
    if (currentTheme === 'modern') {
      return {
        background: '#1c1c1c',
        divider: 'rgba(179, 179, 179, 0.15)',
        defaultClip: '#4a9eff',
      };
    }
    // Retro theme
    return {
      background: '#000000',
      divider: 'rgba(0, 136, 0, 0.2)',
      defaultClip: '#00ff00',
    };
  }, [currentTheme]);

  // Track clip and lane IDs to detect real data changes (not just array reference changes)
  const clipsSignature = useMemo(() =>
    clips.map(c => `${c.id}-${c.position}-${c.duration}`).join('|'),
    [clips]
  );

  const lanesSignature = useMemo(() =>
    lanes.map(l => `${l.id}-${l.color}`).join('|'),
    [lanes]
  );

  // Update container width on resize (for embedded mode)
  useEffect(() => {
    if (!embedded || !containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        // Get the actual rendered width of the container
        const rect = containerRef.current.getBoundingClientRect();
        // Leave some margin for borders and padding
        const availableWidth = Math.floor(rect.width - 4);
        setContainerWidth(availableWidth);
      }
    };

    // Initial measurement
    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [embedded]);

  // Memoize computed dimensions to prevent unnecessary redraws
  const minimapWidth = useMemo(() =>
    embedded
      ? Math.max(MINIMAP_EMBEDDED_MIN_WIDTH, containerWidth)
      : MINIMAP_OVERLAY_WIDTH,
    [embedded, containerWidth]
  );

  const minimapHeight = useMemo(() =>
    embedded
      ? MINIMAP_EMBEDDED_HEIGHT
      : lanes.length * MINIMAP_LANE_HEIGHT + MINIMAP_PADDING * 2,
    [embedded, lanes.length]
  );

  const padding = useMemo(() =>
    embedded ? MINIMAP_EMBEDDED_PADDING : MINIMAP_PADDING,
    [embedded]
  );

  const laneHeight = useMemo(() =>
    embedded
      ? Math.max(2, (MINIMAP_EMBEDDED_HEIGHT - MINIMAP_EMBEDDED_PADDING * 2) / Math.max(1, lanes.length))
      : MINIMAP_LANE_HEIGHT,
    [embedded, lanes.length]
  );

  const scale = useMemo(() =>
    minimapWidth / timelineLength,
    [minimapWidth, timelineLength]
  );

  // Render the minimap canvas
  // NOTE: viewport is intentionally NOT in dependencies - the viewport overlay
  // is positioned via CSS and doesn't require redrawing the canvas
  // Uses data signatures instead of array references to avoid unnecessary redraws
  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create lane lookup map locally to avoid reference-based dependency issues
    const laneIndexMap = new Map<string, number>();
    lanes.forEach((lane, index) => {
      laneIndexMap.set(lane.id, index);
    });

    // Set canvas size
    canvas.width = minimapWidth;
    canvas.height = minimapHeight;

    // Get theme colors
    const colors = getMinimapColors();

    // Clear canvas with theme background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clips
    clips.forEach((clip) => {
      const laneIndex = laneIndexMap.get(clip.trackId);
      if (laneIndex === undefined) return;

      const lane = lanes[laneIndex];
      const x = padding + clip.position * scale;
      const y = padding + laneIndex * laneHeight;
      const width = clip.duration * scale;
      const height = Math.max(1, laneHeight - 1);

      // Draw clip rectangle with lane color or theme default
      ctx.fillStyle = lane?.color ?? colors.defaultClip;
      ctx.fillRect(x, y, width, height);

      // Add subtle border (only if height is large enough)
      if (height > 3) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
      }
    });

    // Draw lane dividers (only if not in embedded mode or if lanes are tall enough)
    if (!embedded || laneHeight > 3) {
      ctx.strokeStyle = colors.divider;
      ctx.lineWidth = 1;
      for (let i = 1; i < lanes.length; i++) {
        const y = padding + i * laneHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(minimapWidth - padding, y);
        ctx.stroke();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, clipsSignature, lanesSignature, timelineLength, minimapHeight, minimapWidth, padding, laneHeight, scale, embedded, currentTheme, getMinimapColors]);
  // Note: lanes and clips are intentionally omitted from deps but used in the effect body
  // We rely on clipsSignature and lanesSignature to detect data changes without triggering
  // on array reference changes. This prevents unnecessary redraws during scrolling.

  // Handle canvas click to jump to position
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!containerRef.current) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - padding;

      // Convert click position to beat position
      const clickedBeat = x / scale;

      // Center the viewport on the clicked position
      const viewportWidthBeats = viewport.widthPx / viewport.zoom;
      const newOffset = Math.max(0, clickedBeat - viewportWidthBeats / 2);

      onViewportChange(newOffset);
    },
    [scale, viewport, onViewportChange, padding]
  );

  // Handle viewport drag start
  const handleViewportMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStartX(e.clientX);
      setDragStartOffset(viewport.offsetBeats);
    },
    [viewport.offsetBeats]
  );

  // Handle viewport drag with requestAnimationFrame throttling for better performance
  useEffect(() => {
    if (!isDragging) return;

    let rafId: number | null = null;
    let lastClientX = dragStartX;

    const handleMouseMove = (e: MouseEvent) => {
      lastClientX = e.clientX;

      // Only schedule a new frame if one isn't already scheduled
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          const deltaX = lastClientX - dragStartX;
          const deltaBeats = deltaX / scale;
          const newOffset = Math.max(0, dragStartOffset + deltaBeats);

          onViewportChange(newOffset);
          rafId = null;
        });
      }
    };

    const handleMouseUp = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartOffset, scale, onViewportChange]);

  // Calculate viewport rectangle dimensions
  const viewportWidthBeats = viewport.widthPx / viewport.zoom;
  const viewportLeft = padding + viewport.offsetBeats * scale;
  const viewportWidth = viewportWidthBeats * scale;

  // Debug logging for minimap positioning
  useEffect(() => {
    if (visible && containerRef.current && !embedded) {
      const rect = containerRef.current.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(containerRef.current);
      logger.debug('[Minimap] Positioning info:', {
        bottom: computedStyle.bottom,
        right: computedStyle.right,
        position: computedStyle.position,
        rect: {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          width: rect.width
        },
        windowHeight: window.innerHeight
      });
    }
  }, [visible, embedded, minimapHeight, minimapWidth]);

  if (!visible) {
    logger.debug('[Minimap] Not rendering - not visible');
    return null;
  }

  return (
    <div
      className={`minimap ${embedded ? 'minimap--embedded' : ''}`}
      data-testid="minimap"
      role="region"
      aria-label="Arrangement Overview"
      ref={containerRef}
    >
      {!embedded && (
        <div className="minimap__header">
          <div className="minimap__title">ARRANGEMENT OVERVIEW</div>
          <button
            className="minimap__close"
            data-testid="minimap-close"
            onClick={onToggle}
            aria-label="Close minimap"
          >
            [X]
          </button>
        </div>
      )}
      <div className="minimap__content">
        <div className="minimap__canvas-container">
          <canvas
            ref={canvasRef}
            className="minimap__canvas"
            data-testid="minimap-canvas"
            onClick={handleCanvasClick}
          />
          <div
            className="minimap__viewport"
            data-testid="minimap-viewport"
            style={{
              left: `${viewportLeft}px`,
              width: `${viewportWidth}px`,
              height: `${minimapHeight - padding * 2}px`,
            }}
            onMouseDown={handleViewportMouseDown}
          />
        </div>
      </div>
    </div>
  );
};

export default Minimap;
