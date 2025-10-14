/**
 * Cyclone - Cirklon Type Definitions
 * TypeScript interfaces for Cirklon CKS file format
 */

/**
 * Root structure of a Cirklon CKS file
 */
export interface CirklonSongData {
  song_data: {
    [songName: string]: CirklonSong;
  };
}

/**
 * A Cirklon song containing patterns, scenes, and instrument assignments
 */
export interface CirklonSong {
  instrument_assignments?: { [trackKey: string]: { output: string } };
  patterns: { [patternName: string]: CirklonPattern };
  scenes: { [sceneName: string]: CirklonScene };
}

/**
 * A Cirklon pattern (either P3 or CK type)
 */
export interface CirklonPattern {
  type: 'P3' | 'CK';
  creator_track: number;
  saved: boolean;
  bar_count?: number;  // P3 patterns have explicit bar_count
  last_step?: number;  // CK patterns have last_step (we'll need to convert)

  // P3-specific fields for full pattern data
  loop_start?: number;
  loop_end?: number;
  aux_A?: string;
  aux_B?: string;
  aux_C?: string;
  aux_D?: string;
  accumulator_config?: unknown; // Accumulator configuration (typed as unknown for now)
  bars?: unknown[]; // Array of bar data with 16 steps each
}

/**
 * A Cirklon scene defining which patterns play at which time
 */
export interface CirklonScene {
  gbar: number;  // Global bar position
  length: number;  // Scene length in bars
  advance: 'auto' | 'manual';
  pattern_assignments?: { [trackKey: string]: string };  // e.g., "track_1": "Trk1 P3"
  initial_mutes?: string[];  // Array of track keys like ["track_1", "track_9"]
  // Additional fields exist but are not needed for import
}
