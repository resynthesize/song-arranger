/**
 * QuickInput Slice Tests
 * Redux state management for quick input modal
 */

import quickInputReducer, {
  openQuickInput,
  closeQuickInput,
  type QuickInputState,
} from './quickInputSlice';

describe('quickInputSlice', () => {
  const initialState: QuickInputState = {
    isOpen: false,
    command: null,
  };

  it('should return the initial state', () => {
    expect(quickInputReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('openQuickInput', () => {
    it('should open quick input with tempo command', () => {
      const actual = quickInputReducer(initialState, openQuickInput('tempo'));
      expect(actual.isOpen).toBe(true);
      expect(actual.command).toBe('tempo');
    });

    it('should open quick input with zoom command', () => {
      const actual = quickInputReducer(initialState, openQuickInput('zoom'));
      expect(actual.isOpen).toBe(true);
      expect(actual.command).toBe('zoom');
    });

    it('should open quick input with snap command', () => {
      const actual = quickInputReducer(initialState, openQuickInput('snap'));
      expect(actual.isOpen).toBe(true);
      expect(actual.command).toBe('snap');
    });

    it('should open quick input with length command', () => {
      const actual = quickInputReducer(initialState, openQuickInput('length'));
      expect(actual.isOpen).toBe(true);
      expect(actual.command).toBe('length');
    });

    it('should open quick input with position command', () => {
      const actual = quickInputReducer(initialState, openQuickInput('position'));
      expect(actual.isOpen).toBe(true);
      expect(actual.command).toBe('position');
    });

    it('should replace existing command when opening', () => {
      const stateWithTempo = quickInputReducer(initialState, openQuickInput('tempo'));
      const actual = quickInputReducer(stateWithTempo, openQuickInput('zoom'));
      expect(actual.isOpen).toBe(true);
      expect(actual.command).toBe('zoom');
    });
  });

  describe('closeQuickInput', () => {
    it('should close quick input', () => {
      const openState = quickInputReducer(initialState, openQuickInput('tempo'));
      const actual = quickInputReducer(openState, closeQuickInput());
      expect(actual.isOpen).toBe(false);
      expect(actual.command).toBeNull();
    });

    it('should do nothing if already closed', () => {
      const actual = quickInputReducer(initialState, closeQuickInput());
      expect(actual.isOpen).toBe(false);
      expect(actual.command).toBeNull();
    });
  });
});
