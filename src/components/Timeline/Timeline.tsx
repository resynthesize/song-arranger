/**
 * Song Arranger - Timeline Component
 * Main timeline container with lanes and clips
 */

import { useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import Lane from '../Lane';
import {
  addClip,
  moveClip,
  moveClips,
  resizeClip,
  resizeClips,
  removeClips,
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
import { snapToGrid } from '@/utils/snap';
import type { ID, Position, Duration } from '@/types';
import './Timeline.css';

const Timeline = () => {
  const dispatch = useAppDispatch();

  // Select data from Redux
  const zoom = useAppSelector((state) => state.timeline.zoom);
  const snapValue = useAppSelector((state) => state.timeline.snapValue);
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
    (clipId: ID, delta: number) => {
      if (selectedClipIds.includes(clipId) && selectedClipIds.length > 1) {
        // Ganged move: move all selected clips
        dispatch(moveClips({ clipIds: selectedClipIds, delta }));
      } else {
        // Single clip move
        const clip = clips.find((c) => c.id === clipId);
        if (clip) {
          const newPosition = Math.max(0, clip.position + delta);
          dispatch(moveClip({ clipId, position: newPosition }));
        }
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
      const snappedPosition = snapToGrid(position, snapValue);
      dispatch(
        addClip({
          laneId,
          position: snappedPosition,
          duration: 4, // Default 4 beats (1 bar)
        })
      );
    },
    [dispatch, snapValue]
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
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, selectedClipIds]);

  return (
    <div className="timeline" data-testid="timeline">
      {lanes.length === 0 ? (
        <div className="timeline__empty">
          <p>No lanes yet. Click &quot;Add Lane&quot; to get started.</p>
        </div>
      ) : (
        <div className="timeline__lanes">
          {lanes.map((lane) => (
            <Lane
              key={lane.id}
              id={lane.id}
              name={lane.name}
              clips={clips}
              zoom={zoom}
              snapValue={snapValue}
              selectedClipIds={selectedClipIds}
              isEditing={editingLaneId === lane.id}
              onNameChange={handleNameChange}
              onStartEditing={handleStartEditing}
              onStopEditing={handleStopEditing}
              onClipSelect={handleClipSelect}
              onClipMove={handleClipMove}
              onClipResize={handleClipResize}
              onDoubleClick={handleLaneDoubleClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;
