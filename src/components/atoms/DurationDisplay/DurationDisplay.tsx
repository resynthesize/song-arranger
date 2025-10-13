/**
 * Song Arranger - DurationDisplay Component
 * Displays global and selected clip durations with retro terminal styling
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectAllClips, selectSelectedClipIds, selectHasSelection } from '@/store/selectors';
import { formatDuration, calculateGlobalDuration, calculateSelectedDuration } from '@/utils/duration';
import './DurationDisplay.css';

export const DurationDisplay = () => {
  const tempo = useAppSelector((state) => state.timeline.tempo);
  const clips = useAppSelector(selectAllClips);
  const selectedClipIds = useAppSelector(selectSelectedClipIds);
  const hasSelection = useAppSelector(selectHasSelection);
  const contentRef = useRef<HTMLDivElement>(null);
  const [borderWidth, setBorderWidth] = useState(12);

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

  // Measure content width and calculate border width
  useEffect(() => {
    const updateBorderWidth = () => {
      if (contentRef.current) {
        const contentWidth = contentRef.current.offsetWidth;
        // Each dash character is roughly 0.6em wide in VT323 font
        // Calculate how many dashes fit in the content width
        // Account for borders (2px * 2 = 4px) and padding (4px * 2 = 8px)
        const fontSize = parseFloat(getComputedStyle(contentRef.current).fontSize);
        const dashWidth = fontSize * 0.6;
        const adjustedWidth = contentWidth + 12; // Add padding compensation
        const numDashes = Math.max(8, Math.floor(adjustedWidth / dashWidth) - 2);
        setBorderWidth(numDashes);
      }
    };

    // Update on mount and when content changes
    updateBorderWidth();

    // Update on window resize
    window.addEventListener('resize', updateBorderWidth);
    return () => window.removeEventListener('resize', updateBorderWidth);
  }, [globalDurationFormatted, selectedDurationFormatted, hasSelection]);

  return (
    <div className="duration-display" data-testid="duration-display">
      <div className="duration-display__border-top">
        ┌{'─'.repeat(borderWidth)}┐
      </div>
      <div className="duration-display__content" ref={contentRef}>
        {hasSelection ? (
          <div className="duration-display__item">
            <span className="duration-display__label">SELECTED</span>
            <span className="duration-display__value" data-testid="duration-selected">
              {selectedDurationFormatted}
            </span>
          </div>
        ) : (
          <div className="duration-display__item">
            <span className="duration-display__label">TOTAL</span>
            <span className="duration-display__value" data-testid="duration-global">
              {globalDurationFormatted}
            </span>
          </div>
        )}
      </div>
      <div className="duration-display__border-bottom">
        └{'─'.repeat(borderWidth)}┘
      </div>
    </div>
  );
};

export default DurationDisplay;
