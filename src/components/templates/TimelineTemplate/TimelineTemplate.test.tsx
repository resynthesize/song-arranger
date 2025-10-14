/**
 * TimelineTemplate Tests
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TimelineTemplate from './TimelineTemplate';
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

// Helper to create a test store
const createTestStore = () => {
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
  });
};

// Helper to render with Redux Provider
const renderWithProvider = (ui: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('TimelineTemplate', () => {
  it('should render the template', () => {
    renderWithProvider(
      <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
    );
    expect(screen.getByTestId('timeline-template')).toBeInTheDocument();
  });

  it('should render MenuBar', () => {
    renderWithProvider(
      <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
    );
    expect(screen.getByTestId('menu-bar')).toBeInTheDocument();
  });

  it('should render Timeline', () => {
    renderWithProvider(
      <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
    );
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('should render CommandFooter', () => {
    renderWithProvider(
      <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
    );
    expect(screen.getByTestId('command-footer')).toBeInTheDocument();
  });

  it('should pass hasSelection prop to CommandFooter', () => {
    renderWithProvider(
      <TimelineTemplate hasSelection={true} selectionCount={2} isEditing={false} />
    );
    const footer = screen.getByTestId('command-footer');
    expect(footer).toBeInTheDocument();
  });

  it('should pass isEditing prop to CommandFooter', () => {
    renderWithProvider(
      <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={true} />
    );
    const footer = screen.getByTestId('command-footer');
    expect(footer).toBeInTheDocument();
  });

  describe('Pattern Editor Integration', () => {
    it('should not render PatternEditor when no pattern is open', () => {
      renderWithProvider(
        <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
      );
      expect(screen.queryByTestId('pattern-editor')).not.toBeInTheDocument();
    });

    it('should not render ResizableDivider when no pattern is open', () => {
      renderWithProvider(
        <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
      );
      expect(screen.queryByTestId('resizable-divider')).not.toBeInTheDocument();
    });

    it('should render PatternEditor when pattern is open', () => {
      // Use preloaded state instead of dispatching to avoid generated IDs
      const store = configureStore({
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
        preloadedState: {
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
                patternData: {
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
                },
              },
            ],
            editingPatternId: null,
          },
        },
      } as any);

      render(
        <Provider store={store}>
          <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
        </Provider>
      );

      expect(screen.getByTestId('pattern-editor')).toBeInTheDocument();
    });

    it('should render ResizableDivider when pattern is open', () => {
      const store = createTestStore();
      // Dispatch openPattern to set state
      store.dispatch({ type: 'patternEditor/openPattern', payload: 'pattern-1' });
      // Add a pattern so the editor can find it
      store.dispatch({
        type: 'patterns/addPattern',
        payload: {
          id: 'pattern-1',
          trackId: 'track-1',
          position: 0,
          duration: 4,
          patternData: {
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
          },
        },
      });

      render(
        <Provider store={store}>
          <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
        </Provider>
      );

      expect(screen.getByTestId('resizable-divider')).toBeInTheDocument();
    });

    it('should apply timeline-template__content class to Timeline wrapper', () => {
      renderWithProvider(
        <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
      );
      const template = screen.getByTestId('timeline-template');
      const contentWrapper = template.querySelector('.timeline-template__content');
      expect(contentWrapper).toBeInTheDocument();
    });
  });
});
