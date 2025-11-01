/**
 * Scene Actions
 * Actions for updating scene parameters (advance mode, initial mutes, etc.)
 */

import type { PayloadAction, CaseReducer } from '@reduxjs/toolkit';
import type { CirklonSongData } from '@/utils/cirklon/types';
import type { ID } from '@/types';
import * as adapters from '../adapters';

/**
 * Update scene advance mode (auto/manual)
 */
export const updateSceneAdvanceMode: CaseReducer<
  CirklonSongData,
  PayloadAction<{
    sceneReactId: ID;
    advanceMode: 'auto' | 'manual';
  }>
> = (state, action) => {
  const { sceneReactId, advanceMode } = action.payload;

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const metadata = state._cyclone_metadata;
  if (!metadata) return;

  // Find scene name from React ID
  const sceneEntry = Object.entries(metadata.uiMappings.scenes).find(
    ([, mapping]) => mapping.reactKey === sceneReactId
  );

  if (!sceneEntry) return;

  const [sceneName] = sceneEntry;
  const scene = currentSong.scenes[sceneName];

  if (!scene) return;

  // Update advance mode
  scene.advance = advanceMode;
};

/**
 * Update scene initial mutes
 */
export const updateSceneInitialMutes: CaseReducer<
  CirklonSongData,
  PayloadAction<{
    sceneReactId: ID;
    trackReactIds: ID[]; // Array of track React IDs to mute
  }>
> = (state, action) => {
  const { sceneReactId, trackReactIds } = action.payload;

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const metadata = state._cyclone_metadata;
  if (!metadata) return;

  // Find scene name from React ID
  const sceneEntry = Object.entries(metadata.uiMappings.scenes).find(
    ([, mapping]) => mapping.reactKey === sceneReactId
  );

  if (!sceneEntry) return;

  const [sceneName] = sceneEntry;
  const scene = currentSong.scenes[sceneName];

  if (!scene) return;

  // Convert track React IDs to track keys
  const trackKeys: string[] = [];
  for (const trackReactId of trackReactIds) {
    const trackKey = adapters.getTrackKeyFromReactId(state, trackReactId);
    if (trackKey) {
      trackKeys.push(trackKey);
    }
  }

  // Update initial mutes
  scene.initial_mutes = trackKeys;
};

/**
 * Update scene length (in bars)
 */
export const updateSceneLength: CaseReducer<
  CirklonSongData,
  PayloadAction<{
    sceneReactId: ID;
    length: number; // Length in bars
  }>
> = (state, action) => {
  const { sceneReactId, length } = action.payload;

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const metadata = state._cyclone_metadata;
  if (!metadata) return;

  // Find scene name from React ID
  const sceneEntry = Object.entries(metadata.uiMappings.scenes).find(
    ([, mapping]) => mapping.reactKey === sceneReactId
  );

  if (!sceneEntry) return;

  const [sceneName] = sceneEntry;
  const scene = currentSong.scenes[sceneName];

  if (!scene) return;

  // Validate length (must be positive)
  if (length <= 0) return;

  // Update scene length
  scene.length = length;
};

/**
 * Update scene gbar (global bar length in 16th note steps)
 * Typically 16 for 4/4 time (16 sixteenth notes = 4 quarter notes)
 */
export const updateSceneGbar: CaseReducer<
  CirklonSongData,
  PayloadAction<{
    sceneReactId: ID;
    gbar: number; // Global bar length in 16th note steps
  }>
> = (state, action) => {
  const { sceneReactId, gbar } = action.payload;

  const currentSong = adapters.getCurrentSong(state);
  if (!currentSong) return;

  const metadata = state._cyclone_metadata;
  if (!metadata) return;

  // Find scene name from React ID
  const sceneEntry = Object.entries(metadata.uiMappings.scenes).find(
    ([, mapping]) => mapping.reactKey === sceneReactId
  );

  if (!sceneEntry) return;

  const [sceneName] = sceneEntry;
  const scene = currentSong.scenes[sceneName];

  if (!scene) return;

  // Validate gbar (must be positive)
  if (gbar <= 0) return;

  // Update scene gbar
  scene.gbar = gbar;
};
