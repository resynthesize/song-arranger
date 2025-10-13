/**
 * Song Arranger - Help Documentation Component
 * In-app help and keyboard shortcuts reference
 */

import { useEffect, useRef } from 'react';
import { TerminalPanel } from '../molecules/TerminalPanel';
import { TerminalButton } from '../atoms/TerminalButton';
import { getAllShortcuts, formatShortcut, type KeyboardAction } from '@/utils/keyboard';
import './Help.css';

interface HelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const Help = ({ isOpen, onClose }: HelpProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = getAllShortcuts();

  // Group shortcuts by category
  const categories: Record<string, { action: KeyboardAction; description: string; shortcut: string }[]> = {
    'Clip Operations': [],
    'Selection': [],
    'Playhead Navigation': [],
    'Clip Duration': [],
    'View': [],
    'Playback': [],
    'System': [],
  };

  shortcuts.forEach(shortcut => {
    const formatted = formatShortcut(shortcut);
    const entry = {
      action: shortcut.action,
      description: shortcut.description || '',
      shortcut: formatted,
    };

    // Categorize shortcuts
    if (['delete', 'duplicate', 'duplicateOffset', 'edit', 'changeColor', 'split', 'join'].includes(shortcut.action)) {
      categories['Clip Operations']?.push(entry);
    } else if (['selectAll', 'deselectAll', 'cycleForward', 'cycleBackward'].includes(shortcut.action)) {
      categories['Selection']?.push(entry);
    } else if (['stop', 'jumpToStart', 'jumpToEnd', 'movePlayheadLeft', 'movePlayheadRight', 'movePlayheadPrevClip', 'movePlayheadNextClip'].includes(shortcut.action)) {
      categories['Playhead Navigation']?.push(entry);
    } else if (['setDuration1', 'setDuration2', 'setDuration3', 'setDuration4', 'setDuration5', 'setDuration6', 'setDuration7', 'setDuration8', 'setDuration9', 'trimStart', 'trimEnd', 'adjustTempoUp', 'adjustTempoDown'].includes(shortcut.action)) {
      categories['Clip Duration']?.push(entry);
    } else if (['frameSelection', 'frameAll', 'zoomIn', 'zoomOut', 'navigateUp', 'navigateDown'].includes(shortcut.action)) {
      categories['View']?.push(entry);
    } else if (['togglePlay'].includes(shortcut.action)) {
      categories['Playback']?.push(entry);
    } else {
      categories['System']?.push(entry);
    }
  });

  return (
    <div className="help-overlay" data-testid="help-overlay">
      <div className="help-container" ref={panelRef}>
        <TerminalPanel
          title="HELP DOCUMENTATION"
          style={{ width: '800px', height: '600px' }}
        >
          <div className="help-content">
            <div className="help-section">
              <h2 className="help-section-title">Getting Started</h2>
              <ul className="help-list">
                <li>Double-click on a lane to create a clip</li>
                <li>Drag clips to move them, drag edges to resize</li>
                <li>Click clips to select them, Ctrl+Click to multi-select</li>
                <li>Use arrow keys to navigate between lanes</li>
                <li>Press ? to show this help dialog</li>
              </ul>
            </div>

            <div className="help-section">
              <h2 className="help-section-title">Keyboard Shortcuts</h2>

              {Object.entries(categories).map(([category, shortcuts]) => (
                shortcuts.length > 0 && (
                  <div key={category} className="help-category">
                    <h3 className="help-category-title">{category}</h3>
                    <table className="help-shortcuts-table">
                      <tbody>
                        {shortcuts.map((item, index) => (
                          <tr key={index} className="help-shortcut-row">
                            <td className="help-shortcut-key">{item.shortcut}</td>
                            <td className="help-shortcut-desc">{item.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ))}
            </div>

            <div className="help-section">
              <h2 className="help-section-title">Tips & Tricks</h2>
              <ul className="help-list">
                <li>Use [ and ] to zoom in and out</li>
                <li>Press F to frame selected clips, A to frame all</li>
                <li>Use 1-9 keys to quickly set clip duration to N bars</li>
                <li>Shift+D duplicates clips offset by their duration</li>
                <li>Use , and . to trim clip start/end by snap value</li>
              </ul>
            </div>

            <div className="help-section">
              <h2 className="help-section-title">About</h2>
              <p className="help-text">
                Song Arranger v1.0.0
                <br />
                A retro terminal-styled timeline tool for sketching song structures
                <br />
                Inspired by Monolake 8bit
              </p>
            </div>

            <div className="help-actions">
              <TerminalButton onClick={onClose}>
                Close [ESC]
              </TerminalButton>
            </div>
          </div>
        </TerminalPanel>
      </div>
    </div>
  );
};

export default Help;
