/**
 * Song Arranger - Command Footer Component
 * Context-sensitive keyboard shortcuts display
 * Voyetra-inspired command reference footer
 */

import { useMemo } from 'react';
import type { KeyboardContext } from '@/utils/keyboard';
import { getShortcutsForContext, formatShortcut } from '@/utils/keyboard';
import './CommandFooter.css';

interface CommandFooterProps {
  hasSelection: boolean;
  selectionCount: number;
  isEditing: boolean;
}

const CommandFooter = ({ hasSelection, selectionCount, isEditing }: CommandFooterProps) => {
  // Get available shortcuts for current context
  const shortcuts = useMemo(() => {
    const context: KeyboardContext = {
      hasSelection,
      selectionCount,
      isEditing,
    };
    return getShortcutsForContext(context);
  }, [hasSelection, selectionCount, isEditing]);

  // Group shortcuts into categories for better display
  const clipShortcuts = shortcuts.filter(
    s => s.action === 'delete' || s.action === 'duplicate' || s.action === 'edit' || s.action === 'changeColor'
  );
  const zoomShortcuts = shortcuts.filter(
    s => s.action === 'zoomIn' || s.action === 'zoomOut'
  );
  const navShortcuts = shortcuts.filter(
    s => s.action === 'navigateUp' || s.action === 'navigateDown'
  );
  const playbackShortcuts = shortcuts.filter(
    s => s.action === 'togglePlay'
  );
  const editShortcuts = shortcuts.filter(
    s => s.action === 'undo' || s.action === 'redo'
  );
  const helpShortcuts = shortcuts.filter(
    s => s.action === 'help'
  );

  return (
    <div className="command-footer" data-testid="command-footer">
      <div className="command-footer__border command-footer__border--top">
        ├────────────────────────────────────────────────────────────────────────────────────────┤
      </div>

      <div className="command-footer__content">
        {/* Playback */}
        {playbackShortcuts.length > 0 && (
          <div className="command-footer__group">
            {playbackShortcuts.map((shortcut, index) => (
              <div key={`${shortcut.action}-${index}`} className="command-footer__shortcut">
                <span className="command-footer__key">{formatShortcut(shortcut)}</span>
                <span className="command-footer__description">{shortcut.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Clip Operations */}
        {clipShortcuts.length > 0 && (
          <>
            <div className="command-footer__separator">│</div>
            <div className="command-footer__group">
              {clipShortcuts.map((shortcut, index) => (
                <div key={`${shortcut.action}-${index}`} className="command-footer__shortcut">
                  <span className="command-footer__key">{formatShortcut(shortcut)}</span>
                  <span className="command-footer__description">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Zoom */}
        {zoomShortcuts.length > 0 && (
          <>
            <div className="command-footer__separator">│</div>
            <div className="command-footer__group">
              {zoomShortcuts.map((shortcut, index) => (
                <div key={`${shortcut.action}-${index}`} className="command-footer__shortcut">
                  <span className="command-footer__key">{formatShortcut(shortcut)}</span>
                  <span className="command-footer__description">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Navigation */}
        {navShortcuts.length > 0 && (
          <>
            <div className="command-footer__separator">│</div>
            <div className="command-footer__group">
              {navShortcuts.map((shortcut, index) => (
                <div key={`${shortcut.action}-${index}`} className="command-footer__shortcut">
                  <span className="command-footer__key">{formatShortcut(shortcut)}</span>
                  <span className="command-footer__description">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Edit (Undo/Redo) */}
        {editShortcuts.length > 0 && (
          <>
            <div className="command-footer__separator">│</div>
            <div className="command-footer__group">
              {editShortcuts.map((shortcut, index) => (
                <div key={`${shortcut.action}-${index}`} className="command-footer__shortcut">
                  <span className="command-footer__key">{formatShortcut(shortcut)}</span>
                  <span className="command-footer__description">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Help */}
        {helpShortcuts.length > 0 && (
          <>
            <div className="command-footer__separator">│</div>
            <div className="command-footer__group">
              {helpShortcuts.map((shortcut, index) => (
                <div key={`${shortcut.action}-${index}`} className="command-footer__shortcut">
                  <span className="command-footer__key">{formatShortcut(shortcut)}</span>
                  <span className="command-footer__description">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="command-footer__border command-footer__border--bottom">
        └────────────────────────────────────────────────────────────────────────────────────────┘
      </div>
    </div>
  );
};

export default CommandFooter;
