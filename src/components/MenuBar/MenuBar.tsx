/**
 * Song Arranger - MenuBar Component
 * Top menu bar with controls
 */

import { useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setTempo, setSnapValue, setSnapMode, zoomIn, zoomOut } from '@/store/slices/timelineSlice';
import { addLane } from '@/store/slices/lanesSlice';
import { toggleCRTEffects } from '@/store/slices/crtEffectsSlice';
import { calculateGlobalDuration, calculateSelectedDuration, formatDuration } from '@/utils/duration';
import { TerminalButton } from '../TerminalButton';
import { TerminalInput } from '../TerminalInput';
import { TerminalMenu, type TerminalMenuItem } from '../TerminalMenu';
import { FileMenu } from '../FileMenu';
import './MenuBar.css';

// Snap value options with musical notation
// 'grid' is a special value that enables dynamic grid-based snapping
const SNAP_OPTIONS: Array<{ value: number | 'grid'; label: string }> = [
  { value: 'grid', label: 'Grid' },
  { value: 0.25, label: '1/16' },
  { value: 0.5, label: '1/8' },
  { value: 1, label: '1/4' },
  { value: 2, label: '1/2' },
  { value: 4, label: '1 Bar' },
];

// Format beats to bars:beats notation
const formatBarsBeats = (beats: number): string => {
  const beatsPerBar = 4;
  const bar = Math.floor(beats / beatsPerBar) + 1;
  const beat = Math.floor(beats % beatsPerBar) + 1;
  return `${bar.toString()}:${beat.toString()}`;
};

const MenuBar = () => {
  const dispatch = useAppDispatch();
  const tempo = useAppSelector((state) => state.timeline.tempo);
  const snapMode = useAppSelector((state) => state.timeline.snapMode);
  const snapValue = useAppSelector((state) => state.timeline.snapValue);
  const zoom = useAppSelector((state) => state.timeline.viewport.zoom);
  const playheadPosition = useAppSelector((state) => state.timeline.playheadPosition);
  const laneCount = useAppSelector((state) => state.lanes.lanes.length);
  const clipCount = useAppSelector((state) => state.clips.clips.length);
  const clips = useAppSelector((state) => state.clips.clips);
  const selectedClipIds = useAppSelector((state) => state.selection.selectedClipIds);
  const selectedCount = selectedClipIds.length;
  const crtEffectsEnabled = useAppSelector(
    (state) => state.crtEffects.enabled
  );

  // Calculate durations
  const globalDurationSeconds = useMemo(
    () => calculateGlobalDuration(clips, tempo),
    [clips, tempo]
  );
  const selectedDurationSeconds = useMemo(
    () => calculateSelectedDuration(clips, selectedClipIds, tempo),
    [clips, selectedClipIds, tempo]
  );

  // Format durations
  const globalDurationFormatted = formatDuration(globalDurationSeconds);
  const selectedDurationFormatted = formatDuration(selectedDurationSeconds);

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

  const handleToggleCRT = useCallback(() => {
    dispatch(toggleCRTEffects());
  }, [dispatch]);

  const handleSnapChange = useCallback(
    (item: TerminalMenuItem) => {
      const option = SNAP_OPTIONS.find((opt) => opt.value.toString() === item.id);
      if (option) {
        if (option.value === 'grid') {
          // Enable grid snap mode
          dispatch(setSnapMode('grid'));
        } else {
          // Set fixed snap value
          dispatch(setSnapMode('fixed'));
          dispatch(setSnapValue(option.value));
        }
      }
    },
    [dispatch]
  );

  const handleZoomIn = useCallback(() => {
    dispatch(zoomIn());
  }, [dispatch]);

  const handleZoomOut = useCallback(() => {
    dispatch(zoomOut());
  }, [dispatch]);

  // Get current snap label for display
  const currentSnapLabel =
    snapMode === 'grid'
      ? 'Grid'
      : SNAP_OPTIONS.find((opt) => opt.value === snapValue)?.label || '1/4';

  // Create menu items for snap options
  const snapMenuItems: TerminalMenuItem[] = SNAP_OPTIONS.map((option) => ({
    id: option.value.toString(),
    label: option.label,
  }));

  // Format position for display
  const barsBeatsFormatted = formatBarsBeats(playheadPosition);

  return (
    <div className="menu-bar" data-testid="menu-bar">
      {/* Compact info display */}
      <div className="menu-bar__info">
        <span className="menu-bar__info-item">
          <span className="menu-bar__info-label">BPM</span>
          <span className="menu-bar__info-value">{tempo}</span>
        </span>
        <span className="menu-bar__separator">|</span>
        <span className="menu-bar__info-item">
          <span className="menu-bar__info-label">POS</span>
          <span className="menu-bar__info-value">{barsBeatsFormatted}</span>
        </span>
        <span className="menu-bar__separator">|</span>
        <span className="menu-bar__info-item">
          <span className="menu-bar__info-label">ZOOM</span>
          <span className="menu-bar__info-value">{zoom < 1 ? zoom.toFixed(2) : zoom.toString()}px</span>
        </span>
        <span className="menu-bar__separator">|</span>
        <span className="menu-bar__info-item">
          <span className="menu-bar__info-label">SNAP</span>
          <span className="menu-bar__info-value">{currentSnapLabel}</span>
        </span>
        <span className="menu-bar__separator">|</span>
        <span className="menu-bar__info-item">
          <span className="menu-bar__info-label">L</span>
          <span className="menu-bar__info-value">{laneCount}</span>
        </span>
        <span className="menu-bar__separator">|</span>
        <span className="menu-bar__info-item">
          <span className="menu-bar__info-label">C</span>
          <span className="menu-bar__info-value">{clipCount}</span>
        </span>
        <span className="menu-bar__separator">|</span>
        <span className="menu-bar__info-item">
          <span className="menu-bar__info-label">S</span>
          <span className="menu-bar__info-value">{selectedCount}</span>
        </span>
        <span className="menu-bar__separator">|</span>
        <span className="menu-bar__info-item">
          <span className="menu-bar__info-label">CRT</span>
          <span className="menu-bar__info-value">{crtEffectsEnabled ? 'ON' : 'OFF'}</span>
        </span>
      </div>

      {/* Duration display section */}
      <div className="menu-bar__duration">
        <div className="menu-bar__duration-box">
          <span className="menu-bar__duration-label">TOTAL:</span>
          <span className="menu-bar__duration-value">{globalDurationFormatted}</span>
        </div>
        {selectedCount > 0 && (
          <div className="menu-bar__duration-box">
            <span className="menu-bar__duration-label">SELECTED:</span>
            <span className="menu-bar__duration-value">{selectedDurationFormatted}</span>
          </div>
        )}
      </div>

      {/* Compact controls */}
      <div className="menu-bar__controls">
        <FileMenu />

        <div className="menu-bar__control">
          <TerminalInput
            id="tempo-input"
            type="number"
            value={tempo.toString()}
            onChange={handleTempoChange}
            min={20}
            max={300}
            style={{ width: '60px' }}
            title="Tempo (BPM)"
          />
        </div>

        <div className="menu-bar__control">
          <TerminalMenu
            items={snapMenuItems}
            trigger={<span>{currentSnapLabel}</span>}
            onSelect={handleSnapChange}
          />
        </div>

        <div className="menu-bar__control menu-bar__control--zoom">
          <TerminalButton
            onClick={handleZoomOut}
            size="sm"
            variant="secondary"
            title="Zoom out (Ctrl+-)"
          >
            -
          </TerminalButton>
          <TerminalButton
            onClick={handleZoomIn}
            size="sm"
            variant="secondary"
            title="Zoom in (Ctrl+=)"
          >
            +
          </TerminalButton>
        </div>

        <TerminalButton onClick={handleAddLane} size="sm">
          + LANE
        </TerminalButton>

        <TerminalButton onClick={handleToggleCRT} size="sm">
          CRT
        </TerminalButton>
      </div>
    </div>
  );
};

export default MenuBar;
