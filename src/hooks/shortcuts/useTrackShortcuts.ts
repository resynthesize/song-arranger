/**
 * Cyclone - Track Shortcuts Hook
 * Handles keyboard shortcuts for track manipulation
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addTrackInTimeline,
  removeTrackInTimeline,
  moveTrackUpInTimeline,
  moveTrackDownInTimeline
} from '@/store/slices/songSlice/slice';
import { setMovingTrack, clearMovingTrack } from '@/store/slices/tracksSlice';
import { logger } from '@/utils/debug';

export interface LaneShortcutHandlers {
  addTrack: () => void;
  deleteTrack: () => void;
  moveTrackUp: () => void;
  moveTrackDown: () => void;
  openTrackSettings: () => void;
}

export interface TrackShortcutsOptions {
  setShowTrackSettings: (show: boolean) => void;
}

/**
 * Hook for track manipulation keyboard shortcuts
 */
export const useTrackShortcuts = (options: TrackShortcutsOptions): LaneShortcutHandlers => {
  const { setShowTrackSettings } = options;
  const dispatch = useAppDispatch();
  const currentTrackId = useAppSelector((state) => state.selection.currentTrackId);

  const handleAddTrack = useCallback(() => {
    dispatch(addTrackInTimeline({}));
  }, [dispatch]);

  const handleDeleteTrack = useCallback(() => {
    if (currentTrackId) {
      dispatch(removeTrackInTimeline({ trackReactId: currentTrackId }));
    }
  }, [dispatch, currentTrackId]);

  const handleMoveTrackUp = useCallback(() => {
    if (currentTrackId) {
      logger.log('moveTrackUp: Setting moving track', currentTrackId);
      dispatch(setMovingTrack(currentTrackId));
      dispatch(moveTrackUpInTimeline({ trackReactId: currentTrackId }));
      setTimeout(() => {
        logger.log('moveTrackUp: Clearing moving track');
        dispatch(clearMovingTrack());
      }, 400);
    } else {
      logger.log('moveTrackUp: No current track ID');
    }
  }, [dispatch, currentTrackId]);

  const handleMoveTrackDown = useCallback(() => {
    if (currentTrackId) {
      logger.log('moveTrackDown: Setting moving track', currentTrackId);
      dispatch(setMovingTrack(currentTrackId));
      dispatch(moveTrackDownInTimeline({ trackReactId: currentTrackId }));
      setTimeout(() => {
        logger.log('moveTrackDown: Clearing moving track');
        dispatch(clearMovingTrack());
      }, 400);
    } else {
      logger.log('moveTrackDown: No current track ID');
    }
  }, [dispatch, currentTrackId]);

  const handleOpenTrackSettings = useCallback(() => {
    if (currentTrackId) {
      setShowTrackSettings(true);
    } else {
      logger.log('openTrackSettings: No current track ID');
    }
  }, [currentTrackId, setShowTrackSettings]);

  return {
    addTrack: handleAddTrack,
    deleteTrack: handleDeleteTrack,
    moveTrackUp: handleMoveTrackUp,
    moveTrackDown: handleMoveTrackDown,
    openTrackSettings: handleOpenTrackSettings,
  };
};
