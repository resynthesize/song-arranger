/**
 * Cyclone - Console Slice
 * Redux state management for live coding console
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AutocompleteSuggestion } from '@/utils/console/autocomplete';

/**
 * A single console history entry
 */
export interface ConsoleEntry {
  input: string;           // The command that was executed
  output?: string;         // Success result/confirmation
  error?: string;          // Error message if command failed
  timestamp: number;       // When command was executed
}

/**
 * Console State - manages live coding console UI and history
 */
export interface ConsoleState {
  history: ConsoleEntry[];                  // Command history (newest last)
  currentInput: string;                     // Current input text
  historyIndex: number;                     // Position in history (-1 = bottom/not navigating)
  isExpanded: boolean;                      // Collapsed (2-line) vs expanded
  autocompleteVisible: boolean;             // Whether autocomplete overlay is shown
  autocompleteOptions: AutocompleteSuggestion[]; // Current autocomplete suggestions
  selectedSuggestionIndex: number;          // Currently selected suggestion (for keyboard nav)
  cursorPosition: number;                   // Cursor position in input (for autocomplete)
}

const initialState: ConsoleState = {
  history: [],
  currentInput: '',
  historyIndex: -1,
  isExpanded: false,
  autocompleteVisible: false,
  autocompleteOptions: [],
  selectedSuggestionIndex: 0,
  cursorPosition: 0,
};

const consoleSlice = createSlice({
  name: 'console',
  initialState,
  reducers: {
    /**
     * Add a command to history
     * Resets history navigation index to bottom
     */
    addToHistory: (state, action: PayloadAction<ConsoleEntry>) => {
      state.history.push(action.payload);
      state.historyIndex = -1; // Reset to bottom
    },

    /**
     * Set current input text
     * Resets history navigation when user types
     */
    setCurrentInput: (state, action: PayloadAction<string>) => {
      state.currentInput = action.payload;
      state.historyIndex = -1; // Reset to bottom when user types
    },

    /**
     * Navigate up through command history (older commands)
     */
    navigateHistoryUp: (state) => {
      if (state.history.length === 0) return;

      if (state.historyIndex === -1) {
        // Start from most recent command
        state.historyIndex = state.history.length - 1;
      } else if (state.historyIndex > 0) {
        // Move to older command
        state.historyIndex--;
      }

      // Update current input to show historical command
      const entry = state.history[state.historyIndex];
      if (entry) {
        state.currentInput = entry.input;
      }
    },

    /**
     * Navigate down through command history (newer commands)
     */
    navigateHistoryDown: (state) => {
      if (state.historyIndex === -1) return; // Already at bottom

      if (state.historyIndex < state.history.length - 1) {
        // Move to newer command
        state.historyIndex++;
        const entry = state.history[state.historyIndex];
        if (entry) {
          state.currentInput = entry.input;
        }
      } else {
        // Reached bottom - clear input
        state.historyIndex = -1;
        state.currentInput = '';
      }
    },

    /**
     * Toggle expanded/collapsed state
     */
    toggleExpanded: (state) => {
      state.isExpanded = !state.isExpanded;
    },

    /**
     * Clear all command history
     */
    clearHistory: (state) => {
      state.history = [];
      state.historyIndex = -1;
    },

    /**
     * Show autocomplete with given options
     */
    setAutocomplete: (state, action: PayloadAction<AutocompleteSuggestion[]>) => {
      state.autocompleteVisible = true;
      state.autocompleteOptions = action.payload;
      state.selectedSuggestionIndex = 0; // Reset selection when showing new suggestions
    },

    /**
     * Hide autocomplete overlay
     */
    hideAutocomplete: (state) => {
      state.autocompleteVisible = false;
      state.autocompleteOptions = [];
      state.selectedSuggestionIndex = 0;
    },

    /**
     * Navigate to next autocomplete suggestion
     */
    selectNextSuggestion: (state) => {
      if (state.autocompleteOptions.length > 0) {
        state.selectedSuggestionIndex =
          (state.selectedSuggestionIndex + 1) % state.autocompleteOptions.length;
      }
    },

    /**
     * Navigate to previous autocomplete suggestion
     */
    selectPreviousSuggestion: (state) => {
      if (state.autocompleteOptions.length > 0) {
        state.selectedSuggestionIndex =
          state.selectedSuggestionIndex === 0
            ? state.autocompleteOptions.length - 1
            : state.selectedSuggestionIndex - 1;
      }
    },

    /**
     * Update cursor position (for autocomplete context)
     */
    setCursorPosition: (state, action: PayloadAction<number>) => {
      state.cursorPosition = action.payload;
    },
  },
});

export const {
  addToHistory,
  setCurrentInput,
  navigateHistoryUp,
  navigateHistoryDown,
  toggleExpanded,
  clearHistory,
  setAutocomplete,
  hideAutocomplete,
  selectNextSuggestion,
  selectPreviousSuggestion,
  setCursorPosition,
} = consoleSlice.actions;

export default consoleSlice.reducer;
