/**
 * RulerTick Molecule Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { RulerTick } from './RulerTick';

describe('RulerTick', () => {
  const defaultProps = {
    barNumber: 5,
    position: 400,
    timeString: '1:15',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onClick.mockClear();
  });

  it('should render bar number', () => {
    render(<RulerTick {...defaultProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render time marker', () => {
    render(<RulerTick {...defaultProps} />);
    expect(screen.getByText('1:15')).toBeInTheDocument();
  });

  it('should have correct position style', () => {
    render(<RulerTick {...defaultProps} />);
    const tick = screen.getByText('5').parentElement;
    expect(tick).toHaveStyle({ left: '400px' });
  });

  it('should call onClick when bar number is clicked', () => {
    const onClick = jest.fn();
    render(<RulerTick {...defaultProps} onClick={onClick} />);

    const barNumber = screen.getByTestId('ruler-bar-5');
    fireEvent.click(barNumber);

    expect(onClick).toHaveBeenCalledWith(400);
  });

  it('should call onClick when time marker is clicked', () => {
    const onClick = jest.fn();
    render(<RulerTick {...defaultProps} onClick={onClick} />);

    const timeMarker = screen.getByTestId('ruler-time-5');
    fireEvent.click(timeMarker);

    expect(onClick).toHaveBeenCalledWith(400);
  });
});
