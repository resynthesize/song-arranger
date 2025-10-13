/**
 * TerminalPanel Component
 * ASCII-bordered container using box-drawing characters
 */

import React from 'react';
import './TerminalPanel.css';

export interface TerminalPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  noBorder?: boolean;
  fullWidth?: boolean;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  children,
  title,
  variant = 'default',
  padding = 'md',
  noBorder = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const classes = [
    'terminal-panel',
    `terminal-panel--${variant}`,
    `terminal-panel--padding-${padding}`,
    noBorder && 'terminal-panel--no-border',
    fullWidth && 'terminal-panel--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const borderLine = '─'.repeat(50);

  return (
    <div className={classes} {...props}>
      {!noBorder && (
        <>
          {title ? (
            <div className="terminal-panel__header">
              <span className="terminal-panel__border-top">┌─</span>
              <span className="terminal-panel__title">{title}</span>
              <span className="terminal-panel__border-top">─┐</span>
            </div>
          ) : (
            <div className="terminal-panel__border terminal-panel__border--top">
              ┌{borderLine}┐
            </div>
          )}
        </>
      )}

      <div className="terminal-panel__content">
        {!noBorder && <span className="terminal-panel__border-side">│</span>}
        <div className="terminal-panel__inner">{children}</div>
        {!noBorder && <span className="terminal-panel__border-side">│</span>}
      </div>

      {!noBorder && (
        <div className="terminal-panel__border terminal-panel__border--bottom">
          └{borderLine}┘
        </div>
      )}
    </div>
  );
};
