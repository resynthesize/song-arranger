/**
 * Cyclone - Cirklon Import
 * Import Cirklon CKS files into Cyclone format
 */

import type { Track, Pattern, Scene, P3PatternData } from '@/types';
import type { CirklonSongData, CirklonSong, CirklonScene, CirklonPattern } from './types';
import type { SaveProjectParams } from '@/utils/storage';
import { barsToBeats, calculateSceneDuration } from './conversion';
import { MODERN_TRACK_COLORS } from '@/constants';
import { isValidP3Bar } from '@/types/patternData';
import { generateId } from '@/utils/id';

/**
 * Result of importing a Cirklon file
 */
export interface ImportResult {
  tracks: Track[];
  patterns: Pattern[];
  scenes: Scene[];
  tempo: number;
  songName: string;
}

/**
 * Parse CKS file JSON string
 * @param jsonString Raw JSON string from .CKS file
 * @returns Parsed CirklonSongData
 * @throws Error if JSON is invalid or doesn't match expected format
 */
export function parseCKSFile(jsonString: string): CirklonSongData {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to parse CKS file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Type guard to verify structure
  if (!parsed || typeof parsed !== 'object' || !('song_data' in parsed)) {
    throw new Error('Invalid CKS file format: missing song_data');
  }

  return parsed as CirklonSongData;
}

/**
 * Extract track number from track key (e.g., "track_1" -> 1)
 * @param trackKey Track key string (e.g., "track_1", "track_15")
 * @returns Track number or null if invalid
 */
function extractTrackNumber(trackKey: string): number | null {
  const match = trackKey.match(/^track_(\d+)$/);
  if (!match || !match[1]) {
    return null;
  }
  return parseInt(match[1], 10);
}

/**
 * Collect all unique track numbers from scenes
 * Excludes 'workscene' which is a temporary scratch pad in Cirklon
 * @param song Cirklon song
 * @returns Sorted array of unique track numbers
 */
function collectTrackNumbers(song: CirklonSong): number[] {
  const trackNumbers = new Set<number>();

  Object.entries(song.scenes).forEach(([sceneName, scene]) => {
    if (sceneName === 'workscene') {
      return; // Skip workscene
    }
    if (scene.pattern_assignments) {
      Object.keys(scene.pattern_assignments).forEach((trackKey) => {
        const trackNum = extractTrackNumber(trackKey);
        if (trackNum !== null) {
          trackNumbers.add(trackNum);
        }
      });
    }
  });

  return Array.from(trackNumbers).sort((a, b) => a - b);
}

/**
 * Generate a unique track ID for a track number
 * @param trackNum Track number
 * @returns Track ID
 */
function generateTrackId(trackNum: number): string {
  // Include track number for debugging/readability
  return `track-${trackNum}-${generateId('track').split('-').slice(1).join('-')}`;
}

/**
 * Generate a unique pattern ID
 * @returns Pattern ID
 */
function generatePatternId(): string {
  return generateId('pattern');
}

/**
 * Get track color based on track number
 * Uses the centralized modern color palette for consistency
 * @param trackNum Track number
 * @returns Hex color string
 */
function getTrackColor(trackNum: number): string {
  return MODERN_TRACK_COLORS[(trackNum - 1) % MODERN_TRACK_COLORS.length] || MODERN_TRACK_COLORS[0];
}

/**
 * Get scenes in their original order from the CKS file
 * Excludes 'workscene' which is a temporary scratch pad in Cirklon
 * Note: Scene order is preserved from the file, not sorted by gbar or name
 * @param song Cirklon song
 * @returns Array of [sceneName, scene] tuples in original order
 */
function getOrderedScenes(song: CirklonSong): Array<[string, CirklonScene]> {
  return Object.entries(song.scenes)
    .filter(([sceneName]) => sceneName !== 'workscene');
}

/**
 * Extract full P3 pattern data from Cirklon pattern
 * Only extracts data for P3 patterns with valid bars array
 * @param patternDef Cirklon pattern definition
 * @returns P3PatternData or undefined if not a valid P3 pattern with bars
 */
function extractP3PatternData(patternDef: CirklonPattern): P3PatternData | undefined {
  // Only process P3 patterns
  if (patternDef.type !== 'P3') {
    return undefined;
  }

  // Must have bars array with at least one bar
  if (!patternDef.bars || !Array.isArray(patternDef.bars) || patternDef.bars.length === 0) {
    return undefined;
  }

  // Validate all bars before creating pattern data
  const validBars = patternDef.bars.filter(isValidP3Bar);
  if (validBars.length === 0) {
    return undefined;
  }

  // Build P3PatternData object
  const patternData: P3PatternData = {
    bars: validBars,
  };

  // Add optional pattern-level fields if they exist
  if (patternDef.loop_start !== undefined) {
    patternData.loop_start = patternDef.loop_start;
  }
  if (patternDef.loop_end !== undefined) {
    patternData.loop_end = patternDef.loop_end;
  }
  if (patternDef.aux_A !== undefined) {
    patternData.aux_A = patternDef.aux_A;
  }
  if (patternDef.aux_B !== undefined) {
    patternData.aux_B = patternDef.aux_B;
  }
  if (patternDef.aux_C !== undefined) {
    patternData.aux_C = patternDef.aux_C;
  }
  if (patternDef.aux_D !== undefined) {
    patternData.aux_D = patternDef.aux_D;
  }
  if (patternDef.accumulator_config !== undefined &&
      patternDef.accumulator_config !== null &&
      typeof patternDef.accumulator_config === 'object' &&
      Object.keys(patternDef.accumulator_config).length > 0) {
    patternData.accumulator_config = patternDef.accumulator_config as never;
  }

  return patternData;
}

/**
 * Import a single Cirklon song into Cyclone format
 * @param songName Name of the song
 * @param song Cirklon song data
 * @param beatsPerBar Beats per bar (default 4)
 * @returns Import result with tracks, patterns, tempo, and song name
 */
export function importSingleSong(
  songName: string,
  song: CirklonSong,
  beatsPerBar: number = 4
): ImportResult {

  // Collect all track numbers and create tracks
  const trackNumbers = collectTrackNumbers(song);
  const trackMap = new Map<number, Track>();

  trackNumbers.forEach((trackNum) => {
    const track: Track = {
      id: generateTrackId(trackNum),
      name: `Track ${trackNum}`,
      color: getTrackColor(trackNum),
    };
    trackMap.set(trackNum, track);
  });

  const tracks = Array.from(trackMap.values());
  const patterns: Pattern[] = [];
  const scenes: Scene[] = [];

  // Process scenes in their original order from the file
  const orderedScenes = getOrderedScenes(song);
  let currentPosition = 0;

  orderedScenes.forEach(([sceneName, scene]) => {
    const sceneDuration = calculateSceneDuration(scene, beatsPerBar);

    // Create scene marker
    const sceneMarker: Scene = {
      id: generateId('scene'),
      name: sceneName,
      position: currentPosition,
      duration: sceneDuration,
    };
    scenes.push(sceneMarker);

    // Process pattern assignments in this scene
    if (scene.pattern_assignments) {
      Object.entries(scene.pattern_assignments).forEach(([trackKey, patternName]) => {
        const trackNum = extractTrackNumber(trackKey);
        if (trackNum === null) {
          return; // Skip invalid track keys
        }

        const track = trackMap.get(trackNum);
        if (!track) {
          return; // Skip if track doesn't exist (shouldn't happen)
        }

        const patternDef = song.patterns[patternName];
        if (!patternDef) {
          return; // Skip if pattern doesn't exist
        }

        // Calculate pattern duration from bar_count (default to 1 bar if not specified)
        const barCount = patternDef.bar_count ?? 1;
        const patternDuration = barsToBeats(barCount, beatsPerBar);

        // Check if pattern is muted
        const isMuted = scene.initial_mutes?.includes(trackKey) ?? false;

        const pattern: Pattern = {
          id: generatePatternId(),
          trackId: track.id,
          position: currentPosition,
          duration: patternDuration,
          label: patternName,
          patternType: patternDef.type,
          sceneDuration, // Add scene duration for loop visualization
        };

        // Only add muted property if true
        if (isMuted) {
          pattern.muted = true;
        }

        // Extract and add P3 pattern data if available
        const patternData = extractP3PatternData(patternDef);
        if (patternData) {
          pattern.patternData = patternData;
        }

        patterns.push(pattern);
      });
    }

    // Move position forward by scene duration
    currentPosition += sceneDuration;
  });

  return {
    tracks,
    patterns,
    scenes,
    tempo: 120, // Default tempo
    songName,
  };
}

/**
 * Import Cirklon song data into Cyclone format
 * Extracts the first song from the song_data object for backward compatibility
 * @param cksData Parsed Cirklon song data
 * @param beatsPerBar Beats per bar (default 4)
 * @returns Import result with tracks, patterns, tempo, and song name
 */
export function importFromCirklon(
  cksData: CirklonSongData,
  beatsPerBar: number = 4
): ImportResult {
  // Extract first song from song_data
  const songEntries = Object.entries(cksData.song_data);
  if (songEntries.length === 0) {
    return {
      tracks: [],
      patterns: [],
      scenes: [],
      tempo: 120,
      songName: 'Untitled',
    };
  }

  const [songName, song] = songEntries[0] as [string, CirklonSong];
  return importSingleSong(songName, song, beatsPerBar);
}

/**
 * Result of importing a song collection
 */
export interface CollectionImportResult {
  successCount: number;
  failureCount: number;
  songNames: string[];
  errors: Array<{ songName: string; error: string }>;
}

/**
 * Import a Cirklon song collection and save each song to localStorage
 * @param cksData Parsed Cirklon song data containing multiple songs
 * @param beatsPerBar Beats per bar (default 4)
 * @param saveToStorage Function to save a project to storage (injected for testability)
 * @returns Summary of import results
 */
export function importSongCollectionFromCirklon(
  cksData: CirklonSongData,
  beatsPerBar: number = 4,
  saveToStorage: (params: SaveProjectParams) => string
): CollectionImportResult {
  const result: CollectionImportResult = {
    successCount: 0,
    failureCount: 0,
    songNames: [],
    errors: [],
  };

  const songEntries = Object.entries(cksData.song_data);

  if (songEntries.length === 0) {
    return result;
  }

  for (const [songName, song] of songEntries) {
    try {
      // Import the song
      const importResult = importSingleSong(songName, song, beatsPerBar);

      // Create timeline state with default values
      const timeline = {
        viewport: {
          offsetBeats: 0,
          zoom: 5,
          widthPx: 1600,
          heightPx: 600,
        },
        verticalZoom: 100, // Default 100% vertical zoom
        playheadPosition: 0,
        isPlaying: false,
        tempo: importResult.tempo,
        snapValue: 1, // Default to quarter note (1 beat)
        snapMode: 'grid' as const,
        minimapVisible: false,
      };

      // Save to localStorage
      saveToStorage({
        name: songName,
        patterns: importResult.patterns,
        tracks: importResult.tracks,
        timeline,
      });

      result.successCount++;
      result.songNames.push(songName);
    } catch (error) {
      result.failureCount++;
      result.errors.push({
        songName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}
