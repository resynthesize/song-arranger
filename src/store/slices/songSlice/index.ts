/**
 * Cyclone - Song Slice Barrel Export
 * Central export point for all songSlice functionality
 */

// Export the reducer as default
export { default } from './slice';

// Export all action creators explicitly
export {
  // CKS Direct Actions
  loadSong,
  setCurrentSong,
  updatePattern,
  addPattern,
  removePattern,
  assignPatternToScene,
  removePatternFromScene,
  updateScene,
  addScene,
  removeScene,
  setTrackOrder,
  setSceneOrder,
  setTrackColor,
  updateInstrumentAssignment,
  updateTrackSettings,
  setSceneColor,

  // Timeline Adapter Actions
  movePatternInTimeline,
  movePatternsInTimeline,
  createPatternInTimeline,
  deletePatternInTimeline,
  deletePatternsInTimeline,
  unlinkPatternFromSceneInTimeline,
  unlinkPatternsFromScenesInTimeline,
  resizePatternInTimeline,
  resizePatternsInTimeline,
  movePatternToTrack,
  movePatternsToTrack,
  updatePatternLabel,
  duplicatePatternInTimeline,
  duplicatePatternsInTimeline,
  updateStepValueInTimeline,
  updateStepNoteInTimeline,
  toggleGateInTimeline,
  toggleAuxFlagInTimeline,
  addTrackInTimeline,
  removeTrackInTimeline,
  reorderTrackInTimeline,
  renameTrackInTimeline,
  setTrackColorInTimeline,
} from './slice';

// Export types for consumers
export type { TimelinePayloads, CKSPayloads, PatternLocation, SceneBoundaries } from './types';

// Export constants
export { DEFAULT_SCENE_LENGTH, DEFAULT_BEATS_PER_BAR, SCENE_SNAP_GRANULARITY } from './constants';

// Export adapter functions (for tests or advanced usage)
export * as adapters from './adapters';

// Export mutation functions (for tests or advanced usage)
export * as mutations from './mutations';

// Re-export renameScene specifically (TypeScript cache workaround)
export { renameScene } from './slice';
