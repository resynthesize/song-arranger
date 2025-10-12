/**
 * Song Arranger - Timeline Component
 * Main timeline container with lanes and clips
 */

import { useCallback, useEffect, useRef } from 'react';
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
} from '@/store/slices/lanesSlice';
import { setPlayheadPosition, selectEffectiveSnapValue } from '@/store/slices/timelineSlice';
import { snapToGrid } from '@/utils/snap';
import type { ID, Position, Duration } from '@/types';
import './Timeline.css';

const Timeline = () => {
  const dispatch = useAppDispatch();
  const timelineRef = useRef<HTMLDivElement>(null);

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
      // Snap to grid based on current snap value
      const snappedPosition = snapToGrid(position, effectiveSnapValue);
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

  // Handle vertical clip dragging (move between lanes)
  const handleClipVerticalDrag = useCallback(
    (clipId: ID, deltaY: number) => {
      // Calculate which lane the clip should move to based on deltaY
      const LANE_HEIGHT = 80; // Match CSS .lane height
      const laneIndex = lanes.findIndex((lane) =>
        clips.find((c) => c.id === clipId && c.laneId === lane.id)
      );

      if (laneIndex === -1) return;

      const laneDelta = Math.round(deltaY / LANE_HEIGHT);
      const targetLaneIndex = Math.max(
        0,
        Math.min(lanes.length - 1, laneIndex + laneDelta)
      );

      if (targetLaneIndex !== laneIndex) {
        const targetLaneId = lanes[targetLaneIndex]?.id;
        if (targetLaneId) {
          if (selectedClipIds.includes(clipId) && selectedClipIds.length > 1) {
            // Move all selected clips
            dispatch(updateClipLane({ clipId: selectedClipIds, laneId: targetLaneId }));
          } else {
            // Move single clip
            dispatch(updateClipLane({ clipId, laneId: targetLaneId }));
          }
        }
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
    <div className="timeline" data-testid="timeline" ref={timelineRef}>
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
                onClipSelect={handleClipSelect}
                onClipMove={handleClipMove}
                onClipResize={handleClipResize}
                onClipLabelChange={handleClipLabelChange}
                onClipCopy={handleClipCopy}
                onClipVerticalDrag={handleClipVerticalDrag}
                onDoubleClick={handleLaneDoubleClick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Timeline;
