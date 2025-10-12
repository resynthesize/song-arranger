/**
 * Song Arranger - MenuBar Component
 * Top menu bar with controls
 */

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setTempo } from '@/store/slices/timelineSlice';
import { addLane } from '@/store/slices/lanesSlice';
import { TerminalButton } from '../TerminalButton';
import { TerminalInput } from '../TerminalInput';
import './MenuBar.css';

const MenuBar = () => {
  const dispatch = useAppDispatch();
  const tempo = useAppSelector((state) => state.timeline.tempo);
  const laneCount = useAppSelector((state) => state.lanes.lanes.length);
  const selectedCount = useAppSelector(
    (state) => state.selection.selectedClipIds.length
  );

  const handleTempoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTempo = parseInt(e.target.value, 10);
      if (!isNaN(newTempo)) {
        dispatch(setTempo(newTempo));
      }
    },
    [dispatch]
  );

  const handleAddLane = useCallback(() => {
    dispatch(addLane({}));
  }, [dispatch]);

  return (
    <div className="menu-bar" data-testid="menu-bar">
      <div className="menu-bar__section">
        <h1 className="menu-bar__title">SONG ARRANGER</h1>
      </div>

      <div className="menu-bar__section">
        <div className="menu-bar__control">
          <label htmlFor="tempo-input" className="menu-bar__label">
            TEMPO
          </label>
          <TerminalInput
            id="tempo-input"
            type="number"
            value={tempo.toString()}
            onChange={handleTempoChange}
            min={20}
            max={300}
            style={{ width: '80px' }}
          />
          <span className="menu-bar__unit">BPM</span>
        </div>

        <TerminalButton onClick={handleAddLane}>
          + ADD LANE
        </TerminalButton>
      </div>

      <div className="menu-bar__section menu-bar__section--status">
        <span className="menu-bar__status">
          LANES: {laneCount} | SELECTED: {selectedCount}
        </span>
      </div>
    </div>
  );
};

export default MenuBar;
