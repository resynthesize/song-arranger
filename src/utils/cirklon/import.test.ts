/**
 * Song Arranger - Cirklon Import Tests
 * Test-driven development: Write tests first, then implement
 */

import { describe, it, expect } from '@jest/globals';
import { parseCKSFile, importFromCirklon } from './import';
import type { CirklonSongData } from './types';

describe('Cirklon Import', () => {
  describe('parseCKSFile', () => {
    it('should parse valid CKS JSON string', () => {
      const json = JSON.stringify({
        song_data: {
          'test song': {
            patterns: {},
            scenes: {},
          },
        },
      });

      const result = parseCKSFile(json);
      expect(result).toBeDefined();
      expect(result.song_data).toBeDefined();
      expect(result.song_data['test song']).toBeDefined();
    });

    it('should throw error for invalid JSON', () => {
      const invalidJson = '{ invalid json }';
      expect(() => parseCKSFile(invalidJson)).toThrow();
    });

    it('should throw error for missing song_data', () => {
      const json = JSON.stringify({
        not_song_data: {},
      });
      expect(() => parseCKSFile(json)).toThrow('Invalid CKS file format');
    });

    it('should handle empty song_data', () => {
      const json = JSON.stringify({
        song_data: {},
      });
      const result = parseCKSFile(json);
      expect(result.song_data).toEqual({});
    });
  });

  describe('importFromCirklon', () => {
    it('should import empty song', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'empty song': {
            patterns: {},
            scenes: {},
          },
        },
      };

      const result = importFromCirklon(cksData);
      expect(result.songName).toBe('empty song');
      expect(result.tracks).toEqual([]);
      expect(result.patterns).toEqual([]);
      expect(result.tempo).toBe(120);
    });

    it('should import simple song with 1 scene, 1 track, 1 pattern', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'simple song': {
            patterns: {
              'Trk1 P1': {
                type: 'P3',
                creator_track: 1,
                saved: true,
                bar_count: 4,
              },
            },
            scenes: {
              'scene 1': {
                gbar: 0,
                length: 4,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P1',
                },
              },
            },
          },
        },
      };

      const result = importFromCirklon(cksData);
      expect(result.songName).toBe('simple song');
      expect(result.tracks).toHaveLength(1);
      expect(result.patterns).toHaveLength(1);
      expect(result.tempo).toBe(120);

      // Check track
      const track = result.tracks[0];
      expect(track).toBeDefined();
      if (track) {
        expect(track.name).toBe('Track 1');
        expect(track.id).toMatch(/^track-1-/);
        expect(track.color).toBeDefined();
      }

      // Check pattern
      const pattern = result.patterns[0];
      expect(pattern).toBeDefined();
      if (pattern) {
        expect(pattern.trackId).toBe(result.tracks[0]?.id);
        expect(pattern.position).toBe(0);
        expect(pattern.duration).toBe(16); // 4 bars * 4 beats
        expect(pattern.label).toBe('Trk1 P1');
        expect(pattern.muted).toBeUndefined();
        expect(pattern.patternType).toBe('P3');
      }
    });

    it('should import song with multiple tracks and patterns', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'multi track': {
            patterns: {
              'Trk1 P1': {
                type: 'P3',
                creator_track: 1,
                saved: true,
                bar_count: 4,
              },
              'Trk2 P1': {
                type: 'CK',
                creator_track: 2,
                saved: true,
                bar_count: 2,
              },
            },
            scenes: {
              'scene 1': {
                gbar: 0,
                length: 4,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P1',
                  track_2: 'Trk2 P1',
                },
              },
            },
          },
        },
      };

      const result = importFromCirklon(cksData);
      expect(result.tracks).toHaveLength(2);
      expect(result.patterns).toHaveLength(2);

      // Check tracks are sorted by number
      expect(result.tracks[0]?.name).toBe('Track 1');
      expect(result.tracks[1]?.name).toBe('Track 2');

      // Check patterns
      const pattern1 = result.patterns.find((p) => p.label === 'Trk1 P1');
      const pattern2 = result.patterns.find((p) => p.label === 'Trk2 P1');
      expect(pattern1).toBeDefined();
      expect(pattern2).toBeDefined();
      expect(pattern1?.patternType).toBe('P3');
      expect(pattern2?.patternType).toBe('CK');
    });

    it('should handle muted patterns correctly', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'muted test': {
            patterns: {
              'Trk1 P1': {
                type: 'P3',
                creator_track: 1,
                saved: true,
                bar_count: 4,
              },
              'Trk2 P1': {
                type: 'P3',
                creator_track: 2,
                saved: true,
                bar_count: 4,
              },
            },
            scenes: {
              'scene 1': {
                gbar: 0,
                length: 4,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P1',
                  track_2: 'Trk2 P1',
                },
                initial_mutes: ['track_1'],
              },
            },
          },
        },
      };

      const result = importFromCirklon(cksData);
      expect(result.patterns).toHaveLength(2);

      const pattern1 = result.patterns.find((p) => p.label === 'Trk1 P1');
      const pattern2 = result.patterns.find((p) => p.label === 'Trk2 P1');
      expect(pattern1?.muted).toBe(true);
      expect(pattern2?.muted).toBeUndefined();
    });

    it('should position patterns correctly across multiple scenes', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'multi scene': {
            patterns: {
              'Trk1 P1': {
                type: 'P3',
                creator_track: 1,
                saved: true,
                bar_count: 8,
              },
              'Trk1 P2': {
                type: 'P3',
                creator_track: 1,
                saved: true,
                bar_count: 8,
              },
            },
            scenes: {
              'scene 1': {
                gbar: 0,
                length: 8,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P1',
                },
              },
              'scene 2': {
                gbar: 8,
                length: 8,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P2',
                },
              },
            },
          },
        },
      };

      const result = importFromCirklon(cksData);
      expect(result.patterns).toHaveLength(2);

      const pattern1 = result.patterns.find((p) => p.label === 'Trk1 P1');
      const pattern2 = result.patterns.find((p) => p.label === 'Trk1 P2');
      expect(pattern1?.position).toBe(0);
      expect(pattern2?.position).toBe(32); // After 8-bar scene = 32 beats
    });

    it('should handle scenes with no pattern assignments', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'empty scene': {
            patterns: {},
            scenes: {
              'scene 1': {
                gbar: 0,
                length: 8,
                advance: 'auto',
              },
            },
          },
        },
      };

      const result = importFromCirklon(cksData);
      expect(result.tracks).toEqual([]);
      expect(result.patterns).toEqual([]);
    });

    it('should handle non-existent pattern references gracefully', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'missing pattern': {
            patterns: {
              'Trk1 P1': {
                type: 'P3',
                creator_track: 1,
                saved: true,
                bar_count: 4,
              },
            },
            scenes: {
              'scene 1': {
                gbar: 0,
                length: 4,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P1',
                  track_2: 'NonExistent Pattern', // This pattern doesn't exist
                },
              },
            },
          },
        },
      };

      // Should not throw, just skip the missing pattern
      const result = importFromCirklon(cksData);
      expect(result.patterns).toHaveLength(1);
      expect(result.patterns[0]?.label).toBe('Trk1 P1');
    });

    it('should handle custom beatsPerBar', () => {
      const cksData: CirklonSongData = {
        song_data: {
          '3/4 time': {
            patterns: {
              'Trk1 P1': {
                type: 'P3',
                creator_track: 1,
                saved: true,
                bar_count: 4,
              },
            },
            scenes: {
              'scene 1': {
                gbar: 0,
                length: 4,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P1',
                },
              },
            },
          },
        },
      };

      const result = importFromCirklon(cksData, 3); // 3/4 time
      const pattern = result.patterns[0];
      expect(pattern).toBeDefined();
      if (pattern) {
        expect(pattern.duration).toBe(12); // 4 bars * 3 beats
      }
    });

    it('should use default bar_count of 1 if pattern has no bar_count', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'no bar count': {
            patterns: {
              'Trk1 P1': {
                type: 'CK',
                creator_track: 1,
                saved: true,
                // No bar_count specified
              },
            },
            scenes: {
              'scene 1': {
                gbar: 0,
                length: 4,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P1',
                },
              },
            },
          },
        },
      };

      const result = importFromCirklon(cksData);
      const pattern = result.patterns[0];
      expect(pattern).toBeDefined();
      if (pattern) {
        expect(pattern.duration).toBe(4); // Default 1 bar * 4 beats
      }
    });

    it('should extract track numbers from non-sequential track keys', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'non-sequential': {
            patterns: {
              'Trk3 P1': { type: 'P3', creator_track: 3, saved: true, bar_count: 1 },
              'Trk7 P1': { type: 'P3', creator_track: 7, saved: true, bar_count: 1 },
              'Trk15 P1': { type: 'P3', creator_track: 15, saved: true, bar_count: 1 },
            },
            scenes: {
              'scene 1': {
                gbar: 0,
                length: 4,
                advance: 'auto',
                pattern_assignments: {
                  track_3: 'Trk3 P1',
                  track_7: 'Trk7 P1',
                  track_15: 'Trk15 P1',
                },
              },
            },
          },
        },
      };

      const result = importFromCirklon(cksData);
      expect(result.tracks).toHaveLength(3);
      expect(result.tracks[0]?.name).toBe('Track 3');
      expect(result.tracks[1]?.name).toBe('Track 7');
      expect(result.tracks[2]?.name).toBe('Track 15');
    });

    it('should exclude workscene from import', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'test song': {
            patterns: {
              'Trk1 P1': { type: 'P3', creator_track: 1, saved: true, bar_count: 4 },
              'Trk2 P1': { type: 'P3', creator_track: 2, saved: true, bar_count: 4 },
            },
            scenes: {
              'workscene': {
                gbar: 0,
                length: 8,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P1',
                  track_2: 'Trk2 P1',
                },
              },
              'scene 1': {
                gbar: 0,
                length: 8,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P1',
                },
              },
            },
          },
        },
      };

      const result = importFromCirklon(cksData);

      // Should only have 1 track (from scene 1), not 2 tracks (from workscene)
      expect(result.tracks).toHaveLength(1);
      expect(result.tracks[0]?.name).toBe('Track 1');

      // Should only have 1 pattern (from scene 1), not patterns from workscene
      expect(result.patterns).toHaveLength(1);
      expect(result.patterns[0]?.label).toBe('Trk1 P1');
      expect(result.patterns[0]?.position).toBe(0);
    });

    it('should preserve scene order from file, not sort by gbar', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'order test': {
            patterns: {
              'Trk1 P1': { type: 'P3', creator_track: 1, saved: true, bar_count: 4 },
              'Trk1 P2': { type: 'P3', creator_track: 1, saved: true, bar_count: 4 },
              'Trk1 P3': { type: 'P3', creator_track: 1, saved: true, bar_count: 4 },
            },
            scenes: {
              // Note: scenes are in file order but gbar values are intentionally out of order
              'scene 2': {
                gbar: 16,
                length: 4,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P2',
                },
              },
              'scene 1': {
                gbar: 0,
                length: 4,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P1',
                },
              },
              'scene 3': {
                gbar: 8,
                length: 4,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P3',
                },
              },
            },
          },
        },
      };

      const result = importFromCirklon(cksData);

      // Scenes should be processed in file order (scene 2, scene 1, scene 3)
      // not sorted by gbar (scene 1, scene 3, scene 2)
      expect(result.patterns).toHaveLength(3);

      // First pattern should be from scene 2 (first in file)
      expect(result.patterns[0]?.label).toBe('Trk1 P2');
      expect(result.patterns[0]?.position).toBe(0);

      // Second pattern should be from scene 1 (second in file)
      expect(result.patterns[1]?.label).toBe('Trk1 P1');
      expect(result.patterns[1]?.position).toBe(16); // After 4 bars = 16 beats

      // Third pattern should be from scene 3 (third in file)
      expect(result.patterns[2]?.label).toBe('Trk1 P3');
      expect(result.patterns[2]?.position).toBe(32); // After 8 bars = 32 beats
    });
  });
});
