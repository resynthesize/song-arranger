/**
 * Song Arranger - Lane Component
 * Horizontal lane that contains clips
 */

import { useRef, useEffect, useMemo, useState, MouseEvent, memo } from 'react';
import Clip from '../Clip';
import ContextMenu, { type MenuItem } from '../ContextMenu';
import ColorPicker from '../ColorPicker';
import GridCanvas from './GridCanvas';
import { LaneHeader } from '../molecules/LaneHeader';
import type { ID, Clip as ClipType, Position, Duration, ViewportState } from '@/types';
import { isRangeVisible } from '@/utils/viewport';
import { useDragToCreateClip } from '@/hooks/useDragToCreateClip';
import { LANE_HEIGHT, DEFAULT_LANE_COLOR } from '@/constants';
import { logger } from '@/utils/debug';
import './Lane.css';

interface LaneProps {
  id: ID;
  name: string;
  color?: string;
  clips: ClipType[];
  viewport: ViewportState;
  snapValue: number;
  selectedClipIds: ID[];
  verticalDragState: { deltaY: number; draggedClipId: ID } | null;
  verticalZoom: number; // Vertical zoom percentage (50-150)
  isCurrent: boolean; // Is this the current lane for navigation
  isEditing: boolean;
  isMoving: boolean; // Is this lane currently animating from a move
  onLaneSelect?: (laneId: ID) => void; // Select this lane (sets currentLaneId)
  onNameChange: (laneId: ID, newName: string) => void;
  onColorChange?: (laneId: ID, color: string) => void;
  onStartEditing: (laneId: ID) => void;
  onStopEditing: () => void;
  onRemove: (laneId: ID) => void;
  onClipSelect: (clipId: ID, isMultiSelect: boolean) => void;
  onClipMove: (clipId: ID, newPosition: Position, delta: number) => void;
  onClipResize: (clipId: ID, newDuration: Duration, edge: 'left' | 'right', startDuration: Duration, startPosition: Position) => void;
  onClipLabelChange?: (clipId: ID, label: string) => void;
  onClipCopy?: (clipId: ID) => void;
  onClipDelete?: (clipId: ID) => void;
  onClipVerticalDrag?: (clipId: ID, startingLaneId: ID, deltaY: number) => void;
  onClipVerticalDragUpdate?: (clipId: ID, deltaY: number) => void;
  onDoubleClick: (laneId: ID, position: Position, duration?: Duration) => void;
}

const Lane = ({
  id,
  name,
  color,
  clips,
  viewport,
  snapValue,
  selectedClipIds,
  verticalDragState,
  verticalZoom,
  isCurrent,
  isEditing,
  isMoving,
  onLaneSelect,
  onNameChange,
  onColorChange,
  onStartEditing,
  onStopEditing,
  onRemove: _onRemove, // Kept for Timeline compatibility, but no longer used (X button removed)
  onClipSelect,
  onClipMove,
  onClipResize,
  onClipLabelChange,
  onClipCopy,
  onClipDelete,
  onClipVerticalDrag,
  onClipVerticalDragUpdate,
  onDoubleClick,
}: LaneProps) => {
  // Calculate lane height from vertical zoom
  const laneHeight = (LANE_HEIGHT * verticalZoom) / 100;

  // Debug: log when isMoving changes
  useEffect(() => {
    logger.log(`Lane ${id} (${name}): isMoving = ${isMoving}, timestamp = ${Date.now()}`);
  }, [isMoving, id, name]);

  // Debug: log className when it changes
  const laneClassName = `lane ${isCurrent ? 'lane--current' : ''} ${isMoving ? 'lane--moving' : ''}`;
  useEffect(() => {
    logger.log(`Lane ${id}: className = "${laneClassName}", timestamp = ${Date.now()}`);
  }, [id, laneClassName]);

  // Scale padding for lane header based on zoom (base padding is 16px)
  const headerPadding = Math.max(2, (16 * verticalZoom) / 100);

  const contentRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; position: number } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Use drag-to-create clip hook
  const { handleMouseDown: handleDragToCreate, ghostClip } = useDragToCreateClip({
    viewport,
    snapValue,
    onCreateClip: (position, duration) => onDoubleClick(id, position, duration),
    containerRef: contentRef,
  });

  // Filter clips to only show those in this lane
  const laneClips = clips.filter((clip) => clip.laneId === id);

  // Virtual rendering: only render clips visible in the viewport
  // Use a margin of 200px to render clips slightly off-screen for smooth scrolling
  const visibleClips = useMemo(() => {
    return laneClips.filter((clip) => {
      const clipStart = clip.position;
      const clipEnd = clip.position + clip.duration;
      return isRangeVisible(clipStart, clipEnd, viewport, 200);
    });
  }, [laneClips, viewport]);

  // Force overflow: visible on lane content (both axes must be same)
  // CSS spec: if overflow-x is hidden and overflow-y is visible, browser converts overflow-y to auto
  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      element.style.overflow = 'visible';

      logger.log('Lane.tsx: Setting overflow to visible on mount');
      logger.log('Lane.tsx: Initial computed overflow:', getComputedStyle(element).overflow);

      // Watch for changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            logger.log('Lane.tsx: Style attribute changed!', {
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
    // Don't show menu if clicking on a clip
    if ((e.target as HTMLElement).closest('.clip')) {
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

  const handleInsertClip = () => {
    if (contextMenu) {
      onDoubleClick(id, contextMenu.position);
    }
  };

  const contextMenuItems: MenuItem[] = [
    {
      label: 'Insert Clip',
      action: handleInsertClip,
    },
  ];

  return (
    <div
      className={laneClassName}
      data-testid={`lane-${id}`}
      style={{ height: `${laneHeight}px` }}
    >
      <LaneHeader
        id={id}
        name={name}
        color={color || DEFAULT_LANE_COLOR}
        isCurrent={isCurrent}
        isEditing={isEditing}
        headerPadding={headerPadding}
        onLaneSelect={onLaneSelect}
        onNameChange={onNameChange}
        onStartEditing={onStartEditing}
        onStopEditing={onStopEditing}
        onColorSwatchClick={(e) => {
          e.stopPropagation(); // Don't trigger lane selection
          setShowColorPicker(true);
        }}
      />
      <div
        ref={contentRef}
        className="lane__content"
        data-testid={`lane-${id}-content`}
        onMouseDown={handleDragToCreate}
        onContextMenu={handleContextMenu}
      >
        <GridCanvas viewport={viewport} snapValue={snapValue} />
        {visibleClips.map((clip) => {
          // Calculate deltaY for this clip if it's selected during vertical drag
          let externalVerticalDragDeltaY: number | undefined;
          if (verticalDragState && selectedClipIds.includes(clip.id)) {
            externalVerticalDragDeltaY = verticalDragState.deltaY;
          }

          return (
            <Clip
              key={clip.id}
              id={clip.id}
              laneId={clip.laneId}
              position={clip.position}
              duration={clip.duration}
              viewport={viewport}
              snapValue={snapValue}
              isSelected={selectedClipIds.includes(clip.id)}
              externalVerticalDragDeltaY={externalVerticalDragDeltaY}
              label={clip.label}
              laneName={name}
              color={color}
              onSelect={onClipSelect}
              onMove={onClipMove}
              onResize={onClipResize}
              onLabelChange={onClipLabelChange}
              onCopy={onClipCopy}
              onDelete={onClipDelete}
              onVerticalDrag={onClipVerticalDrag}
              onVerticalDragUpdate={onClipVerticalDragUpdate}
            />
          );
        })}
        {ghostClip && (
          <div
            className="lane__ghost-clip"
            data-testid="ghost-clip"
            style={{
              left: `${ghostClip.leftPx}px`,
              width: `${ghostClip.widthPx}px`,
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
          selectedColor={color || DEFAULT_LANE_COLOR}
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
export default memo(Lane);
