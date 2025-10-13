/**
 * Song Arranger - Navigation Shortcuts Hook
 * Handles keyboard shortcuts for playhead and timeline navigation
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  stop,
  movePlayheadByBars,
  movePlayheadToPosition,
  adjustTempo,
} from '@/store/slices/timelineSlice';
import {
  cycleSelection,
  selectClip,
  navigateUp as navigateUpAction,
  navigateDown as navigateDownAction,
} from '@/store/slices/selectionSlice';
import {
  findNearestClipEast,
  findNearestClipWest,
  findNearestClipNorth,
  findNearestClipSouth,
} from '@/utils/navigation';
import { first } from '@/utils/array';

export interface NavigationShortcutHandlers {
  stop: () => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;
  movePlayheadLeft: () => void;
  movePlayheadRight: () => void;
  movePlayheadPrevClip: () => void;
  movePlayheadNextClip: () => void;
  cycleForward: () => void;
  cycleBackward: () => void;
  navigateUp: () => void;
  navigateDown: () => void;
  navigateLeft: () => void;
  navigateRight: () => void;
  adjustTempoUp: () => void;
  adjustTempoDown: () => void;
}

/**
 * Hook for playhead and timeline navigation keyboard shortcuts
 */
export const useNavigationShortcuts = (): NavigationShortcutHandlers => {
  const dispatch = useAppDispatch();
  const selectedClipIds = useAppSelector((state) => state.selection.selectedClipIds);
  const clips = useAppSelector((state) => state.clips.clips);
  const lanes = useAppSelector((state) => state.lanes.lanes);
  const playheadPosition = useAppSelector((state) => state.timeline.playheadPosition);

  const handleStop = useCallback(() => {
    dispatch(stop());
  }, [dispatch]);

  const handleJumpToStart = useCallback(() => {
    dispatch(movePlayheadToPosition(0));
  }, [dispatch]);

  const handleJumpToEnd = useCallback(() => {
    // Find the end position (furthest clip end)
    const endPosition = clips.reduce((max, clip) => {
      const clipEnd = clip.position + clip.duration;
      return Math.max(max, clipEnd);
    }, 0);
    dispatch(movePlayheadToPosition(endPosition));
  }, [dispatch, clips]);

  const handleMovePlayheadLeft = useCallback(() => {
    dispatch(movePlayheadByBars(-1));
  }, [dispatch]);

  const handleMovePlayheadRight = useCallback(() => {
    dispatch(movePlayheadByBars(1));
  }, [dispatch]);

  const handleMovePlayheadPrevClip = useCallback(() => {
    // Get all clip boundaries
    const boundaries = new Set<number>();
    boundaries.add(0);
    clips.forEach(clip => {
      boundaries.add(clip.position);
      boundaries.add(clip.position + clip.duration);
    });

    const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

    // Find previous boundary
    const prev = sortedBoundaries.reverse().find(pos => pos < playheadPosition);
    if (prev !== undefined) {
      dispatch(movePlayheadToPosition(prev));
    }
  }, [dispatch, clips, playheadPosition]);

  const handleMovePlayheadNextClip = useCallback(() => {
    // Get all clip boundaries
    const boundaries = new Set<number>();
    boundaries.add(0);
    clips.forEach(clip => {
      boundaries.add(clip.position);
      boundaries.add(clip.position + clip.duration);
    });

    const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

    // Find next boundary
    const next = sortedBoundaries.find(pos => pos > playheadPosition);
    if (next !== undefined) {
      dispatch(movePlayheadToPosition(next));
    }
  }, [dispatch, clips, playheadPosition]);

  const handleCycleForward = useCallback(() => {
    // Get clips in current lane (if selection exists)
    let laneClips = clips;
    if (selectedClipIds.length > 0) {
      const firstSelectedId = first(selectedClipIds);
      if (firstSelectedId) {
        const selectedClip = clips.find(c => c.id === firstSelectedId);
        if (selectedClip) {
          laneClips = clips.filter(c => c.laneId === selectedClip.laneId);
          // Sort by position
          laneClips.sort((a, b) => a.position - b.position);
        }
      }
    }

    dispatch(cycleSelection({
      clipIds: laneClips.map(c => c.id),
      direction: 'forward'
    }));
  }, [dispatch, selectedClipIds, clips]);

  const handleCycleBackward = useCallback(() => {
    // Get clips in current lane (if selection exists)
    let laneClips = clips;
    if (selectedClipIds.length > 0) {
      const firstSelectedId = first(selectedClipIds);
      if (firstSelectedId) {
        const selectedClip = clips.find(c => c.id === firstSelectedId);
        if (selectedClip) {
          laneClips = clips.filter(c => c.laneId === selectedClip.laneId);
          // Sort by position
          laneClips.sort((a, b) => a.position - b.position);
        }
      }
    }

    dispatch(cycleSelection({
      clipIds: laneClips.map(c => c.id),
      direction: 'backward'
    }));
  }, [dispatch, selectedClipIds, clips]);

  const handleNavigateUp = useCallback(() => {
    if (selectedClipIds.length > 0) {
      // Navigate to clip above
      const firstSelectedId = first(selectedClipIds);
      if (firstSelectedId) {
        const currentClip = clips.find(c => c.id === firstSelectedId);
        if (currentClip) {
          const nearestClip = findNearestClipNorth(currentClip, clips, lanes);
          if (nearestClip) {
            dispatch(selectClip(nearestClip.id));
          }
        }
      }
    } else {
      // Navigate to previous lane
      dispatch(navigateUpAction(lanes.map(l => l.id)));
    }
  }, [dispatch, selectedClipIds, clips, lanes]);

  const handleNavigateDown = useCallback(() => {
    if (selectedClipIds.length > 0) {
      // Navigate to clip below
      const firstSelectedId = first(selectedClipIds);
      if (firstSelectedId) {
        const currentClip = clips.find(c => c.id === firstSelectedId);
        if (currentClip) {
          const nearestClip = findNearestClipSouth(currentClip, clips, lanes);
          if (nearestClip) {
            dispatch(selectClip(nearestClip.id));
          }
        }
      }
    } else {
      // Navigate to next lane
      dispatch(navigateDownAction(lanes.map(l => l.id)));
    }
  }, [dispatch, selectedClipIds, clips, lanes]);

  const handleNavigateLeft = useCallback(() => {
    if (selectedClipIds.length > 0) {
      // Navigate to clip on left (same lane)
      const firstSelectedId = first(selectedClipIds);
      if (firstSelectedId) {
        const currentClip = clips.find(c => c.id === firstSelectedId);
        if (currentClip) {
          const nearestClip = findNearestClipWest(currentClip, clips);
          if (nearestClip) {
            dispatch(selectClip(nearestClip.id));
          }
        }
      }
    }
  }, [dispatch, selectedClipIds, clips]);

  const handleNavigateRight = useCallback(() => {
    if (selectedClipIds.length > 0) {
      // Navigate to clip on right (same lane)
      const firstSelectedId = first(selectedClipIds);
      if (firstSelectedId) {
        const currentClip = clips.find(c => c.id === firstSelectedId);
        if (currentClip) {
          const nearestClip = findNearestClipEast(currentClip, clips);
          if (nearestClip) {
            dispatch(selectClip(nearestClip.id));
          }
        }
      }
    }
  }, [dispatch, selectedClipIds, clips]);

  const handleAdjustTempoUp = useCallback(() => {
    dispatch(adjustTempo(1));
  }, [dispatch]);

  const handleAdjustTempoDown = useCallback(() => {
    dispatch(adjustTempo(-1));
  }, [dispatch]);

  return {
    stop: handleStop,
    jumpToStart: handleJumpToStart,
    jumpToEnd: handleJumpToEnd,
    movePlayheadLeft: handleMovePlayheadLeft,
    movePlayheadRight: handleMovePlayheadRight,
    movePlayheadPrevClip: handleMovePlayheadPrevClip,
    movePlayheadNextClip: handleMovePlayheadNextClip,
    cycleForward: handleCycleForward,
    cycleBackward: handleCycleBackward,
    navigateUp: handleNavigateUp,
    navigateDown: handleNavigateDown,
    navigateLeft: handleNavigateLeft,
    navigateRight: handleNavigateRight,
    adjustTempoUp: handleAdjustTempoUp,
    adjustTempoDown: handleAdjustTempoDown,
  };
};
