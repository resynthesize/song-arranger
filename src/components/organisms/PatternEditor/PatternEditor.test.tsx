/**
 * Cyclone - PatternEditor Component Tests
 * Tests for the PatternEditor organism with Redux integration
 * Following TDD approach - write tests first
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PatternEditor from './PatternEditor';
import timelineReducer from '@/store/slices/timelineSlice';
import tracksReducer from '@/store/slices/tracksSlice';
import patternsReducer from '@/store/slices/patternsSlice';
import selectionReducer from '@/store/slices/selectionSlice';
import scenesReducer from '@/store/slices/scenesSlice';
import crtEffectsReducer from '@/store/slices/crtEffectsSlice';
import projectReducer from '@/store/slices/projectSlice';
import quickInputReducer from '@/store/slices/quickInputSlice';
import commandPaletteReducer from '@/store/slices/commandPaletteSlice';
import statusReducer from '@/store/slices/statusSlice';
import themeReducer from '@/store/slices/themeSlice';
import patternEditorReducer from '@/store/slices/patternEditorSlice';
import type { RootState } from '@/types';
import type { P3PatternData } from '@/types/patternData';

const createMockStore = (initialState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      timeline: timelineReducer,
      tracks: tracksReducer,
      patterns: patternsReducer,
      selection: selectionReducer,
      scenes: scenesReducer,
      crtEffects: crtEffectsReducer,
      project: projectReducer,
      quickInput: quickInputReducer,
      commandPalette: commandPaletteReducer,
      status: statusReducer,
      theme: themeReducer,
      patternEditor: patternEditorReducer,
    },
    preloadedState: initialState as RootState,
  });
};

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

describe('PatternEditor', () => {
  describe('Conditional Rendering', () => {
    it('should not render when openPatternId is null', () => {
      const store = createMockStore({
        patternEditor: {
          openPatternId: null,
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [],
          editingPatternId: null,
        },
      });

      const { container } = render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      expect(screen.queryByTestId('pattern-editor')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it('should not render when pattern not found', () => {
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'non-existent-pattern',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
            },
          ],
          editingPatternId: null,
        },
      });

      const { container } = render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      expect(screen.queryByTestId('pattern-editor')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it('should show "cannot be edited" message when patternData is undefined', () => {
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'CK Pattern',
              patternType: 'CK',
              // No patternData field
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      expect(screen.getByTestId('pattern-editor')).toBeInTheDocument();
      expect(
        screen.getByText(/This pattern type cannot be edited/i)
      ).toBeInTheDocument();
    });
  });

  describe('Valid Pattern Rendering', () => {
    it('should render pattern editor when valid P3 pattern is open', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'P3 Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      expect(screen.getByTestId('pattern-editor')).toBeInTheDocument();
      expect(
        screen.queryByText(/This pattern type cannot be edited/i)
      ).not.toBeInTheDocument();
    });

    it('should display pattern label in header', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'My Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

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

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should show "4 bars"
      expect(screen.getByText(/4\s*bars/i)).toBeInTheDocument();
    });

    it('should display metadata: aux assignments', () => {
      const patternData = createMockP3PatternData();
      patternData.aux_A = 'cc #1';
      patternData.aux_B = 'cc #4';
      patternData.aux_C = 'cc #6';
      patternData.aux_D = 'cc #10';

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should display aux assignments
      expect(screen.getByText(/aux_A:\s*cc #1/i)).toBeInTheDocument();
      expect(screen.getByText(/aux_B:\s*cc #4/i)).toBeInTheDocument();
      expect(screen.getByText(/aux_C:\s*cc #6/i)).toBeInTheDocument();
      expect(screen.getByText(/aux_D:\s*cc #10/i)).toBeInTheDocument();
    });

    it('should handle missing aux assignments gracefully', () => {
      const patternData = createMockP3PatternData();
      // Remove aux assignments
      delete patternData.aux_A;
      delete patternData.aux_B;
      delete patternData.aux_C;
      delete patternData.aux_D;

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should display "none" or "-" for missing aux assignments
      expect(screen.getByText(/aux_A:\s*(none|-|—)/i)).toBeInTheDocument();
      expect(screen.getByText(/aux_B:\s*(none|-|—)/i)).toBeInTheDocument();
      expect(screen.getByText(/aux_C:\s*(none|-|—)/i)).toBeInTheDocument();
      expect(screen.getByText(/aux_D:\s*(none|-|—)/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should close editor when close button clicked', async () => {
      const user = userEvent.setup();
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

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
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 500, // Custom height
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      const editor = screen.getByTestId('pattern-editor');
      expect(editor).toHaveStyle({ height: '500px' });
    });

    it('should update height when editorHeight changes', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      const { rerender } = render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      let editor = screen.getByTestId('pattern-editor');
      expect(editor).toHaveStyle({ height: '400px' });

      // Update the store with new height
      store.dispatch({ type: 'patternEditor/setEditorHeight', payload: 600 });

      // Re-render with the same provider/store
      rerender(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      editor = screen.getByTestId('pattern-editor');
      expect(editor).toHaveStyle({ height: '600px' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on close button', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close pattern editor');
    });

    it('should have semantic structure with header region', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should have a header element or section with role
      const header = screen.getByTestId('pattern-editor-header');
      expect(header).toBeInTheDocument();
    });

    it('should have placeholder content area for future implementation', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should have a content area placeholder
      const contentArea = screen.getByTestId('pattern-editor-content');
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle pattern with empty label', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              // No label field
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should display "Untitled" or similar default
      expect(screen.getByText(/untitled pattern/i)).toBeInTheDocument();
    });

    it('should handle pattern with single bar', () => {
      const patternData = createMockP3PatternData();
      // patternData already has 1 bar

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Single Bar',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should show "1 bar" (singular)
      expect(screen.getByText(/1\s*bar/i)).toBeInTheDocument();
    });

    it('should handle pattern with maximum bars', () => {
      const patternData = createMockP3PatternData();
      // Add 15 more bars for a total of 16 bars (max)
      for (let i = 0; i < 15; i++) {
        patternData.bars.push(createMockP3PatternData().bars[0]);
      }

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Max Bars',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should show "16 bars"
      expect(screen.getByText(/16\s*bars/i)).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    // NOTE: RowSelector tests removed - component replaced with multi-row view
    // The multi-row view tests are in the "Multi-Row View and View Mode Toggle" describe block
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

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should show bar navigation UI
      expect(screen.getByText(/Bar 1 of 4/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should not show bar navigation when single bar', () => {
      const patternData = createMockP3PatternData();
      // Only 1 bar (default)

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should not show bar navigation UI
      expect(screen.queryByText(/Bar 1 of/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });

    it('should disable Previous button on first bar', () => {
      const patternData = createMockP3PatternData();
      patternData.bars.push(createMockP3PatternData().bars[0]);

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0, // First bar
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable Next button on last bar', () => {
      const patternData = createMockP3PatternData();
      patternData.bars.push(createMockP3PatternData().bars[0]);

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 1, // Last bar (0-indexed, so bar 2 of 2)
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('should navigate to previous bar when Previous clicked', async () => {
      const user = userEvent.setup();
      const patternData = createMockP3PatternData();
      patternData.bars.push(createMockP3PatternData().bars[0]);

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 1, // Second bar
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

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

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0, // First bar
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

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

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 1, // Second bar (0-indexed)
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should show "Bar 2 of 3" (1-indexed for display)
      expect(screen.getByText(/Bar 2 of 3/i)).toBeInTheDocument();
    });

    it('should handle invalid bar index gracefully', () => {
      const patternData = createMockP3PatternData();
      // Only 1 bar

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 5, // Invalid index (out of bounds)
          editorHeight: 400,
          clipboardSteps: null,
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should show error message or handle gracefully
      expect(screen.getByText(/Invalid bar index/i)).toBeInTheDocument();
    });
  });

  describe('Multi-Row View and View Mode Toggle', () => {
    it('should render ViewModeToggle button', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
          viewMode: 'parameters',
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should find ViewModeToggle button
      expect(screen.getByRole('button', { name: /toggle view mode/i })).toBeInTheDocument();
    });

    it('should display "P" in ViewModeToggle when in parameters view', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
          viewMode: 'parameters',
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('should display "A" in ViewModeToggle when in aux view', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'auxA',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
          viewMode: 'aux',
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should toggle viewMode when ViewModeToggle is clicked', async () => {
      const user = userEvent.setup();
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
          viewMode: 'parameters',
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      const toggleButton = screen.getByRole('button', { name: /toggle view mode/i });
      await user.click(toggleButton);

      // Verify Redux state updated
      const state = store.getState();
      expect(state.patternEditor.viewMode).toBe('aux');
      expect(state.patternEditor.selectedRow).toBe('auxA');
    });

    it('should render 4 PatternRow components in parameters view', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
          viewMode: 'parameters',
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should find all 4 parameter row labels
      expect(screen.getByText('NOTE')).toBeInTheDocument();
      expect(screen.getByText('VELO')).toBeInTheDocument();
      expect(screen.getByText('LENGTH')).toBeInTheDocument();
      expect(screen.getByText('DELAY')).toBeInTheDocument();
    });

    it('should render 4 PatternRow components in aux view', async () => {
      const user = userEvent.setup();
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'auxA',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
          viewMode: 'aux',
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

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

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'auxA',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
          viewMode: 'aux',
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

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

      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'auxA',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
          viewMode: 'aux',
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should show generic labels when aux assignments are missing
      expect(screen.getByText(/AUX A/i)).toBeInTheDocument();
      expect(screen.getByText(/AUX B/i)).toBeInTheDocument();
      expect(screen.getByText(/AUX C/i)).toBeInTheDocument();
      expect(screen.getByText(/AUX D/i)).toBeInTheDocument();
    });

    it('should not render RowSelector component anymore', () => {
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
          viewMode: 'parameters',
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Should NOT find RowSelector (tablist role)
      expect(screen.queryByRole('tablist', { name: /pattern row selector/i })).not.toBeInTheDocument();
    });

    it('should switch between parameter and aux rows when toggling view mode', async () => {
      const user = userEvent.setup();
      const patternData = createMockP3PatternData();
      const store = createMockStore({
        patternEditor: {
          openPatternId: 'pattern-1',
          selectedRow: 'note',
          selectedSteps: [],
          currentBarIndex: 0,
          editorHeight: 400,
          clipboardSteps: null,
          viewMode: 'parameters',
        },
        patterns: {
          patterns: [
            {
              id: 'pattern-1',
              trackId: 'track-1',
              position: 0,
              duration: 4,
              label: 'Test Pattern',
              patternType: 'P3',
              patternData,
            },
          ],
          editingPatternId: null,
        },
      });

      const { rerender } = render(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Initially in parameters view
      expect(screen.getByText('NOTE')).toBeInTheDocument();
      expect(screen.queryByText('cc #1')).not.toBeInTheDocument();

      // Toggle to aux view
      const toggleButton = screen.getByRole('button', { name: /toggle view mode/i });
      await user.click(toggleButton);

      // Re-render with updated state
      rerender(
        <Provider store={store}>
          <PatternEditor />
        </Provider>
      );

      // Now in aux view
      expect(screen.queryByText('NOTE')).not.toBeInTheDocument();
      expect(screen.getByText('cc #1')).toBeInTheDocument();
    });
  });
});
