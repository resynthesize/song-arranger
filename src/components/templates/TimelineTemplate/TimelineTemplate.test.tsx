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
import crtEffectsReducer from '@/store/slices/crtEffectsSlice';
import projectReducer from '@/store/slices/projectSlice';
import statusReducer from '@/store/slices/statusSlice';
import themeReducer from '@/store/slices/themeSlice';

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
});
