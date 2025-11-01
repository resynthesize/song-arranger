/**
 * Cyclone - Keyboard Shortcuts Utilities
 * Functions for matching, filtering, and formatting shortcuts
 */

import type { KeyboardShortcut, KeyboardContext, KeyboardAction } from './types';
import { ALL_SHORTCUTS } from './shortcuts';

/**
 * Check if the platform is Mac
 */
const isMac = () => {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
};

/**
 * Check if a keyboard event matches a shortcut
 * On Mac: ctrlKey in shortcut definition matches Cmd key (metaKey)
 * On Windows/Linux: ctrlKey in shortcut definition matches Ctrl key (ctrlKey)
 */
export const matchesShortcut = (
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean => {
  // Check key match
  if (event.key !== shortcut.key) {
    return false;
  }

  // Platform-specific modifier matching
  // On Mac, shortcuts with ctrlKey should match Cmd (metaKey)
  // On Windows/Linux, shortcuts with ctrlKey should match Ctrl (ctrlKey)
  const isMacPlatform = isMac();

  if (shortcut.ctrlKey) {
    // On Mac: check metaKey (Cmd), on others: check ctrlKey (Ctrl)
    const hasCorrectModifier = isMacPlatform ? event.metaKey : event.ctrlKey;
    if (!hasCorrectModifier) {
      return false;
    }
    // Ensure the other modifier is not pressed
    const hasWrongModifier = isMacPlatform ? event.ctrlKey : event.metaKey;
    if (hasWrongModifier) {
      return false;
    }
  } else {
    // No ctrl/meta required - ensure neither is pressed
    if (event.ctrlKey || event.metaKey) {
      return false;
    }
  }

  // Check other modifiers normally
  if (!!shortcut.shiftKey !== event.shiftKey) {
    return false;
  }
  if (!!shortcut.altKey !== event.altKey) {
    return false;
  }

  // metaKey in shortcut definition is checked separately (for explicit Cmd shortcuts)
  if (shortcut.metaKey !== undefined && !!shortcut.metaKey !== event.metaKey) {
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
    'zoomIn', 'zoomOut', 'verticalZoomIn', 'verticalZoomOut',
    'togglePlay', 'toggleMinimap', 'undo', 'redo',
    'navigateUp', 'navigateDown', 'navigateLeft', 'navigateRight', 'help', 'settings',
    'commandPalette', 'toggleSongDataViewer', 'stop', 'jumpToStart', 'jumpToEnd',
    'movePlayheadLeft', 'movePlayheadRight',
    'movePlayheadPrevClip', 'movePlayheadNextClip',
    'adjustTempoUp', 'adjustTempoDown', 'frameAll',
    'addLane', 'addClip', 'deleteLane', 'moveLaneUp', 'moveLaneDown', 'openTrackSettings'
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
      'setDuration9', 'trimStart', 'trimEnd', 'frameSelection',
      'toggleMute', 'togglePatternType'
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
