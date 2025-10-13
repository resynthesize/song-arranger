/**
 * Song Arranger - Storage Utilities Tests
 * TDD tests for localStorage-based project file management
 */

import type { Pattern, Track, TimelineState } from '@/types';
import {
  saveProject,
  loadProject,
  deleteProject,
  listProjects,
  getTemplateProject,
  setTemplateProject,
  clearTemplateProject,
  type ProjectFile,
} from './storage';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('saveProject', () => {
    it('should save a new project to localStorage', () => {
      const patterns: Pattern[] = [
        { id: 'pattern-1', trackId: 'track-1', position: 0, duration: 4 },
      ];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      const projectId = saveProject({
        name: 'Test Project',
        patterns,
        tracks,
        timeline,
      });

      expect(projectId).toBeTruthy();
      expect(typeof projectId).toBe('string');

      // Verify it's stored in localStorage
      const stored = localStorage.getItem(`project:${projectId}`);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!) as ProjectFile;
      expect(parsed.name).toBe('Test Project');
      expect(parsed.data.patterns).toEqual(patterns);
      expect(parsed.data.tracks).toEqual(tracks);
      expect(parsed.data.timeline).toEqual(timeline);
      expect(parsed.isTemplate).toBe(false);
    });

    it('should update an existing project when id is provided', () => {
      const initialPatterns: Pattern[] = [
        { id: 'pattern-1', trackId: 'track-1', position: 0, duration: 4 },
      ];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      // Use fake timers for this test
      jest.useFakeTimers();

      // Save initial project
      const projectId = saveProject({
        name: 'Initial Name',
        patterns: initialPatterns,
        tracks,
        timeline,
      });

      // Advance time to ensure different timestamp
      jest.advanceTimersByTime(1000);

      // Update the project
      const updatedPatterns: Pattern[] = [
        { id: 'pattern-1', trackId: 'track-1', position: 0, duration: 8 },
        { id: 'pattern-2', trackId: 'track-1', position: 8, duration: 4 },
      ];

      saveProject({
        id: projectId,
        name: 'Updated Name',
        patterns: updatedPatterns,
        tracks,
        timeline,
      });

      const stored = localStorage.getItem(`project:${projectId}`);
      const parsed = JSON.parse(stored!) as ProjectFile;

      expect(parsed.name).toBe('Updated Name');
      expect(parsed.data.patterns).toEqual(updatedPatterns);
      expect(parsed.updatedAt).not.toBe(parsed.createdAt);

      jest.useRealTimers();
    });

    it('should preserve template status when updating', () => {
      const patterns: Pattern[] = [];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      // Save as template
      const projectId = saveProject({
        name: 'Template',
        patterns,
        tracks,
        timeline,
        isTemplate: true,
      });

      // Update without specifying template
      saveProject({
        id: projectId,
        name: 'Updated Template',
        patterns,
        tracks,
        timeline,
      });

      const stored = localStorage.getItem(`project:${projectId}`);
      const parsed = JSON.parse(stored!) as ProjectFile;

      expect(parsed.isTemplate).toBe(true);
    });
  });

  describe('loadProject', () => {
    it('should load a project from localStorage', () => {
      const patterns: Pattern[] = [
        { id: 'pattern-1', trackId: 'track-1', position: 0, duration: 4 },
      ];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      const projectId = saveProject({
        name: 'Test Project',
        patterns,
        tracks,
        timeline,
      });

      const loaded = loadProject(projectId);

      expect(loaded).toBeTruthy();
      expect(loaded!.id).toBe(projectId);
      expect(loaded!.name).toBe('Test Project');
      expect(loaded!.data.patterns).toEqual(patterns);
      expect(loaded!.data.tracks).toEqual(tracks);
      expect(loaded!.data.timeline).toEqual(timeline);
    });

    it('should return null for non-existent project', () => {
      const loaded = loadProject('non-existent-id');
      expect(loaded).toBeNull();
    });

    it('should return null for corrupted data', () => {
      localStorage.setItem('project:corrupted', 'invalid json');
      const loaded = loadProject('corrupted');
      expect(loaded).toBeNull();
    });
  });

  describe('deleteProject', () => {
    it('should delete a project from localStorage', () => {
      const patterns: Pattern[] = [];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      const projectId = saveProject({
        name: 'To Delete',
        patterns,
        tracks,
        timeline,
      });

      expect(localStorage.getItem(`project:${projectId}`)).toBeTruthy();

      deleteProject(projectId);

      expect(localStorage.getItem(`project:${projectId}`)).toBeNull();
    });

    it('should not throw when deleting non-existent project', () => {
      expect(() => deleteProject('non-existent')).not.toThrow();
    });
  });

  describe('listProjects', () => {
    it('should return empty array when no projects exist', () => {
      const projects = listProjects();
      expect(projects).toEqual([]);
    });

    it('should list all saved projects', () => {
      const patterns: Pattern[] = [];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      const id1 = saveProject({ name: 'Project 1', patterns, tracks, timeline });
      const id2 = saveProject({ name: 'Project 2', patterns, tracks, timeline });
      const id3 = saveProject({ name: 'Project 3', patterns, tracks, timeline });

      const projects = listProjects();

      expect(projects).toHaveLength(3);
      expect(projects.map((p) => p.id)).toContain(id1);
      expect(projects.map((p) => p.id)).toContain(id2);
      expect(projects.map((p) => p.id)).toContain(id3);
    });

    it('should sort projects by updatedAt descending (most recent first)', () => {
      const patterns: Pattern[] = [];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      // Save projects with different timestamps
      saveProject({ name: 'Old Project', patterns, tracks, timeline });

      // Wait a bit to ensure different timestamps
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      saveProject({ name: 'New Project', patterns, tracks, timeline });

      jest.useRealTimers();

      const projects = listProjects();

      expect(projects[0]?.name).toBe('New Project');
      expect(projects[1]?.name).toBe('Old Project');
    });

    it('should ignore non-project localStorage keys', () => {
      localStorage.setItem('other-key', 'value');
      localStorage.setItem('template-id', 'some-id');

      const projects = listProjects();
      expect(projects).toEqual([]);
    });

    it('should skip corrupted project entries', () => {
      const patterns: Pattern[] = [];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      saveProject({ name: 'Valid Project', patterns, tracks, timeline });
      localStorage.setItem('project:corrupted', 'invalid json');

      const projects = listProjects();

      expect(projects).toHaveLength(1);
      expect(projects[0]?.name).toBe('Valid Project');
    });
  });

  describe('template management', () => {
    it('should set and get template project', () => {
      const patterns: Pattern[] = [
        { id: 'pattern-1', trackId: 'track-1', position: 0, duration: 4 },
      ];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      const projectId = saveProject({
        name: 'Template Project',
        patterns,
        tracks,
        timeline,
        isTemplate: true,
      });

      setTemplateProject(projectId);

      const template = getTemplateProject();
      expect(template).toBeTruthy();
      expect(template!.id).toBe(projectId);
      expect(template!.name).toBe('Template Project');
      expect(template!.isTemplate).toBe(true);
    });

    it('should return null when no template is set', () => {
      const template = getTemplateProject();
      expect(template).toBeNull();
    });

    it('should return null when template project does not exist', () => {
      localStorage.setItem('template-id', 'non-existent-id');
      const template = getTemplateProject();
      expect(template).toBeNull();
    });

    it('should clear template project', () => {
      const patterns: Pattern[] = [];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      const projectId = saveProject({
        name: 'Template',
        patterns,
        tracks,
        timeline,
        isTemplate: true,
      });

      setTemplateProject(projectId);
      expect(getTemplateProject()).toBeTruthy();

      clearTemplateProject();
      expect(getTemplateProject()).toBeNull();
    });

    it('should update template flag when setting as template', () => {
      const patterns: Pattern[] = [];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      const projectId = saveProject({
        name: 'Regular Project',
        patterns,
        tracks,
        timeline,
        isTemplate: false,
      });

      setTemplateProject(projectId);

      const project = loadProject(projectId);
      expect(project!.isTemplate).toBe(true);
    });

    it('should clear previous template when setting new one', () => {
      const patterns: Pattern[] = [];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      const id1 = saveProject({
        name: 'Template 1',
        patterns,
        tracks,
        timeline,
        isTemplate: true,
      });

      const id2 = saveProject({
        name: 'Template 2',
        patterns,
        tracks,
        timeline,
        isTemplate: true,
      });

      setTemplateProject(id1);
      setTemplateProject(id2);

      const template = getTemplateProject();
      expect(template!.id).toBe(id2);

      const oldTemplate = loadProject(id1);
      expect(oldTemplate!.isTemplate).toBe(false);
    });
  });

  describe('storage quota handling', () => {
    it('should throw error when localStorage quota is exceeded', () => {
      // Mock quota exceeded error
      const originalSetItem = localStorage.setItem;
      const quotaError = new Error('Storage quota exceeded');
      Object.defineProperty(quotaError, 'name', {
        value: 'QuotaExceededError',
        writable: false,
      });
      localStorage.setItem = jest.fn(() => {
        throw quotaError;
      });

      const patterns: Pattern[] = [];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      expect(() => {
        saveProject({ name: 'Too Big', patterns, tracks, timeline });
      }).toThrow('Storage quota exceeded');

      localStorage.setItem = originalSetItem;
    });
  });

  describe('data versioning', () => {
    it('should include version number in saved projects', () => {
      const patterns: Pattern[] = [];
      const tracks: Track[] = [{ id: 'track-1', name: 'Track 1' }];
      const timeline: TimelineState = {
        viewport: { offsetBeats: 0, zoom: 5, widthPx: 1600, heightPx: 600 },
        playheadPosition: 0,
        isPlaying: false,
        tempo: 120,
        snapValue: 1,
        snapMode: 'grid',
        verticalZoom: 100,
        minimapVisible: false,
      };

      const projectId = saveProject({
        name: 'Versioned Project',
        patterns,
        tracks,
        timeline,
      });

      const project = loadProject(projectId);
      expect(project!.data.version).toBeTruthy();
      expect(typeof project!.data.version).toBe('string');
    });
  });
});
