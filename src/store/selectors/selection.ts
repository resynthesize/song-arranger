/**
 * Song Arranger - Selection Selectors
 * Reusable memoized selectors for selection state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { ID } from '@/types';

/**
 * Base selector - get selected pattern IDs
 */
export const selectSelectedPatternIds = (state: RootState): ID[] => state.selection.selectedPatternIds;

/**
 * Base selector - get current track ID
 */
export const selectCurrentTrackId = (state: RootState): ID | null => state.selection.currentTrackId;

/**
 * Memoized selector - check if any patterns are selected
 */
export const selectHasSelection = createSelector(
  [selectSelectedPatternIds],
  (selectedIds) => selectedIds.length > 0
);

/**
 * Memoized selector - get number of selected patterns
 */
export const selectSelectionCount = createSelector(
  [selectSelectedPatternIds],
  (selectedIds) => selectedIds.length
);

/**
 * Memoized selector - check if multiple patterns are selected
 */
export const selectHasMultipleSelection = createSelector(
  [selectSelectedPatternIds],
  (selectedIds) => selectedIds.length > 1
);

/**
 * Memoized selector - check if a specific pattern is selected
 */
export const selectIsPatternSelectedById = createSelector(
  [selectSelectedPatternIds, (_state: RootState, patternId: ID) => patternId],
  (selectedIds, patternId) => selectedIds.includes(patternId)
);

/**
 * Memoized selector - get first selected pattern ID
 */
export const selectFirstSelectedPatternId = createSelector(
  [selectSelectedPatternIds],
  (selectedIds) => selectedIds.length > 0 ? selectedIds[0] : null
);

/**
 * Memoized selector - check if a track is current
 */
export const selectIsTrackCurrent = createSelector(
  [selectCurrentTrackId, (_state: RootState, trackId: ID) => trackId],
  (currentId, trackId) => currentId === trackId
);
