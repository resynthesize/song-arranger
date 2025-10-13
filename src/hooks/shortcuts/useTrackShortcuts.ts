/**
 * Song Arranger - Track Shortcuts Hook
 * Handles keyboard shortcuts for track manipulation
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addTrack, removeTrack, moveTrackUp, moveTrackDown, setMovingLane, clearMovingTrack } from '@/store/slices/tracksSlice';
import { logger } from '@/utils/debug';

export interface LaneShortcutHandlers {
  addTrack: () => void;
  deleteLane: () => void;
  moveTrackUp: () => void;
  moveTrackDown: () => void;
}

/**
 * Hook for track manipulation keyboard shortcuts
 */
export const useTrackShortcuts = (): LaneShortcutHandlers => {
  const dispatch = useAppDispatch();
  const currentLaneId = useAppSelector((state) => state.selection.currentTrackId);

  const handleAddTrack = useCallback(() => {
    dispatch(addTrack({}));
  }, [dispatch]);

  const handleDeleteTrack = useCallback(() => {
    if (currentLaneId) {
      dispatch(removeTrack(currentLaneId));
    }
  }, [dispatch, currentLaneId]);

  const handleMoveLaneUp = useCallback(() => {
    if (currentLaneId) {
      logger.log('moveTrackUp: Setting moving lane', currentLaneId);
      dispatch(setMovingLane(currentLaneId));
      dispatch(moveTrackUp(currentLaneId));
      setTimeout(() => {
        logger.log('moveTrackUp: Clearing moving lane');
        dispatch(clearMovingLane());
      }, 400);
    } else {
      logger.log('moveTrackUp: No current track ID');
    }
  }, [dispatch, currentLaneId]);

  const handleMoveLaneDown = useCallback(() => {
    if (currentLaneId) {
      logger.log('moveTrackDown: Setting moving lane', currentLaneId);
      dispatch(setMovingLane(currentLaneId));
      dispatch(moveTrackDown(currentLaneId));
      setTimeout(() => {
        logger.log('moveTrackDown: Clearing moving lane');
        dispatch(clearMovingLane());
      }, 400);
    } else {
      logger.log('moveTrackDown: No current track ID');
    }
  }, [dispatch, currentLaneId]);

  return {
    addTrack: handleAddLane,
    deleteLane: handleDeleteLane,
    moveTrackUp: handleMoveLaneUp,
    moveTrackDown: handleMoveLaneDown,
  };
};
