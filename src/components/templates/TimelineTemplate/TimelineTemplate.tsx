/**
 * Cyclone - TimelineTemplate
 * Main timeline page layout combining MenuBar, Timeline, and CommandFooter
 */

import { useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import MenuBar from '../../organisms/MenuBar';
import Timeline from '../../organisms/Timeline';
import CommandFooter from '../../organisms/CommandFooter';
import StatusLine from '../../organisms/StatusLine';
import PatternEditor from '../../organisms/PatternEditor/PatternEditor';
import { SceneEditor } from '../../organisms/SceneEditor';
import SongDataViewer from '../../organisms/SongDataViewer/SongDataViewer';
import { TrackSettingsPanel } from '../../organisms/TrackSettingsPanel';
import { LiveConsole } from '../../organisms/LiveConsole';
import { ResizableDivider } from '../../molecules/ResizableDivider';
import { setEditorHeight } from '@/store/slices/patternEditorSlice';
import { setEditorHeight as setSceneEditorHeight } from '@/store/slices/sceneEditorSlice';
import {
  selectAvailableInstruments,
  selectTrackSettingsById,
  selectTrackById,
} from '@/store/selectors';
import { updateInstrumentAssignment, updateTrackSettings } from '@/store/slices/songSlice/index';
import type { ID } from '@/types';
import type { TrackSettings } from '../../organisms/TrackSettingsDialog/TrackSettingsDialog';
import './TimelineTemplate.css';

interface TimelineTemplateProps {
  hasSelection: boolean;
  selectionCount: number;
  isEditing: boolean;
  showSongDataViewer?: boolean;
  onCloseSongDataViewer?: () => void;
  onToggleSongDataViewer?: () => void;
}

const TimelineTemplate = ({ hasSelection, selectionCount, isEditing, showSongDataViewer, onCloseSongDataViewer, onToggleSongDataViewer }: TimelineTemplateProps) => {
  const dispatch = useAppDispatch();

  // Track settings panel state
  const [settingsTrackId, setSettingsTrackId] = useState<ID | null>(null);
  const [trackSettingsPaneHeight, setTrackSettingsPaneHeight] = useState(400);

  // Get pattern editor state from Redux
  const openPatternId = useAppSelector((state) => state.patternEditor.openPatternId);

  // Get scene editor state from Redux
  const openSceneId = useAppSelector((state) => state.sceneEditor.openSceneId);

  // Get track settings data
  const availableInstruments = useAppSelector(selectAvailableInstruments);
  const settingsTrack = useAppSelector((state) =>
    settingsTrackId ? selectTrackById(state, settingsTrackId) : null
  );
  const trackSettings = useAppSelector((state) =>
    settingsTrackId ? selectTrackSettingsById(state, settingsTrackId) : null
  );

  // Handle resizing the pattern editor pane
  const handleEditorResize = useCallback(
    (newHeight: number) => {
      dispatch(setEditorHeight(newHeight));
    },
    [dispatch]
  );

  // Handle resizing the scene editor pane
  const handleSceneEditorResize = useCallback(
    (newHeight: number) => {
      dispatch(setSceneEditorHeight(newHeight));
    },
    [dispatch]
  );

  // Handle saving track settings
  const handleSaveTrackSettings = useCallback(
    (settings: TrackSettings) => {
      if (!trackSettings) return;

      const { trackKey } = trackSettings;

      // Update instrument assignment
      if (settings.instrument !== undefined || settings.multiChannel !== undefined) {
        dispatch(
          updateInstrumentAssignment({
            trackKey,
            output: settings.instrument,
            multiChannel: settings.multiChannel,
          })
        );
      }

      // Update other track settings
      dispatch(
        updateTrackSettings({
          trackKey,
          settings: {
            color: settings.color,
            height: settings.height,
            transpose: settings.transpose,
            noTranspose: settings.noTranspose,
            noFTS: settings.noFTS,
          },
        })
      );

      // Close panel
      setSettingsTrackId(null);
    },
    [dispatch, trackSettings]
  );

  // Handle closing track settings
  const handleCloseTrackSettings = useCallback(() => {
    setSettingsTrackId(null);
  }, []);

  return (
    <div className="timeline-template" data-testid="timeline-template">
      <MenuBar onToggleSongDataViewer={onToggleSongDataViewer} />

      {/* Main content area - horizontal split when song data viewer is open */}
      <div className="timeline-template__main">
        {/* Left side - Timeline and Pattern Editor */}
        <div className="timeline-template__content">
          <Timeline onOpenTrackSettings={setSettingsTrackId} />
        </div>

        {/* Right side - Song Data Viewer (conditional) */}
        {showSongDataViewer && onCloseSongDataViewer && (
          <div className="timeline-template__sidebar">
            <SongDataViewer onClose={onCloseSongDataViewer} />
          </div>
        )}
      </div>

      {/* Resizable divider (only when pattern editor is open) */}
      {openPatternId && (
        <ResizableDivider
          onResize={handleEditorResize}
          minHeight={200}
          maxHeight={600}
        />
      )}

      {/* Pattern editor pane (conditional) */}
      <PatternEditor />

      {/* Resizable divider (only when scene editor is open) */}
      {openSceneId && (
        <ResizableDivider
          onResize={handleSceneEditorResize}
          minHeight={200}
          maxHeight={600}
        />
      )}

      {/* Scene editor pane (conditional) */}
      <SceneEditor />

      {/* Track settings pane (conditional) */}
      {settingsTrackId && settingsTrack && trackSettings && (
        <TrackSettingsPanel
          trackId={settingsTrackId}
          trackName={settingsTrack.name}
          instrument={trackSettings.instrument}
          multiChannel={trackSettings.multiChannel}
          transpose={trackSettings.transpose}
          noTranspose={trackSettings.noTranspose}
          noFTS={trackSettings.noFTS}
          color={trackSettings.color}
          height={trackSettings.height}
          availableInstruments={availableInstruments}
          paneHeight={trackSettingsPaneHeight}
          onSave={handleSaveTrackSettings}
          onClose={handleCloseTrackSettings}
          onPaneHeightChange={setTrackSettingsPaneHeight}
        />
      )}

      {/* Live coding console */}
      <LiveConsole />

      <StatusLine />
      <CommandFooter
        hasSelection={hasSelection}
        selectionCount={selectionCount}
        isEditing={isEditing}
      />
    </div>
  );
};

export default TimelineTemplate;
