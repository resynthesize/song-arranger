/**
 * Cyclone - TimelinePage
 * Main timeline page with project loading, keyboard shortcuts, and modals
 */

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { loadProjectById } from '@/store/slices/projectSlice';
import { loadSong } from '@/store/slices/songSlice/index';
import { getTemplateProject, loadProject } from '@/utils/storage';
import { logger } from '@/utils/debug';
import { TimelineTemplate } from '../../templates';
import Help from '../../organisms/Help';
import { CommandPalette } from '../../organisms/CommandPalette';
import { QuickInput } from '../../organisms/QuickInput';

const TimelinePage = () => {
  const dispatch = useAppDispatch();
  const selectedClipIds = useAppSelector((state) => state.selection.selectedPatternIds);
  const isEditingLane = useAppSelector((state) => state.tracks.editingTrackId !== null);

  // Initialize keyboard shortcuts and get modal states
  const { showHelp, setShowHelp, showCommandPalette, setShowCommandPalette, showQuickInput, setShowQuickInput, quickInputCommand, showSongDataViewer, setShowSongDataViewer } = useKeyboardShortcuts();

  // Load template project on page mount
  useEffect(() => {
    const template = getTemplateProject();
    if (template) {
      // Load full project data from storage
      const loadedProject = loadProject(template.id);
      if (!loadedProject) {
        logger.error('Failed to load template project');
        return;
      }

      // Load project metadata
      dispatch(loadProjectById({
        projectId: loadedProject.id,
        projectName: loadedProject.name,
      }));

      // Load CKS data into songSlice (THIS WAS MISSING!)
      if (loadedProject.data.songData) {
        dispatch(loadSong(loadedProject.data.songData));
      } else {
        logger.warn('Template project has no song data, using default state');
      }

      // Load timeline data if available
      if (loadedProject.data.timeline) {
        dispatch({ type: 'timeline/loadTimeline', payload: loadedProject.data.timeline });
      }
    }
  }, [dispatch]);

  return (
    <>
      <TimelineTemplate
        hasSelection={selectedClipIds.length > 0}
        selectionCount={selectedClipIds.length}
        isEditing={isEditingLane}
        showSongDataViewer={showSongDataViewer}
        onCloseSongDataViewer={() => setShowSongDataViewer(false)}
        onToggleSongDataViewer={() => setShowSongDataViewer(!showSongDataViewer)}
      />
      <Help isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
      {showQuickInput && quickInputCommand && (
        <QuickInput
          command={quickInputCommand}
          currentValue={0}
          onSubmit={(value) => {
            // TODO: Handle quick input submission
            logger.log(`QuickInput submit: ${quickInputCommand} = ${value}`);
            setShowQuickInput(false);
          }}
          onCancel={() => setShowQuickInput(false)}
        />
      )}
    </>
  );
};

export default TimelinePage;
