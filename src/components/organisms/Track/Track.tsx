/**
 * Cyclone - Track Component
 * Horizontal track that contains patterns
 */

import { useRef, useEffect, useMemo, useState, MouseEvent, memo } from 'react';
import Pattern from '../Pattern';
import ContextMenu, { type MenuItem } from '../ContextMenu';
import GridCanvas from './GridCanvas';
import { TrackHeader } from '../../molecules/TrackHeader';
import { TrackResizeHandle } from '../../molecules/TrackResizeHandle/TrackResizeHandle';
import type { ID, Pattern as PatternType, Position, Duration, ViewportState } from '@/types';
import { isRangeVisible } from '@/utils/viewport';
import { useDragToCreatePattern } from '@/hooks/useDragToCreatePattern';
import { TRACK_HEIGHT, DEFAULT_TRACK_COLOR, TRACK_COLLAPSED_HEIGHT } from '@/constants';
import { logger } from '@/utils/debug';
import styles from './Track.module.css';

interface TrackProps {
  id: ID;
  name: string;
  color?: string;
  height?: number; // Custom track height in pixels (if not set, uses default from verticalZoom)
  collapsed?: boolean; // Whether track is collapsed to minimal height (Ableton-style)
  headerWidth?: number; // Track header width in pixels (applies to all tracks)
  patterns: PatternType[];
  viewport: ViewportState;
  snapValue: number;
  selectedPatternIds: ID[];
  verticalDragState: { deltaY: number; draggedPatternId: ID } | null;
  verticalZoom: number; // Vertical zoom percentage (50-150)
  isCurrent: boolean; // Is this the current track for navigation
  isEditing: boolean;
  isMoving: boolean; // Is this track currently animating from a move
  onTrackSelect?: (trackId: ID) => void; // Select this track (sets currentTrackId)
  onNameChange: (trackId: ID, newName: string) => void;
  onColorChange?: (trackId: ID, color: string) => void;
  onTrackHeightChange?: (trackId: ID, height: number) => void; // Callback when track height is resized
  onHeaderWidthChange?: (width: number) => void; // Callback when track header width is resized
  onToggleCollapse?: (trackId: ID) => void; // Callback when collapse button is clicked
  onOpenSettings?: (trackId: ID) => void; // Callback when settings button is clicked
  onTrackDragStart?: (trackId: ID) => void; // Callback when track drag starts
  onTrackDragEnd?: () => void; // Callback when track drag ends
  onTrackDragOver?: (trackId: ID) => void; // Callback when track is dragged over
  onStartEditing: (trackId: ID) => void;
  onStopEditing: () => void;
  onRemove: (trackId: ID) => void;
  onPatternSelect: (patternId: ID, isMultiSelect: boolean) => void;
  onPatternMove: (patternId: ID, newPosition: Position, delta: number) => void;
  onPatternResize: (patternId: ID, newDuration: Duration, edge: 'left' | 'right', startDuration: Duration, startPosition: Position) => void;
  onPatternOpenEditor?: (patternId: ID) => void;
  onPatternLabelChange?: (patternId: ID, label: string) => void;
  onPatternCopy?: (patternId: ID) => void;
  onPatternDelete?: (patternId: ID) => void;
  onPatternVerticalDrag?: (patternId: ID, startingTrackId: ID, deltaY: number) => void;
  onPatternVerticalDragUpdate?: (patternId: ID, deltaY: number) => void;
  onDoubleClick: (trackId: ID, position: Position, duration?: Duration) => void;
}

const Track = ({
  id,
  name,
  color,
  height: customHeight,
  collapsed,
  headerWidth,
  patterns,
  viewport,
  snapValue,
  selectedPatternIds,
  verticalDragState,
  verticalZoom,
  isCurrent,
  isEditing,
  isMoving,
  onTrackSelect,
  onNameChange,
  onColorChange,
  onTrackHeightChange,
  onHeaderWidthChange,
  onToggleCollapse,
  onOpenSettings,
  onTrackDragStart,
  onTrackDragEnd,
  onTrackDragOver,
  onStartEditing,
  onStopEditing,
  onRemove: _onRemove, // Kept for Timeline compatibility, but no longer used (X button removed)
  onPatternSelect,
  onPatternMove,
  onPatternResize,
  onPatternOpenEditor,
  onPatternLabelChange,
  onPatternCopy,
  onPatternDelete,
  onPatternVerticalDrag,
  onPatternVerticalDragUpdate,
  onDoubleClick,
}: TrackProps) => {
  // Calculate track height: if collapsed, use minimal height; otherwise use custom height or global zoom
  const trackHeight = collapsed ? TRACK_COLLAPSED_HEIGHT : (customHeight ?? (TRACK_HEIGHT * verticalZoom) / 100);

  // Debug: log when isMoving changes
  useEffect(() => {
    logger.log(`Track ${id} (${name}): isMoving = ${isMoving}, timestamp = ${Date.now()}`);
  }, [isMoving, id, name]);

  // Debug: log className when it changes
  const trackClassName = `${styles.track} ${isCurrent ? styles.current : ''} ${isMoving ? styles.moving : ''}`;
  useEffect(() => {
    logger.log(`Track ${id}: className = "${trackClassName}", timestamp = ${Date.now()}`);
  }, [id, trackClassName]);

  // Scale padding for track header based on zoom (base padding is 16px)
  const headerPadding = Math.max(2, (16 * verticalZoom) / 100);

  // Debug: log when critical props are received
  useEffect(() => {
    logger.debug('[Track] Props received', {
      id,
      name,
      hasOnOpenSettings: !!onOpenSettings,
      hasOnColorChange: !!onColorChange,
      hasOnTrackDragStart: !!onTrackDragStart,
    });
  }, [id, name, onOpenSettings, onColorChange, onTrackDragStart]);

  const contentRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; position: number } | null>(null);

  // Use drag-to-create pattern hook
  const { handleMouseDown: handleDragToCreate, ghostPattern } = useDragToCreatePattern({
    viewport,
    snapValue,
    onCreatePattern: (position, duration) => onDoubleClick(id, position, duration),
    containerRef: contentRef,
  });

  // Filter patterns to only show those in this track
  const trackPatterns = patterns.filter((pattern) => pattern.trackId === id);

  // Virtual rendering: only render patterns visible in the viewport
  // Use a large margin (800px) to render patterns well off-screen for smooth scrolling
  // and to prevent flicker during rapid viewport changes (e.g., minimap dragging)
  const visiblePatterns = useMemo(() => {
    return trackPatterns.filter((pattern) => {
      const patternStart = pattern.position;
      // Use sceneDuration for visibility check if it exists and is larger than duration
      // This ensures patterns with loop visualization are correctly kept visible
      const displayDuration = pattern.sceneDuration && pattern.sceneDuration > pattern.duration
        ? pattern.sceneDuration
        : pattern.duration;
      const patternEnd = pattern.position + displayDuration;
      return isRangeVisible(patternStart, patternEnd, viewport, 800);
    });
  }, [trackPatterns, viewport]);

  // Force overflow: visible on track content (both axes must be same)
  // CSS spec: if overflow-x is hidden and overflow-y is visible, browser converts overflow-y to auto
  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      element.style.overflow = 'visible';

      logger.log('Track.tsx: Setting overflow to visible on mount');

      // Defer style read to avoid forced reflow
      requestAnimationFrame(() => {
        logger.log('Track.tsx: Initial computed overflow:', getComputedStyle(element).overflow);
      });

      // Watch for changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            // Defer style reads to avoid forced reflow
            requestAnimationFrame(() => {
              logger.log('Track.tsx: Style attribute changed!', {
                overflow: getComputedStyle(element).overflow,
                overflowY: getComputedStyle(element).overflowY,
              });
            });
          }
        });
      });

      observer.observe(element, { attributes: true, attributeFilter: ['style'] });

      return () => observer.disconnect();
    }
  }, []);

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    logger.debug('[Track] Context menu triggered', { trackId: id, clientX: e.clientX, clientY: e.clientY });

    // Don't show menu if clicking on a pattern (check for data-testid starting with "pattern-")
    const target = e.target as HTMLElement;
    const patternElement = target.closest('[data-testid^="pattern-"]');
    if (patternElement) {
      logger.debug('[Track] Context menu on pattern, ignoring');
      return;
    }

    logger.debug('[Track] Preventing default and showing context menu');
    e.preventDefault();

    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const positionInBeats = viewport.offsetBeats + clickX / viewport.zoom;

      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        position: positionInBeats,
      });
    }
  };

  const handleInsertPattern = () => {
    logger.debug('[Track] Insert pattern from context menu', { contextMenu });
    if (contextMenu) {
      onDoubleClick(id, contextMenu.position);
    }
  };

  // Debug: log context menu state changes
  useEffect(() => {
    if (contextMenu) {
      logger.debug('[Track] Context menu state set', { contextMenu });
    }
  }, [contextMenu]);

  // Predefined color palette
  const colorPalette = [
    { name: 'Green', value: '#00ff00' },
    { name: 'Cyan', value: '#00ffff' },
    { name: 'Blue', value: '#6d8a9e' },
    { name: 'Purple', value: '#9d4edd' },
    { name: 'Pink', value: '#ff006e' },
    { name: 'Red', value: '#ff0000' },
    { name: 'Orange', value: '#ff7f00' },
    { name: 'Yellow', value: '#ffff00' },
  ];

  const contextMenuItems: MenuItem[] = [
    {
      label: 'Insert Pattern',
      action: handleInsertPattern,
    },
    {
      label: '──────────',
      action: () => {}, // Separator
    },
    ...colorPalette.map((color) => ({
      label: `Color: ${color.name}`,
      action: () => {
        logger.debug('[Track] Color menu item clicked', { color: color.name, value: color.value, hasCallback: !!onColorChange });
        if (onColorChange) {
          onColorChange(id, color.value);
        }
        setContextMenu(null);
      },
    })),
  ];

  // Ensure we always have a valid color for patterns
  // Use the track's color if set, otherwise fall back to DEFAULT_TRACK_COLOR
  const effectiveColor = color || DEFAULT_TRACK_COLOR;

  return (
    <div
      className={trackClassName}
      data-testid={`track-${id}`}
      style={{ height: `${trackHeight}px` }}
    >
      <TrackHeader
        id={id}
        name={name}
        isCurrent={isCurrent}
        isEditing={isEditing}
        headerPadding={headerPadding}
        headerWidth={headerWidth}
        collapsed={collapsed}
        onTrackSelect={onTrackSelect}
        onNameChange={onNameChange}
        onStartEditing={onStartEditing}
        onStopEditing={onStopEditing}
        onToggleCollapse={onToggleCollapse}
        onOpenSettings={onOpenSettings}
        onHeaderWidthChange={onHeaderWidthChange}
        onDragStart={onTrackDragStart}
        onDragEnd={onTrackDragEnd}
        onDragOver={onTrackDragOver}
      />
      {!collapsed && (
        <div
          ref={contentRef}
          className={styles.content}
          data-testid={`track-${id}-content`}
          style={{ backgroundColor: `${effectiveColor}15` }}
          onMouseDown={handleDragToCreate}
          onContextMenu={handleContextMenu}
        >
        <GridCanvas viewport={viewport} snapValue={snapValue} />
        {visiblePatterns.map((pattern) => {
          // Calculate deltaY for this pattern if it's selected during vertical drag
          let externalVerticalDragDeltaY: number | undefined;
          if (verticalDragState && selectedPatternIds.includes(pattern.id)) {
            externalVerticalDragDeltaY = verticalDragState.deltaY;
          }

          return (
            <Pattern
              key={pattern.id}
              id={pattern.id}
              trackId={pattern.trackId}
              position={pattern.position}
              duration={pattern.duration}
              sceneDuration={pattern.sceneDuration}
              viewport={viewport}
              snapValue={snapValue}
              isSelected={selectedPatternIds.includes(pattern.id)}
              externalVerticalDragDeltaY={externalVerticalDragDeltaY}
              label={pattern.label}
              trackName={name}
              color={effectiveColor}
              muted={pattern.muted}
              patternType={pattern.patternType}
              patternData={pattern.patternData}
              onSelect={onPatternSelect}
              onMove={onPatternMove}
              onResize={onPatternResize}
              onOpenEditor={onPatternOpenEditor}
              onLabelChange={onPatternLabelChange}
              onCopy={onPatternCopy}
              onDelete={onPatternDelete}
              onVerticalDrag={onPatternVerticalDrag}
              onVerticalDragUpdate={onPatternVerticalDragUpdate}
            />
          );
        })}
        {ghostPattern && (
          <div
            className={styles.ghostPattern}
            data-testid="ghost-pattern"
            style={{
              left: `${ghostPattern.leftPx}px`,
              width: `${ghostPattern.widthPx}px`,
              height: '100%',
              position: 'absolute',
              top: 0,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
      {onTrackHeightChange && (
        <TrackResizeHandle
          trackId={id}
          currentHeight={trackHeight}
          onHeightChange={onTrackHeightChange}
        />
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
// Only re-render if props actually change
export default memo(Track);
