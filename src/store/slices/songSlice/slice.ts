/**
 * Cyclone - Song Slice (Main Reducers)
 * Redux slice with CKS direct actions and timeline adapter actions
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CirklonSongData, CirklonPattern, CirklonScene, CycloneMetadata } from '@/utils/cirklon/types';
import { CKSPayloads } from './types';
import * as adapters from './adapters';
import * as mutations from './mutations';
import * as timelineActions from './actions';
import * as stepOperations from './stepOperations';
import { generateId } from '@/utils/id';
import { MODERN_TRACK_COLORS } from '@/constants/colors';

/**
 * Create default song with 16 tracks
 */
function createDefaultSong(): CirklonSongData {
  const trackCount = 16;
  const trackOrder: string[] = [];
  const tracks: CycloneMetadata['uiMappings']['tracks'] = {};

  // Create 16 default tracks
  for (let i = 1; i <= trackCount; i++) {
    const trackKey = `track_${i}`;
    trackOrder.push(trackKey);

    // Cycle through color palette
    const colorIndex = (i - 1) % MODERN_TRACK_COLORS.length;
    const color = MODERN_TRACK_COLORS[colorIndex];

    tracks[trackKey] = {
      reactKey: generateId('track'),
      color,
      trackNumber: i,
      height: 60, // Default track height
      collapsed: false,
      transpose: 0,
      noTranspose: false,
      noFTS: false,
    };
  }

  return {
    song_data: {
      'Untitled Song': {
        patterns: {},
        scenes: {
          'Intro': {
            gbar: 16, // Standard 4/4 time (16 sixteenth notes per bar)
            length: 4,
            pattern_assignments: {},
          },
        },
        instrument_assignments: {},
      },
    },
    _cyclone_metadata: {
      version: '2.0.0',
      currentSongName: 'Untitled Song',
      uiMappings: {
        patterns: {},
        tracks,
        scenes: {
          'Intro': {
            reactKey: generateId('scene'),
          },
        },
      },
      trackOrder,
      sceneOrder: ['Intro'],
    },
  };
}

/**
 * Initial state with 16 default tracks
 */
const initialState: CirklonSongData = createDefaultSong();

const songSlice = createSlice({
  name: 'song',
  initialState,
  reducers: {
    /**
     * Add a new track to the timeline
     */
    addTrackInTimeline: (state, _action: PayloadAction<{ name?: string }>) => {
      if (!state._cyclone_metadata) {
        state._cyclone_metadata = {
          version: '2.0.0',
          currentSongName: '',
          uiMappings: { patterns: {}, tracks: {}, scenes: {} },
          trackOrder: [],
          sceneOrder: [],
        };
      }

      if (!state._cyclone_metadata.trackOrder) {
        state._cyclone_metadata.trackOrder = [];
      }

      const trackKey = `track_${state._cyclone_metadata.trackOrder.length + 1}`;
      state._cyclone_metadata.trackOrder.push(trackKey);
      state._cyclone_metadata.uiMappings.tracks[trackKey] = {
        reactKey: `track-${Date.now()}`,
        color: '#4a9eff',
        trackNumber: state._cyclone_metadata.trackOrder.length,
      };
    },

    // ========================================================================
    // CKS Direct Actions
    // Use these for import/export, migrations, or low-level operations
    // ========================================================================

    /**
     * Load a complete CKS file into state
     */
    loadSong: (_state, action: PayloadAction<CirklonSongData>) => {
      // Return the entire payload as the new state
      // redux-undo will handle wrapping this in present/past/future
      return action.payload;
    },

    /**
     * Set the current song being edited
     */
    setCurrentSong: (state, action: PayloadAction<string>) => {
      const metadata = adapters.ensureMetadata(state);
      if (state.song_data[action.payload]) {
        metadata.currentSongName = action.payload;
      }
    },

    /**
     * Update a pattern in the current song
     */
    updatePattern: (
      state,
      action: PayloadAction<{
        patternName: string;
        changes: Partial<CirklonPattern>;
      }>
    ) => {
      const { patternName, changes } = action.payload;
      const currentSong = adapters.getCurrentSong(state);

      if (currentSong && currentSong.patterns[patternName]) {
        Object.assign(currentSong.patterns[patternName], changes);
      }
    },

    /**
     * Add a new pattern to the current song
     */
    addPattern: (
      state,
      action: PayloadAction<{
        patternName: string;
        pattern: CirklonPattern;
        reactKey?: string;
      }>
    ) => {
      const { patternName, pattern, reactKey } = action.payload;
      mutations.createPattern(state, patternName, pattern.bar_count ? pattern.bar_count * 4 : 4, reactKey);
    },

    /**
     * Remove a pattern from the current song
     */
    removePattern: (state, action: PayloadAction<string>) => {
      mutations.deletePattern(state, action.payload);
    },

    /**
     * Assign a pattern to a track in a scene
     */
    assignPatternToScene: (state, action: PayloadAction<CKSPayloads.AssignPattern>) => {
      const { sceneName, trackKey, patternName } = action.payload;
      mutations.assignPatternToScene(state, sceneName, trackKey, patternName);
    },

    /**
     * Remove a pattern assignment from a scene
     */
    removePatternFromScene: (state, action: PayloadAction<CKSPayloads.RemovePattern>) => {
      const { sceneName, trackKey } = action.payload;
      mutations.removePatternFromScene(state, sceneName, trackKey);
    },

    /**
     * Update a scene in the current song
     */
    updateScene: (
      state,
      action: PayloadAction<{
        sceneName: string;
        changes: Partial<CirklonScene>;
      }>
    ) => {
      const { sceneName, changes } = action.payload;
      const currentSong = adapters.getCurrentSong(state);

      if (currentSong && currentSong.scenes[sceneName]) {
        Object.assign(currentSong.scenes[sceneName], changes);
      }
    },

    /**
     * Add a new scene to the current song
     */
    addScene: (
      state,
      action: PayloadAction<{
        sceneName: string;
        scene: CirklonScene;
        reactKey?: string;
      }>
    ) => {
      const { sceneName, scene } = action.payload;

      // Calculate position (where to insert scene on timeline)
      // For scenes added via action, we need to determine insertion position
      // This is typically at the end of existing scenes
      const metadata = adapters.ensureMetadata(state);
      const currentSong = adapters.getCurrentSong(state);
      let position = 0;

      if (currentSong) {
        const sceneOrder = metadata.sceneOrder || [];
        sceneOrder.forEach((sn) => {
          const s = currentSong.scenes[sn];
          if (s) {
            position += s.length * (s.gbar / 4);
          }
        });
      }

      // Calculate duration in beats: length (bars) × (gbar / 4)
      const duration = scene.length * (scene.gbar / 4);

      mutations.createScene(state, sceneName, position, duration);
    },

    /**
     * Remove a scene from the current song
     */
    removeScene: (state, action: PayloadAction<string>) => {
      mutations.deleteScene(state, action.payload);
    },

    /**
     * Update track order
     */
    setTrackOrder: (state, action: PayloadAction<string[]>) => {
      const metadata = adapters.ensureMetadata(state);
      metadata.trackOrder = action.payload;
    },

    /**
     * Update scene order
     */
    setSceneOrder: (state, action: PayloadAction<string[]>) => {
      const metadata = adapters.ensureMetadata(state);
      metadata.sceneOrder = action.payload;
    },

    /**
     * Update track color in metadata
     */
    setTrackColor: (
      state,
      action: PayloadAction<{ trackKey: string; color: string }>
    ) => {
      const { trackKey, color } = action.payload;
      const metadata = adapters.ensureMetadata(state);

      if (metadata.uiMappings.tracks[trackKey]) {
        metadata.uiMappings.tracks[trackKey].color = color;
      }
    },

    /**
     * Update instrument assignment for a track
     */
    updateInstrumentAssignment: (
      state,
      action: PayloadAction<{
        trackKey: string;
        output?: string;
        multiChannel?: number;
      }>
    ) => {
      const { trackKey, output, multiChannel } = action.payload;
      const currentSong = adapters.getCurrentSong(state);

      if (currentSong) {
        if (!currentSong.instrument_assignments) {
          currentSong.instrument_assignments = {};
        }

        if (output !== undefined || multiChannel !== undefined) {
          if (!currentSong.instrument_assignments[trackKey]) {
            currentSong.instrument_assignments[trackKey] = { output: '' };
          }

          if (output !== undefined) {
            currentSong.instrument_assignments[trackKey].output = output;
          }

          if (multiChannel !== undefined) {
            currentSong.instrument_assignments[trackKey].multi_channel = multiChannel;
          }
        }
      }
    },

    /**
     * Update track settings in metadata
     */
    updateTrackSettings: (
      state,
      action: PayloadAction<{
        trackKey: string;
        settings: {
          color?: string;
          height?: number;
          collapsed?: boolean;
          transpose?: number;
          noTranspose?: boolean;
          noFTS?: boolean;
        };
      }>
    ) => {
      const { trackKey, settings } = action.payload;
      const metadata = adapters.ensureMetadata(state);

      if (!metadata.uiMappings.tracks[trackKey]) {
        return;
      }

      Object.assign(metadata.uiMappings.tracks[trackKey], settings);
    },

    /**
     * Update scene color in metadata
     */
    setSceneColor: (
      state,
      action: PayloadAction<{ sceneName: string; color: string }>
    ) => {
      const { sceneName, color } = action.payload;
      const metadata = adapters.ensureMetadata(state);

      if (metadata.uiMappings.scenes[sceneName]) {
        metadata.uiMappings.scenes[sceneName].color = color;
      }
    },

    /**
     * Rename a scene (accepts scene ID, translates to scene name)
     */
    renameScene: (
      state,
      action: PayloadAction<{ sceneId: string; newName: string }>
    ) => {
      const { sceneId, newName } = action.payload;
      const metadata = adapters.ensureMetadata(state);

      // Find the CKS scene name from the react key
      const sceneEntry = Object.entries(metadata.uiMappings.scenes || {}).find(
        ([, mapping]) => mapping.reactKey === sceneId
      );

      if (!sceneEntry) {
        console.error(`Scene with ID ${sceneId} not found`);
        return;
      }

      const [oldSceneName] = sceneEntry;
      mutations.renameScene(state, oldSceneName, newName);
    },

    /**
     * Resize a scene by adjusting its duration
     * Cascades updates to subsequent scenes and patterns
     */
    resizeSceneInTimeline: (
      state,
      action: PayloadAction<{ sceneId: string; newDuration: number }>
    ) => {
      const { sceneId, newDuration } = action.payload;
      const metadata = adapters.ensureMetadata(state);
      const currentSong = state.song_data[metadata.currentSongName];

      console.log('[resizeSceneInTimeline] Called with:', {
        sceneId,
        newDuration,
      });

      if (!currentSong) return;

      // Find the scene by react key
      const sceneEntry = Object.entries(metadata.uiMappings.scenes || {}).find(
        ([, mapping]) => mapping.reactKey === sceneId
      );

      if (!sceneEntry) {
        console.error(`Scene with ID ${sceneId} not found`);
        return;
      }

      const [sceneName, ] = sceneEntry;
      const scene = currentSong.scenes[sceneName];

      if (!scene) return;

      // Calculate old duration in beats
      // Note: scene.gbar is the scene's POSITION (global bar), not used for duration
      // Scene duration = scene.length (in bars) * 4 (beats per bar)
      const beatsPerBar = 4;
      const oldLength = scene.length || 1;
      const oldDuration = oldLength * beatsPerBar;

      console.log('[resizeSceneInTimeline] Scene data:', {
        sceneName,
        'scene.gbar (position)': scene.gbar,
        'scene.length (bars)': scene.length,
        oldLength,
        'oldDuration (beats)': oldDuration,
        'newDuration (beats)': newDuration,
      });

      // Calculate duration delta for cascading updates
      const durationDelta = newDuration - oldDuration;

      // Update scene's length to match new duration
      // Convert beats back to bars
      const newLength = Math.max(1, Math.round(newDuration / beatsPerBar));

      console.log('[resizeSceneInTimeline] Updating scene:', {
        oldLength,
        newLength,
        'durationDelta (beats)': durationDelta,
        calculation: `Math.round(${newDuration} / ${beatsPerBar}) = ${newLength}`,
      });

      scene.length = newLength;

      // Get scene index for cascading
      const sceneIndex = metadata.sceneOrder.indexOf(sceneName);
      if (sceneIndex === -1) return;

      // Note: Scenes don't have explicit positions in CKS - positions are calculated
      // from cumulative durations. Pattern positions need to be updated.

      // Update patterns: shift all patterns in subsequent scenes
      if (durationDelta !== 0) {
        // Calculate the starting position of the resized scene
        let currentPosition = 0;
        for (let i = 0; i < sceneIndex; i++) {
          const prevSceneName = metadata.sceneOrder[i];
          const prevScene = currentSong.scenes[prevSceneName];
          if (prevScene) {
            const prevGbar = prevScene.gbar || 16;
            const prevLength = prevScene.length || 1;
            currentPosition += (prevGbar * prevLength) / 4;
          }
        }

        const resizedScenePosition = currentPosition;
        const nextScenePosition = resizedScenePosition + newDuration;

        // Shift patterns in subsequent scenes
        for (let i = sceneIndex + 1; i < metadata.sceneOrder.length; i++) {
          const laterSceneName = metadata.sceneOrder[i];
          const laterScene = currentSong.scenes[laterSceneName];
          if (!laterScene || !laterScene.pattern_assignments) continue;

          // For each pattern assignment in the later scene
          Object.entries(laterScene.pattern_assignments).forEach(([trackKey, patternName]) => {
            const patternMeta = metadata.uiMappings.patterns[patternName];
            if (!patternMeta) return;

            // Shift pattern position by duration delta
            // Note: Pattern positions are stored in metadata (for now - to be refactored)
            // We'll handle this through the selector that reads pattern positions
          });
        }
      }
    },

    // ========================================================================
    // Timeline Adapter Actions
    // Use these from UI components - they handle view model → CKS translation
    // ========================================================================

    /**
     * Move a pattern to a new position in the timeline
     * Automatically creates scenes as needed, snaps to boundaries
     */
    movePatternInTimeline: timelineActions.movePatternInTimeline,

    /**
     * Move multiple patterns by a relative delta
     */
    movePatternsInTimeline: timelineActions.movePatternsInTimeline,

    /**
     * Create a new pattern in the timeline
     */
    createPatternInTimeline: timelineActions.createPatternInTimeline,

    /**
     * Delete a pattern from the timeline
     */
    deletePatternInTimeline: timelineActions.deletePatternInTimeline,

    /**
     * Delete multiple patterns from the timeline
     */
    deletePatternsInTimeline: timelineActions.deletePatternsInTimeline,

    /**
     * Unlink a pattern from its scene (keeps pattern definition)
     */
    unlinkPatternFromSceneInTimeline: timelineActions.unlinkPatternFromSceneInTimeline,

    /**
     * Unlink multiple patterns from their scenes
     */
    unlinkPatternsFromScenesInTimeline: timelineActions.unlinkPatternsFromScenesInTimeline,

    /**
     * Resize a pattern's duration
     */
    resizePatternInTimeline: timelineActions.resizePatternInTimeline,

    /**
     * Resize multiple patterns by a factor
     */
    resizePatternsInTimeline: timelineActions.resizePatternsInTimeline,

    /**
     * Move pattern to a different track (vertical drag)
     */
    movePatternToTrack: timelineActions.movePatternToTrack,

    /**
     * Move multiple patterns to different tracks
     */
    movePatternsToTrack: timelineActions.movePatternsToTrack,

    /**
     * Update pattern label/name
     */
    updatePatternLabel: timelineActions.updatePatternLabel,

    /**
     * Duplicate a pattern
     */
    duplicatePatternInTimeline: timelineActions.duplicatePatternInTimeline,

    /**
     * Duplicate multiple patterns
     */
    duplicatePatternsInTimeline: timelineActions.duplicatePatternsInTimeline,

    /**
     * Duplicate pattern with offset
     */
    duplicatePatternWithOffsetInTimeline: timelineActions.duplicatePatternWithOffsetInTimeline,

    /**
     * Duplicate multiple patterns with offset
     */
    duplicatePatternsWithOffsetInTimeline: timelineActions.duplicatePatternsWithOffsetInTimeline,

    /**
     * Split pattern at position
     */
    splitPatternInTimeline: timelineActions.splitPatternInTimeline,

    /**
     * Trim pattern from start
     */
    trimPatternStartInTimeline: timelineActions.trimPatternStartInTimeline,

    /**
     * Trim pattern from end
     */
    trimPatternEndInTimeline: timelineActions.trimPatternEndInTimeline,

    /**
     * Set pattern duration for multiple patterns
     */
    setPatternsDurationInTimeline: timelineActions.setPatternsDurationInTimeline,

    /**
     * Set pattern muted state
     */
    setPatternMutedInTimeline: timelineActions.setPatternMutedInTimeline,

    /**
     * Set pattern type
     */
    setPatternTypeInTimeline: timelineActions.setPatternTypeInTimeline,

    /**
     * Update pattern bar count
     */
    updatePatternBarCountInTimeline: timelineActions.updatePatternBarCountInTimeline,

    /**
     * Remove a track
     */
    removeTrackInTimeline: timelineActions.removeTrackInTimeline,

    /**
     * Move track up in order
     */
    moveTrackUpInTimeline: timelineActions.moveTrackUpInTimeline,

    /**
     * Move track down in order
     */
    moveTrackDownInTimeline: timelineActions.moveTrackDownInTimeline,

    /**
     * Reorder track to specific index
     */
    reorderTrackInTimeline: timelineActions.reorderTrackInTimeline,

    /**
     * Rename track
     */
    renameTrackInTimeline: timelineActions.renameTrackInTimeline,

    /**
     * Set track color
     */
    setTrackColorInTimeline: timelineActions.setTrackColorInTimeline,

    /**
     * Update step value in pattern
     */
    updateStepValueInTimeline: timelineActions.updateStepValueInTimeline,

    /**
     * Update step note in pattern
     */
    updateStepNoteInTimeline: timelineActions.updateStepNoteInTimeline,

    /**
     * Toggle gate for a step in pattern
     */
    toggleGateInTimeline: stepOperations.toggleGateInTimeline,

    /**
     * Toggle aux flag for a step in pattern
     */
    toggleAuxFlagInTimeline: stepOperations.toggleAuxFlagInTimeline,

    /**
     * Update bar parameter value (xpose, reps, or gbar)
     */
    updateBarParameterInTimeline: timelineActions.updateBarParameterInTimeline,

    /**
     * Update scene advance mode (auto/manual)
     */
    updateSceneAdvanceMode: timelineActions.updateSceneAdvanceMode,

    /**
     * Update scene initial mutes
     */
    updateSceneInitialMutes: timelineActions.updateSceneInitialMutes,

    /**
     * Update scene length (in bars)
     */
    updateSceneLength: timelineActions.updateSceneLength,

    /**
     * Update scene gbar (global bar length in 16th note steps)
     */
    updateSceneGbar: timelineActions.updateSceneGbar,
  },
});

export const {
  // CKS Direct
  loadSong,
  setCurrentSong,
  updatePattern,
  addPattern,
  removePattern,
  assignPatternToScene,
  removePatternFromScene,
  updateScene,
  addScene,
  removeScene,
  setTrackOrder,
  setSceneOrder,
  setTrackColor,
  updateInstrumentAssignment,
  updateTrackSettings,
  setSceneColor,
  renameScene,
  resizeSceneInTimeline,

  // Timeline Adapters
  movePatternInTimeline,
  movePatternsInTimeline,
  createPatternInTimeline,
  deletePatternInTimeline,
  deletePatternsInTimeline,
  unlinkPatternFromSceneInTimeline,
  unlinkPatternsFromScenesInTimeline,
  resizePatternInTimeline,
  resizePatternsInTimeline,
  movePatternToTrack,
  movePatternsToTrack,
  updatePatternLabel,
  duplicatePatternInTimeline,
  duplicatePatternsInTimeline,
  duplicatePatternWithOffsetInTimeline,
  duplicatePatternsWithOffsetInTimeline,
  splitPatternInTimeline,
  trimPatternStartInTimeline,
  trimPatternEndInTimeline,
  setPatternsDurationInTimeline,
  setPatternMutedInTimeline,
  setPatternTypeInTimeline,
  updatePatternBarCountInTimeline,
  addTrackInTimeline,
  removeTrackInTimeline,
  moveTrackUpInTimeline,
  moveTrackDownInTimeline,
  reorderTrackInTimeline,
  renameTrackInTimeline,
  setTrackColorInTimeline,
  updateStepValueInTimeline,
  updateStepNoteInTimeline,
  toggleGateInTimeline,
  toggleAuxFlagInTimeline,
  updateBarParameterInTimeline,
  updateSceneAdvanceMode,
  updateSceneInitialMutes,
  updateSceneLength,
  updateSceneGbar,
} = songSlice.actions;

export default songSlice.reducer;
