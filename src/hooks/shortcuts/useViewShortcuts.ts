/**
 * Song Arranger - View Shortcuts Hook
 * Handles keyboard shortcuts for view and zoom operations
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  zoomIn,
  zoomOut,
  zoomInFocused,
  zoomOutFocused,
  verticalZoomIn,
  verticalZoomOut,
  togglePlayPause,
  toggleMinimap,
  frameViewport,
} from '@/store/slices/timelineSlice';
import { logger } from '@/utils/debug';

export interface ViewShortcutHandlers {
  zoomIn: () => void;
  zoomOut: () => void;
  verticalZoomIn: () => void;
  verticalZoomOut: () => void;
  frameSelection: () => void;
  frameAll: () => void;
  togglePlay: () => void;
  toggleMinimap: () => void;
  undo: () => void;
  redo: () => void;
  help: () => void;
  settings: () => void;
  commandPalette: () => void;
}

export interface ViewShortcutState {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
}

/**
 * Hook for view and zoom keyboard shortcuts
 */
export const useViewShortcuts = (
  state: ViewShortcutState
): ViewShortcutHandlers => {
  const dispatch = useAppDispatch();
  const selectedClipIds = useAppSelector((state) => state.selection.selectedClipIds);
  const clips = useAppSelector((state) => state.clips.clips);

  const handleZoomIn = useCallback(() => {
    if (selectedClipIds.length > 0) {
      // Zoom focused on center of selected clips
      const selectedClips = clips.filter(c => selectedClipIds.includes(c.id));
      const minPos = Math.min(...selectedClips.map(c => c.position));
      const maxPos = Math.max(...selectedClips.map(c => c.position + c.duration));
      const centerBeats = (minPos + maxPos) / 2;
      dispatch(zoomInFocused(centerBeats));
    } else {
      dispatch(zoomIn());
    }
  }, [dispatch, selectedClipIds, clips]);

  const handleZoomOut = useCallback(() => {
    if (selectedClipIds.length > 0) {
      // Zoom focused on center of selected clips
      const selectedClips = clips.filter(c => selectedClipIds.includes(c.id));
      const minPos = Math.min(...selectedClips.map(c => c.position));
      const maxPos = Math.max(...selectedClips.map(c => c.position + c.duration));
      const centerBeats = (minPos + maxPos) / 2;
      dispatch(zoomOutFocused(centerBeats));
    } else {
      dispatch(zoomOut());
    }
  }, [dispatch, selectedClipIds, clips]);

  const handleVerticalZoomIn = useCallback(() => {
    dispatch(verticalZoomIn());
  }, [dispatch]);

  const handleVerticalZoomOut = useCallback(() => {
    dispatch(verticalZoomOut());
  }, [dispatch]);

  const handleFrameSelection = useCallback(() => {
    if (selectedClipIds.length > 0) {
      const selectedClips = clips.filter(c => selectedClipIds.includes(c.id));
      const startBeats = Math.min(...selectedClips.map(c => c.position));
      const endBeats = Math.max(...selectedClips.map(c => c.position + c.duration));
      dispatch(frameViewport({ startBeats, endBeats }));
    }
  }, [dispatch, selectedClipIds, clips]);

  const handleFrameAll = useCallback(() => {
    if (clips.length > 0) {
      const startBeats = Math.min(...clips.map(c => c.position));
      const endBeats = Math.max(...clips.map(c => c.position + c.duration));
      dispatch(frameViewport({ startBeats, endBeats }));
    }
  }, [dispatch, clips]);

  const handleTogglePlay = useCallback(() => {
    dispatch(togglePlayPause());
  }, [dispatch]);

  const handleToggleMinimap = useCallback(() => {
    dispatch(toggleMinimap());
  }, [dispatch]);

  const handleUndo = useCallback(() => {
    // TODO: Implement undo functionality
    logger.log('Undo action (not yet implemented)');
  }, []);

  const handleRedo = useCallback(() => {
    // TODO: Implement redo functionality
    logger.log('Redo action (not yet implemented)');
  }, []);

  const handleHelp = useCallback(() => {
    state.setShowHelp(true);
  }, [state]);

  const handleSettings = useCallback(() => {
    state.setShowSettings(true);
  }, [state]);

  const handleCommandPalette = useCallback(() => {
    state.setShowCommandPalette(true);
  }, [state]);

  return {
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    verticalZoomIn: handleVerticalZoomIn,
    verticalZoomOut: handleVerticalZoomOut,
    frameSelection: handleFrameSelection,
    frameAll: handleFrameAll,
    togglePlay: handleTogglePlay,
    toggleMinimap: handleToggleMinimap,
    undo: handleUndo,
    redo: handleRedo,
    help: handleHelp,
    settings: handleSettings,
    commandPalette: handleCommandPalette,
  };
};
