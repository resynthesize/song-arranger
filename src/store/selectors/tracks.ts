/**
 * Cyclone - Track Selectors
 * Reusable memoized selectors for track state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { Track, ID } from '@/types';

/**
 * Base selector - get all tracks from state
 */
export const selectAllTracks = (state: RootState): Track[] => state.tracks.tracks;

/**
 * Base selector - get editing track ID
 */
export const selectEditingTrackId = (state: RootState): ID | null => state.tracks.editingTrackId;

/**
 * Base selector - get moving track ID
 */
export const selectMovingTrackId = (state: RootState): ID | null => state.tracks.movingTrackId;

/**
 * Memoized selector - get track by ID
 */
export const selectTrackById = createSelector(
  [selectAllTracks, (_state: RootState, trackId: ID) => trackId],
  (tracks, trackId) => tracks.find((track) => track.id === trackId)
);

/**
 * Memoized selector - get tracks in display order
 * (Currently tracks are already in order, but this provides a consistent API)
 */
export const selectTrackOrder = createSelector(
  [selectAllTracks],
  (tracks) => tracks.map((track) => track.id)
);

/**
 * Memoized selector - get total number of tracks
 */
export const selectTrackCount = createSelector(
  [selectAllTracks],
  (tracks) => tracks.length
);

/**
 * Memoized selector - get track index by ID
 */
export const selectTrackIndexById = createSelector(
  [selectAllTracks, (_state: RootState, trackId: ID) => trackId],
  (tracks, trackId) => tracks.findIndex((track) => track.id === trackId)
);

/**
 * Memoized selector - check if a track is being edited
 */
export const selectIsTrackEditing = createSelector(
  [selectEditingTrackId, (_state: RootState, trackId: ID) => trackId],
  (editingId, trackId) => editingId === trackId
);

/**
 * Memoized selector - check if a track is moving
 */
export const selectIsTrackMoving = createSelector(
  [selectMovingTrackId, (_state: RootState, trackId: ID) => trackId],
  (movingId, trackId) => movingId === trackId
);
