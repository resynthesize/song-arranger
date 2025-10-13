/**
 * Song Arranger - Cirklon Import
 * Import Cirklon CKS files into Song Arranger format
 */

import type { Track, Pattern } from '@/types';
import type { CirklonSongData, CirklonSong, CirklonScene } from './types';
import { barsToBeats, calculateSceneDuration } from './conversion';

/**
 * Result of importing a Cirklon file
 */
export interface ImportResult {
  tracks: Track[];
  patterns: Pattern[];
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
 * @param song Cirklon song
 * @returns Sorted array of unique track numbers
 */
function collectTrackNumbers(song: CirklonSong): number[] {
  const trackNumbers = new Set<number>();

  Object.values(song.scenes).forEach((scene) => {
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
  return `track-${trackNum}-${Date.now().toString()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Generate a unique pattern ID
 * @returns Pattern ID
 */
function generatePatternId(): string {
  return `pattern-${Date.now().toString()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Get track color based on track number
 * Uses a color palette for variety
 * @param trackNum Track number
 * @returns Hex color string
 */
function getTrackColor(trackNum: number): string {
  const colors = [
    '#00ff00', // Green
    '#00ffff', // Cyan
    '#ff00ff', // Magenta
    '#ffff00', // Yellow
    '#ff8800', // Orange
    '#0088ff', // Blue
    '#88ff00', // Lime
    '#ff0088', // Pink
  ];
  return colors[(trackNum - 1) % colors.length] || '#00ff00';
}

/**
 * Sort scenes by their gbar (global bar) position
 * @param song Cirklon song
 * @returns Array of [sceneName, scene] tuples sorted by gbar
 */
function getSortedScenes(song: CirklonSong): Array<[string, CirklonScene]> {
  return Object.entries(song.scenes).sort(
    ([, sceneA], [, sceneB]) => sceneA.gbar - sceneB.gbar
  );
}

/**
 * Import Cirklon song data into Song Arranger format
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
      tempo: 120,
      songName: 'Untitled',
    };
  }

  const [songName, song] = songEntries[0] as [string, CirklonSong];

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

  // Process scenes in order
  const sortedScenes = getSortedScenes(song);
  let currentPosition = 0;

  sortedScenes.forEach(([, scene]) => {
    const sceneDuration = calculateSceneDuration(scene, beatsPerBar);

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
        };

        // Only add muted property if true
        if (isMuted) {
          pattern.muted = true;
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
    tempo: 120, // Default tempo
    songName,
  };
}
