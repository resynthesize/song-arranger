/**
 * Cyclone - LiveConsole Component
 * Strudel-inspired live coding console for pattern manipulation
 */

import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useStore } from 'react-redux';
import type { RootState } from '@/types';
import {
  addToHistory,
  setCurrentInput,
  navigateHistoryUp,
  navigateHistoryDown,
  toggleExpanded,
  clearHistory as clearHistoryAction,
  setAutocomplete,
  hideAutocomplete,
  selectNextSuggestion,
  selectPreviousSuggestion,
  setCursorPosition,
} from '@/store/slices/consoleSlice';
import { ConsoleInput } from '@/components/atoms/ConsoleInput';
import { ConsoleHistory, ConsoleAutocomplete } from '@/components/molecules';
import { executeCommand } from '@/utils/console/executeCommand';
import { getAutocompleteSuggestions, applySuggestion } from '@/utils/console/autocomplete';
import './LiveConsole.css';

export const LiveConsole: React.FC = () => {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();

  const history = useAppSelector((state) => state.console.history);
  const currentInput = useAppSelector((state) => state.console.currentInput);
  const isExpanded = useAppSelector((state) => state.console.isExpanded);
  const autocompleteVisible = useAppSelector((state) => state.console.autocompleteVisible);
  const autocompleteOptions = useAppSelector((state) => state.console.autocompleteOptions);
  const selectedSuggestionIndex = useAppSelector((state) => state.console.selectedSuggestionIndex);
  const cursorPosition = useAppSelector((state) => state.console.cursorPosition);

  const handleInputChange = useCallback(
    (value: string, newCursorPosition?: number) => {
      dispatch(setCurrentInput(value));

      // Use the new cursor position if provided, otherwise use end of input
      const cursorPos = newCursorPosition ?? value.length;

      // Trigger autocomplete
      const suggestions = getAutocompleteSuggestions(value, cursorPos);
      if (suggestions.length > 0) {
        dispatch(setAutocomplete(suggestions));
      } else {
        dispatch(hideAutocomplete());
      }
    },
    [dispatch]
  );

  const handleSubmit = useCallback(() => {
    const command = currentInput.trim();

    if (!command) {
      return;
    }

    // Hide autocomplete
    dispatch(hideAutocomplete());

    // Execute command
    const state = store.getState();
    const result = executeCommand(command, dispatch, state);

    // Add to history
    dispatch(
      addToHistory({
        input: command,
        output: result.output,
        error: result.error,
        timestamp: Date.now(),
      })
    );

    // Clear input
    dispatch(setCurrentInput(''));

    // Handle special commands
    if (command === 'clear()') {
      dispatch(clearHistoryAction());
    }
  }, [currentInput, dispatch, store]);

  const handleHistoryUp = useCallback(() => {
    dispatch(navigateHistoryUp());
  }, [dispatch]);

  const handleHistoryDown = useCallback(() => {
    dispatch(navigateHistoryDown());
  }, [dispatch]);

  const handleToggleExpand = useCallback(() => {
    dispatch(toggleExpanded());
  }, [dispatch]);

  const handleSelectSuggestion = useCallback(
    (suggestion: typeof autocompleteOptions[0]) => {
      const result = applySuggestion(currentInput, cursorPosition, suggestion);
      dispatch(setCurrentInput(result.input));
      dispatch(setCursorPosition(result.cursorPosition));
      dispatch(hideAutocomplete());
    },
    [currentInput, cursorPosition, dispatch]
  );

  const handleAutocomplete = useCallback(() => {
    // Tab key - apply current suggestion
    if (autocompleteVisible && autocompleteOptions.length > 0) {
      const selected = autocompleteOptions[selectedSuggestionIndex];
      if (selected) {
        handleSelectSuggestion(selected);
      }
    }
  }, [autocompleteVisible, autocompleteOptions, selectedSuggestionIndex, handleSelectSuggestion]);

  const handleCloseAutocomplete = useCallback(() => {
    dispatch(hideAutocomplete());
  }, [dispatch]);

  const handleCursorPositionChange = useCallback(
    (position: number) => {
      dispatch(setCursorPosition(position));
    },
    [dispatch]
  );

  const handleAutocompleteNext = useCallback(() => {
    dispatch(selectNextSuggestion());
  }, [dispatch]);

  const handleAutocompletePrevious = useCallback(() => {
    dispatch(selectPreviousSuggestion());
  }, [dispatch]);

  return (
    <div className="live-console" data-testid="live-console">
      {/* Expand/collapse toggle */}
      <button
        className="live-console__toggle"
        onClick={handleToggleExpand}
        title={isExpanded ? 'Collapse console' : 'Expand console'}
        data-testid="live-console-toggle"
      >
        {isExpanded ? '▼' : '▲'}
      </button>

      {/* Command history */}
      <ConsoleHistory entries={history} isExpanded={isExpanded} />

      {/* Autocomplete overlay */}
      {autocompleteVisible && (
        <ConsoleAutocomplete
          suggestions={autocompleteOptions}
          selectedIndex={selectedSuggestionIndex}
          onSelect={handleSelectSuggestion}
          onClose={handleCloseAutocomplete}
        />
      )}

      {/* Input line */}
      <ConsoleInput
        value={currentInput}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        onHistoryUp={handleHistoryUp}
        onHistoryDown={handleHistoryDown}
        onAutocomplete={handleAutocomplete}
        onAutocompleteNext={handleAutocompleteNext}
        onAutocompletePrevious={handleAutocompletePrevious}
        onAutocompleteClose={handleCloseAutocomplete}
        onCursorPositionChange={handleCursorPositionChange}
        autocompleteVisible={autocompleteVisible}
        placeholder="Type command... (try: help())"
      />
    </div>
  );
};
