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
 * Pattern - A segment on the timeline representing a section of the song
 */
export interface Pattern {
  id: ID;
  trackId: ID;
  position: Position;
  duration: Duration;
  label?: string;
  muted?: boolean;
  patternType?: 'P3' | 'CK';
  sceneDuration?: Duration; // Duration of the scene this pattern belongs to (for loop visualization)
}

/**
 * Track - A horizontal track that contains patterns
 */
export interface Track {
  id: ID;
  name: string;
  color?: string;
}

/**
 * Scene - A marker on the timeline representing a section of the song
 */
export interface Scene {
  id: ID;
  name: string;
  position: Position; // Start position in beats
  duration: Duration; // Length in beats
}

/**
 * @deprecated Use Pattern instead
 */
export type Clip = Pattern;

/**
 * @deprecated Use Track instead
 */
export type Lane = Track;

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
 * Track State - Manages tracks in the timeline
 */
export interface TracksState {
  tracks: Track[];
  editingTrackId: ID | null; // Track currently being edited
  movingTrackId: ID | null; // Track currently animating from a move
}

/**
 * Pattern State - Manages patterns in the timeline
 */
export interface PatternsState {
  patterns: Pattern[];
  editingPatternId: ID | null; // Currently editing pattern for label changes
}

/**
 * Selection State - Manages selected patterns and current track
 */
export interface SelectionState {
  selectedPatternIds: ID[];
  currentTrackId: ID | null; // Currently selected track (for navigation when no patterns selected)
}

/**
 * Scenes State - Manages scene markers on the timeline
 */
export interface ScenesState {
  scenes: Scene[];
  editingSceneId: ID | null; // Scene currently being edited
}

/**
 * @deprecated Use TracksState instead
 */
export type LanesState = TracksState;

/**
 * @deprecated Use PatternsState instead
 */
export type ClipsState = PatternsState;

/**
 * Application State Root
 */
export interface RootState {
  timeline: TimelineState;
  tracks: TracksState;
  patterns: PatternsState;
  selection: SelectionState;
  scenes: ScenesState;
}
