/**
 * TerminalButton Component
 * Terminal-styled button with ASCII borders and glow effects
 */

import React, { forwardRef } from 'react';
import './TerminalButton.css';

export interface TerminalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  fullWidth?: boolean;
}

export const TerminalButton = forwardRef<HTMLButtonElement, TerminalButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  active = false,
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const classes = [
    'terminal-button',
    `terminal-button--${variant}`,
    `terminal-button--${size}`,
    active && 'terminal-button--active',
    disabled && 'terminal-button--disabled',
    fullWidth && 'terminal-button--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      <span className="terminal-button__border terminal-button__border--top">
        ┌{'─'.repeat(10)}┐
      </span>
      <span className="terminal-button__content">{children}</span>
      <span className="terminal-button__border terminal-button__border--bottom">
        └{'─'.repeat(10)}┘
      </span>
    </button>
  );
});

TerminalButton.displayName = 'TerminalButton';
