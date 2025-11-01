/**
 * Pattern Timeline Actions
 * All pattern-related timeline operations
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
import { createDefaultP3Bar } from '@/utils/patternDefaults';

/**
 * Move a single pattern to a new position in the timeline
 * Creates new scenes as needed, handles scene consolidation
 */
export const movePatternInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.MovePattern>
> = (state, action) => {
  const { patternReactId, newPosition } = action.payload;

  // 1. Find current location
  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const { sceneName: currentScene, trackKey, patternName } = location;

  // 2. Snap target position to scene boundary
  const snappedPosition = adapters.snapToSceneBoundary(newPosition);

  // 3. Find or create target scene
  let targetScene = adapters.findSceneAtPosition(state, snappedPosition);
  if (!targetScene) {
    targetScene = adapters.generateSceneName(state);
    mutations.createScene(state, targetScene, snappedPosition, DEFAULT_SCENE_LENGTH);
  }

  // Don't move if already in target scene
  if (currentScene === targetScene) {
    return;
  }

  // 4. Perform CKS mutations
  mutations.removePatternFromScene(state, currentScene, trackKey);
  mutations.assignPatternToScene(state, targetScene, trackKey, patternName);

  // Note: We DON'T delete empty scenes - they serve as placeholders
};

/**
 * Move multiple patterns by a relative delta
 * Preserves relative spacing between patterns
 */
export const movePatternsInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.MovePatterns>
> = (state, action) => {
  const { patternReactIds, deltaBeats } = action.payload;

  // Move each pattern independently by the same delta
  for (const patternReactId of patternReactIds) {
    const currentPosition = adapters.getPatternPosition(state, patternReactId);
    if (currentPosition === null) continue;

    const newPosition = Math.max(0, currentPosition + deltaBeats);

    // Use the single pattern move logic
    movePatternInTimeline(state, {
      type: 'song/movePatternInTimeline',
      payload: { patternReactId, newPosition },
    });
  }
};

/**
 * Create a new pattern in the timeline
 */
export const createPatternInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.CreatePattern>
> = (state, action) => {
  const { trackReactId, position, duration, label } = action.payload;

  // 1. Get track key from React ID
  const trackKey = adapters.getTrackKeyFromReactId(state, trackReactId);
  if (!trackKey) {
    console.error(`Track ${trackReactId} not found`);
    return;
  }

  // 2. Snap position to scene boundary
  const snappedPosition = adapters.snapToSceneBoundary(position);

  // 3. Find or create scene at position
  let sceneName = adapters.findSceneAtPosition(state, snappedPosition);
  if (!sceneName) {
    sceneName = adapters.generateSceneName(state);
    mutations.createScene(state, sceneName, snappedPosition, DEFAULT_SCENE_LENGTH);
  }

  // 4. Generate pattern name
  const patternName = label || adapters.generatePatternName(state, trackKey);

  // 5. Create pattern in CKS
  mutations.createPattern(state, patternName, duration);

  // 6. Assign to scene
  mutations.assignPatternToScene(state, sceneName, trackKey, patternName);
};

/**
 * Delete a single pattern from the timeline
 */
export const deletePatternInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.DeletePattern>
> = (state, action) => {
  const { patternReactId } = action.payload;

  // Find pattern location
  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const { sceneName, trackKey, patternName } = location;

  // Remove from scene
  mutations.removePatternFromScene(state, sceneName, trackKey);

  // Delete pattern from CKS
  mutations.deletePattern(state, patternName);

  // Note: We DON'T delete empty scenes - they serve as placeholders
};

/**
 * Delete multiple patterns from the timeline
 */
export const deletePatternsInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.DeletePatterns>
> = (state, action) => {
  const { patternReactIds } = action.payload;

  for (const patternReactId of patternReactIds) {
    deletePatternInTimeline(state, {
      type: 'song/deletePatternInTimeline',
      payload: { patternReactId },
    });
  }
};

/**
 * Unlink a pattern from its scene (removes assignment but keeps pattern definition)
 * This is the less destructive operation typically triggered by Delete key
 */
export const unlinkPatternFromSceneInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.DeletePattern>
> = (state, action) => {
  const { patternReactId } = action.payload;

  // Find pattern location
  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const { sceneName, trackKey } = location;

  // Only remove from scene - keep pattern definition in CKS
  mutations.removePatternFromScene(state, sceneName, trackKey);
};

/**
 * Unlink multiple patterns from their scenes
 */
export const unlinkPatternsFromScenesInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.DeletePatterns>
> = (state, action) => {
  const { patternReactIds } = action.payload;

  for (const patternReactId of patternReactIds) {
    unlinkPatternFromSceneInTimeline(state, {
      type: 'song/unlinkPatternFromSceneInTimeline',
      payload: { patternReactId },
    });
  }
};

/**
 * Resize a pattern's duration
 */
export const resizePatternInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.ResizePattern>
> = (state, action) => {
  const { patternReactId, newDuration } = action.payload;

  console.log('[resizePatternInTimeline] Action called', { patternReactId, newDuration });

  // Find pattern
  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`[resizePatternInTimeline] Pattern ${patternReactId} not found`);
    return;
  }

  const { patternName } = location;
  console.log('[resizePatternInTimeline] Found pattern', { patternName, location });

  // Update pattern duration
  mutations.updatePatternDuration(state, patternName, newDuration);

  console.log('[resizePatternInTimeline] Mutation called, action complete');
};

/**
 * Resize multiple patterns by a factor
 */
export const resizePatternsInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.ResizePatterns>
> = (state, action) => {
  const { patternReactIds, factor } = action.payload;

  for (const patternReactId of patternReactIds) {
    const location = adapters.findPatternLocation(state, patternReactId);
    if (!location) continue;

    const currentSong = adapters.getCurrentSong(state);
    if (!currentSong) continue;

    const pattern = currentSong.patterns[location.patternName];
    if (!pattern) continue;

    const currentDuration = (pattern.bar_count || 1) * 4; // Convert bars to beats
    const newDuration = Math.max(1, Math.round(currentDuration * factor));

    mutations.updatePatternDuration(state, location.patternName, newDuration);
  }
};

/**
 * Move pattern to a different track (vertical drag)
 */
export const movePatternToTrack: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.MovePatternToTrack>
> = (state, action) => {
  const { patternReactId, targetTrackReactId } = action.payload;

  // Find current location
  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  // Get target track key
  const targetTrackKey = adapters.getTrackKeyFromReactId(state, targetTrackReactId);
  if (!targetTrackKey) {
    console.error(`Target track ${targetTrackReactId} not found`);
    return;
  }

  const { sceneName, trackKey: currentTrackKey, patternName } = location;

  // Don't move if already on target track
  if (currentTrackKey === targetTrackKey) {
    return;
  }

  // Remove from current track
  mutations.removePatternFromScene(state, sceneName, currentTrackKey);

  // Add to target track (same scene)
  mutations.assignPatternToScene(state, sceneName, targetTrackKey, patternName);
};

/**
 * Move multiple patterns to different tracks (vertical drag with delta)
 */
export const movePatternsToTrack: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.MovePatternsToTrack>
> = (state, action) => {
  const { patternReactIds, deltaTrackIndex } = action.payload;

  for (const patternReactId of patternReactIds) {
    const location = adapters.findPatternLocation(state, patternReactId);
    if (!location) continue;

    const currentTrackIndex = adapters.getTrackIndex(state, location.trackKey);
    if (currentTrackIndex === -1) continue;

    const targetTrackIndex = currentTrackIndex + deltaTrackIndex;
    const targetTrackKey = adapters.getTrackKeyByIndex(state, targetTrackIndex);
    if (!targetTrackKey) continue;

    const targetTrackReactId = adapters.getReactIdFromTrackKey(state, targetTrackKey);
    if (!targetTrackReactId) continue;

    // Use single pattern move logic
    movePatternToTrack(state, {
      type: 'song/movePatternToTrack',
      payload: { patternReactId, targetTrackReactId },
    });
  }
};

/**
 * Update pattern label/name
 */
export const updatePatternLabel: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.UpdatePatternLabel>
> = (state, action) => {
  const { patternReactId, label } = action.payload;

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  // Rename pattern in CKS
  mutations.renamePattern(state, location.patternName, label);
};

/**
 * Duplicate a pattern
 */
export const duplicatePatternInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.DuplicatePattern>
> = (state, action) => {
  const { patternReactId } = action.payload;

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const originalPattern = currentSong.patterns[location.patternName];
  if (!originalPattern) return;

  // Generate new pattern name
  const newPatternName = adapters.generatePatternName(state, location.trackKey);

  // Create duplicate pattern
  const duration = (originalPattern.bar_count || 1) * 4;
  mutations.createPattern(state, newPatternName, duration);

  // Copy pattern data
  currentSong.patterns[newPatternName] = { ...originalPattern };

  // Note: Pattern is created but not assigned to any scene
  // The UI should handle assigning it to a scene at the desired position
};

/**
 * Duplicate multiple patterns
 */
export const duplicatePatternsInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.DuplicatePatterns>
> = (state, action) => {
  const { patternReactIds } = action.payload;

  for (const patternReactId of patternReactIds) {
    duplicatePatternInTimeline(state, {
      type: 'song/duplicatePatternInTimeline',
      payload: { patternReactId },
    });
  }
};

/**
 * Duplicate pattern with offset (place copy after original)
 */
export const duplicatePatternWithOffsetInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.DuplicatePatternWithOffset>
> = (state, action) => {
  const { patternReactId } = action.payload;

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const originalPattern = currentSong.patterns[location.patternName];
  if (!originalPattern) return;

  // Calculate offset position (current position + duration)
  const currentPosition = adapters.getPatternPosition(state, patternReactId);
  if (currentPosition === null) return;

  const duration = (originalPattern.bar_count || 1) * 4;
  const newPosition = currentPosition + duration;

  // Generate new pattern name
  const newPatternName = adapters.generatePatternName(state, location.trackKey);

  // Create duplicate pattern
  mutations.createPattern(state, newPatternName, duration);
  currentSong.patterns[newPatternName] = { ...originalPattern };

  // Find or create scene at new position
  const snappedPosition = adapters.snapToSceneBoundary(newPosition);
  let targetScene = adapters.findSceneAtPosition(state, snappedPosition);
  if (!targetScene) {
    targetScene = adapters.generateSceneName(state);
    mutations.createScene(state, targetScene, snappedPosition, DEFAULT_SCENE_LENGTH);
  }

  // Assign to scene
  mutations.assignPatternToScene(state, targetScene, location.trackKey, newPatternName);
};

/**
 * Duplicate multiple patterns with offset
 */
export const duplicatePatternsWithOffsetInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.DuplicatePatternsWithOffset>
> = (state, action) => {
  const { patternReactIds } = action.payload;

  for (const patternReactId of patternReactIds) {
    duplicatePatternWithOffsetInTimeline(state, {
      type: 'song/duplicatePatternWithOffsetInTimeline',
      payload: { patternReactId },
    });
  }
};

/**
 * Split pattern at position
 */
export const splitPatternInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.SplitPattern>
> = (state, action) => {
  const { patternReactId, position } = action.payload;

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const originalPattern = currentSong.patterns[location.patternName];
  if (!originalPattern) return;

  const patternPosition = adapters.getPatternPosition(state, patternReactId);
  if (patternPosition === null) return;

  const duration = (originalPattern.bar_count || 1) * 4;
  const endPosition = patternPosition + duration;

  // Check if split position is within pattern bounds
  if (position <= patternPosition || position >= endPosition) {
    console.error('Split position must be within pattern bounds');
    return;
  }

  // Calculate durations for both halves
  const firstHalfDuration = position - patternPosition;
  const secondHalfDuration = endPosition - position;

  // Update first half duration
  mutations.updatePatternDuration(state, location.patternName, firstHalfDuration);

  // Create second half
  const newPatternName = adapters.generatePatternName(state, location.trackKey);
  mutations.createPattern(state, newPatternName, secondHalfDuration);

  // Copy pattern data (simplified - full implementation would copy bar data)
  currentSong.patterns[newPatternName] = {
    ...originalPattern,
    bar_count: Math.ceil(secondHalfDuration / 4)
  };

  // Find or create scene at new position
  const snappedPosition = adapters.snapToSceneBoundary(position);
  let targetScene = adapters.findSceneAtPosition(state, snappedPosition);
  if (!targetScene) {
    targetScene = adapters.generateSceneName(state);
    mutations.createScene(state, targetScene, snappedPosition, DEFAULT_SCENE_LENGTH);
  }

  // Assign to scene
  mutations.assignPatternToScene(state, targetScene, location.trackKey, newPatternName);
};

/**
 * Trim pattern from start
 */
export const trimPatternStartInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.TrimPatternStart>
> = (state, action) => {
  const { patternReactId, amount } = action.payload;

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const pattern = currentSong.patterns[location.patternName];
  if (!pattern) return;

  const currentDuration = (pattern.bar_count || 1) * 4;
  const newDuration = Math.max(1, currentDuration - amount);

  // Update duration
  mutations.updatePatternDuration(state, location.patternName, newDuration);

  // Move pattern to new position (trimming from start means moving forward)
  const currentPosition = adapters.getPatternPosition(state, patternReactId);
  if (currentPosition !== null) {
    const newPosition = currentPosition + amount;
    movePatternInTimeline(state, {
      type: 'song/movePatternInTimeline',
      payload: { patternReactId, newPosition },
    });
  }
};

/**
 * Trim pattern from end
 */
export const trimPatternEndInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.TrimPatternEnd>
> = (state, action) => {
  const { patternReactId, amount } = action.payload;

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const pattern = currentSong.patterns[location.patternName];
  if (!pattern) return;

  const currentDuration = (pattern.bar_count || 1) * 4;
  const newDuration = Math.max(1, currentDuration - amount);

  // Update duration
  mutations.updatePatternDuration(state, location.patternName, newDuration);
};

/**
 * Set pattern duration to exact value for multiple patterns
 */
export const setPatternsDurationInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.SetPatternsDuration>
> = (state, action) => {
  const { patternReactIds, duration } = action.payload;

  for (const patternReactId of patternReactIds) {
    const location = adapters.findPatternLocation(state, patternReactId);
    if (!location) continue;

    mutations.updatePatternDuration(state, location.patternName, duration);
  }
};

/**
 * Set pattern muted state
 */
export const setPatternMutedInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.SetPatternMuted>
> = (state, action) => {
  const { patternReactId, muted } = action.payload;

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const pattern = currentSong.patterns[location.patternName];
  if (!pattern) return;

  // Add muted property to pattern (extending CKS format)
  (pattern as any).muted = muted;
};

/**
 * Set pattern type (P3 or CK)
 */
export const setPatternTypeInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.SetPatternType>
> = (state, action) => {
  const { patternReactId, patternType } = action.payload;

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const pattern = currentSong.patterns[location.patternName];
  if (!pattern) return;

  pattern.type = patternType;
};

/**
 * Update pattern bar count
 * Adds or removes bars at the end, preserving existing data
 * Stores removed bars in metadata for later restoration
 */
export const updatePatternBarCountInTimeline: CaseReducer<
  CirklonSongData,
  PayloadAction<TimelinePayloads.UpdatePatternBarCount>
> = (state, action) => {
  const { patternReactId, newBarCount } = action.payload;

  // Validate bar count
  if (newBarCount < 1 || newBarCount > 16) {
    console.error(`Invalid bar count: ${newBarCount} (must be 1-16)`);
    return;
  }

  const location = adapters.findPatternLocation(state, patternReactId);
  if (!location) {
    console.error(`Pattern ${patternReactId} not found`);
    return;
  }

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const pattern = currentSong.patterns[location.patternName];
  if (!pattern || pattern.type !== 'P3' || !pattern.bars || !Array.isArray(pattern.bars)) {
    console.error(`Pattern ${location.patternName} is not a P3 pattern or has invalid bars`);
    return;
  }

  const currentBarCount = pattern.bars.length;

  // No change needed
  if (currentBarCount === newBarCount) {
    return;
  }

  // Get or create metadata storage for removed bars
  const metadata = adapters.ensureMetadata(state);
  if (!metadata.uiMappings.patterns[location.patternName]) {
    metadata.uiMappings.patterns[location.patternName] = { reactKey: patternReactId };
  }
  const patternMeta = metadata.uiMappings.patterns[location.patternName] as any;

  if (newBarCount > currentBarCount) {
    // Adding bars - restore from storage if available, otherwise create new
    const barsToAdd = newBarCount - currentBarCount;
    const restoredBars = patternMeta.removedBars || [];

    for (let i = 0; i < barsToAdd; i++) {
      if (restoredBars.length > 0) {
        // Restore from storage
        pattern.bars.push(restoredBars.shift());
      } else {
        // Create new default bar
        pattern.bars.push(createDefaultP3Bar());
      }
    }

    // Update storage
    patternMeta.removedBars = restoredBars;
  } else {
    // Removing bars - store them for later restoration
    const barsToRemove = currentBarCount - newBarCount;
    const removedBars = pattern.bars.splice(newBarCount, barsToRemove);

    // Store removed bars (prepend to preserve order)
    patternMeta.removedBars = [...removedBars, ...(patternMeta.removedBars || [])];
  }

  // Update bar_count
  pattern.bar_count = newBarCount;

  logger.log(`Updated pattern ${location.patternName} bar count: ${currentBarCount} → ${newBarCount}`);
};

/**
 * Add a new track
 */
