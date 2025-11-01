/**
 * Cyclone - FileMenu Component
 * File operations menu for project management
 */

import { useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { deleteProjectById } from '@/store/slices/projectSlice';
import {
  deleteProject as deleteProjectFromStorage,
  listProjects,
  clearTemplateProject,
  type ProjectFile,
} from '@/utils/storage';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import { useImportExport } from '@/hooks/useImportExport';
import { useThemeOperations } from '@/hooks/useThemeOperations';
import { TerminalMenu, type TerminalMenuItem } from '../TerminalMenu';
import ProjectSelector from '../ProjectSelector';
import SaveAsDialog from '../SaveAsDialog';
import CirklonExportDialog from '../CirklonExportDialog/CirklonExportDialog';
import './FileMenu.css';

export interface FileMenuProps {
  onProjectsListOpen?: () => void;
  onToggleSongDataViewer?: () => void;
}

export const FileMenu: React.FC<FileMenuProps> = ({ onProjectsListOpen, onToggleSongDataViewer }) => {
  const dispatch = useAppDispatch();
  const currentProjectName = useAppSelector((state) => state.project.currentProjectName);
  const isDirty = useAppSelector((state) => state.project.isDirty);
  const currentTheme = useAppSelector((state) => state.theme.current);

  // Dialog states
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportCirklonDialog, setShowExportCirklonDialog] = useState(false);

  // Custom hooks for operations
  const {
    handleNew,
    handleSave,
    handleSaveAs: handleSaveAsDialog,
    handleSaveAsConfirm,
    handleLoad: handleLoadDialog,
    handleLoadConfirm,
    handleSetAsTemplate,
  } = useProjectOperations({
    onLoad: onProjectsListOpen,
    onShowSaveAsDialog: setShowSaveAsDialog,
    onShowLoadDialog: setShowLoadDialog,
  });

  const {
    handleExport,
    handleImport,
    handleImportCirklon,
    handleImportCirklonCollection,
    handleExportCirklon: handleExportCirklonDialog,
    handleExportCirklonConfirm,
  } = useImportExport({
    onShowExportCirklonDialog: setShowExportCirklonDialog,
  });

  const {
    handleSetThemeModern,
    handleSetThemeRetro,
    handleSetThemeMinimalist,
  } = useThemeOperations();

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

  const menuItems: TerminalMenuItem[] = [
    { id: 'new', label: 'New' },
    { id: 'open', label: 'Open...' },
    { id: 'save', label: isDirty ? 'Save*' : 'Save' },
    { id: 'save-as', label: 'Save As...' },
    { id: 'separator-1', separator: true },
    { id: 'import', label: 'Import JSON...' },
    { id: 'import-cirklon', label: 'Import Cirklon (.CKS)...' },
    { id: 'import-cirklon-collection', label: 'Import Song Collection (.CKS)...' },
    { id: 'export', label: 'Export JSON...' },
    { id: 'export-cirklon', label: 'Export Cirklon (.CKS)...' },
    { id: 'separator-2', separator: true },
    { id: 'template', label: 'Set as Template' },
    { id: 'separator-3', separator: true },
    { id: 'song-data-viewer', label: 'Song Data Viewer' },
    { id: 'separator-4', separator: true },
    { id: 'theme-retro', label: currentTheme === 'retro' ? '✓ Retro Theme' : 'Retro Theme' },
    { id: 'theme-modern', label: currentTheme === 'modern' ? '✓ Modern Theme' : 'Modern Theme' },
    { id: 'theme-minimalist', label: currentTheme === 'minimalist' ? '✓ Minimalist Theme' : 'Minimalist Theme' },
    { id: 'separator-5', separator: true },
    { id: 'delete', label: 'Delete...' },
  ];

  const handleSelect = useCallback(
    (item: TerminalMenuItem) => {
      switch (item.id) {
        case 'new':
          handleNew();
          break;
        case 'open':
          handleLoadDialog();
          break;
        case 'save':
          handleSave();
          break;
        case 'save-as':
          handleSaveAsDialog();
          break;
        case 'import':
          handleImport();
          break;
        case 'import-cirklon':
          handleImportCirklon();
          break;
        case 'import-cirklon-collection':
          handleImportCirklonCollection();
          break;
        case 'export':
          handleExport();
          break;
        case 'export-cirklon':
          handleExportCirklonDialog();
          break;
        case 'template':
          handleSetAsTemplate();
          break;
        case 'song-data-viewer':
          onToggleSongDataViewer?.();
          break;
        case 'theme-modern':
          handleSetThemeModern();
          break;
        case 'theme-retro':
          handleSetThemeRetro();
          break;
        case 'theme-minimalist':
          handleSetThemeMinimalist();
          break;
        case 'delete':
          handleDelete();
          break;
      }
    },
    [handleNew, handleLoadDialog, handleSave, handleSaveAsDialog, handleImport, handleImportCirklon, handleImportCirklonCollection, handleExport, handleExportCirklonDialog, handleSetAsTemplate, onToggleSongDataViewer, handleSetThemeModern, handleSetThemeRetro, handleSetThemeMinimalist, handleDelete]
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

      {showExportCirklonDialog && (
        <CirklonExportDialog
          isOpen={showExportCirklonDialog}
          onClose={() => setShowExportCirklonDialog(false)}
          onExport={handleExportCirklonConfirm}
        />
      )}
    </>
  );
};

export default FileMenu;
