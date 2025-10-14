/**
 * Cyclone - Pattern Selectors
 * Reusable memoized selectors for pattern state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { Pattern, ID } from '@/types';

/**
 * Base selector - get all patterns from state
 */
export const selectAllPatterns = (state: RootState): Pattern[] => state.patterns.patterns;

/**
 * Base selector - get editing pattern ID
 */
export const selectEditingPatternId = (state: RootState): ID | null => state.patterns.editingPatternId;

/**
 * Memoized selector - get patterns for a specific track
 * Returns a new function that takes trackId as parameter
 */
export const selectPatternsByTrack = createSelector(
  [selectAllPatterns, (_state: RootState, trackId: ID) => trackId],
  (patterns, trackId) => patterns.filter((pattern) => pattern.trackId === trackId)
);

/**
 * Memoized selector - get all currently selected patterns
 * Combines patterns and selection state
 */
export const selectSelectedPatterns = createSelector(
  [selectAllPatterns, (state: RootState) => state.selection.selectedPatternIds],
  (patterns, selectedIds) => {
    const selectedIdsSet = new Set(selectedIds);
    return patterns.filter((pattern) => selectedIdsSet.has(pattern.id));
  }
);

/**
 * Utility function - calculate end position of a pattern
 */
export const selectPatternEndPosition = (pattern: Pattern): number => {
  return pattern.position + pattern.duration;
};

/**
 * Memoized selector - get the end position of the timeline
 * (furthest point where any pattern ends)
 */
export const selectTimelineEndPosition = createSelector(
  [selectAllPatterns],
  (patterns) => {
    if (patterns.length === 0) return 0;

    return Math.max(
      ...patterns.map((pattern) => selectPatternEndPosition(pattern))
    );
  }
);

/**
 * Memoized selector - get pattern by ID
 */
export const selectPatternById = createSelector(
  [selectAllPatterns, (_state: RootState, patternId: ID) => patternId],
  (patterns, patternId) => patterns.find((pattern) => pattern.id === patternId)
);

/**
 * Memoized selector - check if a pattern is selected
 */
export const selectIsPatternSelected = createSelector(
  [(state: RootState) => state.selection.selectedPatternIds, (_state: RootState, patternId: ID) => patternId],
  (selectedIds, patternId) => selectedIds.includes(patternId)
);

/**
 * Memoized selector - get total number of patterns
 */
export const selectPatternCount = createSelector(
  [selectAllPatterns],
  (patterns) => patterns.length
);
