/**
 * Song Arranger - Lane Component
 * Horizontal lane that contains clips
 */

import { useRef, useEffect, useMemo, useState, KeyboardEvent, MouseEvent, memo } from 'react';
import Clip from '../Clip';
import ContextMenu, { type MenuItem } from '../ContextMenu';
import ColorPicker from '../ColorPicker';
import type { ID, Clip as ClipType, Position, Duration, ViewportState } from '@/types';
import { beatsToViewportPx, isRangeVisible } from '@/utils/viewport';
import { snapToGridFloor, snapToGrid } from '@/utils/snap';
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
  // Calculate lane height from vertical zoom (base height is 80px)
  const laneHeight = (80 * verticalZoom) / 100;

  // Debug: log when isMoving changes
  useEffect(() => {
    console.log(`Lane ${id} (${name}): isMoving = ${isMoving}, timestamp = ${Date.now()}`);
  }, [isMoving, id, name]);

  // Debug: log className when it changes
  const laneClassName = `lane ${isCurrent ? 'lane--current' : ''} ${isMoving ? 'lane--moving' : ''}`;
  useEffect(() => {
    console.log(`Lane ${id}: className = "${laneClassName}", timestamp = ${Date.now()}`);
  }, [id, laneClassName]);

  // Scale padding for lane header based on zoom (base padding is 16px)
  const headerPadding = Math.max(2, (16 * verticalZoom) / 100);

  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; position: number } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // State for drag-to-create clip functionality
  const [dragCreateState, setDragCreateState] = useState<{
    startX: number;
    startY: number;
    startPositionBeats: Position;
    currentPositionBeats: Position;
  } | null>(null);

  // Track click timing for double-click detection
  const lastClickTimeRef = useRef<number>(0);
  const lastClickPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Force overflow: visible on lane content (both axes must be same)
  // CSS spec: if overflow-x is hidden and overflow-y is visible, browser converts overflow-y to auto
  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      element.style.overflow = 'visible';

      console.log('Lane.tsx: Setting overflow to visible on mount');
      console.log('Lane.tsx: Initial computed overflow:', getComputedStyle(element).overflow);

      // Watch for changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            console.log('Lane.tsx: Style attribute changed!', {
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

  // Draw adaptive grid lines on canvas - matches ruler's 4-division grid system
  useEffect(() => {
    const canvas = gridCanvasRef.current;
    const container = contentRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const BEATS_PER_BAR = 4;

    // Calculate visible range in beats using viewport
    const startBeat = viewport.offsetBeats;
    const beatsVisible = viewport.widthPx / viewport.zoom;
    const endBeat = startBeat + beatsVisible;

    // Calculate visible bars
    const startBar = Math.floor(startBeat / BEATS_PER_BAR);
    const endBar = Math.ceil(endBeat / BEATS_PER_BAR);
    const barsVisible = endBar - startBar;

    // Determine bar line interval (same logic as ruler)
    let barInterval = 1;
    if (barsVisible > 128) {
      barInterval = 16; // Very zoomed out: every 16 bars
    } else if (barsVisible > 64) {
      barInterval = 8; // Every 8 bars
    } else if (barsVisible > 32) {
      barInterval = 4; // Every 4 bars
    } else if (barsVisible > 16) {
      barInterval = 2; // Every 2 bars
    }

    // Calculate grid interval: always 4 divisions between consecutive bar numbers
    const gridIntervalBeats = (barInterval * BEATS_PER_BAR) / 4;

    // Draw bar lines and grid lines (same logic as Ruler)
    // Start from the first bar that matches the interval and increment by barInterval
    const firstIntervalBar = Math.floor(startBar / barInterval) * barInterval;
    for (let bar = firstIntervalBar; bar <= endBar + barInterval; bar += barInterval) {
      const barBeat = bar * BEATS_PER_BAR;
      const x = beatsToViewportPx(barBeat, viewport); // Position relative to viewport

      // Draw bar line (numbered bars in ruler) - brighter and thicker
      if (x >= -5 && x <= canvas.width + 5) {
        ctx.strokeStyle = '#00ff00';
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Generate 3 grid lines between this bar and the next numbered bar
      ctx.strokeStyle = '#004400';
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const gridBeat = barBeat + (i * gridIntervalBeats);
        const gridX = beatsToViewportPx(gridBeat, viewport);

        // Only draw if within visible range (with 5px margin for edges)
        if (gridBeat >= startBeat && gridBeat <= endBeat && gridX >= -5 && gridX <= canvas.width + 5) {
          ctx.beginPath();
          ctx.moveTo(gridX, 0);
          ctx.lineTo(gridX, canvas.height);
          ctx.stroke();
        }
      }
    }
  }, [viewport, snapValue]);

  // Re-draw grid when window resizes
  useEffect(() => {
    const handleResize = () => {
      const canvas = gridCanvasRef.current;
      const container = contentRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle drag-to-create mousemove and mouseup
  useEffect(() => {
    if (!dragCreateState) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!contentRef.current || !dragCreateState) return;

      const rect = contentRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentPositionBeats = viewport.offsetBeats + currentX / viewport.zoom;

      setDragCreateState((prev) => {
        if (!prev) return null;
        return { ...prev, currentPositionBeats };
      });
    };

    const handleMouseUp = (e: globalThis.MouseEvent) => {
      if (!contentRef.current || !dragCreateState) {
        setDragCreateState(null);
        return;
      }

      const rect = contentRef.current.getBoundingClientRect();

      // Check if mouse is still within lane boundaries vertically
      const mouseY = e.clientY;
      const laneTop = rect.top;
      const laneBottom = rect.bottom;
      const isInsideLane = mouseY >= laneTop && mouseY <= laneBottom;

      if (!isInsideLane) {
        // Cancel creation if dragged outside lane
        setDragCreateState(null);
        return;
      }

      // Calculate final position and duration
      const startPos = dragCreateState.startPositionBeats;
      const endPos = dragCreateState.currentPositionBeats;

      // Calculate raw duration to detect direction
      const rawDuration = endPos - startPos;

      // Snap duration to grid and enforce minimum
      const minDuration = Math.max(snapValue, 0.25); // Minimum is snap value or 0.25 beats
      let clipPosition: Position;
      let duration: Duration;

      if (Math.abs(rawDuration) < 0.01) {
        // Quick click without drag - create default 4-beat clip at start position
        clipPosition = snapToGridFloor(startPos, snapValue);
        duration = 4;
      } else if (rawDuration >= 0) {
        // Dragging forward (left to right)
        clipPosition = snapToGridFloor(startPos, snapValue);
        const snappedEnd = snapToGrid(endPos, snapValue);
        duration = Math.max(minDuration, snappedEnd - clipPosition);
      } else {
        // Dragging backward (right to left)
        // For backward drag, floor the end position and use the ceiling of start to include the full grid cell
        const snappedEnd = snapToGridFloor(endPos, snapValue);
        const snappedStart = snapToGrid(startPos, snapValue);
        clipPosition = snappedEnd;
        duration = Math.max(minDuration, snappedStart - snappedEnd);
      }

      // Create the clip
      onDoubleClick(id, clipPosition, duration);

      // Clear drag state
      setDragCreateState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragCreateState, viewport, snapValue, id, onDoubleClick]);

  const handleNameDoubleClick = () => {
    onStartEditing(id);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newName = (e.target as HTMLInputElement).value;
      onNameChange(id, newName);
      onStopEditing();
    } else if (e.key === 'Escape') {
      onStopEditing();
    }
  };

  const handleInputBlur = () => {
    if (inputRef.current) {
      const newName = inputRef.current.value;
      onNameChange(id, newName);
    }
    onStopEditing();
  };

  const handleContentMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Only handle left mouse button
    if (e.button !== 0) return;

    // Don't trigger if clicking on a clip
    if ((e.target as HTMLElement).closest('.clip')) {
      return;
    }

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    const distanceFromLastClick = Math.hypot(
      e.clientX - lastClickPosRef.current.x,
      e.clientY - lastClickPosRef.current.y
    );

    // Double-click threshold: within 500ms and within 5px of last click
    const isDoubleClick = timeSinceLastClick < 500 && distanceFromLastClick < 5;

    if (isDoubleClick && contentRef.current) {
      // This is the second click - start drag-to-create
      const rect = contentRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const positionInBeats = viewport.offsetBeats + clickX / viewport.zoom;

      setDragCreateState({
        startX: e.clientX,
        startY: e.clientY,
        startPositionBeats: positionInBeats,
        currentPositionBeats: positionInBeats,
      });

      // Prevent default and stop propagation to avoid text selection and drag selection
      e.preventDefault();
      e.stopPropagation();
    } else {
      // This is a single click - just track it for next potential double-click
      lastClickTimeRef.current = now;
      lastClickPosRef.current = { x: e.clientX, y: e.clientY };
    }
  };


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
      <div
        className="lane__header"
        style={{ padding: `${headerPadding}px` }}
        onClick={() => onLaneSelect?.(id)}
        data-testid={`lane-${id}-header`}
      >
        {isCurrent && <span className="lane__current-indicator">&gt;</span>}
        <button
          className="lane__color-swatch"
          onClick={(e) => {
            e.stopPropagation(); // Don't trigger lane selection
            setShowColorPicker(true);
          }}
          title="Change lane color"
          data-testid={`lane-${id}-color-swatch`}
          style={{ color: color || '#00ff00' }}
        >
          █
        </button>
        {isEditing ? (
          <input
            ref={inputRef}
            className="lane__name-input terminal-input"
            defaultValue={name}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            onClick={(e) => e.stopPropagation()} // Don't trigger lane selection while editing
          />
        ) : (
          <div className="lane__name" onDoubleClick={handleNameDoubleClick}>
            {name}
          </div>
        )}
      </div>
      <div
        ref={contentRef}
        className="lane__content"
        data-testid={`lane-${id}-content`}
        onMouseDown={handleContentMouseDown}
        onContextMenu={handleContextMenu}
      >
        <canvas
          ref={gridCanvasRef}
          className="lane__grid"
          data-testid={`lane-${id}-grid`}
        />
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
        {dragCreateState && (() => {
          // Render ghost clip preview
          const startPos = dragCreateState.startPositionBeats;
          const endPos = dragCreateState.currentPositionBeats;

          // Calculate direction and duration
          const rawDuration = endPos - startPos;
          const minDuration = Math.max(snapValue, 0.25);

          let clipPosition: Position;
          let duration: Duration;

          if (rawDuration >= 0) {
            // Dragging forward (left to right)
            clipPosition = snapToGridFloor(startPos, snapValue);
            const snappedEnd = snapToGrid(endPos, snapValue);
            duration = Math.max(minDuration, snappedEnd - clipPosition);
          } else {
            // Dragging backward (right to left)
            // For backward drag, floor the end position and use the ceiling of start to include the full grid cell
            const snappedEnd = snapToGridFloor(endPos, snapValue);
            const snappedStart = snapToGrid(startPos, snapValue);
            clipPosition = snappedEnd;
            duration = Math.max(minDuration, snappedStart - snappedEnd);
          }

          // Calculate pixel position and width
          const leftPx = beatsToViewportPx(clipPosition, viewport);
          const widthPx = duration * viewport.zoom;

          return (
            <div
              className="lane__ghost-clip"
              data-testid="ghost-clip"
              style={{
                left: `${leftPx}px`,
                width: `${widthPx}px`,
                height: '100%',
                position: 'absolute',
                top: 0,
                pointerEvents: 'none',
              }}
            />
          );
        })()}
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
          selectedColor={color || '#00ff00'}
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
