/**
 * Song Arranger - Cirklon Export
 * Export Song Arranger format to Cirklon CKS files
 */

import type { Track, Pattern } from '@/types';
import type { CirklonSongData, CirklonPattern, CirklonScene } from './types';
import { beatsToBar, generatePatternName } from './conversion';

/**
 * Export options for Cirklon file generation
 */
export interface ExportOptions {
  sceneLengthBars: number; // Scene length in bars (default: 8)
  beatsPerBar: number; // Beats per bar (default: 4)
  songName: string; // Song name
  tempo: number; // Tempo in BPM
}

/**
 * Pattern assignment entry for a scene
 */
interface PatternAssignment {
  trackKey: string; // e.g., "track_1"
  patternName: string; // e.g., "T1_P3_00"
  isMuted: boolean;
}

/**
 * Get track number from track ID by finding its index in the tracks array
 * @param trackId Track ID to find
 * @param tracks Array of all tracks
 * @returns Track number (1-based index) or null if not found
 */
function getTrackNumber(trackId: string, tracks: Track[]): number | null {
  const index = tracks.findIndex((t) => t.id === trackId);
  if (index === -1) {
    return null;
  }
  return index + 1; // Convert to 1-based
}

/**
 * Calculate total timeline duration from patterns
 * @param patterns Array of patterns
 * @returns Duration in beats
 */
function calculateTimelineDuration(patterns: Pattern[]): number {
  if (patterns.length === 0) {
    return 0;
  }

  let maxEnd = 0;
  patterns.forEach((pattern) => {
    const end = pattern.position + pattern.duration;
    if (end > maxEnd) {
      maxEnd = end;
    }
  });

  return maxEnd;
}

/**
 * Calculate number of scenes needed based on timeline duration
 * @param durationBeats Duration in beats
 * @param sceneLengthBars Scene length in bars
 * @param beatsPerBar Beats per bar
 * @returns Number of scenes needed
 */
function calculateSceneCount(
  durationBeats: number,
  sceneLengthBars: number,
  beatsPerBar: number
): number {
  if (durationBeats === 0) {
    return 0;
  }

  const sceneLengthBeats = sceneLengthBars * beatsPerBar;
  return Math.ceil(durationBeats / sceneLengthBeats);
}

/**
 * Check if a pattern intersects with a scene's time range
 * @param pattern Pattern to check
 * @param sceneStartBeats Scene start position in beats
 * @param sceneEndBeats Scene end position in beats
 * @returns True if pattern intersects with scene
 */
function patternIntersectsScene(
  pattern: Pattern,
  sceneStartBeats: number,
  sceneEndBeats: number
): boolean {
  const patternEnd = pattern.position + pattern.duration;
  return pattern.position < sceneEndBeats && patternEnd > sceneStartBeats;
}

/**
 * Find patterns that intersect with a scene
 * @param patterns All patterns
 * @param sceneStartBeats Scene start position in beats
 * @param sceneEndBeats Scene end position in beats
 * @param tracks Array of all tracks
 * @returns Array of pattern assignments for this scene
 */
function findScenePatterns(
  patterns: Pattern[],
  sceneStartBeats: number,
  sceneEndBeats: number,
  tracks: Track[]
): PatternAssignment[] {
  const assignments: PatternAssignment[] = [];
  const tracksSeen = new Set<string>(); // Track only first pattern per track

  // Sort patterns by position to ensure first pattern is used if multiple overlap
  const sortedPatterns = [...patterns].sort((a, b) => a.position - b.position);

  sortedPatterns.forEach((pattern) => {
    // Skip if pattern doesn't intersect with this scene
    if (!patternIntersectsScene(pattern, sceneStartBeats, sceneEndBeats)) {
      return;
    }

    // Skip if we already have a pattern for this track in this scene
    if (tracksSeen.has(pattern.trackId)) {
      return;
    }

    const trackNum = getTrackNumber(pattern.trackId, tracks);
    if (trackNum === null) {
      return; // Skip if track not found
    }

    const trackKey = `track_${trackNum}`;
    tracksSeen.add(pattern.trackId);

    // Generate pattern name - use label if available, otherwise generate
    const patternType = pattern.patternType || 'P3';
    const patternName = pattern.label || generatePatternName(trackNum, 0, patternType);

    assignments.push({
      trackKey,
      patternName,
      isMuted: pattern.muted === true,
    });
  });

  return assignments;
}

/**
 * Create a Cirklon pattern definition
 * @param pattern Song Arranger pattern
 * @param trackNum Track number (1-based)
 * @param beatsPerBar Beats per bar
 * @returns Cirklon pattern
 */
function createCirklonPattern(
  pattern: Pattern,
  trackNum: number,
  beatsPerBar: number
): CirklonPattern {
  const patternType = pattern.patternType || 'P3';
  const barCount = Math.max(1, Math.round(beatsToBar(pattern.duration, beatsPerBar)));

  return {
    type: patternType,
    bar_count: barCount,
    creator_track: trackNum,
    saved: false,
  };
}

/**
 * Export Song Arranger tracks and patterns to Cirklon format
 * @param tracks Array of tracks
 * @param patterns Array of patterns
 * @param options Export options
 * @returns Cirklon song data
 */
export function exportToCirklon(
  tracks: Track[],
  patterns: Pattern[],
  options: ExportOptions
): CirklonSongData {
  const { sceneLengthBars, beatsPerBar, songName } = options;

  // Calculate timeline duration
  const timelineDuration = calculateTimelineDuration(patterns);

  // Calculate number of scenes needed
  const sceneCount = calculateSceneCount(timelineDuration, sceneLengthBars, beatsPerBar);

  // Initialize patterns and scenes objects
  const cirklonPatterns: { [patternName: string]: CirklonPattern } = {};
  const cirklonScenes: { [sceneName: string]: CirklonScene } = {};

  // Scene length in beats
  const sceneLengthBeats = sceneLengthBars * beatsPerBar;

  // Create scenes and pattern assignments
  for (let sceneIndex = 0; sceneIndex < sceneCount; sceneIndex++) {
    const sceneStartBeats = sceneIndex * sceneLengthBeats;
    const sceneEndBeats = sceneStartBeats + sceneLengthBeats;

    // Find patterns that intersect with this scene
    const assignments = findScenePatterns(patterns, sceneStartBeats, sceneEndBeats, tracks);

    // Skip empty scenes
    if (assignments.length === 0) {
      continue;
    }

    // Create pattern assignments and initial mutes
    const patternAssignments: { [trackKey: string]: string } = {};
    const initialMutes: string[] = [];

    assignments.forEach((assignment) => {
      patternAssignments[assignment.trackKey] = assignment.patternName;

      if (assignment.isMuted) {
        initialMutes.push(assignment.trackKey);
      }

      // Create Cirklon pattern if it doesn't exist yet
      if (!cirklonPatterns[assignment.patternName]) {
        // Find the original pattern
        const originalPattern = patterns.find(
          (p) =>
            (p.label && p.label === assignment.patternName) ||
            (!p.label &&
              generatePatternName(
                getTrackNumber(p.trackId, tracks) || 0,
                0,
                p.patternType || 'P3'
              ) === assignment.patternName)
        );

        if (originalPattern) {
          const trackNum = getTrackNumber(originalPattern.trackId, tracks);
          if (trackNum !== null) {
            cirklonPatterns[assignment.patternName] = createCirklonPattern(
              originalPattern,
              trackNum,
              beatsPerBar
            );
          }
        }
      }
    });

    // Create scene
    const sceneName = `Scene ${sceneIndex + 1}`;
    const scene: CirklonScene = {
      gbar: sceneIndex * sceneLengthBars,
      length: sceneLengthBars,
      advance: 'auto',
      pattern_assignments: patternAssignments,
    };

    // Only add initial_mutes if there are muted tracks
    if (initialMutes.length > 0) {
      scene.initial_mutes = initialMutes;
    }

    cirklonScenes[sceneName] = scene;
  }

  // Return Cirklon song data
  return {
    song_data: {
      [songName]: {
        patterns: cirklonPatterns,
        scenes: cirklonScenes,
      },
    },
  };
}
