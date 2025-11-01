/**
 * Cyclone - ConsoleHistory Component
 * Displays command history with outputs and errors
 */

import React, { useRef, useEffect } from 'react';
import type { ConsoleEntry } from '@/store/slices/consoleSlice';
import './ConsoleHistory.css';

export interface ConsoleHistoryProps {
  entries: ConsoleEntry[];
  isExpanded: boolean;
  maxVisibleEntries?: number;
}

export const ConsoleHistory: React.FC<ConsoleHistoryProps> = ({
  entries,
  isExpanded,
  maxVisibleEntries = 5,
}) => {
  const historyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries added
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [entries]);

  // Show limited entries when collapsed, all when expanded
  const visibleEntries = isExpanded
    ? entries
    : entries.slice(-maxVisibleEntries);

  if (visibleEntries.length === 0) {
    return null;
  }

  return (
    <div
      ref={historyRef}
      className={`console-history ${isExpanded ? 'console-history--expanded' : ''}`}
      data-testid="console-history"
    >
      {visibleEntries.map((entry, index) => (
        <div
          key={`${entry.timestamp}-${index}`}
          className="console-history__entry"
          data-testid="console-history-entry"
        >
          {/* Input line */}
          <div className="console-history__input">
            <span className="console-history__prompt">&gt;</span>
            <span className="console-history__command">{entry.input}</span>
          </div>

          {/* Output or error */}
          {entry.output && (
            <div className="console-history__output">
              {entry.output}
            </div>
          )}
          {entry.error && (
            <div className="console-history__error">
              {entry.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
