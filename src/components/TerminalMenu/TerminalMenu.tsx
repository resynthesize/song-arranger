/**
 * TerminalMenu Component
 * Terminal-style dropdown menu with keyboard navigation
 */

import React, { useState, useRef, useEffect } from 'react';
import './TerminalMenu.css';

export interface TerminalMenuItem {
  id: string;
  label?: string;
  value?: string;
  disabled?: boolean;
  separator?: boolean;
}

export interface TerminalMenuProps {
  items: TerminalMenuItem[];
  trigger: React.ReactNode;
  onSelect?: (item: TerminalMenuItem) => void;
  className?: string;
}

export const TerminalMenu: React.FC<TerminalMenuProps> = ({
  items,
  trigger,
  onSelect,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Get non-separator items for navigation
  const selectableItems = items.filter((item) => !item.separator && !item.disabled);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    setHighlightedIndex(-1);
  };

  const handleItemClick = (item: TerminalMenuItem) => {
    if (item.disabled || item.separator) return;

    onSelect?.(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const nextIndex = prev + 1;
          return nextIndex < selectableItems.length ? nextIndex : prev;
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const nextIndex = prev - 1;
          return nextIndex >= 0 ? nextIndex : 0;
        });
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < selectableItems.length) {
          handleItemClick(selectableItems[highlightedIndex]);
        }
        break;
    }
  };

  const classes = ['terminal-menu', className].filter(Boolean).join(' ');

  return (
    <div className={classes} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        className="terminal-menu__trigger"
        onClick={handleTriggerClick}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>

      {isOpen && (
        <div ref={menuRef} className="terminal-menu__dropdown" role="menu">
          {items.map((item) => {
            if (item.separator) {
              return (
                <div
                  key={item.id}
                  className="terminal-menu__separator"
                  role="separator"
                />
              );
            }

            const selectableIndex = selectableItems.findIndex((si) => si.id === item.id);
            const isHighlighted = selectableIndex === highlightedIndex;

            return (
              <div
                key={item.id}
                className={[
                  'terminal-menu__item',
                  item.disabled && 'terminal-menu__item--disabled',
                  isHighlighted && 'terminal-menu__item--highlighted',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="menuitem"
                aria-disabled={item.disabled}
                onClick={() => {
                  handleItemClick(item);
                }}
                onMouseEnter={() => {
                  if (!item.disabled) {
                    setHighlightedIndex(selectableIndex);
                  }
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
