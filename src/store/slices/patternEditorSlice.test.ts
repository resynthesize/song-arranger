/**
 * Cyclone - Pattern Editor Slice Tests
 * Tests for pattern editor UI Redux reducer
 */

import reducer, {
  openPattern,
  closePattern,
  selectRow,
  selectSteps,
  toggleStepSelection,
  clearStepSelection,
  setCurrentBar,
  setEditorHeight,
  copySteps,
  clearClipboard,
  toggleViewMode,
  toggleRowVisibility,
  setRowVisibility,
  toggleRowCollapsed,
  setRowCollapsed,
} from './patternEditorSlice';
import type { PatternEditorState, PatternRow } from '@/types';

describe('patternEditorSlice', () => {
  const initialState: PatternEditorState = {
    openPatternId: null,
    selectedRow: 'note',
    selectedSteps: [],
    currentBarIndex: 0,
    editorHeight: 400,
    clipboardSteps: null,
    viewMode: 'parameters',
    visibleRows: {
      note: true,
      velocity: true,
      length: true,
      delay: true,
      auxA: true,
      auxB: true,
      auxC: true,
      auxD: true,
    },
    collapsedRows: {
      note: false,
      velocity: false,
      length: false,
      delay: false,
      auxA: false,
      auxB: false,
      auxC: false,
      auxD: false,
    },
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('openPattern', () => {
    it('should open pattern editor for a pattern', () => {
      const newState = reducer(initialState, openPattern('pattern-123'));
      expect(newState.openPatternId).toBe('pattern-123');
    });

    it('should reset state when opening a new pattern', () => {
      const state: PatternEditorState = {
        openPatternId: 'pattern-old',
        selectedRow: 'velocity',
        selectedSteps: [0, 1, 2],
        currentBarIndex: 2,
        editorHeight: 500,
        clipboardSteps: {
          steps: [0, 4, 8],
          barIndex: 1,
          row: 'note',
          values: [60, 64, 67],
        },
      };

      const newState = reducer(state, openPattern('pattern-new'));
      expect(newState.openPatternId).toBe('pattern-new');
      expect(newState.selectedRow).toBe('note');
      expect(newState.selectedSteps).toEqual([]);
      expect(newState.currentBarIndex).toBe(0);
      // Height and clipboard should persist
      expect(newState.editorHeight).toBe(500);
      expect(newState.clipboardSteps).toEqual({
        steps: [0, 4, 8],
        barIndex: 1,
        row: 'note',
        values: [60, 64, 67],
      });
    });

    it('should handle reopening the same pattern', () => {
      const state: PatternEditorState = {
        ...initialState,
        openPatternId: 'pattern-123',
        selectedSteps: [1, 2],
      };

      const newState = reducer(state, openPattern('pattern-123'));
      expect(newState.openPatternId).toBe('pattern-123');
      // Should reset selection even for same pattern
      expect(newState.selectedSteps).toEqual([]);
    });
  });

  describe('closePattern', () => {
    it('should close pattern editor', () => {
      const state: PatternEditorState = {
        ...initialState,
        openPatternId: 'pattern-123',
        selectedSteps: [0, 1, 2],
        selectedRow: 'velocity',
        currentBarIndex: 3,
      };

      const newState = reducer(state, closePattern());
      expect(newState.openPatternId).toBe(null);
      expect(newState.selectedSteps).toEqual([]);
      expect(newState.selectedRow).toBe('note');
      expect(newState.currentBarIndex).toBe(0);
    });

    it('should preserve editor height when closing', () => {
      const state: PatternEditorState = {
        ...initialState,
        openPatternId: 'pattern-123',
        editorHeight: 600,
      };

      const newState = reducer(state, closePattern());
      expect(newState.editorHeight).toBe(600);
    });

    it('should preserve clipboard when closing', () => {
      const clipboard = {
        steps: [0, 4, 8],
        barIndex: 1,
        row: 'note' as PatternRow,
        values: [60, 64, 67],
      };

      const state: PatternEditorState = {
        ...initialState,
        openPatternId: 'pattern-123',
        clipboardSteps: clipboard,
      };

      const newState = reducer(state, closePattern());
      expect(newState.clipboardSteps).toEqual(clipboard);
    });

    it('should be idempotent when no pattern is open', () => {
      const newState = reducer(initialState, closePattern());
      expect(newState).toEqual(initialState);
    });
  });

  describe('selectRow', () => {
    it('should select note row', () => {
      const newState = reducer(initialState, selectRow('note'));
      expect(newState.selectedRow).toBe('note');
    });

    it('should select velocity row', () => {
      const newState = reducer(initialState, selectRow('velocity'));
      expect(newState.selectedRow).toBe('velocity');
    });

    it('should select length row', () => {
      const newState = reducer(initialState, selectRow('length'));
      expect(newState.selectedRow).toBe('length');
    });

    it('should select delay row', () => {
      const newState = reducer(initialState, selectRow('delay'));
      expect(newState.selectedRow).toBe('delay');
    });

    it('should select auxA row', () => {
      const newState = reducer(initialState, selectRow('auxA'));
      expect(newState.selectedRow).toBe('auxA');
    });

    it('should select auxB row', () => {
      const newState = reducer(initialState, selectRow('auxB'));
      expect(newState.selectedRow).toBe('auxB');
    });

    it('should select auxC row', () => {
      const newState = reducer(initialState, selectRow('auxC'));
      expect(newState.selectedRow).toBe('auxC');
    });

    it('should select auxD row', () => {
      const newState = reducer(initialState, selectRow('auxD'));
      expect(newState.selectedRow).toBe('auxD');
    });

    it('should change from one row to another', () => {
      const state = { ...initialState, selectedRow: 'note' as PatternRow };
      const newState = reducer(state, selectRow('velocity'));
      expect(newState.selectedRow).toBe('velocity');
    });

    it('should preserve selected steps when changing rows', () => {
      const state: PatternEditorState = {
        ...initialState,
        selectedRow: 'note',
        selectedSteps: [0, 4, 8, 12],
      };

      const newState = reducer(state, selectRow('velocity'));
      expect(newState.selectedRow).toBe('velocity');
      expect(newState.selectedSteps).toEqual([0, 4, 8, 12]);
    });
  });

  describe('selectSteps', () => {
    it('should select single step', () => {
      const newState = reducer(initialState, selectSteps([5]));
      expect(newState.selectedSteps).toEqual([5]);
    });

    it('should select multiple steps', () => {
      const newState = reducer(initialState, selectSteps([0, 4, 8, 12]));
      expect(newState.selectedSteps).toEqual([0, 4, 8, 12]);
    });

    it('should select all 16 steps', () => {
      const allSteps = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      const newState = reducer(initialState, selectSteps(allSteps));
      expect(newState.selectedSteps).toEqual(allSteps);
    });

    it('should replace existing selection', () => {
      const state: PatternEditorState = {
        ...initialState,
        selectedSteps: [0, 1, 2],
      };

      const newState = reducer(state, selectSteps([10, 11, 12]));
      expect(newState.selectedSteps).toEqual([10, 11, 12]);
    });

    it('should allow empty selection', () => {
      const state: PatternEditorState = {
        ...initialState,
        selectedSteps: [0, 4, 8],
      };

      const newState = reducer(state, selectSteps([]));
      expect(newState.selectedSteps).toEqual([]);
    });

    it('should handle duplicate step indices in input', () => {
      const newState = reducer(initialState, selectSteps([0, 4, 0, 8, 4]));
      // Should store exactly what was provided (component responsible for deduplication if needed)
      expect(newState.selectedSteps).toEqual([0, 4, 0, 8, 4]);
    });

    it('should handle out-of-order step indices', () => {
      const newState = reducer(initialState, selectSteps([15, 0, 8, 4]));
      expect(newState.selectedSteps).toEqual([15, 0, 8, 4]);
    });
  });

  describe('toggleStepSelection', () => {
    it('should add step to empty selection', () => {
      const newState = reducer(initialState, toggleStepSelection(5));
      expect(newState.selectedSteps).toEqual([5]);
    });

    it('should add step to existing selection', () => {
      const state: PatternEditorState = {
        ...initialState,
        selectedSteps: [0, 4],
      };

      const newState = reducer(state, toggleStepSelection(8));
      expect(newState.selectedSteps).toEqual([0, 4, 8]);
    });

    it('should remove step if already selected', () => {
      const state: PatternEditorState = {
        ...initialState,
        selectedSteps: [0, 4, 8],
      };

      const newState = reducer(state, toggleStepSelection(4));
      expect(newState.selectedSteps).toEqual([0, 8]);
    });

    it('should remove first step', () => {
      const state: PatternEditorState = {
        ...initialState,
        selectedSteps: [0, 4, 8],
      };

      const newState = reducer(state, toggleStepSelection(0));
      expect(newState.selectedSteps).toEqual([4, 8]);
    });

    it('should remove last step', () => {
      const state: PatternEditorState = {
        ...initialState,
        selectedSteps: [0, 4, 8],
      };

      const newState = reducer(state, toggleStepSelection(8));
      expect(newState.selectedSteps).toEqual([0, 4]);
    });

    it('should handle toggling step 0', () => {
      const newState = reducer(initialState, toggleStepSelection(0));
      expect(newState.selectedSteps).toEqual([0]);
    });

    it('should handle toggling step 15', () => {
      const newState = reducer(initialState, toggleStepSelection(15));
      expect(newState.selectedSteps).toEqual([15]);
    });

    it('should preserve order when adding steps', () => {
      let state = initialState;
      state = reducer(state, toggleStepSelection(8));
      state = reducer(state, toggleStepSelection(0));
      state = reducer(state, toggleStepSelection(15));
      expect(state.selectedSteps).toEqual([8, 0, 15]);
    });
  });

  describe('clearStepSelection', () => {
    it('should clear selection', () => {
      const state: PatternEditorState = {
        ...initialState,
        selectedSteps: [0, 4, 8, 12],
      };

      const newState = reducer(state, clearStepSelection());
      expect(newState.selectedSteps).toEqual([]);
    });

    it('should be idempotent when selection is empty', () => {
      const newState = reducer(initialState, clearStepSelection());
      expect(newState.selectedSteps).toEqual([]);
    });

    it('should preserve other state', () => {
      const state: PatternEditorState = {
        openPatternId: 'pattern-123',
        selectedRow: 'velocity',
        selectedSteps: [0, 4, 8],
        currentBarIndex: 2,
        editorHeight: 500,
        clipboardSteps: null,
      };

      const newState = reducer(state, clearStepSelection());
      expect(newState.openPatternId).toBe('pattern-123');
      expect(newState.selectedRow).toBe('velocity');
      expect(newState.currentBarIndex).toBe(2);
      expect(newState.editorHeight).toBe(500);
      expect(newState.selectedSteps).toEqual([]);
    });
  });

  describe('setCurrentBar', () => {
    it('should set current bar index', () => {
      const newState = reducer(initialState, setCurrentBar(5));
      expect(newState.currentBarIndex).toBe(5);
    });

    it('should allow bar 0', () => {
      const state: PatternEditorState = {
        ...initialState,
        currentBarIndex: 5,
      };

      const newState = reducer(state, setCurrentBar(0));
      expect(newState.currentBarIndex).toBe(0);
    });

    it('should allow large bar indices', () => {
      const newState = reducer(initialState, setCurrentBar(999));
      expect(newState.currentBarIndex).toBe(999);
    });

    it('should clamp negative values to 0', () => {
      const newState = reducer(initialState, setCurrentBar(-5));
      expect(newState.currentBarIndex).toBe(0);
    });

    it('should preserve selection when changing bars', () => {
      const state: PatternEditorState = {
        ...initialState,
        selectedSteps: [0, 4, 8],
        currentBarIndex: 0,
      };

      const newState = reducer(state, setCurrentBar(1));
      expect(newState.currentBarIndex).toBe(1);
      expect(newState.selectedSteps).toEqual([0, 4, 8]);
    });
  });

  describe('setEditorHeight', () => {
    it('should set editor height', () => {
      const newState = reducer(initialState, setEditorHeight(600));
      expect(newState.editorHeight).toBe(600);
    });

    it('should allow minimum height', () => {
      const newState = reducer(initialState, setEditorHeight(100));
      expect(newState.editorHeight).toBe(100);
    });

    it('should allow large height', () => {
      const newState = reducer(initialState, setEditorHeight(1200));
      expect(newState.editorHeight).toBe(1200);
    });

    it('should clamp negative heights to minimum', () => {
      const newState = reducer(initialState, setEditorHeight(-100));
      expect(newState.editorHeight).toBe(100);
    });

    it('should clamp zero height to minimum', () => {
      const newState = reducer(initialState, setEditorHeight(0));
      expect(newState.editorHeight).toBe(100);
    });

    it('should clamp very small heights to minimum', () => {
      const newState = reducer(initialState, setEditorHeight(50));
      expect(newState.editorHeight).toBe(100);
    });

    it('should preserve height when opening/closing patterns', () => {
      let state = reducer(initialState, setEditorHeight(800));
      state = reducer(state, openPattern('pattern-123'));
      expect(state.editorHeight).toBe(800);

      state = reducer(state, closePattern());
      expect(state.editorHeight).toBe(800);
    });
  });

  describe('copySteps', () => {
    it('should copy steps to clipboard', () => {
      const newState = reducer(
        initialState,
        copySteps({
          steps: [0, 4, 8],
          barIndex: 1,
          row: 'note',
          values: [60, 64, 67],
        })
      );

      expect(newState.clipboardSteps).toEqual({
        steps: [0, 4, 8],
        barIndex: 1,
        row: 'note',
        values: [60, 64, 67],
      });
    });

    it('should copy velocity values', () => {
      const newState = reducer(
        initialState,
        copySteps({
          steps: [0, 1, 2, 3],
          barIndex: 0,
          row: 'velocity',
          values: [64, 80, 96, 127],
        })
      );

      expect(newState.clipboardSteps).toEqual({
        steps: [0, 1, 2, 3],
        barIndex: 0,
        row: 'velocity',
        values: [64, 80, 96, 127],
      });
    });

    it('should copy from different rows', () => {
      const rows: PatternRow[] = ['note', 'velocity', 'length', 'delay', 'auxA', 'auxB', 'auxC', 'auxD'];

      rows.forEach((row) => {
        const newState = reducer(
          initialState,
          copySteps({
            steps: [0],
            barIndex: 0,
            row,
            values: [100],
          })
        );

        expect(newState.clipboardSteps?.row).toBe(row);
      });
    });

    it('should replace existing clipboard', () => {
      const state: PatternEditorState = {
        ...initialState,
        clipboardSteps: {
          steps: [0, 4],
          barIndex: 0,
          row: 'note',
          values: [60, 64],
        },
      };

      const newState = reducer(
        state,
        copySteps({
          steps: [8, 12],
          barIndex: 2,
          row: 'velocity',
          values: [80, 100],
        })
      );

      expect(newState.clipboardSteps).toEqual({
        steps: [8, 12],
        barIndex: 2,
        row: 'velocity',
        values: [80, 100],
      });
    });

    it('should allow copying empty selection', () => {
      const newState = reducer(
        initialState,
        copySteps({
          steps: [],
          barIndex: 0,
          row: 'note',
          values: [],
        })
      );

      expect(newState.clipboardSteps).toEqual({
        steps: [],
        barIndex: 0,
        row: 'note',
        values: [],
      });
    });

    it('should allow copying all 16 steps', () => {
      const allSteps = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      const allValues = allSteps.map((i) => i * 8);

      const newState = reducer(
        initialState,
        copySteps({
          steps: allSteps,
          barIndex: 1,
          row: 'note',
          values: allValues,
        })
      );

      expect(newState.clipboardSteps?.steps).toEqual(allSteps);
      expect(newState.clipboardSteps?.values).toEqual(allValues);
    });

    it('should copy from different bar indices', () => {
      const barIndices = [0, 1, 5, 10, 99];

      barIndices.forEach((barIndex) => {
        const newState = reducer(
          initialState,
          copySteps({
            steps: [0],
            barIndex,
            row: 'note',
            values: [60],
          })
        );

        expect(newState.clipboardSteps?.barIndex).toBe(barIndex);
      });
    });
  });

  describe('clearClipboard', () => {
    it('should clear clipboard', () => {
      const state: PatternEditorState = {
        ...initialState,
        clipboardSteps: {
          steps: [0, 4, 8],
          barIndex: 1,
          row: 'note',
          values: [60, 64, 67],
        },
      };

      const newState = reducer(state, clearClipboard());
      expect(newState.clipboardSteps).toBe(null);
    });

    it('should be idempotent when clipboard is empty', () => {
      const newState = reducer(initialState, clearClipboard());
      expect(newState.clipboardSteps).toBe(null);
    });

    it('should preserve other state', () => {
      const state: PatternEditorState = {
        openPatternId: 'pattern-123',
        selectedRow: 'velocity',
        selectedSteps: [0, 4, 8],
        currentBarIndex: 2,
        editorHeight: 500,
        clipboardSteps: {
          steps: [0, 4],
          barIndex: 1,
          row: 'note',
          values: [60, 64],
        },
      };

      const newState = reducer(state, clearClipboard());
      expect(newState.openPatternId).toBe('pattern-123');
      expect(newState.selectedRow).toBe('velocity');
      expect(newState.selectedSteps).toEqual([0, 4, 8]);
      expect(newState.currentBarIndex).toBe(2);
      expect(newState.editorHeight).toBe(500);
      expect(newState.clipboardSteps).toBe(null);
    });
  });

  describe('integration tests', () => {
    it('should handle complete editing workflow', () => {
      let state = initialState;

      // Open pattern
      state = reducer(state, openPattern('pattern-123'));
      expect(state.openPatternId).toBe('pattern-123');

      // Select velocity row
      state = reducer(state, selectRow('velocity'));
      expect(state.selectedRow).toBe('velocity');

      // Select some steps
      state = reducer(state, selectSteps([0, 4, 8, 12]));
      expect(state.selectedSteps).toEqual([0, 4, 8, 12]);

      // Copy steps
      state = reducer(
        state,
        copySteps({
          steps: [0, 4, 8, 12],
          barIndex: 0,
          row: 'velocity',
          values: [64, 80, 96, 112],
        })
      );
      expect(state.clipboardSteps).toBeTruthy();

      // Navigate to different bar
      state = reducer(state, setCurrentBar(1));
      expect(state.currentBarIndex).toBe(1);

      // Clear selection
      state = reducer(state, clearStepSelection());
      expect(state.selectedSteps).toEqual([]);

      // Clipboard should persist
      expect(state.clipboardSteps).toBeTruthy();

      // Close pattern
      state = reducer(state, closePattern());
      expect(state.openPatternId).toBe(null);

      // Clipboard should still persist after closing
      expect(state.clipboardSteps).toBeTruthy();
    });

    it('should handle multi-select with toggle', () => {
      let state = initialState;

      // Build selection using toggles
      state = reducer(state, toggleStepSelection(0));
      state = reducer(state, toggleStepSelection(4));
      state = reducer(state, toggleStepSelection(8));
      state = reducer(state, toggleStepSelection(12));
      expect(state.selectedSteps).toEqual([0, 4, 8, 12]);

      // Toggle off middle step
      state = reducer(state, toggleStepSelection(4));
      expect(state.selectedSteps).toEqual([0, 8, 12]);

      // Toggle it back on
      state = reducer(state, toggleStepSelection(4));
      expect(state.selectedSteps).toEqual([0, 8, 12, 4]);
    });

    it('should handle row switching with persistent selection', () => {
      let state = initialState;

      // Select steps in note row
      state = reducer(state, selectSteps([0, 4, 8]));
      state = reducer(state, selectRow('note'));

      // Switch to velocity row - selection persists
      state = reducer(state, selectRow('velocity'));
      expect(state.selectedSteps).toEqual([0, 4, 8]);

      // Switch to length row - selection still persists
      state = reducer(state, selectRow('length'));
      expect(state.selectedSteps).toEqual([0, 4, 8]);
    });

    it('should handle opening different patterns sequentially', () => {
      let state = initialState;

      // Open first pattern and set it up
      state = reducer(state, openPattern('pattern-1'));
      state = reducer(state, selectRow('velocity'));
      state = reducer(state, selectSteps([0, 4]));
      state = reducer(state, setCurrentBar(2));

      // Open second pattern - should reset editing state but keep height
      state = reducer(state, setEditorHeight(700));
      state = reducer(state, openPattern('pattern-2'));

      expect(state.openPatternId).toBe('pattern-2');
      expect(state.selectedRow).toBe('note'); // Reset
      expect(state.selectedSteps).toEqual([]); // Reset
      expect(state.currentBarIndex).toBe(0); // Reset
      expect(state.editorHeight).toBe(700); // Persisted
    });
  });

  describe('edge cases', () => {
    it('should handle maximum step index (15)', () => {
      const newState = reducer(initialState, selectSteps([15]));
      expect(newState.selectedSteps).toEqual([15]);
    });

    it('should handle steps beyond 15 (component should validate)', () => {
      // Slice doesn't validate - component's responsibility
      const newState = reducer(initialState, selectSteps([16, 20, 100]));
      expect(newState.selectedSteps).toEqual([16, 20, 100]);
    });

    it('should handle negative step indices (component should validate)', () => {
      // Slice doesn't validate - component's responsibility
      const newState = reducer(initialState, selectSteps([-1, -5]));
      expect(newState.selectedSteps).toEqual([-1, -5]);
    });

    it('should handle very large bar indices', () => {
      const newState = reducer(initialState, setCurrentBar(999999));
      expect(newState.currentBarIndex).toBe(999999);
    });

    it('should handle pattern ID edge cases', () => {
      const edgeCaseIds = ['', '123', 'pattern-with-very-long-id-string', 'special!@#$%'];

      edgeCaseIds.forEach((id) => {
        const newState = reducer(initialState, openPattern(id));
        expect(newState.openPatternId).toBe(id);
      });
    });
  });

  describe('toggleViewMode', () => {
    it('should toggle from parameters to aux view', () => {
      const newState = reducer(initialState, toggleViewMode());
      expect(newState.viewMode).toBe('aux');
    });

    it('should toggle from aux to bar view', () => {
      const state: PatternEditorState = {
        ...initialState,
        viewMode: 'aux',
      };

      const newState = reducer(state, toggleViewMode());
      expect(newState.viewMode).toBe('bar');
    });

    it('should toggle from bar to parameters view', () => {
      const state: PatternEditorState = {
        ...initialState,
        viewMode: 'bar',
      };

      const newState = reducer(state, toggleViewMode());
      expect(newState.viewMode).toBe('parameters');
      expect(newState.selectedRow).toBe('note');
    });

    it('should reset selectedRow to note when switching to bar view', () => {
      const state: PatternEditorState = {
        ...initialState,
        viewMode: 'aux',
        selectedRow: 'auxA',
      };

      const newState = reducer(state, toggleViewMode());
      expect(newState.viewMode).toBe('bar');
      expect(newState.selectedRow).toBe('note');
    });

    it('should reset selectedRow to auxA when switching to aux view', () => {
      const state: PatternEditorState = {
        ...initialState,
        viewMode: 'parameters',
        selectedRow: 'velocity',
      };

      const newState = reducer(state, toggleViewMode());
      expect(newState.viewMode).toBe('aux');
      expect(newState.selectedRow).toBe('auxA');
    });

    it('should preserve other state when toggling view mode', () => {
      const state: PatternEditorState = {
        openPatternId: 'pattern-123',
        selectedRow: 'velocity',
        selectedSteps: [0, 4, 8],
        currentBarIndex: 2,
        editorHeight: 500,
        clipboardSteps: {
          steps: [1, 2],
          barIndex: 0,
          row: 'note',
          values: [60, 64],
        },
        viewMode: 'parameters',
      };

      const newState = reducer(state, toggleViewMode());
      expect(newState.openPatternId).toBe('pattern-123');
      expect(newState.selectedSteps).toEqual([0, 4, 8]);
      expect(newState.currentBarIndex).toBe(2);
      expect(newState.editorHeight).toBe(500);
      expect(newState.clipboardSteps).toEqual({
        steps: [1, 2],
        barIndex: 0,
        row: 'note',
        values: [60, 64],
      });
    });
  });

  describe('viewMode reset on open/close', () => {
    it('should reset viewMode to parameters when opening a pattern', () => {
      const state: PatternEditorState = {
        ...initialState,
        viewMode: 'aux',
        selectedRow: 'auxC',
      };

      const newState = reducer(state, openPattern('pattern-123'));
      expect(newState.viewMode).toBe('parameters');
      expect(newState.selectedRow).toBe('note');
    });

    it('should reset viewMode to parameters when closing a pattern', () => {
      const state: PatternEditorState = {
        ...initialState,
        openPatternId: 'pattern-123',
        viewMode: 'aux',
        selectedRow: 'auxD',
      };

      const newState = reducer(state, closePattern());
      expect(newState.viewMode).toBe('parameters');
      expect(newState.selectedRow).toBe('note');
    });
  });

  describe('toggleRowVisibility', () => {
    it('should toggle row from visible to hidden', () => {
      const newState = reducer(initialState, toggleRowVisibility('note'));
      expect(newState.visibleRows.note).toBe(false);
    });

    it('should toggle row from hidden to visible', () => {
      const state: PatternEditorState = {
        ...initialState,
        visibleRows: {
          ...initialState.visibleRows,
          velocity: false,
        },
      };

      const newState = reducer(state, toggleRowVisibility('velocity'));
      expect(newState.visibleRows.velocity).toBe(true);
    });

    it('should only affect the specified row', () => {
      const newState = reducer(initialState, toggleRowVisibility('note'));
      expect(newState.visibleRows.note).toBe(false);
      expect(newState.visibleRows.velocity).toBe(true);
      expect(newState.visibleRows.length).toBe(true);
      expect(newState.visibleRows.delay).toBe(true);
    });
  });

  describe('setRowVisibility', () => {
    it('should set row to visible', () => {
      const state: PatternEditorState = {
        ...initialState,
        visibleRows: {
          ...initialState.visibleRows,
          note: false,
        },
      };

      const newState = reducer(state, setRowVisibility({ row: 'note', visible: true }));
      expect(newState.visibleRows.note).toBe(true);
    });

    it('should set row to hidden', () => {
      const newState = reducer(initialState, setRowVisibility({ row: 'velocity', visible: false }));
      expect(newState.visibleRows.velocity).toBe(false);
    });

    it('should handle all row types', () => {
      const rows: PatternRow[] = ['note', 'velocity', 'length', 'delay', 'auxA', 'auxB', 'auxC', 'auxD'];

      rows.forEach((row) => {
        const newState = reducer(initialState, setRowVisibility({ row, visible: false }));
        expect(newState.visibleRows[row]).toBe(false);
      });
    });
  });

  describe('toggleRowCollapsed', () => {
    it('should toggle row from expanded to collapsed', () => {
      const newState = reducer(initialState, toggleRowCollapsed('note'));
      expect(newState.collapsedRows.note).toBe(true);
    });

    it('should toggle row from collapsed to expanded', () => {
      const state: PatternEditorState = {
        ...initialState,
        collapsedRows: {
          ...initialState.collapsedRows,
          velocity: true,
        },
      };

      const newState = reducer(state, toggleRowCollapsed('velocity'));
      expect(newState.collapsedRows.velocity).toBe(false);
    });

    it('should only affect the specified row', () => {
      const newState = reducer(initialState, toggleRowCollapsed('note'));
      expect(newState.collapsedRows.note).toBe(true);
      expect(newState.collapsedRows.velocity).toBe(false);
      expect(newState.collapsedRows.length).toBe(false);
      expect(newState.collapsedRows.delay).toBe(false);
    });
  });

  describe('setRowCollapsed', () => {
    it('should set row to collapsed', () => {
      const newState = reducer(initialState, setRowCollapsed({ row: 'note', collapsed: true }));
      expect(newState.collapsedRows.note).toBe(true);
    });

    it('should set row to expanded', () => {
      const state: PatternEditorState = {
        ...initialState,
        collapsedRows: {
          ...initialState.collapsedRows,
          velocity: true,
        },
      };

      const newState = reducer(state, setRowCollapsed({ row: 'velocity', collapsed: false }));
      expect(newState.collapsedRows.velocity).toBe(false);
    });

    it('should handle all row types', () => {
      const rows: PatternRow[] = ['note', 'velocity', 'length', 'delay', 'auxA', 'auxB', 'auxC', 'auxD'];

      rows.forEach((row) => {
        const newState = reducer(initialState, setRowCollapsed({ row, collapsed: true }));
        expect(newState.collapsedRows[row]).toBe(true);
      });
    });
  });
});
