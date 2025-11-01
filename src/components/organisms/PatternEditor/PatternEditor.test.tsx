/**
 * Cyclone - PatternEditor Component Tests
 * Tests for the PatternEditor organism with Redux integration using CKS format
 * Following TDD approach - write tests first
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/testUtils';
import PatternEditor from './PatternEditor';
import type { RootState } from '@/types';
import type { P3PatternData } from '@/types/patternData';
import type { CirklonSongData } from '@/utils/cirklon/types';

// Helper to create minimal valid P3 pattern data
const createMockP3PatternData = (): P3PatternData => ({
  aux_A: 'cc #1',
  aux_B: 'cc #4',
  aux_C: 'cc #6',
  aux_D: 'cc #10',
  bars: [
    {
      direction: 'forward',
      tbase: '  4',
      last_step: 16,
      xpos: 0,
      reps: 1,
      gbar: false,
      note: Array(16).fill('C 3'),
      velo: Array(16).fill(100),
      length: Array(16).fill(96),
      delay: Array(16).fill(0),
      aux_A_value: Array(16).fill(0),
      aux_B_value: Array(16).fill(0),
      aux_C_value: Array(16).fill(0),
      aux_D_value: Array(16).fill(0),
      gate: Array(16).fill(1),
      tie: Array(16).fill(0),
      skip: Array(16).fill(0),
      note_X: Array(16).fill(0),
      aux_A_flag: Array(16).fill(0),
      aux_B_flag: Array(16).fill(0),
      aux_C_flag: Array(16).fill(0),
      aux_D_flag: Array(16).fill(0),
    },
  ],
});

// Helper to create complete pattern editor state with all required fields
const createMockPatternEditorState = (overrides: Partial<RootState['patternEditor']> = {}) => ({
  openPatternId: null,
  selectedRow: 'note' as const,
  selectedSteps: [],
  currentBarIndex: 0,
  editorHeight: 400,
  clipboardSteps: null,
  viewMode: 'parameters' as const,
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
  ...overrides,
});

// Helper to generate pattern ID from pattern name (matches selector logic)
const getPatternId = (patternName: string) => {
  return `scene-1-track-1-${patternName.replace(/\s+/g, '-')}`;
};

// Helper to create CKS song state with patterns (wrapped in undoable structure)
const createMockSongState = (patterns: Record<string, any> = {}) => {
  // Create pattern assignments for the scene
  const pattern_assignments: Record<string, string> = {};
  Object.keys(patterns).forEach((patternName) => {
    pattern_assignments['track_1'] = patternName; // Assign first pattern to track_1
  });

  return {
    present: {
      song_data: {
        'Test Song': {
          patterns,
          scenes: {
            'Scene 1': {
              gbar: 0,
              length: 4, // 4 bars = 16 beats
              advance: 'auto',
              pattern_assignments,
            },
          },
        },
      },
      _cyclone_metadata: {
        version: '2.0.0',
        currentSongName: 'Test Song',
        uiMappings: {
          patterns: Object.keys(patterns).reduce((acc, key, index) => {
            acc[key] = { reactKey: `pattern-${index + 1}`, trackKey: `Track 1`, sceneName: 'Scene 1' };
            return acc;
          }, {} as Record<string, any>),
          tracks: {
            track_1: { reactKey: 'track-1', trackNumber: 1, color: '#00ff00' },
          },
          scenes: {
            'Scene 1': { reactKey: 'scene-1' },
          },
        },
        trackOrder: ['track_1'],
        sceneOrder: ['Scene 1'],
      },
    } as CirklonSongData,
    past: [],
    future: [],
  };
};

describe('PatternEditor', () => {
  describe('Conditional Rendering', () => {
    it('should not render when openPatternId is null', () => {
      const { container } = renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: null,
          }),
          song: createMockSongState(),
        } as Partial<RootState>,
      });

      expect(screen.queryByTestId('pattern-editor')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it('should not render when pattern not found', () => {
      const { container } = renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: 'non-existent-pattern',
          }),
          song: createMockSongState({
            'P3 Pattern 1': {
              type: 'P3',
              bars: createMockP3PatternData().bars,
            },
          }),
        } as Partial<RootState>,
      });

      expect(screen.queryByTestId('pattern-editor')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it('should show "cannot be edited" message when patternData is undefined', () => {
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('CK Pattern'),
          }),
          song: createMockSongState({
            'CK Pattern': {
              type: 'CK',
              // No bars field (CK patterns don't have editable data)
            },
          }),
        } as Partial<RootState>,
      });

      expect(screen.getByTestId('pattern-editor')).toBeInTheDocument();
      expect(
        screen.getByText(/This pattern type cannot be edited/i)
      ).toBeInTheDocument();
    });
  });

  describe('Valid Pattern Rendering', () => {
    it('should render pattern editor when valid P3 pattern is open', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('P3 Pattern'),
          }),
          song: createMockSongState({
            'P3 Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      expect(screen.getByTestId('pattern-editor')).toBeInTheDocument();
      expect(
        screen.queryByText(/This pattern type cannot be edited/i)
      ).not.toBeInTheDocument();
    });

    it('should display pattern label in header', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('My Test Pattern'),
          }),
          song: createMockSongState({
            'My Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      expect(screen.getByText('My Test Pattern')).toBeInTheDocument();
    });

    it('should display metadata: bar count', () => {
      const patternData = createMockP3PatternData();
      // Add 3 more bars for a total of 4 bars
      patternData.bars.push(
        createMockP3PatternData().bars[0],
        createMockP3PatternData().bars[0],
        createMockP3PatternData().bars[0]
      );

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should show "4 bars"
      expect(screen.getByText(/4\s*bars/i)).toBeInTheDocument();
    });

    it('should display metadata: aux assignments', () => {
      const patternData = createMockP3PatternData();
      patternData.aux_A = 'cc #1';
      patternData.aux_B = 'cc #4';
      patternData.aux_C = 'cc #6';
      patternData.aux_D = 'cc #10';

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should display aux assignments in compact format (A:cc #1 B:cc #4 C:cc #6 D:cc #10)
      expect(screen.getByText(/A:cc #1 B:cc #4 C:cc #6 D:cc #10/i)).toBeInTheDocument();
    });

    it('should handle missing aux assignments gracefully', () => {
      const patternData = createMockP3PatternData();
      // Remove aux assignments
      delete patternData.aux_A;
      delete patternData.aux_B;
      delete patternData.aux_C;
      delete patternData.aux_D;

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should display "--" for missing aux assignments in compact format
      expect(screen.getByText(/A:-- B:-- C:-- D:--/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it.skip('should close editor when close button clicked', async () => {
      const user = userEvent.setup();
      const patternData = createMockP3PatternData();
      const { store } = renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Verify that closePattern action was dispatched by checking Redux state
      const state = store.getState();
      expect(state.patternEditor.openPatternId).toBeNull();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply editorHeight from Redux as inline style', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            editorHeight: 500, // Custom height
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      const editor = screen.getByTestId('pattern-editor');
      expect(editor).toHaveStyle({ height: '500px' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on close button', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close pattern editor');
    });

    it('should have semantic structure with header region', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should have a header element or section with role
      const header = screen.getByTestId('pattern-editor-header');
      expect(header).toBeInTheDocument();
    });

    it('should have placeholder content area for future implementation', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should have a content area placeholder
      const contentArea = screen.getByTestId('pattern-editor-content');
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle pattern with empty label', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId(''),
          }),
          song: createMockSongState({
            '': { // Empty pattern name
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should display "Untitled" or similar default
      expect(screen.getByText(/untitled pattern/i)).toBeInTheDocument();
    });

    it('should handle pattern with single bar', () => {
      const patternData = createMockP3PatternData();
      // patternData already has 1 bar

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Single Bar'),
          }),
          song: createMockSongState({
            'Single Bar': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should show "1 bar" (singular)
      expect(screen.getByText(/1\s*bar/i)).toBeInTheDocument();
    });

    it('should handle pattern with maximum bars', () => {
      const patternData = createMockP3PatternData();
      // Add 15 more bars for a total of 16 bars (max)
      for (let i = 0; i < 15; i++) {
        patternData.bars.push(createMockP3PatternData().bars[0]);
      }

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Max Bars'),
          }),
          song: createMockSongState({
            'Max Bars': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should show "16 bars"
      expect(screen.getByText(/16\s*bars/i)).toBeInTheDocument();
    });
  });

  describe('Bar Navigation', () => {
    it('should show bar navigation when multiple bars exist', () => {
      const patternData = createMockP3PatternData();
      // Add 3 more bars for a total of 4 bars
      patternData.bars.push(
        createMockP3PatternData().bars[0],
        createMockP3PatternData().bars[0],
        createMockP3PatternData().bars[0]
      );

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should show bar navigation UI (compact format: "1/4")
      expect(screen.getByText(/1\/4/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should not show bar navigation when single bar', () => {
      const patternData = createMockP3PatternData();
      // Only 1 bar (default)

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should not show bar navigation UI
      expect(screen.queryByText(/1\/1/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });

    it('should disable Previous button on first bar', () => {
      const patternData = createMockP3PatternData();
      patternData.bars.push(createMockP3PatternData().bars[0]);

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            currentBarIndex: 0, // First bar
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable Next button on last bar', () => {
      const patternData = createMockP3PatternData();
      patternData.bars.push(createMockP3PatternData().bars[0]);

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            currentBarIndex: 1, // Last bar (0-indexed, so bar 2 of 2)
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('should navigate to previous bar when Previous clicked', async () => {
      const user = userEvent.setup();
      const patternData = createMockP3PatternData();
      patternData.bars.push(createMockP3PatternData().bars[0]);

      const { store } = renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            currentBarIndex: 1, // Second bar
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      // Verify Redux state updated
      const state = store.getState();
      expect(state.patternEditor.currentBarIndex).toBe(0);
    });

    it('should navigate to next bar when Next clicked', async () => {
      const user = userEvent.setup();
      const patternData = createMockP3PatternData();
      patternData.bars.push(createMockP3PatternData().bars[0]);

      const { store } = renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            currentBarIndex: 0, // First bar
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Verify Redux state updated
      const state = store.getState();
      expect(state.patternEditor.currentBarIndex).toBe(1);
    });

    it('should display correct bar number in navigation', () => {
      const patternData = createMockP3PatternData();
      patternData.bars.push(
        createMockP3PatternData().bars[0],
        createMockP3PatternData().bars[0]
      );

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            currentBarIndex: 1, // Second bar (0-indexed)
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should show "2/3" (compact format, 1-indexed for display)
      expect(screen.getByText(/2\/3/i)).toBeInTheDocument();
    });

    it('should handle invalid bar index gracefully', () => {
      const patternData = createMockP3PatternData();
      // Only 1 bar

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            currentBarIndex: 5, // Invalid index (out of bounds)
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should show error message or handle gracefully
      expect(screen.getByText(/Invalid bar index/i)).toBeInTheDocument();
    });
  });

  describe('Multi-Row View and View Mode Toggle', () => {
    it('should render ViewModeToggle button', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should find ViewModeToggle button
      expect(screen.getByRole('button', { name: /toggle view mode/i })).toBeInTheDocument();
    });

    it('should display "P" in ViewModeToggle when in parameters view', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            viewMode: 'parameters',
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('should display "A" in ViewModeToggle when in aux view', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            selectedRow: 'auxA',
            viewMode: 'aux',
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Query specifically for the ViewModeToggle button and check its content
      const toggleButton = screen.getByRole('button', { name: /toggle view mode/i });
      expect(toggleButton).toHaveTextContent('A');
    });

    it('should toggle viewMode when ViewModeToggle is clicked', async () => {
      const user = userEvent.setup();
      const patternData = createMockP3PatternData();
      const { store } = renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            viewMode: 'parameters',
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      const toggleButton = screen.getByRole('button', { name: /toggle view mode/i });
      await user.click(toggleButton);

      // Verify Redux state updated
      const state = store.getState();
      expect(state.patternEditor.viewMode).toBe('aux');
      expect(state.patternEditor.selectedRow).toBe('auxA');
    });

    it('should render 4 PatternRow components in parameters view', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            viewMode: 'parameters',
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should find all 4 parameter row labels (abbreviated)
      // Note: Each label appears twice - once in toolbar, once in row label
      expect(screen.getAllByText('N').length).toBeGreaterThan(0);
      expect(screen.getAllByText('V').length).toBeGreaterThan(0);
      expect(screen.getAllByText('L').length).toBeGreaterThan(0);
      expect(screen.getAllByText('D').length).toBeGreaterThan(0);
    });

    it('should render 4 PatternRow components in aux view', async () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            selectedRow: 'auxA',
            viewMode: 'aux',
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should find all 4 aux row labels showing actual aux assignments
      expect(screen.getByText('cc #1')).toBeInTheDocument();
      expect(screen.getByText('cc #4')).toBeInTheDocument();
      expect(screen.getByText('cc #6')).toBeInTheDocument();
      expect(screen.getByText('cc #10')).toBeInTheDocument();
    });

    it('should show aux labels with custom names from pattern data', () => {
      const patternData = createMockP3PatternData();
      patternData.aux_A = 'cutoff';
      patternData.aux_B = 'resonance';
      patternData.aux_C = 'attack';
      patternData.aux_D = 'release';

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            selectedRow: 'auxA',
            viewMode: 'aux',
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      expect(screen.getByText('cutoff')).toBeInTheDocument();
      expect(screen.getByText('resonance')).toBeInTheDocument();
      expect(screen.getByText('attack')).toBeInTheDocument();
      expect(screen.getByText('release')).toBeInTheDocument();
    });

    it('should handle missing aux assignments gracefully in aux view', () => {
      const patternData = createMockP3PatternData();
      delete patternData.aux_A;
      delete patternData.aux_B;
      delete patternData.aux_C;
      delete patternData.aux_D;

      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
            selectedRow: 'auxA',
            viewMode: 'aux',
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should show generic labels when aux assignments are missing (just single letter)
      // Note: There may be multiple 'A', 'B', 'C', 'D' on the page, so we use getAllByText
      expect(screen.getAllByText('A').length).toBeGreaterThan(0);
      expect(screen.getAllByText('B').length).toBeGreaterThan(0);
      expect(screen.getAllByText('C').length).toBeGreaterThan(0);
      expect(screen.getAllByText('D').length).toBeGreaterThan(0);
    });

    it('should not render RowSelector component anymore', () => {
      const patternData = createMockP3PatternData();
      renderWithProviders(<PatternEditor />, {
        preloadedState: {
          patternEditor: createMockPatternEditorState({
            openPatternId: getPatternId('Test Pattern'),
          }),
          song: createMockSongState({
            'Test Pattern': {
              type: 'P3',
              ...patternData,
            },
          }),
        } as Partial<RootState>,
      });

      // Should NOT find RowSelector (tablist role)
      expect(screen.queryByRole('tablist', { name: /pattern row selector/i })).not.toBeInTheDocument();
    });
  });
});
