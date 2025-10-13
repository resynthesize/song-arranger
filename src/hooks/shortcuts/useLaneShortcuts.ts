/**
 * Song Arranger - Lane Shortcuts Hook
 * Handles keyboard shortcuts for lane manipulation
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addLane, removeLane, moveLaneUp, moveLaneDown, setMovingLane, clearMovingLane } from '@/store/slices/lanesSlice';
import { logger } from '@/utils/debug';

export interface LaneShortcutHandlers {
  addLane: () => void;
  deleteLane: () => void;
  moveLaneUp: () => void;
  moveLaneDown: () => void;
}

/**
 * Hook for lane manipulation keyboard shortcuts
 */
export const useLaneShortcuts = (): LaneShortcutHandlers => {
  const dispatch = useAppDispatch();
  const currentLaneId = useAppSelector((state) => state.selection.currentLaneId);

  const handleAddLane = useCallback(() => {
    dispatch(addLane({}));
  }, [dispatch]);

  const handleDeleteLane = useCallback(() => {
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
      logger.log('moveLaneUp: No current lane ID');
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
      logger.log('moveLaneDown: No current lane ID');
    }
  }, [dispatch, currentLaneId]);

  return {
    addLane: handleAddLane,
    deleteLane: handleDeleteLane,
    moveLaneUp: handleMoveLaneUp,
    moveLaneDown: handleMoveLaneDown,
  };
};
