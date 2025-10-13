/**
 * Song Arranger - Storage Utilities
 * localStorage-based project file management
 */

import type { Pattern, Track, TimelineState } from '@/types';
import { logger } from './debug';

// Current data version - v2.0.0 is a breaking change (Lane→Track, Clip→Pattern)
const DATA_VERSION = '2.0.0';

// localStorage key prefixes
const PROJECT_KEY_PREFIX = 'project:';
const TEMPLATE_ID_KEY = 'template-id';

/**
 * Project file structure stored in localStorage
 */
export interface ProjectFile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isTemplate: boolean;
  data: {
    patterns: Pattern[];
    tracks: Track[];
    timeline: TimelineState;
    version: string;
  };
}

/**
 * Input parameters for saving a project
 */
export interface SaveProjectParams {
  id?: string;
  name: string;
  patterns: Pattern[];
  tracks: Track[];
  timeline: TimelineState;
  isTemplate?: boolean;
}

/**
 * Generate a unique project ID
 */
const generateProjectId = (): string => {
  return `${Date.now().toString()}-${Math.random().toString(36).slice(2, 11)}`;
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
      patterns,
      tracks,
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
