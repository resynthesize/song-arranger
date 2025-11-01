/**
 * Cyclone - Keyboard Shortcuts Configuration
 * All keyboard shortcut definitions
 */

import type { KeyboardShortcut } from './types';

/**
 * All available keyboard shortcuts
 */
export const ALL_SHORTCUTS: KeyboardShortcut[] = [
  // Clip operations (require selection)
  {
    key: 'Delete',
    action: 'delete',
    description: 'Delete selected clips'
  },
  {
    key: 'Backspace',
    action: 'delete',
    description: 'Delete selected clips'
  },
  {
    key: 'd',
    action: 'duplicate',
    description: 'Duplicate selected clips'
  },
  {
    key: 'D',
    shiftKey: true,
    action: 'duplicateOffset',
    description: 'Duplicate and offset by duration'
  },
  {
    key: 'e',
    action: 'edit',
    description: 'Edit clip label'
  },
  {
    key: 'c',
    action: 'changeColor',
    description: 'Change clip color'
  },
  {
    key: 'm',
    action: 'toggleMute',
    description: 'Toggle mute on selected patterns'
  },
  {
    key: 't',
    action: 'togglePatternType',
    description: 'Toggle pattern type (P3 ↔ CK)'
  },
  {
    key: 's',
    action: 'split',
    description: 'Split clip at playhead'
  },
  {
    key: 'j',
    action: 'join',
    description: 'Join adjacent selected clips'
  },
  {
    key: 'C',
    shiftKey: true,
    action: 'addClip',
    description: 'Add clip to current lane at playhead'
  },

  // Lane operations
  {
    key: 'i',
    action: 'addLane',
    description: 'Add new lane'
  },
  {
    key: 'Delete',
    altKey: true,
    action: 'deleteLane',
    description: 'Delete current lane'
  },
  {
    key: 'Backspace',
    altKey: true,
    action: 'deleteLane',
    description: 'Delete current lane'
  },
  {
    key: 'ArrowUp',
    shiftKey: true,
    action: 'moveLaneUp',
    description: 'Move current lane up'
  },
  {
    key: 'ArrowDown',
    shiftKey: true,
    action: 'moveLaneDown',
    description: 'Move current lane down'
  },
  {
    key: 'T',
    shiftKey: true,
    action: 'openTrackSettings',
    description: 'Open track settings for current track'
  },

  // Selection
  {
    key: 'a',
    ctrlKey: true,
    action: 'selectAll',
    description: 'Select all clips'
  },
  {
    key: 'A',
    ctrlKey: true,
    shiftKey: true,
    action: 'deselectAll',
    description: 'Deselect all'
  },
  {
    key: 'Tab',
    action: 'cycleForward',
    description: 'Cycle through clips in current lane'
  },
  {
    key: 'Tab',
    shiftKey: true,
    action: 'cycleBackward',
    description: 'Cycle backwards through clips'
  },

  // Playhead navigation
  {
    key: 'Enter',
    action: 'stop',
    description: 'Stop and return to start'
  },
  {
    key: 'Home',
    action: 'jumpToStart',
    description: 'Jump to start'
  },
  {
    key: 'End',
    action: 'jumpToEnd',
    description: 'Jump to end'
  },
  {
    key: 'ArrowLeft',
    shiftKey: true,
    action: 'movePlayheadLeft',
    description: 'Move playhead left by 1 bar'
  },
  {
    key: 'ArrowRight',
    shiftKey: true,
    action: 'movePlayheadRight',
    description: 'Move playhead right by 1 bar'
  },
  {
    key: 'ArrowLeft',
    ctrlKey: true,
    action: 'movePlayheadPrevClip',
    description: 'Move playhead to previous clip boundary'
  },
  {
    key: 'ArrowRight',
    ctrlKey: true,
    action: 'movePlayheadNextClip',
    description: 'Move playhead to next clip boundary'
  },

  // Clip duration (require selection)
  {
    key: '1',
    action: 'setDuration1',
    description: 'Set clip duration to 1 bar'
  },
  {
    key: '2',
    action: 'setDuration2',
    description: 'Set clip duration to 2 bars'
  },
  {
    key: '3',
    action: 'setDuration3',
    description: 'Set clip duration to 3 bars'
  },
  {
    key: '4',
    action: 'setDuration4',
    description: 'Set clip duration to 4 bars'
  },
  {
    key: '5',
    action: 'setDuration5',
    description: 'Set clip duration to 5 bars'
  },
  {
    key: '6',
    action: 'setDuration6',
    description: 'Set clip duration to 6 bars'
  },
  {
    key: '7',
    action: 'setDuration7',
    description: 'Set clip duration to 7 bars'
  },
  {
    key: '8',
    action: 'setDuration8',
    description: 'Set clip duration to 8 bars'
  },
  {
    key: '9',
    action: 'setDuration9',
    description: 'Set clip duration to 9 bars'
  },
  {
    key: ',',
    action: 'trimStart',
    description: 'Trim clip start by snap value'
  },
  {
    key: '.',
    action: 'trimEnd',
    description: 'Trim clip end by snap value'
  },
  {
    key: '+',
    action: 'adjustTempoUp',
    description: 'Increase tempo'
  },
  {
    key: '-',
    action: 'adjustTempoDown',
    description: 'Decrease tempo'
  },

  // View
  {
    key: 'f',
    action: 'frameSelection',
    description: 'Frame selection (zoom to fit selected clips)'
  },
  {
    key: 'a',
    action: 'frameAll',
    description: 'Frame all (zoom to fit entire arrangement)'
  },

  // Undo/Redo (Cmd+Z on Mac, Ctrl+Z on Windows/Linux)
  {
    key: 'z',
    ctrlKey: true, // Will match Cmd on Mac, Ctrl on Windows/Linux
    action: 'undo',
    description: 'Undo'
  },
  {
    key: 'z',
    ctrlKey: true, // Will match Cmd on Mac, Ctrl on Windows/Linux
    shiftKey: true,
    action: 'redo',
    description: 'Redo'
  },

  // Navigation (plain arrow keys - must come AFTER Shift+Arrow shortcuts for proper priority)
  {
    key: 'ArrowUp',
    action: 'navigateUp',
    description: 'Navigate up / to clip above'
  },
  {
    key: 'ArrowDown',
    action: 'navigateDown',
    description: 'Navigate down / to clip below'
  },
  {
    key: 'ArrowLeft',
    action: 'navigateLeft',
    description: 'Navigate to clip on left'
  },
  {
    key: 'ArrowRight',
    action: 'navigateRight',
    description: 'Navigate to clip on right'
  },

  // Zoom
  {
    key: '[',
    action: 'zoomOut',
    description: 'Zoom out'
  },
  {
    key: ']',
    action: 'zoomIn',
    description: 'Zoom in'
  },
  {
    key: '{',
    ctrlKey: true,
    shiftKey: true,
    action: 'verticalZoomOut',
    description: 'Decrease lane height (Ctrl+Shift+[)'
  },
  {
    key: '}',
    ctrlKey: true,
    shiftKey: true,
    action: 'verticalZoomIn',
    description: 'Increase lane height (Ctrl+Shift+])'
  },

  // Playback
  {
    key: ' ',
    action: 'togglePlay',
    description: 'Play/Pause'
  },

  // Minimap
  {
    key: 'n',
    action: 'toggleMinimap',
    description: 'Toggle minimap visibility'
  },

  // Help and Settings
  {
    key: '/',
    shiftKey: true,
    action: 'help',
    description: 'Show help'
  },
  {
    key: ',',
    ctrlKey: true,
    action: 'settings',
    description: 'Open settings'
  },
  {
    key: 'p',
    ctrlKey: true,
    shiftKey: true,
    action: 'commandPalette',
    description: 'Open command palette'
  },
  {
    key: 'F12',
    action: 'commandPalette',
    description: 'Open command palette'
  },
  {
    key: '.',
    ctrlKey: true,
    action: 'toggleSongDataViewer',
    description: 'Toggle song data viewer'
  },
];
