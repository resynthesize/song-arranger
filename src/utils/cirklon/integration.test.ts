/**
 * Cyclone - Cirklon Integration Tests
 * Real-world test with xtlove.CKS file and round-trip tests
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { parseCKSFile, importFromCirklon } from './import';
import { exportToCirklon, type ExportOptions } from './export';

describe('Cirklon Integration - xtlove.CKS', () => {
  it('should import xtlove.CKS correctly', () => {
    // Read the actual xtlove.CKS file from the cirklon directory
    const cksPath = path.join(__dirname, '../../../cirklon/xtlove.CKS');
    const cksContent = fs.readFileSync(cksPath, 'utf-8');

    // Parse the file
    const cksData = parseCKSFile(cksContent);
    expect(cksData).toBeDefined();
    expect(cksData.song_data).toBeDefined();

    // Import the data
    const result = importFromCirklon(cksData);

    // Verify basic structure
    expect(result).toBeDefined();
    expect(result.songName).toBe('xt love');
    expect(result.tempo).toBe(120);

    // Verify tracks
    // Based on the file structure, we expect tracks 1-15 (but not all are sequential)
    // Let's verify we have a reasonable number of tracks
    expect(result.tracks.length).toBeGreaterThanOrEqual(10);
    expect(result.tracks.length).toBeLessThanOrEqual(20);

    // Verify we have patterns
    expect(result.patterns.length).toBeGreaterThan(100);

    // Verify some patterns are muted
    const mutedPatterns = result.patterns.filter((p) => p.muted);
    expect(mutedPatterns.length).toBeGreaterThan(0);

    // Verify pattern types
    const p3Patterns = result.patterns.filter((p) => p.patternType === 'P3');
    const ckPatterns = result.patterns.filter((p) => p.patternType === 'CK');
    expect(p3Patterns.length).toBeGreaterThan(0);
    expect(ckPatterns.length).toBeGreaterThan(0);

    // Verify all patterns have valid properties
    result.patterns.forEach((pattern) => {
      expect(pattern.id).toBeDefined();
      expect(pattern.trackId).toBeDefined();
      expect(pattern.position).toBeGreaterThanOrEqual(0);
      expect(pattern.duration).toBeGreaterThan(0);
      expect(pattern.label).toBeDefined();
      expect(pattern.patternType).toMatch(/^(P3|CK)$/);

      // Verify track exists for each pattern
      const track = result.tracks.find((t) => t.id === pattern.trackId);
      expect(track).toBeDefined();
    });

    // Verify all tracks have valid properties
    result.tracks.forEach((track) => {
      expect(track.id).toBeDefined();
      expect(track.name).toMatch(/^Track \d+$/);
      expect(track.color).toBeDefined();
      expect(track.color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    // Log summary for debugging
    console.log('xtlove.CKS Import Summary:');
    console.log(`  Song Name: ${result.songName}`);
    console.log(`  Tracks: ${result.tracks.length}`);
    console.log(`  Patterns: ${result.patterns.length}`);
    console.log(`  Muted Patterns: ${mutedPatterns.length}`);
    console.log(`  P3 Patterns: ${p3Patterns.length}`);
    console.log(`  CK Patterns: ${ckPatterns.length}`);
    console.log(`  Track Names: ${result.tracks.map((t) => t.name).join(', ')}`);
  });

  it('should position patterns correctly across all scenes', () => {
    const cksPath = path.join(__dirname, '../../../cirklon/xtlove.CKS');
    const cksContent = fs.readFileSync(cksPath, 'utf-8');
    const cksData = parseCKSFile(cksContent);
    const result = importFromCirklon(cksData);

    // All patterns should have non-negative positions
    result.patterns.forEach((pattern) => {
      expect(pattern.position).toBeGreaterThanOrEqual(0);
    });

    // Patterns should be sorted by position
    const sortedPatterns = [...result.patterns].sort((a, b) => a.position - b.position);
    expect(sortedPatterns[0]?.position).toBe(0);

    // Check that patterns don't have gaps larger than scene length (8 bars = 32 beats typically)
    for (let i = 1; i < sortedPatterns.length; i++) {
      const prev = sortedPatterns[i - 1];
      const curr = sortedPatterns[i];
      if (prev && curr) {
        const gap = curr.position - prev.position;
        // Gap should be reasonable (multiple scenes could create larger gaps, but not infinite)
        expect(gap).toBeLessThan(1000);
      }
    }
  });

  it('should maintain structure through import → export → import round-trip', () => {
    // Read and import original file
    const cksPath = path.join(__dirname, '../../../cirklon/xtlove.CKS');
    const cksContent = fs.readFileSync(cksPath, 'utf-8');
    const originalCksData = parseCKSFile(cksContent);
    const imported1 = importFromCirklon(originalCksData);

    // Export back to CKS format
    const exportOptions: ExportOptions = {
      sceneLengthBars: 8,
      beatsPerBar: 4,
      songName: imported1.songName,
      tempo: imported1.tempo,
    };
    const exported = exportToCirklon(imported1.tracks, imported1.patterns, exportOptions);

    // Re-import the exported data
    const imported2 = importFromCirklon(exported);

    // Compare track counts
    expect(imported2.tracks.length).toBe(imported1.tracks.length);

    // Compare pattern counts (should be close, might differ slightly due to scene boundaries)
    expect(imported2.patterns.length).toBeGreaterThanOrEqual(imported1.patterns.length * 0.9);
    expect(imported2.patterns.length).toBeLessThanOrEqual(imported1.patterns.length * 1.1);

    // Verify muted patterns are preserved
    const muted1 = imported1.patterns.filter((p) => p.muted).length;
    const muted2 = imported2.patterns.filter((p) => p.muted).length;
    expect(muted2).toBeGreaterThanOrEqual(muted1 * 0.9);
    expect(muted2).toBeLessThanOrEqual(muted1 * 1.1);

    // Verify pattern types are preserved
    const p3Count1 = imported1.patterns.filter((p) => p.patternType === 'P3').length;
    const ckCount1 = imported1.patterns.filter((p) => p.patternType === 'CK').length;
    const p3Count2 = imported2.patterns.filter((p) => p.patternType === 'P3').length;
    const ckCount2 = imported2.patterns.filter((p) => p.patternType === 'CK').length;

    expect(p3Count2).toBeGreaterThanOrEqual(p3Count1 * 0.9);
    expect(ckCount2).toBeGreaterThanOrEqual(ckCount1 * 0.9);

    // Log round-trip summary
    console.log('Round-trip Test Summary:');
    console.log(`  Original tracks: ${imported1.tracks.length}, After round-trip: ${imported2.tracks.length}`);
    console.log(`  Original patterns: ${imported1.patterns.length}, After round-trip: ${imported2.patterns.length}`);
    console.log(`  Original muted: ${muted1}, After round-trip: ${muted2}`);
    console.log(`  Original P3: ${p3Count1}, After round-trip: ${p3Count2}`);
    console.log(`  Original CK: ${ckCount1}, After round-trip: ${ckCount2}`);
  });

  it('should import and preserve P3 pattern data from real CKS file', () => {
    // Read and import xtlove.CKS
    const cksPath = path.join(__dirname, '../../../cirklon/xtlove.CKS');
    const cksContent = fs.readFileSync(cksPath, 'utf-8');
    const cksData = parseCKSFile(cksContent);
    const result = importFromCirklon(cksData);

    // Find P3 patterns with pattern data
    const p3PatternsWithData = result.patterns.filter((p) =>
      p.patternType === 'P3' && p.patternData !== undefined
    );

    // We know "Trk9 P1" exists in the file with full bar data
    // Let's verify at least some P3 patterns have full data
    expect(p3PatternsWithData.length).toBeGreaterThan(0);

    // Check a specific pattern we know has data
    const trk9P1 = result.patterns.find((p) => p.label === 'Trk9 P1');
    expect(trk9P1).toBeDefined();
    if (!trk9P1) return;

    // Verify it has pattern data
    expect(trk9P1.patternData).toBeDefined();
    if (!trk9P1.patternData) return;

    // Verify pattern-level settings from the CKS file
    expect(trk9P1.patternData.loop_start).toBe(1);
    expect(trk9P1.patternData.loop_end).toBe(1);
    expect(trk9P1.patternData.aux_A).toBe('cc #1');
    expect(trk9P1.patternData.aux_B).toBe('cc #4');
    expect(trk9P1.patternData.aux_C).toBe('cc #6');
    expect(trk9P1.patternData.aux_D).toBe('cc #10');

    // Verify accumulator config exists
    expect(trk9P1.patternData.accumulator_config).toBeDefined();

    // Verify bars array
    expect(trk9P1.patternData.bars).toBeDefined();
    expect(trk9P1.patternData.bars.length).toBe(1);

    const bar = trk9P1.patternData.bars[0];
    expect(bar).toBeDefined();
    if (!bar) return;

    // Verify bar properties match the CKS file
    expect(bar.direction).toBe('forward');
    expect(bar.tbase).toBe('  4');
    expect(bar.last_step).toBe(8);
    expect(bar.xpos).toBe(-12);
    expect(bar.reps).toBe(1);
    expect(bar.gbar).toBe(false);

    // Verify step arrays have correct length
    expect(bar.note).toHaveLength(16);
    expect(bar.velo).toHaveLength(16);
    expect(bar.length).toHaveLength(16);
    expect(bar.delay).toHaveLength(16);
    expect(bar.gate).toHaveLength(16);

    // Verify some actual values from the CKS file
    expect(bar.note[0]).toBe('C 3');
    expect(bar.note[2]).toBe('D#5');
    expect(bar.velo[0]).toBe(36);
    expect(bar.velo[1]).toBe(107);
    expect(bar.gate[0]).toBe(1);
    expect(bar.gate[8]).toBe(1);

    // Log summary
    console.log('P3 Pattern Data Import Summary:');
    console.log(`  P3 patterns with data: ${p3PatternsWithData.length}`);
    console.log(`  Total P3 patterns: ${result.patterns.filter((p) => p.patternType === 'P3').length}`);
    console.log(`  Pattern data coverage: ${Math.round(p3PatternsWithData.length / result.patterns.filter((p) => p.patternType === 'P3').length * 100)}%`);
  });
});
