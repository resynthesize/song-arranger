/**
 * Cyclone - Pattern Component Tests
 * Tests for the Pattern component
 */

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pattern from './Pattern';
import type { ViewportState } from '@/types';
import styles from './Pattern.module.css';
import { actUser } from '@/utils/testUtils';

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

  /**
   * Helper to render Pattern and wait for animations to complete
   */
  const renderPattern = async (props: typeof defaultProps) => {
    const result = render(<Pattern {...props} />);
    // Wait for the component's animation timer to complete (400ms)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 450));
    });
    return result;
  };

  it('should render pattern with correct dimensions', async () => {
    await renderPattern(defaultProps);
    const pattern = screen.getByTestId('pattern-pattern-1');
    expect(pattern).toBeInTheDocument();
    expect(pattern).toHaveStyle({
      left: '0px',
      width: '400px', // 4 beats * 100 zoom
    });
  });

  it('should render pattern at correct position', async () => {
    await renderPattern({ ...defaultProps, position: 8 });
    const pattern = screen.getByTestId('pattern-pattern-1');
    expect(pattern).toHaveStyle({
      left: '800px', // 8 beats * 100 zoom
    });
  });

  it('should apply selected class when selected', async () => {
    await renderPattern({ ...defaultProps, isSelected: true });
    const pattern = screen.getByTestId('pattern-pattern-1');
    expect(pattern).toHaveClass(styles.selected);
  });

  it('should display label if provided', async () => {
    await renderPattern({ ...defaultProps, label: "Intro" });
    expect(screen.getByText('Intro')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', async () => {
    const onSelect = jest.fn();
    await renderPattern({ ...defaultProps, onSelect });

    const content = screen.getByTestId('pattern-pattern-1').querySelector(`.${styles.content}`);
    if (content) {
      await actUser(() => userEvent.click(content));
    }

    expect(onSelect).toHaveBeenCalledWith('pattern-1', false); // false = not multi-select
  });

  it('should call onSelect with multi-select flag when Alt+clicked', async () => {
    const onSelect = jest.fn();
    await renderPattern({ ...defaultProps, onSelect });

    const content = screen.getByTestId('pattern-pattern-1').querySelector(`.${styles.content}`);
    // Simulate Alt+click with fireEvent for better control
    act(() => {
      const clickEvent = new MouseEvent('mousedown', {
        bubbles: true,
        altKey: true,
        button: 0,
      });
      content?.dispatchEvent(clickEvent);
    });

    expect(onSelect).toHaveBeenCalledWith('pattern-1', true); // true = multi-select
  });

  it('should have resize handles on left and right edges', async () => {
    await renderPattern(defaultProps);
    expect(screen.getByTestId('pattern-pattern-1-handle-left')).toBeInTheDocument();
    expect(screen.getByTestId('pattern-pattern-1-handle-right')).toBeInTheDocument();
  });

  it('should scale width based on zoom level', async () => {
    const viewport50: ViewportState = { ...defaultViewport, zoom: 50 };
    const { rerender } = await renderPattern({ ...defaultProps, viewport: viewport50 });
    const pattern = screen.getByTestId('pattern-pattern-1');
    expect(pattern).toHaveStyle({ width: '200px' }); // 4 beats * 50 zoom

    const viewport200: ViewportState = { ...defaultViewport, zoom: 200 };
    await act(async () => {
      rerender(<Pattern {...defaultProps} viewport={viewport200} />);
    });
    expect(pattern).toHaveStyle({ width: '800px' }); // 4 beats * 200 zoom
  });

  describe('Animation States', () => {
    it('should apply selected class when isSelected is true', async () => {
      await renderPattern({ ...defaultProps, isSelected: true });
      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).toHaveClass(styles.selected);
    });

    it('should not apply selected class when isSelected is false', async () => {
      await renderPattern({ ...defaultProps, isSelected: false });
      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).not.toHaveClass(styles.selected);
    });

    it('should apply dragging class during drag operation', async () => {
      await renderPattern(defaultProps);
      const content = screen.getByTestId('pattern-pattern-1').querySelector(`.${styles.content}`);

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
      expect(pattern).toHaveClass(styles.dragging);
    });

    it('should apply resizing class during resize operation', async () => {
      await renderPattern(defaultProps);
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
      expect(pattern).toHaveClass(styles.resizing);
    });

    it('should apply copying class when Alt+dragging', async () => {
      const onCopy = jest.fn();
      await renderPattern({ ...defaultProps, onCopy });
      const content = screen.getByTestId('pattern-pattern-1').querySelector(`.${styles.content}`);

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
      expect(pattern).toHaveClass(styles.copying);
      expect(onCopy).toHaveBeenCalledWith('pattern-1');
    });
  });

  // Cursor styles are tested in PatternHandle.test.tsx

  describe('Muted State', () => {
    it('should apply muted class when muted is true', async () => {
      await renderPattern({ ...defaultProps, muted: true });
      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).toHaveClass(styles.muted);
    });

    it('should not apply muted class when muted is false', async () => {
      await renderPattern({ ...defaultProps, muted: false });
      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).not.toHaveClass(styles.muted);
    });

    it('should not apply muted class when muted is undefined', async () => {
      await renderPattern(defaultProps);
      const pattern = screen.getByTestId('pattern-pattern-1');
      expect(pattern).not.toHaveClass(styles.muted);
    });
  });

  describe('Pattern Type Badge', () => {
    it('should show P3 badge when patternType is P3', async () => {
      await renderPattern({ ...defaultProps, patternType: "P3" });
      const badge = screen.getByTestId('pattern-pattern-1-type-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('P3');
    });

    it('should show CK badge when patternType is CK', async () => {
      await renderPattern({ ...defaultProps, patternType: "CK" });
      const badge = screen.getByTestId('pattern-pattern-1-type-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('CK');
    });

    it('should show P3 badge by default when patternType is undefined', async () => {
      await renderPattern(defaultProps);
      const badge = screen.getByTestId('pattern-pattern-1-type-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('P3');
    });

    it('should not show badge when pattern width is less than 20px', async () => {
      // Create a viewport with low zoom to make pattern narrow
      const narrowViewport: ViewportState = { ...defaultViewport, zoom: 4 }; // 4 beats * 4 zoom = 16px
      await renderPattern({ ...defaultProps, viewport: narrowViewport });
      const badge = screen.queryByTestId('pattern-pattern-1-type-badge');
      expect(badge).not.toBeInTheDocument();
    });

    it('should show badge when pattern width is greater than 20px', async () => {
      // Create a viewport with sufficient zoom
      const wideViewport: ViewportState = { ...defaultViewport, zoom: 10 }; // 4 beats * 10 zoom = 40px
      await renderPattern({ ...defaultProps, viewport: wideViewport });
      const badge = screen.getByTestId('pattern-pattern-1-type-badge');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Pattern Editor Integration', () => {
    it('should call onOpenEditor on double-click when callback provided', async () => {
      const onOpenEditor = jest.fn();
      await renderPattern({ ...defaultProps, onOpenEditor });

      const content = screen.getByTestId('pattern-pattern-1').querySelector(`.${styles.content}`);

      // Simulate double-click
      if (content) {
        await actUser(() => userEvent.dblClick(content));
      }

      expect(onOpenEditor).toHaveBeenCalledWith('pattern-1');
    });

    it('should call onStartEditing on double-click when onOpenEditor not provided', async () => {
      const onStartEditing = jest.fn();
      await renderPattern({ ...defaultProps, onStartEditing });

      const content = screen.getByTestId('pattern-pattern-1').querySelector(`.${styles.content}`);

      // Simulate double-click
      if (content) {
        await actUser(() => userEvent.dblClick(content));
      }

      expect(onStartEditing).toHaveBeenCalledWith('pattern-1');
    });

    it('should prioritize onOpenEditor over onStartEditing when both provided', async () => {
      const onOpenEditor = jest.fn();
      const onStartEditing = jest.fn();
      await renderPattern({
        ...defaultProps,
        onOpenEditor,
        onStartEditing,
      });

      const content = screen.getByTestId('pattern-pattern-1').querySelector(`.${styles.content}`);

      // Simulate double-click
      if (content) {
        await actUser(() => userEvent.dblClick(content));
      }

      expect(onOpenEditor).toHaveBeenCalledWith('pattern-1');
      expect(onStartEditing).not.toHaveBeenCalled();
    });
  });

});
