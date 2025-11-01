/**
 * Cyclone - Storage Utilities
 * localStorage-based project file management
 */

import type { Pattern, Track, TimelineState } from '@/types';
import type { CirklonSongData } from './cirklon/types';
import { logger } from './debug';
import { generateId } from './id';

// Current data version - v3.0.0 uses CKS format for storage
const DATA_VERSION = '3.0.0';

// localStorage key prefixes
const PROJECT_KEY_PREFIX = 'project:';
const TEMPLATE_ID_KEY = 'template-id';

/**
 * Project file structure stored in localStorage
 * Supports both v3 (CKS) and legacy v2 formats
 */
export interface ProjectFile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isTemplate: boolean;
  data: {
    // v3 format (CKS)
    songData?: CirklonSongData;
    // Legacy v2 format
    patterns?: Pattern[];
    tracks?: Track[];
    timeline: TimelineState;
    version: string;
  };
}

/**
 * Input parameters for saving a project
 * Supports both v3 (CKS) and legacy v2 formats
 */
export interface SaveProjectParams {
  id?: string;
  name: string;
  // v3 format (CKS)
  songData?: CirklonSongData;
  // Legacy v2 format
  patterns?: Pattern[];
  tracks?: Track[];
  timeline: TimelineState;
  isTemplate?: boolean;
}

/**
 * Generate a unique project ID
 * Note: Project IDs don't include a 'project-' prefix for backward compatibility
 */
const generateProjectId = (): string => {
  // Use generateId and strip the 'project-' prefix for backward compatibility
  return generateId('project').replace('project-', '');
};

/**
 * Save a project to localStorage
 * @param params - Project data to save
 * @returns Project ID
 * @throws Error if localStorage quota is exceeded
 */
export const saveProject = (params: SaveProjectParams): string => {
  const {
    id: existingId,
    name,
    songData,
    patterns,
    tracks,
    timeline,
    isTemplate = false,
  } = params;

  const now = new Date().toISOString();
  let projectId: string;
  let createdAt = now;
  let templateStatus = isTemplate;

  // If updating existing project, preserve createdAt and template status
  if (existingId) {
    projectId = existingId;
    const existing = loadProject(existingId);
    if (existing) {
      createdAt = existing.createdAt;
      // Preserve template status if not explicitly provided
      if (params.isTemplate === undefined) {
        templateStatus = existing.isTemplate;
      }
    }
  } else {
    projectId = generateProjectId();
  }

  const projectFile: ProjectFile = {
    id: projectId,
    name,
    createdAt,
    updatedAt: now,
    isTemplate: templateStatus,
    data: {
      songData, // v3 CKS format
      patterns, // Legacy v2 format
      tracks, // Legacy v2 format
      timeline,
      version: DATA_VERSION,
    },
  };

  try {
    localStorage.setItem(
      `${PROJECT_KEY_PREFIX}${projectId}`,
      JSON.stringify(projectFile)
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error(
        'Storage quota exceeded. Please delete some projects to free up space.'
      );
    }
    throw error;
  }

  return projectId;
};

/**
 * Load a project from localStorage
 * @param projectId - Project ID to load
 * @returns Project file or null if not found
 */
export const loadProject = (projectId: string): ProjectFile | null => {
  try {
    const stored = localStorage.getItem(`${PROJECT_KEY_PREFIX}${projectId}`);
    if (!stored) {
      return null;
    }

    const projectFile = JSON.parse(stored) as ProjectFile;
    return projectFile;
  } catch (error) {
    logger.error(`Failed to load project ${projectId}:`, error);
    return null;
  }
};

/**
 * Delete a project from localStorage
 * @param projectId - Project ID to delete
 */
export const deleteProject = (projectId: string): void => {
  localStorage.removeItem(`${PROJECT_KEY_PREFIX}${projectId}`);
};

/**
 * List all saved projects
 * @returns Array of project files sorted by updatedAt (most recent first)
 */
export const listProjects = (): ProjectFile[] => {
  const projects: ProjectFile[] = [];

  // Iterate through all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PROJECT_KEY_PREFIX)) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const projectFile = JSON.parse(stored) as ProjectFile;
          projects.push(projectFile);
        }
      } catch (error) {
        logger.error(`Failed to parse project from key ${key}:`, error);
        // Skip corrupted entries
      }
    }
  }

  // Sort by updatedAt descending (most recent first)
  projects.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return projects;
};

/**
 * Get the template project if one is set
 * @returns Template project file or null if not set
 */
export const getTemplateProject = (): ProjectFile | null => {
  const templateId = localStorage.getItem(TEMPLATE_ID_KEY);
  if (!templateId) {
    return null;
  }

  const project = loadProject(templateId);
  if (!project) {
    // Template project was deleted, clear the reference
    clearTemplateProject();
    return null;
  }

  return project;
};

/**
 * Set a project as the template
 * Clears any previous template and updates the project's template flag
 * @param projectId - Project ID to set as template
 */
export const setTemplateProject = (projectId: string): void => {
  // Clear previous template if any
  const currentTemplateId = localStorage.getItem(TEMPLATE_ID_KEY);
  if (currentTemplateId && currentTemplateId !== projectId) {
    const oldTemplate = loadProject(currentTemplateId);
    if (oldTemplate) {
      // Update old template to non-template
      saveProject({
        id: oldTemplate.id,
        name: oldTemplate.name,
        songData: oldTemplate.data.songData,
        patterns: oldTemplate.data.patterns,
        tracks: oldTemplate.data.tracks,
        timeline: oldTemplate.data.timeline,
        isTemplate: false,
      });
    }
  }

  // Set new template
  localStorage.setItem(TEMPLATE_ID_KEY, projectId);

  // Update project's template flag
  const project = loadProject(projectId);
  if (project) {
    saveProject({
      id: project.id,
      name: project.name,
      songData: project.data.songData,
      patterns: project.data.patterns,
      tracks: project.data.tracks,
      timeline: project.data.timeline,
      isTemplate: true,
    });
  }
};

/**
 * Clear the template project setting
 */
export const clearTemplateProject = (): void => {
  localStorage.removeItem(TEMPLATE_ID_KEY);
};
