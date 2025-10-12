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
}

/**
 * Application State Root
 */
export interface RootState {
  timeline: TimelineState;
  // Additional slices will be added as needed
}
