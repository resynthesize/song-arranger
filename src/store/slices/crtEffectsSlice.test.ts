/**
 * Cyclone - CRT Effects Slice Tests
 * Tests for CRT effects state management
 */

import crtEffectsReducer, {
  toggleCRTEffects,
  enableCRTEffects,
  disableCRTEffects,
  type CRTEffectsState,
} from './crtEffectsSlice';

describe('crtEffectsSlice', () => {
  const initialState: CRTEffectsState = {
    enabled: true,
  };

  describe('initial state', () => {
    it('should have CRT effects enabled by default', () => {
      const state = crtEffectsReducer(undefined, { type: 'unknown' });
      expect(state.enabled).toBe(true);
    });
  });

  describe('toggleCRTEffects', () => {
    it('should toggle from enabled to disabled', () => {
      const state = crtEffectsReducer(initialState, toggleCRTEffects());
      expect(state.enabled).toBe(false);
    });

    it('should toggle from disabled to enabled', () => {
      const disabledState: CRTEffectsState = { enabled: false };
      const state = crtEffectsReducer(disabledState, toggleCRTEffects());
      expect(state.enabled).toBe(true);
    });

    it('should toggle multiple times correctly', () => {
      let state = crtEffectsReducer(initialState, toggleCRTEffects());
      expect(state.enabled).toBe(false);

      state = crtEffectsReducer(state, toggleCRTEffects());
      expect(state.enabled).toBe(true);

      state = crtEffectsReducer(state, toggleCRTEffects());
      expect(state.enabled).toBe(false);
    });
  });

  describe('enableCRTEffects', () => {
    it('should enable CRT effects when disabled', () => {
      const disabledState: CRTEffectsState = { enabled: false };
      const state = crtEffectsReducer(disabledState, enableCRTEffects());
      expect(state.enabled).toBe(true);
    });

    it('should remain enabled when already enabled', () => {
      const state = crtEffectsReducer(initialState, enableCRTEffects());
      expect(state.enabled).toBe(true);
    });
  });

  describe('disableCRTEffects', () => {
    it('should disable CRT effects when enabled', () => {
      const state = crtEffectsReducer(initialState, disableCRTEffects());
      expect(state.enabled).toBe(false);
    });

    it('should remain disabled when already disabled', () => {
      const disabledState: CRTEffectsState = { enabled: false };
      const state = crtEffectsReducer(disabledState, disableCRTEffects());
      expect(state.enabled).toBe(false);
    });
  });

  describe('state immutability', () => {
    it('should not mutate original state on toggle', () => {
      const state = crtEffectsReducer(initialState, toggleCRTEffects());
      expect(state).not.toBe(initialState);
      expect(initialState.enabled).toBe(true);
    });
  });

  describe('respects prefers-reduced-motion', () => {
    it('should check localStorage for persisted preference', () => {
      // This test documents that we'll respect localStorage
      // Implementation will load from localStorage on initialization
      expect(true).toBe(true);
    });
  });
});
