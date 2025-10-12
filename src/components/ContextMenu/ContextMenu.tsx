/**
 * Song Arranger - Context Menu Component
 * Terminal-styled right-click context menu
 */

import { useEffect, useRef } from 'react';
import './ContextMenu.css';

export interface MenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

const ContextMenu = ({ x, y, items, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Add listeners after a small delay to prevent immediate close
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu would go off-screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      if (adjustedX !== x || adjustedY !== y) {
        menuRef.current.style.left = `${adjustedX}px`;
        menuRef.current.style.top = `${adjustedY}px`;
      }
    }
  }, [x, y]);

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled) {
      item.action();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: `${x}px`, top: `${y}px` }}
      data-testid="context-menu"
    >
      <div className="context-menu__border">
        <div className="context-menu__header">
          <span className="context-menu__corner">┌</span>
          <span className="context-menu__line">─────────────</span>
          <span className="context-menu__corner">┐</span>
        </div>
        <div className="context-menu__items">
          {items.map((item, index) => (
            <div
              key={index}
              className={`context-menu__item ${
                item.disabled ? 'context-menu__item--disabled' : ''
              }`}
              onClick={() => handleItemClick(item)}
              data-testid={`context-menu-item-${index}`}
            >
              <span className="context-menu__border-char">│</span>
              <span className="context-menu__label">{item.label}</span>
              <span className="context-menu__border-char">│</span>
            </div>
          ))}
        </div>
        <div className="context-menu__footer">
          <span className="context-menu__corner">└</span>
          <span className="context-menu__line">─────────────</span>
          <span className="context-menu__corner">┘</span>
        </div>
      </div>
    </div>
  );
};

export default ContextMenu;
