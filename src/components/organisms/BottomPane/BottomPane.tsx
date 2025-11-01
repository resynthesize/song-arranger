/**
 * Cyclone - BottomPane Component
 * Reusable container for bottom panel editors (Pattern Editor, Track Settings, etc.)
 * Provides consistent layout, header, and close button functionality
 */

import React from 'react';
import styles from './BottomPane.module.css';

export interface BottomPaneProps {
  /** Unique identifier for this pane */
  id: string;
  /** Title displayed in the header */
  title: string;
  /** Subtitle or metadata displayed below the title */
  subtitle?: string;
  /** Main content to display in the pane */
  children: React.ReactNode;
  /** Height of the pane in pixels */
  height: number;
  /** Whether the pane is resizable */
  resizable?: boolean;
  /** Callback when the pane is closed */
  onClose: () => void;
  /** Callback when height changes (for resizable panes) */
  onHeightChange?: (height: number) => void;
  /** Additional header content (right side) */
  headerRight?: React.ReactNode;
  /** Additional CSS class for styling */
  className?: string;
}

/**
 * BottomPane Component
 * A reusable bottom panel container for editors and settings panels
 * Features consistent styling, header with close button, and optional resizing
 */
export const BottomPane: React.FC<BottomPaneProps> = ({
  id,
  title,
  subtitle,
  children,
  height,
  resizable = false,
  onClose,
  onHeightChange,
  headerRight,
  className,
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable || !onHeightChange) return;

    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY; // Negative = drag up = increase height
      const newHeight = Math.max(200, startHeight + deltaY); // Minimum height 200px
      onHeightChange(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`${styles.pane} ${className || ''}`}
      style={{ height: `${height}px` }}
      data-testid={`bottom-pane-${id}`}
    >
      {/* Resize handle */}
      {resizable && (
        <div
          className={styles.resizeHandle}
          onMouseDown={handleMouseDown}
          data-testid={`bottom-pane-resize-${id}`}
        />
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>

        {/* Header right content */}
        {headerRight && <div className={styles.headerRight}>{headerRight}</div>}

        {/* Close button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          data-testid={`bottom-pane-close-${id}`}
          title="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default BottomPane;
