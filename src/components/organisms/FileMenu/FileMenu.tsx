/**
 * Song Arranger - FileMenu Component
 * File operations menu for project management
 */

import { useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  newProject,
  loadProjectById,
  saveCurrentProject,
  saveProjectAs,
  deleteProjectById,
  setCurrentProjectName,
} from '@/store/slices/projectSlice';
import { setPatterns } from '@/store/slices/patternsSlice';
import { setTracks } from '@/store/slices/tracksSlice';
import { selectAllPatterns, selectAllTracks } from '@/store/selectors';
import {
  saveProject,
  loadProject,
  deleteProject as deleteProjectFromStorage,
  listProjects,
  setTemplateProject,
  clearTemplateProject,
  type ProjectFile,
} from '@/utils/storage';
import { TerminalMenu, type TerminalMenuItem } from '../TerminalMenu';
import ProjectSelector from '../ProjectSelector';
import SaveAsDialog from '../SaveAsDialog';
import { first } from '@/utils/array';
import './FileMenu.css';

export interface FileMenuProps {
  onProjectsListOpen?: () => void;
}

export const FileMenu: React.FC<FileMenuProps> = ({ onProjectsListOpen }) => {
  const dispatch = useAppDispatch();
  const currentProjectId = useAppSelector((state) => state.project.currentProjectId);
  const currentProjectName = useAppSelector((state) => state.project.currentProjectName);
  const isDirty = useAppSelector((state) => state.project.isDirty);

  // Get all current state for saving using selectors
  const patterns = useAppSelector(selectAllPatterns);
  const tracks = useAppSelector(selectAllTracks);
  const timeline = useAppSelector((state) => state.timeline);

  // Dialog states
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      const projectId = saveProject({
        id: currentProjectId || undefined,
        name: currentProjectName,
        patterns,
        tracks,
        timeline,
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
  }, [currentProjectId, currentProjectName, patterns, tracks, timeline, dispatch]);

  const handleSaveAs = useCallback(() => {
    setShowSaveAsDialog(true);
  }, []);

  const handleSaveAsConfirm = useCallback((name: string) => {
    try {
      const projectId = saveProject({
        name,
        patterns,
        tracks,
        timeline,
      });

      dispatch(saveProjectAs({ projectId, projectName: name }));
      setShowSaveAsDialog(false);
    } catch (error) {
      alert(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [patterns, tracks, timeline, dispatch]);

  const handleLoad = useCallback(() => {
    if (isDirty) {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to load a different project?'
      );
      if (!confirm) return;
    }

    const projects = listProjects();
    if (projects.length === 0) {
      alert('No saved projects found.');
      return;
    }

    setShowLoadDialog(true);
  }, [isDirty]);

  const handleLoadConfirm = useCallback((project: ProjectFile) => {
    const loadedProject = loadProject(project.id);
    if (!loadedProject) {
      alert('Failed to load project.');
      return;
    }

    // Load project metadata
    dispatch(loadProjectById({ projectId: loadedProject.id, projectName: loadedProject.name }));

    // Load patterns data
    dispatch(setPatterns(loadedProject.data.patterns));

    // Load tracks data
    dispatch(setTracks(loadedProject.data.tracks));

    // Load timeline data (merge with existing viewport to preserve current view)
    dispatch({ type: 'timeline/loadTimeline', payload: loadedProject.data.timeline });

    setShowLoadDialog(false);

    // Notify parent if callback provided
    onProjectsListOpen?.();
  }, [dispatch, onProjectsListOpen]);

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

  const handleDelete = useCallback(() => {
    const projects = listProjects();
    if (projects.length === 0) {
      alert('No saved projects to delete.');
      return;
    }

    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback((project: ProjectFile) => {
    const confirm = window.confirm(
      `Are you sure you want to delete "${project.name}"?`
    );

    if (!confirm) return;

    try {
      // Clear template if this was the template
      if (project.isTemplate) {
        clearTemplateProject();
      }

      deleteProjectFromStorage(project.id);
      dispatch(deleteProjectById(project.id));
      setShowDeleteDialog(false);

      alert(`Project "${project.name}" has been deleted.`);
    } catch (error) {
      alert(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [dispatch]);

  const handleExport = useCallback(() => {
    try {
      // Create export data with current project state
      const exportData = {
        name: currentProjectName,
        patterns,
        tracks,
        timeline: {
          tempo: timeline.tempo,
          snapValue: timeline.snapValue,
          snapMode: timeline.snapMode,
          verticalZoom: timeline.verticalZoom,
          minimapVisible: timeline.minimapVisible,
          playheadPosition: timeline.playheadPosition,
        },
        version: '1.0',
        exportedAt: new Date().toISOString(),
      };

      // Create JSON blob
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProjectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Failed to export project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentProjectName, patterns, tracks, timeline]);

  const handleImport = useCallback(() => {
    if (isDirty) {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to import a project?'
      );
      if (!confirm) return;
    }

    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      const file = first(Array.from(files));
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const importData = JSON.parse(jsonString);

          // Validate import data
          if (!importData.patterns || !importData.tracks) {
            throw new Error('Invalid project file: missing patterns or tracks data');
          }

          // Load imported data into Redux
          dispatch(newProject()); // Clear current project first

          // Set project name
          if (importData.name) {
            dispatch(setCurrentProjectName(importData.name));
          }

          // Load patterns
          dispatch(setPatterns(importData.patterns));

          // Load tracks
          dispatch(setTracks(importData.tracks));

          // Load timeline settings (if present)
          if (importData.timeline) {
            dispatch({ type: 'timeline/loadTimeline', payload: importData.timeline });
          }

          alert(`Successfully imported "${importData.name || 'project'}"`);
        } catch (error) {
          alert(`Failed to import project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }, [dispatch, isDirty]);

  const menuItems: TerminalMenuItem[] = [
    { id: 'new', label: 'New' },
    { id: 'open', label: 'Open...' },
    { id: 'save', label: isDirty ? 'Save*' : 'Save' },
    { id: 'save-as', label: 'Save As...' },
    { id: 'separator-1', separator: true },
    { id: 'import', label: 'Import JSON...' },
    { id: 'export', label: 'Export JSON...' },
    { id: 'separator-2', separator: true },
    { id: 'template', label: 'Set as Template' },
    { id: 'separator-3', separator: true },
    { id: 'delete', label: 'Delete...' },
  ];

  const handleSelect = useCallback(
    (item: TerminalMenuItem) => {
      switch (item.id) {
        case 'new':
          handleNew();
          break;
        case 'open':
          handleLoad();
          break;
        case 'save':
          handleSave();
          break;
        case 'save-as':
          handleSaveAs();
          break;
        case 'import':
          handleImport();
          break;
        case 'export':
          handleExport();
          break;
        case 'template':
          handleSetAsTemplate();
          break;
        case 'delete':
          handleDelete();
          break;
      }
    },
    [handleNew, handleLoad, handleSave, handleSaveAs, handleImport, handleExport, handleSetAsTemplate, handleDelete]
  );

  return (
    <>
      <div className="file-menu" data-testid="file-menu">
        <TerminalMenu
          items={menuItems}
          trigger={<span>FILE</span>}
          onSelect={handleSelect}
        />
      </div>

      {showLoadDialog && (
        <ProjectSelector
          projects={listProjects()}
          title="LOAD PROJECT"
          mode="load"
          onSelect={handleLoadConfirm}
          onClose={() => setShowLoadDialog(false)}
        />
      )}

      {showSaveAsDialog && (
        <SaveAsDialog
          defaultName={currentProjectName}
          onSave={handleSaveAsConfirm}
          onClose={() => setShowSaveAsDialog(false)}
        />
      )}

      {showDeleteDialog && (
        <ProjectSelector
          projects={listProjects()}
          title="DELETE PROJECT"
          mode="delete"
          onSelect={handleDeleteConfirm}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </>
  );
};

export default FileMenu;
