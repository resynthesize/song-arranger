/**
 * Song Arranger - Keyboard Shortcuts Orchestrator
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
}

/**
 * Main keyboard shortcuts hook that orchestrates all domain-specific hooks
 */
export const useKeyboardShortcuts = (): KeyboardShortcutsState => {
  const selectedClipIds = useAppSelector((state) => state.selection.selectedPatternIds);
  const isEditingLane = useAppSelector((state) => state.tracks.editingTrackId !== null);

  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [quickInputCommand, setQuickInputCommand] = useState<'tempo' | 'zoom' | 'snap' | 'length' | 'position' | null>(null);

  // Initialize domain-specific shortcut hooks
  const clipShortcuts = usePatternShortcuts();
  const viewShortcuts = useViewShortcuts({
    showHelp,
    setShowHelp,
    showSettings,
    setShowSettings,
    showCommandPalette,
    setShowCommandPalette,
  });
  const laneShortcuts = useTrackShortcuts();
  const navigationShortcuts = useNavigationShortcuts();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
  };
};
