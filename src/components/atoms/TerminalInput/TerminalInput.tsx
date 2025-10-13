/**
 * TerminalInput Component
 * Terminal-styled input field with monospace font and green on black
 */

import React, { useId, forwardRef } from 'react';
import './TerminalInput.css';

export interface TerminalInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(({
  label,
  error,
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  id,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const inputClasses = [
    'terminal-input',
    `terminal-input--${size}`,
    error && 'terminal-input--error',
    disabled && 'terminal-input--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperClasses = [
    'terminal-input-wrapper',
    fullWidth && 'terminal-input-wrapper--full-width',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className="terminal-input-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={inputClasses}
        disabled={disabled}
        aria-disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className="terminal-input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

TerminalInput.displayName = 'TerminalInput';
