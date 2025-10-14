/**
 * Song Arranger - Theme Slice Tests
 * Tests for theme management Redux slice
 */

import themeReducer, {
  setTheme,
  toggleTheme,
  type ThemeState,
} from './themeSlice';

describe('themeSlice', () => {
  const initialState: ThemeState = {
    current: 'modern',
  };

  describe('initial state', () => {
    it('should have modern theme as default', () => {
      const state = themeReducer(undefined, { type: 'unknown' });
      expect(state.current).toBe('modern');
    });
  });

  describe('setTheme', () => {
    it('should set theme to retro', () => {
      const state = themeReducer(initialState, setTheme('retro'));
      expect(state.current).toBe('retro');
    });

    it('should set theme to modern', () => {
      const retroState: ThemeState = { current: 'retro' };
      const state = themeReducer(retroState, setTheme('modern'));
      expect(state.current).toBe('modern');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from modern to retro', () => {
      const state = themeReducer(initialState, toggleTheme());
      expect(state.current).toBe('retro');
    });

    it('should toggle from retro to modern', () => {
      const retroState: ThemeState = { current: 'retro' };
      const state = themeReducer(retroState, toggleTheme());
      expect(state.current).toBe('modern');
    });

    it('should toggle back and forth multiple times', () => {
      let state = initialState;

      state = themeReducer(state, toggleTheme());
      expect(state.current).toBe('retro');

      state = themeReducer(state, toggleTheme());
      expect(state.current).toBe('modern');

      state = themeReducer(state, toggleTheme());
      expect(state.current).toBe('retro');
    });
  });
});
