/**
 * Song Arranger - MenuBar Component
 * Top menu bar with controls
 */

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setTempo, setSnapValue } from '@/store/slices/timelineSlice';
import { addLane } from '@/store/slices/lanesSlice';
import { TerminalButton } from '../TerminalButton';
import { TerminalInput } from '../TerminalInput';
import { TerminalMenu, type TerminalMenuItem } from '../TerminalMenu';
import './MenuBar.css';

// Snap value options with musical notation
const SNAP_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0.25, label: '1/16' },
  { value: 0.5, label: '1/8' },
  { value: 1, label: '1/4' },
  { value: 2, label: '1/2' },
  { value: 4, label: '1 Bar' },
];

const MenuBar = () => {
  const dispatch = useAppDispatch();
  const tempo = useAppSelector((state) => state.timeline.tempo);
  const snapValue = useAppSelector((state) => state.timeline.snapValue);
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

  const handleSnapChange = useCallback(
    (item: TerminalMenuItem) => {
      const option = SNAP_OPTIONS.find((opt) => opt.value.toString() === item.id);
      if (option) {
        dispatch(setSnapValue(option.value));
      }
    },
    [dispatch]
  );

  // Get current snap label for display
  const currentSnapLabel =
    SNAP_OPTIONS.find((opt) => opt.value === snapValue)?.label || '1/4';

  // Create menu items for snap options
  const snapMenuItems: TerminalMenuItem[] = SNAP_OPTIONS.map((option) => ({
    id: option.value.toString(),
    label: option.label,
  }));

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

        <div className="menu-bar__control">
          <label className="menu-bar__label">SNAP</label>
          <TerminalMenu
            items={snapMenuItems}
            trigger={<span>{currentSnapLabel}</span>}
            onSelect={handleSnapChange}
          />
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
