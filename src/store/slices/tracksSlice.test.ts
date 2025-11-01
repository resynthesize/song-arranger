/**
 * Cyclone - Tracks Slice Tests
 * Tests for tracks Redux reducer
 */

import reducer, {
  addTrack,
  removeTrack,
  renameTrack,
  setEditingTrack,
  clearEditingTrack,
  setTrackColor,
  setTrackHeight,
  toggleTrackCollapse,
} from './tracksSlice';
import type { TracksState } from '@/types';

describe('tracksSlice', () => {
  const initialState: TracksState = {
    tracks: [],
    editingTrackId: null,
    movingTrackId: null,
  };

  const stateWithTracks: TracksState = {
    tracks: [
      { id: 'track-1', name: 'Kick' },
      { id: 'track-2', name: 'Snare' },
      { id: 'track-3', name: 'Hi-Hat' },
    ],
    editingTrackId: null,
    movingTrackId: null,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('addTrack', () => {
    it('should add a new track with provided name', () => {
      const newState = reducer(initialState, addTrack({ name: 'Bass' }));
      expect(newState.tracks).toHaveLength(1);
      expect(newState.tracks[0]?.name).toBe('Bass');
      expect(newState.tracks[0]?.id).toBeDefined();
    });

    it('should add a new track with default name if not provided', () => {
      const newState = reducer(initialState, addTrack({}));
      expect(newState.tracks).toHaveLength(1);
      expect(newState.tracks[0]?.name).toBe('Track 1');
    });

    it('should increment default track names', () => {
      let state = reducer(initialState, addTrack({}));
      state = reducer(state, addTrack({}));
      state = reducer(state, addTrack({}));
      expect(state.tracks[0]?.name).toBe('Track 1');
      expect(state.tracks[1]?.name).toBe('Track 2');
      expect(state.tracks[2]?.name).toBe('Track 3');
    });

    it('should add tracks to the end', () => {
      const newState = reducer(stateWithTracks, addTrack({ name: 'Lead' }));
      expect(newState.tracks).toHaveLength(4);
      expect(newState.tracks[3]?.name).toBe('Lead');
    });
  });

  describe('removeTrack', () => {
    it('should remove track by id', () => {
      const newState = reducer(stateWithTracks, removeTrack('track-2'));
      expect(newState.tracks).toHaveLength(2);
      expect(newState.tracks.find((t) => t.id === 'track-2')).toBeUndefined();
      expect(newState.tracks[0]?.id).toBe('track-1');
      expect(newState.tracks[1]?.id).toBe('track-3');
    });

    it('should do nothing if track not found', () => {
      const newState = reducer(stateWithTracks, removeTrack('non-existent'));
      expect(newState.tracks).toHaveLength(3);
    });

    it('should clear editing state if removed track was being edited', () => {
      const editingState = { ...stateWithTracks, editingTrackId: 'track-2' };
      const newState = reducer(editingState, removeTrack('track-2'));
      expect(newState.editingTrackId).toBeNull();
    });
  });

  describe('renameTrack', () => {
    it('should rename track by id', () => {
      const newState = reducer(
        stateWithTracks,
        renameTrack({ trackId: 'track-2', name: 'Clap' })
      );
      expect(newState.tracks[1]?.name).toBe('Clap');
    });

    it('should trim whitespace from name', () => {
      const newState = reducer(
        stateWithTracks,
        renameTrack({ trackId: 'track-1', name: '  Kick Drum  ' })
      );
      expect(newState.tracks[0]?.name).toBe('Kick Drum');
    });

    it('should not rename if empty string after trimming', () => {
      const newState = reducer(
        stateWithTracks,
        renameTrack({ trackId: 'track-1', name: '   ' })
      );
      expect(newState.tracks[0]?.name).toBe('Kick');
    });

    it('should do nothing if track not found', () => {
      const newState = reducer(
        stateWithTracks,
        renameTrack({ trackId: 'non-existent', name: 'Test' })
      );
      expect(newState.tracks).toEqual(stateWithTracks.tracks);
    });
  });

  describe('editing state', () => {
    it('should set editing track id', () => {
      const newState = reducer(stateWithTracks, setEditingTrack('track-2'));
      expect(newState.editingTrackId).toBe('track-2');
    });

    it('should clear editing track id', () => {
      const editingState = { ...stateWithTracks, editingTrackId: 'track-2' };
      const newState = reducer(editingState, clearEditingTrack());
      expect(newState.editingTrackId).toBeNull();
    });
  });

  describe('setTrackColor', () => {
    it('should set track color by id', () => {
      const newState = reducer(
        stateWithTracks,
        setTrackColor({ trackId: 'track-1', color: '#00ff00' })
      );
      expect(newState.tracks[0]?.color).toBe('#00ff00');
    });

    it('should update existing track color', () => {
      const stateWithColor: TracksState = {
        tracks: [
          { id: 'track-1', name: 'Kick', color: '#00ff00' },
          { id: 'track-2', name: 'Snare' },
        ],
        editingTrackId: null,
        movingTrackId: null,
      };
      const newState = reducer(
        stateWithColor,
        setTrackColor({ trackId: 'track-1', color: '#ff0000' })
      );
      expect(newState.tracks[0]?.color).toBe('#ff0000');
    });

    it('should do nothing if track not found', () => {
      const newState = reducer(
        stateWithTracks,
        setTrackColor({ trackId: 'non-existent', color: '#00ff00' })
      );
      expect(newState.tracks).toEqual(stateWithTracks.tracks);
    });

    it('should add a new track with default color', () => {
      const newState = reducer(initialState, addTrack({ name: 'Bass' }));
      expect(newState.tracks[0]?.color).toBe('#6d8a9e'); // Muted blue default
    });
  });

  describe('setTrackHeight', () => {
    it('should set track height by id', () => {
      const newState = reducer(
        stateWithTracks,
        setTrackHeight({ trackId: 'track-1', height: 120 })
      );
      expect(newState.tracks[0]?.height).toBe(120);
    });

    it('should enforce minimum height of 40px', () => {
      const newState = reducer(
        stateWithTracks,
        setTrackHeight({ trackId: 'track-1', height: 20 })
      );
      expect(newState.tracks[0]?.height).toBe(40);
    });

    it('should enforce maximum height of 400px', () => {
      const newState = reducer(
        stateWithTracks,
        setTrackHeight({ trackId: 'track-1', height: 500 })
      );
      expect(newState.tracks[0]?.height).toBe(400);
    });

    it('should update existing track height', () => {
      const stateWithHeight: TracksState = {
        tracks: [
          { id: 'track-1', name: 'Kick', height: 100 },
          { id: 'track-2', name: 'Snare' },
        ],
        editingTrackId: null,
        movingTrackId: null,
      };
      const newState = reducer(
        stateWithHeight,
        setTrackHeight({ trackId: 'track-1', height: 150 })
      );
      expect(newState.tracks[0]?.height).toBe(150);
    });

    it('should do nothing if track not found', () => {
      const newState = reducer(
        stateWithTracks,
        setTrackHeight({ trackId: 'non-existent', height: 100 })
      );
      expect(newState.tracks).toEqual(stateWithTracks.tracks);
    });
  });

  describe('toggleTrackCollapse', () => {
    it('should collapse an expanded track', () => {
      const newState = reducer(stateWithTracks, toggleTrackCollapse('track-1'));
      expect(newState.tracks[0]?.collapsed).toBe(true);
    });

    it('should expand a collapsed track', () => {
      const collapsedState: TracksState = {
        tracks: [
          { id: 'track-1', name: 'Kick', collapsed: true },
          { id: 'track-2', name: 'Snare' },
        ],
        editingTrackId: null,
        movingTrackId: null,
      };
      const newState = reducer(collapsedState, toggleTrackCollapse('track-1'));
      expect(newState.tracks[0]?.collapsed).toBe(false);
    });

    it('should toggle from undefined to true', () => {
      const newState = reducer(stateWithTracks, toggleTrackCollapse('track-2'));
      expect(newState.tracks[1]?.collapsed).toBe(true);
    });

    it('should do nothing if track not found', () => {
      const newState = reducer(stateWithTracks, toggleTrackCollapse('non-existent'));
      expect(newState.tracks).toEqual(stateWithTracks.tracks);
    });

    it('should handle multiple toggles', () => {
      let state = reducer(stateWithTracks, toggleTrackCollapse('track-1'));
      expect(state.tracks[0]?.collapsed).toBe(true);

      state = reducer(state, toggleTrackCollapse('track-1'));
      expect(state.tracks[0]?.collapsed).toBe(false);

      state = reducer(state, toggleTrackCollapse('track-1'));
      expect(state.tracks[0]?.collapsed).toBe(true);
    });
  });
});
