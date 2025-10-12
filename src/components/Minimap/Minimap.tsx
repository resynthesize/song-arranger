/**
 * Song Arranger - Minimap Component
 * Provides an overview of the entire arrangement with navigation
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ViewportState, Lane, Clip } from '@/types';
import './Minimap.css';

interface MinimapProps {
  lanes: Lane[];
  clips: Clip[];
  viewport: ViewportState;
  timelineLength: number; // Total timeline length in beats
  visible: boolean;
  onViewportChange: (offsetBeats: number) => void;
  onToggle: () => void;
}

const MINIMAP_WIDTH = 400;
const MINIMAP_LANE_HEIGHT = 20;
const MINIMAP_PADDING = 4;

const Minimap = ({
  lanes,
  clips,
  viewport,
  timelineLength,
  visible,
  onViewportChange,
  onToggle,
}: MinimapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);

  // Calculate minimap dimensions
  const minimapHeight = lanes.length * MINIMAP_LANE_HEIGHT + MINIMAP_PADDING * 2;
  const scale = MINIMAP_WIDTH / timelineLength;

  // Render the minimap canvas
  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = MINIMAP_WIDTH;
    canvas.height = minimapHeight;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clips
    clips.forEach((clip) => {
      const laneIndex = lanes.findIndex((lane) => lane.id === clip.laneId);
      if (laneIndex === -1) return;

      const lane = lanes[laneIndex];
      const x = MINIMAP_PADDING + clip.position * scale;
      const y = MINIMAP_PADDING + laneIndex * MINIMAP_LANE_HEIGHT;
      const width = clip.duration * scale;
      const height = MINIMAP_LANE_HEIGHT - 2;

      // Draw clip rectangle with lane color
      ctx.fillStyle = lane?.color ?? '#00ff00';
      ctx.fillRect(x, y, width, height);

      // Add subtle border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
    });

    // Draw lane dividers
    ctx.strokeStyle = 'rgba(0, 136, 0, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i < lanes.length; i++) {
      const y = MINIMAP_PADDING + i * MINIMAP_LANE_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(MINIMAP_PADDING, y);
      ctx.lineTo(MINIMAP_WIDTH - MINIMAP_PADDING, y);
      ctx.stroke();
    }
  }, [visible, lanes, clips, timelineLength, minimapHeight, scale]);

  // Handle canvas click to jump to position
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!containerRef.current) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - MINIMAP_PADDING;

      // Convert click position to beat position
      const clickedBeat = x / scale;

      // Center the viewport on the clicked position
      const viewportWidthBeats = viewport.widthPx / viewport.zoom;
      const newOffset = Math.max(0, clickedBeat - viewportWidthBeats / 2);

      onViewportChange(newOffset);
    },
    [scale, viewport, onViewportChange]
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
  const viewportLeft = MINIMAP_PADDING + viewport.offsetBeats * scale;
  const viewportWidth = viewportWidthBeats * scale;

  if (!visible) {
    return null;
  }

  return (
    <div
      className="minimap"
      data-testid="minimap"
      role="region"
      aria-label="Arrangement Overview"
      ref={containerRef}
    >
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
              height: `${minimapHeight - MINIMAP_PADDING * 2}px`,
            }}
            onMouseDown={handleViewportMouseDown}
          />
        </div>
      </div>
    </div>
  );
};

export default Minimap;
