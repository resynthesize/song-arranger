/**
 * Song Arranger - Lanes Slice Tests
 * Tests for lanes Redux reducer
 */

import reducer, {
  addLane,
  removeLane,
  renameLane,
  setEditingLane,
  clearEditingLane,
} from './lanesSlice';
import type { LanesState } from '@/types';

describe('lanesSlice', () => {
  const initialState: LanesState = {
    lanes: [],
    editingLaneId: null,
  };

  const stateWithLanes: LanesState = {
    lanes: [
      { id: 'lane-1', name: 'Kick' },
      { id: 'lane-2', name: 'Snare' },
      { id: 'lane-3', name: 'Hi-Hat' },
    ],
    editingLaneId: null,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('addLane', () => {
    it('should add a new lane with provided name', () => {
      const newState = reducer(initialState, addLane({ name: 'Bass' }));
      expect(newState.lanes).toHaveLength(1);
      expect(newState.lanes[0]?.name).toBe('Bass');
      expect(newState.lanes[0]?.id).toBeDefined();
    });

    it('should add a new lane with default name if not provided', () => {
      const newState = reducer(initialState, addLane({}));
      expect(newState.lanes).toHaveLength(1);
      expect(newState.lanes[0]?.name).toBe('Lane 1');
    });

    it('should increment default lane names', () => {
      let state = reducer(initialState, addLane({}));
      state = reducer(state, addLane({}));
      state = reducer(state, addLane({}));
      expect(state.lanes[0]?.name).toBe('Lane 1');
      expect(state.lanes[1]?.name).toBe('Lane 2');
      expect(state.lanes[2]?.name).toBe('Lane 3');
    });

    it('should add lanes to the end', () => {
      const newState = reducer(stateWithLanes, addLane({ name: 'Lead' }));
      expect(newState.lanes).toHaveLength(4);
      expect(newState.lanes[3]?.name).toBe('Lead');
    });
  });

  describe('removeLane', () => {
    it('should remove lane by id', () => {
      const newState = reducer(stateWithLanes, removeLane('lane-2'));
      expect(newState.lanes).toHaveLength(2);
      expect(newState.lanes.find((l) => l.id === 'lane-2')).toBeUndefined();
      expect(newState.lanes[0]?.id).toBe('lane-1');
      expect(newState.lanes[1]?.id).toBe('lane-3');
    });

    it('should do nothing if lane not found', () => {
      const newState = reducer(stateWithLanes, removeLane('non-existent'));
      expect(newState.lanes).toHaveLength(3);
    });

    it('should clear editing state if removed lane was being edited', () => {
      const editingState = { ...stateWithLanes, editingLaneId: 'lane-2' };
      const newState = reducer(editingState, removeLane('lane-2'));
      expect(newState.editingLaneId).toBeNull();
    });
  });

  describe('renameLane', () => {
    it('should rename lane by id', () => {
      const newState = reducer(
        stateWithLanes,
        renameLane({ laneId: 'lane-2', name: 'Clap' })
      );
      expect(newState.lanes[1]?.name).toBe('Clap');
    });

    it('should trim whitespace from name', () => {
      const newState = reducer(
        stateWithLanes,
        renameLane({ laneId: 'lane-1', name: '  Kick Drum  ' })
      );
      expect(newState.lanes[0]?.name).toBe('Kick Drum');
    });

    it('should not rename if empty string after trimming', () => {
      const newState = reducer(
        stateWithLanes,
        renameLane({ laneId: 'lane-1', name: '   ' })
      );
      expect(newState.lanes[0]?.name).toBe('Kick');
    });

    it('should do nothing if lane not found', () => {
      const newState = reducer(
        stateWithLanes,
        renameLane({ laneId: 'non-existent', name: 'Test' })
      );
      expect(newState.lanes).toEqual(stateWithLanes.lanes);
    });
  });

  describe('editing state', () => {
    it('should set editing lane id', () => {
      const newState = reducer(stateWithLanes, setEditingLane('lane-2'));
      expect(newState.editingLaneId).toBe('lane-2');
    });

    it('should clear editing lane id', () => {
      const editingState = { ...stateWithLanes, editingLaneId: 'lane-2' };
      const newState = reducer(editingState, clearEditingLane());
      expect(newState.editingLaneId).toBeNull();
    });
  });
});
