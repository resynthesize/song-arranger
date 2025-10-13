/**
 * Song Arranger - Main App Component
 * Root component with retro terminal styling and keyboard shortcuts
 */

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { loadProjectById } from './store/slices/projectSlice';
import { getTemplateProject } from './utils/storage';
import BootSequence from './components/BootSequence';
import MenuBar from './components/MenuBar';
import Timeline from './components/Timeline';
import CommandFooter from './components/CommandFooter';
import CRTEffects from './components/CRTEffects';
import TerminalNoise from './components/TerminalNoise';
import Help from './components/Help';
import Minimap from './components/Minimap';
import { CommandPalette } from './components/CommandPalette';
import { QuickInput } from './components/QuickInput';
import { setViewportOffset } from './store/slices/timelineSlice';
import './App.css';

function App() {
  const dispatch = useAppDispatch();
  const [showBootSequence, setShowBootSequence] = useState(true);
  const crtEffectsEnabled = useAppSelector(
    (state) => state.crtEffects.enabled
  );
  const selectedClipIds = useAppSelector((state) => state.selection.selectedClipIds);
  const isEditingLane = useAppSelector((state) => state.lanes.editingLaneId !== null);
  const minimapVisible = useAppSelector((state) => state.timeline.minimapVisible);
  const viewport = useAppSelector((state) => state.timeline.viewport);
  const lanes = useAppSelector((state) => state.lanes.lanes);
  const clips = useAppSelector((state) => state.clips.clips);

  // Initialize keyboard shortcuts and get modal states
  const { showHelp, setShowHelp, showCommandPalette, setShowCommandPalette, showQuickInput, setShowQuickInput, quickInputCommand } = useKeyboardShortcuts();

  // Calculate total timeline length
  const timelineLength = clips.reduce((max, clip) => {
    const clipEnd = clip.position + clip.duration;
    return Math.max(max, clipEnd);
  }, 64); // Minimum 64 beats

  const handleMinimapViewportChange = (offsetBeats: number) => {
    dispatch(setViewportOffset(offsetBeats));
  };

  const handleMinimapToggle = () => {
    dispatch({ type: 'timeline/toggleMinimap' });
  };

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
      <MenuBar />
      <Timeline />
      <CommandFooter
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
            console.log(`QuickInput submit: ${quickInputCommand} = ${value}`);
            setShowQuickInput(false);
          }}
          onCancel={() => setShowQuickInput(false)}
        />
      )}
      <Minimap
        lanes={lanes}
        clips={clips}
        viewport={viewport}
        timelineLength={timelineLength}
        visible={minimapVisible}
        onViewportChange={handleMinimapViewportChange}
        onToggle={handleMinimapToggle}
      />
    </div>
  );
}

export default App;
