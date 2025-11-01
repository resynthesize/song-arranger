/**
 * Cyclone - Track Operations Hook
 * Custom hook for lane-related operations (rename, color change, remove, etc.)
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setEditingTrack,
  clearEditingTrack,
} from '@/store/slices/tracksSlice';
import {
  createPatternInTimeline,
  renameTrackInTimeline,
  setTrackColorInTimeline,
  removeTrackInTimeline,
  updateTrackSettings,
} from '@/store/slices/songSlice/slice';
import { setCurrentTrack, clearSelection } from '@/store/slices/selectionSlice';
import { snapToGridFloor } from '@/utils/snap';
import { DEFAULT_CLIP_DURATION } from '@/constants';
import { getTrackKeyFromReactId } from '@/store/slices/songSlice/adapters';
import type { ID, Position, Duration } from '@/types';

interface UseTrackOperationsReturn {
  handleNameChange: (trackId: ID, newName: string) => void;
  handleStartEditing: (trackId: ID) => void;
  handleStopEditing: () => void;
  handleColorChange: (trackId: ID, color: string) => void;
  handleRemoveLane: (trackId: ID) => void;
  handleLaneSelect: (trackId: ID) => void;
  handleLaneDoubleClick: (trackId: ID, position: Position, duration?: Duration) => void;
  handleTrackHeightChange: (trackId: ID, height: number) => void;
  handleTrackCollapseToggle: (trackId: ID) => void;
}

/**
 * Custom hook for track operations
 * Handles track name changes, color changes, removal, selection, and pattern creation
 */
export function useTrackOperations(effectiveSnapValue: number): UseTrackOperationsReturn {
  const dispatch = useAppDispatch();
  const songData = useAppSelector((state) => state.song.present);

  /**
   * Handle track name changes
   * Updates track name in CKS metadata
   */
  const handleNameChange = useCallback(
    (trackId: ID, newName: string) => {
      dispatch(renameTrackInTimeline({ trackReactId: trackId, name: newName }));
    },
    [dispatch]
  );

  /**
   * Start editing a track name
   */
  const handleStartEditing = useCallback(
    (trackId: ID) => {
      dispatch(setEditingTrack(trackId));
    },
    [dispatch]
  );

  /**
   * Stop editing a track name
   */
  const handleStopEditing = useCallback(() => {
    dispatch(clearEditingTrack());
  }, [dispatch]);

  /**
   * Handle track color changes
   * Updates track color in CKS metadata
   */
  const handleColorChange = useCallback(
    (trackId: ID, color: string) => {
      dispatch(setTrackColorInTimeline({ trackReactId: trackId, color }));
    },
    [dispatch]
  );

  /**
   * Handle track removal
   * Removes track and all its patterns from CKS
   */
  const handleRemoveTrack = useCallback(
    (trackId: ID) => {
      // Remove track (this will also remove all patterns in the track)
      dispatch(removeTrackInTimeline({ trackReactId: trackId }));
    },
    [dispatch]
  );

  /**
   * Handle track selection
   * Clears pattern selection when selecting a track
   */
  const handleLaneSelect = useCallback(
    (trackId: ID) => {
      dispatch(setCurrentTrack(trackId));
      dispatch(clearSelection()); // Clear pattern selection when selecting a track
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
        dispatch(createPatternInTimeline({
          trackReactId: trackId,
          position,
          duration,
        }));
      } else {
        // Traditional double-click - snap to left edge of grid cell (floor)
        const snappedPosition = snapToGridFloor(position, effectiveSnapValue);
        dispatch(createPatternInTimeline({
          trackReactId: trackId,
          position: snappedPosition,
          duration: DEFAULT_CLIP_DURATION,
        }));
      }
    },
    [dispatch, effectiveSnapValue]
  );

  /**
   * Handle track height change
   * Updates track height in CKS metadata
   */
  const handleTrackHeightChange = useCallback(
    (trackId: ID, height: number) => {
      const trackKey = getTrackKeyFromReactId(songData, trackId);
      if (!trackKey) return;

      dispatch(updateTrackSettings({ trackKey, settings: { height } }));
    },
    [dispatch, songData]
  );

  /**
   * Handle track collapse toggle
   * Toggles collapsed state in CKS metadata
   */
  const handleTrackCollapseToggle = useCallback(
    (trackId: ID) => {
      const trackKey = getTrackKeyFromReactId(songData, trackId);
      if (!trackKey) return;

      // Get current collapsed state
      const currentCollapsed = songData._cyclone_metadata?.uiMappings.tracks[trackKey]?.collapsed || false;

      dispatch(updateTrackSettings({
        trackKey,
        settings: { collapsed: !currentCollapsed }
      }));
    },
    [dispatch, songData]
  );

  return useMemo(
    () => ({
      handleNameChange,
      handleStartEditing,
      handleStopEditing,
      handleColorChange,
      handleRemoveLane: handleRemoveTrack,
      handleLaneSelect,
      handleLaneDoubleClick,
      handleTrackHeightChange,
      handleTrackCollapseToggle,
    }),
    [handleNameChange, handleStartEditing, handleStopEditing, handleColorChange, handleRemoveTrack, handleLaneSelect, handleLaneDoubleClick, handleTrackHeightChange, handleTrackCollapseToggle]
  );
}
