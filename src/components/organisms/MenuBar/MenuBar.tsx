/**
 * Cyclone - MenuBar Component
 * Top menu bar with controls and arrangement overview
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { zoomIn, zoomOut, setViewportOffset } from '@/store/slices/timelineSlice';
import { addTrackInTimeline } from '@/store/slices/songSlice/slice';
import { toggleCRTEffects } from '@/store/slices/crtEffectsSlice';
import { selectAllPatterns, selectAllTracks, selectTimelineEndPosition } from '@/store/selectors';
import { TerminalButton } from '../../atoms/TerminalButton';
import { FileMenu } from '../FileMenu';
import Minimap from '../Minimap';
import './MenuBar.css';

interface MenuBarProps {
  onToggleSongDataViewer?: () => void;
}

const MenuBar = ({ onToggleSongDataViewer }: MenuBarProps) => {
  const dispatch = useAppDispatch();
  const viewport = useAppSelector((state) => state.timeline.viewport);
  const lanes = useAppSelector(selectAllTracks);
  const clips = useAppSelector(selectAllPatterns);

  // Calculate total timeline length using memoized selector
  const timelineEndPosition = useAppSelector(selectTimelineEndPosition);
  const timelineLength = Math.max(64, timelineEndPosition); // Minimum 64 beats

  const handleAddTrack = useCallback(() => {
    dispatch(addTrackInTimeline({}));
  }, [dispatch]);

  const handleToggleCRT = useCallback(() => {
    dispatch(toggleCRTEffects());
  }, [dispatch]);

  const handleZoomIn = useCallback(() => {
    dispatch(zoomIn());
  }, [dispatch]);

  const handleZoomOut = useCallback(() => {
    dispatch(zoomOut());
  }, [dispatch]);

  const handleMinimapViewportChange = useCallback((offsetBeats: number) => {
    dispatch(setViewportOffset(offsetBeats));
  }, [dispatch]);

  return (
    <div className="menu-bar" data-testid="menu-bar">
      {/* FILE menu on left */}
      <div className="menu-bar__left">
        <FileMenu onToggleSongDataViewer={onToggleSongDataViewer} />
      </div>

      {/* Arrangement overview in center */}
      <div className="menu-bar__center">
        <Minimap
          lanes={lanes}
          clips={clips}
          viewport={viewport}
          timelineLength={timelineLength}
          visible={true}
          embedded={true}
          onViewportChange={handleMinimapViewportChange}
          onToggle={() => {}}
        />
      </div>

      {/* Icon toolbar on right */}
      <div className="menu-bar__toolbar">
        <TerminalButton
          onClick={handleZoomOut}
          size="sm"
          variant="secondary"
          title="Zoom out ([)"
        >
          -
        </TerminalButton>
        <TerminalButton
          onClick={handleZoomIn}
          size="sm"
          variant="secondary"
          title="Zoom in (])"
        >
          +
        </TerminalButton>
        <TerminalButton
          onClick={handleAddTrack}
          size="sm"
          variant="secondary"
          title="Add track (i)"
          data-testid="add-track-button"
        >
          +T
        </TerminalButton>
        <TerminalButton
          onClick={handleToggleCRT}
          size="sm"
          variant="secondary"
          title="Toggle CRT effects"
        >
          CRT
        </TerminalButton>
      </div>
    </div>
  );
};

export default MenuBar;
