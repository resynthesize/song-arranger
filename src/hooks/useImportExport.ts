/**
 * Cyclone - useImportExport Hook
 * Extracted import/export operations logic from FileMenu
 */

import { useCallback } from 'react';
import { useStore } from 'react-redux';
import type { RootState } from '@/store/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { newProject, setCurrentProjectName } from '@/store/slices/projectSlice';
import { loadSong } from '@/store/slices/songSlice/index';
import { setStatus } from '@/store/slices/statusSlice';
import { selectAllPatterns, selectAllTracks } from '@/store/selectors';
import { saveProject } from '@/utils/storage';
import { parseCKSFile, importFromCirklon, importSongCollectionFromCirklon } from '@/utils/cirklon/import';
import { exportToCirklon, type ExportOptions } from '@/utils/cirklon/export';
import { first } from '@/utils/array';

export interface UseImportExportReturn {
  handleExport: () => void;
  handleImport: () => void;
  handleImportCirklon: () => void;
  handleImportCirklonCollection: () => void;
  handleExportCirklon: () => void;
  handleExportCirklonConfirm: (options: ExportOptions) => void;
}

export interface UseImportExportOptions {
  onShowExportCirklonDialog?: (show: boolean) => void;
}

export function useImportExport(
  options: UseImportExportOptions = {}
): UseImportExportReturn {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();

  const currentProjectName = useAppSelector((state) => state.project.currentProjectName);
  const isDirty = useAppSelector((state) => state.project.isDirty);

  const { onShowExportCirklonDialog } = options;

  const handleExport = useCallback(() => {
    try {
      const state = store.getState();
      const patterns = selectAllPatterns(state);
      const tracks = selectAllTracks(state);

      // Create export data with current project state
      const exportData = {
        name: currentProjectName,
        patterns,
        tracks,
        timeline: {
          tempo: state.timeline.tempo,
          snapValue: state.timeline.snapValue,
          snapMode: state.timeline.snapMode,
          verticalZoom: state.timeline.verticalZoom,
          minimapVisible: state.timeline.minimapVisible,
          playheadPosition: state.timeline.playheadPosition,
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
  }, [currentProjectName, store]);

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

          // Check if this is CKS format or legacy format
          if (importData.songData) {
            // New format with CKS data
            dispatch(newProject()); // Clear current project first

            // Set project name
            if (importData.name) {
              dispatch(setCurrentProjectName(importData.name));
            }

            // Load CKS data
            dispatch(loadSong(importData.songData));

            // Load timeline settings (if present)
            if (importData.timeline) {
              dispatch({ type: 'timeline/loadTimeline', payload: importData.timeline });
            }

            alert(`Successfully imported "${importData.name || 'project'}"`);
          } else {
            // Legacy format - show error
            throw new Error('This file uses an old format. Please import a .CKS file using "Import Cirklon (.CKS)..." instead.');
          }
        } catch (error) {
          alert(`Failed to import project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }, [dispatch, isDirty]);

  const handleImportCirklon = useCallback(() => {
    if (isDirty) {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to import a Cirklon file?'
      );
      if (!confirm) return;
    }

    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cks,.CKS,application/json';

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      const file = first(Array.from(files));
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;

          // Parse CKS file (with metadata)
          const cksData = parseCKSFile(jsonString);

          // Import to Cyclone format for stats
          const importResult = importFromCirklon(cksData);

          // Load imported data into Redux
          dispatch(newProject()); // Clear current project first

          // Set project name from song name
          dispatch(setCurrentProjectName(importResult.songName));

          // Load CKS data directly into songSlice (NEW FORMAT with metadata)
          dispatch(loadSong(cksData));

          // Set tempo from imported data
          dispatch({ type: 'timeline/setTempo', payload: importResult.tempo });

          // Show success message in status line
          dispatch(setStatus({
            message: `Successfully imported "${importResult.songName}" (${importResult.tracks.length} tracks, ${importResult.patterns.length} patterns, ${importResult.scenes.length} scenes)`,
            type: 'success',
          }));
        } catch (error) {
          dispatch(setStatus({
            message: `Failed to import Cirklon file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            type: 'error',
          }));
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }, [dispatch, isDirty]);

  const handleImportCirklonCollection = useCallback(() => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cks,.CKS,application/json';

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      const file = first(Array.from(files));
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;

          // Parse CKS file
          const cksData = parseCKSFile(jsonString);

          // Count songs
          const songCount = Object.keys(cksData.song_data).length;

          if (songCount === 0) {
            dispatch(setStatus({
              message: 'No songs found in collection file',
              type: 'error',
            }));
            return;
          }

          // Import collection and save each song to localStorage
          const result = importSongCollectionFromCirklon(cksData, 4, saveProject);

          // Show results in status bar
          if (result.successCount > 0) {
            if (result.failureCount > 0) {
              const errorDetails = result.errors.map(e => `${e.songName}: ${e.error}`).join('; ');
              dispatch(setStatus({
                message: `Imported ${result.successCount} song${result.successCount > 1 ? 's' : ''}, failed ${result.failureCount}: ${errorDetails}`,
                type: 'success',
              }));
            } else {
              dispatch(setStatus({
                message: `Successfully imported ${result.successCount} song${result.successCount > 1 ? 's' : ''}: ${result.songNames.join(', ')}`,
                type: 'success',
              }));
            }
          } else {
            const errorDetails = result.errors.map(e => `${e.songName}: ${e.error}`).join('; ');
            dispatch(setStatus({
              message: `Failed to import all songs: ${errorDetails}`,
              type: 'error',
            }));
          }
        } catch (error) {
          dispatch(setStatus({
            message: `Failed to import Cirklon collection: ${error instanceof Error ? error.message : 'Unknown error'}`,
            type: 'error',
          }));
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }, [dispatch]);

  const handleExportCirklon = useCallback(() => {
    onShowExportCirklonDialog?.(true);
  }, [onShowExportCirklonDialog]);

  const handleExportCirklonConfirm = useCallback((options: ExportOptions) => {
    try {
      const state = store.getState();
      const tracks = selectAllTracks(state);
      const patterns = selectAllPatterns(state);

      // Export to Cirklon format
      const cirklonData = exportToCirklon(tracks, patterns, options);

      // Create JSON blob
      const jsonString = JSON.stringify(cirklonData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `${options.songName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.CKS`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onShowExportCirklonDialog?.(false);

      alert(`Successfully exported "${options.songName}" to Cirklon format`);
    } catch (error) {
      alert(`Failed to export Cirklon file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [store, onShowExportCirklonDialog]);

  return {
    handleExport,
    handleImport,
    handleImportCirklon,
    handleImportCirklonCollection,
    handleExportCirklon,
    handleExportCirklonConfirm,
  };
}
