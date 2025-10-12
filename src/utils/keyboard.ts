/**
 * Song Arranger - Keyboard Shortcuts System
 * Context-aware keyboard shortcut handling
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
  | 'zoomIn'
  | 'zoomOut'
  | 'togglePlay'
  | 'help'
  | 'settings'
  | 'commandPalette';

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

/**
 * All available keyboard shortcuts
 */
const ALL_SHORTCUTS: KeyboardShortcut[] = [
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
    key: 's',
    action: 'split',
    description: 'Split clip at playhead'
  },
  {
    key: 'j',
    action: 'join',
    description: 'Join adjacent selected clips'
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

  // Undo/Redo
  {
    key: 'z',
    ctrlKey: true,
    action: 'undo',
    description: 'Undo'
  },
  {
    key: 'z',
    ctrlKey: true,
    shiftKey: true,
    action: 'redo',
    description: 'Redo'
  },

  // Navigation
  {
    key: 'ArrowUp',
    action: 'navigateUp',
    description: 'Navigate up'
  },
  {
    key: 'ArrowDown',
    action: 'navigateDown',
    description: 'Navigate down'
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

  // Playback
  {
    key: ' ',
    action: 'togglePlay',
    description: 'Play/Pause'
  },

  // Help and Settings
  {
    key: '?',
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
];

/**
 * Check if a keyboard event matches a shortcut
 */
export const matchesShortcut = (
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean => {
  // Check key match
  if (event.key !== shortcut.key) {
    return false;
  }

  // Check modifiers
  if (!!shortcut.ctrlKey !== event.ctrlKey) {
    return false;
  }
  if (!!shortcut.shiftKey !== event.shiftKey) {
    return false;
  }
  if (!!shortcut.altKey !== event.altKey) {
    return false;
  }
  if (!!shortcut.metaKey !== event.metaKey) {
    return false;
  }

  return true;
};

/**
 * Get available shortcuts for a given context
 */
export const getShortcutsForContext = (
  context: KeyboardContext
): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  // Global shortcuts (always available)
  const globalActions: KeyboardAction[] = [
    'zoomIn', 'zoomOut', 'togglePlay', 'undo', 'redo',
    'navigateUp', 'navigateDown', 'help', 'settings',
    'commandPalette', 'stop', 'jumpToStart', 'jumpToEnd',
    'movePlayheadLeft', 'movePlayheadRight',
    'movePlayheadPrevClip', 'movePlayheadNextClip',
    'adjustTempoUp', 'adjustTempoDown', 'frameAll'
  ];

  shortcuts.push(...ALL_SHORTCUTS.filter(s => globalActions.includes(s.action)));

  // Selection shortcuts (when not editing)
  if (!context.isEditing) {
    shortcuts.push(...ALL_SHORTCUTS.filter(s =>
      s.action === 'selectAll' || s.action === 'deselectAll'
    ));
  }

  // Clip-specific shortcuts (require selection and not editing)
  if (context.hasSelection && !context.isEditing) {
    const clipActions: KeyboardAction[] = [
      'delete', 'duplicate', 'duplicateOffset', 'edit', 'changeColor',
      'split', 'join', 'cycleForward', 'cycleBackward',
      'setDuration1', 'setDuration2', 'setDuration3', 'setDuration4',
      'setDuration5', 'setDuration6', 'setDuration7', 'setDuration8',
      'setDuration9', 'trimStart', 'trimEnd', 'frameSelection'
    ];
    shortcuts.push(...ALL_SHORTCUTS.filter(s => clipActions.includes(s.action)));
  }

  // When editing, exclude shortcuts that use alphanumeric keys without modifiers
  if (context.isEditing) {
    return shortcuts.filter(s => {
      // Allow global shortcuts with modifiers (Ctrl+Z, Ctrl+Shift+Z, etc.)
      if (s.ctrlKey || s.metaKey) return true;

      // Exclude shortcuts that use alphanumeric keys or symbols without modifiers
      const excludedKeys = /^[a-z0-9,.\-+]$/i;
      return !excludedKeys.test(s.key);
    });
  }

  return shortcuts;
};

/**
 * Format a shortcut for display
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];

  // Add modifiers
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.metaKey) parts.push('Cmd');

  // Format key
  let keyStr = shortcut.key;

  // Special key formatting
  switch (shortcut.key) {
    case 'Delete':
      keyStr = 'DEL';
      break;
    case 'Backspace':
      keyStr = 'BKSP';
      break;
    case 'ArrowUp':
      keyStr = '\u2191'; // ↑
      break;
    case 'ArrowDown':
      keyStr = '\u2193'; // ↓
      break;
    case ' ':
      keyStr = 'SPACE';
      break;
    default:
      // Uppercase letters
      if (keyStr.length === 1 && keyStr.match(/[a-z]/)) {
        keyStr = keyStr.toUpperCase();
      }
  }

  parts.push(keyStr);

  return parts.join('+');
};

/**
 * Find a matching shortcut for a keyboard event in the given context
 */
export const findMatchingShortcut = (
  event: KeyboardEvent,
  context: KeyboardContext
): KeyboardShortcut | undefined => {
  const availableShortcuts = getShortcutsForContext(context);
  return availableShortcuts.find(shortcut => matchesShortcut(event, shortcut));
};

/**
 * Get all shortcuts (for documentation)
 */
export const getAllShortcuts = (): KeyboardShortcut[] => {
  return [...ALL_SHORTCUTS];
};
