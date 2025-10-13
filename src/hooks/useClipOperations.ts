/**
 * Song Arranger - Clip Operations Hook
 * Custom hook for clip-related operations (move, resize, delete, duplicate, etc.)
 */

import { useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
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
  clearSelection,
} from '@/store/slices/selectionSlice';
import { selectAllClips, selectSelectedClipIds } from '@/store/selectors';
import { findNearestNeighbor } from '@/utils/navigation';
import { first } from '@/utils/array';
import { LANE_HEIGHT } from '@/constants';
import { logger } from '@/utils/debug';
import type { ID, Position, Duration, Lane } from '@/types';

interface UseClipOperationsReturn {
  handleClipMove: (clipId: ID, newPosition: Position, delta: number) => void;
  handleClipResize: (
    clipId: ID,
    newDuration: Duration,
    edge: 'left' | 'right',
    startDuration: Duration,
    startPosition: Position
  ) => void;
  handleClipLabelChange: (clipId: ID, label: string) => void;
  handleClipCopy: (clipId: ID) => void;
  handleClipDelete: (clipId: ID) => void;
  handleClipVerticalDrag: (clipId: ID, startingLaneId: ID, deltaY: number) => void;
}

/**
 * Custom hook for clip operations
 * Handles clip movement, resizing, deletion, duplication, and lane changes
 */
export function useClipOperations(
  lanes: Lane[]
): UseClipOperationsReturn {
  const dispatch = useAppDispatch();
  const clips = useAppSelector(selectAllClips);
  const selectedClipIds = useAppSelector(selectSelectedClipIds);

  // Keep clips in a ref so callbacks can access them without changing reference
  const clipsRef = useRef(clips);
  clipsRef.current = clips;

  // Track last positions/durations for ganged operations
  const lastPositionRef = useRef<Map<ID, Position>>(new Map());
  const lastDurationRef = useRef<Map<ID, Duration>>(new Map());

  /**
   * Handle clip movement
   * Supports ganged movement for multiple selected clips
   */
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

  /**
   * Handle clip resize
   * Supports ganged resizing for multiple selected clips
   */
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

  /**
   * Handle clip label change
   */
  const handleClipLabelChange = useCallback(
    (clipId: ID, label: string) => {
      dispatch(updateClip({ clipId, updates: { label } }));
    },
    [dispatch]
  );

  /**
   * Handle clip copy (Alt+drag)
   * Duplicates clip or all selected clips
   */
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

  /**
   * Handle clip deletion (via context menu)
   * Deletes clip and selects nearest neighbor
   */
  const handleClipDelete = useCallback(
    (clipId: ID) => {
      logger.log('[handleClipDelete] Starting deletion', { clipId, selectedClipIds, totalClips: clips.length });

      if (selectedClipIds.includes(clipId) && selectedClipIds.length > 1) {
        // Delete all selected clips - find nearest neighbor to the first deleted clip
        const firstSelectedId = first(selectedClipIds);
        if (!firstSelectedId) {
          dispatch(clearSelection());
          return;
        }

        const firstDeletedClip = clips.find((c) => c.id === firstSelectedId);
        const remainingClips = clips.filter((c) => !selectedClipIds.includes(c.id));

        logger.log('[handleClipDelete] Multi-delete:', {
          deletingCount: selectedClipIds.length,
          firstDeletedClip,
          remainingCount: remainingClips.length
        });

        dispatch(removeClips(selectedClipIds));

        // Try to select nearest neighbor if one exists
        if (firstDeletedClip) {
          const nearestClip = findNearestNeighbor(firstDeletedClip, remainingClips);
          logger.log('[handleClipDelete] Nearest neighbor found:', nearestClip);
          if (nearestClip) {
            logger.log('[handleClipDelete] Selecting nearest clip:', nearestClip.id);
            dispatch(selectClip(nearestClip.id));
          } else {
            logger.log('[handleClipDelete] No nearest clip, clearing selection');
            dispatch(clearSelection());
          }
        } else {
          logger.log('[handleClipDelete] First deleted clip not found, clearing selection');
          dispatch(clearSelection());
        }
      } else {
        // Delete single clip - find nearest neighbor
        const deletedClip = clips.find((c) => c.id === clipId);
        const remainingClips = clips.filter((c) => c.id !== clipId);

        logger.log('[handleClipDelete] Single delete:', {
          deletedClip,
          remainingCount: remainingClips.length
        });

        dispatch(removeClips([clipId]));

        // Try to select nearest neighbor if one exists
        if (deletedClip) {
          const nearestClip = findNearestNeighbor(deletedClip, remainingClips);
          logger.log('[handleClipDelete] Nearest neighbor found:', nearestClip);
          if (nearestClip) {
            logger.log('[handleClipDelete] Selecting nearest clip:', nearestClip.id);
            dispatch(selectClip(nearestClip.id));
          } else {
            logger.log('[handleClipDelete] No nearest clip, clearing selection');
            dispatch(clearSelection());
          }
        }
      }
    },
    [dispatch, selectedClipIds, clips]
  );

  /**
   * Handle vertical clip dragging (move between lanes)
   * Supports ganged vertical movement for multiple selected clips
   */
  const handleClipVerticalDrag = useCallback(
    (clipId: ID, startingLaneId: ID, deltaY: number) => {
      // Calculate which lane the clip should move to based on deltaY from starting lane
      // Use center-based snapping: round instead of floor so clip snaps to the lane
      // that contains >50% of the clip (the "51% rule")
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
          const newLane = lanes[newLaneIndex];
          if (newLane) {
            dispatch(updateClipLane({ clipId: cId, laneId: newLane.id }));
          }
        });
      } else {
        // Single clip move
        const targetLaneIndex = Math.max(
          0,
          Math.min(lanes.length - 1, startingLaneIndex + laneDelta)
        );
        const targetLane = lanes[targetLaneIndex];
        if (targetLane) {
          dispatch(updateClipLane({ clipId, laneId: targetLane.id }));
        }
      }
    },
    [dispatch, lanes, selectedClipIds]
  );

  return {
    handleClipMove,
    handleClipResize,
    handleClipLabelChange,
    handleClipCopy,
    handleClipDelete,
    handleClipVerticalDrag,
  };
}
