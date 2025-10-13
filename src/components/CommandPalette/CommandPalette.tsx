/**
 * CommandPalette Component
 * Searchable command palette for discovering and executing commands
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { TerminalPanel } from '@/components/TerminalPanel';
import { TerminalInput } from '@/components/atoms/TerminalInput';
import { searchCommands, addToRecentCommands, getRecentCommandObjects } from '@/utils/commands';
import './CommandPalette.css';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  // Get the full state for command functions
  const state = useAppSelector(state => state);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get commands to display
  const recentCommands = getRecentCommandObjects(state, 5);
  const searchResults = searchCommands(query, state);
  const displayCommands = query.trim() ? searchResults : [
    ...recentCommands,
    ...searchResults.filter(cmd => !recentCommands.find(r => r.id === cmd.id))
  ];

  // Reset selection when commands change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const executeCommand = (index: number) => {
    if (index < 0) return; // No selection
    const command = displayCommands[index];
    if (command) {
      command.action(dispatch, state);
      addToRecentCommands(command.id);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, displayCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(selectedIndex);
    }
  };

  return (
    <div
      className="command-palette-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
      onKeyDown={handleKeyDown}
    >
      <div className="command-palette-container">
        <TerminalPanel title="COMMAND PALETTE" variant="elevated">
          <div className="command-palette-content">
            <TerminalInput
              ref={inputRef}
              placeholder="Search commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search commands"
              fullWidth
            />

            <div className="command-palette-list">
              {displayCommands.length === 0 ? (
                <div className="command-palette-empty">No commands found</div>
              ) : (
                displayCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    className={`command-palette-item ${
                      index === selectedIndex ? 'command-palette-item--selected' : ''
                    }`}
                    onClick={() => executeCommand(index)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="command-palette-item-main">
                      <span className="command-palette-item-label">{cmd.label}</span>
                      {cmd.shortcut && (
                        <span className="command-palette-item-shortcut">{cmd.shortcut}</span>
                      )}
                    </div>
                    <div className="command-palette-item-category">{cmd.category}</div>
                  </button>
                ))
              )}
            </div>

            <div className="command-palette-footer">
              <span>↑↓ Navigate</span>
              <span>Enter Execute</span>
              <span>ESC Close</span>
            </div>
          </div>
        </TerminalPanel>
      </div>
    </div>
  );
};
