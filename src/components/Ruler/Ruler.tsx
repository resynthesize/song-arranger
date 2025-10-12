/**
 * Song Arranger - Ruler Component
 * Bar and beat ruler positioned above the timeline
 */

import { useMemo } from 'react';
import './Ruler.css';

interface RulerProps {
  zoom: number; // Pixels per beat
  snapValue: number; // Snap interval in beats (currently unused but kept for future features)
  containerWidth: number; // Width of the timeline container
  scrollLeft: number; // Horizontal scroll position in pixels
  onPositionClick?: (position: number) => void; // Optional click handler
}

const BEATS_PER_BAR = 4; // 4/4 time signature

const Ruler = ({ zoom, containerWidth, scrollLeft, onPositionClick }: RulerProps) => {
  // Calculate visible bars, beats, and adaptive marker intervals
  const { bars, beats, subBeats } = useMemo(() => {
    // Handle zero width gracefully
    if (containerWidth === 0) {
      return { bars: [], beats: [], subBeats: [] };
    }

    // Calculate visible range in beats
    const startBeat = scrollLeft / zoom;
    const beatsVisible = containerWidth / zoom;
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

    // Determine whether to show beat markers and sub-beat markers
    const showBeats = barsVisible < 32; // Show beats when showing < 32 bars
    const showSubBeats = zoom >= 200; // Show 1/16th notes when zoomed in enough

    const barsArray: Array<{ barNumber: number; position: number }> = [];
    const beatsArray: Array<{ barNumber: number; beat: number; position: number }> = [];
    const subBeatsArray: Array<{ position: number }> = [];

    // Generate bar numbers and beat markers for visible range
    for (let bar = startBar; bar <= endBar; bar++) {
      const barNumber = bar + 1; // Bars start at 1
      const barBeat = bar * BEATS_PER_BAR;
      const x = barBeat * zoom - scrollLeft; // Position relative to visible area

      // Add bar marker if it matches the interval
      if ((bar % barInterval) === 0) {
        barsArray.push({ barNumber, position: x });
      }

      // Add beat markers within the bar (beats 2, 3, 4) if zoomed in enough
      if (showBeats) {
        for (let beat = 1; beat < BEATS_PER_BAR; beat++) {
          const beatPosition = barBeat + beat;
          const beatX = beatPosition * zoom - scrollLeft;
          beatsArray.push({ barNumber, beat: beat + 1, position: beatX });
        }
      }

      // Add sub-beat markers (1/16th notes) if very zoomed in
      if (showSubBeats) {
        for (let sixteenth = 0; sixteenth < BEATS_PER_BAR * 4; sixteenth++) {
          // Skip if this is a beat boundary (already drawn)
          if (sixteenth % 4 === 0) continue;

          const subBeatPosition = barBeat + (sixteenth * 0.25);
          const subBeatX = subBeatPosition * zoom - scrollLeft;
          subBeatsArray.push({ position: subBeatX });
        }
      }
    }

    return { bars: barsArray, beats: beatsArray, subBeats: subBeatsArray };
  }, [zoom, containerWidth, scrollLeft]);

  const handleClick = (position: number) => {
    if (onPositionClick) {
      // Convert pixel position (relative to visible area) to absolute beat position
      const absolutePixelPosition = position + scrollLeft;
      const beatPosition = absolutePixelPosition / zoom;
      onPositionClick(beatPosition);
    }
  };

  return (
    <div className="ruler" data-testid="ruler" role="none">
      {/* Header space to align with lane headers */}
      <div className="ruler__header" />

      {/* Content area with bar numbers and beat markers */}
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

        {/* Beat markers */}
        {beats.map(({ barNumber, beat, position }) => (
          <div
            key={`beat-${barNumber.toString()}-${beat.toString()}`}
            className="ruler__beat-tick"
            data-testid={`ruler-beat-${barNumber.toString()}-${beat.toString()}`}
            style={{ left: `${position.toString()}px` }}
            onClick={() => { handleClick(position); }}
            title={`Bar ${barNumber.toString()}, Beat ${beat.toString()}`}
          >
            │
          </div>
        ))}

        {/* Sub-beat markers (1/16th notes) */}
        {subBeats.map(({ position }, index) => (
          <div
            key={`subbeat-${index.toString()}`}
            className="ruler__subbeat-tick"
            style={{ left: `${position.toString()}px` }}
            onClick={() => { handleClick(position); }}
          >
            ·
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ruler;
