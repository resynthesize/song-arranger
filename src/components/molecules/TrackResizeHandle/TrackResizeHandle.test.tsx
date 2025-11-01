/**
 * TrackResizeHandle Tests
 * Tests for the drag-to-resize track height component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { TrackResizeHandle } from './TrackResizeHandle';

describe('TrackResizeHandle', () => {
  const mockOnHeightChange = jest.fn();

  beforeEach(() => {
    mockOnHeightChange.mockClear();
  });

  it('should render the resize handle', () => {
    render(
      <TrackResizeHandle
        trackId="track-1"
        currentHeight={80}
        onHeightChange={mockOnHeightChange}
      />
    );

    expect(screen.getByTestId('track-resize-handle-track-1')).toBeInTheDocument();
  });

  it('should render with proper data-testid', () => {
    render(
      <TrackResizeHandle
        trackId="track-1"
        currentHeight={80}
        onHeightChange={mockOnHeightChange}
      />
    );

    const handle = screen.getByTestId('track-resize-handle-track-1');
    expect(handle).toBeInTheDocument();
  });

  it('should have proper title for accessibility', () => {
    render(
      <TrackResizeHandle
        trackId="track-1"
        currentHeight={80}
        onHeightChange={mockOnHeightChange}
      />
    );

    const handle = screen.getByTestId('track-resize-handle-track-1');
    expect(handle).toHaveAttribute('title', 'Drag to resize track height');
  });

  it('should apply dragging class when mouse is down and moving', () => {
    render(
      <TrackResizeHandle
        trackId="track-1"
        currentHeight={80}
        onHeightChange={mockOnHeightChange}
      />
    );

    const handle = screen.getByTestId('track-resize-handle-track-1');

    // Initially not dragging
    expect(handle).not.toHaveClass('dragging');

    // Start drag
    fireEvent.mouseDown(handle, { clientY: 100 });
    expect(handle).toHaveClass('dragging');

    // End drag
    fireEvent.mouseUp(document);
    expect(handle).not.toHaveClass('dragging');
  });

  it('should call onHeightChange when dragged down', () => {
    render(
      <TrackResizeHandle
        trackId="track-1"
        currentHeight={80}
        onHeightChange={mockOnHeightChange}
      />
    );

    const handle = screen.getByTestId('track-resize-handle-track-1');

    // Start drag at Y=100
    fireEvent.mouseDown(handle, { clientY: 100 });

    // Move mouse down by 50px
    fireEvent.mouseMove(document, { clientY: 150 });

    // Should have called with new height (80 + 50 = 130)
    expect(mockOnHeightChange).toHaveBeenCalledWith('track-1', 130);
  });

  it('should call onHeightChange when dragged up', () => {
    render(
      <TrackResizeHandle
        trackId="track-1"
        currentHeight={80}
        onHeightChange={mockOnHeightChange}
      />
    );

    const handle = screen.getByTestId('track-resize-handle-track-1');

    // Start drag at Y=100
    fireEvent.mouseDown(handle, { clientY: 100 });

    // Move mouse up by 30px
    fireEvent.mouseMove(document, { clientY: 70 });

    // Should have called with new height (80 - 30 = 50)
    expect(mockOnHeightChange).toHaveBeenCalledWith('track-1', 50);
  });

  it('should stop calling onHeightChange after mouseup', () => {
    render(
      <TrackResizeHandle
        trackId="track-1"
        currentHeight={80}
        onHeightChange={mockOnHeightChange}
      />
    );

    const handle = screen.getByTestId('track-resize-handle-track-1');

    // Start drag
    fireEvent.mouseDown(handle, { clientY: 100 });
    fireEvent.mouseMove(document, { clientY: 150 });

    // Clear mock to verify no new calls
    mockOnHeightChange.mockClear();

    // End drag
    fireEvent.mouseUp(document);

    // Move mouse after releasing - should not call onHeightChange
    fireEvent.mouseMove(document, { clientY: 200 });
    expect(mockOnHeightChange).not.toHaveBeenCalled();
  });

  it('should add resizing-vertical class to body when dragging', () => {
    render(
      <TrackResizeHandle
        trackId="track-1"
        currentHeight={80}
        onHeightChange={mockOnHeightChange}
      />
    );

    const handle = screen.getByTestId('track-resize-handle-track-1');

    // Initially no class
    expect(document.body.classList.contains('resizing-vertical')).toBe(false);

    // Start drag - class should be added
    fireEvent.mouseDown(handle, { clientY: 100 });
    expect(document.body.classList.contains('resizing-vertical')).toBe(true);

    // End drag - class should be removed
    fireEvent.mouseUp(document);
    expect(document.body.classList.contains('resizing-vertical')).toBe(false);
  });

  it('should prevent default on mousedown', () => {
    render(
      <TrackResizeHandle
        trackId="track-1"
        currentHeight={80}
        onHeightChange={mockOnHeightChange}
      />
    );

    const handle = screen.getByTestId('track-resize-handle-track-1');
    const event = new MouseEvent('mousedown', { bubbles: true, clientY: 100 });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    handle.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should stop propagation on mousedown', () => {
    render(
      <TrackResizeHandle
        trackId="track-1"
        currentHeight={80}
        onHeightChange={mockOnHeightChange}
      />
    );

    const handle = screen.getByTestId('track-resize-handle-track-1');
    const event = new MouseEvent('mousedown', { bubbles: true, clientY: 100 });
    const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

    handle.dispatchEvent(event);
    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});
