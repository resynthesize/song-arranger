/**
 * Song Arranger - Clip Selectors
 * Reusable memoized selectors for clip state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { Clip, ID } from '@/types';

/**
 * Base selector - get all clips from state
 */
export const selectAllClips = (state: RootState): Clip[] => state.clips.clips;

/**
 * Base selector - get editing clip ID
 */
export const selectEditingClipId = (state: RootState): ID | null => state.clips.editingClipId;

/**
 * Memoized selector - get clips for a specific lane
 * Returns a new function that takes laneId as parameter
 */
export const selectClipsByLane = createSelector(
  [selectAllClips, (_state: RootState, laneId: ID) => laneId],
  (clips, laneId) => clips.filter((clip) => clip.laneId === laneId)
);

/**
 * Memoized selector - get all currently selected clips
 * Combines clips and selection state
 */
export const selectSelectedClips = createSelector(
  [selectAllClips, (state: RootState) => state.selection.selectedClipIds],
  (clips, selectedIds) => {
    const selectedIdsSet = new Set(selectedIds);
    return clips.filter((clip) => selectedIdsSet.has(clip.id));
  }
);

/**
 * Utility function - calculate end position of a clip
 */
export const selectClipEndPosition = (clip: Clip): number => {
  return clip.position + clip.duration;
};

/**
 * Memoized selector - get the end position of the timeline
 * (furthest point where any clip ends)
 */
export const selectTimelineEndPosition = createSelector(
  [selectAllClips],
  (clips) => {
    if (clips.length === 0) return 0;

    return Math.max(
      ...clips.map((clip) => selectClipEndPosition(clip))
    );
  }
);

/**
 * Memoized selector - get clip by ID
 */
export const selectClipById = createSelector(
  [selectAllClips, (_state: RootState, clipId: ID) => clipId],
  (clips, clipId) => clips.find((clip) => clip.id === clipId)
);

/**
 * Memoized selector - check if a clip is selected
 */
export const selectIsClipSelected = createSelector(
  [(state: RootState) => state.selection.selectedClipIds, (_state: RootState, clipId: ID) => clipId],
  (selectedIds, clipId) => selectedIds.includes(clipId)
);

/**
 * Memoized selector - get total number of clips
 */
export const selectClipCount = createSelector(
  [selectAllClips],
  (clips) => clips.length
);
