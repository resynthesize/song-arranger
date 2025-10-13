/**
 * ClipHandle Molecule Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ClipHandle } from './ClipHandle';

describe('ClipHandle', () => {
  const mockOnResizeStart = jest.fn(() => jest.fn());

  beforeEach(() => {
    mockOnResizeStart.mockClear();
  });

  it('should render left handle', () => {
    render(
      <ClipHandle
        clipId="clip-1"
        edge="left"
        onResizeStart={mockOnResizeStart}
      />
    );

    const handle = screen.getByTestId('clip-clip-1-handle-left');
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveClass('clip-handle--left');
  });

  it('should render right handle', () => {
    render(
      <ClipHandle
        clipId="clip-1"
        edge="right"
        onResizeStart={mockOnResizeStart}
      />
    );

    const handle = screen.getByTestId('clip-clip-1-handle-right');
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveClass('clip-handle--right');
  });

  it('should call onResizeStart when mouse down on left handle', () => {
    const onResizeStart = jest.fn(() => jest.fn());
    render(
      <ClipHandle
        clipId="clip-1"
        edge="left"
        onResizeStart={onResizeStart}
      />
    );

    const handle = screen.getByTestId('clip-clip-1-handle-left');
    fireEvent.mouseDown(handle);

    expect(onResizeStart).toHaveBeenCalledWith('left');
  });

  it('should call onResizeStart when mouse down on right handle', () => {
    const onResizeStart = jest.fn(() => jest.fn());
    render(
      <ClipHandle
        clipId="clip-1"
        edge="right"
        onResizeStart={onResizeStart}
      />
    );

    const handle = screen.getByTestId('clip-clip-1-handle-right');
    fireEvent.mouseDown(handle);

    expect(onResizeStart).toHaveBeenCalledWith('right');
  });
});
