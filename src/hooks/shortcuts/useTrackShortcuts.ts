/**
 * Song Arranger - Track Shortcuts Hook
 * Handles keyboard shortcuts for track manipulation
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addTrack, removeTrack, moveTrackUp, moveTrackDown, setMovingTrack, clearMovingTrack } from '@/store/slices/tracksSlice';
import { logger } from '@/utils/debug';

export interface LaneShortcutHandlers {
  addTrack: () => void;
  deleteTrack: () => void;
  moveTrackUp: () => void;
  moveTrackDown: () => void;
}

/**
 * Hook for track manipulation keyboard shortcuts
 */
export const useTrackShortcuts = (): LaneShortcutHandlers => {
  const dispatch = useAppDispatch();
  const currentTrackId = useAppSelector((state) => state.selection.currentTrackId);

  const handleAddTrack = useCallback(() => {
    dispatch(addTrack({}));
  }, [dispatch]);

  const handleDeleteTrack = useCallback(() => {
    if (currentTrackId) {
      dispatch(removeTrack(currentTrackId));
    }
  }, [dispatch, currentTrackId]);

  const handleMoveTrackUp = useCallback(() => {
    if (currentTrackId) {
      logger.log('moveTrackUp: Setting moving track', currentTrackId);
      dispatch(setMovingTrack(currentTrackId));
      dispatch(moveTrackUp(currentTrackId));
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
      dispatch(moveTrackDown(currentTrackId));
      setTimeout(() => {
        logger.log('moveTrackDown: Clearing moving track');
        dispatch(clearMovingTrack());
      }, 400);
    } else {
      logger.log('moveTrackDown: No current track ID');
    }
  }, [dispatch, currentTrackId]);

  return {
    addTrack: handleAddTrack,
    deleteTrack: handleDeleteTrack,
    moveTrackUp: handleMoveTrackUp,
    moveTrackDown: handleMoveTrackDown,
  };
};
