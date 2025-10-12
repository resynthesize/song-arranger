/**
 * Song Arranger - Keyboard Shortcuts Hook
 * React hook for handling global keyboard shortcuts
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { findMatchingShortcut, type KeyboardContext } from '@/utils/keyboard';
import {
  removeClips,
  duplicateClips,
} from '@/store/slices/clipsSlice';
import {
  zoomIn,
  zoomOut,
  togglePlayPause,
} from '@/store/slices/timelineSlice';
import {
  clearSelection,
} from '@/store/slices/selectionSlice';

/**
 * Hook to handle global keyboard shortcuts
 */
export const useKeyboardShortcuts = () => {
  const dispatch = useAppDispatch();
  const selectedClipIds = useAppSelector((state) => state.selection.selectedClipIds);
  const isEditingLane = useAppSelector((state) => state.lanes.editingLaneId !== null);

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

      // Handle the shortcut action
      switch (shortcut.action) {
        case 'delete':
          if (selectedClipIds.length > 0) {
            dispatch(removeClips(selectedClipIds));
            dispatch(clearSelection());
          }
          break;

        case 'duplicate':
          if (selectedClipIds.length > 0) {
            dispatch(duplicateClips(selectedClipIds));
          }
          break;

        case 'zoomIn':
          dispatch(zoomIn());
          break;

        case 'zoomOut':
          dispatch(zoomOut());
          break;

        case 'togglePlay':
          dispatch(togglePlayPause());
          break;

        case 'undo':
          // TODO: Implement undo functionality
          console.log('Undo action (not yet implemented)');
          break;

        case 'redo':
          // TODO: Implement redo functionality
          console.log('Redo action (not yet implemented)');
          break;

        case 'navigateUp':
          // TODO: Implement lane navigation
          console.log('Navigate up (not yet implemented)');
          break;

        case 'navigateDown':
          // TODO: Implement lane navigation
          console.log('Navigate down (not yet implemented)');
          break;

        case 'edit':
          // TODO: Implement clip label editing
          console.log('Edit clip label (not yet implemented)');
          break;

        case 'changeColor':
          // TODO: Implement color picker
          console.log('Change color (not yet implemented)');
          break;

        case 'help':
          // TODO: Implement help dialog
          console.log('Show help (not yet implemented)');
          break;

        default:
          console.warn(`Unhandled shortcut action: ${shortcut.action}`);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, selectedClipIds, isEditingLane]);
};
