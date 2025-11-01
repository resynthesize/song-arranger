/**
 * Cyclone - Song Slice Adapters
 * Pure functions that translate between view models and CKS structure
 */

import type { CirklonSongData, CirklonSong, CycloneMetadata } from '@/utils/cirklon/types';
import type { ID, Position } from '@/types';
import type { PatternLocation, SceneBoundaries } from './types';
import { SCENE_SNAP_GRANULARITY } from './constants';

/**
 * Get the current song being edited
 */
export function getCurrentSong(state: CirklonSongData): CirklonSong | null {
  const currentSongName = state._cyclone_metadata?.currentSongName || '';
  return state.song_data[currentSongName] || null;
}

/**
 * Ensure metadata exists on the state
 */
export function ensureMetadata(state: CirklonSongData): CycloneMetadata {
  if (!state._cyclone_metadata) {
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
  return state._cyclone_metadata;
}

/**
 * Find pattern location in CKS structure using React ID
 * Pattern React IDs are composite: ${sceneReactKey}-${trackReactKey}-${patternName}
 * @returns Pattern location or null if not found
 */
export function findPatternLocation(
  state: CirklonSongData,
  patternReactId: ID
): PatternLocation | null {
  const currentSong = getCurrentSong(state);
  const metadata = state._cyclone_metadata;

  if (!currentSong || !metadata) {
    return null;
  }

  // Search through all scenes to find which one has this pattern
  for (const [sceneName, scene] of Object.entries(currentSong.scenes)) {
    if (!scene.pattern_assignments) continue;

    // Get scene's react key
    const sceneReactKey = metadata.uiMappings.scenes[sceneName]?.reactKey;
    if (!sceneReactKey) continue;

    for (const [trackKey, patternName] of Object.entries(scene.pattern_assignments)) {
      // Get track's react key
      const trackReactKey = metadata.uiMappings.tracks[trackKey]?.reactKey;
      if (!trackReactKey) continue;

      // Build composite ID the same way selectAllPatterns does
      const compositeId = `${sceneReactKey}-${trackReactKey}-${patternName.replace(/\s+/g, '-')}`;

      if (compositeId === patternReactId) {
        return { sceneName, trackKey, patternName };
      }
    }
  }

  return null;
}

/**
 * Find multiple pattern locations
 */
export function findPatternLocations(
  state: CirklonSongData,
  patternReactIds: ID[]
): PatternLocation[] {
  const locations: PatternLocation[] = [];

  for (const patternReactId of patternReactIds) {
    const location = findPatternLocation(state, patternReactId);
    if (location) {
      locations.push(location);
    }
  }

  return locations;
}

/**
 * Get track key from React ID
 */
export function getTrackKeyFromReactId(
  state: CirklonSongData,
  trackReactId: ID
): string | null {
  const metadata = state._cyclone_metadata;
  if (!metadata) return null;

  const entry = Object.entries(metadata.uiMappings.tracks).find(
    ([, mapping]) => mapping.reactKey === trackReactId
  );

  return entry ? entry[0] : null;
}

/**
 * Get React ID from track key
 */
export function getReactIdFromTrackKey(
  state: CirklonSongData,
  trackKey: string
): ID | null {
  const metadata = state._cyclone_metadata;
  if (!metadata) return null;

  const mapping = metadata.uiMappings.tracks[trackKey];
  return mapping?.reactKey || null;
}

/**
 * Snap position to scene boundary
 */
export function snapToSceneBoundary(position: Position): Position {
  return Math.floor(position / SCENE_SNAP_GRANULARITY) * SCENE_SNAP_GRANULARITY;
}

/**
 * Get all scene boundaries ordered by position
 */
export function getOrderedSceneBoundaries(
  state: CirklonSongData
): SceneBoundaries[] {
  const currentSong = getCurrentSong(state);
  const metadata = state._cyclone_metadata;

  if (!currentSong || !metadata) {
    return [];
  }

  const sceneOrder = metadata.sceneOrder || [];
  const boundaries: SceneBoundaries[] = [];
  let currentPosition = 0;

  // Use scene order from metadata
  for (const sceneName of sceneOrder) {
    const scene = currentSong.scenes[sceneName];
    if (!scene) continue;

    const sceneLength = scene.length || 4; // Default to 4 bars if not set
    const length = sceneLength * 4; // Convert bars to beats (assuming 4/4 time)
    boundaries.push({
      sceneName,
      startPosition: currentPosition,
      endPosition: currentPosition + length,
      length,
    });

    currentPosition += length;
  }

  // Add any scenes not in the order
  for (const sceneName of Object.keys(currentSong.scenes)) {
    if (!sceneOrder.includes(sceneName)) {
      const scene = currentSong.scenes[sceneName];
      if (!scene) continue;

      const sceneLength = scene.length || 4; // Default to 4 bars if not set
      const length = sceneLength * 4;
      boundaries.push({
        sceneName,
        startPosition: currentPosition,
        endPosition: currentPosition + length,
        length,
      });
      currentPosition += length;
    }
  }

  return boundaries;
}

/**
 * Find which scene contains a given position
 * @returns Scene name or null if position is beyond all scenes
 */
export function findSceneAtPosition(
  state: CirklonSongData,
  position: Position
): string | null {
  const boundaries = getOrderedSceneBoundaries(state);

  for (const boundary of boundaries) {
    if (position >= boundary.startPosition && position < boundary.endPosition) {
      return boundary.sceneName;
    }
  }

  return null;
}

/**
 * Generate a unique scene name
 */
export function generateSceneName(state: CirklonSongData): string {
  const currentSong = getCurrentSong(state);
  if (!currentSong) return 'scene_1';

  const existingScenes = Object.keys(currentSong.scenes);
  let counter = 1;
  let sceneName = `scene_${counter}`;

  while (existingScenes.includes(sceneName)) {
    counter++;
    sceneName = `scene_${counter}`;
  }

  return sceneName;
}

/**
 * Generate a unique pattern name for a track
 * Format: T{trackNum}_P3_{counter}
 */
export function generatePatternName(
  state: CirklonSongData,
  trackKey: string
): string {
  const currentSong = getCurrentSong(state);
  if (!currentSong) return 'T1_P3_001';

  // Extract track number from trackKey (e.g., "track_1" -> "1")
  const trackNumMatch = trackKey.match(/track_(\d+)/);
  const trackNum = trackNumMatch ? trackNumMatch[1] : '1';

  const existingPatterns = Object.keys(currentSong.patterns);
  const prefix = `T${trackNum}_P3_`;

  let counter = 1;
  let patternName = `${prefix}${counter.toString().padStart(3, '0')}`;

  while (existingPatterns.includes(patternName)) {
    counter++;
    patternName = `${prefix}${counter.toString().padStart(3, '0')}`;
  }

  return patternName;
}

/**
 * Get current position of a pattern in the timeline
 * This requires finding which scene the pattern is in and calculating position
 */
export function getPatternPosition(
  state: CirklonSongData,
  patternReactId: ID
): Position | null {
  const location = findPatternLocation(state, patternReactId);
  if (!location) return null;

  const boundaries = getOrderedSceneBoundaries(state);
  const sceneBoundary = boundaries.find(b => b.sceneName === location.sceneName);

  return sceneBoundary?.startPosition ?? null;
}

/**
 * Get all track keys ordered by trackOrder
 */
export function getOrderedTrackKeys(state: CirklonSongData): string[] {
  const metadata = state._cyclone_metadata;
  if (!metadata) return [];

  return metadata.trackOrder || [];
}

/**
 * Find track index by track key
 */
export function getTrackIndex(state: CirklonSongData, trackKey: string): number {
  const orderedKeys = getOrderedTrackKeys(state);
  return orderedKeys.indexOf(trackKey);
}

/**
 * Get track key by index
 */
export function getTrackKeyByIndex(state: CirklonSongData, index: number): string | null {
  const orderedKeys = getOrderedTrackKeys(state);
  return orderedKeys[index] || null;
}
