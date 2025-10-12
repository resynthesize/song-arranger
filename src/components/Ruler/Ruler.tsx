/**
 * Song Arranger - Ruler Component
 * Bar and beat ruler positioned above the timeline
 */

import { useMemo } from 'react';
import type { ViewportState } from '@/types';
import { beatsToViewportPx, viewportPxToBeats } from '@/utils/viewport';
import './Ruler.css';

interface RulerProps {
  viewport: ViewportState; // Viewport state for coordinate conversion
  snapValue: number; // Snap interval in beats (currently unused but kept for future features)
  onPositionClick?: (position: number) => void; // Optional click handler
}

const BEATS_PER_BAR = 4; // 4/4 time signature

const Ruler = ({ viewport, snapValue, onPositionClick }: RulerProps) => {
  // Calculate visible bars and adaptive grid lines
  const { bars, gridLines } = useMemo(() => {
    // Handle zero width gracefully
    if (viewport.widthPx === 0) {
      return { bars: [], gridLines: [] };
    }

    // Calculate visible range in beats using viewport
    const startBeat = viewport.offsetBeats;
    const beatsVisible = viewport.widthPx / viewport.zoom;
    const endBeat = startBeat + beatsVisible;

    // Calculate visible bars
    const startBar = Math.floor(startBeat / BEATS_PER_BAR);
    const endBar = Math.ceil(endBeat / BEATS_PER_BAR);
    const barsVisible = endBar - startBar;

    // Determine bar number interval based on visible bars
    // Show fewer bar numbers when zoomed out, more when zoomed in
    let barInterval = 1;
    if (barsVisible > 128) {
      barInterval = 16; // Very zoomed out: every 16 bars
    } else if (barsVisible > 64) {
      barInterval = 8; // Every 8 bars
    } else if (barsVisible > 32) {
      barInterval = 4; // Every 4 bars
    } else if (barsVisible > 16) {
      barInterval = 2; // Every 2 bars
    }
    // else: show every bar

    const barsArray: Array<{ barNumber: number; position: number }> = [];
    const gridLinesArray: Array<{ position: number }> = [];

    // Calculate grid interval: always 4 divisions between consecutive bar numbers
    // This is the beat distance between each grid line
    const gridIntervalBeats = (barInterval * BEATS_PER_BAR) / 4;

    // Generate bar numbers and their associated grid lines
    // Start from the first bar that matches the interval and increment by barInterval
    const firstIntervalBar = Math.floor(startBar / barInterval) * barInterval;
    for (let bar = firstIntervalBar; bar <= endBar + barInterval; bar += barInterval) {
      const barNumber = bar + 1; // Bars start at 1
      const barBeat = bar * BEATS_PER_BAR;

      const x = beatsToViewportPx(barBeat, viewport); // Position relative to viewport
      barsArray.push({ barNumber, position: x });

      // Generate 3 grid lines between this bar and the next numbered bar
      // (the 4th division is the next bar number itself)
      for (let i = 1; i < 4; i++) {
        const gridBeat = barBeat + (i * gridIntervalBeats);
        const gridX = beatsToViewportPx(gridBeat, viewport);

        // Only add if within visible range
        if (gridBeat >= startBeat && gridBeat <= endBeat) {
          gridLinesArray.push({ position: gridX });
        }
      }
    }

    return { bars: barsArray, gridLines: gridLinesArray };
  }, [viewport]);

  const handleClick = (pixelX: number) => {
    if (onPositionClick) {
      // Convert viewport pixel position to beat position
      const beatPosition = viewportPxToBeats(pixelX, viewport);
      onPositionClick(beatPosition);
    }
  };

  return (
    <div className="ruler" data-testid="ruler" role="none">
      {/* Header space to align with lane headers */}
      <div className="ruler__header" />

      {/* Content area with bar numbers and grid markers */}
      <div className="ruler__content">
        {/* Bar numbers */}
        {bars.map(({ barNumber, position }) => (
          <div
            key={`bar-${barNumber.toString()}`}
            className="ruler__bar-number"
            data-testid={`ruler-bar-${barNumber.toString()}`}
            style={{ left: `${position.toString()}px` }}
            onClick={() => { handleClick(position); }}
          >
            {barNumber}
          </div>
        ))}

        {/* Grid markers - always 4 divisions between bar numbers */}
        {gridLines.map(({ position }, index) => (
          <div
            key={`grid-${index.toString()}`}
            className="ruler__grid-tick"
            style={{ left: `${position.toString()}px` }}
            onClick={() => { handleClick(position); }}
          >
            │
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ruler;
