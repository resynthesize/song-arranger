/**
 * Cyclone - Project Slice Tests
 * Tests for project management Redux reducer
 */

import reducer, {
  newProject,
  loadProjectById,
  saveCurrentProject,
  saveProjectAs,
  deleteProjectById,
  setCurrentProjectName,
  markAsDirty,
  markAsClean,
} from './projectSlice';
import type { ProjectState } from './projectSlice';

describe('projectSlice', () => {
  const initialState: ProjectState = {
    currentProjectId: null,
    currentProjectName: 'Untitled',
    isDirty: false,
    lastSaved: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('newProject', () => {
    it('should reset to new project state', () => {
      const stateWithProject: ProjectState = {
        currentProjectId: 'project-123',
        currentProjectName: 'My Project',
        isDirty: true,
        lastSaved: '2025-01-01T00:00:00.000Z',
      };

      const newState = reducer(stateWithProject, newProject());

      expect(newState.currentProjectId).toBeNull();
      expect(newState.currentProjectName).toBe('Untitled');
      expect(newState.isDirty).toBe(false);
      expect(newState.lastSaved).toBeNull();
    });
  });

  describe('loadProjectById', () => {
    it('should load project and update state', () => {
      const projectId = 'project-123';
      const projectName = 'Loaded Project';

      const newState = reducer(
        initialState,
        loadProjectById({ projectId, projectName })
      );

      expect(newState.currentProjectId).toBe(projectId);
      expect(newState.currentProjectName).toBe(projectName);
      expect(newState.isDirty).toBe(false);
      expect(newState.lastSaved).toBeTruthy();
    });
  });

  describe('saveCurrentProject', () => {
    it('should update lastSaved and mark as clean', () => {
      const stateWithDirtyProject: ProjectState = {
        currentProjectId: 'project-123',
        currentProjectName: 'My Project',
        isDirty: true,
        lastSaved: null,
      };

      const newState = reducer(stateWithDirtyProject, saveCurrentProject());

      expect(newState.isDirty).toBe(false);
      expect(newState.lastSaved).toBeTruthy();
      expect(newState.currentProjectId).toBe('project-123');
      expect(newState.currentProjectName).toBe('My Project');
    });

    it('should not change project ID or name', () => {
      const stateWithProject: ProjectState = {
        currentProjectId: 'project-123',
        currentProjectName: 'My Project',
        isDirty: true,
        lastSaved: '2025-01-01T00:00:00.000Z',
      };

      const newState = reducer(stateWithProject, saveCurrentProject());

      expect(newState.currentProjectId).toBe('project-123');
      expect(newState.currentProjectName).toBe('My Project');
    });
  });

  describe('saveProjectAs', () => {
    it('should save with new ID and name', () => {
      const newId = 'project-456';
      const newName = 'New Project Name';

      const newState = reducer(
        initialState,
        saveProjectAs({ projectId: newId, projectName: newName })
      );

      expect(newState.currentProjectId).toBe(newId);
      expect(newState.currentProjectName).toBe(newName);
      expect(newState.isDirty).toBe(false);
      expect(newState.lastSaved).toBeTruthy();
    });

    it('should update existing project', () => {
      const stateWithProject: ProjectState = {
        currentProjectId: 'project-123',
        currentProjectName: 'Old Name',
        isDirty: true,
        lastSaved: null,
      };

      const newId = 'project-456';
      const newName = 'New Name';

      const newState = reducer(
        stateWithProject,
        saveProjectAs({ projectId: newId, projectName: newName })
      );

      expect(newState.currentProjectId).toBe(newId);
      expect(newState.currentProjectName).toBe(newName);
      expect(newState.isDirty).toBe(false);
    });
  });

  describe('deleteProjectById', () => {
    it('should clear current project if deleting active project', () => {
      const stateWithProject: ProjectState = {
        currentProjectId: 'project-123',
        currentProjectName: 'My Project',
        isDirty: false,
        lastSaved: '2025-01-01T00:00:00.000Z',
      };

      const newState = reducer(
        stateWithProject,
        deleteProjectById('project-123')
      );

      expect(newState.currentProjectId).toBeNull();
      expect(newState.currentProjectName).toBe('Untitled');
      expect(newState.isDirty).toBe(false);
      expect(newState.lastSaved).toBeNull();
    });

    it('should not affect state if deleting different project', () => {
      const stateWithProject: ProjectState = {
        currentProjectId: 'project-123',
        currentProjectName: 'My Project',
        isDirty: false,
        lastSaved: '2025-01-01T00:00:00.000Z',
      };

      const newState = reducer(
        stateWithProject,
        deleteProjectById('project-456')
      );

      // State should remain unchanged
      expect(newState).toEqual(stateWithProject);
    });
  });

  describe('setCurrentProjectName', () => {
    it('should update project name', () => {
      const stateWithProject: ProjectState = {
        currentProjectId: 'project-123',
        currentProjectName: 'Old Name',
        isDirty: false,
        lastSaved: '2025-01-01T00:00:00.000Z',
      };

      const newState = reducer(
        stateWithProject,
        setCurrentProjectName('New Name')
      );

      expect(newState.currentProjectName).toBe('New Name');
      expect(newState.currentProjectId).toBe('project-123');
    });
  });

  describe('markAsDirty', () => {
    it('should set isDirty to true', () => {
      const cleanState: ProjectState = {
        ...initialState,
        isDirty: false,
      };

      const newState = reducer(cleanState, markAsDirty());

      expect(newState.isDirty).toBe(true);
    });

    it('should not change other properties', () => {
      const stateWithProject: ProjectState = {
        currentProjectId: 'project-123',
        currentProjectName: 'My Project',
        isDirty: false,
        lastSaved: '2025-01-01T00:00:00.000Z',
      };

      const newState = reducer(stateWithProject, markAsDirty());

      expect(newState.isDirty).toBe(true);
      expect(newState.currentProjectId).toBe('project-123');
      expect(newState.currentProjectName).toBe('My Project');
      expect(newState.lastSaved).toBe('2025-01-01T00:00:00.000Z');
    });
  });

  describe('markAsClean', () => {
    it('should set isDirty to false', () => {
      const dirtyState: ProjectState = {
        ...initialState,
        isDirty: true,
      };

      const newState = reducer(dirtyState, markAsClean());

      expect(newState.isDirty).toBe(false);
    });
  });
});
