/**
 * Cyclone - Selector Barrel Export
 * Central export point for all selectors
 *
 * DATA SELECTORS: From song.ts (CKS-native format)
 * UI STATE SELECTORS: From tracks.ts and patterns.ts
 */

// Song selectors (CKS-native format - DATA)
export {
  selectSongState,
  selectMetadata,
  selectCurrentSongName,
  selectCurrentSong,
  selectAllScenes,
  selectAvailableInstruments,
  selectTrackSettingsById,
  selectAllTracks,        // DATA from CKS
  selectTrackById,        // DATA from CKS
  selectTrackCount,       // DATA from CKS
  selectTrackIndexById,   // DATA from CKS
  selectAllPatterns,      // DATA from CKS
  selectPatternsByTrack,  // DATA from CKS
  selectSelectedPatterns, // DATA from CKS
  selectPatternById,      // DATA from CKS
  selectIsPatternSelected,// DATA from CKS
  selectPatternCount,     // DATA from CKS
  selectTimelineEndPosition, // DATA from CKS
} from './song';

// Track UI state selectors (editing/moving state only)
export {
  selectEditingTrackId,
  selectMovingTrackId,
} from './tracks';

// Pattern UI state selectors (editing state only)
export {
  selectEditingPatternId,
} from './patterns';

// Selection selectors
export {
  selectSelectedPatternIds,
  selectCurrentTrackId,
  selectHasSelection,
  selectSelectionCount,
  selectHasMultipleSelection,
  selectIsPatternSelectedById,
  selectFirstSelectedPatternId,
  selectIsTrackCurrent,
} from './selection';
