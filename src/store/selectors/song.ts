/**
 * Cyclone - Song Selectors (CKS Native)
 * Compute Pattern/Track/Scene view models from CirklonSongData
 *
 * These selectors transform the CKS format into view models that components expect.
 * This maintains the same interface while using CKS as the native storage format.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { Pattern, Track, Scene, ID, P3PatternData } from '@/types';
import type { CirklonSong, CirklonPattern, CirklonScene } from '@/utils/cirklon/types';
import { barsToBeats } from '@/utils/cirklon/conversion';
import { generateId } from '@/utils/id';
import { calculateExpandedDuration } from '@/utils/cirklon/barRepetitions';

/**
 * Base selector - get the entire song state (from undoable wrapper)
 */
export const selectSongState = (state: RootState) => state.song.present;

/**
 * Base selector - get metadata
 */
export const selectMetadata = (state: RootState) => state.song.present._cyclone_metadata;

/**
 * Base selector - get current song name
 */
export const selectCurrentSongName = (state: RootState) =>
  state.song.present._cyclone_metadata?.currentSongName || Object.keys(state.song.present.song_data)[0] || '';

/**
 * Memoized selector - get the current song being edited
 */
export const selectCurrentSong = createSelector(
  [selectSongState, selectCurrentSongName],
  (songState, currentSongName): CirklonSong | null => {
    return songState.song_data[currentSongName] || null;
  }
);

/**
 * Helper: Get ordered scenes (respects metadata.sceneOrder)
 */
function getOrderedScenes(song: CirklonSong, sceneOrder: string[]): Array<[string, CirklonScene]> {
  const sceneEntries = Object.entries(song.scenes);

  // If we have a scene order in metadata, use it
  if (sceneOrder.length > 0) {
    const orderedEntries: Array<[string, CirklonScene]> = [];
    sceneOrder.forEach((sceneName) => {
      const scene = song.scenes[sceneName];
      if (scene) {
        orderedEntries.push([sceneName, scene]);
      }
    });
    // Add any scenes not in the order (shouldn't happen, but be defensive)
    sceneEntries.forEach(([name, scene]) => {
      if (!sceneOrder.includes(name)) {
        orderedEntries.push([name, scene]);
      }
    });
    return orderedEntries;
  }

  // Fallback: alphabetical order by scene name
  // Note: This should rarely happen - sceneOrder should always exist in metadata
  return sceneEntries.sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
}

/**
 * Helper: Compute pattern duration from CirklonPattern
 * Accounts for bar repetitions if the pattern has P3 bar data
 */
function computePatternDuration(pattern: CirklonPattern, beatsPerBar: number = 4): number {
  // For P3 patterns with bar data, use expanded duration (accounts for repetitions)
  if (pattern.type === 'P3' && pattern.bars && Array.isArray(pattern.bars) && pattern.bars.length > 0) {
    try {
      const expandedDuration = calculateExpandedDuration(
        { bars: pattern.bars } as P3PatternData,
        beatsPerBar
      );
      // If we got a valid expanded duration, use it
      if (expandedDuration > 0) {
        return expandedDuration;
      }
    } catch (error) {
      console.error('Error calculating expanded duration:', error);
      // Fall through to fallback
    }
  }

  // Fallback: use bar_count without repetitions
  if (pattern.bar_count) {
    return barsToBeats(pattern.bar_count, beatsPerBar);
  }

  // Default to 1 bar if no bar_count specified
  return beatsPerBar;
}

/**
 * Helper: Compute scene duration
 * Duration (in beats) = length × (gbar / 4)
 * Where gbar is the global bar length in 16th note steps
 */
function computeSceneDuration(scene: CirklonScene): number {
  // gbar is in 16th note steps, so divide by 4 to get quarter notes (beats)
  const beatsPerBar = scene.gbar / 4;
  return scene.length * beatsPerBar;
}

/**
 * Memoized selector - compute all Scene view models from CKS
 */
export const selectAllScenes = createSelector(
  [selectCurrentSong, selectMetadata],
  (currentSong, metadata): Scene[] => {
    if (!currentSong || !currentSong.scenes) {
      return [];
    }

    const sceneOrder = metadata?.sceneOrder || [];
    const orderedScenes = getOrderedScenes(currentSong, sceneOrder);

    const scenes: Scene[] = [];
    let currentPosition = 0;

    orderedScenes.forEach(([sceneName, scene]) => {
      const reactKey = metadata?.uiMappings.scenes[sceneName]?.reactKey || generateId('scene');
      // Note: color is in metadata but Scene interface doesn't support it yet
      // const color = metadata?.uiMappings.scenes[sceneName]?.color;
      const duration = computeSceneDuration(scene);

      scenes.push({
        id: reactKey,
        name: sceneName,
        position: currentPosition,
        duration,
        gbar: scene.gbar,
        length: scene.length,
        advance: scene.advance || 'auto',
        initialMutes: scene.initial_mutes?.map(trackKey => {
          // Convert track keys to React IDs
          return metadata?.uiMappings.tracks[trackKey]?.reactKey || trackKey;
        }),
      });

      currentPosition += duration;
    });

    return scenes;
  }
);

/**
 * Memoized selector - compute all Track view models from CKS
 */
export const selectAllTracks = createSelector(
  [selectCurrentSong, selectMetadata],
  (currentSong, metadata): Track[] => {
    if (!currentSong) {
      return [];
    }

    const trackOrder = metadata?.trackOrder || [];
    const trackKeys = new Set<string>();

    // Collect all track keys from trackOrder (includes empty tracks)
    trackOrder.forEach((trackKey) => {
      trackKeys.add(trackKey);
    });

    // Also collect any track keys from scenes that aren't in trackOrder
    Object.values(currentSong.scenes).forEach((scene) => {
      if (scene.pattern_assignments) {
        Object.keys(scene.pattern_assignments).forEach((trackKey) => {
          trackKeys.add(trackKey);
        });
      }
    });

    // Order tracks according to metadata.trackOrder
    const orderedTrackKeys: string[] = [];
    trackOrder.forEach((trackKey) => {
      if (trackKeys.has(trackKey)) {
        orderedTrackKeys.push(trackKey);
      }
    });
    // Add any tracks not in the order
    trackKeys.forEach((trackKey) => {
      if (!trackOrder.includes(trackKey)) {
        orderedTrackKeys.push(trackKey);
      }
    });

    // If no tracks found, return empty array
    if (orderedTrackKeys.length === 0) {
      return [];
    }

    // Build Track view models
    const tracks: Track[] = orderedTrackKeys.map((trackKey) => {
      const mapping = metadata?.uiMappings.tracks[trackKey];
      const reactKey = mapping?.reactKey || generateId('track');
      const trackNumber = mapping?.trackNumber || parseInt(trackKey.replace('track_', ''), 10);
      const color = mapping?.color || '#00ff00';
      const height = mapping?.height;
      const collapsed = mapping?.collapsed;

      return {
        id: reactKey,
        name: `Track ${trackNumber}`,
        color,
        height,
        collapsed,
      };
    });

    return tracks;
  }
);

/**
 * Memoized selector - compute all Pattern view models from CKS
 */
export const selectAllPatterns = createSelector(
  [selectCurrentSong, selectMetadata, selectAllTracks, selectAllScenes],
  (currentSong, metadata, tracks, scenes): Pattern[] => {
    if (!currentSong) {
      return [];
    }

    const beatsPerBar = 4; // TODO: Get from song settings
    const patterns: Pattern[] = [];

    // Build a map of trackKey → track for fast lookup
    const trackMap = new Map<string, Track>();
    tracks.forEach((track) => {
      const trackMapping = Object.entries(metadata?.uiMappings.tracks || {}).find(
        ([, mapping]) => mapping.reactKey === track.id
      );
      if (trackMapping) {
        trackMap.set(trackMapping[0], track);
      }
    });

    // Iterate through scenes to find pattern assignments
    scenes.forEach((scene) => {
      const sceneData = currentSong.scenes[scene.name];
      if (!sceneData || !sceneData.pattern_assignments) {
        return;
      }

      Object.entries(sceneData.pattern_assignments).forEach(([trackKey, patternName]) => {
        const track = trackMap.get(trackKey);
        if (!track) {
          return; // Skip if track not found
        }

        const patternDef = currentSong.patterns[patternName];
        if (!patternDef) {
          return; // Skip if pattern doesn't exist
        }

        // Generate a unique ID for this pattern INSTANCE (scene + track + pattern combination)
        // This ensures that if the same pattern appears in multiple scenes or tracks,
        // each instance gets its own unique ID for React rendering
        const patternId = `${scene.id}-${track.id}-${patternName.replace(/\s+/g, '-')}`;
        const duration = computePatternDuration(patternDef, beatsPerBar);

        // Check if pattern is muted in this scene
        const isMuted = sceneData.initial_mutes?.includes(trackKey) ?? false;

        const pattern: Pattern = {
          id: patternId,
          trackId: track.id,
          position: scene.position,
          duration,
          label: patternName,
          patternType: patternDef.type,
          sceneDuration: scene.duration,
        };

        // Add muted property if true
        if (isMuted) {
          pattern.muted = true;
        }

        // Add pattern data if available (P3 patterns with bars)
        if (patternDef.type === 'P3' && patternDef.bars && Array.isArray(patternDef.bars)) {
          pattern.patternData = {
            bars: patternDef.bars as never, // Type assertion needed due to unknown[]
            loop_start: patternDef.loop_start,
            loop_end: patternDef.loop_end,
            aux_A: patternDef.aux_A,
            aux_B: patternDef.aux_B,
            aux_C: patternDef.aux_C,
            aux_D: patternDef.aux_D,
            accumulator_config: patternDef.accumulator_config as never,
          };
        }

        patterns.push(pattern);
      });
    });

    return patterns;
  }
);

/**
 * Memoized selector - get patterns for a specific track
 */
export const selectPatternsByTrack = createSelector(
  [selectAllPatterns, (_state: RootState, trackId: ID) => trackId],
  (patterns, trackId) => patterns.filter((pattern) => pattern.trackId === trackId)
);

/**
 * Memoized selector - get pattern by ID
 */
export const selectPatternById = createSelector(
  [selectAllPatterns, (_state: RootState, patternId: ID) => patternId],
  (patterns, patternId) => patterns.find((pattern) => pattern.id === patternId)
);

/**
 * Memoized selector - get track by ID
 */
export const selectTrackById = createSelector(
  [selectAllTracks, (_state: RootState, trackId: ID) => trackId],
  (tracks, trackId) => tracks.find((track) => track.id === trackId)
);

/**
 * Memoized selector - get scene by ID
 */
export const selectSceneById = createSelector(
  [selectAllScenes, (_state: RootState, sceneId: ID) => sceneId],
  (scenes, sceneId) => scenes.find((scene) => scene.id === sceneId)
);

/**
 * Memoized selector - get timeline end position
 */
export const selectTimelineEndPosition = createSelector(
  [selectAllPatterns],
  (patterns) => {
    if (patterns.length === 0) return 0;
    return Math.max(...patterns.map((p) => p.position + p.duration));
  }
);

/**
 * Memoized selector - get selected patterns
 */
export const selectSelectedPatterns = createSelector(
  [selectAllPatterns, (state: RootState) => state.selection?.selectedPatternIds || []],
  (patterns, selectedIds) => {
    const selectedIdsSet = new Set(selectedIds);
    return patterns.filter((pattern) => selectedIdsSet.has(pattern.id));
  }
);

/**
 * Memoized selector - check if pattern is selected
 */
export const selectIsPatternSelected = createSelector(
  [(state: RootState) => state.selection?.selectedPatternIds || [], (_state: RootState, patternId: ID) => patternId],
  (selectedIds, patternId) => selectedIds.includes(patternId)
);

/**
 * Memoized selector - get track count
 */
export const selectTrackCount = createSelector(
  [selectAllTracks],
  (tracks) => tracks.length
);

/**
 * Memoized selector - get pattern count
 */
export const selectPatternCount = createSelector(
  [selectAllPatterns],
  (patterns) => patterns.length
);

/**
 * Memoized selector - get track index by ID
 */
export const selectTrackIndexById = createSelector(
  [selectAllTracks, (_state: RootState, trackId: ID) => trackId],
  (tracks, trackId) => tracks.findIndex((track) => track.id === trackId)
);

/**
 * Memoized selector - get all available instruments from current song
 */
export const selectAvailableInstruments = createSelector(
  [selectCurrentSong],
  (currentSong): string[] => {
    if (!currentSong || !currentSong.instrument_assignments) {
      return [];
    }

    const instruments = new Set<string>();
    Object.values(currentSong.instrument_assignments).forEach((assignment) => {
      if (assignment.output) {
        instruments.add(assignment.output);
      }
    });

    return Array.from(instruments).sort();
  }
);

/**
 * Helper: Get track key from track ID
 */
function getTrackKeyFromId(trackId: ID, metadata: ReturnType<typeof selectMetadata>): string | null {
  if (!metadata) return null;

  const entry = Object.entries(metadata.uiMappings.tracks).find(
    ([, mapping]) => mapping.reactKey === trackId
  );

  return entry ? entry[0] : null;
}

/**
 * Memoized selector - get track settings by ID
 */
export const selectTrackSettingsById = createSelector(
  [selectCurrentSong, selectMetadata, (_state: RootState, trackId: ID) => trackId],
  (currentSong, metadata, trackId) => {
    if (!currentSong || !metadata) {
      return null;
    }

    const trackKey = getTrackKeyFromId(trackId, metadata);
    if (!trackKey) {
      return null;
    }

    const trackMapping = metadata.uiMappings.tracks[trackKey];
    const instrumentAssignment = currentSong.instrument_assignments?.[trackKey];

    return {
      trackKey,
      instrument: instrumentAssignment?.output,
      multiChannel: instrumentAssignment?.multi_channel,
      transpose: trackMapping?.transpose,
      noTranspose: trackMapping?.noTranspose,
      noFTS: trackMapping?.noFTS,
      color: trackMapping?.color,
      height: trackMapping?.height,
      collapsed: trackMapping?.collapsed,
    };
  }
);
