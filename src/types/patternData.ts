/**
 * Cyclone - Pattern Data Type Definitions
 * Complete type definitions for P3 pattern internal data structure
 */

/**
 * Direction modes for pattern playback
 */
export type P3Direction =
  | 'forward'
  | 'reverse A'
  | 'reverse B'
  | 'alternate'
  | 'pendulum'
  | 'random'
  | 'brownian'
  | 'eitherway';

/**
 * Accumulator configuration for note and aux parameter processing
 */
export interface AccumulatorConfig {
  note?: {
    limit: number;
    mode: 'rtz' | 'hold' | 'wrap';
    out: 'clip' | 'wrap';
  };
  velo?: {
    limit: number;
    mode: 'rtz' | 'hold' | 'wrap';
    out: 'clip' | 'wrap';
  };
  auxD?: {
    limit: number;
    mode: 'rtz' | 'hold' | 'wrap';
    out: 'clip' | 'wrap';
  };
  RoPS?: boolean; // Reset on Pattern Start
  XdAcD?: boolean; // Transpose defeat Accumulator D
}

/**
 * A single bar of a P3 pattern containing 16 steps of data
 */
export interface P3Bar {
  // Bar-level settings
  direction: P3Direction;
  tbase: string; // Timebase: "  4", " 16", etc. (formatted string)
  last_step: number; // 1-16, determines active steps in bar
  xpos: number; // Transpose offset
  reps: number; // Number of times bar repeats
  gbar: boolean; // Global bar sync enabled

  // Step data arrays (16 elements each)
  // Note: All arrays have exactly 16 elements, indexed 0-15

  // Numeric values
  note: string[]; // Note names: ["C 3", "D#5", ...] (16 elements)
  velo: number[]; // Velocity: 1-127 (16 elements)
  length: number[]; // Note length in ticks (16 elements)
  delay: number[]; // Delay in ticks: 0-47 (16 elements)

  // Aux values
  aux_A_value: number[]; // Aux A values: 0-127 (16 elements)
  aux_B_value: number[]; // Aux B values: 0-127 (16 elements)
  aux_C_value: number[]; // Aux C values: 0-127 (16 elements)
  aux_D_value: number[]; // Aux D values: 0-127 (16 elements)

  // Flag arrays (0 or 1)
  gate: number[]; // Note gate on/off (16 elements)
  tie: number[]; // Tie to next step (16 elements)
  skip: number[]; // Skip this step (16 elements)
  note_X: number[]; // Transpose defeat (16 elements)

  // Aux flags
  aux_A_flag: number[]; // Aux A enabled (16 elements)
  aux_B_flag: number[]; // Aux B enabled (16 elements)
  aux_C_flag: number[]; // Aux C enabled (16 elements)
  aux_D_flag: number[]; // Aux D enabled (16 elements)
}

/**
 * Complete P3 pattern data including all bars and configuration
 */
export interface P3PatternData {
  // Pattern-level settings
  loop_start?: number; // Bar number where loop begins
  loop_end?: number; // Bar number where loop ends

  // Aux assignments (MIDI CC or event mappings)
  aux_A?: string; // e.g., "cc #1"
  aux_B?: string; // e.g., "cc #4"
  aux_C?: string; // e.g., "cc #6"
  aux_D?: string; // e.g., "cc #10"

  // Accumulator configuration
  accumulator_config?: AccumulatorConfig;

  // Bar data (1-16 bars)
  bars: P3Bar[];
}

/**
 * Extended Cirklon pattern with full P3 data
 * This extends the base CirklonPattern type
 */
export interface P3PatternFull {
  type: 'P3';
  creator_track: number;
  saved: boolean;
  bar_count: number;

  // Full pattern data
  patternData: P3PatternData;
}

/**
 * Type guard to check if pattern has P3 data
 */
export function isP3Pattern(pattern: unknown): pattern is P3PatternFull {
  if (!pattern || typeof pattern !== 'object') {
    return false;
  }

  const p = pattern as Record<string, unknown>;
  return (
    p.type === 'P3' &&
    typeof p.creator_track === 'number' &&
    typeof p.saved === 'boolean' &&
    typeof p.bar_count === 'number' &&
    p.patternData !== undefined &&
    typeof p.patternData === 'object' &&
    Array.isArray((p.patternData as Record<string, unknown>).bars)
  );
}

/**
 * Type guard to check if a bar has valid structure
 */
export function isValidP3Bar(bar: unknown): bar is P3Bar {
  if (!bar || typeof bar !== 'object') {
    return false;
  }

  const b = bar as Record<string, unknown>;

  // Check required string/number fields
  if (
    typeof b.direction !== 'string' ||
    typeof b.tbase !== 'string' ||
    typeof b.last_step !== 'number' ||
    typeof b.xpos !== 'number' ||
    typeof b.reps !== 'number' ||
    typeof b.gbar !== 'boolean'
  ) {
    return false;
  }

  // Check all arrays exist and have 16 elements
  const requiredArrays = [
    'note', 'velo', 'length', 'delay',
    'aux_A_value', 'aux_B_value', 'aux_C_value', 'aux_D_value',
    'gate', 'tie', 'skip', 'note_X',
    'aux_A_flag', 'aux_B_flag', 'aux_C_flag', 'aux_D_flag'
  ];

  for (const arrayName of requiredArrays) {
    const arr = b[arrayName];
    if (!Array.isArray(arr) || arr.length !== 16) {
      return false;
    }
  }

  return true;
}
