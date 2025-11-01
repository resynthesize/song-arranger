/**
 * DurationDisplay Component Tests
 */

import { screen, cleanup } from '@testing-library/react';
import { renderWithProviders, createTestSongData } from '@/utils/testUtils';
import { DurationDisplay } from './DurationDisplay';
import type { Pattern } from '@/types';

describe('DurationDisplay', () => {
  describe('Rendering', () => {
    it('should render the component', () => {
      renderWithProviders(<DurationDisplay />);
      expect(screen.getByTestId('duration-display')).toBeInTheDocument();
    });

    it('should have terminal styling classes', () => {
      const { container } = renderWithProviders(<DurationDisplay />);
      expect(container.querySelector('.duration-display')).toBeInTheDocument();
    });
  });

  describe('Global Duration', () => {
    it('should display global duration label', () => {
      renderWithProviders(<DurationDisplay />);
      expect(screen.getByText('TOTAL')).toBeInTheDocument();
    });

    it('should display 00:00 when no patterns exist', () => {
      const songData = createTestSongData([], 120);
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
        } as any,
      });
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:00');
    });

    it('should calculate and display global duration correctly', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track-1', position: 0, duration: 4 },
        { id: '2', trackId: 'track-1', position: 8, duration: 4 },
      ];
      // Rightmost pattern ends at position 12 (8 + 4)
      // At 120 BPM: 12 beats = 6 seconds = 00:06
      const songData = createTestSongData(patterns, 120);
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
        } as any,
      });
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:06');
    });

    it('should update when tempo changes', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track-1', position: 0, duration: 4 },
      ];
      // At 120 BPM: 4 beats = 2 seconds = 00:02
      const songData120 = createTestSongData(patterns, 120);
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData120,
          timeline: { tempo: 120 },
        } as any,
      });
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:02');
      cleanup();

      // At 60 BPM: 4 beats = 4 seconds = 00:04
      const songData60 = createTestSongData(patterns, 60);
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData60,
          timeline: { tempo: 60 },
        } as any,
      });
      expect(screen.getByTestId('duration-global')).toHaveTextContent('00:04');
    });

    it('should format large durations correctly', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track-1', position: 0, duration: 240 },
      ];
      // At 120 BPM: 240 beats = 120 seconds = 02:00
      const songData = createTestSongData(patterns, 120);
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
        } as any,
      });
      expect(screen.getByTestId('duration-global')).toHaveTextContent('02:00');
    });
  });

  describe('Selected Duration', () => {
    it('should not display selected duration when no clips are selected', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track-1', position: 0, duration: 4 },
      ];
      const songData = createTestSongData(patterns, 120);
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
          selection: { selectedPatternIds: [], currentTrackId: null },
        } as any,
      });
      expect(screen.queryByText('SELECTED')).not.toBeInTheDocument();
      expect(screen.queryByTestId('duration-selected')).not.toBeInTheDocument();
    });

    it('should display selected duration label when patterns are selected', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track-1', position: 0, duration: 4 },
      ];
      const songData = createTestSongData(patterns, 120);
      // Pattern ID is now deterministic: scene-1-track-1-Pattern_1
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
          selection: { selectedPatternIds: ['scene-1-track-1-Pattern_1'], currentTrackId: null },
        } as any,
      });
      expect(screen.getByText('SELECTED')).toBeInTheDocument();
    });

    it('should calculate selected duration correctly', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track-1', position: 0, duration: 4 },
        { id: '2', trackId: 'track-2', position: 4, duration: 8 },
        { id: '3', trackId: 'track-3', position: 12, duration: 4 },
      ];
      // Selected patterns: 1 (4 beats) + 3 (4 beats) = 8 beats
      // At 120 BPM: 8 beats = 4 seconds = 00:04
      const songData = createTestSongData(patterns, 120);
      // Pattern IDs are now deterministic
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
          selection: {
            selectedPatternIds: [
              'scene-1-track-1-Pattern_1',  // Pattern 1 at position 0
              'scene-3-track-3-Pattern_3'   // Pattern 3 at position 12
            ],
            currentTrackId: null
          },
        } as any,
      });
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:04');
    });

    it('should update when selection changes', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track-1', position: 0, duration: 4 },
        { id: '2', trackId: 'track-2', position: 4, duration: 4 },
      ];
      const songData = createTestSongData(patterns, 120);

      // First: 1 pattern selected (4 beats = 2 seconds)
      // Pattern IDs are now deterministic
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
          selection: { selectedPatternIds: ['scene-1-track-1-Pattern_1'], currentTrackId: null },
        } as any,
      });
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:02');
      cleanup();

      // Second: both patterns selected (8 beats = 4 seconds)
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
          selection: {
            selectedPatternIds: [
              'scene-1-track-1-Pattern_1',
              'scene-2-track-2-Pattern_2'
            ],
            currentTrackId: null
          },
        } as any,
      });
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:04');
      cleanup();

      // Third: no selection
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
          selection: { selectedPatternIds: [], currentTrackId: null },
        } as any,
      });
      expect(screen.queryByTestId('duration-selected')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply retro terminal classes', () => {
      const { container } = renderWithProviders(<DurationDisplay />);
      const display = container.querySelector('.duration-display');
      expect(display).toBeInTheDocument();
    });

    it('should have phosphor glow effect on values', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track-1', position: 0, duration: 4 },
      ];
      const songData = createTestSongData(patterns, 120);
      const { container } = renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
        } as any,
      });
      const globalValue = container.querySelector('.duration-display__value');
      expect(globalValue).toBeInTheDocument();
    });

    it('should render ASCII box borders', () => {
      const { container } = renderWithProviders(<DurationDisplay />);
      const display = container.querySelector('.duration-display');
      expect(display?.textContent).toMatch(/[┌└─│]/); // Check for box drawing characters
    });
  });

  describe('Integration', () => {
    it('should display selected duration when patterns are selected', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track-1', position: 0, duration: 4 },
        { id: '2', trackId: 'track-2', position: 8, duration: 4 },
      ];
      // Selected: 4 beats at 120 BPM = 2 seconds
      const songData = createTestSongData(patterns, 120);
      // Pattern ID is now deterministic: scene-1-track-1-Pattern_1
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
          selection: { selectedPatternIds: ['scene-1-track-1-Pattern_1'], currentTrackId: null },
        } as any,
      });
      expect(screen.queryByTestId('duration-global')).not.toBeInTheDocument(); // Global hidden when selection exists
      expect(screen.getByTestId('duration-selected')).toHaveTextContent('00:02');
    });

    it('should handle edge case of very long durations', () => {
      const patterns: Pattern[] = [
        { id: '1', trackId: 'track-1', position: 0, duration: 7200 },
      ];
      // At 120 BPM: 7200 beats = 3600 seconds = 60:00
      const songData = createTestSongData(patterns, 120);
      renderWithProviders(<DurationDisplay />, {
        preloadedState: {
          song: songData,
          timeline: { tempo: 120 },
        } as any,
      });
      expect(screen.getByTestId('duration-global')).toHaveTextContent('60:00');
    });
  });
});
