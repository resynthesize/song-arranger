/**
 * Song Arranger - Type Definitions
 * Central location for TypeScript types and interfaces
 */

/**
 * Unique identifier type
 */
export type ID = string;

/**
 * Duration in beats (quarter notes)
 */
export type Duration = number;

/**
 * Position in beats from the start of the timeline
 */
export type Position = number;

/**
 * Clip - A segment on the timeline representing a section of the song
 */
export interface Clip {
  id: ID;
  laneId: ID;
  position: Position;
  duration: Duration;
  label?: string;
}

/**
 * Lane - A horizontal track that contains clips
 */
export interface Lane {
  id: ID;
  name: string;
  color?: string;
}

/**
 * Timeline State
 */
export interface TimelineState {
  zoom: number; // Pixels per beat
  playheadPosition: Position; // Current playback position in beats
  isPlaying: boolean;
  tempo: number; // BPM (beats per minute)
  snapValue: number; // Snap interval in beats (e.g., 0.25 for 1/16th note, 1 for quarter note)
}

/**
 * Lane State - Manages lanes in the timeline
 */
export interface LanesState {
  lanes: Lane[];
  editingLaneId: ID | null; // Lane currently being edited
}

/**
 * Clip State - Manages clips in the timeline
 */
export interface ClipsState {
  clips: Clip[];
}

/**
 * Selection State - Manages selected clips
 */
export interface SelectionState {
  selectedClipIds: ID[];
}

/**
 * Application State Root
 */
export interface RootState {
  timeline: TimelineState;
  lanes: LanesState;
  clips: ClipsState;
  selection: SelectionState;
}
