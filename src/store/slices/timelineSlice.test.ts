/**
 * Song Arranger - Timeline Slice Tests
 * Tests for timeline Redux reducer
 */

import reducer, {
  setZoom,
  setPlayheadPosition,
  play,
  pause,
  stop,
  togglePlayPause,
  setTempo,
  setSnapValue,
} from './timelineSlice';
import type { TimelineState } from '@/types';

describe('timelineSlice', () => {
  const initialState: TimelineState = {
    zoom: 100,
    playheadPosition: 0,
    isPlaying: false,
    tempo: 120,
    snapValue: 1,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setZoom', () => {
    it('should set zoom level', () => {
      const newState = reducer(initialState, setZoom(200));
      expect(newState.zoom).toBe(200);
    });

    it('should clamp zoom to minimum value', () => {
      const newState = reducer(initialState, setZoom(5));
      expect(newState.zoom).toBe(10);
    });

    it('should clamp zoom to maximum value', () => {
      const newState = reducer(initialState, setZoom(1000));
      expect(newState.zoom).toBe(500);
    });
  });

  describe('setPlayheadPosition', () => {
    it('should set playhead position', () => {
      const newState = reducer(initialState, setPlayheadPosition(16));
      expect(newState.playheadPosition).toBe(16);
    });

    it('should not allow negative position', () => {
      const newState = reducer(initialState, setPlayheadPosition(-5));
      expect(newState.playheadPosition).toBe(0);
    });
  });

  describe('playback controls', () => {
    it('should start playback', () => {
      const newState = reducer(initialState, play());
      expect(newState.isPlaying).toBe(true);
    });

    it('should pause playback', () => {
      const playingState = { ...initialState, isPlaying: true };
      const newState = reducer(playingState, pause());
      expect(newState.isPlaying).toBe(false);
    });

    it('should stop playback and reset position', () => {
      const playingState = {
        ...initialState,
        isPlaying: true,
        playheadPosition: 32,
      };
      const newState = reducer(playingState, stop());
      expect(newState.isPlaying).toBe(false);
      expect(newState.playheadPosition).toBe(0);
    });

    it('should toggle play/pause state', () => {
      const newState1 = reducer(initialState, togglePlayPause());
      expect(newState1.isPlaying).toBe(true);

      const newState2 = reducer(newState1, togglePlayPause());
      expect(newState2.isPlaying).toBe(false);
    });
  });

  describe('setTempo', () => {
    it('should set tempo', () => {
      const newState = reducer(initialState, setTempo(140));
      expect(newState.tempo).toBe(140);
    });

    it('should clamp tempo to minimum value', () => {
      const newState = reducer(initialState, setTempo(10));
      expect(newState.tempo).toBe(20);
    });

    it('should clamp tempo to maximum value', () => {
      const newState = reducer(initialState, setTempo(500));
      expect(newState.tempo).toBe(300);
    });
  });

  describe('setSnapValue', () => {
    it('should set snap value to 1/16th note (0.25 beats)', () => {
      const newState = reducer(initialState, setSnapValue(0.25));
      expect(newState.snapValue).toBe(0.25);
    });

    it('should set snap value to 1/8th note (0.5 beats)', () => {
      const newState = reducer(initialState, setSnapValue(0.5));
      expect(newState.snapValue).toBe(0.5);
    });

    it('should set snap value to 1/4 note (1 beat)', () => {
      const newState = reducer(initialState, setSnapValue(1));
      expect(newState.snapValue).toBe(1);
    });

    it('should set snap value to 1/2 note (2 beats)', () => {
      const newState = reducer(initialState, setSnapValue(2));
      expect(newState.snapValue).toBe(2);
    });

    it('should set snap value to 1 bar (4 beats)', () => {
      const newState = reducer(initialState, setSnapValue(4));
      expect(newState.snapValue).toBe(4);
    });

    it('should not allow negative snap values', () => {
      const newState = reducer(initialState, setSnapValue(-1));
      expect(newState.snapValue).toBe(0);
    });

    it('should allow zero snap value (no snapping)', () => {
      const newState = reducer(initialState, setSnapValue(0));
      expect(newState.snapValue).toBe(0);
    });
  });
});
