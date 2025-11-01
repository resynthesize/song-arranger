/**
 * Cyclone - ConsoleInput Component
 * Terminal-style input field for live coding console
 */

import React, { useRef, useEffect } from 'react';
import './ConsoleInput.css';

export interface ConsoleInputProps {
  value: string;
  onChange: (value: string, cursorPosition?: number) => void;
  onSubmit: () => void;
  onHistoryUp: () => void;
  onHistoryDown: () => void;
  onAutocomplete?: () => void;
  onAutocompleteNext?: () => void;
  onAutocompletePrevious?: () => void;
  onAutocompleteClose?: () => void;
  onCursorPositionChange?: (position: number) => void;
  autocompleteVisible?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const ConsoleInput: React.FC<ConsoleInputProps> = ({
  value,
  onChange,
  onSubmit,
  onHistoryUp,
  onHistoryDown,
  onAutocomplete,
  onAutocompleteNext,
  onAutocompletePrevious,
  onAutocompleteClose,
  onCursorPositionChange,
  autocompleteVisible = false,
  placeholder = 'Type command...',
  autoFocus = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Stop propagation to prevent global shortcuts from interfering
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      // If autocomplete is visible, accept the suggestion; otherwise submit
      if (autocompleteVisible && onAutocomplete) {
        onAutocomplete();
      } else {
        onSubmit();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // If autocomplete is visible, navigate up; otherwise navigate history
      if (autocompleteVisible && onAutocompletePrevious) {
        onAutocompletePrevious();
      } else {
        onHistoryUp();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // If autocomplete is visible, navigate down; otherwise navigate history
      if (autocompleteVisible && onAutocompleteNext) {
        onAutocompleteNext();
      } else {
        onHistoryDown();
      }
    } else if (e.key === 'Tab' && onAutocomplete) {
      e.preventDefault();
      onAutocomplete();
    } else if (e.key === 'Escape' && autocompleteVisible && onAutocompleteClose) {
      e.preventDefault();
      onAutocompleteClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCursorPosition = e.target.selectionStart ?? 0;
    onChange(e.target.value, newCursorPosition);

    // Update cursor position in Redux
    if (onCursorPositionChange) {
      onCursorPositionChange(newCursorPosition);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Also stop propagation on keypress to ensure all key events are captured
    e.stopPropagation();
  };

  const handleClick = () => {
    // Update cursor position on click
    if (onCursorPositionChange && inputRef.current) {
      onCursorPositionChange(inputRef.current.selectionStart ?? 0);
    }
  };

  const handleKeyUp = () => {
    // Update cursor position after arrow keys, etc.
    if (onCursorPositionChange && inputRef.current) {
      onCursorPositionChange(inputRef.current.selectionStart ?? 0);
    }
  };

  return (
    <div className="console-input" data-testid="console-input">
      <span className="console-input__prompt">&gt;</span>
      <input
        ref={inputRef}
        type="text"
        className="console-input__field"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyPress={handleKeyPress}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        data-testid="console-input-field"
      />
    </div>
  );
};
