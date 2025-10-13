/**
 * Song Arranger - TimelinePage
 * Main timeline page with project loading, keyboard shortcuts, and modals
 */

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { loadProjectById } from '@/store/slices/projectSlice';
import { getTemplateProject } from '@/utils/storage';
import { logger } from '@/utils/debug';
import { TimelineTemplate } from '../../templates';
import Help from '../../organisms/Help';
import { CommandPalette } from '../../organisms/CommandPalette';
import { QuickInput } from '../../organisms/QuickInput';

const TimelinePage = () => {
  const dispatch = useAppDispatch();
  const selectedClipIds = useAppSelector((state) => state.selection.selectedClipIds);
  const isEditingLane = useAppSelector((state) => state.lanes.editingLaneId !== null);

  // Initialize keyboard shortcuts and get modal states
  const { showHelp, setShowHelp, showCommandPalette, setShowCommandPalette, showQuickInput, setShowQuickInput, quickInputCommand } = useKeyboardShortcuts();

  // Load template project on page mount
  useEffect(() => {
    const template = getTemplateProject();
    if (template) {
      // Load template data into Redux store
      dispatch(loadProjectById({
        projectId: template.id,
        projectName: template.name,
      }));
    }
  }, [dispatch]);

  return (
    <>
      <TimelineTemplate
        hasSelection={selectedClipIds.length > 0}
        selectionCount={selectedClipIds.length}
        isEditing={isEditingLane}
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
