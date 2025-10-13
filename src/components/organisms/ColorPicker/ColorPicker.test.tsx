/**
 * Song Arranger - ColorPicker Component Tests
 * Tests for the retro terminal color picker
 */

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorPicker from './ColorPicker';

describe('ColorPicker', () => {
  const defaultProps = {
    selectedColor: '#00ff00',
    onSelectColor: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with title', () => {
    render(<ColorPicker {...defaultProps} />);
    expect(screen.getByText('SELECT LANE COLOR')).toBeInTheDocument();
  });

  it('should display color swatches', () => {
    render(<ColorPicker {...defaultProps} />);
    const swatches = screen.getAllByTestId(/^color-swatch-/);
    expect(swatches.length).toBeGreaterThan(0);
  });

  it('should highlight currently selected color', () => {
    render(<ColorPicker {...defaultProps} selectedColor="#00ff00" />);
    const selectedSwatch = screen.getByTestId('color-swatch-#00ff00');
    expect(selectedSwatch).toHaveClass('color-picker__swatch--selected');
  });

  it('should display preview with selected color', () => {
    render(<ColorPicker {...defaultProps} selectedColor="#00ff00" />);
    expect(screen.getByText(/PREVIEW:/)).toBeInTheDocument();
    expect(screen.getByText(/#00ff00/i)).toBeInTheDocument();
  });

  it('should call onSelectColor when a swatch is clicked', async () => {
    const onSelectColor = jest.fn();
    render(<ColorPicker {...defaultProps} onSelectColor={onSelectColor} />);

    const swatch = screen.getByTestId('color-swatch-#ff0000');
    await userEvent.click(swatch);

    expect(onSelectColor).toHaveBeenCalledWith('#ff0000');
  });

  it('should call onClose when Escape key is pressed', async () => {
    const onClose = jest.fn();
    render(<ColorPicker {...defaultProps} onClose={onClose} />);

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when Enter key is pressed', async () => {
    const onClose = jest.fn();
    render(<ColorPicker {...defaultProps} onClose={onClose} />);

    await userEvent.keyboard('{Enter}');

    expect(onClose).toHaveBeenCalled();
  });

  it('should support keyboard navigation with arrow keys', async () => {
    const onSelectColor = jest.fn();
    // Start with a color that's not at the edge (row 0, col 0 - #001100)
    render(<ColorPicker {...defaultProps} selectedColor="#001100" onSelectColor={onSelectColor} />);

    // Wait for initial render
    await new Promise(resolve => setTimeout(resolve, 0));

    // ArrowRight should move to next color
    await act(async () => {
      const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      window.dispatchEvent(arrowRightEvent);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(onSelectColor).toHaveBeenCalledWith('#002200'); // Next color in the row
  });

  it('should display terminal-style borders', () => {
    const { container } = render(<ColorPicker {...defaultProps} />);
    expect(container.querySelector('.color-picker')).toBeInTheDocument();
    expect(container.querySelector('.terminal-panel')).toBeInTheDocument();
  });

  it('should show instruction text', () => {
    render(<ColorPicker {...defaultProps} />);
    expect(screen.getByText(/ENTER.*SELECT/)).toBeInTheDocument();
    expect(screen.getByText(/ESC.*CANCEL/)).toBeInTheDocument();
  });

  it('should organize colors in rows', () => {
    const { container } = render(<ColorPicker {...defaultProps} />);
    const rows = container.querySelectorAll('.color-picker__row');
    expect(rows.length).toBeGreaterThan(0);
  });
});
