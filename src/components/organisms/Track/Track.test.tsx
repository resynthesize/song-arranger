/**
 * Cyclone - Lane Component Tests
 * Tests for the Lane component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
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
import Track from './Track';
import type { Pattern, ViewportState } from '@/types';
import patternStyles from '../Pattern/Pattern.module.css';

describe('Lane', () => {
  // Helper function to create mock Redux store
  const createMockStore = () => configureStore({
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

  // Helper function to render with Redux Provider
  const renderWithProvider = (ui: React.ReactElement) => {
    const store = createMockStore();
    return render(<Provider store={store}>{ui}</Provider>);
  };

  // Helper function to simulate a double-click (two mousedowns within 500ms)
  const simulateDoubleClick = (element: HTMLElement, clientX: number, clientY: number) => {
    // First click
    fireEvent.mouseDown(element, { clientX, clientY, button: 0 });
    fireEvent.mouseUp(element, { clientX, clientY, button: 0 });
    // Second click (within 500ms) - starts drag-to-create
    fireEvent.mouseDown(element, { clientX, clientY, button: 0 });
  };

  const mockPatterns: Pattern[] = [
    { id: 'clip-1', trackId: 'lane-1', position: 0, duration: 4, label: 'Intro' },
    {
      id: 'clip-2',
      trackId: 'lane-1',
      position: 8,
      duration: 4,
      label: 'Verse',
    },
  ];

  const defaultViewport: ViewportState = {
    offsetBeats: 0,
    zoom: 100,
    widthPx: 1600,
    heightPx: 600,
  };

  const defaultProps = {
    id: 'lane-1',
    name: 'Kick',
    patterns: mockPatterns,
    viewport: defaultViewport,
    snapValue: 1,
    selectedPatternIds: [],
    verticalDragState: null,
    verticalZoom: 100,
    isCurrent: false,
    isEditing: false,
    isMoving: false,
    onTrackSelect: jest.fn(),
    onNameChange: jest.fn(),
    onStartEditing: jest.fn(),
    onStopEditing: jest.fn(),
    onRemove: jest.fn(),
    onPatternSelect: jest.fn(),
    onPatternMove: jest.fn(),
    onPatternResize: jest.fn(),
    onPatternLabelChange: jest.fn(),
    onPatternCopy: jest.fn(),
    onPatternDelete: jest.fn(),
    onPatternVerticalDrag: jest.fn(),
    onPatternVerticalDragUpdate: jest.fn(),
    onDoubleClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render lane with name', () => {
    renderWithProvider(<Track {...defaultProps} />);
    expect(screen.getByText('Kick')).toBeInTheDocument();
  });

  it('should render all clips in the lane', () => {
    renderWithProvider(<Track {...defaultProps} />);
    expect(screen.getByTestId('pattern-clip-1')).toBeInTheDocument();
    expect(screen.getByTestId('pattern-clip-2')).toBeInTheDocument();
  });

  it('should only render clips that belong to this lane', () => {
    const patternsWithDifferentTracks = [
      ...mockPatterns,
      { id: 'clip-3', trackId: 'lane-2', position: 0, duration: 4 },
    ];
    renderWithProvider(<Track {...defaultProps} patterns={patternsWithDifferentTracks} />);

    expect(screen.getByTestId('pattern-clip-1')).toBeInTheDocument();
    expect(screen.getByTestId('pattern-clip-2')).toBeInTheDocument();
    expect(screen.queryByTestId('pattern-clip-3')).not.toBeInTheDocument();
  });

  it('should show input when editing', () => {
    renderWithProvider(<Track {...defaultProps} isEditing={true} />);
    const input = screen.getByDisplayValue('Kick');
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('should call onStartEditing when name is double-clicked', async () => {
    const onStartEditing = jest.fn();
    renderWithProvider(<Track {...defaultProps} onStartEditing={onStartEditing} />);

    const nameLabel = screen.getByText('Kick');
    await userEvent.dblClick(nameLabel);

    expect(onStartEditing).toHaveBeenCalledWith('lane-1');
  });

  it('should call onNameChange and onStopEditing when Enter is pressed', async () => {
    const onNameChange = jest.fn();
    const onStopEditing = jest.fn();
    renderWithProvider(
      <Track
        {...defaultProps}
        isEditing={true}
        onNameChange={onNameChange}
        onStopEditing={onStopEditing}
      />
    );

    const input = screen.getByDisplayValue('Kick');
    await userEvent.clear(input);
    await userEvent.type(input, 'Snare{Enter}');

    expect(onNameChange).toHaveBeenCalledWith('lane-1', 'Snare');
    expect(onStopEditing).toHaveBeenCalled();
  });

  it('should call onStopEditing when Escape is pressed without saving', async () => {
    const onNameChange = jest.fn();
    const onStopEditing = jest.fn();
    renderWithProvider(
      <Track
        {...defaultProps}
        isEditing={true}
        onNameChange={onNameChange}
        onStopEditing={onStopEditing}
      />
    );

    const input = screen.getByDisplayValue('Kick');
    await userEvent.type(input, '{Escape}');

    expect(onNameChange).not.toHaveBeenCalled();
    expect(onStopEditing).toHaveBeenCalled();
  });

  it('should call onStopEditing when input loses focus', async () => {
    const onNameChange = jest.fn();
    const onStopEditing = jest.fn();
    renderWithProvider(
      <Track
        {...defaultProps}
        isEditing={true}
        onNameChange={onNameChange}
        onStopEditing={onStopEditing}
      />
    );

    const input = screen.getByDisplayValue('Kick');
    await userEvent.clear(input);
    await userEvent.type(input, 'Hi-Hat');

    // Blur the input
    input.blur();

    expect(onNameChange).toHaveBeenCalledWith('lane-1', 'Hi-Hat');
    expect(onStopEditing).toHaveBeenCalled();
  });

  it('should pass selected state to clips', () => {
    renderWithProvider(<Track {...defaultProps} selectedPatternIds={['clip-1']} />);
    const clip1 = screen.getByTestId('pattern-clip-1');
    expect(clip1).toHaveClass(patternStyles.selected);
  });

  it('should call onDoubleClick when lane area is double-clicked', async () => {
    const onDoubleClick = jest.fn();
    renderWithProvider(<Track {...defaultProps} onDoubleClick={onDoubleClick} />);

    const laneContent = screen.getByTestId('track-lane-1-content');

    // Mock getBoundingClientRect
    const mockGetBoundingClientRect = jest.fn().mockReturnValue({
      left: 100,
      top: 0,
      right: 900,
      bottom: 80,
      width: 800,
      height: 80,
      x: 100,
      y: 0,
      toJSON: () => {},
    });
    laneContent.getBoundingClientRect = mockGetBoundingClientRect;

    // Use the simulateDoubleClick helper which works with the new drag-to-create implementation
    simulateDoubleClick(laneContent, 200, 40);

    // Complete the interaction with mouseup
    fireEvent.mouseUp(document, {
      clientX: 200,
      clientY: 40,
    });

    await waitFor(() => {
      expect(onDoubleClick).toHaveBeenCalled();
    });
  });

  it('should calculate click position in beats', async () => {
    const onDoubleClick = jest.fn();
    renderWithProvider(<Track {...defaultProps} onDoubleClick={onDoubleClick} />);

    const laneContent = screen.getByTestId('track-lane-1-content');

    // Mock getBoundingClientRect to return a stable position
    const mockGetBoundingClientRect = jest.fn().mockReturnValue({
      left: 100,
      top: 0,
      right: 900,
      bottom: 80,
      width: 800,
      height: 80,
      x: 100,
      y: 0,
      toJSON: () => {},
    });

    laneContent.getBoundingClientRect = mockGetBoundingClientRect;

    // Simulate double-click at x=500, which is 400px from left
    // With viewport.offsetBeats=0 and viewport.zoom=100, position = 0 + 400/100 = 4 beats
    simulateDoubleClick(laneContent, 500, 40);

    // Simulate mouseup at same position (quick click creates default 4-beat clip)
    fireEvent.mouseUp(document, {
      clientX: 500,
      clientY: 40,
    });

    await waitFor(() => {
      expect(onDoubleClick).toHaveBeenCalled();
    });
    const callArgs = onDoubleClick.mock.calls[0] as [string, number, number];
    expect(callArgs[0]).toBe('lane-1');
    expect(callArgs[1]).toBe(4); // Position should be 4 beats
    expect(callArgs[2]).toBe(4); // Default duration is 4 beats
  });

  describe('Click-and-drag clip creation', () => {
    it('should create clip with dragged width when user drags on empty space', async () => {
      const onDoubleClick = jest.fn();
      renderWithProvider(<Track {...defaultProps} onDoubleClick={onDoubleClick} />);

      const laneContent = screen.getByTestId('track-lane-1-content');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn().mockReturnValue({
        left: 100,
        top: 0,
        right: 900,
        bottom: 80,
        width: 800,
        height: 80,
        x: 100,
        y: 0,
        toJSON: () => {},
      });
      laneContent.getBoundingClientRect = mockGetBoundingClientRect;

      // Simulate double-click at x=200 (100px from left = 1 beat) to start drag-to-create
      simulateDoubleClick(laneContent, 200, 40);

      // Simulate mousemove to x=600 (500px from left = 5 beats, so 4 beats duration)
      fireEvent.mouseMove(document, {
        clientX: 600,
        clientY: 40,
      });

      // Simulate mouseup to complete the drag
      fireEvent.mouseUp(document, {
        clientX: 600,
        clientY: 40,
      });

      // Should call onDoubleClick with start position and duration
      await waitFor(() => {
        expect(onDoubleClick).toHaveBeenCalledWith('lane-1', 1, 4);
      });
    });

    it('should show ghost clip preview while dragging', async () => {
      const onDoubleClick = jest.fn();
      renderWithProvider(<Track {...defaultProps} onDoubleClick={onDoubleClick} />);

      const laneContent = screen.getByTestId('track-lane-1-content');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn().mockReturnValue({
        left: 100,
        top: 0,
        right: 900,
        bottom: 80,
        width: 800,
        height: 80,
        x: 100,
        y: 0,
        toJSON: () => {},
      });
      laneContent.getBoundingClientRect = mockGetBoundingClientRect;

      // Simulate double-click at x=200 to start drag-to-create
      simulateDoubleClick(laneContent, 200, 40);

      // Simulate mousemove to x=600
      fireEvent.mouseMove(document, {
        clientX: 600,
        clientY: 40,
      });

      // Should show ghost clip element
      await waitFor(() => {
        const ghostClip = screen.getByTestId('ghost-pattern');
        expect(ghostClip).toBeInTheDocument();
      });
    });

    it('should enforce minimum clip duration of snap value', async () => {
      const onDoubleClick = jest.fn();
      renderWithProvider(<Track {...defaultProps} snapValue={1} onDoubleClick={onDoubleClick} />);

      const laneContent = screen.getByTestId('track-lane-1-content');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn().mockReturnValue({
        left: 100,
        top: 0,
        right: 900,
        bottom: 80,
        width: 800,
        height: 80,
        x: 100,
        y: 0,
        toJSON: () => {},
      });
      laneContent.getBoundingClientRect = mockGetBoundingClientRect;

      // Simulate very short drag (less than minimum)
      simulateDoubleClick(laneContent, 200, 40);

      fireEvent.mouseMove(document, {
        clientX: 220, // Only 20px = 0.2 beats
        clientY: 40,
      });

      fireEvent.mouseUp(document, {
        clientX: 220,
        clientY: 40,
      });

      // Should enforce minimum of snap value (1 beat)
      await waitFor(() => {
        expect(onDoubleClick).toHaveBeenCalledWith('lane-1', 1, 1);
      });
    });

    it('should create default 4-beat clip on quick double-click without drag', async () => {
      const onDoubleClick = jest.fn();
      renderWithProvider(<Track {...defaultProps} onDoubleClick={onDoubleClick} />);

      const laneContent = screen.getByTestId('track-lane-1-content');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn().mockReturnValue({
        left: 100,
        top: 0,
        right: 900,
        bottom: 80,
        width: 800,
        height: 80,
        x: 100,
        y: 0,
        toJSON: () => {},
      });
      laneContent.getBoundingClientRect = mockGetBoundingClientRect;

      // Simulate double-click
      simulateDoubleClick(laneContent, 200, 40);

      // Simulate mouseup immediately at same position
      fireEvent.mouseUp(document, {
        clientX: 200,
        clientY: 40,
      });

      // Should create default 4-beat clip
      await waitFor(() => {
        expect(onDoubleClick).toHaveBeenCalledWith('lane-1', 1, 4);
      });
    });

    it('should snap start position to grid when snap is enabled', async () => {
      const onDoubleClick = jest.fn();
      renderWithProvider(<Track {...defaultProps} snapValue={1} onDoubleClick={onDoubleClick} />);

      const laneContent = screen.getByTestId('track-lane-1-content');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn().mockReturnValue({
        left: 100,
        top: 0,
        right: 900,
        bottom: 80,
        width: 800,
        height: 80,
        x: 100,
        y: 0,
        toJSON: () => {},
      });
      laneContent.getBoundingClientRect = mockGetBoundingClientRect;

      // Simulate double-click at x=250 (150px = 1.5 beats, should snap to 1)
      simulateDoubleClick(laneContent, 250, 40);

      // Drag to x=650 (550px = 5.5 beats, duration should snap)
      fireEvent.mouseMove(document, {
        clientX: 650,
        clientY: 40,
      });

      fireEvent.mouseUp(document, {
        clientX: 650,
        clientY: 40,
      });

      // Start position should snap to 1 beat, duration should be 5 beats (to reach 6 total)
      await waitFor(() => {
        expect(onDoubleClick).toHaveBeenCalledWith('lane-1', 1, 5);
      });
    });

    it('should not trigger on existing clip', async () => {
      const onDoubleClick = jest.fn();
      renderWithProvider(<Track {...defaultProps} onDoubleClick={onDoubleClick} />);

      // Get the first clip element
      const clip = screen.getByTestId('pattern-clip-1');

      // Simulate double-click on the clip (not the empty lane)
      fireEvent.dblClick(clip, {
        clientX: 200,
        clientY: 40,
        button: 0,
      });

      fireEvent.mouseUp(document, {
        clientX: 200,
        clientY: 40,
      });

      // Wait a bit to ensure no delayed calls
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not create new clip when double-clicking on existing clip
      expect(onDoubleClick).not.toHaveBeenCalled();
    });

    it('should cancel creation if dragging outside lane boundaries', async () => {
      const onDoubleClick = jest.fn();
      renderWithProvider(<Track {...defaultProps} onDoubleClick={onDoubleClick} />);

      const laneContent = screen.getByTestId('track-lane-1-content');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn().mockReturnValue({
        left: 100,
        top: 0,
        right: 900,
        bottom: 80,
        width: 800,
        height: 80,
        x: 100,
        y: 0,
        toJSON: () => {},
      });
      laneContent.getBoundingClientRect = mockGetBoundingClientRect;

      // Simulate double-click
      simulateDoubleClick(laneContent, 200, 40);

      // Drag outside lane vertically
      fireEvent.mouseMove(document, {
        clientX: 600,
        clientY: 200, // Far outside lane
      });

      fireEvent.mouseUp(document, {
        clientX: 600,
        clientY: 200,
      });

      // Wait a bit to ensure no delayed calls
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not create clip when drag ends outside lane
      expect(onDoubleClick).not.toHaveBeenCalled();
    });

    it('should create clip backwards when dragging left (backward in time)', async () => {
      const onDoubleClick = jest.fn();
      renderWithProvider(<Track {...defaultProps} onDoubleClick={onDoubleClick} />);

      const laneContent = screen.getByTestId('track-lane-1-content');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn().mockReturnValue({
        left: 100,
        top: 0,
        right: 900,
        bottom: 80,
        width: 800,
        height: 80,
        x: 100,
        y: 0,
        toJSON: () => {},
      });
      laneContent.getBoundingClientRect = mockGetBoundingClientRect;

      // Simulate double-click at x=600 (500px from left = 5 beats)
      simulateDoubleClick(laneContent, 600, 40);

      // Simulate mousemove backwards to x=200 (100px from left = 1 beat, so 4 beats duration)
      fireEvent.mouseMove(document, {
        clientX: 200,
        clientY: 40,
      });

      // Simulate mouseup to complete the drag
      fireEvent.mouseUp(document, {
        clientX: 200,
        clientY: 40,
      });

      // Should call onDoubleClick with the ending position (1 beat) and duration (4 beats)
      // The clip should be created from beats 1-5
      await waitFor(() => {
        expect(onDoubleClick).toHaveBeenCalledWith('lane-1', 1, 4);
      });
    });

    it('should show correct ghost clip preview when dragging backwards', async () => {
      const onDoubleClick = jest.fn();
      renderWithProvider(<Track {...defaultProps} onDoubleClick={onDoubleClick} />);

      const laneContent = screen.getByTestId('track-lane-1-content');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn().mockReturnValue({
        left: 100,
        top: 0,
        right: 900,
        bottom: 80,
        width: 800,
        height: 80,
        x: 100,
        y: 0,
        toJSON: () => {},
      });
      laneContent.getBoundingClientRect = mockGetBoundingClientRect;

      // Simulate double-click at x=600 (5 beats)
      simulateDoubleClick(laneContent, 600, 40);

      // Simulate mousemove backwards to x=200 (1 beat)
      fireEvent.mouseMove(document, {
        clientX: 200,
        clientY: 40,
      });

      // Should show ghost clip element at the correct position (starting from left)
      await waitFor(() => {
        const ghostClip = screen.getByTestId('ghost-pattern');
        expect(ghostClip).toBeInTheDocument();
        // Ghost should be at 100px (1 beat) with width 400px (4 beats)
        expect(ghostClip).toHaveStyle({ left: '100px', width: '400px' });
      });
    });

    it('should handle backward drag with snapping correctly', async () => {
      const onDoubleClick = jest.fn();
      renderWithProvider(<Track {...defaultProps} snapValue={1} onDoubleClick={onDoubleClick} />);

      const laneContent = screen.getByTestId('track-lane-1-content');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn().mockReturnValue({
        left: 100,
        top: 0,
        right: 900,
        bottom: 80,
        width: 800,
        height: 80,
        x: 100,
        y: 0,
        toJSON: () => {},
      });
      laneContent.getBoundingClientRect = mockGetBoundingClientRect;

      // Start at x=650 (550px = 5.5 beats, should snap to 6)
      simulateDoubleClick(laneContent, 650, 40);

      // Drag back to x=250 (150px = 1.5 beats, should snap to 1)
      fireEvent.mouseMove(document, {
        clientX: 250,
        clientY: 40,
      });

      fireEvent.mouseUp(document, {
        clientX: 250,
        clientY: 40,
      });

      // Ending position snaps to 1, start position is 6, so clip should be at position 1 with duration 5
      await waitFor(() => {
        expect(onDoubleClick).toHaveBeenCalledWith('lane-1', 1, 5);
      });
    });
  });
});
