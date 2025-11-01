/**
 * Cyclone - SceneEditor Component
 * Editor for scene parameters (advance mode, initial mutes)
 */

import { useCallback, useEffect, useState, useRef, KeyboardEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, ID } from '@/types';
import { closeScene } from '@/store/slices/sceneEditorSlice';
import { updateSceneAdvanceMode, updateSceneInitialMutes, updateSceneLength, updateSceneGbar } from '@/store/slices/songSlice/slice';
import { selectAllScenes, selectAllTracks } from '@/store/selectors';
import { setKeyboardContext, resetKeyboardContext } from '@/store/slices/keyboardContextSlice';
import styles from './SceneEditor.module.css';

const SceneEditor = () => {
  const dispatch = useDispatch();

  // Get scene editor state
  const openSceneId = useSelector((state: RootState) => state.sceneEditor.openSceneId);
  const editorHeight = useSelector((state: RootState) => state.sceneEditor.editorHeight);

  // Get all scenes and tracks from song data
  const allScenes = useSelector(selectAllScenes);
  const allTracks = useSelector(selectAllTracks);

  // Find the current scene
  const currentScene = allScenes.find(scene => scene.id === openSceneId);

  // Set keyboard context to 'editing' when editor is open
  useEffect(() => {
    if (openSceneId) {
      dispatch(setKeyboardContext({ context: 'editing', editor: 'scene-editor' }));
    }

    return () => {
      dispatch(resetKeyboardContext());
    };
  }, [openSceneId, dispatch]);

  // Handle close button click
  const handleClose = useCallback(() => {
    dispatch(closeScene());
  }, [dispatch]);

  // Handle advance mode change
  const handleAdvanceModeChange = useCallback(
    (advanceMode: 'auto' | 'manual') => {
      if (!openSceneId) return;

      dispatch(
        updateSceneAdvanceMode({
          sceneReactId: openSceneId,
          advanceMode,
        })
      );
    },
    [openSceneId, dispatch]
  );

  // Handle initial mutes change
  const handleInitialMutesChange = useCallback(
    (trackId: ID, checked: boolean) => {
      if (!openSceneId || !currentScene) return;

      const currentMutes = currentScene.initialMutes || [];
      const newMutes = checked
        ? [...currentMutes, trackId] // Add to mutes
        : currentMutes.filter(id => id !== trackId); // Remove from mutes

      dispatch(
        updateSceneInitialMutes({
          sceneReactId: openSceneId,
          trackReactIds: newMutes,
        })
      );
    },
    [openSceneId, currentScene, dispatch]
  );

  // State for inline editing of length and gbar
  const [editingLength, setEditingLength] = useState(false);
  const [editingGbar, setEditingGbar] = useState(false);
  const lengthInputRef = useRef<HTMLInputElement>(null);
  const gbarInputRef = useRef<HTMLInputElement>(null);

  // Handle length editing
  const handleLengthDoubleClick = useCallback(() => {
    setEditingLength(true);
  }, []);

  const handleLengthKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();

      if (e.key === 'Enter') {
        e.preventDefault();
        const newLength = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(newLength) && newLength > 0 && openSceneId) {
          dispatch(updateSceneLength({ sceneReactId: openSceneId, length: newLength }));
        }
        setEditingLength(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditingLength(false);
      }
    },
    [openSceneId, dispatch]
  );

  const handleLengthBlur = useCallback(() => {
    setEditingLength(false);
  }, []);

  // Handle gbar editing
  const handleGbarDoubleClick = useCallback(() => {
    setEditingGbar(true);
  }, []);

  const handleGbarKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();

      if (e.key === 'Enter') {
        e.preventDefault();
        const newGbar = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(newGbar) && newGbar > 0 && openSceneId) {
          dispatch(updateSceneGbar({ sceneReactId: openSceneId, gbar: newGbar }));
        }
        setEditingGbar(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditingGbar(false);
      }
    },
    [openSceneId, dispatch]
  );

  const handleGbarBlur = useCallback(() => {
    setEditingGbar(false);
  }, []);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editingLength && lengthInputRef.current) {
      lengthInputRef.current.focus();
      lengthInputRef.current.select();
    }
  }, [editingLength]);

  useEffect(() => {
    if (editingGbar && gbarInputRef.current) {
      gbarInputRef.current.focus();
      gbarInputRef.current.select();
    }
  }, [editingGbar]);

  // Don't render if no scene is open
  if (!openSceneId) {
    return null;
  }

  // Don't render if scene not found
  if (!currentScene) {
    return null;
  }

  const sceneName = currentScene.name || 'Untitled Scene';
  const advanceMode = currentScene.advance || 'auto';
  const initialMutes = currentScene.initialMutes || [];
  const gbar = currentScene.gbar;
  const length = currentScene.length;
  const durationBeats = currentScene.duration;
  const beatsPerBar = gbar / 4; // gbar is in 16th notes, divide by 4 for quarter notes

  return (
    <div
      className={styles.editor}
      data-testid="scene-editor"
      style={{ height: `${editorHeight}px` }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>{sceneName}</h2>
          <div className={styles.metadata}>
            <span className={styles.field} onDoubleClick={handleLengthDoubleClick} title="Double-click to edit">
              Length: {editingLength ? (
                <input
                  ref={lengthInputRef}
                  className={styles.inlineInput}
                  type="number"
                  defaultValue={length}
                  onKeyDown={handleLengthKeyDown}
                  onBlur={handleLengthBlur}
                  onClick={(e) => e.stopPropagation()}
                  min="1"
                />
              ) : (
                <strong>{length}</strong>
              )} bars
            </span>
            <span className={styles.field} onDoubleClick={handleGbarDoubleClick} title="Double-click to edit (16th note steps)">
              GBar: {editingGbar ? (
                <input
                  ref={gbarInputRef}
                  className={styles.inlineInput}
                  type="number"
                  defaultValue={gbar}
                  onKeyDown={handleGbarKeyDown}
                  onBlur={handleGbarBlur}
                  onClick={(e) => e.stopPropagation()}
                  min="1"
                />
              ) : (
                <strong>{gbar}</strong>
              )} (16ths)
            </span>
            <span className={styles.duration}>
              Duration: {durationBeats.toFixed(2)} beats ({(durationBeats / beatsPerBar).toFixed(2)} bars @ {beatsPerBar.toFixed(1)} bpb)
            </span>
            <span className={styles.position}>
              Position: {currentScene.position.toFixed(2)} beats
            </span>
          </div>
        </div>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close scene editor"
        >
          Close
        </button>
      </div>

      {/* Content */}
      <div className={styles.content} data-testid="scene-editor-content">
        {/* Advance Mode Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Scene Advance</h3>
          <p className={styles.sectionDescription}>
            Controls how the Cirklon advances to the next scene
          </p>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="advanceMode"
                value="auto"
                checked={advanceMode === 'auto'}
                onChange={() => handleAdvanceModeChange('auto')}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>
                <strong>Auto</strong> - Advance automatically when scene ends
              </span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="advanceMode"
                value="manual"
                checked={advanceMode === 'manual'}
                onChange={() => handleAdvanceModeChange('manual')}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>
                <strong>Manual</strong> - Wait for trigger to advance
              </span>
            </label>
          </div>
        </div>

        {/* Initial Mutes Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Initial Mutes</h3>
          <p className={styles.sectionDescription}>
            Tracks that will be muted when this scene starts
          </p>
          <div className={styles.checkboxGroup}>
            {allTracks.length === 0 ? (
              <div className={styles.emptyMessage}>No tracks available</div>
            ) : (
              allTracks.map(track => {
                const isMuted = initialMutes.includes(track.id);
                return (
                  <label key={track.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isMuted}
                      onChange={(e) => handleInitialMutesChange(track.id, e.target.checked)}
                      className={styles.checkboxInput}
                    />
                    <span
                      className={styles.checkboxText}
                      style={{ color: track.color || undefined }}
                    >
                      {track.name}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneEditor;
