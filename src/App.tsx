/**
 * Song Arranger - Main App Component
 * Root component with retro terminal styling and keyboard shortcuts
 */

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { loadProjectById } from './store/slices/projectSlice';
import { getTemplateProject } from './utils/storage';
import { logger } from './utils/debug';
import BootSequence from './components/BootSequence';
import { TimelineTemplate } from './components/templates';
import CRTEffects from './components/atoms/CRTEffects';
import TerminalNoise from './components/atoms/TerminalNoise';
import Help from './components/Help';
import { CommandPalette } from './components/CommandPalette';
import { QuickInput } from './components/QuickInput';
import './App.css';

function App() {
  const dispatch = useAppDispatch();
  const [showBootSequence, setShowBootSequence] = useState(true);
  const crtEffectsEnabled = useAppSelector(
    (state) => state.crtEffects.enabled
  );
  const selectedClipIds = useAppSelector((state) => state.selection.selectedClipIds);
  const isEditingLane = useAppSelector((state) => state.lanes.editingLaneId !== null);

  // Initialize keyboard shortcuts and get modal states
  const { showHelp, setShowHelp, showCommandPalette, setShowCommandPalette, showQuickInput, setShowQuickInput, quickInputCommand } = useKeyboardShortcuts();

  const handleBootComplete = () => {
    setShowBootSequence(false);
  };

  // Load template project on app startup
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

  if (showBootSequence) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div className={`app ${crtEffectsEnabled ? '' : 'no-crt-effects'}`}>
      <TimelineTemplate
        hasSelection={selectedClipIds.length > 0}
        selectionCount={selectedClipIds.length}
        isEditing={isEditingLane}
      />
      <CRTEffects />
      <TerminalNoise />
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
    </div>
  );
}

export default App;
