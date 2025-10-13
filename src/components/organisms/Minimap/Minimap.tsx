/**
 * Song Arranger - Minimap Component
 * Provides an overview of the entire arrangement with navigation
 */

import { useEffect, useRef, useState, useCallback } from 'react';
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

  // Calculate minimap dimensions based on mode
  const minimapWidth = embedded
    ? Math.max(MINIMAP_EMBEDDED_MIN_WIDTH, containerWidth)
    : MINIMAP_OVERLAY_WIDTH;

  const minimapHeight = embedded
    ? MINIMAP_EMBEDDED_HEIGHT
    : lanes.length * MINIMAP_LANE_HEIGHT + MINIMAP_PADDING * 2;

  const padding = embedded ? MINIMAP_EMBEDDED_PADDING : MINIMAP_PADDING;

  // Calculate lane height dynamically for embedded mode to fit all lanes
  const laneHeight = embedded
    ? Math.max(2, (MINIMAP_EMBEDDED_HEIGHT - MINIMAP_EMBEDDED_PADDING * 2) / Math.max(1, lanes.length))
    : MINIMAP_LANE_HEIGHT;

  const scale = minimapWidth / timelineLength;

  // Render the minimap canvas
  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = minimapWidth;
    canvas.height = minimapHeight;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clips
    clips.forEach((clip) => {
      const laneIndex = lanes.findIndex((lane) => lane.id === clip.trackId);
      if (laneIndex === -1) return;

      const lane = lanes[laneIndex];
      const x = padding + clip.position * scale;
      const y = padding + laneIndex * laneHeight;
      const width = clip.duration * scale;
      const height = Math.max(1, laneHeight - 1);

      // Draw clip rectangle with lane color
      ctx.fillStyle = lane?.color ?? '#00ff00';
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
      ctx.strokeStyle = 'rgba(0, 136, 0, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 1; i < lanes.length; i++) {
        const y = padding + i * laneHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(minimapWidth - padding, y);
        ctx.stroke();
      }
    }
  }, [visible, lanes, clips, timelineLength, minimapHeight, minimapWidth, padding, laneHeight, scale, embedded]);

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

  // Handle viewport drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;
      const deltaBeats = deltaX / scale;
      const newOffset = Math.max(0, dragStartOffset + deltaBeats);

      onViewportChange(newOffset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartOffset, scale, onViewportChange]);

  // Calculate viewport rectangle dimensions
  const viewportWidthBeats = viewport.widthPx / viewport.zoom;
  const viewportLeft = padding + viewport.offsetBeats * scale;
  const viewportWidth = viewportWidthBeats * scale;

  if (!visible) {
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
