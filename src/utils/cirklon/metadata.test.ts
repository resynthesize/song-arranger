/**
 * Cyclone - Metadata Utilities Tests
 * Test suite for metadata generation and management
 */

import { describe, it, expect } from '@jest/globals';
import { generateMetadata, ensureMetadata, stripMetadata } from './metadata';
import type { CirklonSongData } from './types';

describe('metadata utilities', () => {
  const mockCKSData: CirklonSongData = {
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
            length: 8,
            advance: 'auto',
            pattern_assignments: {
              track_1: 'T1_P3_00',
            },
          },
          workscene: {
            gbar: 16,
            length: 8,
            advance: 'manual',
          },
        },
      },
    },
  };

  describe('generateMetadata', () => {
    it('should generate metadata for a CKS file', () => {
      const metadata = generateMetadata(mockCKSData);

      expect(metadata.version).toBe('2.0.0');
      expect(metadata.currentSongName).toBe('Test Song');
      expect(metadata.exportedFrom).toBe('Cyclone');
      expect(metadata.exportedAt).toBeDefined();
    });

    it('should generate UI mappings for all patterns', () => {
      const metadata = generateMetadata(mockCKSData);

      expect(metadata.uiMappings.patterns['T1_P3_00']).toBeDefined();
      expect(metadata.uiMappings.patterns['T1_P3_00'].reactKey).toBeTruthy();

      expect(metadata.uiMappings.patterns['T2_P3_00']).toBeDefined();
      expect(metadata.uiMappings.patterns['T2_P3_00'].reactKey).toBeTruthy();
    });

    it('should generate UI mappings for all tracks', () => {
      const metadata = generateMetadata(mockCKSData);

      expect(metadata.uiMappings.tracks.track_1).toBeDefined();
      expect(metadata.uiMappings.tracks.track_1.reactKey).toBeTruthy();
      expect(metadata.uiMappings.tracks.track_1.color).toBeTruthy();
      expect(metadata.uiMappings.tracks.track_1.trackNumber).toBe(1);

      expect(metadata.uiMappings.tracks.track_2).toBeDefined();
      expect(metadata.uiMappings.tracks.track_2.trackNumber).toBe(2);
    });

    it('should generate UI mappings for all scenes except workscene', () => {
      const metadata = generateMetadata(mockCKSData);

      expect(metadata.uiMappings.scenes['Scene 1']).toBeDefined();
      expect(metadata.uiMappings.scenes['Scene 1'].reactKey).toBeTruthy();

      expect(metadata.uiMappings.scenes['Scene 2']).toBeDefined();
      expect(metadata.uiMappings.scenes['Scene 2'].reactKey).toBeTruthy();

      // workscene should not be included
      expect(metadata.uiMappings.scenes.workscene).toBeUndefined();
    });

    it('should generate track order sorted by track number', () => {
      const metadata = generateMetadata(mockCKSData);

      expect(metadata.trackOrder).toEqual(['track_1', 'track_2']);
    });

    it('should generate scene order sorted by gbar', () => {
      const metadata = generateMetadata(mockCKSData);

      expect(metadata.sceneOrder).toEqual(['Scene 1', 'Scene 2']);
    });

    it('should handle empty song data', () => {
      const emptyData: CirklonSongData = {
        song_data: {},
      };

      const metadata = generateMetadata(emptyData);

      expect(metadata.version).toBe('2.0.0');
      expect(metadata.currentSongName).toBe('');
      expect(metadata.uiMappings.patterns).toEqual({});
      expect(metadata.uiMappings.tracks).toEqual({});
      expect(metadata.uiMappings.scenes).toEqual({});
      expect(metadata.trackOrder).toEqual([]);
      expect(metadata.sceneOrder).toEqual([]);
    });
  });

  describe('ensureMetadata', () => {
    it('should add metadata if missing', () => {
      const result = ensureMetadata(mockCKSData);

      expect(result._cyclone_metadata).toBeDefined();
      expect(result._cyclone_metadata?.version).toBe('2.0.0');
      expect(result._cyclone_metadata?.currentSongName).toBe('Test Song');
    });

    it('should preserve existing metadata if valid', () => {
      const dataWithMetadata: CirklonSongData = {
        ...mockCKSData,
        _cyclone_metadata: {
          version: '2.0.0',
          currentSongName: 'Test Song',
          uiMappings: {
            patterns: {
              'T1_P3_00': {
                reactKey: 'existing-pattern-key',
              },
            },
            tracks: {
              track_1: {
                reactKey: 'existing-track-key',
                color: '#ff0000',
                trackNumber: 1,
              },
            },
            scenes: {
              'Scene 1': {
                reactKey: 'existing-scene-key',
              },
            },
          },
          trackOrder: ['track_1'],
          sceneOrder: ['Scene 1'],
        },
      };

      const result = ensureMetadata(dataWithMetadata);

      // Should preserve existing keys
      expect(result._cyclone_metadata?.uiMappings.patterns['T1_P3_00'].reactKey).toBe(
        'existing-pattern-key'
      );
      expect(result._cyclone_metadata?.uiMappings.tracks.track_1.reactKey).toBe(
        'existing-track-key'
      );
    });

    it('should repair missing mappings in existing metadata', () => {
      const incompleteMetadata: CirklonSongData = {
        ...mockCKSData,
        _cyclone_metadata: {
          version: '2.0.0',
          currentSongName: 'Test Song',
          uiMappings: {
            patterns: {
              // Missing T2_P3_00
              'T1_P3_00': {
                reactKey: 'pattern-1',
              },
            },
            tracks: {
              // Missing track_2
              track_1: {
                reactKey: 'track-1',
                color: '#00ff00',
                trackNumber: 1,
              },
            },
            scenes: {},
          },
          trackOrder: ['track_1'],
          sceneOrder: [],
        },
      };

      const result = ensureMetadata(incompleteMetadata);

      // Should add missing mappings
      expect(result._cyclone_metadata?.uiMappings.patterns['T2_P3_00']).toBeDefined();
      expect(result._cyclone_metadata?.uiMappings.tracks.track_2).toBeDefined();
      expect(result._cyclone_metadata?.uiMappings.scenes['Scene 1']).toBeDefined();
      expect(result._cyclone_metadata?.uiMappings.scenes['Scene 2']).toBeDefined();
    });

    it('should set default currentSongName if missing or invalid', () => {
      const noCurrentSong: CirklonSongData = {
        ...mockCKSData,
        _cyclone_metadata: {
          version: '2.0.0',
          currentSongName: 'Invalid Song',
          uiMappings: {
            patterns: {},
            tracks: {},
            scenes: {},
          },
          trackOrder: [],
          sceneOrder: [],
        },
      };

      const result = ensureMetadata(noCurrentSong);

      expect(result._cyclone_metadata?.currentSongName).toBe('Test Song');
    });
  });

  describe('stripMetadata', () => {
    it('should remove _cyclone_metadata', () => {
      const dataWithMetadata: CirklonSongData = {
        ...mockCKSData,
        _cyclone_metadata: {
          version: '2.0.0',
          currentSongName: 'Test Song',
          uiMappings: {
            patterns: {},
            tracks: {},
            scenes: {},
          },
          trackOrder: [],
          sceneOrder: [],
        },
      };

      const result = stripMetadata(dataWithMetadata);

      expect(result._cyclone_metadata).toBeUndefined();
      expect(result.song_data).toEqual(mockCKSData.song_data);
    });

    it('should preserve song_data exactly', () => {
      const result = stripMetadata(mockCKSData);

      expect(result.song_data).toEqual(mockCKSData.song_data);
      expect(result.song_data['Test Song'].patterns).toEqual(
        mockCKSData.song_data['Test Song'].patterns
      );
      expect(result.song_data['Test Song'].scenes).toEqual(
        mockCKSData.song_data['Test Song'].scenes
      );
    });
  });
});
