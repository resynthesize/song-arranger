/**
 * Cyclone - Theme Slice Tests
 * Tests for theme management Redux slice
 */

import themeReducer, {
  setTheme,
  toggleTheme,
  type ThemeState,
} from './themeSlice';

describe('themeSlice', () => {
  const initialState: ThemeState = {
    current: 'retro',
  };

  describe('initial state', () => {
    it('should have modern theme as default', () => {
      const state = themeReducer(undefined, { type: 'unknown' });
      expect(state.current).toBe('modern');
    });
  });

  describe('setTheme', () => {
    it('should set theme to retro', () => {
      const modernState: ThemeState = { current: 'modern' };
      const state = themeReducer(modernState, setTheme('retro'));
      expect(state.current).toBe('retro');
    });

    it('should set theme to modern', () => {
      const state = themeReducer(initialState, setTheme('modern'));
      expect(state.current).toBe('modern');
    });

    it('should set theme to minimalist', () => {
      const state = themeReducer(initialState, setTheme('minimalist'));
      expect(state.current).toBe('minimalist');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from retro to modern', () => {
      const state = themeReducer(initialState, toggleTheme());
      expect(state.current).toBe('modern');
    });

    it('should toggle from modern to minimalist', () => {
      const modernState: ThemeState = { current: 'modern' };
      const state = themeReducer(modernState, toggleTheme());
      expect(state.current).toBe('minimalist');
    });

    it('should toggle from minimalist to retro', () => {
      const minimalistState: ThemeState = { current: 'minimalist' };
      const state = themeReducer(minimalistState, toggleTheme());
      expect(state.current).toBe('retro');
    });

    it('should cycle through all themes', () => {
      let state = initialState;

      // retro -> modern
      state = themeReducer(state, toggleTheme());
      expect(state.current).toBe('modern');

      // modern -> minimalist
      state = themeReducer(state, toggleTheme());
      expect(state.current).toBe('minimalist');

      // minimalist -> retro
      state = themeReducer(state, toggleTheme());
      expect(state.current).toBe('retro');

      // retro -> modern (cycle complete)
      state = themeReducer(state, toggleTheme());
      expect(state.current).toBe('modern');
    });
  });
});
