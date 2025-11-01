/**
 * Cyclone - Context Menu Component
 * Terminal-styled right-click context menu
 */

import { useEffect, useState, useCallback } from 'react';
import { logger } from '@/utils/debug';
import './ContextMenu.css';

export interface MenuItem {
  label: string;
  action?: () => void;
  disabled?: boolean;
  submenu?: MenuItem[];
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

const ContextMenu = ({ x, y, items, onClose }: ContextMenuProps) => {
  const [menuElement, setMenuElement] = useState<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x, y, ready: false });

  // Calculate adjusted position using ref callback to avoid flickering
  const refCallback = useCallback((node: HTMLDivElement | null) => {
    setMenuElement(node);
    if (node && !position.ready) {
      const rect = node.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (x + rect.width > viewportWidth) {
        adjustedX = Math.max(10, viewportWidth - rect.width - 10);
      }

      if (y + rect.height > viewportHeight) {
        adjustedY = Math.max(10, viewportHeight - rect.height - 10);
      }

      setPosition({ x: adjustedX, y: adjustedY, ready: true });
    }
  }, [x, y, position.ready]);

  // Debug: log when context menu renders
  useEffect(() => {
    logger.debug('[ContextMenu] Rendered', { x, y, itemCount: items.length, items });
  }, [x, y, items]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuElement && !menuElement.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Add listeners after a small delay to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, menuElement]);

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled && !item.submenu && item.action) {
      item.action();
      onClose();
    }
  };

  return (
    <div
      ref={refCallback}
      className="context-menu"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: position.ready ? 1 : 0,
      }}
      data-testid="context-menu"
    >
      <div className="context-menu__border">
        <div className="context-menu__header">
          <span className="context-menu__corner">┌</span>
          <span className="context-menu__line">─────────────</span>
          <span className="context-menu__corner">┐</span>
        </div>
        <div className="context-menu__items">
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <div
                  key={index}
                  className="context-menu__separator"
                  data-testid={`context-menu-separator-${index}`}
                >
                  <span className="context-menu__border-char">│</span>
                  <span className="context-menu__separator-line">─────────</span>
                  <span className="context-menu__border-char">│</span>
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`context-menu__item ${
                  item.disabled ? 'context-menu__item--disabled' : ''
                } ${item.submenu ? 'context-menu__item--has-submenu' : ''}`}
                onClick={() => handleItemClick(item)}
                data-testid={`context-menu-item-${index}`}
              >
                <span className="context-menu__border-char">│</span>
                <span className="context-menu__label">{item.label}</span>
                {item.submenu && <span className="context-menu__submenu-arrow"> ▸</span>}
                <span className="context-menu__border-char">│</span>
              </div>
            );
          })}
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
