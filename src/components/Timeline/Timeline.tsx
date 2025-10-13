/**
 * Song Arranger - Timeline Component
 * Main timeline container with lanes and clips
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useViewport } from '@/hooks/useViewport';
import Lane from '../Lane';
import Ruler from '../Ruler';
import {
  addClip,
  moveClip,
  moveClips,
  resizeClip,
  resizeClips,
  removeClips,
  updateClip,
  duplicateClip,
  duplicateClips,
  updateClipLane,
} from '@/store/slices/clipsSlice';
import {
  selectClip,
  toggleClipSelection,
  clearSelection,
} from '@/store/slices/selectionSlice';
import {
  renameLane,
  setEditingLane,
  clearEditingLane,
  removeLane,
  setLaneColor,
} from '@/store/slices/lanesSlice';
import { setPlayheadPosition, selectEffectiveSnapValue } from '@/store/slices/timelineSlice';
import { snapToGrid, snapToGridFloor } from '@/utils/snap';
import type { ID, Position, Duration } from '@/types';
import './Timeline.css';

const Timeline = () => {
  const dispatch = useAppDispatch();
  const timelineRef = useRef<HTMLDivElement>(null);
  const lastPositionRef = useRef<Map<ID, Position>>(new Map());
  const lastDurationRef = useRef<Map<ID, Duration>>(new Map());
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [verticalDragState, setVerticalDragState] = useState<{
    deltaY: number;
    draggedClipId: ID;
  } | null>(null);

  // Use viewport hook for pan/zoom interactions
  const { viewport, handleZoomIn, handleZoomOut } = useViewport({
    containerRef: timelineRef,
    wheelZoomEnabled: true,
    panEnabled: true,
  });

  // Select data from Redux
  const effectiveSnapValue = useAppSelector(selectEffectiveSnapValue);
  const lanes = useAppSelector((state) => state.lanes.lanes);
  const clips = useAppSelector((state) => state.clips.clips);
  const selectedClipIds = useAppSelector(
    (state) => state.selection.selectedClipIds
  );
  const currentLaneId = useAppSelector((state) => state.selection.currentLaneId);
  const editingLaneId = useAppSelector((state) => state.lanes.editingLaneId);
  const movingLaneId = useAppSelector((state) => state.lanes.movingLaneId);
  const verticalZoom = useAppSelector((state) => state.timeline.verticalZoom);

  // Debug: log vertical zoom and calculated visible lanes
  useEffect(() => {
    const laneHeight = (80 * verticalZoom) / 100;
    const maxVisibleLanes = Math.floor(viewport.heightPx / laneHeight);
    console.log('Timeline Vertical Zoom Debug:', {
      verticalZoom: `${verticalZoom}%`,
      laneHeight: `${laneHeight}px`,
      viewportHeight: `${viewport.heightPx}px`,
      maxVisibleLanes,
      totalLanes: lanes.length
    });
  }, [verticalZoom, viewport.heightPx, lanes.length]);

  // Debug: log movingLaneId changes
  useEffect(() => {
    console.log('Timeline: movingLaneId changed to', movingLaneId);
  }, [movingLaneId]);

  // Keep clips in a ref so callbacks can access them without changing reference
  const clipsRef = useRef(clips);
  clipsRef.current = clips;

  // Handle lane name changes
  const handleNameChange = useCallback(
    (laneId: ID, newName: string) => {
      dispatch(renameLane({ laneId, name: newName }));
    },
    [dispatch]
  );

  const handleStartEditing = useCallback(
    (laneId: ID) => {
      dispatch(setEditingLane(laneId));
    },
    [dispatch]
  );

  const handleStopEditing = useCallback(() => {
    dispatch(clearEditingLane());
  }, [dispatch]);

  // Handle lane color changes
  const handleColorChange = useCallback(
    (laneId: ID, color: string) => {
      dispatch(setLaneColor({ laneId, color }));
    },
    [dispatch]
  );

  // Handle lane removal
  const handleRemoveLane = useCallback(
    (laneId: ID) => {
      // Find all clips in this lane
      const clipsToRemove = clips.filter((clip) => clip.laneId === laneId);
      const clipIdsToRemove = clipsToRemove.map((clip) => clip.id);

      // Remove clips first
      if (clipIdsToRemove.length > 0) {
        dispatch(removeClips(clipIdsToRemove));
      }

      // Remove lane
      dispatch(removeLane(laneId));
    },
    [dispatch, clips]
  );

  // Handle clip selection
  const handleClipSelect = useCallback(
    (clipId: ID, isMultiSelect: boolean) => {
      if (isMultiSelect) {
        dispatch(toggleClipSelection(clipId));
      } else {
        dispatch(selectClip(clipId));
      }
    },
    [dispatch]
  );

  // Handle clip movement
  const handleClipMove = useCallback(
    (clipId: ID, newPosition: Position, _delta: number) => {
      if (selectedClipIds.includes(clipId) && selectedClipIds.length > 1) {
        // Ganged move: calculate incremental delta from last position
        // If this is the first move, get the current position from Redux
        let lastPosition = lastPositionRef.current.get(clipId);
        if (lastPosition === undefined) {
          const clip = clipsRef.current.find(c => c.id === clipId);
          lastPosition = clip?.position ?? newPosition;
        }

        const incrementalDelta = newPosition - lastPosition;
        lastPositionRef.current.set(clipId, newPosition);

        // Only dispatch if there's actual movement
        if (incrementalDelta !== 0) {
          dispatch(moveClips({ clipIds: selectedClipIds, delta: incrementalDelta }));
        }
      } else {
        // Single clip move
        const clampedPosition = Math.max(0, newPosition);
        dispatch(moveClip({ clipId, position: clampedPosition }));
        lastPositionRef.current.delete(clipId); // Clear tracking
      }
    },
    [dispatch, selectedClipIds]
  );

  // Handle clip resize
  const handleClipResize = useCallback(
    (clipId: ID, newDuration: Duration, edge: 'left' | 'right', startDuration: Duration, startPosition: Position) => {
      if (selectedClipIds.includes(clipId) && selectedClipIds.length > 1) {
        // Ganged resize: calculate incremental factor from last duration
        // If this is the first resize, get the current duration from Redux
        let lastDuration = lastDurationRef.current.get(clipId);
        if (lastDuration === undefined) {
          const clip = clipsRef.current.find(c => c.id === clipId);
          lastDuration = clip?.duration ?? newDuration;
        }

        const incrementalFactor = newDuration / lastDuration;
        lastDurationRef.current.set(clipId, newDuration);

        // Only dispatch if there's actual change
        if (incrementalFactor !== 1) {
          dispatch(resizeClips({ clipIds: selectedClipIds, factor: incrementalFactor }));
        }

        // If resizing from left, calculate incremental position delta
        if (edge === 'left') {
          let lastPosition = lastPositionRef.current.get(clipId);
          if (lastPosition === undefined) {
            const clip = clipsRef.current.find(c => c.id === clipId);
            lastPosition = clip?.position ?? startPosition;
          }

          const newPosition = Math.max(0, startPosition + (startDuration - newDuration));
          const incrementalPositionDelta = newPosition - lastPosition;
          lastPositionRef.current.set(clipId, newPosition);

          if (incrementalPositionDelta !== 0) {
            dispatch(moveClips({ clipIds: selectedClipIds, delta: incrementalPositionDelta }));
          }
        }
      } else {
        // Single clip resize
        dispatch(resizeClip({ clipId, duration: newDuration }));

        // If resizing from left edge, adjust position using start position
        if (edge === 'left') {
          const positionDelta = startDuration - newDuration;
          const newPosition = Math.max(0, startPosition + positionDelta);
          dispatch(moveClip({ clipId, position: newPosition }));
        }

        // Clear tracking
        lastDurationRef.current.delete(clipId);
        lastPositionRef.current.delete(clipId);
      }
    },
    [dispatch, selectedClipIds]
  );

  // Handle double-click to create clip
  const handleLaneDoubleClick = useCallback(
    (laneId: ID, position: Position) => {
      // Snap to left edge of grid cell (floor) - if you click in a grid cell,
      // the clip starts at the left edge of that cell
      const snappedPosition = snapToGridFloor(position, effectiveSnapValue);
      dispatch(
        addClip({
          laneId,
          position: snappedPosition,
          duration: 4, // Default 4 beats (1 bar)
        })
      );
    },
    [dispatch, effectiveSnapValue]
  );

  // Handle clip label change
  const handleClipLabelChange = useCallback(
    (clipId: ID, label: string) => {
      dispatch(updateClip({ clipId, updates: { label } }));
    },
    [dispatch]
  );

  // Handle clip copy (Alt+drag)
  const handleClipCopy = useCallback(
    (clipId: ID) => {
      if (selectedClipIds.includes(clipId) && selectedClipIds.length > 1) {
        // Duplicate all selected clips
        dispatch(duplicateClips(selectedClipIds));
      } else {
        // Duplicate single clip
        dispatch(duplicateClip(clipId));
      }
    },
    [dispatch, selectedClipIds]
  );

  // Handle clip deletion (via context menu)
  const handleClipDelete = useCallback(
    (clipId: ID) => {
      if (selectedClipIds.includes(clipId) && selectedClipIds.length > 1) {
        // Delete all selected clips
        dispatch(removeClips(selectedClipIds));
        dispatch(clearSelection());
      } else {
        // Delete single clip
        dispatch(removeClips([clipId]));
      }
    },
    [dispatch, selectedClipIds]
  );

  // Handle vertical clip drag updates (called during drag for visual feedback)
  const handleClipVerticalDragUpdate = useCallback(
    (clipId: ID, deltaY: number) => {
      setVerticalDragState({ deltaY, draggedClipId: clipId });
    },
    []
  );

  // Handle vertical clip dragging (move between lanes) - called on mouseup
  const handleClipVerticalDrag = useCallback(
    (clipId: ID, startingLaneId: ID, deltaY: number) => {
      // Clear visual drag state
      setVerticalDragState(null);

      // Calculate which lane the clip should move to based on deltaY from starting lane
      // Use center-based snapping: round instead of floor so clip snaps to the lane
      // that contains >50% of the clip (the "51% rule")
      const LANE_HEIGHT = 80; // Match CSS .lane height
      const startingLaneIndex = lanes.findIndex((lane) => lane.id === startingLaneId);

      if (startingLaneIndex === -1) return;

      const laneDelta = Math.round(deltaY / LANE_HEIGHT);

      if (selectedClipIds.includes(clipId) && selectedClipIds.length > 1) {
        // Ganged vertical move: move all selected clips by the same lane delta
        // Find min/max lane indices to constrain the movement
        const selectedClips = clipsRef.current.filter(c => selectedClipIds.includes(c.id));
        const clipLaneIndices = selectedClips.map(clip => {
          const idx = lanes.findIndex(lane => lane.id === clip.laneId);
          return { clipId: clip.id, laneIndex: idx };
        }).filter(item => item.laneIndex !== -1);

        if (clipLaneIndices.length === 0) return;

        // Calculate constrained delta to prevent any clip from going out of bounds
        const minCurrentIndex = Math.min(...clipLaneIndices.map(item => item.laneIndex));
        const maxCurrentIndex = Math.max(...clipLaneIndices.map(item => item.laneIndex));

        const constrainedDelta = Math.max(
          -minCurrentIndex, // Don't go below lane 0
          Math.min(
            laneDelta,
            lanes.length - 1 - maxCurrentIndex // Don't go above last lane
          )
        );

        // Move each clip by the constrained delta
        clipLaneIndices.forEach(({ clipId: cId, laneIndex }) => {
          const newLaneIndex = laneIndex + constrainedDelta;
          const newLaneId = lanes[newLaneIndex]?.id;
          if (newLaneId) {
            dispatch(updateClipLane({ clipId: cId, laneId: newLaneId }));
          }
        });
      } else {
        // Single clip move
        const targetLaneIndex = Math.max(
          0,
          Math.min(lanes.length - 1, startingLaneIndex + laneDelta)
        );
        const targetLaneId = lanes[targetLaneIndex]?.id;
        if (targetLaneId) {
          dispatch(updateClipLane({ clipId, laneId: targetLaneId }));
        }
      }
    },
    [dispatch, lanes, selectedClipIds]
  );

  // Handle ruler click to move playhead
  const handleRulerClick = useCallback(
    (position: Position) => {
      const snappedPosition = snapToGrid(position, effectiveSnapValue);
      dispatch(setPlayheadPosition(snappedPosition));
    },
    [dispatch, effectiveSnapValue]
  );

  // Handle rectangle selection
  const handleTimelineMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only start rectangle selection if clicking on the timeline background (not on clips/lanes)
    const target = e.target as HTMLElement;
    if (
      !target.classList.contains('timeline__lanes') &&
      !target.classList.contains('lane__content') &&
      !target.classList.contains('lane__grid')
    ) {
      return;
    }

    // Don't interfere with middle mouse button panning
    if (e.button !== 0) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionRect({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  }, []);

  // Update selection rectangle on mouse move
  useEffect(() => {
    if (!selectionRect) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setSelectionRect((prev) => {
        if (!prev) return null;
        return { ...prev, currentX: x, currentY: y };
      });
    };

    const handleMouseUp = () => {
      if (!selectionRect || !timelineRef.current) {
        setSelectionRect(null);
        return;
      }

      // Calculate selection bounds in viewport coordinates
      const minX = Math.min(selectionRect.startX, selectionRect.currentX);
      const maxX = Math.max(selectionRect.startX, selectionRect.currentX);
      const minY = Math.min(selectionRect.startY, selectionRect.currentY);
      const maxY = Math.max(selectionRect.startY, selectionRect.currentY);

      // Find all clips within the selection rectangle
      // Do comparison in pixel space to avoid precision loss at low zoom levels
      const LANE_HEADER_WIDTH = 150; // Match CSS .lane__header width
      const selectedIds: ID[] = [];
      clips.forEach((clip) => {
        // Convert clip beat positions to viewport pixels, then add lane header offset
        // Clips are positioned inside lane__content, which starts after the 150px lane header
        const clipStartPx = LANE_HEADER_WIDTH + (clip.position - viewport.offsetBeats) * viewport.zoom;
        const clipEndPx = LANE_HEADER_WIDTH + (clip.position + clip.duration - viewport.offsetBeats) * viewport.zoom;

        // Check if clip overlaps with selection horizontally (in pixel space)
        const horizontalOverlap = clipStartPx < maxX && clipEndPx > minX;

        if (horizontalOverlap) {
          // Find the lane's Y position to check vertical overlap
          const laneIndex = lanes.findIndex((lane) => lane.id === clip.laneId);
          if (laneIndex !== -1) {
            const LANE_HEIGHT = 80; // Match CSS .lane height
            const RULER_HEIGHT = 50; // Match CSS .ruler height
            const laneY = RULER_HEIGHT + laneIndex * LANE_HEIGHT;
            const laneBottom = laneY + LANE_HEIGHT;

            // Check if selection rectangle overlaps with this lane vertically
            if (laneY < maxY && laneBottom > minY) {
              selectedIds.push(clip.id);
            }
          }
        }
      });

      // Update selection
      if (selectedIds.length > 0) {
        // Select first clip and toggle the rest
        const firstClipId = selectedIds[0];
        if (firstClipId) {
          dispatch(selectClip(firstClipId));
          selectedIds.slice(1).forEach((clipId) => {
            dispatch(toggleClipSelection(clipId));
          });
        }
      } else {
        // Clear selection if no clips were selected
        dispatch(clearSelection());
      }

      setSelectionRect(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectionRect, viewport, clips, lanes, dispatch]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected clips
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedClipIds.length > 0
      ) {
        e.preventDefault();
        dispatch(removeClips(selectedClipIds));
        dispatch(clearSelection());
      }

      // Escape to clear selection
      if (e.key === 'Escape') {
        dispatch(clearSelection());
      }

      // Zoom shortcuts - use viewport hook handlers
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleZoomOut();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, selectedClipIds, handleZoomIn, handleZoomOut]);

  return (
    <div
      className="timeline"
      data-testid="timeline"
      ref={timelineRef}
      onMouseDown={handleTimelineMouseDown}
    >
      {lanes.length === 0 ? (
        <div className="timeline__empty">
          <p>No lanes yet. Click &quot;Add Lane&quot; to get started.</p>
        </div>
      ) : (
        <>
          <Ruler
            viewport={viewport}
            snapValue={effectiveSnapValue}
            onPositionClick={handleRulerClick}
          />
          <div className="timeline__lanes">
            {lanes.map((lane) => (
              <Lane
                key={lane.id}
                id={lane.id}
                name={lane.name}
                color={lane.color}
                clips={clips}
                viewport={viewport}
                snapValue={effectiveSnapValue}
                selectedClipIds={selectedClipIds}
                verticalDragState={verticalDragState}
                verticalZoom={verticalZoom}
                isCurrent={lane.id === currentLaneId}
                isEditing={editingLaneId === lane.id}
                isMoving={movingLaneId === lane.id}
                onNameChange={handleNameChange}
                onColorChange={handleColorChange}
                onStartEditing={handleStartEditing}
                onStopEditing={handleStopEditing}
                onRemove={handleRemoveLane}
                onClipSelect={handleClipSelect}
                onClipMove={handleClipMove}
                onClipResize={handleClipResize}
                onClipLabelChange={handleClipLabelChange}
                onClipCopy={handleClipCopy}
                onClipDelete={handleClipDelete}
                onClipVerticalDrag={handleClipVerticalDrag}
                onClipVerticalDragUpdate={handleClipVerticalDragUpdate}
                onDoubleClick={handleLaneDoubleClick}
              />
            ))}
          </div>
        </>
      )}
      {selectionRect && (
        <div
          className="timeline__selection-rect"
          style={{
            left: `${Math.min(selectionRect.startX, selectionRect.currentX)}px`,
            top: `${Math.min(selectionRect.startY, selectionRect.currentY)}px`,
            width: `${Math.abs(selectionRect.currentX - selectionRect.startX)}px`,
            height: `${Math.abs(selectionRect.currentY - selectionRect.startY)}px`,
          }}
        />
      )}
    </div>
  );
};

export default Timeline;
