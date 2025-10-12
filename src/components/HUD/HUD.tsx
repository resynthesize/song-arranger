/**
 * Song Arranger - HUD Component
 * Terminal-styled information-dense heads-up display
 * Monolake 8bit inspired status bar with ASCII box-drawing characters
 */

import { useAppSelector } from '@/store/hooks';
import './HUD.css';

// Snap value to musical notation mapping
const SNAP_LABELS: Record<number, string> = {
  0.25: '1/16',
  0.5: '1/8',
  1: '1/4',
  2: '1/2',
  4: '1 Bar',
};

/**
 * Format beats to bars:beats notation
 * @param beats - Total beats from start
 * @returns Formatted string like "1:1" or "3:2"
 */
const formatBarsBeats = (beats: number): string => {
  const beatsPerBar = 4;
  const bar = Math.floor(beats / beatsPerBar) + 1; // 1-indexed
  const beat = Math.floor(beats % beatsPerBar) + 1; // 1-indexed
  return `${bar.toString()}:${beat.toString()}`;
};

/**
 * Get snap label from snap value
 */
const getSnapLabel = (snapValue: number): string => {
  return SNAP_LABELS[snapValue] || snapValue.toString();
};

const HUD = () => {
  const tempo = useAppSelector((state) => state.timeline.tempo);
  const zoom = useAppSelector((state) => state.timeline.viewport.zoom);
  const snapValue = useAppSelector((state) => state.timeline.snapValue);
  const playheadPosition = useAppSelector((state) => state.timeline.playheadPosition);
  const clipCount = useAppSelector((state) => state.clips.clips.length);
  const laneCount = useAppSelector((state) => state.lanes.lanes.length);
  const selectedCount = useAppSelector((state) => state.selection.selectedClipIds.length);
  const crtEnabled = useAppSelector((state) => state.crtEffects.enabled);

  // Format playhead position
  const beatsFormatted = playheadPosition.toFixed(2);
  const barsBeatsFormatted = formatBarsBeats(playheadPosition);
  const snapLabel = getSnapLabel(snapValue);

  return (
    <div className="hud" data-testid="hud">
      <div className="hud__border hud__border--top">
        ┌────────────────────────────────────────────────────────────────────────────────────────┐
      </div>

      <div className="hud__content">
        <div className="hud__section">
          <span className="hud__label">BPM</span>
          <span className="hud__value hud__value--bright">{tempo}</span>
        </div>

        <div className="hud__separator">│</div>

        <div className="hud__section">
          <span className="hud__label">TIME</span>
          <span className="hud__value hud__value--bright">{barsBeatsFormatted}</span>
          <span className="hud__value hud__value--dim">({beatsFormatted})</span>
        </div>

        <div className="hud__separator">│</div>

        <div className="hud__section">
          <span className="hud__label">ZOOM</span>
          <span className="hud__value">{zoom}px</span>
        </div>

        <div className="hud__separator">│</div>

        <div className="hud__section">
          <span className="hud__label">SNAP</span>
          <span className="hud__value">{snapLabel}</span>
        </div>

        <div className="hud__separator">│</div>

        <div className="hud__section">
          <span className="hud__label">LANES</span>
          <span className="hud__value">{laneCount}</span>
        </div>

        <div className="hud__separator">│</div>

        <div className="hud__section">
          <span className="hud__label">CLIPS</span>
          <span className="hud__value">{clipCount}</span>
        </div>

        <div className="hud__separator">│</div>

        <div className="hud__section">
          <span className="hud__label">SELECTED</span>
          <span className="hud__value">{selectedCount}</span>
        </div>

        <div className="hud__separator">│</div>

        <div className="hud__section">
          <span className="hud__label">CRT</span>
          <span className="hud__value">{crtEnabled ? 'ON' : 'OFF'}</span>
        </div>
      </div>

      <div className="hud__border hud__border--bottom">
        └────────────────────────────────────────────────────────────────────────────────────────┘
      </div>
    </div>
  );
};

export default HUD;
