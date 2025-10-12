/**
 * Song Arranger - Clip Component Tests
 * Tests for the Clip component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Clip from './Clip';
import type { ViewportState } from '@/types';

describe('Clip', () => {
  const defaultViewport: ViewportState = {
    offsetBeats: 0,
    zoom: 100,
    widthPx: 1600,
    heightPx: 600,
  };

  const defaultProps = {
    id: 'clip-1',
    laneId: 'lane-1',
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

  it('should render clip with correct dimensions', () => {
    render(<Clip {...defaultProps} />);
    const clip = screen.getByTestId('clip-clip-1');
    expect(clip).toBeInTheDocument();
    expect(clip).toHaveStyle({
      left: '0px',
      width: '400px', // 4 beats * 100 zoom
    });
  });

  it('should render clip at correct position', () => {
    render(<Clip {...defaultProps} position={8} />);
    const clip = screen.getByTestId('clip-clip-1');
    expect(clip).toHaveStyle({
      left: '800px', // 8 beats * 100 zoom
    });
  });

  it('should apply selected class when selected', () => {
    render(<Clip {...defaultProps} isSelected={true} />);
    const clip = screen.getByTestId('clip-clip-1');
    expect(clip).toHaveClass('clip--selected');
  });

  it('should display label if provided', () => {
    render(<Clip {...defaultProps} label="Intro" />);
    expect(screen.getByText('Intro')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', async () => {
    const onSelect = jest.fn();
    render(<Clip {...defaultProps} onSelect={onSelect} />);

    const clip = screen.getByTestId('clip-clip-1');
    await userEvent.click(clip);

    expect(onSelect).toHaveBeenCalledWith('clip-1', false); // false = not multi-select
  });

  it('should call onSelect with multi-select flag when Alt+clicked', () => {
    const onSelect = jest.fn();
    render(<Clip {...defaultProps} onSelect={onSelect} />);

    const clip = screen.getByTestId('clip-clip-1');
    // Simulate Alt+click with fireEvent for better control
    const clickEvent = new MouseEvent('mousedown', {
      bubbles: true,
      altKey: true,
      button: 0,
    });
    clip.dispatchEvent(clickEvent);

    expect(onSelect).toHaveBeenCalledWith('clip-1', true); // true = multi-select
  });

  it('should have resize handles on left and right edges', () => {
    render(<Clip {...defaultProps} />);
    expect(screen.getByTestId('clip-clip-1-handle-left')).toBeInTheDocument();
    expect(screen.getByTestId('clip-clip-1-handle-right')).toBeInTheDocument();
  });

  it('should render ASCII corner characters', () => {
    const { container } = render(<Clip {...defaultProps} />);
    const clip = container.querySelector('.clip');
    expect(clip?.textContent).toMatch(/[┌┐└┘]/);
  });

  it('should scale width based on zoom level', () => {
    const viewport50: ViewportState = { ...defaultViewport, zoom: 50 };
    const { rerender } = render(<Clip {...defaultProps} viewport={viewport50} />);
    const clip = screen.getByTestId('clip-clip-1');
    expect(clip).toHaveStyle({ width: '200px' }); // 4 beats * 50 zoom

    const viewport200: ViewportState = { ...defaultViewport, zoom: 200 };
    rerender(<Clip {...defaultProps} viewport={viewport200} />);
    expect(clip).toHaveStyle({ width: '800px' }); // 4 beats * 200 zoom
  });
});
