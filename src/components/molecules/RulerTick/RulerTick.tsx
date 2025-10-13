/**
 * RulerTick Molecule
 * Bar number and time marker for the ruler
 */

import './RulerTick.css';

export interface RulerTickProps {
  barNumber: number;
  position: number;
  timeString: string;
  onClick: (position: number) => void;
}

export const RulerTick: React.FC<RulerTickProps> = ({
  barNumber,
  position,
  timeString,
  onClick,
}) => {
  return (
    <div
      className="ruler-tick"
      style={{ left: `${position.toString()}px` }}
    >
      <div
        className="ruler-tick__bar-number"
        data-testid={`ruler-bar-${barNumber.toString()}`}
        onClick={() => {
          onClick(position);
        }}
      >
        {barNumber}
      </div>
      <div
        className="ruler-tick__time-marker"
        data-testid={`ruler-time-${barNumber.toString()}`}
        onClick={() => {
          onClick(position);
        }}
      >
        {timeString}
      </div>
    </div>
  );
};
