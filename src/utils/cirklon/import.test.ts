/**
 * Cyclone - Cirklon Import Tests
 * Test-driven development: Write tests first, then implement
 */

import { describe, it, expect } from '@jest/globals';
import { parseCKSFile, importFromCirklon, importSongCollectionFromCirklon } from './import';
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

    describe('P3 Pattern Data Import', () => {
      it('should preserve full P3 pattern data when importing', () => {
        const cksData: CirklonSongData = {
          song_data: {
            'test': {
              patterns: {
                'Trk1 P1': {
                  type: 'P3',
                  creator_track: 1,
                  saved: true,
                  bar_count: 1,
                  loop_start: 1,
                  loop_end: 1,
                  aux_A: 'cc #1',
                  aux_B: 'cc #4',
                  aux_C: 'cc #6',
                  aux_D: 'cc #10',
                  accumulator_config: {
                    note: { limit: 36, mode: 'rtz', out: 'clip' },
                    velo: { limit: 127, mode: 'rtz', out: 'clip' },
                    auxD: { limit: 127, mode: 'rtz', out: 'clip' },
                    RoPS: true,
                    XdAcD: false,
                  },
                  bars: [{
                    direction: 'forward',
                    tbase: ' 16',
                    last_step: 8,
                    xpos: 0,
                    reps: 1,
                    gbar: false,
                    note: ['C 3', 'D 3', 'E 3', 'F 3', 'G 3', 'A 3', 'B 3', 'C 4', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3'],
                    velo: [100, 105, 110, 115, 120, 125, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127],
                    length: [48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48],
                    delay: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    gate: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                    tie: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    skip: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    note_X: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    aux_A_value: [10, 20, 30, 40, 50, 60, 70, 80, 0, 0, 0, 0, 0, 0, 0, 0],
                    aux_A_flag: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                    aux_B_value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    aux_B_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    aux_C_value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    aux_C_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    aux_D_value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    aux_D_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  }],
                },
              },
              scenes: {
                'scene 1': {
                  gbar: 0,
                  length: 4,
                  advance: 'auto',
                  pattern_assignments: { track_1: 'Trk1 P1' },
                },
              },
            },
          },
        };

        const result = importFromCirklon(cksData);
        const pattern = result.patterns[0];

        expect(pattern).toBeDefined();
        if (!pattern) return;

        // Check that patternData exists
        expect(pattern.patternData).toBeDefined();
        if (!pattern.patternData) return;

        // Check pattern-level settings
        expect(pattern.patternData.loop_start).toBe(1);
        expect(pattern.patternData.loop_end).toBe(1);
        expect(pattern.patternData.aux_A).toBe('cc #1');
        expect(pattern.patternData.aux_B).toBe('cc #4');
        expect(pattern.patternData.aux_C).toBe('cc #6');
        expect(pattern.patternData.aux_D).toBe('cc #10');

        // Check accumulator config
        expect(pattern.patternData.accumulator_config).toBeDefined();

        // Check bars array
        expect(pattern.patternData.bars).toBeDefined();
        expect(pattern.patternData.bars).toHaveLength(1);

        const bar = pattern.patternData.bars[0];
        expect(bar).toBeDefined();
        if (!bar) return;

        // Check bar-level settings
        expect(bar.direction).toBe('forward');
        expect(bar.tbase).toBe(' 16');
        expect(bar.last_step).toBe(8);
        expect(bar.xpos).toBe(0);
        expect(bar.reps).toBe(1);
        expect(bar.gbar).toBe(false);

        // Check step arrays
        expect(bar.note).toHaveLength(16);
        expect(bar.note[0]).toBe('C 3');
        expect(bar.note[7]).toBe('C 4');
        expect(bar.velo).toHaveLength(16);
        expect(bar.velo[0]).toBe(100);
        expect(bar.gate).toHaveLength(16);
        expect(bar.gate[0]).toBe(1);
        expect(bar.gate[8]).toBe(0);
        expect(bar.aux_A_value[0]).toBe(10);
        expect(bar.aux_A_flag[0]).toBe(1);
      });

      it('should not populate patternData for CK patterns', () => {
        const cksData: CirklonSongData = {
          song_data: {
            'test': {
              patterns: {
                'Trk1 CK1': {
                  type: 'CK',
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
                  pattern_assignments: { track_1: 'Trk1 CK1' },
                },
              },
            },
          },
        };

        const result = importFromCirklon(cksData);
        const pattern = result.patterns[0];

        expect(pattern).toBeDefined();
        if (!pattern) return;

        expect(pattern.patternType).toBe('CK');
        expect(pattern.patternData).toBeUndefined();
      });

      it('should handle P3 patterns without bars data gracefully', () => {
        const cksData: CirklonSongData = {
          song_data: {
            'test': {
              patterns: {
                'Trk1 P1': {
                  type: 'P3',
                  creator_track: 1,
                  saved: true,
                  bar_count: 1,
                  // No bars array
                },
              },
              scenes: {
                'scene 1': {
                  gbar: 0,
                  length: 4,
                  advance: 'auto',
                  pattern_assignments: { track_1: 'Trk1 P1' },
                },
              },
            },
          },
        };

        // Should not crash
        const result = importFromCirklon(cksData);
        const pattern = result.patterns[0];

        expect(pattern).toBeDefined();
        if (!pattern) return;

        expect(pattern.patternType).toBe('P3');
        // patternData should be undefined if there are no bars
        expect(pattern.patternData).toBeUndefined();
      });

      it('should handle P3 patterns with empty bars array', () => {
        const cksData: CirklonSongData = {
          song_data: {
            'test': {
              patterns: {
                'Trk1 P1': {
                  type: 'P3',
                  creator_track: 1,
                  saved: true,
                  bar_count: 1,
                  bars: [], // Empty bars array
                },
              },
              scenes: {
                'scene 1': {
                  gbar: 0,
                  length: 4,
                  advance: 'auto',
                  pattern_assignments: { track_1: 'Trk1 P1' },
                },
              },
            },
          },
        };

        const result = importFromCirklon(cksData);
        const pattern = result.patterns[0];

        expect(pattern).toBeDefined();
        if (!pattern) return;

        expect(pattern.patternType).toBe('P3');
        // patternData should be undefined if bars array is empty
        expect(pattern.patternData).toBeUndefined();
      });

      it('should preserve multiple bars in pattern data', () => {
        const cksData: CirklonSongData = {
          song_data: {
            'test': {
              patterns: {
                'Trk1 P1': {
                  type: 'P3',
                  creator_track: 1,
                  saved: true,
                  bar_count: 2,
                  bars: [
                    {
                      direction: 'forward',
                      tbase: ' 16',
                      last_step: 16,
                      xpos: 0,
                      reps: 1,
                      gbar: false,
                      note: ['C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3', 'C 3'],
                      velo: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                      length: [48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48],
                      delay: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      gate: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                      tie: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      skip: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      note_X: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_A_value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_A_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_B_value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_B_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_C_value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_C_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_D_value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_D_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    },
                    {
                      direction: 'reverse A',
                      tbase: '  8',
                      last_step: 8,
                      xpos: 12,
                      reps: 2,
                      gbar: true,
                      note: ['D 3', 'D 3', 'D 3', 'D 3', 'D 3', 'D 3', 'D 3', 'D 3', 'D 3', 'D 3', 'D 3', 'D 3', 'D 3', 'D 3', 'D 3', 'D 3'],
                      velo: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
                      length: [24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24],
                      delay: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      gate: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                      tie: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      skip: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      note_X: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_A_value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_A_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_B_value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_B_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_C_value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_C_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_D_value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                      aux_D_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    },
                  ],
                },
              },
              scenes: {
                'scene 1': {
                  gbar: 0,
                  length: 4,
                  advance: 'auto',
                  pattern_assignments: { track_1: 'Trk1 P1' },
                },
              },
            },
          },
        };

        const result = importFromCirklon(cksData);
        const pattern = result.patterns[0];

        expect(pattern).toBeDefined();
        if (!pattern || !pattern.patternData) return;

        expect(pattern.patternData.bars).toHaveLength(2);

        const bar1 = pattern.patternData.bars[0];
        const bar2 = pattern.patternData.bars[1];

        if (!bar1 || !bar2) return;

        expect(bar1.direction).toBe('forward');
        expect(bar1.last_step).toBe(16);
        expect(bar1.note[0]).toBe('C 3');

        expect(bar2.direction).toBe('reverse A');
        expect(bar2.last_step).toBe(8);
        expect(bar2.xpos).toBe(12);
        expect(bar2.reps).toBe(2);
        expect(bar2.gbar).toBe(true);
        expect(bar2.note[0]).toBe('D 3');
      });

      it('should handle P3 patterns with aux assignments but no bars', () => {
        const cksData: CirklonSongData = {
          song_data: {
            'test': {
              patterns: {
                'Trk1 P1': {
                  type: 'P3',
                  creator_track: 1,
                  saved: true,
                  bar_count: 1,
                  aux_A: 'cc #1',
                  aux_B: 'cc #4',
                  // No bars array
                },
              },
              scenes: {
                'scene 1': {
                  gbar: 0,
                  length: 4,
                  advance: 'auto',
                  pattern_assignments: { track_1: 'Trk1 P1' },
                },
              },
            },
          },
        };

        const result = importFromCirklon(cksData);
        const pattern = result.patterns[0];

        expect(pattern).toBeDefined();
        if (!pattern) return;

        // Should not have patternData if no bars
        expect(pattern.patternData).toBeUndefined();
      });
    });
  });

  describe('importSongCollectionFromCirklon', () => {
    it('should return empty result for empty song collection', () => {
      const cksData: CirklonSongData = {
        song_data: {},
      };

      const mockSave = jest.fn().mockReturnValue('mock-id');
      const result = importSongCollectionFromCirklon(cksData, 4, mockSave);

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
      expect(result.songNames).toEqual([]);
      expect(result.errors).toEqual([]);
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should import single song and save to storage', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'test song': {
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

      const mockSave = jest.fn().mockReturnValue('saved-id-1');
      const result = importSongCollectionFromCirklon(cksData, 4, mockSave);

      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(0);
      expect(result.songNames).toEqual(['test song']);
      expect(result.errors).toEqual([]);

      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test song',
          patterns: expect.arrayContaining([
            expect.objectContaining({
              label: 'Trk1 P1',
              duration: 16,
            }),
          ]),
          tracks: expect.arrayContaining([
            expect.objectContaining({
              name: 'Track 1',
            }),
          ]),
          timeline: expect.objectContaining({
            tempo: 120,
            snapValue: 1,
            snapMode: 'grid',
            verticalZoom: 100,
            isPlaying: false,
            playheadPosition: 0,
            viewport: expect.objectContaining({
              offsetBeats: 0,
              zoom: 5,
            }),
          }),
        })
      );
    });

    it('should import multiple songs and save each to storage', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'song 1': {
            patterns: {
              'Trk1 P1': {
                type: 'P3',
                creator_track: 1,
                saved: true,
                bar_count: 2,
              },
            },
            scenes: {
              'scene 1': {
                gbar: 0,
                length: 2,
                advance: 'auto',
                pattern_assignments: {
                  track_1: 'Trk1 P1',
                },
              },
            },
          },
          'song 2': {
            patterns: {
              'Trk2 P1': {
                type: 'CK',
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
                  track_2: 'Trk2 P1',
                },
              },
            },
          },
          'song 3': {
            patterns: {},
            scenes: {},
          },
        },
      };

      const mockSave = jest.fn()
        .mockReturnValueOnce('saved-id-1')
        .mockReturnValueOnce('saved-id-2')
        .mockReturnValueOnce('saved-id-3');

      const result = importSongCollectionFromCirklon(cksData, 4, mockSave);

      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
      expect(result.songNames).toEqual(['song 1', 'song 2', 'song 3']);
      expect(result.errors).toEqual([]);

      expect(mockSave).toHaveBeenCalledTimes(3);

      // Verify first song
      expect(mockSave).toHaveBeenNthCalledWith(1,
        expect.objectContaining({
          name: 'song 1',
          patterns: expect.any(Array),
        })
      );

      // Verify second song
      expect(mockSave).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          name: 'song 2',
          patterns: expect.any(Array),
        })
      );

      // Verify third song
      expect(mockSave).toHaveBeenNthCalledWith(3,
        expect.objectContaining({
          name: 'song 3',
          patterns: [],
          tracks: [],
        })
      );
    });

    it('should handle errors and continue with remaining songs', () => {
      const cksData: CirklonSongData = {
        song_data: {
          'good song': {
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
          'bad song': {
            patterns: {},
            scenes: {},
          },
          'another good song': {
            patterns: {
              'Trk2 P1': {
                type: 'P3',
                creator_track: 2,
                saved: true,
                bar_count: 2,
              },
            },
            scenes: {
              'scene 1': {
                gbar: 0,
                length: 2,
                advance: 'auto',
                pattern_assignments: {
                  track_2: 'Trk2 P1',
                },
              },
            },
          },
        },
      };

      const mockSave = jest.fn()
        .mockReturnValueOnce('saved-id-1')
        .mockImplementationOnce(() => {
          throw new Error('Storage quota exceeded');
        })
        .mockReturnValueOnce('saved-id-3');

      const result = importSongCollectionFromCirklon(cksData, 4, mockSave);

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
      expect(result.songNames).toEqual(['good song', 'another good song']);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        songName: 'bad song',
        error: 'Storage quota exceeded',
      });

      expect(mockSave).toHaveBeenCalledTimes(3);
    });

    it('should respect custom beatsPerBar parameter', () => {
      const cksData: CirklonSongData = {
        song_data: {
          '3/4 song': {
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

      const mockSave = jest.fn().mockReturnValue('saved-id-1');
      importSongCollectionFromCirklon(cksData, 3, mockSave); // 3 beats per bar

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          patterns: expect.arrayContaining([
            expect.objectContaining({
              duration: 12, // 4 bars * 3 beats
            }),
          ]),
        })
      );
    });
  });
});
