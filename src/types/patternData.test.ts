/**
 * Cyclone - Pattern Data Type Tests
 * Tests for P3 pattern data type guards and validation
 */

import {
  isP3Pattern,
  isValidP3Bar,
  type P3Bar,
  type P3PatternData,
  type P3PatternFull,
} from './patternData';

describe('patternData type guards', () => {
  describe('isValidP3Bar', () => {
    // Helper to create a minimal valid bar
    const createValidBar = (): P3Bar => ({
      direction: 'forward',
      tbase: ' 16',
      last_step: 16,
      xpos: 0,
      reps: 1,
      gbar: false,
      note: Array(16).fill('C 4'),
      velo: Array(16).fill(100),
      length: Array(16).fill(96),
      delay: Array(16).fill(0),
      aux_A_value: Array(16).fill(0),
      aux_B_value: Array(16).fill(0),
      aux_C_value: Array(16).fill(0),
      aux_D_value: Array(16).fill(0),
      gate: Array(16).fill(1),
      tie: Array(16).fill(0),
      skip: Array(16).fill(0),
      note_X: Array(16).fill(0),
      aux_A_flag: Array(16).fill(0),
      aux_B_flag: Array(16).fill(0),
      aux_C_flag: Array(16).fill(0),
      aux_D_flag: Array(16).fill(0),
    });

    it('should return true for valid P3Bar', () => {
      const validBar = createValidBar();
      expect(isValidP3Bar(validBar)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isValidP3Bar(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidP3Bar(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isValidP3Bar('not an object')).toBe(false);
      expect(isValidP3Bar(42)).toBe(false);
      expect(isValidP3Bar(true)).toBe(false);
    });

    it('should return false when direction is missing', () => {
      const invalidBar = { ...createValidBar() };
      delete (invalidBar as Partial<P3Bar>).direction;
      expect(isValidP3Bar(invalidBar)).toBe(false);
    });

    it('should return false when direction is wrong type', () => {
      const invalidBar = { ...createValidBar(), direction: 123 };
      expect(isValidP3Bar(invalidBar)).toBe(false);
    });

    it('should return false when tbase is wrong type', () => {
      const invalidBar = { ...createValidBar(), tbase: 16 };
      expect(isValidP3Bar(invalidBar)).toBe(false);
    });

    it('should return false when last_step is wrong type', () => {
      const invalidBar = { ...createValidBar(), last_step: '16' };
      expect(isValidP3Bar(invalidBar)).toBe(false);
    });

    it('should return false when array is missing', () => {
      const invalidBar = { ...createValidBar() };
      delete (invalidBar as Partial<P3Bar>).note;
      expect(isValidP3Bar(invalidBar)).toBe(false);
    });

    it('should return false when array has wrong length', () => {
      const invalidBar = {
        ...createValidBar(),
        note: Array(15).fill('C 4'), // Only 15 elements instead of 16
      };
      expect(isValidP3Bar(invalidBar)).toBe(false);
    });

    it('should return false when array has too many elements', () => {
      const invalidBar = {
        ...createValidBar(),
        velo: Array(17).fill(100), // 17 elements instead of 16
      };
      expect(isValidP3Bar(invalidBar)).toBe(false);
    });

    it('should return false when array field is not an array', () => {
      const invalidBar = {
        ...createValidBar(),
        gate: 'not an array',
      };
      expect(isValidP3Bar(invalidBar)).toBe(false);
    });

    it('should validate all required arrays', () => {
      const requiredArrays = [
        'note',
        'velo',
        'length',
        'delay',
        'aux_A_value',
        'aux_B_value',
        'aux_C_value',
        'aux_D_value',
        'gate',
        'tie',
        'skip',
        'note_X',
        'aux_A_flag',
        'aux_B_flag',
        'aux_C_flag',
        'aux_D_flag',
      ];

      requiredArrays.forEach((arrayName) => {
        const invalidBar = { ...createValidBar() };
        delete (invalidBar as Record<string, unknown>)[arrayName];
        expect(isValidP3Bar(invalidBar)).toBe(false);
      });
    });
  });

  describe('isP3Pattern', () => {
    // Helper to create a minimal valid pattern
    const createValidPattern = (): P3PatternFull => ({
      type: 'P3',
      creator_track: 1,
      saved: true,
      bar_count: 1,
      patternData: {
        bars: [
          {
            direction: 'forward',
            tbase: ' 16',
            last_step: 16,
            xpos: 0,
            reps: 1,
            gbar: false,
            note: Array(16).fill('C 4'),
            velo: Array(16).fill(100),
            length: Array(16).fill(96),
            delay: Array(16).fill(0),
            aux_A_value: Array(16).fill(0),
            aux_B_value: Array(16).fill(0),
            aux_C_value: Array(16).fill(0),
            aux_D_value: Array(16).fill(0),
            gate: Array(16).fill(1),
            tie: Array(16).fill(0),
            skip: Array(16).fill(0),
            note_X: Array(16).fill(0),
            aux_A_flag: Array(16).fill(0),
            aux_B_flag: Array(16).fill(0),
            aux_C_flag: Array(16).fill(0),
            aux_D_flag: Array(16).fill(0),
          },
        ],
      },
    });

    it('should return true for valid P3 pattern', () => {
      const validPattern = createValidPattern();
      expect(isP3Pattern(validPattern)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isP3Pattern(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isP3Pattern(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isP3Pattern('not an object')).toBe(false);
      expect(isP3Pattern(42)).toBe(false);
    });

    it('should return false when type is not P3', () => {
      const invalidPattern = { ...createValidPattern(), type: 'CK' };
      expect(isP3Pattern(invalidPattern)).toBe(false);
    });

    it('should return false when type is missing', () => {
      const invalidPattern = { ...createValidPattern() };
      delete (invalidPattern as Partial<P3PatternFull>).type;
      expect(isP3Pattern(invalidPattern)).toBe(false);
    });

    it('should return false when creator_track is wrong type', () => {
      const invalidPattern = { ...createValidPattern(), creator_track: '1' };
      expect(isP3Pattern(invalidPattern)).toBe(false);
    });

    it('should return false when saved is wrong type', () => {
      const invalidPattern = { ...createValidPattern(), saved: 'true' };
      expect(isP3Pattern(invalidPattern)).toBe(false);
    });

    it('should return false when bar_count is wrong type', () => {
      const invalidPattern = { ...createValidPattern(), bar_count: '1' };
      expect(isP3Pattern(invalidPattern)).toBe(false);
    });

    it('should return false when patternData is missing', () => {
      const invalidPattern = { ...createValidPattern() };
      delete (invalidPattern as Partial<P3PatternFull>).patternData;
      expect(isP3Pattern(invalidPattern)).toBe(false);
    });

    it('should return false when patternData is not an object', () => {
      const invalidPattern = {
        ...createValidPattern(),
        patternData: 'not an object',
      };
      expect(isP3Pattern(invalidPattern)).toBe(false);
    });

    it('should return false when bars array is missing', () => {
      const invalidPattern = {
        ...createValidPattern(),
        patternData: {},
      };
      expect(isP3Pattern(invalidPattern)).toBe(false);
    });

    it('should return false when bars is not an array', () => {
      const invalidPattern = {
        ...createValidPattern(),
        patternData: { bars: 'not an array' },
      };
      expect(isP3Pattern(invalidPattern)).toBe(false);
    });

    it('should accept pattern with aux assignments', () => {
      const patternWithAux: P3PatternFull = {
        ...createValidPattern(),
        patternData: {
          ...createValidPattern().patternData,
          aux_A: 'cc #1',
          aux_B: 'cc #4',
          aux_C: 'cc #6',
          aux_D: 'cc #10',
        },
      };
      expect(isP3Pattern(patternWithAux)).toBe(true);
    });

    it('should accept pattern with loop settings', () => {
      const patternWithLoop: P3PatternFull = {
        ...createValidPattern(),
        patternData: {
          ...createValidPattern().patternData,
          loop_start: 1,
          loop_end: 4,
        },
      };
      expect(isP3Pattern(patternWithLoop)).toBe(true);
    });

    it('should accept pattern with accumulator config', () => {
      const patternWithAccum: P3PatternFull = {
        ...createValidPattern(),
        patternData: {
          ...createValidPattern().patternData,
          accumulator_config: {
            note: {
              limit: 36,
              mode: 'rtz',
              out: 'clip',
            },
            RoPS: true,
            XdAcD: false,
          },
        },
      };
      expect(isP3Pattern(patternWithAccum)).toBe(true);
    });

    it('should accept pattern with multiple bars', () => {
      const multiBarPattern: P3PatternFull = createValidPattern();
      multiBarPattern.bar_count = 4;
      multiBarPattern.patternData.bars = [
        ...multiBarPattern.patternData.bars,
        ...Array(3)
          .fill(null)
          .map(() => ({ ...multiBarPattern.patternData.bars[0] })),
      ];
      expect(isP3Pattern(multiBarPattern)).toBe(true);
    });
  });
});
