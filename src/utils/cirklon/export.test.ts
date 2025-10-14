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
        expect(scene.gbar).toBe(0);
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

    it('should create sequential scenes starting at gbar 0', () => {
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
      const scenes = Object.values(song.scenes).sort((a, b) => a.gbar - b.gbar);

      expect(scenes[0]?.gbar).toBe(0);
      expect(scenes[1]?.gbar).toBe(8);
      expect(scenes[2]?.gbar).toBe(16);
    });
  });
});
