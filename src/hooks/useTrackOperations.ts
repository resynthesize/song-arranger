/**
 * Song Arranger - Track Operations Hook
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
} from '@/store/slices/tracksSlice';
import { addPattern } from '@/store/slices/patternsSlice';
import { setCurrentLane, clearSelection } from '@/store/slices/selectionSlice';
import { removePatterns } from '@/store/slices/patternsSlice';
import { snapToGridFloor } from '@/utils/snap';
import { DEFAULT_CLIP_DURATION } from '@/constants';
import type { ID, Position, Duration } from '@/types';

interface UseTrackOperationsReturn {
  handleNameChange: (trackId: ID, newName: string) => void;
  handleStartEditing: (trackId: ID) => void;
  handleStopEditing: () => void;
  handleColorChange: (trackId: ID, color: string) => void;
  handleRemoveLane: (trackId: ID) => void;
  handleLaneSelect: (trackId: ID) => void;
  handleLaneDoubleClick: (trackId: ID, position: Position, duration?: Duration) => void;
}

/**
 * Custom hook for track operations
 * Handles track name changes, color changes, removal, selection, and pattern creation
 */
export function useTrackOperations(effectiveSnapValue: number): UseTrackOperationsReturn {
  const dispatch = useAppDispatch();
  const patterns = useAppSelector((state) => state.patterns.patterns);

  /**
   * Handle track name changes
   */
  const handleNameChange = useCallback(
    (trackId: ID, newName: string) => {
      dispatch(renameLane({ trackId, name: newName }));
    },
    [dispatch]
  );

  /**
   * Start editing a track name
   */
  const handleStartEditing = useCallback(
    (trackId: ID) => {
      dispatch(setEditingLane(trackId));
    },
    [dispatch]
  );

  /**
   * Stop editing a track name
   */
  const handleStopEditing = useCallback(() => {
    dispatch(clearEditingLane());
  }, [dispatch]);

  /**
   * Handle track color changes
   */
  const handleColorChange = useCallback(
    (trackId: ID, color: string) => {
      dispatch(setLaneColor({ trackId, color }));
    },
    [dispatch]
  );

  /**
   * Handle track removal
   * Also removes all patterns in the lane
   */
  const handleRemoveTrack = useCallback(
    (trackId: ID) => {
      // Find all patterns in this lane
      const patternsToRemove = patterns.filter((clip) => clip.trackId === trackId);
      const patternIdsToRemove = patternsToRemove.map((clip) => clip.id);

      // Remove patterns first
      if (patternIdsToRemove.length > 0) {
        dispatch(removePatterns(patternIdsToRemove));
      }

      // Remove lane
      dispatch(removeLane(trackId));
    },
    [dispatch, patterns]
  );

  /**
   * Handle track selection
   * Clears pattern selection when selecting a lane
   */
  const handleLaneSelect = useCallback(
    (trackId: ID) => {
      dispatch(setCurrentLane(trackId));
      dispatch(clearSelection()); // Clear pattern selection when selecting a lane
    },
    [dispatch]
  );

  /**
   * Handle double-click to create pattern (also handles drag-to-create with duration)
   */
  const handleLaneDoubleClick = useCallback(
    (trackId: ID, position: Position, duration?: Duration) => {
      // If duration is provided (from drag-to-create), use it directly
      // Otherwise, snap position and use default duration
      if (duration !== undefined) {
        // Drag-to-create - position and duration already snapped in Track component
        dispatch(
          addClip({
            trackId,
            position,
            duration,
          })
        );
      } else {
        // Traditional double-click - snap to left edge of grid cell (floor)
        const snappedPosition = snapToGridFloor(position, effectiveSnapValue);
        dispatch(
          addClip({
            trackId,
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
