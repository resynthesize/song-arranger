/**
 * Cyclone - Pattern Visualization Tests
 * Tests for pattern visualization utility functions
 */

import {
  extractGatePositions,
  extractVelocityGraph,
  extractDensityHeatmap,
  type GatePosition,
  type VelocityBar,
  type DensityRegion,
} from './patternVisualization';
import type { P3PatternData, P3Bar } from '@/types';

// Helper to create a test bar
const createTestBar = (overrides?: Partial<P3Bar>): P3Bar => ({
  direction: 'forward',
  tbase: ' 16',
  last_step: 16,
  xpos: 0,
  reps: 1,
  gbar: false,
  note: Array(16).fill('C 3'),
  velo: Array(16).fill(100),
  length: Array(16).fill(12),
  delay: Array(16).fill(0),
  aux_A_value: Array(16).fill(0),
  aux_B_value: Array(16).fill(0),
  aux_C_value: Array(16).fill(0),
  aux_D_value: Array(16).fill(0),
  gate: Array(16).fill(0),
  tie: Array(16).fill(0),
  skip: Array(16).fill(0),
  note_X: Array(16).fill(0),
  aux_A_flag: Array(16).fill(0),
  aux_B_flag: Array(16).fill(0),
  aux_C_flag: Array(16).fill(0),
  aux_D_flag: Array(16).fill(0),
  ...overrides,
});

describe('extractGatePositions', () => {
  it('should return empty array for undefined pattern data', () => {
    const result = extractGatePositions(undefined);
    expect(result).toEqual([]);
  });

  it('should return empty array for pattern with no bars', () => {
    const patternData: P3PatternData = { bars: [] };
    const result = extractGatePositions(patternData);
    expect(result).toEqual([]);
  });

  it('should extract gate positions from single bar', () => {
    const bar = createTestBar({
      last_step: 4,
      gate: [1, 0, 1, 0, ...Array(12).fill(0)],
    });

    const patternData: P3PatternData = { bars: [bar] };
    const result = extractGatePositions(patternData);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      percentage: 0,
      barIndex: 0,
      stepIndex: 0,
    });
    expect(result[1]).toEqual({
      percentage: 50,
      barIndex: 0,
      stepIndex: 2,
    });
  });

  it('should extract gate positions from multiple bars', () => {
    const bar1 = createTestBar({
      last_step: 2,
      gate: [1, 1, ...Array(14).fill(0)],
    });

    const bar2 = createTestBar({
      last_step: 2,
      gate: [0, 1, ...Array(14).fill(0)],
    });

    const patternData: P3PatternData = { bars: [bar1, bar2] };
    const result = extractGatePositions(patternData);

    expect(result).toHaveLength(3);
    expect(result[0]?.percentage).toBe(0);
    expect(result[1]?.percentage).toBe(25);
    expect(result[2]?.percentage).toBe(75);
  });

  it('should only count active steps based on last_step', () => {
    const bar = createTestBar({
      last_step: 4, // Only first 4 steps are active
      gate: [1, 1, 1, 1, 1, 1, ...Array(10).fill(0)], // Gates on steps 0-5, but only 0-3 are active
    });

    const patternData: P3PatternData = { bars: [bar] };
    const result = extractGatePositions(patternData);

    // Should only extract first 4 gates (based on last_step)
    expect(result).toHaveLength(4);
  });
});

describe('extractVelocityGraph', () => {
  it('should return empty array for undefined pattern data', () => {
    const result = extractVelocityGraph(undefined);
    expect(result).toEqual([]);
  });

  it('should return empty array for pattern with no bars', () => {
    const patternData: P3PatternData = { bars: [] };
    const result = extractVelocityGraph(patternData);
    expect(result).toEqual([]);
  });

  it('should extract velocity bars from single bar', () => {
    const bar = createTestBar({
      last_step: 4,
      gate: [1, 0, 1, 1, ...Array(12).fill(0)],
      velo: [64, 0, 127, 32, ...Array(12).fill(0)],
    });

    const patternData: P3PatternData = { bars: [bar] };
    const result = extractVelocityGraph(patternData);

    expect(result).toHaveLength(4);

    // First step: gate on, velocity 64
    expect(result[0]).toEqual({
      position: 0,
      height: (64 / 127) * 100,
      isActive: true,
      barIndex: 0,
      stepIndex: 0,
    });

    // Second step: gate off, velocity 0
    expect(result[1]).toEqual({
      position: 25,
      height: 0,
      isActive: false,
      barIndex: 0,
      stepIndex: 1,
    });

    // Third step: gate on, velocity 127 (max)
    expect(result[2]).toEqual({
      position: 50,
      height: 100,
      isActive: true,
      barIndex: 0,
      stepIndex: 2,
    });

    // Fourth step: gate on, velocity 32
    expect(result[3]).toEqual({
      position: 75,
      height: (32 / 127) * 100,
      isActive: true,
      barIndex: 0,
      stepIndex: 3,
    });
  });

  it('should extract velocity bars from multiple bars', () => {
    const bar1 = createTestBar({
      last_step: 2,
      gate: [1, 1, ...Array(14).fill(0)],
      velo: [100, 80, ...Array(14).fill(0)],
    });

    const bar2 = createTestBar({
      last_step: 2,
      gate: [1, 0, ...Array(14).fill(0)],
      velo: [60, 0, ...Array(14).fill(0)],
    });

    const patternData: P3PatternData = { bars: [bar1, bar2] };
    const result = extractVelocityGraph(patternData);

    expect(result).toHaveLength(4);
    expect(result[0]?.isActive).toBe(true);
    expect(result[1]?.isActive).toBe(true);
    expect(result[2]?.isActive).toBe(true);
    expect(result[3]?.isActive).toBe(false);
  });

  it('should handle bars with different last_step values', () => {
    const bar1 = createTestBar({
      last_step: 16,
      gate: Array(16).fill(1),
      velo: Array(16).fill(100),
    });

    const bar2 = createTestBar({
      last_step: 8,
      gate: Array(16).fill(1),
      velo: Array(16).fill(80),
    });

    const patternData: P3PatternData = { bars: [bar1, bar2] };
    const result = extractVelocityGraph(patternData);

    // Total steps: 16 + 8 = 24
    expect(result).toHaveLength(24);

    // First bar should occupy 16/24 of the pattern
    expect(result[0]?.position).toBe(0);
    expect(result[15]?.position).toBeCloseTo((15 / 24) * 100);

    // Second bar should start at 16/24
    expect(result[16]?.position).toBeCloseTo((16 / 24) * 100);
  });

  it('should handle velocity value of 0', () => {
    const bar = createTestBar({
      last_step: 2,
      gate: [1, 1, ...Array(14).fill(0)],
      velo: [0, 0, ...Array(14).fill(0)],
    });

    const patternData: P3PatternData = { bars: [bar] };
    const result = extractVelocityGraph(patternData);

    expect(result[0]?.height).toBe(0);
    expect(result[1]?.height).toBe(0);
  });
});

describe('extractDensityHeatmap', () => {
  it('should return empty array for undefined pattern data', () => {
    const result = extractDensityHeatmap(undefined);
    expect(result).toEqual([]);
  });

  it('should return empty array for pattern with no bars', () => {
    const patternData: P3PatternData = { bars: [] };
    const result = extractDensityHeatmap(patternData);
    expect(result).toEqual([]);
  });

  it('should divide pattern into regions', () => {
    const bar = createTestBar({
      last_step: 16,
      gate: Array(16).fill(1),
      velo: Array(16).fill(100),
    });

    const patternData: P3PatternData = { bars: [bar] };
    const result = extractDensityHeatmap(patternData, 8);

    expect(result).toHaveLength(8);

    // Each region should be 12.5% wide (100 / 8)
    expect(result[0]).toEqual({
      startPercent: 0,
      endPercent: 12.5,
      density: 1, // All gates active
      avgVelocity: 100,
    });

    expect(result[7]).toEqual({
      startPercent: 87.5,
      endPercent: 100,
      density: 1,
      avgVelocity: 100,
    });
  });

  it('should calculate density correctly', () => {
    const bar = createTestBar({
      last_step: 8,
      gate: [1, 1, 0, 0, 1, 1, 0, 0, ...Array(8).fill(0)],
      velo: [100, 80, 0, 0, 60, 40, 0, 0, ...Array(8).fill(0)],
    });

    const patternData: P3PatternData = { bars: [bar] };
    const result = extractDensityHeatmap(patternData, 4);

    expect(result).toHaveLength(4);

    // First region: steps 0-1 (2 steps, 2 active = 100% density)
    expect(result[0]?.density).toBe(1);
    expect(result[0]?.avgVelocity).toBe(90); // (100 + 80) / 2

    // Second region: steps 2-3 (2 steps, 0 active = 0% density)
    expect(result[1]?.density).toBe(0);
    expect(result[1]?.avgVelocity).toBe(0);

    // Third region: steps 4-5 (2 steps, 2 active = 100% density)
    expect(result[2]?.density).toBe(1);
    expect(result[2]?.avgVelocity).toBe(50); // (60 + 40) / 2

    // Fourth region: steps 6-7 (2 steps, 0 active = 0% density)
    expect(result[3]?.density).toBe(0);
    expect(result[3]?.avgVelocity).toBe(0);
  });

  it('should handle partial density', () => {
    const bar = createTestBar({
      last_step: 8,
      gate: [1, 0, 1, 0, 1, 0, 1, 0, ...Array(8).fill(0)],
      velo: [100, 0, 100, 0, 100, 0, 100, 0, ...Array(8).fill(0)],
    });

    const patternData: P3PatternData = { bars: [bar] };
    const result = extractDensityHeatmap(patternData, 4);

    // Each region has 2 steps, 1 active = 50% density
    result.forEach((region) => {
      expect(region.density).toBe(0.5);
      expect(region.avgVelocity).toBe(100);
    });
  });

  it('should handle different region counts', () => {
    const bar = createTestBar({
      last_step: 16,
      gate: Array(16).fill(1),
      velo: Array(16).fill(100),
    });

    const patternData: P3PatternData = { bars: [bar] };

    // Test with 4 regions
    const result4 = extractDensityHeatmap(patternData, 4);
    expect(result4).toHaveLength(4);
    expect(result4[0]?.endPercent - (result4[0]?.startPercent ?? 0)).toBe(25);

    // Test with 16 regions
    const result16 = extractDensityHeatmap(patternData, 16);
    expect(result16).toHaveLength(16);
    expect(result16[0]?.endPercent - (result16[0]?.startPercent ?? 0)).toBe(6.25);
  });

  it('should handle multiple bars', () => {
    const bar1 = createTestBar({
      last_step: 4,
      gate: [1, 1, 1, 1, ...Array(12).fill(0)],
      velo: [100, 100, 100, 100, ...Array(12).fill(0)],
    });

    const bar2 = createTestBar({
      last_step: 4,
      gate: [0, 0, 0, 0, ...Array(12).fill(0)],
      velo: [0, 0, 0, 0, ...Array(12).fill(0)],
    });

    const patternData: P3PatternData = { bars: [bar1, bar2] };
    const result = extractDensityHeatmap(patternData, 2);

    expect(result).toHaveLength(2);

    // First region: all from bar1 (100% density)
    expect(result[0]?.density).toBe(1);

    // Second region: all from bar2 (0% density)
    expect(result[1]?.density).toBe(0);
  });
});
