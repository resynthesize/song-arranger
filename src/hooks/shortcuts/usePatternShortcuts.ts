/**
 * Cyclone - Pattern Shortcuts Hook
 * Handles keyboard shortcuts for pattern manipulation
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  unlinkPatternsFromScenesInTimeline,
  duplicatePatternsInTimeline,
  duplicatePatternsWithOffsetInTimeline,
  splitPatternInTimeline,
  setPatternsDurationInTimeline,
  trimPatternStartInTimeline,
  trimPatternEndInTimeline,
  createPatternInTimeline,
  setPatternMutedInTimeline,
  setPatternTypeInTimeline,
} from '@/store/slices/songSlice/slice';
import { selectPattern, clearSelection, selectAllPatterns } from '@/store/slices/selectionSlice';
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
  addPattern: () => void;
  edit: () => void;
  changeColor: () => void;
  toggleMute: () => void;
  togglePatternType: () => void;
}

/**
 * Hook for pattern manipulation keyboard shortcuts
 */
export const usePatternShortcuts = (): ClipShortcutHandlers => {
  const dispatch = useAppDispatch();
  const selectedPatternIds = useAppSelector((state) => state.selection.selectedPatternIds);
  const patterns = useAppSelector((state) => state.patterns.patterns);
  const playheadPosition = useAppSelector((state) => state.timeline.playheadPosition);
  const effectiveSnapValue = useAppSelector(selectEffectiveSnapValue);
  const currentTrackId = useAppSelector((state) => state.selection.currentTrackId);

  const handleDelete = useCallback(() => {
    if (selectedPatternIds.length > 0) {
      logger.log('[usePatternShortcuts] Delete key pressed', {
        selectedPatternIds,
        totalPatterns: patterns.length
      });

      // Find nearest neighbor to the first deleted clip
      const firstSelectedId = first(selectedPatternIds);
      if (!firstSelectedId) {
        dispatch(clearSelection());
        return;
      }

      const firstDeletedPattern = patterns.find((c) => c.id === firstSelectedId);
      const remainingPatterns = patterns.filter((c) => !selectedPatternIds.includes(c.id));

      logger.log('[usePatternShortcuts] Delete data:', {
        firstDeletedPattern,
        remainingCount: remainingPatterns.length
      });

      // Unlink patterns from scenes (keeps pattern definitions in CKS)
      dispatch(unlinkPatternsFromScenesInTimeline({ patternReactIds: selectedPatternIds }));

      // Try to select nearest neighbor if one exists
      if (firstDeletedPattern) {
        const nearestPattern = findNearestNeighbor(firstDeletedPattern, remainingPatterns);
        logger.log('[usePatternShortcuts] Nearest neighbor found:', nearestPattern);
        if (nearestPattern) {
          logger.log('[usePatternShortcuts] Selecting nearest clip:', nearestPattern.id);
          dispatch(selectPattern(nearestPattern.id));
        } else {
          logger.log('[usePatternShortcuts] No nearest clip, clearing selection');
          dispatch(clearSelection());
        }
      } else {
        logger.log('[usePatternShortcuts] First deleted pattern not found, clearing selection');
        dispatch(clearSelection());
      }
    }
  }, [dispatch, selectedPatternIds, patterns]);

  const handleDuplicate = useCallback(() => {
    if (selectedPatternIds.length > 0) {
      dispatch(duplicatePatternsInTimeline({ patternReactIds: selectedPatternIds }));
    }
  }, [dispatch, selectedPatternIds]);

  const handleDuplicateOffset = useCallback(() => {
    if (selectedPatternIds.length > 0) {
      dispatch(duplicatePatternsWithOffsetInTimeline({ patternReactIds: selectedPatternIds }));
    }
  }, [dispatch, selectedPatternIds]);

  const handleSplit = useCallback(() => {
    if (selectedPatternIds.length > 0) {
      // Split the first selected pattern at playhead position
      const patternId = first(selectedPatternIds);
      if (patternId) {
        dispatch(splitPatternInTimeline({ patternReactId: patternId, position: playheadPosition }));
      }
    }
  }, [dispatch, selectedPatternIds, playheadPosition]);

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
      if (selectedPatternIds.length > 0) {
        dispatch(setPatternsDurationInTimeline({ patternReactIds: selectedPatternIds, duration: bars * BEATS_PER_BAR }));
      }
    };
  }, [dispatch, selectedPatternIds]);

  const handleTrimStart = useCallback(() => {
    if (selectedPatternIds.length > 0) {
      const patternId = first(selectedPatternIds);
      if (patternId) {
        dispatch(trimPatternStartInTimeline({ patternReactId: patternId, amount: effectiveSnapValue }));
      }
    }
  }, [dispatch, selectedPatternIds, effectiveSnapValue]);

  const handleTrimEnd = useCallback(() => {
    if (selectedPatternIds.length > 0) {
      const patternId = first(selectedPatternIds);
      if (patternId) {
        dispatch(trimPatternEndInTimeline({ patternReactId: patternId, amount: effectiveSnapValue }));
      }
    }
  }, [dispatch, selectedPatternIds, effectiveSnapValue]);

  const handleAddPattern = useCallback(() => {
    if (currentTrackId) {
      // Add pattern at playhead position on current lane
      dispatch(createPatternInTimeline({
        trackReactId: currentTrackId,
        position: playheadPosition,
        duration: DEFAULT_CLIP_DURATION,
      }));
    }
  }, [dispatch, currentTrackId, playheadPosition]);

  const handleEdit = useCallback(() => {
    // TODO: Implement pattern label editing
    logger.log('Edit pattern label (not yet implemented)');
  }, []);

  const handleChangeColor = useCallback(() => {
    // TODO: Implement color picker
    logger.log('Change color (not yet implemented)');
  }, []);

  const handleToggleMute = useCallback(() => {
    if (selectedPatternIds.length > 0) {
      // Toggle mute state for all selected patterns
      selectedPatternIds.forEach((patternId) => {
        const pattern = patterns.find((p) => p.id === patternId);
        if (pattern) {
          // Toggle: if currently muted, unmute; if unmuted (or undefined), mute
          const newMutedState = !pattern.muted;
          dispatch(setPatternMutedInTimeline({ patternReactId: patternId, muted: newMutedState }));
        }
      });
    }
  }, [dispatch, selectedPatternIds, patterns]);

  const handleTogglePatternType = useCallback(() => {
    if (selectedPatternIds.length > 0) {
      // Toggle pattern type for all selected patterns
      selectedPatternIds.forEach((patternId) => {
        const pattern = patterns.find((p) => p.id === patternId);
        if (pattern) {
          // Toggle: P3 -> CK, CK -> P3, undefined -> P3
          const currentType = pattern.patternType || 'P3';
          const newType = currentType === 'P3' ? 'CK' : 'P3';
          dispatch(setPatternTypeInTimeline({ patternReactId: patternId, patternType: newType }));
        }
      });
    }
  }, [dispatch, selectedPatternIds, patterns]);

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
    addPattern: handleAddPattern,
    edit: handleEdit,
    changeColor: handleChangeColor,
    toggleMute: handleToggleMute,
    togglePatternType: handleTogglePatternType,
  };
};
