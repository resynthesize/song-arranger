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
  // Calculate visible bars, beats, sub-beats, and adaptive marker intervals
  const { bars, beatTicks, subBeatTicks, snapHighlights } = useMemo(() => {
    // Handle zero width gracefully
    if (viewport.widthPx === 0) {
      return { bars: [], beatTicks: [], subBeatTicks: [], snapHighlights: [] };
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
    const beatTicksArray: Array<{ position: number; beat: number }> = [];
    const subBeatTicksArray: Array<{ position: number }> = [];
    const snapHighlightsArray: Array<{ position: number }> = [];

    // Show sub-beats (16ths) only at high zoom levels (>150)
    const showSubBeats = viewport.zoom > 150;

    // Generate bar numbers
    for (let bar = startBar; bar <= endBar + barInterval; bar++) {
      const barNumber = bar + 1; // Bars start at 1
      const barBeat = bar * BEATS_PER_BAR;

      // Add bar marker if it matches the interval
      if ((bar % barInterval) === 0) {
        const x = beatsToViewportPx(barBeat, viewport); // Position relative to viewport
        barsArray.push({ barNumber, position: x });
      }
    }

    // Generate beat ticks (quarter notes) - only show when zoomed in enough
    // At low zoom levels, beat ticks would be too dense
    const showBeatTicks = viewport.zoom >= 5; // Show beats at 5px/beat or higher

    if (showBeatTicks) {
      const startBeatFloor = Math.floor(startBeat);
      const endBeatCeil = Math.ceil(endBeat);
      for (let beat = startBeatFloor; beat <= endBeatCeil; beat++) {
        // Skip if this beat is a bar downbeat
        if (beat % BEATS_PER_BAR !== 0) {
          const x = beatsToViewportPx(beat, viewport);
          if (x >= 0 && x <= viewport.widthPx) {
            beatTicksArray.push({ position: x, beat });
          }
        }
      }
    }

    // Generate sub-beat ticks (16th notes) if zoomed in enough
    if (showSubBeats) {
      const subBeatInterval = 0.25; // 16th notes
      const startSubBeat = Math.floor(startBeat / subBeatInterval) * subBeatInterval;
      const endSubBeat = Math.ceil(endBeat / subBeatInterval) * subBeatInterval;

      for (let subBeat = startSubBeat; subBeat <= endSubBeat; subBeat += subBeatInterval) {
        // Skip if this is a beat or bar boundary
        const isBeat = Math.abs(subBeat % 1) < 0.01;
        if (!isBeat) {
          const x = beatsToViewportPx(subBeat, viewport);
          if (x >= 0 && x <= viewport.widthPx) {
            subBeatTicksArray.push({ position: x });
          }
        }
      }
    }

    // Generate snap grid highlights
    if (snapValue > 0 && snapValue < 1) {
      const startSnap = Math.floor(startBeat / snapValue) * snapValue;
      const endSnap = Math.ceil(endBeat / snapValue) * snapValue;

      for (let snap = startSnap; snap <= endSnap; snap += snapValue) {
        const x = beatsToViewportPx(snap, viewport);
        if (x >= 0 && x <= viewport.widthPx) {
          snapHighlightsArray.push({ position: x });
        }
      }
    }

    return {
      bars: barsArray,
      beatTicks: beatTicksArray,
      subBeatTicks: subBeatTicksArray,
      snapHighlights: snapHighlightsArray
    };
  }, [viewport, snapValue]);

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

      {/* Content area with bar numbers and tick markers */}
      <div className="ruler__content">
        {/* Snap grid highlights - render first so they appear behind */}
        {snapHighlights.map(({ position }, index) => (
          <div
            key={`snap-${index.toString()}`}
            className="ruler__snap-highlight"
            style={{ left: `${position.toString()}px` }}
          />
        ))}

        {/* Sub-beat ticks (16ths) - dimmest */}
        {subBeatTicks.map(({ position }, index) => (
          <div
            key={`subbeat-${index.toString()}`}
            className="ruler__subbeat-tick"
            style={{ left: `${position.toString()}px` }}
            onClick={() => { handleClick(position); }}
          >
            │
          </div>
        ))}

        {/* Beat ticks - medium brightness */}
        {beatTicks.map(({ position, beat }) => (
          <div
            key={`beat-${beat.toString()}`}
            className="ruler__beat-tick"
            style={{ left: `${position.toString()}px` }}
            onClick={() => { handleClick(position); }}
          >
            │
          </div>
        ))}

        {/* Bar numbers - brightest */}
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
      </div>
    </div>
  );
};

export default Ruler;
