/**
 * Track Timeline Actions
 * All track-related timeline operations
 */

/**
 * Cyclone - Timeline Adapter Actions
 * Reducers that translate timeline UI operations to CKS mutations
 *
 * These actions work with React view model IDs and handle scene management automatically
 */

import type { PayloadAction, CaseReducer } from '@reduxjs/toolkit';
import { logger } from '@/utils/debug';
import type { CirklonSongData } from '@/utils/cirklon/types';
import { TimelinePayloads } from '../types';
import * as adapters from '../adapters';
import * as mutations from '../mutations';
import { DEFAULT_SCENE_LENGTH } from '../constants';
import { generateId } from '@/utils/id';

/**
 * Add a new track to the timeline
 */
export const addTrackInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.AddTrack>
> = (state, action) => {
  logger.debug('[addTrackInTimeline] ======== START ========');
  logger.debug('[addTrackInTimeline] Action payload:', action.payload);

  // Ensure metadata exists
  if (!state._cyclone_metadata) {
    logger.debug('[addTrackInTimeline] Creating new metadata');
    state._cyclone_metadata = {
      version: '2.0.0',
      currentSongName: Object.keys(state.song_data)[0] || '',
      uiMappings: {
        patterns: {},
        tracks: {},
        scenes: {},
      },
      trackOrder: [],
      sceneOrder: [],
    };
  }

  const metadata = state._cyclone_metadata;
  logger.debug('[addTrackInTimeline] Metadata before:', {
    trackOrderLength: metadata.trackOrder?.length,
    trackOrder: [...(metadata.trackOrder || [])],
  });

  // Ensure trackOrder array exists
  if (!metadata.trackOrder) {
    metadata.trackOrder = [];
  }

  // Generate track key
  const trackCount = metadata.trackOrder.length;
  const trackKey = `track_${trackCount + 1}`;
  logger.debug('[addTrackInTimeline] Generated trackKey:', trackKey);

  // CRITICAL: Mutate the array directly (Immer pattern)
  metadata.trackOrder.push(trackKey);
  logger.debug('[addTrackInTimeline] After push, trackOrder:', [...metadata.trackOrder]);

  // Add UI mapping
  metadata.uiMappings.tracks[trackKey] = {
    reactKey: generateId('track'),
    color: '#4a9eff',
    trackNumber: trackCount + 1,
  };

  logger.debug('[addTrackInTimeline] Final trackOrder:', [...metadata.trackOrder]);
  logger.debug('[addTrackInTimeline] Final track keys:', Object.keys(metadata.uiMappings.tracks));
  logger.debug('[addTrackInTimeline] ======== END ========');
};

/**
 * Remove a track
 */
export const removeTrackInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.RemoveTrack>
> = (state, action) => {
  const { trackReactId } = action.payload;

  const trackKey = adapters.getTrackKeyFromReactId(state, trackReactId);
  if (!trackKey) {
    console.error(`Track ${trackReactId} not found`);
    return;
  }

  const metadata = adapters.ensureMetadata(state);
  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  // Remove all patterns in this track
  Object.entries(currentSong.scenes).forEach(([, scene]) => {
    if (scene.pattern_assignments && scene.pattern_assignments[trackKey]) {
      delete scene.pattern_assignments[trackKey];
    }
  });

  // Remove from track order
  metadata.trackOrder = (metadata.trackOrder || []).filter(key => key !== trackKey);

  // Remove UI mapping
  delete metadata.uiMappings.tracks[trackKey];
};

/**
 * Move track up in order
 */
export const moveTrackUpInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.MoveTrackUp>
> = (state, action) => {
  const { trackReactId } = action.payload;

  const trackKey = adapters.getTrackKeyFromReactId(state, trackReactId);
  if (!trackKey) {
    console.error(`Track ${trackReactId} not found`);
    return;
  }

  const metadata = adapters.ensureMetadata(state);
  const trackOrder = metadata.trackOrder || [];
  const index = trackOrder.indexOf(trackKey);

  if (index > 0) {
    // Swap with previous
    const prev = trackOrder[index - 1];
    const curr = trackOrder[index];
    if (prev !== undefined && curr !== undefined) {
      trackOrder[index - 1] = curr;
      trackOrder[index] = prev;
      metadata.trackOrder = trackOrder;
    }
  }
};

/**
 * Move track down in order
 */
export const moveTrackDownInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.MoveTrackDown>
> = (state, action) => {
  const { trackReactId } = action.payload;

  const trackKey = adapters.getTrackKeyFromReactId(state, trackReactId);
  if (!trackKey) {
    console.error(`Track ${trackReactId} not found`);
    return;
  }

  const metadata = adapters.ensureMetadata(state);
  const trackOrder = metadata.trackOrder || [];
  const index = trackOrder.indexOf(trackKey);

  if (index >= 0 && index < trackOrder.length - 1) {
    // Swap with next
    const curr = trackOrder[index];
    const next = trackOrder[index + 1];
    if (curr !== undefined && next !== undefined) {
      trackOrder[index] = next;
      trackOrder[index + 1] = curr;
      metadata.trackOrder = trackOrder;
    }
  }
};

/**
 * Reorder track to specific index
 */
export const reorderTrackInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.ReorderTrack>
> = (state, action) => {
  const { trackReactId, newIndex } = action.payload;

  const trackKey = adapters.getTrackKeyFromReactId(state, trackReactId);
  if (!trackKey) {
    console.error(`Track ${trackReactId} not found`);
    return;
  }

  const metadata = adapters.ensureMetadata(state);
  const trackOrder = metadata.trackOrder || [];
  const currentIndex = trackOrder.indexOf(trackKey);

  if (currentIndex === -1 || currentIndex === newIndex) {
    return;
  }

  // Bounds check
  const clampedNewIndex = Math.max(0, Math.min(newIndex, trackOrder.length - 1));

  // Remove from current position
  trackOrder.splice(currentIndex, 1);

  // Insert at new position
  trackOrder.splice(clampedNewIndex, 0, trackKey);
  metadata.trackOrder = trackOrder;
};

/**
 * Rename track
 */
export const renameTrackInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.RenameTrack>
> = (state, action) => {
  const { trackReactId, name } = action.payload;

  const trackKey = adapters.getTrackKeyFromReactId(state, trackReactId);
  if (!trackKey) {
    console.error(`Track ${trackReactId} not found`);
    return;
  }

  const metadata = adapters.ensureMetadata(state);
  const mapping = metadata.uiMappings.tracks[trackKey];

  if (mapping) {
    // Store name in metadata (CKS doesn't have track names, they're derived from track keys)
    (mapping as any).name = name;
  }
};

/**
 * Set track color
 */
export const setTrackColorInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.SetTrackColor>
> = (state, action) => {
  const { trackReactId, color } = action.payload;

  const trackKey = adapters.getTrackKeyFromReactId(state, trackReactId);
  if (!trackKey) {
    console.error(`Track ${trackReactId} not found`);
    return;
  }

  const metadata = adapters.ensureMetadata(state);
  const mapping = metadata.uiMappings.tracks[trackKey];

  if (mapping) {
    mapping.color = color;
  }
};

/**
 * Update step value in pattern
 */
