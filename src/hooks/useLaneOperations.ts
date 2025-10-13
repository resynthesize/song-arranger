/**
 * Song Arranger - Lane Operations Hook
 * Custom hook for lane-related operations (rename, color change, remove, etc.)
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  renameLane,
  setEditingLane,
  clearEditingLane,
  removeLane,
  setLaneColor,
} from '@/store/slices/lanesSlice';
import { addClip } from '@/store/slices/clipsSlice';
import { setCurrentLane, clearSelection } from '@/store/slices/selectionSlice';
import { removeClips } from '@/store/slices/clipsSlice';
import { snapToGridFloor } from '@/utils/snap';
import { DEFAULT_CLIP_DURATION } from '@/constants';
import type { ID, Position, Duration } from '@/types';

interface UseLaneOperationsReturn {
  handleNameChange: (laneId: ID, newName: string) => void;
  handleStartEditing: (laneId: ID) => void;
  handleStopEditing: () => void;
  handleColorChange: (laneId: ID, color: string) => void;
  handleRemoveLane: (laneId: ID) => void;
  handleLaneSelect: (laneId: ID) => void;
  handleLaneDoubleClick: (laneId: ID, position: Position, duration?: Duration) => void;
}

/**
 * Custom hook for lane operations
 * Handles lane name changes, color changes, removal, selection, and clip creation
 */
export function useLaneOperations(effectiveSnapValue: number): UseLaneOperationsReturn {
  const dispatch = useAppDispatch();
  const clips = useAppSelector((state) => state.clips.clips);

  /**
   * Handle lane name changes
   */
  const handleNameChange = useCallback(
    (laneId: ID, newName: string) => {
      dispatch(renameLane({ laneId, name: newName }));
    },
    [dispatch]
  );

  /**
   * Start editing a lane name
   */
  const handleStartEditing = useCallback(
    (laneId: ID) => {
      dispatch(setEditingLane(laneId));
    },
    [dispatch]
  );

  /**
   * Stop editing a lane name
   */
  const handleStopEditing = useCallback(() => {
    dispatch(clearEditingLane());
  }, [dispatch]);

  /**
   * Handle lane color changes
   */
  const handleColorChange = useCallback(
    (laneId: ID, color: string) => {
      dispatch(setLaneColor({ laneId, color }));
    },
    [dispatch]
  );

  /**
   * Handle lane removal
   * Also removes all clips in the lane
   */
  const handleRemoveLane = useCallback(
    (laneId: ID) => {
      // Find all clips in this lane
      const clipsToRemove = clips.filter((clip) => clip.laneId === laneId);
      const clipIdsToRemove = clipsToRemove.map((clip) => clip.id);

      // Remove clips first
      if (clipIdsToRemove.length > 0) {
        dispatch(removeClips(clipIdsToRemove));
      }

      // Remove lane
      dispatch(removeLane(laneId));
    },
    [dispatch, clips]
  );

  /**
   * Handle lane selection
   * Clears clip selection when selecting a lane
   */
  const handleLaneSelect = useCallback(
    (laneId: ID) => {
      dispatch(setCurrentLane(laneId));
      dispatch(clearSelection()); // Clear clip selection when selecting a lane
    },
    [dispatch]
  );

  /**
   * Handle double-click to create clip (also handles drag-to-create with duration)
   */
  const handleLaneDoubleClick = useCallback(
    (laneId: ID, position: Position, duration?: Duration) => {
      // If duration is provided (from drag-to-create), use it directly
      // Otherwise, snap position and use default duration
      if (duration !== undefined) {
        // Drag-to-create - position and duration already snapped in Lane component
        dispatch(
          addClip({
            laneId,
            position,
            duration,
          })
        );
      } else {
        // Traditional double-click - snap to left edge of grid cell (floor)
        const snappedPosition = snapToGridFloor(position, effectiveSnapValue);
        dispatch(
          addClip({
            laneId,
            position: snappedPosition,
            duration: DEFAULT_CLIP_DURATION,
          })
        );
      }
    },
    [dispatch, effectiveSnapValue]
  );

  return {
    handleNameChange,
    handleStartEditing,
    handleStopEditing,
    handleColorChange,
    handleRemoveLane,
    handleLaneSelect,
    handleLaneDoubleClick,
  };
}
