/**
 * Song Arranger - Keyboard Handler Tests
 * Tests for keyboard shortcut system with context awareness
 */

import {
  type KeyboardShortcut,
  type KeyboardContext,
  matchesShortcut,
  getShortcutsForContext,
  formatShortcut,
} from './keyboard';

describe('keyboard utils', () => {
  describe('matchesShortcut', () => {
    it('should match simple key press', () => {
      const event = new KeyboardEvent('keydown', { key: 'd' });
      const shortcut: KeyboardShortcut = { key: 'd', action: 'duplicate' };

      expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should match key with ctrl modifier', () => {
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      const shortcut: KeyboardShortcut = {
        key: 'z',
        ctrlKey: true,
        action: 'undo'
      };

      expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should match key with ctrl and shift modifiers', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true
      });
      const shortcut: KeyboardShortcut = {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        action: 'redo'
      };

      expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should not match if modifier is required but not pressed', () => {
      const event = new KeyboardEvent('keydown', { key: 'z' });
      const shortcut: KeyboardShortcut = {
        key: 'z',
        ctrlKey: true,
        action: 'undo'
      };

      expect(matchesShortcut(event, shortcut)).toBe(false);
    });

    it('should not match if wrong key is pressed', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      const shortcut: KeyboardShortcut = { key: 'd', action: 'duplicate' };

      expect(matchesShortcut(event, shortcut)).toBe(false);
    });

    it('should match Delete key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      const shortcut: KeyboardShortcut = { key: 'Delete', action: 'delete' };

      expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should match Backspace key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      const shortcut: KeyboardShortcut = { key: 'Backspace', action: 'delete' };

      expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should match bracket keys', () => {
      const event1 = new KeyboardEvent('keydown', { key: '[' });
      const shortcut1: KeyboardShortcut = { key: '[', action: 'zoomOut' };
      expect(matchesShortcut(event1, shortcut1)).toBe(true);

      const event2 = new KeyboardEvent('keydown', { key: ']' });
      const shortcut2: KeyboardShortcut = { key: ']', action: 'zoomIn' };
      expect(matchesShortcut(event2, shortcut2)).toBe(true);
    });

    it('should match arrow keys', () => {
      const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const shortcutUp: KeyboardShortcut = { key: 'ArrowUp', action: 'navigateUp' };
      expect(matchesShortcut(eventUp, shortcutUp)).toBe(true);

      const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const shortcutDown: KeyboardShortcut = { key: 'ArrowDown', action: 'navigateDown' };
      expect(matchesShortcut(eventDown, shortcutDown)).toBe(true);
    });
  });

  describe('getShortcutsForContext', () => {
    it('should return default shortcuts when no clips selected', () => {
      const context: KeyboardContext = {
        hasSelection: false,
        selectionCount: 0,
        isEditing: false,
      };

      const shortcuts = getShortcutsForContext(context);

      // Should not include clip-specific shortcuts
      expect(shortcuts.find(s => s.action === 'delete')).toBeUndefined();
      expect(shortcuts.find(s => s.action === 'duplicate')).toBeUndefined();

      // Should include global shortcuts
      expect(shortcuts.find(s => s.action === 'zoomIn')).toBeDefined();
      expect(shortcuts.find(s => s.action === 'zoomOut')).toBeDefined();
    });

    it('should return clip shortcuts when clips selected', () => {
      const context: KeyboardContext = {
        hasSelection: true,
        selectionCount: 1,
        isEditing: false,
      };

      const shortcuts = getShortcutsForContext(context);

      // Should include clip-specific shortcuts
      expect(shortcuts.find(s => s.action === 'delete')).toBeDefined();
      expect(shortcuts.find(s => s.action === 'duplicate')).toBeDefined();
      expect(shortcuts.find(s => s.action === 'edit')).toBeDefined();
      expect(shortcuts.find(s => s.action === 'changeColor')).toBeDefined();
    });

    it('should exclude editing shortcuts when editing', () => {
      const context: KeyboardContext = {
        hasSelection: true,
        selectionCount: 1,
        isEditing: true,
      };

      const shortcuts = getShortcutsForContext(context);

      // Should not include shortcuts that conflict with text editing
      expect(shortcuts.find(s => s.action === 'duplicate')).toBeUndefined();
      expect(shortcuts.find(s => s.action === 'edit')).toBeUndefined();
    });

    it('should include navigation shortcuts in all contexts', () => {
      const contexts: KeyboardContext[] = [
        { hasSelection: false, selectionCount: 0, isEditing: false },
        { hasSelection: true, selectionCount: 1, isEditing: false },
        { hasSelection: true, selectionCount: 1, isEditing: true },
      ];

      contexts.forEach(context => {
        const shortcuts = getShortcutsForContext(context);
        expect(shortcuts.find(s => s.action === 'navigateUp')).toBeDefined();
        expect(shortcuts.find(s => s.action === 'navigateDown')).toBeDefined();
      });
    });
  });

  describe('formatShortcut', () => {
    it('should format simple key', () => {
      const shortcut: KeyboardShortcut = { key: 'd', action: 'duplicate' };
      expect(formatShortcut(shortcut)).toBe('D');
    });

    it('should format key with Ctrl modifier', () => {
      const shortcut: KeyboardShortcut = {
        key: 'z',
        ctrlKey: true,
        action: 'undo'
      };
      expect(formatShortcut(shortcut)).toBe('Ctrl+Z');
    });

    it('should format key with Ctrl and Shift modifiers', () => {
      const shortcut: KeyboardShortcut = {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        action: 'redo'
      };
      expect(formatShortcut(shortcut)).toBe('Ctrl+Shift+Z');
    });

    it('should format special keys', () => {
      expect(formatShortcut({ key: 'Delete', action: 'delete' })).toBe('DEL');
      expect(formatShortcut({ key: 'Backspace', action: 'delete' })).toBe('BKSP');
      expect(formatShortcut({ key: 'ArrowUp', action: 'navigateUp' })).toBe('\u2191');
      expect(formatShortcut({ key: 'ArrowDown', action: 'navigateDown' })).toBe('\u2193');
      expect(formatShortcut({ key: ' ', action: 'togglePlay' })).toBe('SPACE');
    });

    it('should format bracket keys', () => {
      expect(formatShortcut({ key: '[', action: 'zoomOut' })).toBe('[');
      expect(formatShortcut({ key: ']', action: 'zoomIn' })).toBe(']');
    });
  });
});
