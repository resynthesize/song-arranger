/**
 * Cyclone - Patterns Slice Tests
 * Tests for patterns Redux reducer
 */

import reducer, {
  addPattern,
  removePattern,
  removePatterns,
  movePattern,
  movePatterns,
  resizePattern,
  resizePatterns,
  updatePattern,
  duplicatePattern,
  duplicatePatterns,
  updatePatternTrack,
  updateStepValue,
  updateStepNote,
  toggleGate,
  toggleAuxFlag,
} from './patternsSlice';
import type { PatternsState, Pattern, P3Bar, P3PatternData } from '@/types';

describe('patternsSlice', () => {
  const initialState: PatternsState = {
    patterns: [],
    editingPatternId: null,
  };

  const pattern1: Pattern = {
    id: 'pattern-1',
    trackId: 'track-1',
    position: 0,
    duration: 4,
    label: 'Intro',
  };

  const pattern2: Pattern = {
    id: 'pattern-2',
    trackId: 'track-1',
    position: 8,
    duration: 4,
  };

  const pattern3: Pattern = {
    id: 'pattern-3',
    trackId: 'track-2',
    position: 0,
    duration: 8,
  };

  const stateWithPatterns: PatternsState = {
    patterns: [pattern1, pattern2, pattern3],
    editingPatternId: null,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('addPattern', () => {
    it('should add a new pattern', () => {
      const newState = reducer(
        initialState,
        addPattern({ trackId: 'track-1', position: 0, duration: 4 })
      );
      expect(newState.patterns).toHaveLength(1);
      const pattern = newState.patterns[0];
      expect(pattern).toBeDefined();
      expect(pattern?.trackId).toBe('track-1');
      expect(pattern?.position).toBe(0);
      expect(pattern?.duration).toBe(4);
      expect(pattern?.id).toBeDefined();
    });

    it('should add a pattern with optional label', () => {
      const newState = reducer(
        initialState,
        addPattern({ trackId: 'track-1', position: 0, duration: 4, label: 'Verse' })
      );
      expect(newState.patterns[0]?.label).toBe('Verse');
    });

    it('should use default duration if not provided', () => {
      const newState = reducer(
        initialState,
        addPattern({ trackId: 'track-1', position: 0 })
      );
      expect(newState.patterns[0]?.duration).toBe(4);
    });
  });

  describe('removePattern', () => {
    it('should remove pattern by id', () => {
      const newState = reducer(stateWithPatterns, removePattern('pattern-2'));
      expect(newState.patterns).toHaveLength(2);
      expect(newState.patterns.find((c) => c.id === 'pattern-2')).toBeUndefined();
    });

    it('should do nothing if pattern not found', () => {
      const newState = reducer(stateWithPatterns, removePattern('non-existent'));
      expect(newState.patterns).toHaveLength(3);
    });
  });

  describe('removePatterns', () => {
    it('should remove multiple patterns by ids', () => {
      const newState = reducer(
        stateWithPatterns,
        removePatterns(['pattern-1', 'pattern-3'])
      );
      expect(newState.patterns).toHaveLength(1);
      expect(newState.patterns[0]?.id).toBe('pattern-2');
    });

    it('should handle empty array', () => {
      const newState = reducer(stateWithPatterns, removePatterns([]));
      expect(newState.patterns).toHaveLength(3);
    });
  });

  describe('movePattern', () => {
    it('should move pattern to new position', () => {
      const newState = reducer(
        stateWithPatterns,
        movePattern({ patternId: 'pattern-1', position: 16 })
      );
      const movedPattern = newState.patterns.find((c) => c.id === 'pattern-1');
      expect(movedPattern?.position).toBe(16);
    });

    it('should not allow negative position', () => {
      const newState = reducer(
        stateWithPatterns,
        movePattern({ patternId: 'pattern-1', position: -5 })
      );
      const movedPattern = newState.patterns.find((c) => c.id === 'pattern-1');
      expect(movedPattern?.position).toBe(0);
    });

    it('should do nothing if pattern not found', () => {
      const newState = reducer(
        stateWithPatterns,
        movePattern({ patternId: 'non-existent', position: 10 })
      );
      expect(newState.patterns).toEqual(stateWithPatterns.patterns);
    });
  });

  describe('movePatterns', () => {
    it('should move multiple patterns by delta', () => {
      const newState = reducer(
        stateWithPatterns,
        movePatterns({ patternIds: ['pattern-1', 'pattern-2'], delta: 4 })
      );
      expect(newState.patterns[0]?.position).toBe(4);
      expect(newState.patterns[1]?.position).toBe(12);
      expect(newState.patterns[2]?.position).toBe(0); // pattern-3 unchanged
    });

    it('should not move patterns to negative positions', () => {
      const newState = reducer(
        stateWithPatterns,
        movePatterns({ patternIds: ['pattern-1', 'pattern-2'], delta: -10 })
      );
      expect(newState.patterns[0]?.position).toBe(0);
      expect(newState.patterns[1]?.position).toBe(0);
    });
  });

  describe('resizePattern', () => {
    it('should resize pattern to new duration', () => {
      const newState = reducer(
        stateWithPatterns,
        resizePattern({ patternId: 'pattern-1', duration: 8 })
      );
      const resizedPattern = newState.patterns.find((c) => c.id === 'pattern-1');
      expect(resizedPattern?.duration).toBe(8);
    });

    it('should enforce minimum duration of 1 beat', () => {
      const newState = reducer(
        stateWithPatterns,
        resizePattern({ patternId: 'pattern-1', duration: 0.5 })
      );
      const resizedPattern = newState.patterns.find((c) => c.id === 'pattern-1');
      expect(resizedPattern?.duration).toBe(1);
    });

    it('should do nothing if pattern not found', () => {
      const newState = reducer(
        stateWithPatterns,
        resizePattern({ patternId: 'non-existent', duration: 10 })
      );
      expect(newState.patterns).toEqual(stateWithPatterns.patterns);
    });
  });

  describe('resizePatterns', () => {
    it('should resize multiple patterns proportionally', () => {
      const newState = reducer(
        stateWithPatterns,
        resizePatterns({ patternIds: ['pattern-1', 'pattern-3'], factor: 2 })
      );
      expect(newState.patterns[0]?.duration).toBe(8); // 4 * 2
      expect(newState.patterns[1]?.duration).toBe(4); // pattern-2 unchanged
      expect(newState.patterns[2]?.duration).toBe(16); // 8 * 2
    });

    it('should not resize below minimum duration', () => {
      const newState = reducer(
        stateWithPatterns,
        resizePatterns({ patternIds: ['pattern-1'], factor: 0.1 })
      );
      expect(newState.patterns[0]?.duration).toBe(1);
    });
  });

  describe('updatePattern', () => {
    it('should update pattern properties', () => {
      const newState = reducer(
        stateWithPatterns,
        updatePattern({ patternId: 'pattern-1', updates: { label: 'Updated', duration: 6 } })
      );
      const updatedPattern = newState.patterns.find((c) => c.id === 'pattern-1');
      expect(updatedPattern?.label).toBe('Updated');
      expect(updatedPattern?.duration).toBe(6);
      expect(updatedPattern?.position).toBe(0); // unchanged
    });

    it('should do nothing if pattern not found', () => {
      const newState = reducer(
        stateWithPatterns,
        updatePattern({ patternId: 'non-existent', updates: { label: 'Test' } })
      );
      expect(newState.patterns).toEqual(stateWithPatterns.patterns);
    });
  });

  describe('duplicatePattern', () => {
    it('should create a copy of a pattern with new ID', () => {
      const newState = reducer(stateWithPatterns, duplicatePattern('pattern-1'));
      expect(newState.patterns).toHaveLength(4);
      const duplicatedPattern = newState.patterns[3];
      expect(duplicatedPattern).toBeDefined();
      expect(duplicatedPattern?.id).not.toBe('pattern-1');
      expect(duplicatedPattern?.trackId).toBe('track-1');
      expect(duplicatedPattern?.position).toBe(0);
      expect(duplicatedPattern?.duration).toBe(4);
      expect(duplicatedPattern?.label).toBe('Intro');
    });

    it('should do nothing if pattern not found', () => {
      const newState = reducer(stateWithPatterns, duplicatePattern('non-existent'));
      expect(newState.patterns).toHaveLength(3);
    });
  });

  describe('duplicatePatterns', () => {
    it('should create copies of multiple patterns', () => {
      const newState = reducer(
        stateWithPatterns,
        duplicatePatterns(['pattern-1', 'pattern-2'])
      );
      expect(newState.patterns).toHaveLength(5);

      // Check first duplicate
      const duplicate1 = newState.patterns[3];
      expect(duplicate1?.id).not.toBe('pattern-1');
      expect(duplicate1?.trackId).toBe('track-1');
      expect(duplicate1?.position).toBe(0);
      expect(duplicate1?.duration).toBe(4);

      // Check second duplicate
      const duplicate2 = newState.patterns[4];
      expect(duplicate2?.id).not.toBe('pattern-2');
      expect(duplicate2?.trackId).toBe('track-1');
      expect(duplicate2?.position).toBe(8);
      expect(duplicate2?.duration).toBe(4);
    });

    it('should handle empty array', () => {
      const newState = reducer(stateWithPatterns, duplicatePatterns([]));
      expect(newState.patterns).toHaveLength(3);
    });

    it('should skip non-existent patterns', () => {
      const newState = reducer(
        stateWithPatterns,
        duplicatePatterns(['pattern-1', 'non-existent', 'pattern-2'])
      );
      expect(newState.patterns).toHaveLength(5); // Only 2 new patterns created
    });
  });

  describe('updatePatternTrack', () => {
    it('should move pattern to different track', () => {
      const newState = reducer(
        stateWithPatterns,
        updatePatternTrack({ patternId: 'pattern-1', trackId: 'track-2' })
      );
      const movedPattern = newState.patterns.find((c) => c.id === 'pattern-1');
      expect(movedPattern?.trackId).toBe('track-2');
      expect(movedPattern?.position).toBe(0); // Position unchanged
      expect(movedPattern?.duration).toBe(4); // Duration unchanged
    });

    it('should move multiple patterns to same track', () => {
      const newState = reducer(
        stateWithPatterns,
        updatePatternTrack({ patternId: ['pattern-1', 'pattern-2'], trackId: 'track-3' })
      );
      const movedPattern1 = newState.patterns.find((c) => c.id === 'pattern-1');
      const movedPattern2 = newState.patterns.find((c) => c.id === 'pattern-2');
      expect(movedPattern1?.trackId).toBe('track-3');
      expect(movedPattern2?.trackId).toBe('track-3');
    });

    it('should do nothing if pattern not found', () => {
      const newState = reducer(
        stateWithPatterns,
        updatePatternTrack({ patternId: 'non-existent', trackId: 'track-2' })
      );
      expect(newState.patterns).toEqual(stateWithPatterns.patterns);
    });
  });

  describe('updateStepValue', () => {
    // Helper to create a pattern with P3 data
    const createPatternWithData = (): Pattern => ({
      id: 'pattern-p3',
      trackId: 'track-1',
      position: 0,
      duration: 4,
      patternType: 'P3',
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
            velo: Array(16).fill(64),
            length: Array(16).fill(24),
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
          } as P3Bar,
        ],
      },
    });

    it('should update velocity value for a step', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      const newState = reducer(
        stateWithP3,
        updateStepValue({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 5,
          row: 'velocity',
          value: 100,
        })
      );

      const pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.velo[5]).toBe(100);
        // Other steps unchanged
        expect(pattern.patternData.bars[0]?.velo[0]).toBe(64);
      }
    });

    it('should clamp velocity to min value of 1', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      const newState = reducer(
        stateWithP3,
        updateStepValue({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 3,
          row: 'velocity',
          value: 0,
        })
      );

      const pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.velo[3]).toBe(1);
      }
    });

    it('should clamp velocity to max value of 127', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      const newState = reducer(
        stateWithP3,
        updateStepValue({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 3,
          row: 'velocity',
          value: 200,
        })
      );

      const pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.velo[3]).toBe(127);
      }
    });

    it('should update delay value', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      const newState = reducer(
        stateWithP3,
        updateStepValue({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 2,
          row: 'delay',
          value: 24,
        })
      );

      const pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.delay[2]).toBe(24);
      }
    });

    it('should clamp delay to range 0-47', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      let newState = reducer(
        stateWithP3,
        updateStepValue({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 1,
          row: 'delay',
          value: 60,
        })
      );

      let pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.delay[1]).toBe(47);
      }

      newState = reducer(
        stateWithP3,
        updateStepValue({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 1,
          row: 'delay',
          value: -5,
        })
      );

      pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.delay[1]).toBe(0);
      }
    });

    it('should do nothing if pattern has no patternData', () => {
      const stateWithoutData: PatternsState = {
        patterns: [pattern1],
        editingPatternId: null,
      };

      const newState = reducer(
        stateWithoutData,
        updateStepValue({
          patternId: 'pattern-1',
          barIndex: 0,
          stepIndex: 0,
          row: 'velocity',
          value: 100,
        })
      );

      expect(newState.patterns).toEqual(stateWithoutData.patterns);
    });
  });

  describe('updateStepNote', () => {
    const createPatternWithData = (): Pattern => ({
      id: 'pattern-p3',
      trackId: 'track-1',
      position: 0,
      duration: 4,
      patternType: 'P3',
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
            velo: Array(16).fill(64),
            length: Array(16).fill(24),
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
          } as P3Bar,
        ],
      },
    });

    it('should update note value for a step', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      const newState = reducer(
        stateWithP3,
        updateStepNote({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 7,
          note: 'G#5',
        })
      );

      const pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.note[7]).toBe('G#5');
        // Other steps unchanged
        expect(pattern.patternData.bars[0]?.note[0]).toBe('C 4');
      }
    });
  });

  describe('toggleGate', () => {
    const createPatternWithData = (): Pattern => ({
      id: 'pattern-p3',
      trackId: 'track-1',
      position: 0,
      duration: 4,
      patternType: 'P3',
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
            velo: Array(16).fill(64),
            length: Array(16).fill(24),
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
          } as P3Bar,
        ],
      },
    });

    it('should toggle gate from on to off', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      const newState = reducer(
        stateWithP3,
        toggleGate({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 3,
        })
      );

      const pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.gate[3]).toBe(0);
        // Other steps unchanged
        expect(pattern.patternData.bars[0]?.gate[0]).toBe(1);
      }
    });

    it('should toggle gate from off to on', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      // First toggle off
      let newState = reducer(
        stateWithP3,
        toggleGate({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 5,
        })
      );

      // Then toggle back on
      newState = reducer(
        newState,
        toggleGate({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 5,
        })
      );

      const pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.gate[5]).toBe(1);
      }
    });
  });

  describe('toggleAuxFlag', () => {
    const createPatternWithData = (): Pattern => ({
      id: 'pattern-p3',
      trackId: 'track-1',
      position: 0,
      duration: 4,
      patternType: 'P3',
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
            velo: Array(16).fill(64),
            length: Array(16).fill(24),
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
          } as P3Bar,
        ],
      },
    });

    it('should toggle aux A flag from off to on', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      const newState = reducer(
        stateWithP3,
        toggleAuxFlag({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 4,
          auxRow: 'auxA',
        })
      );

      const pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.aux_A_flag[4]).toBe(1);
        // Other steps unchanged
        expect(pattern.patternData.bars[0]?.aux_A_flag[0]).toBe(0);
      }
    });

    it('should toggle aux B flag', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      const newState = reducer(
        stateWithP3,
        toggleAuxFlag({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 6,
          auxRow: 'auxB',
        })
      );

      const pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.aux_B_flag[6]).toBe(1);
      }
    });

    it('should toggle aux C flag', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      const newState = reducer(
        stateWithP3,
        toggleAuxFlag({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 8,
          auxRow: 'auxC',
        })
      );

      const pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.aux_C_flag[8]).toBe(1);
      }
    });

    it('should toggle aux D flag', () => {
      const stateWithP3: PatternsState = {
        patterns: [createPatternWithData()],
        editingPatternId: null,
      };

      const newState = reducer(
        stateWithP3,
        toggleAuxFlag({
          patternId: 'pattern-p3',
          barIndex: 0,
          stepIndex: 10,
          auxRow: 'auxD',
        })
      );

      const pattern = newState.patterns[0];
      if (pattern && pattern.patternData) {
        expect(pattern.patternData.bars[0]?.aux_D_flag[10]).toBe(1);
      }
    });
  });
});
