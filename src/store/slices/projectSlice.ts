/**
 * Cyclone - Project Slice
 * Redux state management for project/file management
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Project State - Tracks current project metadata
 */
export interface ProjectState {
  currentProjectId: string | null; // null for unsaved projects
  currentProjectName: string;
  isDirty: boolean; // Has unsaved changes
  lastSaved: string | null; // ISO timestamp of last save
}

const initialState: ProjectState = {
  currentProjectId: null,
  currentProjectName: 'Untitled',
  isDirty: false,
  lastSaved: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    /**
     * Create a new project (clears current project)
     */
    newProject: () => {
      return initialState;
    },

    /**
     * Load an existing project
     */
    loadProjectById: (
      state,
      action: PayloadAction<{ projectId: string; projectName: string }>
    ) => {
      const { projectId, projectName } = action.payload;
      state.currentProjectId = projectId;
      state.currentProjectName = projectName;
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    },

    /**
     * Save current project (updates lastSaved, keeps same ID)
     */
    saveCurrentProject: (state) => {
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    },

    /**
     * Save project with new ID (Save As)
     */
    saveProjectAs: (
      state,
      action: PayloadAction<{ projectId: string; projectName: string }>
    ) => {
      const { projectId, projectName } = action.payload;
      state.currentProjectId = projectId;
      state.currentProjectName = projectName;
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    },

    /**
     * Delete a project - if it's the current project, reset to new
     */
    deleteProjectById: (state, action: PayloadAction<string>) => {
      const projectId = action.payload;
      if (state.currentProjectId === projectId) {
        return initialState;
      }
    },

    /**
     * Update current project name
     */
    setCurrentProjectName: (state, action: PayloadAction<string>) => {
      state.currentProjectName = action.payload;
    },

    /**
     * Mark project as having unsaved changes
     */
    markAsDirty: (state) => {
      state.isDirty = true;
    },

    /**
     * Mark project as having no unsaved changes
     */
    markAsClean: (state) => {
      state.isDirty = false;
    },
  },
});

export const {
  newProject,
  loadProjectById,
  saveCurrentProject,
  saveProjectAs,
  deleteProjectById,
  setCurrentProjectName,
  markAsDirty,
  markAsClean,
} = projectSlice.actions;

export default projectSlice.reducer;
