/**
 * TimelinePage Tests
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TimelinePage from './TimelinePage';
import timelineReducer from '@/store/slices/timelineSlice';
import tracksReducer from '@/store/slices/tracksSlice';
import patternsReducer from '@/store/slices/patternsSlice';
import selectionReducer from '@/store/slices/selectionSlice';
import crtEffectsReducer from '@/store/slices/crtEffectsSlice';
import projectReducer from '@/store/slices/projectSlice';
import quickInputReducer from '@/store/slices/quickInputSlice';
import commandPaletteReducer from '@/store/slices/commandPaletteSlice';
import statusReducer from '@/store/slices/statusSlice';
import themeReducer from '@/store/slices/themeSlice';

// Mock storage utility
jest.mock('@/utils/storage', () => ({
  getTemplateProject: jest.fn(() => null),
}));

// Helper to create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      timeline: timelineReducer,
      tracks: tracksReducer,
      patterns: patternsReducer,
      selection: selectionReducer,
      crtEffects: crtEffectsReducer,
      project: projectReducer,
      quickInput: quickInputReducer,
      commandPalette: commandPaletteReducer,
      status: statusReducer,
      theme: themeReducer,
    },
  });
};

// Helper to render with Redux Provider
const renderWithProvider = (ui: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('TimelinePage', () => {
  it('should render TimelineTemplate', () => {
    renderWithProvider(<TimelinePage />);
    expect(screen.getByTestId('timeline-template')).toBeInTheDocument();
  });

  it('should render MenuBar through TimelineTemplate', () => {
    renderWithProvider(<TimelinePage />);
    expect(screen.getByTestId('menu-bar')).toBeInTheDocument();
  });

  it('should render Timeline through TimelineTemplate', () => {
    renderWithProvider(<TimelinePage />);
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });
});
