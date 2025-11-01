/**
 * Cyclone - Pattern Visualization Utilities
 * Helper functions for visualizing pattern data in the timeline
 */

import type { P3PatternData } from '@/types';
import { calculateExpandedStepCount, getBarOccurrences } from './cirklon/barRepetitions';

/**
 * Gate position information
 */
export interface GatePosition {
  /** Position as a percentage (0-100) across the total pattern */
  percentage: number;
  /** Bar index (0-based) */
  barIndex: number;
  /** Step index within the bar (0-based) */
  stepIndex: number;
}

/**
 * Velocity bar for waveform visualization
 */
export interface VelocityBar {
  /** Position as a percentage (0-100) across the total pattern */
  position: number;
  /** Height as a percentage (0-100) based on velocity (0-127 mapped to 0-100) */
  height: number;
  /** Whether this step has a gate (is active) */
  isActive: boolean;
  /** Bar index (0-based) */
  barIndex: number;
  /** Step index within the bar (0-based) */
  stepIndex: number;
}

/**
 * Density region for heatmap visualization
 */
export interface DensityRegion {
  /** Start position as percentage (0-100) */
  startPercent: number;
  /** End position as percentage (0-100) */
  endPercent: number;
  /** Density of active steps (0-1) */
  density: number;
  /** Average velocity of active steps (0-127) */
  avgVelocity: number;
}

/**
 * Extract gate positions from P3 pattern data
 * Returns an array of gate positions as percentages (0-100) across the pattern
 * Accounts for bar repetitions (reps field)
 *
 * @param patternData - The P3 pattern data containing bars and gates
 * @returns Array of gate positions with percentage, bar index, and step index
 */
export function extractGatePositions(patternData: P3PatternData | undefined): GatePosition[] {
  if (!patternData || !patternData.bars || patternData.bars.length === 0) {
    return [];
  }

  const gatePositions: GatePosition[] = [];

  // Calculate total number of steps across all bars (accounting for repetitions)
  const totalSteps = calculateExpandedStepCount(patternData);

  if (totalSteps === 0) {
    return [];
  }

  // Get expanded bar occurrences (each bar repeated according to its reps value)
  const barOccurrences = getBarOccurrences(patternData);

  // Iterate through bar occurrences and extract gate positions
  let currentStepIndex = 0;
  for (const occurrence of barOccurrences) {
    const { sourceBarIndex, bar } = occurrence;

    // Iterate through active steps in this bar occurrence
    for (let stepIndex = 0; stepIndex < bar.last_step; stepIndex++) {
      // Check if gate is active (1 = on, 0 = off)
      if (bar.gate[stepIndex] === 1) {
        // Calculate position as percentage
        const percentage = (currentStepIndex / totalSteps) * 100;

        gatePositions.push({
          percentage,
          barIndex: sourceBarIndex,
          stepIndex,
        });
      }

      currentStepIndex++;
    }
  }

  return gatePositions;
}

/**
 * Extract velocity bars for waveform visualization
 * Returns an array of velocity bars showing rhythm and dynamics
 * Accounts for bar repetitions (reps field)
 *
 * @param patternData - The P3 pattern data containing bars, gates, and velocities
 * @returns Array of velocity bars with position, height, and metadata
 */
export function extractVelocityGraph(patternData: P3PatternData | undefined): VelocityBar[] {
  if (!patternData || !patternData.bars || patternData.bars.length === 0) {
    return [];
  }

  const velocityBars: VelocityBar[] = [];

  // Calculate total number of steps across all bars (accounting for repetitions)
  const totalSteps = calculateExpandedStepCount(patternData);

  if (totalSteps === 0) {
    return [];
  }

  // Get expanded bar occurrences (each bar repeated according to its reps value)
  const barOccurrences = getBarOccurrences(patternData);

  // Iterate through bar occurrences and extract velocity information
  let currentStepIndex = 0;
  for (const occurrence of barOccurrences) {
    const { sourceBarIndex, bar } = occurrence;

    // Iterate through active steps in this bar occurrence
    for (let stepIndex = 0; stepIndex < bar.last_step; stepIndex++) {
      // Only show bars for steps with gates
      const hasGate = bar.gate[stepIndex] === 1;

      // Get velocity (0-127), default to 0 if undefined
      const velocity = bar.velo[stepIndex] ?? 0;

      // Calculate position as percentage
      const position = (currentStepIndex / totalSteps) * 100;

      // Calculate height as percentage (map 0-127 to 0-100)
      const height = (velocity / 127) * 100;

      velocityBars.push({
        position,
        height,
        isActive: hasGate,
        barIndex: sourceBarIndex,
        stepIndex,
      });

      currentStepIndex++;
    }
  }

  return velocityBars;
}

/**
 * Extract density heatmap for compact pattern visualization
 * Divides pattern into regions and calculates activity density
 * Accounts for bar repetitions (reps field)
 *
 * @param patternData - The P3 pattern data containing bars and gates
 * @param regions - Number of regions to divide pattern into (default: 8)
 * @returns Array of density regions with activity metrics
 */
export function extractDensityHeatmap(
  patternData: P3PatternData | undefined,
  regions: number = 8
): DensityRegion[] {
  if (!patternData || !patternData.bars || patternData.bars.length === 0) {
    return [];
  }

  // Calculate total steps (accounting for repetitions)
  const totalSteps = calculateExpandedStepCount(patternData);

  if (totalSteps === 0) {
    return [];
  }

  const stepsPerRegion = totalSteps / regions;
  const densityMap: DensityRegion[] = [];

  // Get expanded bar occurrences
  const barOccurrences = getBarOccurrences(patternData);

  for (let r = 0; r < regions; r++) {
    let activeCount = 0;
    let veloSum = 0;
    let stepCount = 0;

    // Count active steps in this region
    let currentStep = 0;
    for (const occurrence of barOccurrences) {
      const { bar } = occurrence;

      for (let i = 0; i < bar.last_step; i++) {
        // Check if this step belongs to current region
        if (currentStep >= r * stepsPerRegion && currentStep < (r + 1) * stepsPerRegion) {
          stepCount++;
          if (bar.gate[i] === 1) {
            activeCount++;
            veloSum += bar.velo[i] ?? 0;
          }
        }
        currentStep++;
      }
    }

    densityMap.push({
      startPercent: (r / regions) * 100,
      endPercent: ((r + 1) / regions) * 100,
      density: stepCount > 0 ? activeCount / stepCount : 0,
      avgVelocity: activeCount > 0 ? veloSum / activeCount : 0,
    });
  }

  return densityMap;
}
