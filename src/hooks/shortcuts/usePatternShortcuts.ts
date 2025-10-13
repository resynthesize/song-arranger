/**
 * Song Arranger - Pattern Shortcuts Hook
 * Handles keyboard shortcuts for pattern manipulation
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  removePatterns,
  duplicatePatterns,
  duplicatePatternsWithOffset,
  splitClip,
  setPatternsDuration,
  trimClipStart,
  trimClipEnd,
  addClip,
} from '@/store/slices/patternsSlice';
import { selectClip, clearSelection, selectAllPatterns } from '@/store/slices/selectionSlice';
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
 * Hook for pattern manipulation keyboard shortcuts
 */
export const usePatternShortcuts = (): ClipShortcutHandlers => {
  const dispatch = useAppDispatch();
  const selectedClipIds = useAppSelector((state) => state.selection.selectedClipIds);
  const patterns = useAppSelector((state) => state.patterns.patterns);
  const playheadPosition = useAppSelector((state) => state.timeline.playheadPosition);
  const effectiveSnapValue = useAppSelector(selectEffectiveSnapValue);
  const currentLaneId = useAppSelector((state) => state.selection.currentLaneId);

  const handleDelete = useCallback(() => {
    if (selectedClipIds.length > 0) {
      logger.log('[usePatternShortcuts] Delete key pressed', {
        selectedClipIds,
        totalPatterns: patterns.length
      });

      // Find nearest neighbor to the first deleted clip
      const firstSelectedId = first(selectedClipIds);
      if (!firstSelectedId) {
        dispatch(clearSelection());
        return;
      }

      const firstDeletedPattern = patterns.find((c) => c.id === firstSelectedId);
      const remainingPatterns = patterns.filter((c) => !selectedClipIds.includes(c.id));

      logger.log('[usePatternShortcuts] Delete data:', {
        firstDeletedClip,
        remainingCount: remainingPatterns.length
      });

      dispatch(removePatterns(selectedClipIds));

      // Try to select nearest neighbor if one exists
      if (firstDeletedClip) {
        const nearestPattern = findNearestNeighbor(firstDeletedClip, remainingPatterns);
        logger.log('[usePatternShortcuts] Nearest neighbor found:', nearestClip);
        if (nearestClip) {
          logger.log('[usePatternShortcuts] Selecting nearest clip:', nearestClip.id);
          dispatch(selectClip(nearestClip.id));
        } else {
          logger.log('[usePatternShortcuts] No nearest clip, clearing selection');
          dispatch(clearSelection());
        }
      } else {
        logger.log('[usePatternShortcuts] First deleted pattern not found, clearing selection');
        dispatch(clearSelection());
      }
    }
  }, [dispatch, selectedClipIds, patterns]);

  const handleDuplicate = useCallback(() => {
    if (selectedClipIds.length > 0) {
      dispatch(duplicatePatterns(selectedClipIds));
    }
  }, [dispatch, selectedClipIds]);

  const handleDuplicateOffset = useCallback(() => {
    if (selectedClipIds.length > 0) {
      dispatch(duplicatePatternsWithOffset(selectedClipIds));
    }
  }, [dispatch, selectedClipIds]);

  const handleSplit = useCallback(() => {
    if (selectedClipIds.length > 0) {
      // Split the first selected pattern at playhead position
      const patternId = first(selectedClipIds);
      if (patternId) {
        dispatch(splitClip({ patternId, position: playheadPosition }));
      }
    }
  }, [dispatch, selectedClipIds, playheadPosition]);

  const handleJoin = useCallback(() => {
    // TODO: Implement join adjacent patterns
    logger.log('Join patterns (not yet implemented)');
  }, []);

  const handleSelectAll = useCallback(() => {
    dispatch(selectAllPatterns(patterns.map(c => c.id)));
  }, [dispatch, patterns]);

  const handleDeselectAll = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const createDurationHandler = useCallback((bars: number) => {
    return () => {
      if (selectedClipIds.length > 0) {
        dispatch(setPatternsDuration({ patternIds: selectedClipIds, duration: bars * BEATS_PER_BAR }));
      }
    };
  }, [dispatch, selectedClipIds]);

  const handleTrimStart = useCallback(() => {
    if (selectedClipIds.length > 0) {
      const patternId = first(selectedClipIds);
      if (patternId) {
        dispatch(trimClipStart({ patternId, amount: effectiveSnapValue }));
      }
    }
  }, [dispatch, selectedClipIds, effectiveSnapValue]);

  const handleTrimEnd = useCallback(() => {
    if (selectedClipIds.length > 0) {
      const patternId = first(selectedClipIds);
      if (patternId) {
        dispatch(trimClipEnd({ patternId, amount: effectiveSnapValue }));
      }
    }
  }, [dispatch, selectedClipIds, effectiveSnapValue]);

  const handleAddPattern = useCallback(() => {
    if (currentLaneId) {
      // Add pattern at playhead position on current lane
      dispatch(addClip({
        trackId: currentLaneId,
        position: playheadPosition,
        duration: DEFAULT_CLIP_DURATION,
      }));
    }
  }, [dispatch, currentLaneId, playheadPosition]);

  const handleEdit = useCallback(() => {
    // TODO: Implement pattern label editing
    logger.log('Edit pattern label (not yet implemented)');
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
