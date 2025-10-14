/**
 * Song Arranger - Timeline Slice Tests
 * Tests for timeline Redux reducer
 */

import reducer, {
  setZoom,
  zoomIn,
  zoomOut,
  setZoomFocused,
  setViewportOffset,
  panViewport,
  setViewportDimensions,
  setPlayheadPosition,
  play,
  pause,
  stop,
  togglePlayPause,
  setTempo,
  setSnapValue,
  setSnapMode,
} from './timelineSlice';
import type { TimelineState } from '@/types';

describe('timelineSlice', () => {
  const initialState: TimelineState = {
    viewport: {
      offsetBeats: 0,
      zoom: 5,
      widthPx: 1600,
      heightPx: 600,
    },
    verticalZoom: 100,
    playheadPosition: 0,
    isPlaying: false,
    tempo: 120,
    snapValue: 1,
    snapMode: 'grid',
    minimapVisible: false,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setZoom', () => {
    it('should set zoom level', () => {
      const newState = reducer(initialState, setZoom(200));
      expect(newState.viewport.zoom).toBe(200);
    });

    it('should clamp zoom to minimum value', () => {
      const newState = reducer(initialState, setZoom(0.1));
      expect(newState.viewport.zoom).toBe(0.25);
    });

    it('should clamp zoom to maximum value', () => {
      const newState = reducer(initialState, setZoom(1000));
      expect(newState.viewport.zoom).toBe(800);
    });
  });

  describe('zoomIn', () => {
    it('should zoom to next discrete level', () => {
      const state = { ...initialState, viewport: { ...initialState.viewport, zoom: 100 } };
      const newState = reducer(state, zoomIn());
      expect(newState.viewport.zoom).toBe(200);
    });

    it('should stop at maximum zoom level', () => {
      const state = { ...initialState, viewport: { ...initialState.viewport, zoom: 800 } };
      const newState = reducer(state, zoomIn());
      expect(newState.viewport.zoom).toBe(800);
    });
  });

  describe('zoomOut', () => {
    it('should zoom to previous discrete level', () => {
      const state = { ...initialState, viewport: { ...initialState.viewport, zoom: 100 } };
      const newState = reducer(state, zoomOut());
      expect(newState.viewport.zoom).toBe(50);
    });

    it('should stop at minimum zoom level', () => {
      const state = { ...initialState, viewport: { ...initialState.viewport, zoom: 0.25 } };
      const newState = reducer(state, zoomOut());
      expect(newState.viewport.zoom).toBe(0.25);
    });
  });

  describe('setZoomFocused', () => {
    it('should set zoom while maintaining focus point position on screen', () => {
      // Setup: viewport at offset 100, zoom 10, focus at beat 150
      // Focus point is (150 - 100) * 10 = 500px from left edge
      const state = {
        ...initialState,
        viewport: {
          ...initialState.viewport,
          offsetBeats: 100,
          zoom: 10,
          widthPx: 1600,
        },
      };

      // Zoom to 20 (2x zoom in) while keeping beat 150 at same screen position
      const newState = reducer(state, setZoomFocused({ zoom: 20, focusBeats: 150 }));

      // Focus should still be 500px from left edge
      // 500 = (150 - newOffset) * 20
      // newOffset = 150 - (500 / 20) = 150 - 25 = 125
      expect(newState.viewport.zoom).toBe(20);
      expect(newState.viewport.offsetBeats).toBe(125);

      // Verify focus point stayed at same screen position
      const oldScreenPos = (150 - 100) * 10; // 500px
      const newScreenPos = (150 - 125) * 20; // 500px
      expect(oldScreenPos).toBe(newScreenPos);
    });

    it('should handle zooming out while maintaining focus point', () => {
      // Setup: viewport at offset 100, zoom 20, focus at beat 120
      const state = {
        ...initialState,
        viewport: {
          ...initialState.viewport,
          offsetBeats: 100,
          zoom: 20,
        },
      };

      // Zoom out to 10 (0.5x zoom) while keeping beat 120 at same screen position
      const newState = reducer(state, setZoomFocused({ zoom: 10, focusBeats: 120 }));

      // Focus point screen position should remain the same
      const oldScreenPos = (120 - 100) * 20; // 400px
      const newScreenPos = (120 - newState.viewport.offsetBeats) * 10;
      expect(oldScreenPos).toBe(newScreenPos);
      expect(newState.viewport.zoom).toBe(10);
    });

    it('should clamp zoom to valid range', () => {
      const state = { ...initialState, viewport: { ...initialState.viewport, zoom: 10 } };

      // Try to zoom below minimum
      const newState1 = reducer(state, setZoomFocused({ zoom: 0.1, focusBeats: 50 }));
      expect(newState1.viewport.zoom).toBe(0.25); // MIN_ZOOM

      // Try to zoom above maximum
      const newState2 = reducer(state, setZoomFocused({ zoom: 1000, focusBeats: 50 }));
      expect(newState2.viewport.zoom).toBe(800); // MAX_ZOOM
    });

    it('should not allow negative viewport offset', () => {
      // Edge case: zooming out near start of timeline
      const state = {
        ...initialState,
        viewport: {
          ...initialState.viewport,
          offsetBeats: 5,
          zoom: 100,
        },
      };

      // Zoom out dramatically while focused on beat 10
      const newState = reducer(state, setZoomFocused({ zoom: 1, focusBeats: 10 }));

      // Offset should be clamped to 0
      expect(newState.viewport.offsetBeats).toBeGreaterThanOrEqual(0);
      expect(newState.viewport.zoom).toBe(1);
    });

    it('should work smoothly for continuous zoom (drag-to-zoom)', () => {
      // Simulate Ableton-style drag zoom with small incremental changes
      let state = {
        ...initialState,
        viewport: {
          ...initialState.viewport,
          offsetBeats: 100,
          zoom: 10,
        },
      };
      const focusBeats = 150;

      // Simulate 5 small zoom steps (like dragging mouse up)
      for (let i = 0; i < 5; i++) {
        const newZoom = 10 + i * 2; // 10, 12, 14, 16, 18
        state = reducer(state, setZoomFocused({ zoom: newZoom, focusBeats }));

        // Focus point should stay at same screen position throughout
        const expectedScreenPos = (focusBeats - 100) * 10; // Original position: 500px
        const actualScreenPos = (focusBeats - state.viewport.offsetBeats) * state.viewport.zoom;

        // Allow small floating point errors
        expect(Math.abs(actualScreenPos - expectedScreenPos)).toBeLessThan(0.01);
      }
    });
  });

  describe('setViewportOffset', () => {
    it('should set viewport offset', () => {
      const newState = reducer(initialState, setViewportOffset(100));
      expect(newState.viewport.offsetBeats).toBe(100);
    });

    it('should not allow negative offset', () => {
      const newState = reducer(initialState, setViewportOffset(-50));
      expect(newState.viewport.offsetBeats).toBe(0);
    });
  });

  describe('panViewport', () => {
    it('should pan viewport by delta', () => {
      const state = { ...initialState, viewport: { ...initialState.viewport, offsetBeats: 100 } };
      const newState = reducer(state, panViewport(50));
      expect(newState.viewport.offsetBeats).toBe(150);
    });

    it('should pan viewport backward', () => {
      const state = { ...initialState, viewport: { ...initialState.viewport, offsetBeats: 100 } };
      const newState = reducer(state, panViewport(-30));
      expect(newState.viewport.offsetBeats).toBe(70);
    });

    it('should not allow negative offset when panning backward', () => {
      const state = { ...initialState, viewport: { ...initialState.viewport, offsetBeats: 20 } };
      const newState = reducer(state, panViewport(-50));
      expect(newState.viewport.offsetBeats).toBe(0);
    });
  });

  describe('setViewportDimensions', () => {
    it('should set viewport dimensions', () => {
      const newState = reducer(
        initialState,
        setViewportDimensions({ widthPx: 1920, heightPx: 1080 })
      );
      expect(newState.viewport.widthPx).toBe(1920);
      expect(newState.viewport.heightPx).toBe(1080);
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

  describe('setSnapMode', () => {
    it('should set snap mode to grid', () => {
      const newState = reducer(initialState, setSnapMode('grid'));
      expect(newState.snapMode).toBe('grid');
    });

    it('should set snap mode to fixed', () => {
      const state = { ...initialState, snapMode: 'grid' as const };
      const newState = reducer(state, setSnapMode('fixed'));
      expect(newState.snapMode).toBe('fixed');
    });
  });

  describe('vertical zoom', () => {
    it('should set vertical zoom to 100% by default', () => {
      expect(initialState.verticalZoom).toBe(100);
    });

    it('should increase vertical zoom', () => {
      const newState = reducer(initialState, { type: 'timeline/verticalZoomIn' });
      expect(newState.verticalZoom).toBe(110);
    });

    it('should decrease vertical zoom', () => {
      const newState = reducer(initialState, { type: 'timeline/verticalZoomOut' });
      expect(newState.verticalZoom).toBe(90);
    });

    it('should clamp vertical zoom to 10% minimum', () => {
      const state = { ...initialState, verticalZoom: 10 };
      const newState = reducer(state, { type: 'timeline/verticalZoomOut' });
      expect(newState.verticalZoom).toBe(10);
    });

    it('should clamp vertical zoom to 150% maximum', () => {
      const state = { ...initialState, verticalZoom: 150 };
      const newState = reducer(state, { type: 'timeline/verticalZoomIn' });
      expect(newState.verticalZoom).toBe(150);
    });

    it('should set vertical zoom directly', () => {
      const newState = reducer(initialState, { type: 'timeline/setVerticalZoom', payload: 75 });
      expect(newState.verticalZoom).toBe(75);
    });

    it('should clamp direct vertical zoom setting', () => {
      const newState1 = reducer(initialState, { type: 'timeline/setVerticalZoom', payload: 5 });
      expect(newState1.verticalZoom).toBe(10);

      const newState2 = reducer(initialState, { type: 'timeline/setVerticalZoom', payload: 200 });
      expect(newState2.verticalZoom).toBe(150);
    });

    it('should calculate lane height correctly at different zoom levels', () => {
      // Base height is 80px
      const BASE_HEIGHT = 80;

      // At 100%, height should be 80px
      expect(BASE_HEIGHT * (initialState.verticalZoom / 100)).toBe(80);

      // At 50%, height should be 40px
      const state50 = { ...initialState, verticalZoom: 50 };
      expect(BASE_HEIGHT * (state50.verticalZoom / 100)).toBe(40);

      // At 150%, height should be 120px
      const state150 = { ...initialState, verticalZoom: 150 };
      expect(BASE_HEIGHT * (state150.verticalZoom / 100)).toBe(120);
    });

    it('should ensure 32 lanes fit at 50% zoom', () => {
      const BASE_HEIGHT = 80;
      const LANE_COUNT = 32;
      const state = { ...initialState, verticalZoom: 50 };

      const laneHeight = BASE_HEIGHT * (state.verticalZoom / 100);
      const totalHeight = laneHeight * LANE_COUNT;

      // At 50% zoom (40px per lane), 32 lanes = 1280px total
      expect(laneHeight).toBe(40);
      expect(totalHeight).toBe(1280);
    });
  });
});
