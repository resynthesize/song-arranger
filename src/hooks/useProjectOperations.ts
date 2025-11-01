/**
 * Cyclone - useProjectOperations Hook
 * Extracted project operations logic from FileMenu
 */

import { useCallback } from 'react';
import { useStore } from 'react-redux';
import type { RootState } from '@/store/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  newProject,
  loadProjectById,
  saveCurrentProject,
  saveProjectAs,
} from '@/store/slices/projectSlice';
import { loadSong } from '@/store/slices/songSlice/index';
import {
  saveProject,
  loadProject,
  setTemplateProject,
  type ProjectFile,
} from '@/utils/storage';

export interface UseProjectOperationsReturn {
  handleNew: () => void;
  handleSave: () => void;
  handleSaveAs: () => void;
  handleSaveAsConfirm: (name: string) => void;
  handleLoad: () => void;
  handleLoadConfirm: (project: ProjectFile) => void;
  handleSetAsTemplate: () => void;
}

export interface UseProjectOperationsOptions {
  onLoad?: () => void;
  onShowSaveAsDialog?: (show: boolean) => void;
  onShowLoadDialog?: (show: boolean) => void;
}

export function useProjectOperations(
  options: UseProjectOperationsOptions = {}
): UseProjectOperationsReturn {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();

  const currentProjectId = useAppSelector((state) => state.project.currentProjectId);
  const currentProjectName = useAppSelector((state) => state.project.currentProjectName);
  const isDirty = useAppSelector((state) => state.project.isDirty);

  const { onLoad, onShowSaveAsDialog, onShowLoadDialog } = options;

  const handleNew = useCallback(() => {
    if (isDirty) {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to create a new project?'
      );
      if (!confirm) return;
    }

    dispatch(newProject());
  }, [dispatch, isDirty]);

  const handleSave = useCallback(() => {
    try {
      const state = store.getState();
      const projectId = saveProject({
        id: currentProjectId || undefined,
        name: currentProjectName,
        songData: state.song.present, // Save CKS data (unwrap from redux-undo)
        timeline: state.timeline,
      });

      if (!currentProjectId) {
        // First time save
        dispatch(saveProjectAs({ projectId, projectName: currentProjectName }));
      } else {
        // Update existing
        dispatch(saveCurrentProject());
      }
    } catch (error) {
      alert(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentProjectId, currentProjectName, store, dispatch]);

  const handleSaveAs = useCallback(() => {
    onShowSaveAsDialog?.(true);
  }, [onShowSaveAsDialog]);

  const handleSaveAsConfirm = useCallback((name: string) => {
    try {
      const state = store.getState();
      const projectId = saveProject({
        name,
        songData: state.song.present, // Save CKS data (unwrap from redux-undo)
        timeline: state.timeline,
      });

      dispatch(saveProjectAs({ projectId, projectName: name }));
      onShowSaveAsDialog?.(false);
    } catch (error) {
      alert(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [store, dispatch, onShowSaveAsDialog]);

  const handleLoad = useCallback(() => {
    if (isDirty) {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to load a different project?'
      );
      if (!confirm) return;
    }

    onShowLoadDialog?.(true);
  }, [isDirty, onShowLoadDialog]);

  const handleLoadConfirm = useCallback((project: ProjectFile) => {
    const loadedProject = loadProject(project.id);
    if (!loadedProject) {
      alert('Failed to load project.');
      return;
    }

    // Load project metadata
    dispatch(loadProjectById({ projectId: loadedProject.id, projectName: loadedProject.name }));

    // Load CKS data into songSlice
    if (loadedProject.data.songData) {
      dispatch(loadSong(loadedProject.data.songData));
    } else {
      // Legacy format - show error
      alert('This project uses an old format and cannot be loaded. Please import from a .CKS file instead.');
      return;
    }

    // Load timeline data (merge with existing viewport to preserve current view)
    dispatch({ type: 'timeline/loadTimeline', payload: loadedProject.data.timeline });

    onShowLoadDialog?.(false);
    onLoad?.();
  }, [dispatch, onLoad, onShowLoadDialog]);

  const handleSetAsTemplate = useCallback(() => {
    if (!currentProjectId) {
      alert('Please save the project first before setting it as a template.');
      return;
    }

    // Save current state first
    handleSave();

    try {
      setTemplateProject(currentProjectId);
      alert(`"${currentProjectName}" has been set as the template project.`);
    } catch (error) {
      alert(`Failed to set template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentProjectId, currentProjectName, handleSave]);

  return {
    handleNew,
    handleSave,
    handleSaveAs,
    handleSaveAsConfirm,
    handleLoad,
    handleLoadConfirm,
    handleSetAsTemplate,
  };
}
