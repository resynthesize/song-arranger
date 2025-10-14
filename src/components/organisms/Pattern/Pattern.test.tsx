/**
 * Cyclone - Pattern Component Tests
 * Tests for the Pattern component
 */

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pattern from './Pattern';
import type { ViewportState } from '@/types';

describe('Pattern', () => {
  const defaultViewport: ViewportState = {
    offsetBeats: 0,
    zoom: 100,
    widthPx: 1600,
    heightPx: 600,
  };

  const defaultProps = {
    id: 'pattern-1',
    trackId: 'track-1',
    position: 0,
    duration: 4,
    viewport: defaultViewport,
    snapValue: 1,
    isSelected: false,
    onSelect: jest.fn(),
    onMove: jest.fn(),
    onResize: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render pattern with correct dimensions', () => {
    render(<Pattern {...defaultProps} />);
    const pattern = screen.getByTestId('pattern-pattern-1');
    expect(pattern).toBeInTheDocument();
    expect(pattern).toHaveStyle({
      left: '0px',
      width: '400px', // 4 beats * 100 zoom
    });
  });

  it('should render pattern at correct position', () => {
    render(<Pattern {...defaultProps} position={8} />);
    const pattern = screen.getByTestId('pattern-pattern-1');
    expect(pattern).toHaveStyle({
      left: '800px', // 8 beats * 100 zoom
    });
  });

  it('should apply selected class when selected', () => {
    render(<Pattern {...defaultProps} isSelected={true} />);
    const pattern = screen.getByTestId('pattern-pattern-1');
    expect(pattern).toHaveClass('pattern--selected');
  });

  it('should display label if provided', () => {
    render(<Pattern {...defaultProps} label="Intro" />);
    expect(screen.getByText('Intro')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', async () => {
    const onSelect = jest.fn();
    render(<Pattern {...defaultProps} onSelect={onSelect} />);

    const content = screen.getByTestId('pattern-pattern-1').querySelector('.pattern__content');
    if (content) {
      await userEvent.click(content);
    }

    expect(onSelect).toHaveBeenCalledWith('pattern-1', false); // false = not multi-select
  });

  it('should call onSelect with multi-select flag when Alt+clicked', () => {
    const onSelect = jest.fn();
    render(<Pattern {...defaultProps} onSelect={onSelect} />);

    const content = screen.getByTestId('pattern-pattern-1').querySelector('.pattern__content');
    // Simulate Alt+click with fireEvent for better control
    const clickEvent = new MouseEvent('mousedown', {
      bubbles: true,
      altKey: true,
      button: 0,
    });
    content?.dispatchEvent(clickEvent);

    expect(onSelect).toHaveBeenCalledWith('pattern-1', true); // true = multi-select
  });

  it('should have resize handles on left and right edges', () => {
    render(<Pattern {...defaultProps} />);
    expect(screen.getByTestId('pattern-pattern-1-handle-left')).toBeInTheDocument();
    expect(screen.getByTestId('pattern-pattern-1-handle-right')).toBeInTheDocument();
  });

  it('should scale width based on zoom level', () => {
    const viewport50: ViewportState = { ...defaultViewport, zoom: 50 };
    const { rerender } = render(<Pattern {...defaultProps} viewport={viewport50} />);
    const pattern = screen.getByTestId('pattern-pattern-1');
    expect(pattern).toHaveStyle({ width: '200px' }); // 4 beats * 50 zoom

    const viewport200: ViewportState = { ...defaultViewport, zoom: 200 };
    rerender(<Pattern {...defaultProps} viewport={viewport200} />);
    expect(pattern).toHaveStyle({ width: '800px' }); // 4 beats * 200 zoom
  });

  describe('Animation States', () => {
    it('should apply selected class when isSelected is true', () => {
      render(<Pattern {...defaultProps} isSelected={true} />);
      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).toHaveClass('pattern--selected');
    });

    it('should not apply selected class when isSelected is false', () => {
      render(<Pattern {...defaultProps} isSelected={false} />);
      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).not.toHaveClass('pattern--selected');
    });

    it('should apply dragging class during drag operation', () => {
      render(<Pattern {...defaultProps} />);
      const content = screen.getByTestId('pattern-pattern-1').querySelector('.pattern__content');

      // Simulate drag start
      act(() => {
        const mouseDownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          button: 0,
          clientX: 100,
          clientY: 100,
        });
        content?.dispatchEvent(mouseDownEvent);
      });

      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).toHaveClass('pattern--dragging');
    });

    it('should apply resizing class during resize operation', () => {
      render(<Pattern {...defaultProps} />);
      const leftHandle = screen.getByTestId('pattern-pattern-1-handle-left');

      // Simulate resize start
      act(() => {
        const mouseDownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          button: 0,
          clientX: 100,
          clientY: 100,
        });
        leftHandle.dispatchEvent(mouseDownEvent);
      });

      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).toHaveClass('pattern--resizing');
    });

    it('should apply copying class when Alt+dragging', () => {
      const onCopy = jest.fn();
      render(<Pattern {...defaultProps} onCopy={onCopy} />);
      const content = screen.getByTestId('pattern-pattern-1').querySelector('.pattern__content');

      // Simulate Alt+drag start
      act(() => {
        const mouseDownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          button: 0,
          clientX: 100,
          clientY: 100,
          altKey: true,
        });
        content?.dispatchEvent(mouseDownEvent);
      });

      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).toHaveClass('pattern--copying');
      expect(onCopy).toHaveBeenCalledWith('pattern-1');
    });
  });

  describe('Cursor Styles', () => {
    it('should have w-resize cursor on left handle', () => {
      render(<Pattern {...defaultProps} />);
      const leftHandle = screen.getByTestId('pattern-pattern-1-handle-left');
      expect(leftHandle).toHaveClass('pattern__handle--left');
    });

    it('should have e-resize cursor on right handle', () => {
      render(<Pattern {...defaultProps} />);
      const rightHandle = screen.getByTestId('pattern-pattern-1-handle-right');
      expect(rightHandle).toHaveClass('pattern__handle--right');
    });
  });

  describe('Muted State', () => {
    it('should apply muted class when muted is true', () => {
      render(<Pattern {...defaultProps} muted={true} />);
      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).toHaveClass('pattern--muted');
    });

    it('should not apply muted class when muted is false', () => {
      render(<Pattern {...defaultProps} muted={false} />);
      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).not.toHaveClass('pattern--muted');
    });

    it('should not apply muted class when muted is undefined', () => {
      render(<Pattern {...defaultProps} />);
      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).not.toHaveClass('pattern--muted');
    });
  });

  describe('Pattern Type Badge', () => {
    it('should show P3 badge when patternType is P3', () => {
      render(<Pattern {...defaultProps} patternType="P3" />);
      const badge = screen.getByTestId('pattern-pattern-1-type-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('P3');
    });

    it('should show CK badge when patternType is CK', () => {
      render(<Pattern {...defaultProps} patternType="CK" />);
      const badge = screen.getByTestId('pattern-pattern-1-type-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('CK');
    });

    it('should show P3 badge by default when patternType is undefined', () => {
      render(<Pattern {...defaultProps} />);
      const badge = screen.getByTestId('pattern-pattern-1-type-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('P3');
    });

    it('should not show badge when pattern width is less than 20px', () => {
      // Create a viewport with low zoom to make pattern narrow
      const narrowViewport: ViewportState = { ...defaultViewport, zoom: 4 }; // 4 beats * 4 zoom = 16px
      render(<Pattern {...defaultProps} viewport={narrowViewport} />);
      const badge = screen.queryByTestId('pattern-pattern-1-type-badge');
      expect(badge).not.toBeInTheDocument();
    });

    it('should show badge when pattern width is greater than 20px', () => {
      // Create a viewport with sufficient zoom
      const wideViewport: ViewportState = { ...defaultViewport, zoom: 10 }; // 4 beats * 10 zoom = 40px
      render(<Pattern {...defaultProps} viewport={wideViewport} />);
      const badge = screen.getByTestId('pattern-pattern-1-type-badge');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Pattern Editor Integration', () => {
    it('should call onOpenEditor on double-click when callback provided', async () => {
      const onOpenEditor = jest.fn();
      render(<Pattern {...defaultProps} onOpenEditor={onOpenEditor} />);

      const content = screen.getByTestId('pattern-pattern-1').querySelector('.pattern__content');

      // Simulate double-click
      if (content) {
        await userEvent.dblClick(content);
      }

      expect(onOpenEditor).toHaveBeenCalledWith('pattern-1');
    });

    it('should call onStartEditing on double-click when onOpenEditor not provided', async () => {
      const onStartEditing = jest.fn();
      render(<Pattern {...defaultProps} onStartEditing={onStartEditing} />);

      const content = screen.getByTestId('pattern-pattern-1').querySelector('.pattern__content');

      // Simulate double-click
      if (content) {
        await userEvent.dblClick(content);
      }

      expect(onStartEditing).toHaveBeenCalledWith('pattern-1');
    });

    it('should prioritize onOpenEditor over onStartEditing when both provided', async () => {
      const onOpenEditor = jest.fn();
      const onStartEditing = jest.fn();
      render(
        <Pattern
          {...defaultProps}
          onOpenEditor={onOpenEditor}
          onStartEditing={onStartEditing}
        />
      );

      const content = screen.getByTestId('pattern-pattern-1').querySelector('.pattern__content');

      // Simulate double-click
      if (content) {
        await userEvent.dblClick(content);
      }

      expect(onOpenEditor).toHaveBeenCalledWith('pattern-1');
      expect(onStartEditing).not.toHaveBeenCalled();
    });
  });

});
