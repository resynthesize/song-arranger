/**
 * Song Arranger - Clip Shortcuts Hook
 * Handles keyboard shortcuts for clip manipulation
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  removeClips,
  duplicateClips,
  duplicateClipsWithOffset,
  splitClip,
  setClipsDuration,
  trimClipStart,
  trimClipEnd,
  addClip,
} from '@/store/slices/clipsSlice';
import { selectClip, clearSelection, selectAllClips } from '@/store/slices/selectionSlice';
import { selectEffectiveSnapValue } from '@/store/slices/timelineSlice';
import { findNearestNeighbor } from '@/utils/navigation';
import { first } from '@/utils/array';
import { BEATS_PER_BAR, DEFAULT_CLIP_DURATION } from '@/constants';
import { logger } from '@/utils/debug';

export interface ClipShortcutHandlers {
  delete: () => void;
  duplicate: () => void;
  duplicateOffset: () => void;
  split: () => void;
  join: () => void;
  selectAll: () => void;
  deselectAll: () => void;
  setDuration1: () => void;
  setDuration2: () => void;
  setDuration3: () => void;
  setDuration4: () => void;
  setDuration5: () => void;
  setDuration6: () => void;
  setDuration7: () => void;
  setDuration8: () => void;
  setDuration9: () => void;
  trimStart: () => void;
  trimEnd: () => void;
  addClip: () => void;
  edit: () => void;
  changeColor: () => void;
}

/**
 * Hook for clip manipulation keyboard shortcuts
 */
export const useClipShortcuts = (): ClipShortcutHandlers => {
  const dispatch = useAppDispatch();
  const selectedClipIds = useAppSelector((state) => state.selection.selectedClipIds);
  const clips = useAppSelector((state) => state.clips.clips);
  const playheadPosition = useAppSelector((state) => state.timeline.playheadPosition);
  const effectiveSnapValue = useAppSelector(selectEffectiveSnapValue);
  const currentLaneId = useAppSelector((state) => state.selection.currentLaneId);

  const handleDelete = useCallback(() => {
    if (selectedClipIds.length > 0) {
      logger.log('[useClipShortcuts] Delete key pressed', {
        selectedClipIds,
        totalClips: clips.length
      });

      // Find nearest neighbor to the first deleted clip
      const firstSelectedId = first(selectedClipIds);
      if (!firstSelectedId) {
        dispatch(clearSelection());
        return;
      }

      const firstDeletedClip = clips.find((c) => c.id === firstSelectedId);
      const remainingClips = clips.filter((c) => !selectedClipIds.includes(c.id));

      logger.log('[useClipShortcuts] Delete data:', {
        firstDeletedClip,
        remainingCount: remainingClips.length
      });

      dispatch(removeClips(selectedClipIds));

      // Try to select nearest neighbor if one exists
      if (firstDeletedClip) {
        const nearestClip = findNearestNeighbor(firstDeletedClip, remainingClips);
        logger.log('[useClipShortcuts] Nearest neighbor found:', nearestClip);
        if (nearestClip) {
          logger.log('[useClipShortcuts] Selecting nearest clip:', nearestClip.id);
          dispatch(selectClip(nearestClip.id));
        } else {
          logger.log('[useClipShortcuts] No nearest clip, clearing selection');
          dispatch(clearSelection());
        }
      } else {
        logger.log('[useClipShortcuts] First deleted clip not found, clearing selection');
        dispatch(clearSelection());
      }
    }
  }, [dispatch, selectedClipIds, clips]);

  const handleDuplicate = useCallback(() => {
    if (selectedClipIds.length > 0) {
      dispatch(duplicateClips(selectedClipIds));
    }
  }, [dispatch, selectedClipIds]);

  const handleDuplicateOffset = useCallback(() => {
    if (selectedClipIds.length > 0) {
      dispatch(duplicateClipsWithOffset(selectedClipIds));
    }
  }, [dispatch, selectedClipIds]);

  const handleSplit = useCallback(() => {
    if (selectedClipIds.length > 0) {
      // Split the first selected clip at playhead position
      const clipId = first(selectedClipIds);
      if (clipId) {
        dispatch(splitClip({ clipId, position: playheadPosition }));
      }
    }
  }, [dispatch, selectedClipIds, playheadPosition]);

  const handleJoin = useCallback(() => {
    // TODO: Implement join adjacent clips
    logger.log('Join clips (not yet implemented)');
  }, []);

  const handleSelectAll = useCallback(() => {
    dispatch(selectAllClips(clips.map(c => c.id)));
  }, [dispatch, clips]);

  const handleDeselectAll = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const createDurationHandler = useCallback((bars: number) => {
    return () => {
      if (selectedClipIds.length > 0) {
        dispatch(setClipsDuration({ clipIds: selectedClipIds, duration: bars * BEATS_PER_BAR }));
      }
    };
  }, [dispatch, selectedClipIds]);

  const handleTrimStart = useCallback(() => {
    if (selectedClipIds.length > 0) {
      const clipId = first(selectedClipIds);
      if (clipId) {
        dispatch(trimClipStart({ clipId, amount: effectiveSnapValue }));
      }
    }
  }, [dispatch, selectedClipIds, effectiveSnapValue]);

  const handleTrimEnd = useCallback(() => {
    if (selectedClipIds.length > 0) {
      const clipId = first(selectedClipIds);
      if (clipId) {
        dispatch(trimClipEnd({ clipId, amount: effectiveSnapValue }));
      }
    }
  }, [dispatch, selectedClipIds, effectiveSnapValue]);

  const handleAddClip = useCallback(() => {
    if (currentLaneId) {
      // Add clip at playhead position on current lane
      dispatch(addClip({
        laneId: currentLaneId,
        position: playheadPosition,
        duration: DEFAULT_CLIP_DURATION,
      }));
    }
  }, [dispatch, currentLaneId, playheadPosition]);

  const handleEdit = useCallback(() => {
    // TODO: Implement clip label editing
    logger.log('Edit clip label (not yet implemented)');
  }, []);

  const handleChangeColor = useCallback(() => {
    // TODO: Implement color picker
    logger.log('Change color (not yet implemented)');
  }, []);

  return {
    delete: handleDelete,
    duplicate: handleDuplicate,
    duplicateOffset: handleDuplicateOffset,
    split: handleSplit,
    join: handleJoin,
    selectAll: handleSelectAll,
    deselectAll: handleDeselectAll,
    setDuration1: createDurationHandler(1),
    setDuration2: createDurationHandler(2),
    setDuration3: createDurationHandler(3),
    setDuration4: createDurationHandler(4),
    setDuration5: createDurationHandler(5),
    setDuration6: createDurationHandler(6),
    setDuration7: createDurationHandler(7),
    setDuration8: createDurationHandler(8),
    setDuration9: createDurationHandler(9),
    trimStart: handleTrimStart,
    trimEnd: handleTrimEnd,
    addClip: handleAddClip,
    edit: handleEdit,
    changeColor: handleChangeColor,
  };
};
