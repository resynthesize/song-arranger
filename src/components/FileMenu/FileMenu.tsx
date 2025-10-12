/**
 * Song Arranger - FileMenu Component
 * File operations menu for project management
 */

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  newProject,
  loadProjectById,
  saveCurrentProject,
  saveProjectAs,
  deleteProjectById,
} from '@/store/slices/projectSlice';
import {
  saveProject,
  loadProject,
  deleteProject as deleteProjectFromStorage,
  listProjects,
  setTemplateProject,
  clearTemplateProject,
} from '@/utils/storage';
import { TerminalMenu, type TerminalMenuItem } from '../TerminalMenu';
import './FileMenu.css';

export interface FileMenuProps {
  onProjectsListOpen?: () => void;
}

export const FileMenu: React.FC<FileMenuProps> = ({ onProjectsListOpen }) => {
  const dispatch = useAppDispatch();
  const currentProjectId = useAppSelector((state) => state.project.currentProjectId);
  const currentProjectName = useAppSelector((state) => state.project.currentProjectName);
  const isDirty = useAppSelector((state) => state.project.isDirty);

  // Get all current state for saving
  const clips = useAppSelector((state) => state.clips.clips);
  const lanes = useAppSelector((state) => state.lanes.lanes);
  const timeline = useAppSelector((state) => state.timeline);

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
        clips,
        lanes,
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
  }, [currentProjectId, currentProjectName, clips, lanes, timeline, dispatch]);

  const handleSaveAs = useCallback(() => {
    const name = window.prompt('Enter project name:', currentProjectName);
    if (!name) return;

    try {
      const projectId = saveProject({
        name,
        clips,
        lanes,
        timeline,
      });

      dispatch(saveProjectAs({ projectId, projectName: name }));
    } catch (error) {
      alert(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentProjectName, clips, lanes, timeline, dispatch]);

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

    // Show project list
    const projectList = projects
      .map((p, i) => `${i + 1}. ${p.name}${p.isTemplate ? ' (Template)' : ''}`)
      .join('\n');

    const selection = window.prompt(
      `Select a project to load:\n\n${projectList}\n\nEnter project number:`,
      '1'
    );

    if (!selection) return;

    const index = parseInt(selection, 10) - 1;
    const selectedProject = projects[index];

    if (!selectedProject) {
      alert('Invalid project number.');
      return;
    }

    const project = loadProject(selectedProject.id);
    if (!project) {
      alert('Failed to load project.');
      return;
    }

    // Load project data into Redux
    dispatch(loadProjectById({ projectId: project.id, projectName: project.name }));

    // Notify parent if callback provided
    onProjectsListOpen?.();
  }, [isDirty, dispatch, onProjectsListOpen]);

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

    const projectList = projects
      .map((p, i) => `${i + 1}. ${p.name}${p.isTemplate ? ' (Template)' : ''}`)
      .join('\n');

    const selection = window.prompt(
      `Select a project to delete:\n\n${projectList}\n\nEnter project number:`,
      '1'
    );

    if (!selection) return;

    const index = parseInt(selection, 10) - 1;
    const selectedProject = projects[index];

    if (!selectedProject) {
      alert('Invalid project number.');
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to delete "${selectedProject.name}"?`
    );

    if (!confirm) return;

    try {
      // Clear template if this was the template
      if (selectedProject.isTemplate) {
        clearTemplateProject();
      }

      deleteProjectFromStorage(selectedProject.id);
      dispatch(deleteProjectById(selectedProject.id));

      alert(`Project "${selectedProject.name}" has been deleted.`);
    } catch (error) {
      alert(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [dispatch]);

  const menuItems: TerminalMenuItem[] = [
    { id: 'new', label: 'New' },
    { id: 'open', label: 'Open...' },
    { id: 'save', label: isDirty ? 'Save*' : 'Save' },
    { id: 'save-as', label: 'Save As...' },
    { id: 'separator-1', separator: true },
    { id: 'template', label: 'Set as Template' },
    { id: 'separator-2', separator: true },
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
        case 'template':
          handleSetAsTemplate();
          break;
        case 'delete':
          handleDelete();
          break;
      }
    },
    [handleNew, handleLoad, handleSave, handleSaveAs, handleSetAsTemplate, handleDelete]
  );

  return (
    <div className="file-menu" data-testid="file-menu">
      <TerminalMenu
        items={menuItems}
        trigger={<span>FILE</span>}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default FileMenu;
