/**
 * Cyclone - Song Slice Tests
 * Test suite for CKS-native Redux slice
 */

import { describe, it, expect } from '@jest/globals';
import songReducer, {
  loadSong,
  setCurrentSong,
  updatePattern,
  addPattern,
  removePattern,
  updateScene,
  addScene,
  removeScene,
  assignPatternToScene,
  removePatternFromScene,
  setTrackOrder,
  setSceneOrder,
  setTrackColor,
  setSceneColor,
} from './index';
import type { CirklonSongData as SongState } from '@/utils/cirklon/types';
import type { CirklonSongData, CirklonPattern, CirklonScene } from '@/utils/cirklon/types';

describe('songSlice', () => {
  const initialState: SongState = {
    song_data: {},
    _cyclone_metadata: {
      version: '2.0.0',
      currentSongName: '',
      uiMappings: {
        patterns: {},
        tracks: {},
        scenes: {},
      },
      trackOrder: [],
      sceneOrder: [],
    },
  };

  const mockSongData: CirklonSongData = {
    song_data: {
      'Test Song': {
        patterns: {
          'T1_P3_00': {
            type: 'P3',
            creator_track: 1,
            saved: false,
            bar_count: 4,
          },
        },
        scenes: {
          'Scene 1': {
            gbar: 0,
            length: 8,
            advance: 'auto',
            pattern_assignments: {
              track_1: 'T1_P3_00',
            },
          },
        },
      },
    },
    _cyclone_metadata: {
      version: '2.0.0',
      currentSongName: 'Test Song',
      uiMappings: {
        patterns: {
          'T1_P3_00': {
            reactKey: 'pattern-1',
            cyclonePatternId: 'pattern-id-1',
          },
        },
        tracks: {
          track_1: {
            reactKey: 'track-1',
            color: '#00ff00',
            trackNumber: 1,
          },
        },
        scenes: {
          'Scene 1': {
            reactKey: 'scene-1',
          },
        },
      },
      trackOrder: ['track_1'],
      sceneOrder: ['Scene 1'],
    },
  };

  describe('loadSong', () => {
    it('should load a complete CKS file', () => {
      const state = songReducer(initialState, loadSong(mockSongData));

      expect(state.song_data).toEqual(mockSongData.song_data);
      expect(state._cyclone_metadata).toEqual(mockSongData._cyclone_metadata);
    });
  });

  describe('setCurrentSong', () => {
    it('should set the current song name', () => {
      const state = songReducer(mockSongData, setCurrentSong('Test Song'));

      expect(state._cyclone_metadata?.currentSongName).toBe('Test Song');
    });

    it('should not change current song if name is invalid', () => {
      const state = songReducer(mockSongData, setCurrentSong('Invalid Song'));

      expect(state._cyclone_metadata?.currentSongName).toBe('Test Song');
    });
  });

  describe('updatePattern', () => {
    it('should update an existing pattern', () => {
      const state = songReducer(
        mockSongData,
        updatePattern({
          patternName: 'T1_P3_00',
          changes: { bar_count: 8 },
        })
      );

      expect(state.song_data['Test Song'].patterns['T1_P3_00'].bar_count).toBe(8);
    });

    it('should not create new pattern if pattern does not exist', () => {
      const state = songReducer(
        mockSongData,
        updatePattern({
          patternName: 'NonExistent',
          changes: { bar_count: 8 },
        })
      );

      expect(state.song_data['Test Song'].patterns['NonExistent']).toBeUndefined();
    });
  });

  describe('addPattern', () => {
    it('should add a new pattern', () => {
      const newPattern: CirklonPattern = {
        type: 'P3',
        creator_track: 2,
        saved: false,
        bar_count: 2,
      };

      const state = songReducer(
        mockSongData,
        addPattern({
          patternName: 'T2_P3_00',
          pattern: newPattern,
          reactKey: 'pattern-2',
        })
      );

      const addedPattern = state.song_data['Test Song'].patterns['T2_P3_00'];
      expect(addedPattern).toBeDefined();
      expect(addedPattern?.type).toBe('P3');
      expect(addedPattern?.saved).toBe(false);
      expect(addedPattern?.bar_count).toBe(2);
      // Pattern should have initialized bars array for P3 type
      expect(addedPattern?.bars).toBeDefined();
      expect(Array.isArray(addedPattern?.bars)).toBe(true);

      // UI mapping should exist
      expect(state._cyclone_metadata?.uiMappings.patterns['T2_P3_00']).toBeDefined();
      expect(state._cyclone_metadata?.uiMappings.patterns['T2_P3_00'].reactKey).toBeDefined();
    });
  });

  describe('removePattern', () => {
    it('should remove a pattern and its mappings', () => {
      const state = songReducer(mockSongData, removePattern('T1_P3_00'));

      expect(state.song_data['Test Song'].patterns['T1_P3_00']).toBeUndefined();
      expect(state._cyclone_metadata?.uiMappings.patterns['T1_P3_00']).toBeUndefined();
    });

    it('should remove pattern from scene assignments', () => {
      const state = songReducer(mockSongData, removePattern('T1_P3_00'));

      expect(
        state.song_data['Test Song'].scenes['Scene 1'].pattern_assignments?.track_1
      ).toBeUndefined();
    });
  });

  describe('updateScene', () => {
    it('should update an existing scene', () => {
      const state = songReducer(
        mockSongData,
        updateScene({
          sceneName: 'Scene 1',
          changes: { length: 16 },
        })
      );

      expect(state.song_data['Test Song'].scenes['Scene 1'].length).toBe(16);
    });
  });

  describe('addScene', () => {
    it('should add a new scene', () => {
      const newScene: CirklonScene = {
        gbar: 8, // This will be ignored - addScene uses gbar: 16 (standard 4/4)
        length: 8,
        advance: 'auto',
      };

      const state = songReducer(
        mockSongData,
        addScene({
          sceneName: 'Scene 2',
          scene: newScene,
          reactKey: 'scene-2',
        })
      );

      const addedScene = state.song_data['Test Song'].scenes['Scene 2'];
      expect(addedScene).toBeDefined();
      expect(addedScene?.gbar).toBe(16); // Standard 4/4 time
      expect(addedScene?.advance).toBe('auto');
      expect(addedScene?.length).toBeGreaterThan(0); // Length is calculated from position+duration
      expect(addedScene?.pattern_assignments).toBeDefined();

      // UI mapping should exist
      expect(state._cyclone_metadata?.uiMappings.scenes['Scene 2']).toBeDefined();
      expect(state._cyclone_metadata?.uiMappings.scenes['Scene 2'].reactKey).toBeDefined();
      expect(state._cyclone_metadata?.sceneOrder).toContain('Scene 2');
    });
  });

  describe('removeScene', () => {
    it('should remove a scene and its mappings', () => {
      const state = songReducer(mockSongData, removeScene('Scene 1'));

      expect(state.song_data['Test Song'].scenes['Scene 1']).toBeUndefined();
      expect(state._cyclone_metadata?.uiMappings.scenes['Scene 1']).toBeUndefined();
      expect(state._cyclone_metadata?.sceneOrder).not.toContain('Scene 1');
    });
  });

  describe('assignPatternToScene', () => {
    it('should assign a pattern to a track in a scene', () => {
      const state = songReducer(
        mockSongData,
        assignPatternToScene({
          sceneName: 'Scene 1',
          trackKey: 'track_2',
          patternName: 'T2_P3_00',
        })
      );

      expect(state.song_data['Test Song'].scenes['Scene 1'].pattern_assignments?.track_2).toBe(
        'T2_P3_00'
      );
    });

    it('should create pattern_assignments if it does not exist', () => {
      const stateWithoutAssignments = {
        ...mockSongData,
        song_data: {
          'Test Song': {
            ...mockSongData.song_data['Test Song'],
            scenes: {
              'Scene 1': {
                gbar: 0,
                length: 8,
                advance: 'auto' as const,
              },
            },
          },
        },
      };

      const state = songReducer(
        stateWithoutAssignments,
        assignPatternToScene({
          sceneName: 'Scene 1',
          trackKey: 'track_1',
          patternName: 'T1_P3_00',
        })
      );

      expect(state.song_data['Test Song'].scenes['Scene 1'].pattern_assignments).toBeDefined();
      expect(state.song_data['Test Song'].scenes['Scene 1'].pattern_assignments?.track_1).toBe(
        'T1_P3_00'
      );
    });
  });

  describe('removePatternFromScene', () => {
    it('should remove a pattern assignment from a scene', () => {
      const state = songReducer(
        mockSongData,
        removePatternFromScene({
          sceneName: 'Scene 1',
          trackKey: 'track_1',
        })
      );

      expect(
        state.song_data['Test Song'].scenes['Scene 1'].pattern_assignments?.track_1
      ).toBeUndefined();
    });
  });

  describe('setTrackOrder', () => {
    it('should update track order', () => {
      const newOrder = ['track_2', 'track_1'];
      const state = songReducer(mockSongData, setTrackOrder(newOrder));

      expect(state._cyclone_metadata?.trackOrder).toEqual(newOrder);
    });
  });

  describe('setSceneOrder', () => {
    it('should update scene order', () => {
      const newOrder = ['Scene 2', 'Scene 1'];
      const state = songReducer(mockSongData, setSceneOrder(newOrder));

      expect(state._cyclone_metadata?.sceneOrder).toEqual(newOrder);
    });
  });

  describe('setTrackColor', () => {
    it('should update track color', () => {
      const state = songReducer(
        mockSongData,
        setTrackColor({
          trackKey: 'track_1',
          color: '#ff0000',
        })
      );

      expect(state._cyclone_metadata?.uiMappings.tracks.track_1.color).toBe('#ff0000');
    });
  });

  describe('setSceneColor', () => {
    it('should update scene color', () => {
      const state = songReducer(
        mockSongData,
        setSceneColor({
          sceneName: 'Scene 1',
          color: '#0000ff',
        })
      );

      expect(state._cyclone_metadata?.uiMappings.scenes['Scene 1'].color).toBe('#0000ff');
    });
  });
});
