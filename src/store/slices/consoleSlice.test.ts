/**
 * Cyclone - Console Slice Tests
 * Tests for live coding console state management
 */

import consoleReducer, {
  addToHistory,
  setCurrentInput,
  navigateHistoryUp,
  navigateHistoryDown,
  toggleExpanded,
  clearHistory,
  setAutocomplete,
  hideAutocomplete,
} from './consoleSlice';
import type { ConsoleState, ConsoleEntry } from './consoleSlice';

describe('consoleSlice', () => {
  const initialState: ConsoleState = {
    history: [],
    currentInput: '',
    historyIndex: -1,
    isExpanded: false,
    autocompleteVisible: false,
    autocompleteOptions: [],
    cursorPosition: 0,
  };

  describe('addToHistory', () => {
    it('should add command to history', () => {
      const entry: ConsoleEntry = {
        input: 'pattern("A01").setNote("C4")',
        output: 'Pattern A01 updated',
        timestamp: Date.now(),
      };

      const newState = consoleReducer(
        initialState,
        addToHistory(entry)
      );

      expect(newState.history).toHaveLength(1);
      expect(newState.history[0]).toEqual(entry);
      expect(newState.historyIndex).toBe(-1); // Reset to bottom
    });

    it('should add error to history', () => {
      const entry: ConsoleEntry = {
        input: 'invalid command',
        error: 'SyntaxError: Unexpected identifier',
        timestamp: Date.now(),
      };

      const newState = consoleReducer(
        initialState,
        addToHistory(entry)
      );

      expect(newState.history).toHaveLength(1);
      expect(newState.history[0]).toEqual(entry);
      expect(newState.history[0].error).toBe('SyntaxError: Unexpected identifier');
    });

    it('should maintain history order (newest last)', () => {
      let state = initialState;

      state = consoleReducer(state, addToHistory({
        input: 'command1',
        output: 'result1',
        timestamp: 1000,
      }));

      state = consoleReducer(state, addToHistory({
        input: 'command2',
        output: 'result2',
        timestamp: 2000,
      }));

      expect(state.history).toHaveLength(2);
      expect(state.history[0].input).toBe('command1');
      expect(state.history[1].input).toBe('command2');
    });
  });

  describe('setCurrentInput', () => {
    it('should update current input', () => {
      const newState = consoleReducer(
        initialState,
        setCurrentInput('pattern("A01")')
      );

      expect(newState.currentInput).toBe('pattern("A01")');
    });

    it('should reset history index when user types', () => {
      const state: ConsoleState = {
        ...initialState,
        historyIndex: 2,
      };

      const newState = consoleReducer(
        state,
        setCurrentInput('new input')
      );

      expect(newState.currentInput).toBe('new input');
      expect(newState.historyIndex).toBe(-1); // Reset to bottom
    });
  });

  describe('history navigation', () => {
    const stateWithHistory: ConsoleState = {
      ...initialState,
      history: [
        { input: 'command1', output: 'result1', timestamp: 1000 },
        { input: 'command2', output: 'result2', timestamp: 2000 },
        { input: 'command3', output: 'result3', timestamp: 3000 },
      ],
    };

    describe('navigateHistoryUp', () => {
      it('should navigate to most recent command from bottom', () => {
        const newState = consoleReducer(
          stateWithHistory,
          navigateHistoryUp()
        );

        expect(newState.historyIndex).toBe(2); // Last index
        expect(newState.currentInput).toBe('command3');
      });

      it('should navigate backwards through history', () => {
        let state = { ...stateWithHistory, historyIndex: 2 };

        state = consoleReducer(state, navigateHistoryUp());

        expect(state.historyIndex).toBe(1);
        expect(state.currentInput).toBe('command2');
      });

      it('should stop at first command', () => {
        let state = { ...stateWithHistory, historyIndex: 0 };

        state = consoleReducer(state, navigateHistoryUp());

        expect(state.historyIndex).toBe(0);
        expect(state.currentInput).toBe('command1');
      });

      it('should do nothing when history is empty', () => {
        const newState = consoleReducer(
          initialState,
          navigateHistoryUp()
        );

        expect(newState.historyIndex).toBe(-1);
        expect(newState.currentInput).toBe('');
      });
    });

    describe('navigateHistoryDown', () => {
      it('should navigate forwards through history', () => {
        let state = { ...stateWithHistory, historyIndex: 0 };

        state = consoleReducer(state, navigateHistoryDown());

        expect(state.historyIndex).toBe(1);
        expect(state.currentInput).toBe('command2');
      });

      it('should clear input when reaching bottom', () => {
        let state = { ...stateWithHistory, historyIndex: 2 };

        state = consoleReducer(state, navigateHistoryDown());

        expect(state.historyIndex).toBe(-1);
        expect(state.currentInput).toBe('');
      });

      it('should do nothing at bottom', () => {
        let state = { ...stateWithHistory, historyIndex: -1 };

        state = consoleReducer(state, navigateHistoryDown());

        expect(state.historyIndex).toBe(-1);
        expect(state.currentInput).toBe('');
      });
    });
  });

  describe('toggleExpanded', () => {
    it('should toggle expanded state', () => {
      let state = consoleReducer(initialState, toggleExpanded());
      expect(state.isExpanded).toBe(true);

      state = consoleReducer(state, toggleExpanded());
      expect(state.isExpanded).toBe(false);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const stateWithHistory: ConsoleState = {
        ...initialState,
        history: [
          { input: 'command1', output: 'result1', timestamp: 1000 },
          { input: 'command2', output: 'result2', timestamp: 2000 },
        ],
      };

      const newState = consoleReducer(stateWithHistory, clearHistory());

      expect(newState.history).toHaveLength(0);
      expect(newState.historyIndex).toBe(-1);
    });
  });

  describe('autocomplete', () => {
    it('should set autocomplete options', () => {
      const options = ['pattern', 'track', 'selected'];

      const newState = consoleReducer(
        initialState,
        setAutocomplete(options)
      );

      expect(newState.autocompleteVisible).toBe(true);
      expect(newState.autocompleteOptions).toEqual(options);
    });

    it('should hide autocomplete', () => {
      const state: ConsoleState = {
        ...initialState,
        autocompleteVisible: true,
        autocompleteOptions: ['pattern', 'track'],
      };

      const newState = consoleReducer(state, hideAutocomplete());

      expect(newState.autocompleteVisible).toBe(false);
      expect(newState.autocompleteOptions).toEqual([]);
    });
  });
});
