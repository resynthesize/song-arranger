/**
 * Cyclone - Pattern Component
 * Represents a pattern on the timeline with drag and resize functionality
 */

import { useState, useRef, useEffect, useMemo, MouseEvent, KeyboardEvent, memo } from 'react';
import ContextMenu, { type MenuItem } from '../ContextMenu';
import { PatternHandle } from '../../molecules/PatternHandle';
import type { ID, Position, Duration, ViewportState } from '@/types';
import { beatsToViewportPx } from '@/utils/viewport';
import { logger } from '@/utils/debug';
import { usePatternDrag } from '@/hooks/usePatternDrag';
import { usePatternResize } from '@/hooks/usePatternResize';
import styles from './Pattern.module.css';

interface PatternProps {
  id: ID;
  trackId: ID;
  position: Position;
  duration: Duration;
  sceneDuration?: Duration; // Duration of the scene for loop visualization
  viewport: ViewportState;
  snapValue: number;
  isSelected: boolean;
  isEditing?: boolean;
  label?: string;
  trackName?: string;
  color?: string;
  muted?: boolean;
  patternType?: 'P3' | 'CK';
  externalVerticalDragDeltaY?: number;
  onSelect: (patternId: ID, isMultiSelect: boolean) => void;
  onMove: (patternId: ID, newPosition: Position, delta: number) => void;
  onResize: (patternId: ID, newDuration: Duration, edge: 'left' | 'right', startDuration: Duration, startPosition: Position) => void;
  onVerticalDrag?: (patternId: ID, startingTrackId: ID, deltaY: number) => void;
  onVerticalDragUpdate?: (patternId: ID, deltaY: number) => void;
  onCopy?: (patternId: ID) => void;
  onOpenEditor?: (patternId: ID) => void;
  onStartEditing?: (patternId: ID) => void;
  onStopEditing?: () => void;
  onLabelChange?: (patternId: ID, label: string) => void;
  onDelete?: (patternId: ID) => void;
}

const Pattern = ({
  id,
  trackId,
  position,
  duration,
  sceneDuration,
  viewport,
  snapValue,
  isSelected,
  isEditing = false,
  label,
  trackName,
  color,
  muted = false,
  patternType = 'P3',
  externalVerticalDragDeltaY,
  onSelect,
  onMove,
  onResize,
  onVerticalDrag,
  onVerticalDragUpdate,
  onCopy,
  onOpenEditor,
  onStartEditing,
  onStopEditing,
  onLabelChange,
  onDelete,
}: PatternProps) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isNew, setIsNew] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const patternRef = useRef<HTMLDivElement>(null);

  // Use custom hooks for drag and resize
  const { isDragging, isCopying, verticalDragDeltaY, handleDragStart } = usePatternDrag({
    id,
    trackId,
    position,
    viewport,
    snapValue,
    onSelect,
    onMove,
    onVerticalDrag,
    onVerticalDragUpdate,
    onCopy,
  });

  const { isResizing, handleResizeStart } = usePatternResize({
    id,
    position,
    duration,
    viewport,
    snapValue,
    onResize,
  });

  // Remove 'new' state after animation completes (400ms as defined in CSS)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNew(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Convert beats to viewport-relative pixels (memoized for performance)
  const leftPx = useMemo(() => beatsToViewportPx(position, viewport), [position, viewport]);

  // Use sceneDuration for display width if available (for loop visualization)
  // Otherwise use the actual pattern duration (memoized for performance)
  const displayDuration = useMemo(
    () => (sceneDuration && sceneDuration > duration ? sceneDuration : duration),
    [sceneDuration, duration]
  );

  const widthPx = useMemo(() => displayDuration * viewport.zoom, [displayDuration, viewport.zoom]);
  const originalWidthPx = useMemo(() => duration * viewport.zoom, [duration, viewport.zoom]);

  // Calculate if pattern loops (sceneDuration > duration) (memoized for performance)
  const hasLoopVisualization = useMemo(
    () => sceneDuration !== undefined && sceneDuration > duration,
    [sceneDuration, duration]
  );

  const originalWidthPercentage = useMemo(
    () => (hasLoopVisualization && sceneDuration ? (duration / sceneDuration) * 100 : 100),
    [hasLoopVisualization, duration, sceneDuration]
  );

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return; // Only left click

    // Prevent text selection during drag and stop event from bubbling to Timeline
    e.preventDefault();
    e.stopPropagation();

    // Selection is handled in handleDragStart (on content area) or here (on handles)
    // Only select here if clicking on handles, not content
    if ((e.target as HTMLElement).classList.contains('pattern__handle')) {
      const isMultiSelect = e.altKey;
      onSelect(id, isMultiSelect);
    }
  };

  const handleDoubleClick = (e: MouseEvent) => {
    e.stopPropagation();
    // Prioritize onOpenEditor over onStartEditing
    if (onOpenEditor) {
      onOpenEditor(id);
    } else if (onStartEditing) {
      onStartEditing(id);
    }
  };

  const handleLabelInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newLabel = (e.target as HTMLInputElement).value;
      if (onLabelChange) {
        onLabelChange(id, newLabel);
      }
      if (onStopEditing) {
        onStopEditing();
      }
    } else if (e.key === 'Escape') {
      if (onStopEditing) {
        onStopEditing();
      }
    }
  };

  const handleLabelInputBlur = () => {
    if (inputRef.current && onLabelChange) {
      const newLabel = inputRef.current.value;
      onLabelChange(id, newLabel);
    }
    if (onStopEditing) {
      onStopEditing();
    }
  };

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDeletePattern = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const contextMenuItems: MenuItem[] = useMemo(
    () => [
      {
        label: 'Delete Pattern',
        action: handleDeletePattern,
        disabled: !onDelete,
      },
    ],
    [handleDeletePattern, onDelete]
  );

  // Display label: custom label > track name > nothing (memoized for performance)
  const displayLabel = useMemo(() => label || trackName, [label, trackName]);

  // Use external vertical drag deltaY if provided (for multi-pattern drag),
  // otherwise use local vertical drag deltaY (for single pattern drag)
  const effectiveVerticalDragDeltaY = useMemo(
    () => externalVerticalDragDeltaY ?? verticalDragDeltaY,
    [externalVerticalDragDeltaY, verticalDragDeltaY]
  );

  // Debug logging for vertical drag
  useEffect(() => {
    if (effectiveVerticalDragDeltaY !== 0 && patternRef.current) {
      const patternEl = patternRef.current;
      const trackContent = patternEl.parentElement;
      const track = trackContent?.parentElement;

      logger.log('Pattern vertical drag debug:', {
        patternId: id,
        isDragging,
        effectiveVerticalDragDeltaY,
        patternTransform: getComputedStyle(patternEl).transform,
        patternZIndex: getComputedStyle(patternEl).zIndex,
        trackContentOverflow: trackContent ? getComputedStyle(trackContent).overflow : 'N/A',
        trackContentOverflowY: trackContent ? getComputedStyle(trackContent).overflowY : 'N/A',
        trackOverflow: track ? getComputedStyle(track).overflow : 'N/A',
        trackOverflowY: track ? getComputedStyle(track).overflowY : 'N/A',
      });
    }
  }, [effectiveVerticalDragDeltaY, isDragging, id]);

  // Show type badge if pattern is wide enough (> 20px) (memoized for performance)
  const showTypeBadge = useMemo(() => widthPx > 20, [widthPx]);

  return (
    <div
      ref={patternRef}
      data-testid={`pattern-${id}`}
      className={`${styles.pattern} ${isNew ? styles.new : ''} ${
        isSelected ? styles.selected : ''
      } ${isDragging ? styles.dragging : ''} ${
        isResizing ? styles.resizing : ''
      } ${isCopying ? styles.copying : ''} ${
        muted ? styles.muted : ''
      } ${hasLoopVisualization ? styles.looping : ''}`}
      style={{
        left: `${leftPx.toString()}px`,
        width: `${widthPx.toString()}px`,
        transform: effectiveVerticalDragDeltaY !== 0 ? `translateY(${effectiveVerticalDragDeltaY}px)` : undefined,
        zIndex: (isDragging || isResizing || effectiveVerticalDragDeltaY !== 0) ? 1000 : undefined,
        ...(color ? { '--pattern-color': color } as React.CSSProperties : {}),
        ...(hasLoopVisualization ? { '--pattern-original-width-percent': `${originalWidthPercentage}%` } as React.CSSProperties : {}),
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {hasLoopVisualization && (
        <div
          className={styles.loopFill}
          style={{
            left: `${originalWidthPx}px`,
            width: `${widthPx - originalWidthPx}px`
          }}
        />
      )}
      <PatternHandle patternId={id} edge="left" onResizeStart={handleResizeStart} />
      <div
        className={styles.content}
        onMouseDown={handleDragStart}
        onDoubleClick={handleDoubleClick}
      >
        {showTypeBadge && (
          <div className={styles.typeBadge} data-testid={`pattern-${id}-type-badge`}>
            {patternType}
          </div>
        )}
        {isEditing ? (
          <input
            ref={inputRef}
            className={`${styles.labelInput} terminal-input`}
            defaultValue={label || ''}
            onKeyDown={handleLabelInputKeyDown}
            onBlur={handleLabelInputBlur}
            onClick={(e) => {
              e.stopPropagation();
            }}
            data-testid={`pattern-${id}-label-input`}
          />
        ) : (
          displayLabel && (
            <div className={styles.label} data-testid={`pattern-${id}-label`}>
              {displayLabel}
            </div>
          )
        )}
      </div>
      <PatternHandle patternId={id} edge="right" onResizeStart={handleResizeStart} />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
// Only re-render if props actually change
export default memo(Pattern);
