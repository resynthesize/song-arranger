/**
 * Cyclone - CKS Round-Trip Tests
 * Critical tests to ensure lossless import/export with CKS-native architecture
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { parseCKSFile } from './import';
import { exportCKSData, exportToCleanCKS } from './export';
import type { CirklonSongData } from './types';

/**
 * Deep equality comparison helper that ignores key ordering
 */
function deepEqualIgnoreOrder(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => deepEqualIgnoreOrder(val, b[idx]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as object).sort();
    const bKeys = Object.keys(b as object).sort();

    if (aKeys.length !== bKeys.length) return false;
    if (!aKeys.every((key, idx) => key === bKeys[idx])) return false;

    return aKeys.every(key =>
      deepEqualIgnoreOrder((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    );
  }

  return false;
}

describe('CKS Round-Trip Tests (Critical)', () => {
  // Load real CKS files for testing
  const xtlovePath = path.join(__dirname, '../../../cirklon/xtlove.CKS');
  const song20Path = path.join(__dirname, '../../../cirklon/song20.CKS');

  describe('Lossless Import/Export (No Changes)', () => {
    it('should produce identical CKS file after import → export (xtlove.CKS)', () => {
      // Read original file
      const originalContent = fs.readFileSync(xtlovePath, 'utf-8');
      const originalData = JSON.parse(originalContent);

      // Import (adds _cyclone_metadata)
      const importedData = parseCKSFile(originalContent);

      // Verify metadata was added
      expect(importedData._cyclone_metadata).toBeDefined();

      // Export (strips _cyclone_metadata)
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent);

      // Verify metadata was removed
      expect(exportedData._cyclone_metadata).toBeUndefined();

      // Compare: exported should equal original (ignoring key order)
      expect(deepEqualIgnoreOrder(exportedData, originalData)).toBe(true);

      // Also verify JSON strings are identical (character-by-character)
      // Note: This may fail if JSON formatting differs, but data should be identical
      const normalizedOriginal = JSON.stringify(originalData, null, '\t');
      const normalizedExported = JSON.stringify(exportedData, null, '\t');
      expect(normalizedExported).toBe(normalizedOriginal);
    });

    it('should produce identical CKS file after import → export (song20.CKS)', () => {
      const originalContent = fs.readFileSync(song20Path, 'utf-8');
      const originalData = JSON.parse(originalContent);

      const importedData = parseCKSFile(originalContent);
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent);

      expect(deepEqualIgnoreOrder(exportedData, originalData)).toBe(true);
    });

    it('should preserve all CKS fields through round-trip', () => {
      const originalContent = fs.readFileSync(xtlovePath, 'utf-8');
      const originalData = JSON.parse(originalContent) as CirklonSongData;

      const importedData = parseCKSFile(originalContent);
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent) as CirklonSongData;

      // Verify song_data structure
      expect(Object.keys(exportedData.song_data)).toEqual(Object.keys(originalData.song_data));

      const songName = Object.keys(originalData.song_data)[0];
      if (!songName) throw new Error('No song found');

      const originalSong = originalData.song_data[songName];
      const exportedSong = exportedData.song_data[songName];

      if (!originalSong || !exportedSong) throw new Error('Song not found');

      // Verify instrument_assignments preserved
      expect(exportedSong.instrument_assignments).toEqual(originalSong.instrument_assignments);

      // Verify all patterns preserved
      expect(Object.keys(exportedSong.patterns).sort()).toEqual(
        Object.keys(originalSong.patterns).sort()
      );

      // Verify all scenes preserved (excluding workscene which might be modified)
      const originalScenes = Object.keys(originalSong.scenes).filter(s => s !== 'workscene').sort();
      const exportedScenes = Object.keys(exportedSong.scenes).filter(s => s !== 'workscene').sort();
      expect(exportedScenes).toEqual(originalScenes);
    });

    it('should preserve pattern fields exactly (including bars, aux, accumulator_config)', () => {
      const originalContent = fs.readFileSync(xtlovePath, 'utf-8');
      const originalData = JSON.parse(originalContent) as CirklonSongData;

      const importedData = parseCKSFile(originalContent);
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent) as CirklonSongData;

      const songName = Object.keys(originalData.song_data)[0];
      if (!songName) throw new Error('No song found');

      const originalSong = originalData.song_data[songName];
      const exportedSong = exportedData.song_data[songName];

      if (!originalSong || !exportedSong) throw new Error('Song not found');

      // Test a specific pattern with full data
      const patternName = 'Trk9 P1';
      const originalPattern = originalSong.patterns[patternName];
      const exportedPattern = exportedSong.patterns[patternName];

      expect(originalPattern).toBeDefined();
      expect(exportedPattern).toBeDefined();
      if (!originalPattern || !exportedPattern) return;

      // Verify all pattern-level fields
      expect(exportedPattern.type).toBe(originalPattern.type);
      expect(exportedPattern.creator_track).toBe(originalPattern.creator_track);
      expect(exportedPattern.saved).toBe(originalPattern.saved);
      expect(exportedPattern.bar_count).toBe(originalPattern.bar_count);
      expect(exportedPattern.loop_start).toBe(originalPattern.loop_start);
      expect(exportedPattern.loop_end).toBe(originalPattern.loop_end);
      expect(exportedPattern.aux_A).toBe(originalPattern.aux_A);
      expect(exportedPattern.aux_B).toBe(originalPattern.aux_B);
      expect(exportedPattern.aux_C).toBe(originalPattern.aux_C);
      expect(exportedPattern.aux_D).toBe(originalPattern.aux_D);

      // Verify accumulator_config
      expect(exportedPattern.accumulator_config).toEqual(originalPattern.accumulator_config);

      // Verify bars array
      expect(exportedPattern.bars).toEqual(originalPattern.bars);
    });

    it('should preserve scene fields exactly (including FTS, xpos, initial_mutes)', () => {
      const originalContent = fs.readFileSync(xtlovePath, 'utf-8');
      const originalData = JSON.parse(originalContent) as CirklonSongData;

      const importedData = parseCKSFile(originalContent);
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent) as CirklonSongData;

      const songName = Object.keys(originalData.song_data)[0];
      if (!songName) throw new Error('No song found');

      const originalSong = originalData.song_data[songName];
      const exportedSong = exportedData.song_data[songName];

      if (!originalSong || !exportedSong) throw new Error('Song not found');

      // Test first non-workscene scene
      const sceneNames = Object.keys(originalSong.scenes).filter(s => s !== 'workscene');
      const sceneName = sceneNames[0];
      if (!sceneName) return;

      const originalScene = originalSong.scenes[sceneName];
      const exportedScene = exportedSong.scenes[sceneName];

      expect(originalScene).toBeDefined();
      expect(exportedScene).toBeDefined();
      if (!originalScene || !exportedScene) return;

      // Verify all scene fields
      expect(exportedScene.gbar).toBe(originalScene.gbar);
      expect(exportedScene.length).toBe(originalScene.length);
      expect(exportedScene.advance).toBe(originalScene.advance);
      expect(exportedScene.pattern_assignments).toEqual(originalScene.pattern_assignments);
      expect(exportedScene.initial_mutes).toEqual(originalScene.initial_mutes);

      // Verify FTS fields if present
      if ('FTS_root' in originalScene) {
        expect(exportedScene.FTS_root).toBe(originalScene.FTS_root);
      }
      if ('FTS_scale' in originalScene) {
        expect(exportedScene.FTS_scale).toBe(originalScene.FTS_scale);
      }
      if ('xpos' in originalScene) {
        expect(exportedScene.xpos).toBe(originalScene.xpos);
      }
      if ('xpos_fts' in originalScene) {
        expect(exportedScene.xpos_fts).toBe(originalScene.xpos_fts);
      }
    });
  });

  describe('Selective Changes (Minimal Diff)', () => {
    it('should only modify changed pattern in export', () => {
      const originalContent = fs.readFileSync(song20Path, 'utf-8');
      const originalData = JSON.parse(originalContent) as CirklonSongData;

      // Import
      const importedData = parseCKSFile(originalContent);

      // Modify ONE pattern
      const songName = importedData._cyclone_metadata?.currentSongName;
      if (!songName) throw new Error('No current song');

      const song = importedData.song_data[songName];
      if (!song) throw new Error('Song not found');

      const patternName = Object.keys(song.patterns)[0];
      if (!patternName) throw new Error('No patterns found');

      // Change pattern bar_count
      const originalPattern = song.patterns[patternName];
      if (!originalPattern) throw new Error('Pattern not found');
      const originalBarCount = originalPattern.bar_count;

      song.patterns[patternName] = {
        ...originalPattern,
        bar_count: (originalBarCount || 1) + 1, // Increment bar count
      };

      // Export
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent) as CirklonSongData;

      // Verify: Only the modified pattern should differ
      const exportedSong = exportedData.song_data[songName];
      if (!exportedSong) throw new Error('Exported song not found');

      const exportedPattern = exportedSong.patterns[patternName];
      if (!exportedPattern) throw new Error('Exported pattern not found');

      // Verify the pattern was modified
      expect(exportedPattern.bar_count).toBe((originalBarCount || 1) + 1);

      // Verify all other patterns are unchanged
      const otherPatternNames = Object.keys(song.patterns).filter(n => n !== patternName);
      otherPatternNames.forEach(name => {
        const origPattern = originalData.song_data[songName]?.patterns[name];
        const expPattern = exportedSong.patterns[name];
        expect(expPattern).toEqual(origPattern);
      });

      // Verify scenes unchanged
      expect(exportedSong.scenes).toEqual(originalData.song_data[songName]?.scenes);

      // Verify instrument_assignments unchanged
      expect(exportedSong.instrument_assignments).toEqual(
        originalData.song_data[songName]?.instrument_assignments
      );
    });

    it('should only modify changed scene in export', () => {
      const originalContent = fs.readFileSync(song20Path, 'utf-8');
      const originalData = JSON.parse(originalContent) as CirklonSongData;

      // Import
      const importedData = parseCKSFile(originalContent);

      // Modify ONE scene
      const songName = importedData._cyclone_metadata?.currentSongName;
      if (!songName) throw new Error('No current song');

      const song = importedData.song_data[songName];
      if (!song) throw new Error('Song not found');

      const sceneNames = Object.keys(song.scenes).filter(s => s !== 'workscene');
      const sceneName = sceneNames[0];
      if (!sceneName) throw new Error('No scenes found');

      // Change scene length
      const originalScene = song.scenes[sceneName];
      if (!originalScene) throw new Error('Scene not found');
      const originalLength = originalScene.length;

      song.scenes[sceneName] = {
        ...originalScene,
        length: originalLength + 1, // Increment length
      };

      // Export
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent) as CirklonSongData;

      // Verify: Only the modified scene should differ
      const exportedSong = exportedData.song_data[songName];
      if (!exportedSong) throw new Error('Exported song not found');

      const exportedScene = exportedSong.scenes[sceneName];
      if (!exportedScene) throw new Error('Exported scene not found');

      // Verify the scene was modified
      expect(exportedScene.length).toBe(originalLength + 1);

      // Verify all other scenes are unchanged
      const otherSceneNames = Object.keys(song.scenes).filter(n => n !== sceneName);
      otherSceneNames.forEach(name => {
        const origScene = originalData.song_data[songName]?.scenes[name];
        const expScene = exportedSong.scenes[name];
        expect(expScene).toEqual(origScene);
      });

      // Verify patterns unchanged
      expect(exportedSong.patterns).toEqual(originalData.song_data[songName]?.patterns);
    });

    it('should preserve instrument_assignments when adding/removing patterns', () => {
      const originalContent = fs.readFileSync(xtlovePath, 'utf-8');
      const originalData = JSON.parse(originalContent) as CirklonSongData;

      // Import
      const importedData = parseCKSFile(originalContent);

      const songName = importedData._cyclone_metadata?.currentSongName;
      if (!songName) throw new Error('No current song');

      const song = importedData.song_data[songName];
      if (!song) throw new Error('Song not found');

      // Add a new pattern
      song.patterns['NewTestPattern'] = {
        type: 'P3',
        creator_track: 1,
        saved: false,
        bar_count: 4,
      };

      // Export
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent) as CirklonSongData;

      const exportedSong = exportedData.song_data[songName];
      if (!exportedSong) throw new Error('Exported song not found');

      // Verify instrument_assignments unchanged
      expect(exportedSong.instrument_assignments).toEqual(
        originalData.song_data[songName]?.instrument_assignments
      );

      // Verify new pattern exists
      expect(exportedSong.patterns['NewTestPattern']).toBeDefined();
    });

    it('should handle adding new scenes without affecting existing data', () => {
      const originalContent = fs.readFileSync(song20Path, 'utf-8');
      const originalData = JSON.parse(originalContent) as CirklonSongData;

      // Import
      const importedData = parseCKSFile(originalContent);

      const songName = importedData._cyclone_metadata?.currentSongName;
      if (!songName) throw new Error('No current song');

      const song = importedData.song_data[songName];
      if (!song) throw new Error('Song not found');

      // Add a new scene
      song.scenes['NewTestScene'] = {
        gbar: 100,
        length: 8,
        advance: 'auto',
        pattern_assignments: {},
      };

      // Export
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent) as CirklonSongData;

      const exportedSong = exportedData.song_data[songName];
      if (!exportedSong) throw new Error('Exported song not found');

      // Verify new scene exists
      expect(exportedSong.scenes['NewTestScene']).toBeDefined();

      // Verify all original scenes unchanged
      const originalSceneNames = Object.keys(originalData.song_data[songName]?.scenes || {});
      originalSceneNames.forEach(name => {
        const origScene = originalData.song_data[songName]?.scenes[name];
        const expScene = exportedSong.scenes[name];
        expect(expScene).toEqual(origScene);
      });

      // Verify patterns unchanged
      expect(exportedSong.patterns).toEqual(originalData.song_data[songName]?.patterns);
    });

    it('should handle removing patterns without affecting other data', () => {
      const originalContent = fs.readFileSync(xtlovePath, 'utf-8');
      const originalData = JSON.parse(originalContent) as CirklonSongData;

      // Import
      const importedData = parseCKSFile(originalContent);

      const songName = importedData._cyclone_metadata?.currentSongName;
      if (!songName) throw new Error('No current song');

      const song = importedData.song_data[songName];
      if (!song) throw new Error('Song not found');

      // Remove a pattern
      const patternNames = Object.keys(song.patterns);
      const patternToRemove = patternNames[0];
      if (!patternToRemove) throw new Error('No patterns to remove');

      delete song.patterns[patternToRemove];

      // Export
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent) as CirklonSongData;

      const exportedSong = exportedData.song_data[songName];
      if (!exportedSong) throw new Error('Exported song not found');

      // Verify pattern was removed
      expect(exportedSong.patterns[patternToRemove]).toBeUndefined();

      // Verify all other patterns unchanged
      const remainingPatternNames = patternNames.filter(n => n !== patternToRemove);
      remainingPatternNames.forEach(name => {
        const origPattern = originalData.song_data[songName]?.patterns[name];
        const expPattern = exportedSong.patterns[name];
        expect(expPattern).toEqual(origPattern);
      });

      // Verify scenes unchanged
      expect(exportedSong.scenes).toEqual(originalData.song_data[songName]?.scenes);
    });
  });

  describe('Metadata Handling', () => {
    it('should strip _cyclone_metadata on export by default', () => {
      const originalContent = fs.readFileSync(song20Path, 'utf-8');
      const importedData = parseCKSFile(originalContent);

      // Verify metadata exists after import
      expect(importedData._cyclone_metadata).toBeDefined();

      // Export
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent);

      // Verify metadata removed
      expect(exportedData._cyclone_metadata).toBeUndefined();
    });

    it('should optionally include metadata in export', () => {
      const originalContent = fs.readFileSync(song20Path, 'utf-8');
      const importedData = parseCKSFile(originalContent);

      // Export with metadata
      const exportedContent = exportCKSData(importedData, true);
      const exportedData = JSON.parse(exportedContent);

      // Verify metadata included
      expect(exportedData._cyclone_metadata).toBeDefined();
      expect(exportedData._cyclone_metadata).toEqual(importedData._cyclone_metadata);
    });

    it('should preserve UI mappings in metadata when exporting with metadata', () => {
      const originalContent = fs.readFileSync(xtlovePath, 'utf-8');
      const importedData = parseCKSFile(originalContent);

      // Export with metadata
      const exportedContent = exportCKSData(importedData, true);
      const exportedData = JSON.parse(exportedContent) as CirklonSongData;

      // Verify UI mappings preserved
      expect(exportedData._cyclone_metadata?.uiMappings).toBeDefined();
      expect(exportedData._cyclone_metadata?.uiMappings.patterns).toBeDefined();
      expect(exportedData._cyclone_metadata?.uiMappings.tracks).toBeDefined();
      expect(exportedData._cyclone_metadata?.uiMappings.scenes).toBeDefined();

      // Verify mappings have entries
      const patternMappings = Object.keys(exportedData._cyclone_metadata?.uiMappings.patterns || {});
      const trackMappings = Object.keys(exportedData._cyclone_metadata?.uiMappings.tracks || {});
      const sceneMappings = Object.keys(exportedData._cyclone_metadata?.uiMappings.scenes || {});

      expect(patternMappings.length).toBeGreaterThan(0);
      expect(trackMappings.length).toBeGreaterThan(0);
      expect(sceneMappings.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty patterns object', () => {
      const minimalCKS = {
        song_data: {
          'Empty Song': {
            patterns: {},
            scenes: {},
          },
        },
      };

      const importedData = parseCKSFile(JSON.stringify(minimalCKS));
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent);

      expect(exportedData.song_data['Empty Song'].patterns).toEqual({});
      expect(exportedData.song_data['Empty Song'].scenes).toEqual({});
    });

    it('should handle patterns without bars array', () => {
      const cksWithCKPattern = {
        song_data: {
          'Test Song': {
            patterns: {
              'CK Pattern': {
                type: 'CK' as const,
                creator_track: 1,
                saved: true,
                last_step: 64,
              },
            },
            scenes: {},
          },
        },
      };

      const importedData = parseCKSFile(JSON.stringify(cksWithCKPattern));
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent);

      const exportedPattern = exportedData.song_data['Test Song'].patterns['CK Pattern'];
      expect(exportedPattern.type).toBe('CK');
      expect(exportedPattern.last_step).toBe(64);
      expect(exportedPattern.bars).toBeUndefined();
    });

    it('should preserve unknown/future CKS fields', () => {
      const cksWithUnknownFields = {
        song_data: {
          'Test Song': {
            patterns: {
              'Test Pattern': {
                type: 'P3' as const,
                creator_track: 1,
                saved: true,
                bar_count: 1,
                // Unknown future field
                future_field_v2: 'some value',
                nested_unknown: {
                  deep: {
                    field: 123,
                  },
                },
              },
            },
            scenes: {},
            // Unknown song-level field
            unknown_song_field: 'preserve me',
          },
        },
        // Unknown root-level field
        unknown_root_field: 'also preserve me',
      };

      const importedData = parseCKSFile(JSON.stringify(cksWithUnknownFields));
      const exportedContent = exportToCleanCKS(importedData);
      const exportedData = JSON.parse(exportedContent) as Record<string, unknown>;

      // Verify unknown fields preserved
      const exportedSong = (exportedData.song_data as Record<string, Record<string, unknown>>)['Test Song'];
      const exportedPattern = (exportedSong.patterns as Record<string, Record<string, unknown>>)['Test Pattern'];

      expect(exportedPattern.future_field_v2).toBe('some value');
      expect(exportedPattern.nested_unknown).toEqual({ deep: { field: 123 } });
      expect(exportedSong.unknown_song_field).toBe('preserve me');
      expect(exportedData.unknown_root_field).toBe('also preserve me');
    });
  });
});
