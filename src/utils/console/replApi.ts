/**
 * Cyclone - REPL API
 * Built-in functions and DSL for live coding console
 */

import type { AppDispatch } from '@/store/store';
import type { RootState } from '@/types';
import { selectAllTracks, selectAllPatterns, selectAllScenes, selectCurrentSong } from '@/store/selectors';
import {
  addPattern as addPatternAction,
  removePattern as removePatternAction,
  updatePattern as updatePatternAction,
  addScene as addSceneAction,
  removeScene as removeSceneAction,
  assignPatternToScene,
  updateTrackSettings,
} from '@/store/slices/songSlice/index';
import { generateId } from '@/utils/id';
import type { CirklonPattern } from '@/utils/cirklon/types';

/**
 * Create the REPL API context with all available functions
 */
export function createReplApi(dispatch: AppDispatch, state: RootState) {
  // Helper to get fresh state (important for multi-line commands)
  const getState = () => state;

  return {
    // ==================== UTILITY FUNCTIONS ====================

    help: () => {
      return `Cyclone Live Coding Console

Available Commands:
  help()              - Show this help message

State Access:
  tracks              - List all tracks
  patterns            - List all patterns
  scenes              - List all scenes
  song                - Current CKS song data

Pattern Operations:
  createPattern(name, opts) - Create new pattern
  removePattern(name)       - Remove pattern by name
  p(name)                   - Get pattern builder

Pattern DSL:
  p(name).bars(n)           - Set pattern length in bars
  p(name).notes([...])      - Set pattern notes (future)
  p(name).info()            - Get pattern info

Scene Operations:
  createScene(name, length) - Create new scene (length in bars)
  removeScene(name)         - Remove scene
  assignPattern(scene, track, pattern) - Assign pattern to track in scene

Track Settings:
  setTrackColor(trackKey, color) - Set track color
  setTrackTranspose(trackKey, n) - Set transpose amount

Examples:
  createPattern("Bass", { bars: 4 })
  createScene("Intro", 8)
  assignPattern("Intro", "track_1", "Bass")
  p("Bass").info()
`;
    },

    // ==================== STATE ACCESS (READ-ONLY) ====================

    get tracks() {
      return selectAllTracks(getState());
    },

    get patterns() {
      return selectAllPatterns(getState());
    },

    get scenes() {
      return selectAllScenes(getState());
    },

    get song() {
      return selectCurrentSong(getState());
    },

    // Read-only info object with computed stats
    get info() {
      const tracks = selectAllTracks(getState());
      const patterns = selectAllPatterns(getState());
      const scenes = selectAllScenes(getState());

      return {
        trackCount: tracks.length,
        patternCount: patterns.length,
        sceneCount: scenes.length,
      };
    },

    // ==================== PATTERN OPERATIONS ====================

    /**
     * Create a new pattern in CKS format
     */
    createPattern: (patternName: string, options: { bars?: number; type?: 'P3' | 'CK' } = {}) => {
      const { bars = 4, type = 'P3' } = options;

      const pattern: CirklonPattern = {
        type,
        creator_track: 1,
        saved: true,
        bar_count: bars,
      };

      dispatch(addPatternAction({
        patternName,
        pattern,
        reactKey: generateId('pattern'),
      }));

      return `Created pattern "${patternName}" (${bars} bars)`;
    },

    /**
     * Remove a pattern by name
     */
    removePattern: (patternName: string) => {
      dispatch(removePatternAction(patternName));
      return `Removed pattern: ${patternName}`;
    },

    // ==================== PATTERN DSL ====================

    /**
     * Pattern builder DSL
     * Usage: p("Bass").bars(4).info()
     */
    p: (patternName: string) => {
      const builder = {
        _patternName: patternName,

        /**
         * Set pattern length in bars
         */
        bars: (barCount: number) => {
          dispatch(updatePatternAction({
            patternName,
            changes: { bar_count: barCount }
          }));
          return builder; // Chainable
        },

        /**
         * Set pattern notes (FUTURE - requires understanding bar format)
         */
        notes: (_noteArray: number[]) => {
          return 'Pattern note editing not yet implemented - requires bar format';
        },

        /**
         * Get pattern info from CKS
         */
        info: () => {
          const song = selectCurrentSong(getState());
          if (!song) {
            return 'No song loaded';
          }
          const pattern = song.patterns[patternName];
          if (!pattern) {
            return `Pattern "${patternName}" not found`;
          }
          return {
            name: patternName,
            type: pattern.type,
            bars: pattern.bar_count || 'unknown',
            creatorTrack: pattern.creator_track,
          };
        },
      };

      return builder;
    },

    // ==================== SCENE OPERATIONS ====================

    /**
     * Create a new scene
     */
    createScene: (sceneName: string, length: number = 4) => {
      // Find the next position (at the end of existing scenes)
      const scenes = selectAllScenes(getState());
      const lastScene = scenes[scenes.length - 1];
      const position = lastScene ? lastScene.position + lastScene.duration : 0;

      // Use standard 4/4 time (gbar = 16 sixteenth notes)
      const gbar = 16;

      dispatch(addSceneAction({
        sceneName,
        scene: {
          gbar,
          length,
          advance: 'auto',
          pattern_assignments: {},
        },
        reactKey: generateId('scene'),
      }));

      const positionBars = position / 4;
      return `Created scene "${sceneName}" at beat ${position.toFixed(2)} (bar ${positionBars.toFixed(2)}, ${length} bars, ${gbar} 16th-notes per bar)`;
    },

    /**
     * Remove a scene
     */
    removeScene: (sceneName: string) => {
      dispatch(removeSceneAction(sceneName));
      return `Removed scene: ${sceneName}`;
    },

    /**
     * Assign a pattern to a track in a scene
     */
    assignPattern: (sceneName: string, trackKey: string, patternName: string) => {
      dispatch(assignPatternToScene({ sceneName, trackKey, patternName }));
      return `Assigned "${patternName}" to ${trackKey} in scene "${sceneName}"`;
    },

    // ==================== TRACK SETTINGS ====================

    /**
     * Set track color
     */
    setTrackColor: (trackKey: string, color: string) => {
      dispatch(updateTrackSettings({
        trackKey,
        settings: { color },
      }));
      return `Set ${trackKey} color to ${color}`;
    },

    /**
     * Set track transpose
     */
    setTrackTranspose: (trackKey: string, transpose: number) => {
      dispatch(updateTrackSettings({
        trackKey,
        settings: { transpose },
      }));
      return `Set ${trackKey} transpose to ${transpose}`;
    },

    // ==================== UTILITY HELPERS ====================

    // Math utilities (already available, but we can add music-specific ones)
    Math,

    // Array utilities
    Array,

    // Music theory helpers
    note: {
      midiToName: (midi: number) => {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midi / 12) - 1;
        const noteName = notes[midi % 12];
        return `${noteName}${octave}`;
      },

      nameToMidi: (name: string) => {
        const notes: Record<string, number> = {
          'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
          'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
          'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };

        const match = name.match(/^([A-G][#b]?)(-?\d+)$/);
        if (!match) return null;

        const [, noteName, octaveStr] = match;
        if (!noteName || !octaveStr) return null;

        const noteValue = notes[noteName];
        const octave = parseInt(octaveStr);

        if (noteValue === undefined) return null;
        return (octave + 1) * 12 + noteValue;
      },

      // Generate scales
      scale: (root: number, type: 'major' | 'minor' | 'pentatonic' = 'major') => {
        const intervals: Record<string, number[]> = {
          major: [0, 2, 4, 5, 7, 9, 11],
          minor: [0, 2, 3, 5, 7, 8, 10],
          pentatonic: [0, 2, 4, 7, 9],
        };

        return intervals[type]?.map(i => root + i) || [];
      },

      // Generate chord
      chord: (root: number, type: 'maj' | 'min' | '7' | 'maj7' = 'maj') => {
        const intervals: Record<string, number[]> = {
          maj: [0, 4, 7],
          min: [0, 3, 7],
          '7': [0, 4, 7, 10],
          maj7: [0, 4, 7, 11],
        };

        return intervals[type]?.map(i => root + i) || [];
      },
    },

    // Pattern generation helpers
    gen: {
      // Generate an array of numbers
      range: (start: number, end: number, step: number = 1) => {
        const result = [];
        for (let i = start; i < end; i += step) {
          result.push(i);
        }
        return result;
      },

      // Repeat a pattern
      repeat: (pattern: any[], times: number) => {
        return Array(times).fill(pattern).flat();
      },

      // Random choice from array
      choose: (arr: any[]) => {
        return arr[Math.floor(Math.random() * arr.length)];
      },

      // Random number in range
      random: (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },
    },
  };
}
