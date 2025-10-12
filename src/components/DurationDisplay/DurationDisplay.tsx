/**
 * Song Arranger - DurationDisplay Component
 * Displays global and selected clip durations with retro terminal styling
 */

import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { formatDuration, calculateGlobalDuration, calculateSelectedDuration } from '@/utils/duration';
import './DurationDisplay.css';

export const DurationDisplay = () => {
  const tempo = useAppSelector((state) => state.timeline.tempo);
  const clips = useAppSelector((state) => state.clips.clips);
  const selectedClipIds = useAppSelector((state) => state.selection.selectedClipIds);

  // Calculate global duration (already returns seconds)
  const globalDurationSeconds = useMemo(
    () => calculateGlobalDuration(clips, tempo),
    [clips, tempo]
  );
  const globalDurationFormatted = useMemo(
    () => formatDuration(globalDurationSeconds),
    [globalDurationSeconds]
  );

  // Calculate selected duration (already returns seconds)
  const selectedDurationSeconds = useMemo(
    () => calculateSelectedDuration(clips, selectedClipIds, tempo),
    [clips, selectedClipIds, tempo]
  );
  const selectedDurationFormatted = useMemo(
    () => formatDuration(selectedDurationSeconds),
    [selectedDurationSeconds]
  );

  const hasSelection = selectedClipIds.length > 0;

  return (
    <div className="duration-display" data-testid="duration-display">
      <div className="duration-display__border-top">
        ┌{'─'.repeat(12)}┐
      </div>
      <div className="duration-display__content">
        <div className="duration-display__item">
          <span className="duration-display__label">GLOBAL</span>
          <span className="duration-display__value" data-testid="duration-global">
            {globalDurationFormatted}
          </span>
        </div>
        {hasSelection && (
          <div className="duration-display__item">
            <span className="duration-display__label">SELECTED</span>
            <span className="duration-display__value" data-testid="duration-selected">
              {selectedDurationFormatted}
            </span>
          </div>
        )}
      </div>
      <div className="duration-display__border-bottom">
        └{'─'.repeat(12)}┘
      </div>
    </div>
  );
};

export default DurationDisplay;
