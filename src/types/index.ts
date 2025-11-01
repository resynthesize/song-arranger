/**
 * Cyclone - Type Definitions
 * Central location for TypeScript types and interfaces
 */

import type { P3PatternData } from './patternData';

// Re-export pattern data types for convenience
export type { P3PatternData, P3Bar, P3Direction, AccumulatorConfig } from './patternData';

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
  patternData?: P3PatternData; // Full P3 pattern data (steps, bars, aux assignments)
}

/**
 * Track - A horizontal track that contains patterns
 */
export interface Track {
  id: ID;
  name: string;
  color?: string;
  height?: number; // Custom track height in pixels (if not set, uses default from global verticalZoom)
  collapsed?: boolean; // Whether track is collapsed to minimal height (Ableton-style)
}

/**
 * Scene - A marker on the timeline representing a section of the song
 */
export interface Scene {
  id: ID;
  name: string;
  position: Position; // Start position in beats (calculated for timeline display)
  duration: Duration; // Length in beats (calculated from length × (gbar / 4) for timeline display)
  gbar: number; // Global bar length in 16th note steps (Cirklon native - typically 16 for 4/4)
  length: number; // Scene length in bars (of gbar steps) - (Cirklon native - editable, 1-200)
  advance: 'auto' | 'manual'; // Scene advance mode (auto = advance automatically, manual = wait for trigger)
  initialMutes?: ID[]; // Track IDs to mute when scene starts
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
 * Pattern row type - represents the different editable rows in pattern editor
 * Includes both step-based rows and bar-based rows
 */
export type PatternRow = 'note' | 'velocity' | 'length' | 'delay' | 'auxA' | 'auxB' | 'auxC' | 'auxD';

/**
 * Bar parameter type - represents bar-level parameters
 * These are edited per-bar rather than per-step
 */
export type BarParameter = 'xpose' | 'reps' | 'gbar';

/**
 * View mode for pattern editor - switches between different row groups
 * - parameters: Note, velocity, length, delay (step-based)
 * - aux: Aux A-D parameters (step-based)
 * - bar: Transpose, repetitions, global bar sync (bar-based)
 */
export type ViewMode = 'parameters' | 'aux' | 'bar';

/**
 * Clipboard data for copy/paste operations in pattern editor
 */
export interface ClipboardData {
  steps: number[]; // Step indices that were copied (0-15)
  barIndex: number; // Bar they were copied from (0-based)
  row: PatternRow; // Which row was copied
  values: unknown[]; // The actual values (notes, velocities, etc.)
}

/**
 * Pattern Editor State - Manages pattern editor UI state
 */
export interface PatternEditorState {
  openPatternId: ID | null; // Pattern currently being edited (null = closed)
  selectedRow: PatternRow; // Currently selected editing row
  selectedSteps: number[]; // Selected step indices (0-15)
  currentBarIndex: number; // Current bar being viewed/edited (0-based)
  editorHeight: number; // Editor pane height in pixels (for resize persistence)
  clipboardSteps: ClipboardData | null; // Copy/paste clipboard
  viewMode: ViewMode; // Current view mode (parameters or aux rows)
  visibleRows: Record<PatternRow, boolean>; // Which rows are visible
  collapsedRows: Record<PatternRow, boolean>; // Which rows are collapsed
}

/**
 * Application State Root - Re-exported from store for type safety
 * The actual RootState type is inferred from the store configuration
 */
export type { RootState, AppDispatch } from '@/store/store';
