import { render, screen, fireEvent } from '@testing-library/react';
import { ResizableDivider } from './ResizableDivider';

describe('ResizableDivider', () => {
  const mockOnResize = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerHeight for calculations
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });
  });

  afterEach(() => {
    // Clean up any event listeners
    jest.restoreAllMocks();
  });

  it('should render with correct test ID', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');
    expect(divider).toBeInTheDocument();
  });

  it('should render with proper accessibility attributes', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');
    expect(divider).toHaveAttribute('role', 'separator');
    expect(divider).toHaveAttribute('aria-label');
    expect(divider).toHaveAttribute('aria-valuemin');
    expect(divider).toHaveAttribute('aria-valuemax');
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('should be keyboard accessible with tabindex', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');
    expect(divider).toHaveAttribute('tabindex', '0');
  });

  it('should show default cursor in default state', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');
    const styles = window.getComputedStyle(divider);

    // Should have default or pointer cursor, not ns-resize yet
    expect(styles.cursor).not.toBe('ns-resize');
  });

  it('should change cursor to ns-resize on hover', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    fireEvent.mouseEnter(divider);

    // Check if cursor class is applied
    expect(divider).toHaveClass(/hover/i);
  });

  it('should remove hover class on mouse leave', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    // Enter hover state
    fireEvent.mouseEnter(divider);
    expect(divider).toHaveClass(/hover/i);

    // Leave hover state
    fireEvent.mouseLeave(divider);
    expect(divider).not.toHaveClass(/hover/i);
  });

  it('should start drag on mouse down', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    fireEvent.mouseDown(divider, { clientY: 400 });

    // Check if dragging class is applied
    expect(divider).toHaveClass(/dragging/i);
  });

  it('should call onResize during drag with correct height values', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    // Start drag
    fireEvent.mouseDown(divider, { clientY: 400 });

    // Move mouse (window.innerHeight = 1000, clientY = 500)
    // newHeight should be 1000 - 500 = 500
    fireEvent.mouseMove(document, { clientY: 500 });

    expect(mockOnResize).toHaveBeenCalledWith(500);
  });

  it('should continue calling onResize on subsequent mouse moves', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    // Start drag
    fireEvent.mouseDown(divider, { clientY: 400 });

    // First move
    fireEvent.mouseMove(document, { clientY: 500 });
    expect(mockOnResize).toHaveBeenCalledWith(500);

    // Second move
    fireEvent.mouseMove(document, { clientY: 600 });
    expect(mockOnResize).toHaveBeenCalledWith(400);

    expect(mockOnResize).toHaveBeenCalledTimes(2);
  });

  it('should stop drag on mouse up', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    // Start drag
    fireEvent.mouseDown(divider, { clientY: 400 });
    expect(divider).toHaveClass(/dragging/i);

    // Move mouse
    fireEvent.mouseMove(document, { clientY: 500 });
    expect(mockOnResize).toHaveBeenCalledWith(500);

    // End drag
    fireEvent.mouseUp(document);

    // Should no longer have dragging class
    expect(divider).not.toHaveClass(/dragging/i);

    // Should not call onResize after drag ends
    mockOnResize.mockClear();
    fireEvent.mouseMove(document, { clientY: 600 });
    expect(mockOnResize).not.toHaveBeenCalled();
  });

  it('should respect minHeight constraint with default value', () => {
    // Default minHeight is 200
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    // Start drag
    fireEvent.mouseDown(divider, { clientY: 400 });

    // Try to drag to height of 100 (below min of 200)
    // window.innerHeight = 1000, clientY = 900, newHeight = 100
    fireEvent.mouseMove(document, { clientY: 900 });

    // Should constrain to minHeight (200)
    expect(mockOnResize).toHaveBeenCalledWith(200);
  });

  it('should respect custom minHeight constraint', () => {
    render(<ResizableDivider onResize={mockOnResize} minHeight={300} />);

    const divider = screen.getByTestId('resizable-divider');

    // Start drag
    fireEvent.mouseDown(divider, { clientY: 400 });

    // Try to drag to height of 250 (below min of 300)
    fireEvent.mouseMove(document, { clientY: 750 });

    // Should constrain to minHeight (300)
    expect(mockOnResize).toHaveBeenCalledWith(300);
  });

  it('should respect maxHeight constraint with default value', () => {
    // Default maxHeight is 600
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    // Start drag
    fireEvent.mouseDown(divider, { clientY: 400 });

    // Try to drag to height of 800 (above max of 600)
    // window.innerHeight = 1000, clientY = 200, newHeight = 800
    fireEvent.mouseMove(document, { clientY: 200 });

    // Should constrain to maxHeight (600)
    expect(mockOnResize).toHaveBeenCalledWith(600);
  });

  it('should respect custom maxHeight constraint', () => {
    render(<ResizableDivider onResize={mockOnResize} maxHeight={500} />);

    const divider = screen.getByTestId('resizable-divider');

    // Start drag
    fireEvent.mouseDown(divider, { clientY: 400 });

    // Try to drag to height of 700 (above max of 500)
    fireEvent.mouseMove(document, { clientY: 300 });

    // Should constrain to maxHeight (500)
    expect(mockOnResize).toHaveBeenCalledWith(500);
  });

  it('should handle rapid mouse movements gracefully', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    // Start drag
    fireEvent.mouseDown(divider, { clientY: 400 });

    // Rapid movements
    for (let i = 0; i < 10; i++) {
      fireEvent.mouseMove(document, { clientY: 400 + i * 10 });
    }

    // Should have called onResize for each movement
    expect(mockOnResize).toHaveBeenCalledTimes(10);

    // All calls should respect constraints
    const calls = mockOnResize.mock.calls;
    calls.forEach(([height]) => {
      expect(height).toBeGreaterThanOrEqual(200); // default min
      expect(height).toBeLessThanOrEqual(600); // default max
    });
  });

  it('should clean up event listeners on unmount during drag', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    // Start drag
    fireEvent.mouseDown(divider, { clientY: 400 });

    // Unmount while dragging
    unmount();

    // Should have cleaned up mousemove and mouseup listeners
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function)
    );
  });

  it('should clean up event listeners when drag ends normally', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    // Start drag
    fireEvent.mouseDown(divider, { clientY: 400 });

    // End drag
    fireEvent.mouseUp(document);

    // Should have cleaned up mousemove and mouseup listeners
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function)
    );
  });

  it('should not call onResize when not dragging', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    // Move mouse without starting drag
    fireEvent.mouseMove(document, { clientY: 500 });

    expect(mockOnResize).not.toHaveBeenCalled();
  });

  it('should update aria-valuenow during drag', () => {
    render(<ResizableDivider onResize={mockOnResize} />);

    const divider = screen.getByTestId('resizable-divider');

    // Start drag
    fireEvent.mouseDown(divider, { clientY: 400 });

    // Move to height 500
    fireEvent.mouseMove(document, { clientY: 500 });

    // aria-valuenow should reflect current height
    expect(divider).toHaveAttribute('aria-valuenow', '500');
  });

  it('should handle edge case of dragging exactly to minHeight', () => {
    render(<ResizableDivider onResize={mockOnResize} minHeight={200} />);

    const divider = screen.getByTestId('resizable-divider');

    fireEvent.mouseDown(divider, { clientY: 400 });

    // Drag to exactly minHeight (1000 - 800 = 200)
    fireEvent.mouseMove(document, { clientY: 800 });

    expect(mockOnResize).toHaveBeenCalledWith(200);
  });

  it('should handle edge case of dragging exactly to maxHeight', () => {
    render(<ResizableDivider onResize={mockOnResize} maxHeight={600} />);

    const divider = screen.getByTestId('resizable-divider');

    fireEvent.mouseDown(divider, { clientY: 400 });

    // Drag to exactly maxHeight (1000 - 400 = 600)
    fireEvent.mouseMove(document, { clientY: 400 });

    expect(mockOnResize).toHaveBeenCalledWith(600);
  });
});
