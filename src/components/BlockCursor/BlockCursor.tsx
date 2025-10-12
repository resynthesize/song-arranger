/**
 * BlockCursor Component
 * Block-style terminal cursor with optional blinking animation
 */

import React from 'react';
import './BlockCursor.css';

export interface BlockCursorProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'highlight';
  size?: 'sm' | 'md' | 'lg';
  blink?: boolean;
}

export const BlockCursor: React.FC<BlockCursorProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  blink = true,
  className = '',
  'aria-hidden': ariaHidden = true,
  ...props
}) => {
  const classes = [
    'block-cursor',
    `block-cursor--${variant}`,
    `block-cursor--${size}`,
    !blink && 'block-cursor--no-blink',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} aria-hidden={ariaHidden} {...props}>
      {children || '\u00A0'}
    </span>
  );
};
