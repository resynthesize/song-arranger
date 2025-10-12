/**
 * KeyboardHelp Component
 * Help overlay showing all keyboard shortcuts organized by category
 */

import React, { useEffect } from 'react';
import { TerminalPanel } from '@/components/TerminalPanel';
import { TerminalButton } from '@/components/TerminalButton';
import './KeyboardHelp.css';

export interface KeyboardHelpProps {
  onClose: () => void;
}

interface ShortcutSection {
  title: string;
  shortcuts: { keys: string; description: string }[];
}

const shortcutSections: ShortcutSection[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: 'Space', description: 'Play/Pause' },
      { keys: 'Shift+Space', description: 'Stop' },
      { keys: '←→', description: 'Move playhead by bar' },
      { keys: 'Home', description: 'Jump to start' },
      { keys: 'End', description: 'Jump to end' },
      { keys: 'Tab', description: 'Next clip' },
      { keys: 'Shift+Tab', description: 'Previous clip' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: 'D', description: 'Duplicate' },
      { keys: 'Shift+D', description: 'Duplicate with offset' },
      { keys: 'Del', description: 'Delete' },
      { keys: 'S', description: 'Split clip at playhead' },
      { keys: 'J', description: 'Join clips' },
      { keys: '[', description: 'Trim start' },
      { keys: ']', description: 'Trim end' },
      { keys: '1-9', description: 'Set clip duration (bars)' },
    ],
  },
  {
    title: 'Selection',
    shortcuts: [
      { keys: 'Cmd+A', description: 'Select all' },
      { keys: 'Cmd+Shift+A', description: 'Deselect all' },
      { keys: '↑↓', description: 'Cycle selection' },
    ],
  },
  {
    title: 'View',
    shortcuts: [
      { keys: '+/-', description: 'Zoom in/out' },
      { keys: 'Shift+/-', description: 'Vertical zoom' },
      { keys: 'F', description: 'Frame selection' },
      { keys: 'A', description: 'Frame all' },
      { keys: 'M', description: 'Toggle minimap' },
    ],
  },
  {
    title: 'Quick Input',
    shortcuts: [
      { keys: 'T', description: 'Set tempo' },
      { keys: 'Z', description: 'Set zoom level' },
      { keys: 'G', description: 'Set snap grid' },
      { keys: 'L', description: 'Set clip length' },
      { keys: 'P', description: 'Jump to position' },
    ],
  },
  {
    title: 'Other',
    shortcuts: [
      { keys: 'Cmd+Shift+P', description: 'Command palette' },
      { keys: 'F12', description: 'Command palette' },
      { keys: '?', description: 'Show keyboard shortcuts' },
      { keys: 'Cmd+Shift+N', description: 'New lane' },
      { keys: ',', description: 'Settings' },
    ],
  },
];

export const KeyboardHelp: React.FC<KeyboardHelpProps> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="keyboard-help-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-help-title"
    >
      <div className="keyboard-help-container">
        <TerminalPanel title="KEYBOARD SHORTCUTS" variant="elevated">
          <div className="keyboard-help-content">
            <div className="keyboard-help-grid">
              {shortcutSections.map((section) => (
                <div key={section.title} className="keyboard-help-section">
                  <h3 className="keyboard-help-section-title">{section.title}</h3>
                  <div className="keyboard-help-shortcuts">
                    {section.shortcuts.map((shortcut, index) => (
                      <div key={index} className="keyboard-help-shortcut">
                        <span className="keyboard-help-keys">{shortcut.keys}</span>
                        <span className="keyboard-help-description">
                          {shortcut.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="keyboard-help-footer">
              <TerminalButton onClick={onClose} variant="primary">
                Close [ESC]
              </TerminalButton>
            </div>
          </div>
        </TerminalPanel>
      </div>
    </div>
  );
};
