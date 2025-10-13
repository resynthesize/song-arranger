/**
 * Song Arranger - GridCanvas Component
 * Canvas-based grid rendering for lane backgrounds
 */

import { useRef, useEffect, memo } from 'react';
import type { ViewportState } from '@/types';
import { beatsToViewportPx } from '@/utils/viewport';
import { calculateGridMetrics } from '@/utils/grid';
import { BEATS_PER_BAR } from '@/constants';

interface GridCanvasProps {
  viewport: ViewportState;
  snapValue: number;
}

/**
 * GridCanvas - Renders adaptive grid lines on a canvas
 * Matches the ruler's 4-division grid system
 */
const GridCanvas = ({ viewport, snapValue }: GridCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Draw adaptive grid lines on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate visible range in beats using viewport
    const startBeat = viewport.offsetBeats;
    const beatsVisible = viewport.widthPx / viewport.zoom;
    const endBeat = startBeat + beatsVisible;

    // Calculate visible bars
    const startBar = Math.floor(startBeat / BEATS_PER_BAR);
    const endBar = Math.ceil(endBeat / BEATS_PER_BAR);

    // Calculate adaptive grid metrics using shared utility
    const { barInterval, gridIntervalBeats } = calculateGridMetrics(viewport, BEATS_PER_BAR);

    // Draw bar lines and grid lines (same logic as Ruler)
    // Start from the first bar that matches the interval and increment by barInterval
    const firstIntervalBar = Math.floor(startBar / barInterval) * barInterval;
    for (let bar = firstIntervalBar; bar <= endBar + barInterval; bar += barInterval) {
      const barBeat = bar * BEATS_PER_BAR;
      const x = beatsToViewportPx(barBeat, viewport); // Position relative to viewport

      // Draw bar line (numbered bars in ruler) - brighter and thicker
      if (x >= -5 && x <= canvas.width + 5) {
        ctx.strokeStyle = '#00ff00';
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Generate 3 grid lines between this bar and the next numbered bar
      ctx.strokeStyle = '#004400';
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const gridBeat = barBeat + (i * gridIntervalBeats);
        const gridX = beatsToViewportPx(gridBeat, viewport);

        // Only draw if within visible range (with 5px margin for edges)
        if (gridBeat >= startBeat && gridBeat <= endBeat && gridX >= -5 && gridX <= canvas.width + 5) {
          ctx.beginPath();
          ctx.moveTo(gridX, 0);
          ctx.lineTo(gridX, canvas.height);
          ctx.stroke();
        }
      }
    }
  }, [viewport, snapValue]);

  // Re-draw grid when window resizes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      <canvas
        ref={canvasRef}
        className="track__grid"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(GridCanvas);
