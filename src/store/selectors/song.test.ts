/**
 * Cyclone - Song Selectors Tests
 * Test suite for CKS-native selectors
 */

import { describe, it, expect } from '@jest/globals';
import {
  selectCurrentSong,
  selectAllPatterns,
  selectAllTracks,
  selectAllScenes,
  selectPatternById,
  selectTrackById,
  selectSceneById,
  selectTimelineEndPosition,
  selectTrackCount,
  selectPatternCount,
} from './song';
import type { RootState } from '@/store/store';
import type { CirklonSongData } from '@/utils/cirklon/types';

describe('song selectors', () => {
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
          'T2_P3_00': {
            type: 'P3',
            creator_track: 2,
            saved: false,
            bar_count: 2,
          },
        },
        scenes: {
          'Scene 1': {
            gbar: 0,
            length: 8,
            advance: 'auto',
            pattern_assignments: {
              track_1: 'T1_P3_00',
              track_2: 'T2_P3_00',
            },
          },
          'Scene 2': {
            gbar: 8,
            length: 4,
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
          },
          'T2_P3_00': {
            reactKey: 'pattern-2',
          },
        },
        tracks: {
          track_1: {
            reactKey: 'track-1',
            color: '#00ff00',
            trackNumber: 1,
          },
          track_2: {
            reactKey: 'track-2',
            color: '#ff0000',
            trackNumber: 2,
          },
        },
        scenes: {
          'Scene 1': {
            reactKey: 'scene-1',
          },
          'Scene 2': {
            reactKey: 'scene-2',
          },
        },
      },
      trackOrder: ['track_1', 'track_2'],
      sceneOrder: ['Scene 1', 'Scene 2'],
    },
  };

  const mockState: Partial<RootState> = {
    song: {
      present: mockSongData,
      past: [],
      future: [],
    } as never,
    selection: {
      selectedPatternIds: ['scene-1-track-1-T1_P3_00'],
      currentTrackId: 'track-1',
    },
  };

  describe('selectCurrentSong', () => {
    it('should return the current song', () => {
      const result = selectCurrentSong(mockState as RootState);

      expect(result).toEqual(mockSongData.song_data['Test Song']);
    });

    it('should return null if no current song', () => {
      const emptyState: Partial<RootState> = {
        song: {
          present: {
            song_data: {},
            _cyclone_metadata: {
              version: '2.0.0',
              currentSongName: '',
              uiMappings: { patterns: {}, tracks: {}, scenes: {} },
              trackOrder: [],
              sceneOrder: [],
            },
          },
          past: [],
          future: [],
        } as never,
      };

      const result = selectCurrentSong(emptyState as RootState);

      expect(result).toBeNull();
    });
  });

  describe('selectAllScenes', () => {
    it('should compute Scene view models from CKS', () => {
      const result = selectAllScenes(mockState as RootState);

      expect(result).toHaveLength(2);

      // Scene 1
      expect(result[0].id).toBe('scene-1');
      expect(result[0].name).toBe('Scene 1');
      expect(result[0].position).toBe(0);
      expect(result[0].duration).toBe(32); // 8 bars * 4 beats = 32 beats

      // Scene 2
      expect(result[1].id).toBe('scene-2');
      expect(result[1].name).toBe('Scene 2');
      expect(result[1].position).toBe(32); // After Scene 1
      expect(result[1].duration).toBe(16); // 4 bars * 4 beats = 16 beats
    });

    it('should respect scene order from metadata', () => {
      const reorderedState = {
        ...mockState,
        song: {
          present: {
            ...mockSongData,
            _cyclone_metadata: {
              ...mockSongData._cyclone_metadata,
              sceneOrder: ['Scene 2', 'Scene 1'],
            },
          },
          past: [],
          future: [],
        } as never,
      };

      const result = selectAllScenes(reorderedState as never as RootState);

      expect(result[0].name).toBe('Scene 2');
      expect(result[1].name).toBe('Scene 1');
    });
  });

  describe('selectAllTracks', () => {
    it('should compute Track view models from CKS', () => {
      const result = selectAllTracks(mockState as RootState);

      expect(result).toHaveLength(2);

      // Track 1
      expect(result[0].id).toBe('track-1');
      expect(result[0].name).toBe('Track 1');
      expect(result[0].color).toBe('#00ff00');

      // Track 2
      expect(result[1].id).toBe('track-2');
      expect(result[1].name).toBe('Track 2');
      expect(result[1].color).toBe('#ff0000');
    });

    it('should respect track order from metadata', () => {
      const reorderedState = {
        ...mockState,
        song: {
          present: {
            ...mockSongData,
            _cyclone_metadata: {
              ...mockSongData._cyclone_metadata,
              trackOrder: ['track_2', 'track_1'],
            },
          },
          past: [],
          future: [],
        } as never,
      };

      const result = selectAllTracks(reorderedState as never as RootState);

      expect(result[0].id).toBe('track-2');
      expect(result[1].id).toBe('track-1');
    });
  });

  describe('selectAllPatterns', () => {
    it('should compute Pattern view models from CKS', () => {
      const result = selectAllPatterns(mockState as RootState);

      // Should have 3 patterns (T1_P3_00 in Scene 1, T2_P3_00 in Scene 1, T1_P3_00 in Scene 2)
      expect(result).toHaveLength(3);

      // First scene patterns
      const scene1Patterns = result.filter((p) => p.position === 0);
      expect(scene1Patterns).toHaveLength(2);

      const t1Pattern = scene1Patterns.find((p) => p.label === 'T1_P3_00');
      expect(t1Pattern).toBeDefined();
      // Pattern ID is now deterministic: scene-1-track-1-T1_P3_00
      expect(t1Pattern?.id).toBe('scene-1-track-1-T1_P3_00');
      expect(t1Pattern?.trackId).toBe('track-1');
      expect(t1Pattern?.duration).toBe(16); // 4 bars * 4 beats
      expect(t1Pattern?.sceneDuration).toBe(32); // Scene 1 duration

      // Second scene pattern
      const scene2Patterns = result.filter((p) => p.position === 32);
      expect(scene2Patterns).toHaveLength(1);
      expect(scene2Patterns[0].label).toBe('T1_P3_00');
    });

    it('should handle empty song', () => {
      const emptyState: Partial<RootState> = {
        song: {
          present: {
            song_data: {},
            _cyclone_metadata: {
              version: '2.0.0',
              currentSongName: '',
              uiMappings: { patterns: {}, tracks: {}, scenes: {} },
              trackOrder: [],
              sceneOrder: [],
            },
          },
          past: [],
          future: [],
        } as never,
      };

      const result = selectAllPatterns(emptyState as RootState);

      expect(result).toEqual([]);
    });
  });

  describe('selectPatternById', () => {
    it('should find pattern by ID', () => {
      // Pattern ID is now deterministic: scene-1-track-1-T1_P3_00
      const result = selectPatternById(mockState as RootState, 'scene-1-track-1-T1_P3_00');

      expect(result).toBeDefined();
      expect(result?.label).toBe('T1_P3_00');
      expect(result?.trackId).toBe('track-1');
    });

    it('should return undefined if pattern not found', () => {
      const result = selectPatternById(mockState as RootState, 'nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('selectTrackById', () => {
    it('should find track by ID', () => {
      const result = selectTrackById(mockState as RootState, 'track-1');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Track 1');
      expect(result?.color).toBe('#00ff00');
    });

    it('should return undefined if track not found', () => {
      const result = selectTrackById(mockState as RootState, 'nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('selectSceneById', () => {
    it('should find scene by ID', () => {
      const result = selectSceneById(mockState as RootState, 'scene-1');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Scene 1');
      expect(result?.position).toBe(0);
    });

    it('should return undefined if scene not found', () => {
      const result = selectSceneById(mockState as RootState, 'nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('selectTimelineEndPosition', () => {
    it('should calculate timeline end position', () => {
      const result = selectTimelineEndPosition(mockState as RootState);

      // Scene 1 ends at 32, Scene 2 ends at 48 (32 + 16)
      // But patterns have their own durations
      // Scene 1: position 0, duration 32
      // Scene 2: position 32, duration 16
      // Last pattern ends at 32 + 16 = 48
      expect(result).toBe(48);
    });

    it('should return 0 for empty timeline', () => {
      const emptyState: Partial<RootState> = {
        song: {
          present: {
            song_data: {},
            _cyclone_metadata: {
              version: '2.0.0',
              currentSongName: '',
              uiMappings: { patterns: {}, tracks: {}, scenes: {} },
              trackOrder: [],
              sceneOrder: [],
            },
          },
          past: [],
          future: [],
        } as never,
      };

      const result = selectTimelineEndPosition(emptyState as RootState);

      expect(result).toBe(0);
    });
  });

  describe('selectTrackCount', () => {
    it('should return track count', () => {
      const result = selectTrackCount(mockState as RootState);

      expect(result).toBe(2);
    });
  });

  describe('selectPatternCount', () => {
    it('should return pattern count', () => {
      const result = selectPatternCount(mockState as RootState);

      expect(result).toBe(3); // 2 in Scene 1, 1 in Scene 2
    });
  });
});
