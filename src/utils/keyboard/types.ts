/**
 * Cyclone - Keyboard Shortcuts Type Definitions
 */

/**
 * Keyboard action types
 */
export type KeyboardAction =
  // Clip operations
  | 'delete'
  | 'duplicate'
  | 'duplicateOffset'
  | 'edit'
  | 'changeColor'
  | 'split'
  | 'join'
  | 'addClip'
  | 'toggleMute'
  | 'togglePatternType'
  // Lane operations
  | 'addLane'
  | 'deleteLane'
  | 'moveLaneUp'
  | 'moveLaneDown'
  | 'openTrackSettings'
  // Selection
  | 'selectAll'
  | 'deselectAll'
  | 'cycleForward'
  | 'cycleBackward'
  // Playhead navigation
  | 'stop'
  | 'jumpToStart'
  | 'jumpToEnd'
  | 'movePlayheadLeft'
  | 'movePlayheadRight'
  | 'movePlayheadPrevClip'
  | 'movePlayheadNextClip'
  // Clip duration
  | 'setDuration1'
  | 'setDuration2'
  | 'setDuration3'
  | 'setDuration4'
  | 'setDuration5'
  | 'setDuration6'
  | 'setDuration7'
  | 'setDuration8'
  | 'setDuration9'
  | 'trimStart'
  | 'trimEnd'
  | 'adjustTempoUp'
  | 'adjustTempoDown'
  // View
  | 'frameSelection'
  | 'frameAll'
  | 'undo'
  | 'redo'
  | 'navigateUp'
  | 'navigateDown'
  | 'navigateLeft'
  | 'navigateRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'verticalZoomIn'
  | 'verticalZoomOut'
  | 'togglePlay'
  | 'toggleMinimap'
  | 'help'
  | 'settings'
  | 'commandPalette'
  | 'toggleSongDataViewer';

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: KeyboardAction;
  description?: string;
}

/**
 * Context for determining which shortcuts are available
 */
export interface KeyboardContext {
  hasSelection: boolean;
  selectionCount: number;
  isEditing: boolean;
}
