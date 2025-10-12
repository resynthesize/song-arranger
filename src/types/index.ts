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
 * Snap mode type
 */
export type SnapMode = 'fixed' | 'grid';

/**
 * Viewport State - represents the visible area of the timeline
 */
export interface ViewportState {
  offsetBeats: number; // Start of visible timeline in beats
  zoom: number; // Pixels per beat
  widthPx: number; // Viewport width in pixels
  heightPx: number; // Viewport height in pixels
}

/**
 * Timeline State
 */
export interface TimelineState {
  viewport: ViewportState; // Viewport state for infinite scroll
  verticalZoom: number; // Vertical zoom percentage (50-150%, affects lane height)
  playheadPosition: Position; // Current playback position in beats
  isPlaying: boolean;
  tempo: number; // BPM (beats per minute)
  snapValue: number; // Snap interval in beats (e.g., 0.25 for 1/16th note, 1 for quarter note)
  snapMode: SnapMode; // 'fixed' for manual snap values, 'grid' for dynamic grid-based snapping
  minimapVisible: boolean; // Whether minimap is visible
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
 * Selection State - Manages selected clips and current lane
 */
export interface SelectionState {
  selectedClipIds: ID[];
  currentLaneId: ID | null; // Currently selected lane (for navigation when no clips selected)
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
