/**
 * Song Arranger - Track Shortcuts Hook
 * Handles keyboard shortcuts for track manipulation
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addLane, removeLane, moveLaneUp, moveLaneDown, setMovingLane, clearMovingTrack } from '@/store/slices/tracksSlice';
import { logger } from '@/utils/debug';

export interface LaneShortcutHandlers {
  addLane: () => void;
  deleteLane: () => void;
  moveLaneUp: () => void;
  moveLaneDown: () => void;
}

/**
 * Hook for track manipulation keyboard shortcuts
 */
export const useTrackShortcuts = (): LaneShortcutHandlers => {
  const dispatch = useAppDispatch();
  const currentLaneId = useAppSelector((state) => state.selection.currentLaneId);

  const handleAddTrack = useCallback(() => {
    dispatch(addLane({}));
  }, [dispatch]);

  const handleDeleteTrack = useCallback(() => {
    if (currentLaneId) {
      dispatch(removeLane(currentLaneId));
    }
  }, [dispatch, currentLaneId]);

  const handleMoveLaneUp = useCallback(() => {
    if (currentLaneId) {
      logger.log('moveLaneUp: Setting moving lane', currentLaneId);
      dispatch(setMovingLane(currentLaneId));
      dispatch(moveLaneUp(currentLaneId));
      setTimeout(() => {
        logger.log('moveLaneUp: Clearing moving lane');
        dispatch(clearMovingLane());
      }, 400);
    } else {
      logger.log('moveLaneUp: No current track ID');
    }
  }, [dispatch, currentLaneId]);

  const handleMoveLaneDown = useCallback(() => {
    if (currentLaneId) {
      logger.log('moveLaneDown: Setting moving lane', currentLaneId);
      dispatch(setMovingLane(currentLaneId));
      dispatch(moveLaneDown(currentLaneId));
      setTimeout(() => {
        logger.log('moveLaneDown: Clearing moving lane');
        dispatch(clearMovingLane());
      }, 400);
    } else {
      logger.log('moveLaneDown: No current track ID');
    }
  }, [dispatch, currentLaneId]);

  return {
    addLane: handleAddLane,
    deleteLane: handleDeleteLane,
    moveLaneUp: handleMoveLaneUp,
    moveLaneDown: handleMoveLaneDown,
  };
};
