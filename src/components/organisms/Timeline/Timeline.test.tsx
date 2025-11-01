/**
 * Cyclone - Timeline Component Tests
 * Tests for the Timeline component with Redux integration
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Timeline from './Timeline';
import { renderWithProviders, createTestSongData, wrapSongDataForTest } from '@/utils/testUtils';
import type { RootState, Pattern } from '@/types';
import patternStyles from '../Pattern/Pattern.module.css';

describe('Timeline', () => {
  it('should render empty timeline', () => {
    renderWithProviders(<Timeline onOpenTrackSettings={() => {}} />);
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('should render lanes', () => {
    const patterns: Pattern[] = [
      { id: 'pattern-1', trackId: 'track-1', position: 0, duration: 4, label: 'Kick' },
      { id: 'pattern-2', trackId: 'track-2', position: 0, duration: 4, label: 'Snare' },
    ];
    const songData = createTestSongData(patterns, 120);
    renderWithProviders(<Timeline onOpenTrackSettings={() => {}} />, {
      preloadedState: {
        song: wrapSongDataForTest(songData),
        selection: { selectedPatternIds: [], currentTrackId: null },
      } as Partial<RootState>,
    });

    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();
  });

  it('should render clips in their lanes', () => {
    const patterns: Pattern[] = [
      {
        id: 'clip-1',
        trackId: 'track-1',
        position: 0,
        duration: 4,
        label: 'Intro',
      },
    ];
    const songData = createTestSongData(patterns, 120);
    renderWithProviders(<Timeline onOpenTrackSettings={() => {}} />, {
      preloadedState: {
        song: wrapSongDataForTest(songData),
        selection: { selectedPatternIds: [], currentTrackId: null },
        timeline: {
          viewport: {
            offsetBeats: 0,
            zoom: 20, // 20px per beat, so 4-beat pattern = 80px (> 20px threshold)
            widthPx: 1600,
            heightPx: 600,
          },
          playheadPosition: 0,
          isPlaying: false,
          tempo: 120,
          snapValue: 1,
          snapMode: 'fixed',
          verticalZoom: 100,
          minimapVisible: false,
        },
      } as Partial<RootState>,
    });

    // Pattern ID is now deterministic: scene-1-track-1-Intro
    expect(screen.getByTestId('pattern-scene-1-track-1-Intro')).toBeInTheDocument();
    expect(screen.getByText('Intro')).toBeInTheDocument();
  });

  it('should show empty state when no lanes', () => {
    const songData = createTestSongData([], 120); // No patterns = no tracks
    renderWithProviders(<Timeline onOpenTrackSettings={() => {}} />, {
      preloadedState: {
        song: wrapSongDataForTest(songData),
        selection: { selectedPatternIds: [], currentTrackId: null },
      } as Partial<RootState>,
    });
    expect(
      screen.getByText(/No lanes yet/i)
    ).toBeInTheDocument();
  });

  it('should apply zoom from Redux state', () => {
    const patterns: Pattern[] = [
      { id: 'clip-1', trackId: 'track-1', position: 0, duration: 4 },
    ];
    const songData = createTestSongData(patterns, 120);
    renderWithProviders(<Timeline onOpenTrackSettings={() => {}} />, {
      preloadedState: {
        song: wrapSongDataForTest(songData),
        timeline: {
          viewport: {
            offsetBeats: 0,
            zoom: 200,
            widthPx: 1600,
            heightPx: 600,
          },
          playheadPosition: 0,
          isPlaying: false,
          tempo: 120,
          snapValue: 1,
          snapMode: 'fixed',
          verticalZoom: 100,
          minimapVisible: false,
        },
        selection: { selectedPatternIds: [], currentTrackId: null },
      } as Partial<RootState>,
    });

    // Pattern ID is now deterministic: scene-1-track-1-Pattern_clip-1 (no label, so uses Pattern_${id})
    const clip = screen.getByTestId('pattern-scene-1-track-1-Pattern_clip-1');
    expect(clip).toHaveStyle({ width: '800px' }); // 4 beats * 200 zoom
  });

  it('should dispatch openPattern when pattern is double-clicked', async () => {
    const patterns: Pattern[] = [
      { id: 'pattern-1', trackId: 'track-1', position: 0, duration: 4 },
    ];
    const songData = createTestSongData(patterns, 120);
    const { store } = renderWithProviders(<Timeline onOpenTrackSettings={() => {}} />, {
      preloadedState: {
        song: wrapSongDataForTest(songData),
        selection: { selectedPatternIds: [], currentTrackId: null },
      } as Partial<RootState>,
    });

    // Find the pattern and double-click it
    // Pattern ID is now deterministic: scene-1-track-1-Pattern_pattern-1
    const patternId = 'scene-1-track-1-Pattern_pattern-1';
    const pattern = screen.getByTestId(`pattern-${patternId}`);
    const content = pattern.querySelector(`.${patternStyles.content}`);

    if (content) {
      await userEvent.dblClick(content);
    }

    // Check that openPattern action was dispatched with the correct ID
    const state = store.getState();
    expect(state.patternEditor.openPatternId).toBe(patternId);
  });
});
