/**
 * Cyclone - Keyboard Shortcuts Orchestrator
 * Combines all domain-specific shortcut hooks into a unified interface
 */

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { findMatchingShortcut, type KeyboardContext } from '@/utils/keyboard';
import { logger } from '@/utils/debug';
import { usePatternShortcuts } from './usePatternShortcuts';
import { useViewShortcuts } from './useViewShortcuts';
import { useTrackShortcuts } from './useTrackShortcuts';
import { useNavigationShortcuts } from './useNavigationShortcuts';

export interface KeyboardShortcutsState {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
  showQuickInput: boolean;
  setShowQuickInput: (show: boolean) => void;
  quickInputCommand: 'tempo' | 'zoom' | 'snap' | 'length' | 'position' | null;
  setQuickInputCommand: (command: 'tempo' | 'zoom' | 'snap' | 'length' | 'position' | null) => void;
  showTrackSettings: boolean;
  setShowTrackSettings: (show: boolean) => void;
  showSongDataViewer: boolean;
  setShowSongDataViewer: (show: boolean) => void;
}

/**
 * Main keyboard shortcuts hook that orchestrates all domain-specific hooks
 */
export const useKeyboardShortcuts = (): KeyboardShortcutsState => {
  const selectedClipIds = useAppSelector((state) => state.selection.selectedPatternIds);
  const isEditingLane = useAppSelector((state) => state.tracks.editingTrackId !== null);
  const keyboardContextState = useAppSelector((state) => state.keyboardContext.context);

  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [quickInputCommand, setQuickInputCommand] = useState<'tempo' | 'zoom' | 'snap' | 'length' | 'position' | null>(null);
  const [showTrackSettings, setShowTrackSettings] = useState(false);
  const [showSongDataViewer, setShowSongDataViewer] = useState(false);

  // Initialize domain-specific shortcut hooks
  const clipShortcuts = usePatternShortcuts();
  const viewShortcuts = useViewShortcuts({
    showHelp,
    setShowHelp,
    showSettings,
    setShowSettings,
    showCommandPalette,
    setShowCommandPalette,
    showSongDataViewer,
    setShowSongDataViewer,
  });
  const laneShortcuts = useTrackShortcuts({
    setShowTrackSettings,
  });
  const navigationShortcuts = useNavigationShortcuts();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Block all shortcuts when editing text (except Escape and Enter which are handled by inputs)
      if (keyboardContextState === 'editing') {
        // Don't process any shortcuts when in editing mode
        return;
      }

      // Build current context
      const context: KeyboardContext = {
        hasSelection: selectedClipIds.length > 0,
        selectionCount: selectedClipIds.length,
        isEditing: isEditingLane,
      };

      // Find matching shortcut
      const shortcut = findMatchingShortcut(event, context);

      if (!shortcut) {
        return;
      }

      // Prevent default browser behavior
      event.preventDefault();

      // Create a combined handler map
      const handlers: Record<string, () => void> = {
        // Clip operations
        ...clipShortcuts,

        // View operations
        ...viewShortcuts,

        // Lane operations
        ...laneShortcuts,

        // Navigation operations
        ...navigationShortcuts,
      };

      // Execute the handler if it exists
      const handler = handlers[shortcut.action];
      if (handler) {
        handler();
      } else {
        logger.warn(`Unhandled shortcut action: ${shortcut.action}`);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedClipIds,
    isEditingLane,
    keyboardContextState,
    clipShortcuts,
    viewShortcuts,
    laneShortcuts,
    navigationShortcuts,
  ]);

  return {
    showHelp,
    setShowHelp,
    showSettings,
    setShowSettings,
    showCommandPalette,
    setShowCommandPalette,
    showQuickInput,
    setShowQuickInput,
    quickInputCommand,
    setQuickInputCommand,
    showTrackSettings,
    setShowTrackSettings,
    showSongDataViewer,
    setShowSongDataViewer,
  };
};
