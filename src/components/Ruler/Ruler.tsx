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
  onPositionClick?: (position: number) => void; // Optional click handler
}

const BEATS_PER_BAR = 4; // 4/4 time signature

const Ruler = ({ zoom, containerWidth, onPositionClick }: RulerProps) => {
  // Calculate visible bars and beats
  const { bars, beats } = useMemo(() => {
    const beatsVisible = containerWidth / zoom;
    const barsVisible = Math.ceil(beatsVisible / BEATS_PER_BAR);

    const barsArray: Array<{ barNumber: number; position: number }> = [];
    const beatsArray: Array<{ barNumber: number; beat: number; position: number }> = [];

    // Generate bar numbers and beat markers
    for (let bar = 0; bar < barsVisible; bar++) {
      const barNumber = bar + 1; // Bars start at 1
      const barBeat = bar * BEATS_PER_BAR;
      const x = barBeat * zoom;

      // Add bar marker
      barsArray.push({ barNumber, position: x });

      // Add beat markers within the bar (beats 2, 3, 4)
      for (let beat = 1; beat < BEATS_PER_BAR; beat++) {
        const beatPosition = barBeat + beat;
        const beatX = beatPosition * zoom;
        beatsArray.push({ barNumber, beat: beat + 1, position: beatX });
      }
    }

    return { bars: barsArray, beats: beatsArray };
  }, [zoom, containerWidth]);

  const handleClick = (position: number) => {
    if (onPositionClick) {
      // Convert pixel position to beat position
      const beatPosition = position / zoom;
      onPositionClick(beatPosition);
    }
  };

  return (
    <div className="ruler" data-testid="ruler" role="none">
      {/* Bar numbers */}
      {bars.map(({ barNumber, position }) => (
        <div
          key={`bar-${barNumber}`}
          className="ruler__bar-number"
          data-testid={`ruler-bar-${barNumber}`}
          style={{ left: `${position}px` }}
          onClick={() => handleClick(position)}
        >
          {barNumber}
        </div>
      ))}

      {/* Beat markers */}
      {beats.map(({ barNumber, beat, position }) => (
        <div
          key={`beat-${barNumber}-${beat}`}
          className="ruler__beat-tick"
          data-testid={`ruler-beat-${barNumber}-${beat}`}
          style={{ left: `${position}px` }}
          onClick={() => handleClick(position)}
          title={`Bar ${barNumber}, Beat ${beat}`}
        >
          │
        </div>
      ))}
    </div>
  );
};

export default Ruler;
