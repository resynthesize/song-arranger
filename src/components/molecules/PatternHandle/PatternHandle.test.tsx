/**
 * PatternHandle Molecule Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PatternHandle } from './PatternHandle';

describe('PatternHandle', () => {
  const mockOnResizeStart = jest.fn(() => jest.fn());

  beforeEach(() => {
    mockOnResizeStart.mockClear();
  });

  it('should render left handle', () => {
    render(
      <PatternHandle
        patternId="pattern-1"
        edge="left"
        onResizeStart={mockOnResizeStart}
      />
    );

    const handle = screen.getByTestId('pattern-pattern-1-handle-left');
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveClass('pattern-handle--left');
  });

  it('should render right handle', () => {
    render(
      <PatternHandle
        patternId="pattern-1"
        edge="right"
        onResizeStart={mockOnResizeStart}
      />
    );

    const handle = screen.getByTestId('pattern-pattern-1-handle-right');
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveClass('pattern-handle--right');
  });

  it('should call onResizeStart when mouse down on left handle', () => {
    const onResizeStart = jest.fn(() => jest.fn());
    render(
      <PatternHandle
        patternId="pattern-1"
        edge="left"
        onResizeStart={onResizeStart}
      />
    );

    const handle = screen.getByTestId('pattern-pattern-1-handle-left');
    fireEvent.mouseDown(handle);

    expect(onResizeStart).toHaveBeenCalledWith('left');
  });

  it('should call onResizeStart when mouse down on right handle', () => {
    const onResizeStart = jest.fn(() => jest.fn());
    render(
      <PatternHandle
        patternId="pattern-1"
        edge="right"
        onResizeStart={onResizeStart}
      />
    );

    const handle = screen.getByTestId('pattern-pattern-1-handle-right');
    fireEvent.mouseDown(handle);

    expect(onResizeStart).toHaveBeenCalledWith('right');
  });
});
