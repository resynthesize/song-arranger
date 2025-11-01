/**
 * Cyclone - Pattern Default Values
 * Utilities for creating properly initialized P3 pattern data
 */

import type { P3Bar } from '@/types/patternData';

/**
 * Create a properly initialized P3Bar with all required fields
 *
 * This ensures that every bar has the complete structure expected by
 * the pattern editor and playback engine.
 *
 * @param overrides - Optional partial bar data to override defaults
 * @returns A complete P3Bar with all 16 steps initialized
 */
export function createDefaultP3Bar(overrides?: Partial<P3Bar>): P3Bar {
  return {
    // Bar-level settings
    direction: 'forward',
    tbase: ' 16', // 16th notes (formatted with leading space)
    last_step: 16,
    xpos: 0,
    reps: 1,
    gbar: false,

    // Step data arrays (16 elements each)
    note: Array(16).fill('C 4'),
    velo: Array(16).fill(100),
    length: Array(16).fill(24),
    delay: Array(16).fill(0),

    // Aux value arrays
    aux_A_value: Array(16).fill(0),
    aux_B_value: Array(16).fill(0),
    aux_C_value: Array(16).fill(0),
    aux_D_value: Array(16).fill(0),

    // Flag arrays (0 or 1)
    gate: Array(16).fill(0),
    tie: Array(16).fill(0),
    skip: Array(16).fill(0),
    note_X: Array(16).fill(0),

    // Aux flag arrays
    aux_A_flag: Array(16).fill(0),
    aux_B_flag: Array(16).fill(0),
    aux_C_flag: Array(16).fill(0),
    aux_D_flag: Array(16).fill(0),

    ...overrides,
  };
}

/**
 * Create an array of default P3Bars
 *
 * @param count - Number of bars to create
 * @returns Array of initialized P3Bars
 */
export function createDefaultP3Bars(count: number): P3Bar[] {
  return Array(count).fill(null).map(() => createDefaultP3Bar());
}
