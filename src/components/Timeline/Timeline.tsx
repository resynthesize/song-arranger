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
} from '@/store/slices/lanesSlice';
import { setPlayheadPosition, selectEffectiveSnapValue } from '@/store/slices/timelineSlice';
import { snapToGrid, snapToGridFloor } from '@/utils/snap';
import type { ID, Position, Duration } from '@/types';
import './Timeline.css';

const Timeline = () => {
  const dispatch = useAppDispatch();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
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
  const editingLaneId = useAppSelector((state) => state.lanes.editingLaneId);

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
    (clipId: ID, newPosition: Position) => {
      const clip = clips.find((c) => c.id === clipId);
      if (!clip) return;

      if (selectedClipIds.includes(clipId) && selectedClipIds.length > 1) {
        // Ganged move: calculate delta from dragged clip and move all selected clips
        const delta = newPosition - clip.position;
        dispatch(moveClips({ clipIds: selectedClipIds, delta }));
      } else {
        // Single clip move
        const clampedPosition = Math.max(0, newPosition);
        dispatch(moveClip({ clipId, position: clampedPosition }));
      }
    },
    [dispatch, selectedClipIds, clips]
  );

  // Handle clip resize
  const handleClipResize = useCallback(
    (clipId: ID, newDuration: Duration, edge: 'left' | 'right') => {
      const clip = clips.find((c) => c.id === clipId);
      if (!clip) return;

      if (selectedClipIds.includes(clipId) && selectedClipIds.length > 1) {
        // Ganged resize: resize all selected clips proportionally
        const factor = newDuration / clip.duration;
        dispatch(resizeClips({ clipIds: selectedClipIds, factor }));

        // If resizing from left, move all clips
        if (edge === 'left') {
          const positionDelta = clip.duration - newDuration;
          dispatch(moveClips({ clipIds: selectedClipIds, delta: positionDelta }));
        }
      } else {
        // Single clip resize
        dispatch(resizeClip({ clipId, duration: newDuration }));

        // If resizing from left edge, adjust position
        if (edge === 'left') {
          const positionDelta = clip.duration - newDuration;
          const newPosition = Math.max(0, clip.position + positionDelta);
          dispatch(moveClip({ clipId, position: newPosition }));
        }
      }
    },
    [dispatch, selectedClipIds, clips]
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

  // Handle vertical clip dragging (move between lanes)
  const handleClipVerticalDrag = useCallback(
    (clipId: ID, startingLaneId: ID, deltaY: number) => {
      // Calculate which lane the clip should move to based on deltaY from starting lane
      const LANE_HEIGHT = 80; // Match CSS .lane height
      const startingLaneIndex = lanes.findIndex((lane) => lane.id === startingLaneId);

      if (startingLaneIndex === -1) return;

      const laneDelta = Math.floor(deltaY / LANE_HEIGHT);
      const targetLaneIndex = Math.max(
        0,
        Math.min(lanes.length - 1, startingLaneIndex + laneDelta)
      );

      const targetLaneId = lanes[targetLaneIndex]?.id;
      if (!targetLaneId) return;

      // Get the current lane of the clip to avoid redundant updates
      const clip = clips.find((c) => c.id === clipId);
      if (clip && clip.laneId === targetLaneId) {
        return; // Already in target lane
      }

      if (selectedClipIds.includes(clipId) && selectedClipIds.length > 1) {
        // Move all selected clips
        dispatch(updateClipLane({ clipId: selectedClipIds, laneId: targetLaneId }));
      } else {
        // Move single clip
        dispatch(updateClipLane({ clipId, laneId: targetLaneId }));
      }
    },
    [dispatch, lanes, clips, selectedClipIds]
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

      // Convert X coordinates to beat positions
      const minBeats = viewport.offsetBeats + minX / viewport.zoom;
      const maxBeats = viewport.offsetBeats + maxX / viewport.zoom;

      // Find all clips within the selection rectangle
      const selectedIds: ID[] = [];
      clips.forEach((clip) => {
        const clipStart = clip.position;
        const clipEnd = clip.position + clip.duration;

        // Check if clip overlaps with selection horizontally
        const horizontalOverlap = clipStart < maxBeats && clipEnd > minBeats;

        if (horizontalOverlap) {
          // Find the lane's Y position to check vertical overlap
          const laneIndex = lanes.findIndex((lane) => lane.id === clip.laneId);
          if (laneIndex !== -1) {
            const LANE_HEIGHT = 80; // Match CSS
            const RULER_HEIGHT = 40; // Approximate ruler height
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
        dispatch(selectClip(selectedIds[0]));
        selectedIds.slice(1).forEach((clipId) => {
          dispatch(toggleClipSelection(clipId));
        });
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
                clips={clips}
                viewport={viewport}
                snapValue={effectiveSnapValue}
                selectedClipIds={selectedClipIds}
                isEditing={editingLaneId === lane.id}
                onNameChange={handleNameChange}
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
