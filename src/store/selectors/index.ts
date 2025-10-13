/**
 * Song Arranger - Selector Barrel Export
 * Central export point for all selectors
 */

// Clip selectors
export {
  selectAllClips,
  selectEditingClipId,
  selectClipsByLane,
  selectSelectedClips,
  selectClipEndPosition,
  selectTimelineEndPosition,
  selectClipById,
  selectIsClipSelected,
  selectClipCount,
} from './clips';

// Lane selectors
export {
  selectAllLanes,
  selectEditingLaneId,
  selectMovingLaneId,
  selectLaneById,
  selectLaneOrder,
  selectLaneCount,
  selectLaneIndexById,
  selectIsLaneEditing,
  selectIsLaneMoving,
} from './lanes';

// Selection selectors
export {
  selectSelectedClipIds,
  selectCurrentLaneId,
  selectHasSelection,
  selectSelectionCount,
  selectHasMultipleSelection,
  selectIsClipSelectedById,
  selectFirstSelectedClipId,
  selectIsLaneCurrent,
} from './selection';
