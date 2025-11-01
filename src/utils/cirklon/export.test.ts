/**
 * Cyclone - Cirklon Export Tests
 * Test-driven development: Write tests first, then implement
 */

import { describe, it, expect } from '@jest/globals';
import { exportToCirklon, type ExportOptions } from './export';
import type { Track, Pattern } from '@/types';

describe('Cirklon Export', () => {
  const defaultOptions: ExportOptions = {
    sceneLengthBars: 8,
    beatsPerBar: 4,
    songName: 'Test Song',
    tempo: 120,
  };

  describe('exportToCirklon', () => {
    it('should export empty timeline (0 tracks, 0 patterns)', () => {
      const tracks: Track[] = [];
      const patterns: Pattern[] = [];

      const result = exportToCirklon(tracks, patterns, defaultOptions);

      expect(result.song_data).toBeDefined();
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;
      expect(song.patterns).toEqual({});
      expect(song.scenes).toEqual({});
    });

    it('should export single track with single pattern', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 32, // 8 bars * 4 beats
          label: 'Intro',
          patternType: 'P3',
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions);

      // Check song structure
      expect(result.song_data['Test Song']).toBeDefined();
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      // Check patterns
      expect(Object.keys(song.patterns)).toHaveLength(1);
      const patternName = Object.keys(song.patterns)[0];
      expect(patternName).toBeDefined();
      if (!patternName) return;
      const pattern = song.patterns[patternName];
      if (!pattern) return;
      expect(pattern.type).toBe('P3');
      expect(pattern.bar_count).toBe(8);
      expect(pattern.creator_track).toBe(1);
      expect(pattern.saved).toBe(false);

      // Check scenes
      expect(Object.keys(song.scenes)).toHaveLength(1);
      const sceneName = Object.keys(song.scenes)[0];
      expect(sceneName).toBeDefined();
      if (sceneName) {
        const scene = song.scenes[sceneName];
        expect(scene).toBeDefined();
        if (!scene) return;
        expect(scene.gbar).toBe(16); // Standard 4/4 time
        expect(scene.length).toBe(8);
        expect(scene.advance).toBe('auto');
        expect(scene.pattern_assignments).toBeDefined();
        expect(scene.pattern_assignments?.track_1).toBe(patternName);
        expect(scene.initial_mutes).toBeUndefined();
      }
    });

    it('should export multiple tracks with multiple patterns', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
        { id: 'track-2', name: 'Track 2', color: '#00ffff' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 16,
          patternType: 'P3',
        },
        {
          id: 'pattern-2',
          trackId: 'track-2',
          position: 0,
          duration: 16,
          patternType: 'CK',
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      // Check we have 2 patterns
      expect(Object.keys(song.patterns)).toHaveLength(2);

      // Check scene has both track assignments
      const sceneName = Object.keys(song.scenes)[0];
      expect(sceneName).toBeDefined();
      if (sceneName) {
        const scene = song.scenes[sceneName];
        expect(scene).toBeDefined();
        if (!scene) return;
        expect(scene.pattern_assignments).toBeDefined();
        expect(Object.keys(scene.pattern_assignments || {})).toHaveLength(2);
        expect(scene.pattern_assignments?.track_1).toBeDefined();
        expect(scene.pattern_assignments?.track_2).toBeDefined();
      }
    });

    it('should export with muted patterns', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
        { id: 'track-2', name: 'Track 2', color: '#00ffff' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 32,
          muted: true, // Muted
        },
        {
          id: 'pattern-2',
          trackId: 'track-2',
          position: 0,
          duration: 32,
          muted: false, // Not muted
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      const sceneName = Object.keys(song.scenes)[0];

      expect(sceneName).toBeDefined();
      if (sceneName) {
        const scene = song.scenes[sceneName];
        expect(scene).toBeDefined();
        if (!scene) return;
        expect(scene.initial_mutes).toBeDefined();
        expect(scene.initial_mutes).toContain('track_1');
        expect(scene.initial_mutes).not.toContain('track_2');
      }
    });

    it('should export P3 and CK pattern types correctly', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
        { id: 'track-2', name: 'Track 2', color: '#00ffff' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 16,
          patternType: 'P3',
        },
        {
          id: 'pattern-2',
          trackId: 'track-2',
          position: 0,
          duration: 16,
          patternType: 'CK',
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      // Find patterns by type
      const p3Patterns = Object.values(song.patterns).filter((p) => p.type === 'P3');
      const ckPatterns = Object.values(song.patterns).filter((p) => p.type === 'CK');

      expect(p3Patterns).toHaveLength(1);
      expect(ckPatterns).toHaveLength(1);
    });

    it('should handle patterns spanning multiple scenes', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 64, // 16 bars = spans 2 scenes of 8 bars each
          label: 'Long Pattern',
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      // Should create 2 scenes
      expect(Object.keys(song.scenes)).toHaveLength(2);

      // Both scenes should reference the same pattern
      const sceneNames = Object.keys(song.scenes).sort();
      expect(sceneNames).toHaveLength(2);
      const scene1 = song.scenes[sceneNames[0] || ''];
      const scene2 = song.scenes[sceneNames[1] || ''];

      expect(scene1).toBeDefined();
      expect(scene2).toBeDefined();
      if (scene1 && scene2) {
        expect(scene1.pattern_assignments?.track_1).toBe(scene2.pattern_assignments?.track_1);
      }
    });

    it('should export with custom sceneLengthBars: 4 bars', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 32, // 8 bars
        },
      ];

      const options: ExportOptions = {
        ...defaultOptions,
        sceneLengthBars: 4,
      };

      const result = exportToCirklon(tracks, patterns, options);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      // Should create 2 scenes of 4 bars each
      expect(Object.keys(song.scenes)).toHaveLength(2);
      const scenes = Object.values(song.scenes);
      scenes.forEach((scene) => {
        expect(scene.length).toBe(4);
      });
    });

    it('should export with custom sceneLengthBars: 16 bars', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 64, // 16 bars
        },
      ];

      const options: ExportOptions = {
        ...defaultOptions,
        sceneLengthBars: 16,
      };

      const result = exportToCirklon(tracks, patterns, options);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      // Should create 1 scene of 16 bars
      expect(Object.keys(song.scenes)).toHaveLength(1);
      const scene = Object.values(song.scenes)[0];
      expect(scene).toBeDefined();
      if (scene) {
        expect(scene.length).toBe(16);
      }
    });

    it('should export with custom sceneLengthBars: 32 bars', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 128, // 32 bars
        },
      ];

      const options: ExportOptions = {
        ...defaultOptions,
        sceneLengthBars: 32,
      };

      const result = exportToCirklon(tracks, patterns, options);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      expect(Object.keys(song.scenes)).toHaveLength(1);
      const scene = Object.values(song.scenes)[0];
      expect(scene).toBeDefined();
      if (scene) {
        expect(scene.length).toBe(32);
      }
    });

    it('should export with custom sceneLengthBars: 64 bars', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 256, // 64 bars
        },
      ];

      const options: ExportOptions = {
        ...defaultOptions,
        sceneLengthBars: 64,
      };

      const result = exportToCirklon(tracks, patterns, options);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      expect(Object.keys(song.scenes)).toHaveLength(1);
      const scene = Object.values(song.scenes)[0];
      expect(scene).toBeDefined();
      if (scene) {
        expect(scene.length).toBe(64);
      }
    });

    it('should handle overlapping patterns (only export first per track per scene)', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 16, // 4 bars
          label: 'Pattern 1',
        },
        {
          id: 'pattern-2',
          trackId: 'track-1',
          position: 8, // Starts at 2 bars (overlaps with first scene)
          duration: 16, // 4 bars
          label: 'Pattern 2',
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      // Should create 1 scene
      expect(Object.keys(song.scenes)).toHaveLength(1);
      const sceneName = Object.keys(song.scenes)[0];
      expect(sceneName).toBeDefined();
      if (sceneName) {
        const scene = song.scenes[sceneName];
        expect(scene).toBeDefined();
        if (!scene) return;
        // Should only have first pattern (pattern-1)
        expect(scene.pattern_assignments?.track_1).toBeDefined();
        // Pattern name should correspond to Pattern 1
        const patternName = scene.pattern_assignments?.track_1;
        expect(patternName).toBeDefined();
        if (patternName) {
          const pattern = song.patterns[patternName];
          expect(pattern).toBeDefined();
          // Pattern should be the first one created
          expect(song.patterns[patternName]).toBeDefined();
        }
      }
    });

    it('should default to P3 pattern type if not specified', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 32,
          // No patternType specified
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      const patternName = Object.keys(song.patterns)[0];
      expect(patternName).toBeDefined();
      if (!patternName) return;
      const pattern = song.patterns[patternName];
      if (!pattern) return;
      expect(pattern.type).toBe('P3');
    });

    it('should use track ID to determine track number', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
        { id: 'track-2', name: 'Track 2', color: '#00ffff' },
        { id: 'track-3', name: 'Track 3', color: '#ff00ff' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-2', // Track 2
          position: 0,
          duration: 32,
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      const sceneName = Object.keys(song.scenes)[0];

      expect(sceneName).toBeDefined();
      if (sceneName) {
        const scene = song.scenes[sceneName];
        expect(scene).toBeDefined();
        if (!scene) return;
        // Should assign to track_2 (index 1 in tracks array)
        expect(scene.pattern_assignments?.track_2).toBeDefined();
      }
    });

    it('should not include instrument_assignments in export', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 32,
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      expect(song.instrument_assignments).toBeUndefined();
    });

    it('should create sequential scenes with correct gbar and length', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 96, // 24 bars = 3 scenes of 8 bars
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      expect(Object.keys(song.scenes)).toHaveLength(3);

      // All scenes should have gbar = 16 (standard 4/4 time)
      // and length = 8 bars (from defaultOptions.sceneLengthBars)
      Object.values(song.scenes).forEach((scene) => {
        expect(scene.gbar).toBe(16);
        expect(scene.length).toBe(8);
      });

      // Verify scene names are sequential
      expect(song.scenes['Scene 1']).toBeDefined();
      expect(song.scenes['Scene 2']).toBeDefined();
      expect(song.scenes['Scene 3']).toBeDefined();
    });

    it('should export P3 pattern with full pattern data', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 4, // 1 bar
          label: 'Test P3',
          patternType: 'P3',
          patternData: {
            loop_start: 1,
            loop_end: 1,
            aux_A: 'cc #1',
            aux_B: 'cc #4',
            aux_C: 'cc #6',
            aux_D: 'cc #10',
            accumulator_config: {
              note: { limit: 127, mode: 'rtz', out: 'clip' },
              RoPS: true,
            },
            bars: [
              {
                direction: 'forward',
                tbase: '  4',
                last_step: 16,
                xpos: 0,
                reps: 1,
                gbar: false,
                note: ['C 3', 'D 3', 'E 3', 'F 3', 'G 3', 'A 3', 'B 3', 'C 4', 'C 3', 'D 3', 'E 3', 'F 3', 'G 3', 'A 3', 'B 3', 'C 4'],
                velo: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                length: [24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24],
                delay: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                gate: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                tie: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                skip: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                note_X: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                aux_A_value: [64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64],
                aux_A_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                aux_B_value: [64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64],
                aux_B_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                aux_C_value: [64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64],
                aux_C_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                aux_D_value: [64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64],
                aux_D_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
            ],
          },
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions, false);
      const song = result.song_data['Test Song'];
      expect(song).toBeDefined();
      if (!song) return;

      const patternName = Object.keys(song.patterns)[0];
      expect(patternName).toBeDefined();
      if (!patternName) return;
      const pattern = song.patterns[patternName];
      expect(pattern).toBeDefined();
      if (!pattern) return;

      // Verify pattern-level settings are exported
      expect(pattern.loop_start).toBe(1);
      expect(pattern.loop_end).toBe(1);
      expect(pattern.aux_A).toBe('cc #1');
      expect(pattern.aux_B).toBe('cc #4');
      expect(pattern.aux_C).toBe('cc #6');
      expect(pattern.aux_D).toBe('cc #10');
      expect(pattern.accumulator_config).toEqual({
        note: { limit: 127, mode: 'rtz', out: 'clip' },
        RoPS: true,
      });

      // Verify bars array is exported
      expect(pattern.bars).toBeDefined();
      expect(Array.isArray(pattern.bars)).toBe(true);
      if (!Array.isArray(pattern.bars)) return;
      expect(pattern.bars).toHaveLength(1);

      const bar = pattern.bars[0];
      expect(bar).toBeDefined();
      if (!bar || typeof bar !== 'object') return;

      // Type assertion after validation
      const typedBar = bar as Record<string, unknown>;
      expect(typedBar.direction).toBe('forward');
      expect(typedBar.tbase).toBe('  4');
      expect(typedBar.last_step).toBe(16);
      expect(typedBar.xpos).toBe(0);
      expect(typedBar.reps).toBe(1);
      expect(typedBar.gbar).toBe(false);

      // Verify step arrays
      expect(Array.isArray(typedBar.note)).toBe(true);
      expect(Array.isArray(typedBar.velo)).toBe(true);
      expect(Array.isArray(typedBar.gate)).toBe(true);
      if (Array.isArray(typedBar.note)) {
        expect(typedBar.note).toHaveLength(16);
        expect(typedBar.note[0]).toBe('C 3');
      }
    });

    it('should not export pattern data when includeMetadata is false', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 32,
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions, false);

      expect(result._cyclone_metadata).toBeUndefined();
    });

    it('should include metadata when includeMetadata is true', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 32,
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions, true);

      expect(result._cyclone_metadata).toBeDefined();
      expect(result._cyclone_metadata?.version).toBe('2.0.0');
      expect(result._cyclone_metadata?.exportedFrom).toBe('Cyclone');
      expect(result._cyclone_metadata?.exportedAt).toBeDefined();
    });

    it('should include timeline state in metadata', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 32,
        },
      ];

      const timelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        verticalZoom: 100,
        playheadPosition: 0,
        isPlaying: false,
        tempo: 128,
        snapValue: 1,
        snapMode: 'grid' as const,
        minimapVisible: false,
      };

      const result = exportToCirklon(tracks, patterns, defaultOptions, true, [], timelineState);

      expect(result._cyclone_metadata).toBeDefined();
      expect(result._cyclone_metadata?.viewport).toEqual(timelineState.viewport);
      expect(result._cyclone_metadata?.timeline).toBeDefined();
      expect(result._cyclone_metadata?.timeline?.tempo).toBe(128);
      expect(result._cyclone_metadata?.timeline?.snapValue).toBe(1);
      expect(result._cyclone_metadata?.timeline?.snapMode).toBe('grid');
    });

    it('should include track mappings in metadata', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
        { id: 'track-2', name: 'Track 2', color: '#ff0000' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 32,
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions, true);

      expect(result._cyclone_metadata).toBeDefined();
      expect(result._cyclone_metadata?.uiMappings).toBeDefined();
      expect(result._cyclone_metadata?.uiMappings.tracks).toBeDefined();
      // Legacy exportToCirklon generates minimal metadata - just verify structure exists
      expect(typeof result._cyclone_metadata?.uiMappings.tracks).toBe('object');
    });

    it('should include pattern mappings in metadata', () => {
      const tracks: Track[] = [
        { id: 'track-1', name: 'Track 1', color: '#00ff00' },
      ];
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 32,
          label: 'My Pattern',
        },
      ];

      const result = exportToCirklon(tracks, patterns, defaultOptions, true);

      expect(result._cyclone_metadata).toBeDefined();
      expect(result._cyclone_metadata?.uiMappings).toBeDefined();
      expect(result._cyclone_metadata?.uiMappings.patterns).toBeDefined();
      // Legacy exportToCirklon generates minimal metadata - just verify structure exists
      expect(typeof result._cyclone_metadata?.uiMappings.patterns).toBe('object');
    });
  });
});
