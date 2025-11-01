/**
 * Cyclone - Song Slice Types
 * Type definitions for action payloads and internal state
 */

import type { ID, Position, Duration } from '@/types';

/**
 * Timeline Adapter Action Payloads
 * These actions work with React view model IDs (pattern.id, track.id)
 * and handle the translation to CKS structure internally
 */
export namespace TimelinePayloads {
  /**
   * Move a pattern to a new position in the timeline
   */
  export interface MovePattern {
    patternReactId: ID;
    newPosition: Position; // Target position in beats
  }

  /**
   * Move multiple patterns by a relative delta
   */
  export interface MovePatterns {
    patternReactIds: ID[];
    deltaBeats: number; // Relative movement (positive = right, negative = left)
  }

  /**
   * Resize a pattern's duration
   */
  export interface ResizePattern {
    patternReactId: ID;
    newDuration: Duration;
  }

  /**
   * Resize multiple patterns by a factor
   */
  export interface ResizePatterns {
    patternReactIds: ID[];
    factor: number; // Multiplier (e.g., 2.0 = double duration, 0.5 = half)
  }

  /**
   * Create a new pattern in the timeline
   */
  export interface CreatePattern {
    trackReactId: ID;
    position: Position;
    duration: Duration;
    label?: string;
  }

  /**
   * Delete a pattern from the timeline
   */
  export interface DeletePattern {
    patternReactId: ID;
  }

  /**
   * Delete multiple patterns from the timeline
   */
  export interface DeletePatterns {
    patternReactIds: ID[];
  }

  /**
   * Move pattern to a different track (vertical drag)
   */
  export interface MovePatternToTrack {
    patternReactId: ID;
    targetTrackReactId: ID;
  }

  /**
   * Move multiple patterns to different tracks (vertical drag)
   */
  export interface MovePatternsToTrack {
    patternReactIds: ID[];
    deltaTrackIndex: number; // Relative track movement
  }

  /**
   * Update pattern label
   */
  export interface UpdatePatternLabel {
    patternReactId: ID;
    label: string;
  }

  /**
   * Duplicate a pattern
   */
  export interface DuplicatePattern {
    patternReactId: ID;
  }

  /**
   * Duplicate multiple patterns
   */
  export interface DuplicatePatterns {
    patternReactIds: ID[];
  }

  /**
   * Duplicate pattern with offset (place copy after original)
   */
  export interface DuplicatePatternWithOffset {
    patternReactId: ID;
  }

  /**
   * Duplicate multiple patterns with offset
   */
  export interface DuplicatePatternsWithOffset {
    patternReactIds: ID[];
  }

  /**
   * Split pattern at playhead position
   */
  export interface SplitPattern {
    patternReactId: ID;
    position: Position; // Split position in beats
  }

  /**
   * Trim pattern from start
   */
  export interface TrimPatternStart {
    patternReactId: ID;
    amount: number; // Amount to trim in beats
  }

  /**
   * Trim pattern from end
   */
  export interface TrimPatternEnd {
    patternReactId: ID;
    amount: number; // Amount to trim in beats
  }

  /**
   * Set pattern duration to exact value
   */
  export interface SetPatternsDuration {
    patternReactIds: ID[];
    duration: Duration; // New duration in beats
  }

  /**
   * Set pattern muted state
   */
  export interface SetPatternMuted {
    patternReactId: ID;
    muted: boolean;
  }

  /**
   * Set pattern type (P3 or CK)
   */
  export interface SetPatternType {
    patternReactId: ID;
    patternType: 'P3' | 'CK';
  }

  /**
   * Update pattern bar count
   */
  export interface UpdatePatternBarCount {
    patternReactId: ID;
    newBarCount: number; // 1-16
  }

  /**
   * Add a new track
   */
  export interface AddTrack {
    name?: string;
  }

  /**
   * Remove a track
   */
  export interface RemoveTrack {
    trackReactId: ID;
  }

  /**
   * Move track up in order
   */
  export interface MoveTrackUp {
    trackReactId: ID;
  }

  /**
   * Move track down in order
   */
  export interface MoveTrackDown {
    trackReactId: ID;
  }

  /**
   * Reorder track to new index
   */
  export interface ReorderTrack {
    trackReactId: ID;
    newIndex: number;
  }

  /**
   * Rename track
   */
  export interface RenameTrack {
    trackReactId: ID;
    name: string;
  }

  /**
   * Set track color
   */
  export interface SetTrackColor {
    trackReactId: ID;
    color: string;
  }

  /**
   * Update step value in pattern
   */
  export interface UpdateStepValue {
    patternReactId: ID;
    barIndex: number;
    stepIndex: number;
    row: import('@/types').PatternRow;
    value: number;
  }

  /**
   * Update step note in pattern
   */
  export interface UpdateStepNote {
    patternReactId: ID;
    barIndex: number;
    stepIndex: number;
    note: string;
  }

  /**
   * Update bar parameter value (xpose, reps, or gbar)
   */
  export interface UpdateBarParameter {
    patternReactId: ID;
    barIndex: number;
    parameter: import('@/types').BarParameter;
    value: number | boolean;
  }
}

/**
 * CKS Direct Action Payloads
 * These actions work directly with CKS identifiers (sceneName, trackKey, patternName)
 * Use these for import/export operations
 */
export namespace CKSPayloads {
  /**
   * Assign a pattern to a scene/track
   */
  export interface AssignPattern {
    sceneName: string;
    trackKey: string;
    patternName: string;
  }

  /**
   * Remove a pattern from a scene/track
   */
  export interface RemovePattern {
    sceneName: string;
    trackKey: string;
  }

  /**
   * Update a scene's properties
   */
  export interface UpdateScene {
    sceneName: string;
    changes: {
      length?: number;
      gbar?: number;
    };
  }

  /**
   * Create a new scene
   */
  export interface CreateScene {
    sceneName: string;
    position: Position; // Starting position in beats
    length: Duration; // Scene length in beats
  }

  /**
   * Delete a scene
   */
  export interface DeleteScene {
    sceneName: string;
  }
}

/**
 * Pattern location in CKS structure
 */
export interface PatternLocation {
  sceneName: string;
  trackKey: string;
  patternName: string;
}

/**
 * Scene position and boundaries
 */
export interface SceneBoundaries {
  sceneName: string;
  startPosition: Position;
  endPosition: Position;
  length: Duration;
}
