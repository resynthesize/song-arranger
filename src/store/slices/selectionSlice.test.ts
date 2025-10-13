/**
 * Song Arranger - Selection Slice Tests
 * Tests for selection Redux reducer
 */

import reducer, {
  selectClip,
  deselectClip,
  toggleClipSelection,
  selectMultipleClips,
  clearSelection,
} from './selectionSlice';
import type { SelectionState } from '@/types';

describe('selectionSlice', () => {
  const initialState: SelectionState = {
    selectedClipIds: [],
    currentLaneId: null,
  };

  const stateWithSelection: SelectionState = {
    selectedClipIds: ['clip-1', 'clip-2', 'clip-3'],
    currentLaneId: null,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('selectClip', () => {
    it('should select a clip (replacing existing selection)', () => {
      const newState = reducer(initialState, selectClip('clip-1'));
      expect(newState.selectedClipIds).toEqual(['clip-1']);
    });

    it('should replace existing selection', () => {
      const newState = reducer(stateWithSelection, selectClip('clip-4'));
      expect(newState.selectedClipIds).toEqual(['clip-4']);
    });

    it('should not add duplicates', () => {
      const state: SelectionState = { selectedClipIds: ['clip-1'], currentLaneId: null };
      const newState = reducer(state, selectClip('clip-1'));
      expect(newState.selectedClipIds).toEqual(['clip-1']);
    });
  });

  describe('deselectClip', () => {
    it('should remove clip from selection', () => {
      const newState = reducer(stateWithSelection, deselectClip('clip-2'));
      expect(newState.selectedClipIds).toEqual(['clip-1', 'clip-3']);
    });

    it('should do nothing if clip not in selection', () => {
      const newState = reducer(stateWithSelection, deselectClip('clip-4'));
      expect(newState.selectedClipIds).toEqual(['clip-1', 'clip-2', 'clip-3']);
    });

    it('should handle empty selection', () => {
      const newState = reducer(initialState, deselectClip('clip-1'));
      expect(newState.selectedClipIds).toEqual([]);
    });
  });

  describe('toggleClipSelection', () => {
    it('should add clip if not selected', () => {
      const newState = reducer(stateWithSelection, toggleClipSelection('clip-4'));
      expect(newState.selectedClipIds).toEqual([
        'clip-1',
        'clip-2',
        'clip-3',
        'clip-4',
      ]);
    });

    it('should remove clip if already selected', () => {
      const newState = reducer(stateWithSelection, toggleClipSelection('clip-2'));
      expect(newState.selectedClipIds).toEqual(['clip-1', 'clip-3']);
    });

    it('should work with empty selection', () => {
      const newState = reducer(initialState, toggleClipSelection('clip-1'));
      expect(newState.selectedClipIds).toEqual(['clip-1']);
    });
  });

  describe('selectMultipleClips', () => {
    it('should select multiple clips (replacing existing selection)', () => {
      const newState = reducer(
        initialState,
        selectMultipleClips(['clip-1', 'clip-2'])
      );
      expect(newState.selectedClipIds).toEqual(['clip-1', 'clip-2']);
    });

    it('should replace existing selection', () => {
      const newState = reducer(
        stateWithSelection,
        selectMultipleClips(['clip-4', 'clip-5'])
      );
      expect(newState.selectedClipIds).toEqual(['clip-4', 'clip-5']);
    });

    it('should remove duplicates', () => {
      const newState = reducer(
        initialState,
        selectMultipleClips(['clip-1', 'clip-2', 'clip-1', 'clip-3'])
      );
      expect(newState.selectedClipIds).toEqual(['clip-1', 'clip-2', 'clip-3']);
    });

    it('should handle empty array', () => {
      const newState = reducer(stateWithSelection, selectMultipleClips([]));
      expect(newState.selectedClipIds).toEqual([]);
    });
  });

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      const newState = reducer(stateWithSelection, clearSelection());
      expect(newState.selectedClipIds).toEqual([]);
    });

    it('should work with empty selection', () => {
      const newState = reducer(initialState, clearSelection());
      expect(newState.selectedClipIds).toEqual([]);
    });
  });

  describe('current lane selection', () => {
    it('should set current lane', () => {
      const newState = reducer(initialState, { type: 'selection/setCurrentLane', payload: 'lane-1' });
      expect(newState.currentLaneId).toBe('lane-1');
    });

    it('should change current lane', () => {
      const state = { ...initialState, currentLaneId: 'lane-1' };
      const newState = reducer(state, { type: 'selection/setCurrentLane', payload: 'lane-2' });
      expect(newState.currentLaneId).toBe('lane-2');
    });

    it('should clear current lane', () => {
      const state = { ...initialState, currentLaneId: 'lane-1' };
      const newState = reducer(state, { type: 'selection/clearCurrentLane' });
      expect(newState.currentLaneId).toBeNull();
    });

    it('should navigate to next lane', () => {
      const lanes = ['lane-1', 'lane-2', 'lane-3'];
      const state = { ...initialState, currentLaneId: 'lane-1' };
      const newState = reducer(state, { type: 'selection/navigateDown', payload: lanes });
      expect(newState.currentLaneId).toBe('lane-2');
    });

    it('should navigate to previous lane', () => {
      const lanes = ['lane-1', 'lane-2', 'lane-3'];
      const state = { ...initialState, currentLaneId: 'lane-2' };
      const newState = reducer(state, { type: 'selection/navigateUp', payload: lanes });
      expect(newState.currentLaneId).toBe('lane-1');
    });

    it('should not navigate past first lane', () => {
      const lanes = ['lane-1', 'lane-2', 'lane-3'];
      const state = { ...initialState, currentLaneId: 'lane-1' };
      const newState = reducer(state, { type: 'selection/navigateUp', payload: lanes });
      expect(newState.currentLaneId).toBe('lane-1');
    });

    it('should not navigate past last lane', () => {
      const lanes = ['lane-1', 'lane-2', 'lane-3'];
      const state = { ...initialState, currentLaneId: 'lane-3' };
      const newState = reducer(state, { type: 'selection/navigateDown', payload: lanes });
      expect(newState.currentLaneId).toBe('lane-3');
    });

    it('should select first lane when navigating down with no current lane', () => {
      const lanes = ['lane-1', 'lane-2', 'lane-3'];
      const newState = reducer(initialState, { type: 'selection/navigateDown', payload: lanes });
      expect(newState.currentLaneId).toBe('lane-1');
    });

    it('should select last lane when navigating up with no current lane', () => {
      const lanes = ['lane-1', 'lane-2', 'lane-3'];
      const newState = reducer(initialState, { type: 'selection/navigateUp', payload: lanes });
      expect(newState.currentLaneId).toBe('lane-3');
    });

    it('should clear current lane when a clip is selected', () => {
      const state = { ...initialState, currentLaneId: 'lane-1' };
      const newState = reducer(state, selectClip('clip-1'));
      expect(newState.currentLaneId).toBeNull();
      expect(newState.selectedClipIds).toEqual(['clip-1']);
    });
  });
});
