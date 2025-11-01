/**
 * Cyclone - Pattern Operations Hook
 * Custom hook for clip-related operations (move, resize, delete, duplicate, etc.)
 */

import { useCallback, useRef, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  movePatternInTimeline,
  movePatternsInTimeline,
  resizePatternInTimeline,
  resizePatternsInTimeline,
  deletePatternsInTimeline,
  updatePatternLabel,
  duplicatePatternInTimeline,
  duplicatePatternsInTimeline,
  movePatternToTrack,
  movePatternsToTrack,
} from '@/store/slices/songSlice/slice';
import {
  selectPattern,
  clearSelection,
} from '@/store/slices/selectionSlice';
import { selectAllPatterns, selectSelectedPatternIds } from '@/store/selectors';
import { findNearestNeighbor } from '@/utils/navigation';
import { first } from '@/utils/array';
import { LANE_HEIGHT } from '@/constants';
import { logger } from '@/utils/debug';
import type { ID, Position, Duration, Track } from '@/types';

interface UsePatternOperationsReturn {
  handleClipMove: (patternId: ID, newPosition: Position, delta: number) => void;
  handleClipResize: (
    patternId: ID,
    newDuration: Duration,
    edge: 'left' | 'right',
    startDuration: Duration,
    startPosition: Position
  ) => void;
  handleClipLabelChange: (patternId: ID, label: string) => void;
  handleClipCopy: (patternId: ID) => void;
  handleClipDelete: (patternId: ID) => void;
  handleClipVerticalDrag: (patternId: ID, startingLaneId: ID, deltaY: number) => void;
}

/**
 * Custom hook for pattern operations
 * Handles pattern movement, resizing, deletion, duplication, and track changes
 */
export function usePatternOperations(
  tracks: Track[]
): UsePatternOperationsReturn {
  const dispatch = useAppDispatch();
  const patterns = useAppSelector(selectAllPatterns);
  const selectedClipIds = useAppSelector(selectSelectedPatternIds);

  // Keep patterns in a ref so callbacks can access them without changing reference
  const patternsRef = useRef(patterns);
  patternsRef.current = patterns;

  // Track last positions/durations for ganged operations
  const lastPositionRef = useRef<Map<ID, Position>>(new Map());
  const lastDurationRef = useRef<Map<ID, Duration>>(new Map());

  /**
   * Handle pattern movement
   * Supports ganged movement for multiple selected patterns
   */
  const handleClipMove = useCallback(
    (patternId: ID, newPosition: Position, _delta: number) => {
      if (selectedClipIds.includes(patternId) && selectedClipIds.length > 1) {
        // Ganged move: calculate incremental delta from last position
        // If this is the first move, get the current position from Redux
        let lastPosition = lastPositionRef.current.get(patternId);
        if (lastPosition === undefined) {
          const pattern = patternsRef.current.find(c => c.id === patternId);
          lastPosition = pattern?.position ?? newPosition;
        }

        const incrementalDelta = newPosition - lastPosition;
        lastPositionRef.current.set(patternId, newPosition);

        // Only dispatch if there's actual movement
        if (incrementalDelta !== 0) {
          dispatch(movePatternsInTimeline({
            patternReactIds: selectedClipIds,
            deltaBeats: incrementalDelta
          }));
        }
      } else {
        // Single pattern move
        const clampedPosition = Math.max(0, newPosition);
        dispatch(movePatternInTimeline({
          patternReactId: patternId,
          newPosition: clampedPosition
        }));
        lastPositionRef.current.delete(patternId); // Clear tracking
      }
    },
    [dispatch, selectedClipIds]
  );

  /**
   * Handle pattern resize
   * Supports ganged resizing for multiple selected patterns
   */
  const handleClipResize = useCallback(
    (patternId: ID, newDuration: Duration, edge: 'left' | 'right', startDuration: Duration, startPosition: Position) => {
      console.log('[handleClipResize] Called', {
        patternId,
        newDuration,
        edge,
        startDuration,
        startPosition,
        selectedClipIds,
        isMultiSelect: selectedClipIds.includes(patternId) && selectedClipIds.length > 1
      });

      if (selectedClipIds.includes(patternId) && selectedClipIds.length > 1) {
        console.log('[handleClipResize] MULTI-SELECT PATH - ganged resize');
        // Ganged resize: calculate incremental factor from last duration
        // If this is the first resize, get the current duration from Redux
        let lastDuration = lastDurationRef.current.get(patternId);
        if (lastDuration === undefined) {
          const pattern = patternsRef.current.find(c => c.id === patternId);
          lastDuration = pattern?.duration ?? newDuration;
        }

        const incrementalFactor = newDuration / lastDuration;
        lastDurationRef.current.set(patternId, newDuration);

        console.log('[handleClipResize] Ganged resize factor', { lastDuration, newDuration, incrementalFactor });

        // Only dispatch if there's actual change
        if (incrementalFactor !== 1) {
          console.log('[handleClipResize] Dispatching ganged resize');
          dispatch(resizePatternsInTimeline({
            patternReactIds: selectedClipIds,
            factor: incrementalFactor
          }));
        } else {
          console.log('[handleClipResize] Skipping dispatch - no change in factor');
        }

        // If resizing from left, calculate incremental position delta
        if (edge === 'left') {
          let lastPosition = lastPositionRef.current.get(patternId);
          if (lastPosition === undefined) {
            const pattern = patternsRef.current.find(c => c.id === patternId);
            lastPosition = pattern?.position ?? startPosition;
          }

          const newPosition = Math.max(0, startPosition + (startDuration - newDuration));
          const incrementalPositionDelta = newPosition - (lastPosition ?? startPosition);
          lastPositionRef.current.set(patternId, newPosition);

          if (incrementalPositionDelta !== 0) {
            dispatch(movePatternsInTimeline({
              patternReactIds: selectedClipIds,
              deltaBeats: incrementalPositionDelta
            }));
          }
        }
      } else {
        // Single pattern resize
        console.log('[handleClipResize] SINGLE PATTERN PATH');
        console.log('[handleClipResize] Dispatching resizePatternInTimeline', {
          patternReactId: patternId,
          newDuration
        });
        dispatch(resizePatternInTimeline({
          patternReactId: patternId,
          newDuration
        }));

        // If resizing from left edge, adjust position using start position
        if (edge === 'left') {
          const positionDelta = startDuration - newDuration;
          const newPosition = Math.max(0, startPosition + positionDelta);
          console.log('[handleClipResize] Left edge resize - moving pattern', {
            positionDelta,
            newPosition,
            startPosition,
            startDuration,
            newDuration
          });
          dispatch(movePatternInTimeline({
            patternReactId: patternId,
            newPosition
          }));
        }

        // Clear tracking
        lastDurationRef.current.delete(patternId);
        lastPositionRef.current.delete(patternId);
      }
    },
    [dispatch, selectedClipIds]
  );

  /**
   * Handle pattern label change
   */
  const handleClipLabelChange = useCallback(
    (patternId: ID, label: string) => {
      dispatch(updatePatternLabel({
        patternReactId: patternId,
        label
      }));
    },
    [dispatch]
  );

  /**
   * Handle pattern copy (Alt+drag)
   * Duplicates pattern or all selected patterns
   */
  const handleClipCopy = useCallback(
    (patternId: ID) => {
      if (selectedClipIds.includes(patternId) && selectedClipIds.length > 1) {
        // Duplicate all selected patterns
        dispatch(duplicatePatternsInTimeline({
          patternReactIds: selectedClipIds
        }));
      } else {
        // Duplicate single clip
        dispatch(duplicatePatternInTimeline({
          patternReactId: patternId
        }));
      }
    },
    [dispatch, selectedClipIds]
  );

  /**
   * Handle pattern deletion (via context menu)
   * Deletes pattern and selects nearest neighbor
   */
  const handleClipDelete = useCallback(
    (patternId: ID) => {
      logger.log('[handleClipDelete] Starting deletion', { patternId, selectedClipIds, totalPatterns: patterns.length });

      if (selectedClipIds.includes(patternId) && selectedClipIds.length > 1) {
        // Delete all selected patterns - find nearest neighbor to the first deleted clip
        const firstSelectedId = first(selectedClipIds);
        if (!firstSelectedId) {
          dispatch(clearSelection());
          return;
        }

        const firstDeletedPattern = patterns.find((c) => c.id === firstSelectedId);
        const remainingPatterns = patterns.filter((c) => !selectedClipIds.includes(c.id));

        logger.log('[handleClipDelete] Multi-delete:', {
          deletingCount: selectedClipIds.length,
          firstDeletedPattern,
          remainingCount: remainingPatterns.length
        });

        dispatch(deletePatternsInTimeline({
          patternReactIds: selectedClipIds
        }));

        // Try to select nearest neighbor if one exists
        if (firstDeletedPattern) {
          const nearestPattern = findNearestNeighbor(firstDeletedPattern, remainingPatterns);
          logger.log('[handleClipDelete] Nearest neighbor found:', nearestPattern);
          if (nearestPattern) {
            logger.log('[handleClipDelete] Selecting nearest pattern:', nearestPattern.id);
            dispatch(selectPattern(nearestPattern.id));
          } else {
            logger.log('[handleClipDelete] No nearest clip, clearing selection');
            dispatch(clearSelection());
          }
        } else {
          logger.log('[handleClipDelete] First deleted pattern not found, clearing selection');
          dispatch(clearSelection());
        }
      } else {
        // Delete single pattern - find nearest neighbor
        const deletedPattern = patterns.find((c) => c.id === patternId);
        const remainingPatterns = patterns.filter((c) => c.id !== patternId);

        logger.log('[handleClipDelete] Single delete:', {
          deletedPattern,
          remainingCount: remainingPatterns.length
        });

        dispatch(deletePatternsInTimeline({
          patternReactIds: [patternId]
        }));

        // Try to select nearest neighbor if one exists
        if (deletedPattern) {
          const nearestPattern = findNearestNeighbor(deletedPattern, remainingPatterns);
          logger.log('[handleClipDelete] Nearest neighbor found:', nearestPattern);
          if (nearestPattern) {
            logger.log('[handleClipDelete] Selecting nearest pattern:', nearestPattern.id);
            dispatch(selectPattern(nearestPattern.id));
          } else {
            logger.log('[handleClipDelete] No nearest clip, clearing selection');
            dispatch(clearSelection());
          }
        }
      }
    },
    [dispatch, selectedClipIds, patterns]
  );

  /**
   * Handle vertical pattern dragging (move between tracks)
   * Supports ganged vertical movement for multiple selected patterns
   */
  const handleClipVerticalDrag = useCallback(
    (patternId: ID, startingLaneId: ID, deltaY: number) => {
      // Calculate which track the pattern should move to based on deltaY from starting lane
      // Use center-based snapping: round instead of floor so pattern snaps to the lane
      // that contains >50% of the pattern (the "51% rule")
      const startingLaneIndex = tracks.findIndex((lane) => lane.id === startingLaneId);

      if (startingLaneIndex === -1) return;

      const laneDelta = Math.round(deltaY / LANE_HEIGHT);

      if (selectedClipIds.includes(patternId) && selectedClipIds.length > 1) {
        // Ganged vertical move: move all selected patterns by the same track delta
        // Find min/max track indices to constrain the movement
        const selectedPatterns = patternsRef.current.filter(c => selectedClipIds.includes(c.id));
        const clipLaneIndices = selectedPatterns.map(pattern => {
          const idx = tracks.findIndex(track => track.id === pattern.trackId);
          return { patternId: pattern.id, laneIndex: idx };
        }).filter(item => item.laneIndex !== -1);

        if (clipLaneIndices.length === 0) return;

        // Calculate constrained delta to prevent any pattern from going out of bounds
        const minCurrentIndex = Math.min(...clipLaneIndices.map(item => item.laneIndex));
        const maxCurrentIndex = Math.max(...clipLaneIndices.map(item => item.laneIndex));

        const constrainedDelta = Math.max(
          -minCurrentIndex, // Don't go below track 0
          Math.min(
            laneDelta,
            tracks.length - 1 - maxCurrentIndex // Don't go above last lane
          )
        );

        // Move all selected patterns by the constrained delta
        if (constrainedDelta !== 0) {
          dispatch(movePatternsToTrack({
            patternReactIds: selectedClipIds,
            deltaTrackIndex: constrainedDelta
          }));
        }
      } else {
        // Single pattern move
        const targetLaneIndex = Math.max(
          0,
          Math.min(tracks.length - 1, startingLaneIndex + laneDelta)
        );
        const targetTrack = tracks[targetLaneIndex];
        if (targetTrack) {
          dispatch(movePatternToTrack({
            patternReactId: patternId,
            targetTrackReactId: targetTrack.id
          }));
        }
      }
    },
    [dispatch, tracks, selectedClipIds]
  );

  return useMemo(
    () => ({
      handleClipMove,
      handleClipResize,
      handleClipLabelChange,
      handleClipCopy,
      handleClipDelete,
      handleClipVerticalDrag,
    }),
    [handleClipMove, handleClipResize, handleClipLabelChange, handleClipCopy, handleClipDelete, handleClipVerticalDrag]
  );
}
