/**
 * Song Arranger - Track Component
 * Horizontal track that contains patterns
 */

import { useRef, useEffect, useMemo, useState, MouseEvent, memo } from 'react';
import Pattern from '../Pattern';
import ContextMenu, { type MenuItem } from '../ContextMenu';
import ColorPicker from '../ColorPicker';
import GridCanvas from './GridCanvas';
import { TrackHeader } from '../../molecules/TrackHeader';
import type { ID, Pattern as PatternType, Position, Duration, ViewportState } from '@/types';
import { isRangeVisible } from '@/utils/viewport';
import { useDragToCreatePattern } from '@/hooks/useDragToCreatePattern';
import { TRACK_HEIGHT, DEFAULT_TRACK_COLOR } from '@/constants';
import { logger } from '@/utils/debug';
import './Track.css';

interface TrackProps {
  id: ID;
  name: string;
  color?: string;
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
  onStartEditing: (trackId: ID) => void;
  onStopEditing: () => void;
  onRemove: (trackId: ID) => void;
  onPatternSelect: (patternId: ID, isMultiSelect: boolean) => void;
  onPatternMove: (patternId: ID, newPosition: Position, delta: number) => void;
  onPatternResize: (patternId: ID, newDuration: Duration, edge: 'left' | 'right', startDuration: Duration, startPosition: Position) => void;
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
  onStartEditing,
  onStopEditing,
  onRemove: _onRemove, // Kept for Timeline compatibility, but no longer used (X button removed)
  onPatternSelect,
  onPatternMove,
  onPatternResize,
  onPatternLabelChange,
  onPatternCopy,
  onPatternDelete,
  onPatternVerticalDrag,
  onPatternVerticalDragUpdate,
  onDoubleClick,
}: TrackProps) => {
  // Calculate track height from vertical zoom
  const trackHeight = (TRACK_HEIGHT * verticalZoom) / 100;

  // Debug: log when isMoving changes
  useEffect(() => {
    logger.log(`Track ${id} (${name}): isMoving = ${isMoving}, timestamp = ${Date.now()}`);
  }, [isMoving, id, name]);

  // Debug: log className when it changes
  const trackClassName = `track ${isCurrent ? 'track--current' : ''} ${isMoving ? 'track--moving' : ''}`;
  useEffect(() => {
    logger.log(`Track ${id}: className = "${trackClassName}", timestamp = ${Date.now()}`);
  }, [id, trackClassName]);

  // Scale padding for track header based on zoom (base padding is 16px)
  const headerPadding = Math.max(2, (16 * verticalZoom) / 100);

  const contentRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; position: number } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

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
  // Use a margin of 200px to render patterns slightly off-screen for smooth scrolling
  const visiblePatterns = useMemo(() => {
    return trackPatterns.filter((pattern) => {
      const patternStart = pattern.position;
      const patternEnd = pattern.position + pattern.duration;
      return isRangeVisible(patternStart, patternEnd, viewport, 200);
    });
  }, [trackPatterns, viewport]);

  // Force overflow: visible on track content (both axes must be same)
  // CSS spec: if overflow-x is hidden and overflow-y is visible, browser converts overflow-y to auto
  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      element.style.overflow = 'visible';

      logger.log('Track.tsx: Setting overflow to visible on mount');
      logger.log('Track.tsx: Initial computed overflow:', getComputedStyle(element).overflow);

      // Watch for changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            logger.log('Track.tsx: Style attribute changed!', {
              overflow: getComputedStyle(element).overflow,
              overflowY: getComputedStyle(element).overflowY,
            });
          }
        });
      });

      observer.observe(element, { attributes: true, attributeFilter: ['style'] });

      return () => observer.disconnect();
    }
  }, []);

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    // Don't show menu if clicking on a pattern
    if ((e.target as HTMLElement).closest('.pattern')) {
      return;
    }

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
    if (contextMenu) {
      onDoubleClick(id, contextMenu.position);
    }
  };

  const contextMenuItems: MenuItem[] = [
    {
      label: 'Insert Pattern',
      action: handleInsertPattern,
    },
  ];

  return (
    <div
      className={trackClassName}
      data-testid={`track-${id}`}
      style={{ height: `${trackHeight}px` }}
    >
      <TrackHeader
        id={id}
        name={name}
        color={color || DEFAULT_TRACK_COLOR}
        isCurrent={isCurrent}
        isEditing={isEditing}
        headerPadding={headerPadding}
        onTrackSelect={onTrackSelect}
        onNameChange={onNameChange}
        onStartEditing={onStartEditing}
        onStopEditing={onStopEditing}
        onColorSwatchClick={(e) => {
          e.stopPropagation(); // Don't trigger track selection
          setShowColorPicker(true);
        }}
      />
      <div
        ref={contentRef}
        className="track__content"
        data-testid={`track-${id}-content`}
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
              viewport={viewport}
              snapValue={snapValue}
              isSelected={selectedPatternIds.includes(pattern.id)}
              externalVerticalDragDeltaY={externalVerticalDragDeltaY}
              label={pattern.label}
              trackName={name}
              color={color}
              muted={pattern.muted}
              patternType={pattern.patternType}
              onSelect={onPatternSelect}
              onMove={onPatternMove}
              onResize={onPatternResize}
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
            className="track__ghost-pattern"
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
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
      {showColorPicker && onColorChange && (
        <ColorPicker
          selectedColor={color || DEFAULT_TRACK_COLOR}
          onSelectColor={(newColor) => {
            onColorChange(id, newColor);
          }}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
// Only re-render if props actually change
export default memo(Track);
