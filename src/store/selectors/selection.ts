/**
 * Song Arranger - Selection Selectors
 * Reusable memoized selectors for selection state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { ID } from '@/types';

/**
 * Base selector - get selected clip IDs
 */
export const selectSelectedClipIds = (state: RootState): ID[] => state.selection.selectedClipIds;

/**
 * Base selector - get current lane ID
 */
export const selectCurrentLaneId = (state: RootState): ID | null => state.selection.currentLaneId;

/**
 * Memoized selector - check if any clips are selected
 */
export const selectHasSelection = createSelector(
  [selectSelectedClipIds],
  (selectedIds) => selectedIds.length > 0
);

/**
 * Memoized selector - get number of selected clips
 */
export const selectSelectionCount = createSelector(
  [selectSelectedClipIds],
  (selectedIds) => selectedIds.length
);

/**
 * Memoized selector - check if multiple clips are selected
 */
export const selectHasMultipleSelection = createSelector(
  [selectSelectedClipIds],
  (selectedIds) => selectedIds.length > 1
);

/**
 * Memoized selector - check if a specific clip is selected
 */
export const selectIsClipSelectedById = createSelector(
  [selectSelectedClipIds, (_state: RootState, clipId: ID) => clipId],
  (selectedIds, clipId) => selectedIds.includes(clipId)
);

/**
 * Memoized selector - get first selected clip ID
 */
export const selectFirstSelectedClipId = createSelector(
  [selectSelectedClipIds],
  (selectedIds) => selectedIds.length > 0 ? selectedIds[0] : null
);

/**
 * Memoized selector - check if a lane is current
 */
export const selectIsLaneCurrent = createSelector(
  [selectCurrentLaneId, (_state: RootState, laneId: ID) => laneId],
  (currentId, laneId) => currentId === laneId
);
