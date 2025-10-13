/**
 * Song Arranger - Command Definitions
 * Central registry of all application commands for command palette
 */

import { AppDispatch } from '@/store/store';
import type { RootState } from '@/store/store';
import {
  removePatterns,
  duplicatePatterns,
  duplicatePatternsWithOffset,
  splitPattern,
} from '@/store/slices/patternsSlice';
import {
  zoomIn,
  zoomOut,
  togglePlayPause,
  stop,
  frameViewport,
} from '@/store/slices/timelineSlice';
import {
  clearSelection,
  selectAllPatterns,
} from '@/store/slices/selectionSlice';
import { addTrack } from '@/store/slices/tracksSlice';
import { openQuickInput } from '@/store/slices/quickInputSlice';
import { first } from '@/utils/array';
import { logger } from './debug';

export type CommandCategory = 'Edit' | 'Navigate' | 'View' | 'Arrange' | 'Playback';

export interface Command {
  id: string;
  label: string;
  category: CommandCategory;
  shortcut?: string;
  keywords?: string[];  // For fuzzy search
  condition?: (state: RootState) => boolean;  // Optional condition to show command
  action: (dispatch: AppDispatch, state: RootState) => void;
}

/**
 * All application commands
 */
export const commands: Command[] = [
  // Quick Input Commands
  {
    id: 'set-tempo',
    label: 'Set Tempo...',
    category: 'Arrange',
    shortcut: 'T',
    keywords: ['tempo', 'bpm', 'speed'],
    action: (dispatch) => {
      dispatch(openQuickInput('tempo'));
    },
  },
  {
    id: 'set-zoom',
    label: 'Set Zoom Level...',
    category: 'View',
    shortcut: 'Z',
    keywords: ['zoom', 'scale', 'magnify'],
    action: (dispatch) => {
      dispatch(openQuickInput('zoom'));
    },
  },
  {
    id: 'set-snap',
    label: 'Set Snap Grid...',
    category: 'Arrange',
    shortcut: 'G',
    keywords: ['snap', 'grid', 'quantize'],
    action: (dispatch) => {
      dispatch(openQuickInput('snap'));
    },
  },
  {
    id: 'set-length',
    label: 'Set Clip Length...',
    category: 'Edit',
    shortcut: 'L',
    keywords: ['length', 'duration', 'resize'],
    condition: (state) => state.selection.selectedPatternIds.length > 0,
    action: (dispatch) => {
      dispatch(openQuickInput('length'));
    },
  },
  {
    id: 'jump-position',
    label: 'Jump to Position...',
    category: 'Navigate',
    shortcut: 'P',
    keywords: ['jump', 'position', 'goto', 'playhead'],
    action: (dispatch) => {
      dispatch(openQuickInput('position'));
    },
  },

  // Track Commands
  {
    id: 'add-track',
    label: 'Add Track',
    category: 'Arrange',
    shortcut: 'Cmd+Shift+N',
    keywords: ['lane', 'track', 'add', 'new'],
    action: (dispatch) => {
      dispatch(addTrack({ name: 'New Track' }));
    },
  },

  // Clip Commands
  {
    id: 'duplicate-clips',
    label: 'Duplicate Selected Clips',
    category: 'Edit',
    shortcut: 'D',
    keywords: ['duplicate', 'copy', 'clone'],
    condition: (state) => state.selection.selectedPatternIds.length > 0,
    action: (dispatch, state) => {
      dispatch(duplicatePatterns(state.selection.selectedPatternIds));
    },
  },
  {
    id: 'duplicate-clips-offset',
    label: 'Duplicate with Offset',
    category: 'Edit',
    shortcut: 'Shift+D',
    keywords: ['duplicate', 'offset', 'copy'],
    condition: (state) => state.selection.selectedPatternIds.length > 0,
    action: (dispatch, state) => {
      dispatch(duplicatePatternsWithOffset(state.selection.selectedPatternIds));
    },
  },
  {
    id: 'split-clip',
    label: 'Split Clip at Playhead',
    category: 'Edit',
    shortcut: 'S',
    keywords: ['split', 'cut', 'divide'],
    condition: (state) => state.selection.selectedPatternIds.length > 0,
    action: (dispatch, state) => {
      const patternId = first(state.selection.selectedPatternIds);
      if (patternId) {
        dispatch(splitPattern({ patternId, position: state.timeline.playheadPosition }));
      }
    },
  },
  {
    id: 'delete-clips',
    label: 'Delete Selected',
    category: 'Edit',
    shortcut: 'Del',
    keywords: ['delete', 'remove', 'clear'],
    condition: (state) => state.selection.selectedPatternIds.length > 0,
    action: (dispatch, state) => {
      dispatch(removePatterns(state.selection.selectedPatternIds));
      dispatch(clearSelection());
    },
  },

  // Selection Commands
  {
    id: 'select-all',
    label: 'Select All',
    category: 'Edit',
    shortcut: 'Cmd+A',
    keywords: ['select', 'all'],
    action: (dispatch, state) => {
      dispatch(selectAllPatterns(state.patterns.patterns.map(c => c.id)));
    },
  },
  {
    id: 'deselect-all',
    label: 'Deselect All',
    category: 'Edit',
    shortcut: 'Cmd+Shift+A',
    keywords: ['deselect', 'clear', 'none'],
    condition: (state) => state.selection.selectedPatternIds.length > 0,
    action: (dispatch) => {
      dispatch(clearSelection());
    },
  },

  // View Commands
  {
    id: 'zoom-in',
    label: 'Zoom In',
    category: 'View',
    shortcut: '[',
    keywords: ['zoom', 'in', 'magnify'],
    action: (dispatch) => {
      dispatch(zoomIn());
    },
  },
  {
    id: 'zoom-out',
    label: 'Zoom Out',
    category: 'View',
    shortcut: ']',
    keywords: ['zoom', 'out', 'shrink'],
    action: (dispatch) => {
      dispatch(zoomOut());
    },
  },
  {
    id: 'frame-selection',
    label: 'Frame Selection',
    category: 'View',
    shortcut: 'F',
    keywords: ['frame', 'fit', 'selection'],
    condition: (state) => state.selection.selectedPatternIds.length > 0,
    action: (dispatch, state) => {
      const selectedPatterns = state.patterns.patterns.filter(p =>
        state.selection.selectedPatternIds.includes(p.id)
      );
      if (selectedPatterns.length > 0) {
        const startBeats = Math.min(...selectedPatterns.map(p => p.position));
        const endBeats = Math.max(...selectedPatterns.map(p => p.position + p.duration));
        dispatch(frameViewport({ startBeats, endBeats }));
      }
    },
  },
  {
    id: 'frame-all',
    label: 'Frame All',
    category: 'View',
    shortcut: 'A',
    keywords: ['frame', 'fit', 'all', 'entire'],
    condition: (state) => state.patterns.patterns.length > 0,
    action: (dispatch, state) => {
      const patterns = state.patterns.patterns;
      if (patterns.length > 0) {
        const startBeats = Math.min(...patterns.map(p => p.position));
        const endBeats = Math.max(...patterns.map(p => p.position + p.duration));
        dispatch(frameViewport({ startBeats, endBeats }));
      }
    },
  },

  // Playback Commands
  {
    id: 'toggle-play',
    label: 'Play/Pause',
    category: 'Playback',
    shortcut: 'Space',
    keywords: ['play', 'pause', 'toggle'],
    action: (dispatch) => {
      dispatch(togglePlayPause());
    },
  },
  {
    id: 'stop',
    label: 'Stop',
    category: 'Playback',
    shortcut: 'Shift+Space',
    keywords: ['stop', 'reset'],
    action: (dispatch) => {
      dispatch(stop());
    },
  },
];

/**
 * Get commands filtered by current state
 */
export const getAvailableCommands = (state: RootState): Command[] => {
  return commands.filter(cmd => {
    if (!cmd.condition) return true;
    return cmd.condition(state);
  });
};

/**
 * Simple fuzzy search for commands
 * Matches if query tokens appear in label or keywords
 */
export const searchCommands = (query: string, state: RootState): Command[] => {
  if (!query.trim()) {
    return getAvailableCommands(state);
  }

  const availableCommands = getAvailableCommands(state);
  const queryTokens = query.toLowerCase().split(/\s+/);

  return availableCommands.filter(cmd => {
    const searchText = [
      cmd.label.toLowerCase(),
      cmd.category.toLowerCase(),
      ...(cmd.keywords || []),
    ].join(' ');

    return queryTokens.every(token => searchText.includes(token));
  });
};

/**
 * Get recently used commands from localStorage
 */
export const getRecentCommands = (maxCount: number = 5): string[] => {
  try {
    const recent = localStorage.getItem('recentCommands');
    if (recent) {
      return JSON.parse(recent).slice(0, maxCount);
    }
  } catch (e) {
    logger.warn('Failed to load recent commands:', e);
  }
  return [];
};

/**
 * Add command to recent list
 */
export const addToRecentCommands = (commandId: string): void => {
  try {
    const recent = getRecentCommands(20);
    // Remove if already in list
    const filtered = recent.filter(id => id !== commandId);
    // Add to front
    filtered.unshift(commandId);
    // Save
    localStorage.setItem('recentCommands', JSON.stringify(filtered));
  } catch (e) {
    logger.warn('Failed to save recent command:', e);
  }
};

/**
 * Get recent commands as Command objects
 */
export const getRecentCommandObjects = (state: RootState, maxCount: number = 5): Command[] => {
  const recentIds = getRecentCommands(maxCount);
  const availableCommands = getAvailableCommands(state);
  return recentIds
    .map(id => availableCommands.find(cmd => cmd.id === id))
    .filter((cmd): cmd is Command => cmd !== undefined);
};
