/**
 * Test fixtures - reusable test data
 * Minimal CKS data structures for testing
 */

import type { CirklonSongData } from '../../src/utils/cirklon/types';
import type { P3Bar } from '../../src/types/patternData';
import { createDefaultP3Bar } from '../../src/utils/patternDefaults';

/**
 * Create a minimal valid P3Bar with default values
 * Re-exports the production utility for use in tests
 */
export const createMinimalP3Bar = createDefaultP3Bar;

/**
 * Minimal valid CKS song data with 2 tracks and 1 pattern
 */
export const minimalSong = (): CirklonSongData => ({
  song_data: {
    'Test Song': {
      scenes: {
        'Scene 1': {
          gbar: 0,
          length: 4, // 4 bars = 16 beats
          advance: 'auto' as const,
          pattern_assignments: {
            'track_1': 'Pattern 1',
          },
        },
      },
      patterns: {
        'Pattern 1': {
          type: 'P3' as const,
          creator_track: 1,
          saved: true,
          bar_count: 1,
          // CKS format: bars at top level (selector will transform to patternData)
          bars: [createMinimalP3Bar()],
          aux_A: 'none',
          aux_B: 'none',
          aux_C: 'none',
          aux_D: 'none',
        },
      },
    },
  },
  _cyclone_metadata: {
    version: '2.0.0',
    currentSongName: 'Test Song',
    uiMappings: {
      patterns: {
        'Pattern 1': {
          reactKey: 'pattern-test-1',
        },
      },
      tracks: {
        'track_1': {
          reactKey: 'track-test-1',
          color: '#4a9eff',
          trackNumber: 1,
        },
      },
      scenes: {
        'Scene 1': {
          reactKey: 'scene-test-1',
        },
      },
    },
    trackOrder: ['track_1'],
    sceneOrder: ['Scene 1'],
  },
});

/**
 * Song with multiple patterns for drag testing
 */
export const dragTestSong = (): CirklonSongData => ({
  song_data: {
    'Drag Test': {
      scenes: {
        'Scene 1': {
          gbar: 0,
          length: 8, // 8 bars = 32 beats
          advance: 'auto' as const,
          pattern_assignments: {
            'track_1': 'Pattern A',
            'track_2': 'Pattern B',
          },
        },
      },
      patterns: {
        'Pattern A': {
          type: 'P3' as const,
          creator_track: 1,
          saved: true,
          bar_count: 1,
          // CKS format: bars at top level (selector will transform to patternData)
          bars: [createMinimalP3Bar({ note: Array(16).fill('C 4'), velo: Array(16).fill(100) })],
          aux_A: 'none',
          aux_B: 'none',
          aux_C: 'none',
          aux_D: 'none',
        },
        'Pattern B': {
          type: 'P3' as const,
          creator_track: 2,
          saved: true,
          bar_count: 1,
          // CKS format: bars at top level (selector will transform to patternData)
          bars: [createMinimalP3Bar({ note: Array(16).fill('D 4'), velo: Array(16).fill(80) })],
          aux_A: 'none',
          aux_B: 'none',
          aux_C: 'none',
          aux_D: 'none',
        },
      },
    },
  },
  _cyclone_metadata: {
    version: '2.0.0',
    currentSongName: 'Drag Test',
    uiMappings: {
      patterns: {
        'Pattern A': {
          reactKey: 'pattern-test-a',
        },
        'Pattern B': {
          reactKey: 'pattern-test-b',
        },
      },
      tracks: {
        'track_1': {
          reactKey: 'track-test-1',
          color: '#4a9eff',
          trackNumber: 1,
        },
        'track_2': {
          reactKey: 'track-test-2',
          color: '#ff4a9e',
          trackNumber: 2,
        },
      },
      scenes: {
        'Scene 1': {
          reactKey: 'scene-test-1',
        },
      },
    },
    trackOrder: ['track_1', 'track_2'],
    sceneOrder: ['Scene 1'],
  },
});
