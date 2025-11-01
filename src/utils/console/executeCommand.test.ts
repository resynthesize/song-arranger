/**
 * Cyclone - Execute Command Tests
 */

import { executeCommand, validateCommand } from './executeCommand';
import type { AppDispatch } from '@/store/store';
import type { RootState } from '@/types';

// Mock dispatch and state
const mockDispatch = jest.fn() as unknown as AppDispatch;
const mockState: RootState = {
  tracks: { tracks: [], editingTrackId: null, movingTrackId: null },
  patterns: { patterns: [], editingPatternId: null },
  timeline: {
    viewport: { offsetBeats: 0, zoom: 100, widthPx: 1920, heightPx: 1080 },
    verticalZoom: 100,
    playheadPosition: 0,
    isPlaying: false,
    tempo: 120,
    snapValue: 1,
    snapMode: 'fixed',
    minimapVisible: true,
  },
  selection: { selectedPatternIds: [], currentTrackId: null },
  scenes: { scenes: [], editingSceneId: null },
  patternEditor: {
    openPatternId: null,
    selectedRow: 'note',
    selectedSteps: [],
    currentBarIndex: 0,
    editorHeight: 400,
    clipboardSteps: null,
    viewMode: 'parameters',
    visibleRows: {
      note: true,
      velocity: true,
      length: true,
      delay: true,
      auxA: true,
      auxB: true,
      auxC: true,
      auxD: true,
    },
    collapsedRows: {
      note: false,
      velocity: false,
      length: false,
      delay: false,
      auxA: false,
      auxB: false,
      auxC: false,
      auxD: false,
    },
  },
  song: {
    present: {
      song_data: {},
      _cyclone_metadata: {
        version: '2.0.0',
        currentSongName: '',
        uiMappings: { patterns: {}, tracks: {}, scenes: {} },
        trackOrder: [],
        sceneOrder: [],
      },
    },
    past: [],
    future: [],
  },
  theme: { currentTheme: 'retro', crtEffectsEnabled: false },
  commandPalette: { isOpen: false },
  quickInput: { isOpen: false, mode: 'pattern', patternId: null },
  crtEffects: { scanlineIntensity: 10, phosphorGlow: 5 },
  status: { message: '', type: 'info', timestamp: 0 },
  console: {
    history: [],
    currentInput: '',
    historyIndex: -1,
    isExpanded: false,
    autocompleteVisible: false,
    autocompleteOptions: [],
    cursorPosition: 0,
  },
};

describe('executeCommand', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  describe('basic expressions', () => {
    it('should execute simple math', () => {
      const result = executeCommand('2 + 2', mockDispatch, mockState);
      expect(result.output).toBe('4');
      expect(result.error).toBeUndefined();
    });

    it('should execute string expressions', () => {
      const result = executeCommand('"hello"', mockDispatch, mockState);
      expect(result.output).toBe('hello');
    });

    it('should handle empty commands', () => {
      const result = executeCommand('', mockDispatch, mockState);
      expect(result.output).toBe('');
      expect(result.error).toBeUndefined();
    });

    it('should handle whitespace-only commands', () => {
      const result = executeCommand('   ', mockDispatch, mockState);
      expect(result.output).toBe('');
    });
  });

  describe('function calls', () => {
    it('should execute help() function', () => {
      const result = executeCommand('help()', mockDispatch, mockState);
      expect(result.output).toContain('Cyclone Live Coding Console');
      expect(result.error).toBeUndefined();
    });

    it('should access Math utilities', () => {
      const result = executeCommand('Math.floor(4.7)', mockDispatch, mockState);
      expect(result.output).toBe('4');
    });
  });

  describe('state access', () => {
    it('should access read-only state info', () => {
      const result = executeCommand('info.trackCount', mockDispatch, mockState);
      expect(result.output).toBe('0');
    });

    it('should access pattern count', () => {
      const result = executeCommand('info.patternCount', mockDispatch, mockState);
      expect(result.output).toBe('0');
    });
  });

  describe('error handling', () => {
    it('should catch syntax errors', () => {
      const result = executeCommand('2 +', mockDispatch, mockState);
      expect(result.error).toBeDefined();
      expect(result.output).toBeUndefined();
    });

    it('should catch reference errors', () => {
      const result = executeCommand('undefinedVariable', mockDispatch, mockState);
      expect(result.error).toContain('ReferenceError');
    });

    it('should catch type errors', () => {
      const result = executeCommand('null.foo()', mockDispatch, mockState);
      expect(result.error).toContain('TypeError');
    });
  });

  describe('result formatting', () => {
    it('should format undefined as empty string', () => {
      const result = executeCommand('undefined', mockDispatch, mockState);
      expect(result.output).toBe('');
    });

    it('should format null', () => {
      const result = executeCommand('null', mockDispatch, mockState);
      expect(result.output).toBe('null');
    });

    it('should format booleans', () => {
      const result = executeCommand('true', mockDispatch, mockState);
      expect(result.output).toBe('true');
    });

    it('should format objects as JSON', () => {
      const result = executeCommand('({ a: 1, b: 2 })', mockDispatch, mockState);
      expect(result.output).toContain('"a": 1');
      expect(result.output).toContain('"b": 2');
    });

    it('should format arrays as JSON', () => {
      const result = executeCommand('[1, 2, 3]', mockDispatch, mockState);
      expect(result.output).toContain('1');
      expect(result.output).toContain('2');
      expect(result.output).toContain('3');
    });
  });
});

describe('validateCommand', () => {
  it('should allow valid commands', () => {
    expect(validateCommand('2 + 2')).toBeNull();
    expect(validateCommand('help()')).toBeNull();
    expect(validateCommand('pattern("A01")')).toBeNull();
  });

  it('should allow empty commands', () => {
    expect(validateCommand('')).toBeNull();
    expect(validateCommand('   ')).toBeNull();
  });

  it('should reject dangerous patterns', () => {
    expect(validateCommand('import fs from "fs"')).toBeTruthy();
    expect(validateCommand('require("fs")')).toBeTruthy();
    expect(validateCommand('eval("code")')).toBeTruthy();
    expect(validateCommand('Function("code")')).toBeTruthy();
  });
});
