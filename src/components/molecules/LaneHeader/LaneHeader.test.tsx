/**
 * LaneHeader Molecule Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { LaneHeader } from './LaneHeader';

describe('LaneHeader', () => {
  const defaultProps = {
    id: 'lane-1',
    name: 'Test Lane',
    color: '#00ff00',
    isCurrent: false,
    isEditing: false,
    headerPadding: 16,
    onNameChange: jest.fn(),
    onStartEditing: jest.fn(),
    onStopEditing: jest.fn(),
    onColorSwatchClick: jest.fn(),
  };

  it('should render lane name', () => {
    render(<LaneHeader {...defaultProps} />);
    expect(screen.getByText('Test Lane')).toBeInTheDocument();
  });

  it('should render current indicator when isCurrent is true', () => {
    render(<LaneHeader {...defaultProps} isCurrent={true} />);
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('should not render current indicator when isCurrent is false', () => {
    render(<LaneHeader {...defaultProps} isCurrent={false} />);
    expect(screen.queryByText('>')).not.toBeInTheDocument();
  });

  it('should render color swatch with correct color', () => {
    render(<LaneHeader {...defaultProps} color="#ff0000" />);
    const swatch = screen.getByTestId('lane-lane-1-color-swatch');
    expect(swatch).toHaveStyle({ color: '#ff0000' });
  });

  it('should call onColorSwatchClick when color swatch is clicked', () => {
    const onColorSwatchClick = jest.fn();
    render(<LaneHeader {...defaultProps} onColorSwatchClick={onColorSwatchClick} />);

    const swatch = screen.getByTestId('lane-lane-1-color-swatch');
    fireEvent.click(swatch);

    expect(onColorSwatchClick).toHaveBeenCalled();
  });

  it('should call onLaneSelect when header is clicked', () => {
    const onLaneSelect = jest.fn();
    render(<LaneHeader {...defaultProps} onLaneSelect={onLaneSelect} />);

    const header = screen.getByTestId('lane-lane-1-header');
    fireEvent.click(header);

    expect(onLaneSelect).toHaveBeenCalledWith('lane-1');
  });

  it('should call onStartEditing when name is double-clicked', () => {
    const onStartEditing = jest.fn();
    render(<LaneHeader {...defaultProps} onStartEditing={onStartEditing} />);

    const nameDiv = screen.getByText('Test Lane');
    fireEvent.doubleClick(nameDiv);

    expect(onStartEditing).toHaveBeenCalledWith('lane-1');
  });

  it('should render input when isEditing is true', () => {
    render(<LaneHeader {...defaultProps} isEditing={true} />);

    const input = screen.getByDisplayValue('Test Lane');
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('should call onNameChange and onStopEditing when Enter is pressed', () => {
    const onNameChange = jest.fn();
    const onStopEditing = jest.fn();
    render(
      <LaneHeader
        {...defaultProps}
        isEditing={true}
        onNameChange={onNameChange}
        onStopEditing={onStopEditing}
      />
    );

    const input = screen.getByDisplayValue('Test Lane');
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onNameChange).toHaveBeenCalledWith('lane-1', 'New Name');
    expect(onStopEditing).toHaveBeenCalled();
  });

  it('should call onStopEditing when Escape is pressed without saving', () => {
    const onNameChange = jest.fn();
    const onStopEditing = jest.fn();
    render(
      <LaneHeader
        {...defaultProps}
        isEditing={true}
        onNameChange={onNameChange}
        onStopEditing={onStopEditing}
      />
    );

    const input = screen.getByDisplayValue('Test Lane');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onStopEditing).toHaveBeenCalled();
    expect(onNameChange).not.toHaveBeenCalled();
  });

  it('should call onNameChange and onStopEditing when input loses focus', () => {
    const onNameChange = jest.fn();
    const onStopEditing = jest.fn();
    render(
      <LaneHeader
        {...defaultProps}
        isEditing={true}
        onNameChange={onNameChange}
        onStopEditing={onStopEditing}
      />
    );

    const input = screen.getByDisplayValue('Test Lane');
    fireEvent.change(input, { target: { value: 'Blurred Name' } });
    fireEvent.blur(input);

    expect(onNameChange).toHaveBeenCalledWith('lane-1', 'Blurred Name');
    expect(onStopEditing).toHaveBeenCalled();
  });
});
