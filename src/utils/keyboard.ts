/**
 * Song Arranger - Keyboard Shortcuts System
 * Context-aware keyboard shortcut handling
 */

/**
 * Keyboard action types
 */
export type KeyboardAction =
  | 'delete'
  | 'duplicate'
  | 'edit'
  | 'changeColor'
  | 'undo'
  | 'redo'
  | 'navigateUp'
  | 'navigateDown'
  | 'zoomIn'
  | 'zoomOut'
  | 'togglePlay'
  | 'help';

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
    key: 'e',
    action: 'edit',
    description: 'Edit clip label'
  },
  {
    key: 'c',
    action: 'changeColor',
    description: 'Change clip color'
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

  // Help
  {
    key: '?',
    action: 'help',
    description: 'Show help'
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

  // Always include global shortcuts
  shortcuts.push(
    ...ALL_SHORTCUTS.filter(s =>
      s.action === 'zoomIn' ||
      s.action === 'zoomOut' ||
      s.action === 'togglePlay' ||
      s.action === 'undo' ||
      s.action === 'redo' ||
      s.action === 'navigateUp' ||
      s.action === 'navigateDown' ||
      s.action === 'help'
    )
  );

  // Add clip-specific shortcuts if clips are selected
  if (context.hasSelection && !context.isEditing) {
    shortcuts.push(
      ...ALL_SHORTCUTS.filter(s =>
        s.action === 'delete' ||
        s.action === 'duplicate' ||
        s.action === 'edit' ||
        s.action === 'changeColor'
      )
    );
  }

  // When editing, exclude shortcuts that conflict with text input
  if (context.isEditing) {
    return shortcuts.filter(s =>
      s.action !== 'duplicate' &&
      s.action !== 'edit' &&
      s.action !== 'changeColor'
    );
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
