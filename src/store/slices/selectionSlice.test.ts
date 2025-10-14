/**
 * Cyclone - Selection Slice Tests
 * Tests for selection Redux reducer
 */

import reducer, {
  selectPattern,
  deselectPattern,
  togglePatternSelection,
  selectMultiplePatterns,
  clearSelection,
} from './selectionSlice';
import type { SelectionState } from '@/types';

describe('selectionSlice', () => {
  const initialState: SelectionState = {
    selectedPatternIds: [],
    currentTrackId: null,
  };

  const stateWithSelection: SelectionState = {
    selectedPatternIds: ['pattern-1', 'pattern-2', 'pattern-3'],
    currentTrackId: null,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('selectPattern', () => {
    it('should select a pattern (replacing existing selection)', () => {
      const newState = reducer(initialState, selectPattern('pattern-1'));
      expect(newState.selectedPatternIds).toEqual(['pattern-1']);
    });

    it('should replace existing selection', () => {
      const newState = reducer(stateWithSelection, selectPattern('pattern-4'));
      expect(newState.selectedPatternIds).toEqual(['pattern-4']);
    });

    it('should not add duplicates', () => {
      const state: SelectionState = { selectedPatternIds: ['pattern-1'], currentTrackId: null };
      const newState = reducer(state, selectPattern('pattern-1'));
      expect(newState.selectedPatternIds).toEqual(['pattern-1']);
    });
  });

  describe('deselectPattern', () => {
    it('should remove pattern from selection', () => {
      const newState = reducer(stateWithSelection, deselectPattern('pattern-2'));
      expect(newState.selectedPatternIds).toEqual(['pattern-1', 'pattern-3']);
    });

    it('should do nothing if pattern not in selection', () => {
      const newState = reducer(stateWithSelection, deselectPattern('pattern-4'));
      expect(newState.selectedPatternIds).toEqual(['pattern-1', 'pattern-2', 'pattern-3']);
    });

    it('should handle empty selection', () => {
      const newState = reducer(initialState, deselectPattern('pattern-1'));
      expect(newState.selectedPatternIds).toEqual([]);
    });
  });

  describe('togglePatternSelection', () => {
    it('should add pattern if not selected', () => {
      const newState = reducer(stateWithSelection, togglePatternSelection('pattern-4'));
      expect(newState.selectedPatternIds).toEqual([
        'pattern-1',
        'pattern-2',
        'pattern-3',
        'pattern-4',
      ]);
    });

    it('should remove pattern if already selected', () => {
      const newState = reducer(stateWithSelection, togglePatternSelection('pattern-2'));
      expect(newState.selectedPatternIds).toEqual(['pattern-1', 'pattern-3']);
    });

    it('should work with empty selection', () => {
      const newState = reducer(initialState, togglePatternSelection('pattern-1'));
      expect(newState.selectedPatternIds).toEqual(['pattern-1']);
    });
  });

  describe('selectMultiplePatterns', () => {
    it('should select multiple patterns (replacing existing selection)', () => {
      const newState = reducer(
        initialState,
        selectMultiplePatterns(['pattern-1', 'pattern-2'])
      );
      expect(newState.selectedPatternIds).toEqual(['pattern-1', 'pattern-2']);
    });

    it('should replace existing selection', () => {
      const newState = reducer(
        stateWithSelection,
        selectMultiplePatterns(['pattern-4', 'pattern-5'])
      );
      expect(newState.selectedPatternIds).toEqual(['pattern-4', 'pattern-5']);
    });

    it('should remove duplicates', () => {
      const newState = reducer(
        initialState,
        selectMultiplePatterns(['pattern-1', 'pattern-2', 'pattern-1', 'pattern-3'])
      );
      expect(newState.selectedPatternIds).toEqual(['pattern-1', 'pattern-2', 'pattern-3']);
    });

    it('should handle empty array', () => {
      const newState = reducer(stateWithSelection, selectMultiplePatterns([]));
      expect(newState.selectedPatternIds).toEqual([]);
    });
  });

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      const newState = reducer(stateWithSelection, clearSelection());
      expect(newState.selectedPatternIds).toEqual([]);
    });

    it('should work with empty selection', () => {
      const newState = reducer(initialState, clearSelection());
      expect(newState.selectedPatternIds).toEqual([]);
    });
  });

  describe('current track selection', () => {
    it('should set current track', () => {
      const newState = reducer(initialState, { type: 'selection/setCurrentTrack', payload: 'track-1' });
      expect(newState.currentTrackId).toBe('track-1');
    });

    it('should change current track', () => {
      const state = { ...initialState, currentTrackId: 'track-1' };
      const newState = reducer(state, { type: 'selection/setCurrentTrack', payload: 'track-2' });
      expect(newState.currentTrackId).toBe('track-2');
    });

    it('should clear current track', () => {
      const state = { ...initialState, currentTrackId: 'track-1' };
      const newState = reducer(state, { type: 'selection/clearCurrentTrack' });
      expect(newState.currentTrackId).toBeNull();
    });

    it('should navigate to next track', () => {
      const tracks = ['track-1', 'track-2', 'track-3'];
      const state = { ...initialState, currentTrackId: 'track-1' };
      const newState = reducer(state, { type: 'selection/navigateDown', payload: tracks });
      expect(newState.currentTrackId).toBe('track-2');
    });

    it('should navigate to previous track', () => {
      const tracks = ['track-1', 'track-2', 'track-3'];
      const state = { ...initialState, currentTrackId: 'track-2' };
      const newState = reducer(state, { type: 'selection/navigateUp', payload: tracks });
      expect(newState.currentTrackId).toBe('track-1');
    });

    it('should not navigate past first track', () => {
      const tracks = ['track-1', 'track-2', 'track-3'];
      const state = { ...initialState, currentTrackId: 'track-1' };
      const newState = reducer(state, { type: 'selection/navigateUp', payload: tracks });
      expect(newState.currentTrackId).toBe('track-1');
    });

    it('should not navigate past last track', () => {
      const tracks = ['track-1', 'track-2', 'track-3'];
      const state = { ...initialState, currentTrackId: 'track-3' };
      const newState = reducer(state, { type: 'selection/navigateDown', payload: tracks });
      expect(newState.currentTrackId).toBe('track-3');
    });

    it('should select first track when navigating down with no current track', () => {
      const tracks = ['track-1', 'track-2', 'track-3'];
      const newState = reducer(initialState, { type: 'selection/navigateDown', payload: tracks });
      expect(newState.currentTrackId).toBe('track-1');
    });

    it('should select last track when navigating up with no current track', () => {
      const tracks = ['track-1', 'track-2', 'track-3'];
      const newState = reducer(initialState, { type: 'selection/navigateUp', payload: tracks });
      expect(newState.currentTrackId).toBe('track-3');
    });

    it('should clear current track when a pattern is selected', () => {
      const state = { ...initialState, currentTrackId: 'track-1' };
      const newState = reducer(state, selectPattern('pattern-1'));
      expect(newState.currentTrackId).toBeNull();
      expect(newState.selectedPatternIds).toEqual(['pattern-1']);
    });
  });
});
