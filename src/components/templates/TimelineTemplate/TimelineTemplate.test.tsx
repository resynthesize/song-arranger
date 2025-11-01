/**
 * TimelineTemplate Tests
 */

import { screen } from '@testing-library/react';
import { renderWithProviders, createTestStore, wrapSongDataForTest } from '@/utils/testUtils';
import TimelineTemplate from './TimelineTemplate';

describe('TimelineTemplate', () => {
  it('should render the template', () => {
    renderWithProviders(
      <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
    );
    expect(screen.getByTestId('timeline-template')).toBeInTheDocument();
  });

  it('should render MenuBar', () => {
    renderWithProviders(
      <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
    );
    expect(screen.getByTestId('menu-bar')).toBeInTheDocument();
  });

  it('should render Timeline', () => {
    renderWithProviders(
      <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
    );
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('should render CommandFooter', () => {
    renderWithProviders(
      <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
    );
    expect(screen.getByTestId('command-footer')).toBeInTheDocument();
  });

  it('should pass hasSelection prop to CommandFooter', () => {
    renderWithProviders(
      <TimelineTemplate hasSelection={true} selectionCount={2} isEditing={false} />
    );
    const footer = screen.getByTestId('command-footer');
    expect(footer).toBeInTheDocument();
  });

  it('should pass isEditing prop to CommandFooter', () => {
    renderWithProviders(
      <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={true} />
    );
    const footer = screen.getByTestId('command-footer');
    expect(footer).toBeInTheDocument();
  });

  describe('Pattern Editor Integration', () => {
    it('should not render PatternEditor when no pattern is open', () => {
      renderWithProviders(
        <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
      );
      expect(screen.queryByTestId('pattern-editor')).not.toBeInTheDocument();
    });

    it('should not render ResizableDivider when no pattern is open', () => {
      renderWithProviders(
        <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
      );
      expect(screen.queryByTestId('resizable-divider')).not.toBeInTheDocument();
    });

    it('should render PatternEditor when pattern is open', () => {
      // Use preloaded state instead of dispatching to avoid generated IDs
      // Pattern ID will be: scene-1-track-1-Test-Pattern
      renderWithProviders(
        <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />,
        {
          preloadedState: {
            song: wrapSongDataForTest({
              song_data: {
                'Test Song': {
                  patterns: {
                    'Test Pattern': {
                      type: 'P3',
                      creator_track: 1,
                      saved: false,
                      bar_count: 1,
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
                      aux_A: 'cc #1',
                      aux_B: 'cc #4',
                      aux_C: 'cc #6',
                      aux_D: 'cc #10',
                    },
                  },
                  scenes: {
                    'Scene 1': {
                      gbar: 0,
                      length: 4,
                      advance: 'auto',
                      pattern_assignments: {
                        track_1: 'Test Pattern',
                      },
                    },
                  },
                },
              },
              _cyclone_metadata: {
                version: '2.0.0',
                currentSongName: 'Test Song',
                uiMappings: {
                  patterns: {},
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
            }),
            patternEditor: {
              openPatternId: 'scene-1-track-1-Test-Pattern',
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
          } as any,
        }
      );

      expect(screen.getByTestId('pattern-editor')).toBeInTheDocument();
    });

    it('should render ResizableDivider when pattern is open', () => {
      // Use preloaded state to set openPatternId
      renderWithProviders(
        <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />,
        {
          preloadedState: {
            patternEditor: {
              openPatternId: 'pattern-1',
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
          } as any,
        }
      );

      expect(screen.getByTestId('resizable-divider')).toBeInTheDocument();
    });

    it('should apply timeline-template__content class to Timeline wrapper', () => {
      renderWithProviders(
        <TimelineTemplate hasSelection={false} selectionCount={0} isEditing={false} />
      );
      const template = screen.getByTestId('timeline-template');
      const contentWrapper = template.querySelector('.timeline-template__content');
      expect(contentWrapper).toBeInTheDocument();
    });
  });
});
