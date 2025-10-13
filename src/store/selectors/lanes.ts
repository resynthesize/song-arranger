/**
 * Song Arranger - Lane Selectors
 * Reusable memoized selectors for lane state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { Lane, ID } from '@/types';

/**
 * Base selector - get all lanes from state
 */
export const selectAllLanes = (state: RootState): Lane[] => state.lanes.lanes;

/**
 * Base selector - get editing lane ID
 */
export const selectEditingLaneId = (state: RootState): ID | null => state.lanes.editingLaneId;

/**
 * Base selector - get moving lane ID
 */
export const selectMovingLaneId = (state: RootState): ID | null => state.lanes.movingLaneId;

/**
 * Memoized selector - get lane by ID
 */
export const selectLaneById = createSelector(
  [selectAllLanes, (_state: RootState, laneId: ID) => laneId],
  (lanes, laneId) => lanes.find((lane) => lane.id === laneId)
);

/**
 * Memoized selector - get lanes in display order
 * (Currently lanes are already in order, but this provides a consistent API)
 */
export const selectLaneOrder = createSelector(
  [selectAllLanes],
  (lanes) => lanes.map((lane) => lane.id)
);

/**
 * Memoized selector - get total number of lanes
 */
export const selectLaneCount = createSelector(
  [selectAllLanes],
  (lanes) => lanes.length
);

/**
 * Memoized selector - get lane index by ID
 */
export const selectLaneIndexById = createSelector(
  [selectAllLanes, (_state: RootState, laneId: ID) => laneId],
  (lanes, laneId) => lanes.findIndex((lane) => lane.id === laneId)
);

/**
 * Memoized selector - check if a lane is being edited
 */
export const selectIsLaneEditing = createSelector(
  [selectEditingLaneId, (_state: RootState, laneId: ID) => laneId],
  (editingId, laneId) => editingId === laneId
);

/**
 * Memoized selector - check if a lane is moving
 */
export const selectIsLaneMoving = createSelector(
  [selectMovingLaneId, (_state: RootState, laneId: ID) => laneId],
  (movingId, laneId) => movingId === laneId
);
