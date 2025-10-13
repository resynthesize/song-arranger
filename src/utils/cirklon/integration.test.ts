/**
 * Song Arranger - Cirklon Integration Tests
 * Real-world test with xtlove.CKS file
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { parseCKSFile, importFromCirklon } from './import';

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
});
