/**
 * Cyclone - Command Footer Component
 * Context-sensitive keyboard shortcuts display
 * Shows only relevant shortcuts for current context
 */

import { useMemo, useRef, useEffect } from 'react';
import { logger } from '@/utils/debug';
import type { KeyboardContext } from '@/utils/keyboard';
import { getShortcutsForContext, formatShortcut } from '@/utils/keyboard';
import './CommandFooter.css';

interface CommandFooterProps {
  hasSelection: boolean;
  selectionCount: number;
  isEditing: boolean;
}

const CommandFooter = ({ hasSelection, selectionCount, isEditing }: CommandFooterProps) => {
  const footerRef = useRef<HTMLDivElement>(null);

  // Get context-appropriate shortcuts, filtered to only implemented ones
  const relevantShortcuts = useMemo(() => {
    const context: KeyboardContext = {
      hasSelection,
      selectionCount,
      isEditing,
    };
    const contextShortcuts = getShortcutsForContext(context);

    // Filter out shortcuts that are not yet implemented
    const unimplementedActions = ['undo', 'redo', 'edit', 'changeColor', 'join'];

    // Prioritize clip-specific shortcuts when clips are selected
    // Show most useful shortcuts first, hide less common global shortcuts to save space
    let filtered = contextShortcuts.filter(s => !unimplementedActions.includes(s.action));

    if (hasSelection) {
      // When clips are selected, prioritize clip operations
      const clipActions = ['delete', 'duplicate', 'duplicateOffset', 'split', 'setDuration1',
        'setDuration2', 'setDuration3', 'setDuration4', 'trimStart', 'trimEnd', 'frameSelection'];
      const essentialGlobal = ['zoomIn', 'zoomOut', 'togglePlay', 'selectAll', 'deselectAll'];

      filtered = filtered.filter(s =>
        clipActions.includes(s.action) || essentialGlobal.includes(s.action)
      );
    }

    return filtered;
  }, [hasSelection, selectionCount, isEditing]);

  // Debug logging for footer dimensions
  useEffect(() => {
    if (footerRef.current) {
      const rect = footerRef.current.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(footerRef.current);
      logger.debug('[CommandFooter] Dimensions:', {
        rect: {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height
        },
        position: computedStyle.position,
        bottom: computedStyle.bottom,
        windowHeight: window.innerHeight
      });
    }
  }, [relevantShortcuts.length]);

  return (
    <div ref={footerRef} className="command-footer" data-testid="command-footer">
      <div className="command-footer__content">
        {relevantShortcuts.map((shortcut, index) => (
          <div key={`${shortcut.action}-${index.toString()}`} className="command-footer__shortcut">
            <span className="command-footer__key">{formatShortcut(shortcut)}</span>
            <span className="command-footer__description">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommandFooter;
