/**
 * Cyclone - Cirklon Conversion Utilities Tests
 * Test-driven development: Write tests first, then implement
 */

import { describe, it, expect } from '@jest/globals';
import {
  barsToBeats,
  beatsToBar,
  calculateSceneDuration,
  generatePatternName,
} from './conversion';
import type { CirklonScene } from './types';

describe('Cirklon Conversion Utilities', () => {
  describe('barsToBeats', () => {
    it('should convert 1 bar to 4 beats with default beatsPerBar', () => {
      expect(barsToBeats(1)).toBe(4);
    });

    it('should convert 8 bars to 32 beats with default beatsPerBar', () => {
      expect(barsToBeats(8)).toBe(32);
    });

    it('should convert 1 bar to 4 beats with explicit beatsPerBar=4', () => {
      expect(barsToBeats(1, 4)).toBe(4);
    });

    it('should convert 2 bars to 6 beats with beatsPerBar=3', () => {
      expect(barsToBeats(2, 3)).toBe(6);
    });

    it('should handle 0 bars', () => {
      expect(barsToBeats(0, 4)).toBe(0);
    });

    it('should handle fractional bars', () => {
      expect(barsToBeats(0.5, 4)).toBe(2);
    });

    it('should handle large numbers', () => {
      expect(barsToBeats(100, 4)).toBe(400);
    });
  });

  describe('beatsToBar', () => {
    it('should convert 4 beats to 1 bar with default beatsPerBar', () => {
      expect(beatsToBar(4)).toBe(1);
    });

    it('should convert 32 beats to 8 bars with default beatsPerBar', () => {
      expect(beatsToBar(32)).toBe(8);
    });

    it('should convert 4 beats to 1 bar with explicit beatsPerBar=4', () => {
      expect(beatsToBar(4, 4)).toBe(1);
    });

    it('should convert 6 beats to 2 bars with beatsPerBar=3', () => {
      expect(beatsToBar(6, 3)).toBe(2);
    });

    it('should handle 0 beats', () => {
      expect(beatsToBar(0, 4)).toBe(0);
    });

    it('should handle fractional beats', () => {
      expect(beatsToBar(2, 4)).toBe(0.5);
    });

    it('should handle large numbers', () => {
      expect(beatsToBar(400, 4)).toBe(100);
    });
  });

  describe('calculateSceneDuration', () => {
    it('should calculate duration for 8-bar scene with default beatsPerBar', () => {
      const scene: CirklonScene = {
        gbar: 0,
        length: 8,
        advance: 'auto',
      };
      expect(calculateSceneDuration(scene)).toBe(32);
    });

    it('should calculate duration for 8-bar scene with explicit beatsPerBar=4', () => {
      const scene: CirklonScene = {
        gbar: 0,
        length: 8,
        advance: 'auto',
      };
      expect(calculateSceneDuration(scene, 4)).toBe(32);
    });

    it('should calculate duration for 4-bar scene', () => {
      const scene: CirklonScene = {
        gbar: 16,
        length: 4,
        advance: 'auto',
      };
      expect(calculateSceneDuration(scene, 4)).toBe(16);
    });

    it('should calculate duration for 1-bar scene', () => {
      const scene: CirklonScene = {
        gbar: 0,
        length: 1,
        advance: 'manual',
      };
      expect(calculateSceneDuration(scene, 4)).toBe(4);
    });

    it('should handle scene with beatsPerBar=3', () => {
      const scene: CirklonScene = {
        gbar: 0,
        length: 8,
        advance: 'auto',
      };
      expect(calculateSceneDuration(scene, 3)).toBe(24);
    });

    it('should handle scene with pattern assignments and mutes', () => {
      const scene: CirklonScene = {
        gbar: 16,
        length: 8,
        advance: 'auto',
        pattern_assignments: {
          track_1: 'Trk1 P3',
          track_2: 'Trk2 C4',
        },
        initial_mutes: ['track_1'],
      };
      expect(calculateSceneDuration(scene, 4)).toBe(32);
    });
  });

  describe('generatePatternName', () => {
    it('should generate P3 pattern name for track 1, index 0', () => {
      expect(generatePatternName(1, 0, 'P3')).toBe('T1_P3_00');
    });

    it('should generate P3 pattern name for track 9, index 5', () => {
      expect(generatePatternName(9, 5, 'P3')).toBe('T9_P3_05');
    });

    it('should generate CK pattern name for track 2, index 0', () => {
      expect(generatePatternName(2, 0, 'CK')).toBe('T2_CK_00');
    });

    it('should generate CK pattern name for track 15, index 12', () => {
      expect(generatePatternName(15, 12, 'CK')).toBe('T15_CK_12');
    });

    it('should pad single digit track numbers', () => {
      expect(generatePatternName(3, 0, 'P3')).toBe('T3_P3_00');
    });

    it('should pad single digit indices', () => {
      expect(generatePatternName(1, 7, 'P3')).toBe('T1_P3_07');
    });

    it('should handle two-digit indices', () => {
      expect(generatePatternName(1, 99, 'P3')).toBe('T1_P3_99');
    });

    it('should handle large track numbers', () => {
      expect(generatePatternName(100, 0, 'P3')).toBe('T100_P3_00');
    });
  });
});
