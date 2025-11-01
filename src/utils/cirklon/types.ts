/**
 * Cyclone - Cirklon Type Definitions
 * TypeScript interfaces for Cirklon CKS file format
 */

import type { ViewportState, TimelineState, SelectionState, PatternEditorState } from '@/types';

/**
 * Cyclone metadata stored in CKS files for preserving application state
 * This is the NEW format that stores UI mappings for CKS-native architecture
 */
export interface CycloneMetadata {
  version: string;
  exportedAt?: string;
  exportedFrom?: string;

  // Which song in song_data we're currently editing
  currentSongName: string;

  // React keys and UI state for stable rendering
  // Maps CKS identifiers (pattern names, track keys, scene names) to React keys
  uiMappings: {
    // Map pattern names to stable React keys
    // Key: pattern name from CKS (e.g., "Trk9 P1")
    // Value: { reactKey: stable ID for React rendering }
    patterns: { [patternName: string]: { reactKey: string } };

    // Map track keys to stable React keys and UI state
    // Key: track key from CKS (e.g., "track_1")
    // Value: { reactKey: stable ID for React, color: hex color, trackNumber: 1, transpose settings, visual settings }
    tracks: {
      [trackKey: string]: {
        reactKey: string;
        color: string;
        trackNumber: number;
        // Visual settings
        height?: number;
        collapsed?: boolean;
        // Transpose settings
        transpose?: number;
        noTranspose?: boolean;
        noFTS?: boolean;
      };
    };

    // Map scene names to stable React keys
    // Key: scene name from CKS (e.g., "Scene 1")
    // Value: { reactKey: stable ID for React, color?: optional hex color }
    scenes: { [sceneName: string]: { reactKey: string; color?: string } };
  };

  // Track display order (array of track keys in display order)
  // E.g., ["track_1", "track_3", "track_2"] if user reordered tracks
  trackOrder: string[];

  // Scene display order (array of scene names in display order)
  // E.g., ["Scene 1", "Scene 2", "Scene 3"]
  sceneOrder: string[];

  // UI state
  viewport?: ViewportState;
  timeline?: Partial<TimelineState>;
  selection?: Partial<SelectionState>;
  patternEditor?: Partial<PatternEditorState>;
}

/**
 * Root structure of a Cirklon CKS file
 */
export interface CirklonSongData {
  song_data: {
    [songName: string]: CirklonSong;
  };
  _cyclone_metadata?: CycloneMetadata;
}

/**
 * A Cirklon song containing patterns, scenes, and instrument assignments
 */
export interface CirklonSong {
  instrument_assignments?: {
    [trackKey: string]: {
      output: string;
      multi_channel?: number; // MIDI channel 1-16 for multi-channel mode
    };
  };
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
