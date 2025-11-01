/**
 * Cyclone - Song Slice Mutations
 * Low-level CKS state mutations (primitives)
 * These functions directly mutate Immer draft state
 */

import type { CirklonSongData, CirklonPattern } from '@/utils/cirklon/types';
import type { ID, Position, Duration } from '@/types';
import { getCurrentSong, ensureMetadata } from './adapters';
import { generateId } from '@/utils/id';
import { createDefaultP3Bars } from '@/utils/patternDefaults';

/**
 * Assign a pattern to a scene/track in CKS structure
 */
export function assignPatternToScene(
  state: CirklonSongData,
  sceneName: string,
  trackKey: string,
  patternName: string
): void {
  const currentSong = getCurrentSong(state);
  if (!currentSong) {
    console.error('No current song');
    return;
  }

  const scene = currentSong.scenes[sceneName];
  if (!scene) {
    console.error(`Scene ${sceneName} does not exist`);
    return;
  }

  if (!scene.pattern_assignments) {
    scene.pattern_assignments = {};
  }

  scene.pattern_assignments[trackKey] = patternName;
}

/**
 * Remove a pattern assignment from a scene/track
 */
export function removePatternFromScene(
  state: CirklonSongData,
  sceneName: string,
  trackKey: string
): void {
  const currentSong = getCurrentSong(state);
  if (!currentSong) return;

  const scene = currentSong.scenes[sceneName];
  if (!scene?.pattern_assignments) return;

  delete scene.pattern_assignments[trackKey];
}

/**
 * Create a new scene in CKS structure
 */
export function createScene(
  state: CirklonSongData,
  sceneName: string,
  position: Position,
  length: Duration
): void {
  const currentSong = getCurrentSong(state);
  const metadata = ensureMetadata(state);

  if (!currentSong) {
    console.error('No current song');
    return;
  }

  // Create scene in CKS
  // gbar is the global bar length in 16th note steps (16 = standard 4/4 time)
  const gbar = 16; // Default to 4/4 time (16 sixteenth notes = 4 quarter notes)

  // Convert duration in beats to length in bars
  // duration (beats) = length (bars) × (gbar / 4)
  // therefore: length (bars) = duration (beats) / (gbar / 4)
  const lengthInBars = Math.ceil(length / (gbar / 4));

  currentSong.scenes[sceneName] = {
    gbar,
    length: lengthInBars,
    advance: 'auto', // Default advance mode
    pattern_assignments: {},
  };

  // Add to scene order at the appropriate position
  const sceneOrder = metadata.sceneOrder || [];

  // Find insertion index based on timeline position
  // We need to calculate cumulative positions of existing scenes to determine insertion point
  let insertIndex = sceneOrder.length;
  let currentPosition = 0;

  for (let i = 0; i < sceneOrder.length; i++) {
    const sceneKey = sceneOrder[i];
    if (!sceneKey) continue;

    const existingScene = currentSong.scenes[sceneKey];
    if (!existingScene) continue;

    // If the new scene's position is before this existing scene's position, insert here
    if (position < currentPosition) {
      insertIndex = i;
      break;
    }

    // Update current position for next iteration
    const sceneDuration = existingScene.length * (existingScene.gbar / 4);
    currentPosition += sceneDuration;
  }

  sceneOrder.splice(insertIndex, 0, sceneName);
  metadata.sceneOrder = sceneOrder;

  // Add UI mapping
  metadata.uiMappings.scenes[sceneName] = {
    reactKey: generateId('scene'),
  };
}

/**
 * Delete a scene from CKS structure
 */
export function deleteScene(
  state: CirklonSongData,
  sceneName: string
): void {
  const currentSong = getCurrentSong(state);
  const metadata = ensureMetadata(state);

  if (!currentSong) return;

  // Remove from CKS
  delete currentSong.scenes[sceneName];

  // Remove from scene order
  metadata.sceneOrder = (metadata.sceneOrder || []).filter(name => name !== sceneName);

  // Remove UI mapping
  delete metadata.uiMappings.scenes[sceneName];
}

/**
 * Create a new pattern in CKS structure
 */
export function createPattern(
  state: CirklonSongData,
  patternName: string,
  duration: Duration,
  reactKey?: ID
): void {
  const currentSong = getCurrentSong(state);
  const metadata = ensureMetadata(state);

  if (!currentSong) {
    console.error('No current song');
    return;
  }

  // Convert duration (beats) to bar_count
  const barCount = Math.ceil(duration / 4);

  // Create pattern in CKS with properly initialized bars
  const pattern: CirklonPattern = {
    type: 'P3',
    creator_track: 1, // Default to track 1
    saved: false, // Not saved in Cirklon yet
    bar_count: barCount,
    // Initialize with proper P3Bar structure
    bars: createDefaultP3Bars(barCount),
    // Default aux assignments
    aux_A: 'none',
    aux_B: 'none',
    aux_C: 'none',
    aux_D: 'none',
  };

  currentSong.patterns[patternName] = pattern;

  // Add UI mapping
  metadata.uiMappings.patterns[patternName] = {
    reactKey: reactKey || generateId('pattern'),
  };
}

/**
 * Delete a pattern from CKS structure
 * Also removes all scene assignments
 */
export function deletePattern(
  state: CirklonSongData,
  patternName: string
): void {
  const currentSong = getCurrentSong(state);
  const metadata = ensureMetadata(state);

  if (!currentSong) return;

  // Remove from patterns
  delete currentSong.patterns[patternName];

  // Remove from all scene assignments
  Object.values(currentSong.scenes).forEach((scene) => {
    if (scene.pattern_assignments) {
      Object.keys(scene.pattern_assignments).forEach((trackKey) => {
        if (scene.pattern_assignments && scene.pattern_assignments[trackKey] === patternName) {
          delete scene.pattern_assignments[trackKey];
        }
      });
    }
  });

  // Remove UI mapping
  delete metadata.uiMappings.patterns[patternName];
}

/**
 * Update pattern duration (bar_count)
 */
export function updatePatternDuration(
  state: CirklonSongData,
  patternName: string,
  newDuration: Duration
): void {
  const currentSong = getCurrentSong(state);
  if (!currentSong) {
    console.log('[updatePatternDuration] No current song');
    return;
  }

  const pattern = currentSong.patterns[patternName];
  if (!pattern) {
    console.error(`[updatePatternDuration] Pattern ${patternName} not found`);
    return;
  }

  const oldBarCount = pattern.bar_count || 1;
  // Convert duration (beats) to bar_count
  const newBarCount = Math.ceil(newDuration / 4);

  console.log('[updatePatternDuration] Updating pattern', {
    patternName,
    newDuration,
    oldBarCount,
    newBarCount,
    hasBarData: pattern.type === 'P3' && pattern.bars && Array.isArray(pattern.bars),
    currentBarsLength: pattern.bars?.length
  });

  // Update bar_count
  pattern.bar_count = newBarCount;

  // For P3 patterns with bar data, also resize the bars array
  // This ensures calculateExpandedDuration returns the correct value
  if (pattern.type === 'P3' && pattern.bars && Array.isArray(pattern.bars)) {
    const currentBarsLength = pattern.bars.length;

    if (newBarCount > currentBarsLength) {
      // Add new bars by duplicating the last bar
      const lastBar = pattern.bars[currentBarsLength - 1];
      if (lastBar) {
        const barsToAdd = newBarCount - currentBarsLength;
        for (let i = 0; i < barsToAdd; i++) {
          // Create a copy of the last bar
          pattern.bars.push({ ...lastBar as never });
        }
        console.log('[updatePatternDuration] Added bars', { barsToAdd, newLength: pattern.bars.length });
      }
    } else if (newBarCount < currentBarsLength) {
      // Remove excess bars
      pattern.bars = pattern.bars.slice(0, newBarCount);
      console.log('[updatePatternDuration] Removed bars', { newLength: pattern.bars.length });
    }
  }

  console.log('[updatePatternDuration] Updated pattern', {
    patternName,
    barCountUpdated: pattern.bar_count === newBarCount,
    barsLength: pattern.bars?.length
  });
}

/**
 * Update pattern label/name
 * This is tricky because pattern names are keys in the patterns object
 * We need to rename the key and update all references
 */
export function renamePattern(
  state: CirklonSongData,
  oldPatternName: string,
  newPatternName: string
): void {
  const currentSong = getCurrentSong(state);
  const metadata = ensureMetadata(state);

  if (!currentSong) return;

  const pattern = currentSong.patterns[oldPatternName];
  if (!pattern) {
    console.error(`Pattern ${oldPatternName} not found`);
    return;
  }

  // Check if new name already exists
  if (currentSong.patterns[newPatternName]) {
    console.error(`Pattern ${newPatternName} already exists`);
    return;
  }

  // Rename in patterns object
  currentSong.patterns[newPatternName] = pattern;
  delete currentSong.patterns[oldPatternName];

  // Update all scene assignments
  Object.values(currentSong.scenes).forEach((scene) => {
    if (scene.pattern_assignments) {
      Object.keys(scene.pattern_assignments).forEach((trackKey) => {
        if (scene.pattern_assignments && scene.pattern_assignments[trackKey] === oldPatternName) {
          scene.pattern_assignments[trackKey] = newPatternName;
        }
      });
    }
  });

  // Update UI mapping
  const mapping = metadata.uiMappings.patterns[oldPatternName];
  if (mapping) {
    metadata.uiMappings.patterns[newPatternName] = mapping;
    delete metadata.uiMappings.patterns[oldPatternName];
  }
}

/**
 * Rename a scene
 * This is tricky because scene names are keys in the scenes object
 * We need to rename the key and update scene order and UI mappings
 */
export function renameScene(
  state: CirklonSongData,
  oldSceneName: string,
  newSceneName: string
): void {
  const currentSong = getCurrentSong(state);
  const metadata = ensureMetadata(state);

  if (!currentSong) return;

  const scene = currentSong.scenes[oldSceneName];
  if (!scene) {
    console.error(`Scene ${oldSceneName} not found`);
    return;
  }

  // Check if new name already exists
  if (currentSong.scenes[newSceneName]) {
    console.error(`Scene ${newSceneName} already exists`);
    return;
  }

  // Rename in scenes object
  currentSong.scenes[newSceneName] = scene;
  delete currentSong.scenes[oldSceneName];

  // Update scene order
  const sceneOrder = metadata.sceneOrder || [];
  const orderIndex = sceneOrder.indexOf(oldSceneName);
  if (orderIndex !== -1) {
    sceneOrder[orderIndex] = newSceneName;
  }

  // Update UI mapping
  const mapping = metadata.uiMappings.scenes[oldSceneName];
  if (mapping) {
    metadata.uiMappings.scenes[newSceneName] = mapping;
    delete metadata.uiMappings.scenes[oldSceneName];
  }
}

/**
 * Update scene length
 */
export function updateSceneLength(
  state: CirklonSongData,
  sceneName: string,
  newLength: Duration
): void {
  const currentSong = getCurrentSong(state);
  if (!currentSong) return;

  const scene = currentSong.scenes[sceneName];
  if (!scene) {
    console.error(`Scene ${sceneName} not found`);
    return;
  }

  // Convert beats to bars
  const lengthInBars = Math.ceil(newLength / 4);
  scene.length = lengthInBars;
}

/**
 * Check if a scene has any pattern assignments
 */
export function isSceneEmpty(
  state: CirklonSongData,
  sceneName: string
): boolean {
  const currentSong = getCurrentSong(state);
  if (!currentSong) return true;

  const scene = currentSong.scenes[sceneName];
  if (!scene?.pattern_assignments) return true;

  return Object.keys(scene.pattern_assignments).length === 0;
}
