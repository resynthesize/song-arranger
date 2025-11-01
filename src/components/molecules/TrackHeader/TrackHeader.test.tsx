/**
 * TrackHeader Molecule Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { TrackHeader } from './TrackHeader';

describe('TrackHeader', () => {
  const defaultProps = {
    id: 'track-1',
    name: 'Test Lane',
    isCurrent: false,
    isEditing: false,
    headerPadding: 16,
    onNameChange: jest.fn(),
    onStartEditing: jest.fn(),
    onStopEditing: jest.fn(),
  };

  it('should render lane name', () => {
    render(<TrackHeader {...defaultProps} />);
    expect(screen.getByText('Test Lane')).toBeInTheDocument();
  });

  it('should apply current styling when isCurrent is true', () => {
    render(<TrackHeader {...defaultProps} isCurrent={true} />);
    const header = screen.getByTestId('track-track-1-header');
    expect(header).toHaveClass('track-header--current');
  });

  it('should not apply current styling when isCurrent is false', () => {
    render(<TrackHeader {...defaultProps} isCurrent={false} />);
    const header = screen.getByTestId('track-track-1-header');
    expect(header).not.toHaveClass('track-header--current');
  });

  it('should call onTrackSelect when header is clicked', () => {
    const onTrackSelect = jest.fn();
    render(<TrackHeader {...defaultProps} onTrackSelect={onTrackSelect} />);

    const header = screen.getByTestId('track-track-1-header');
    fireEvent.click(header);

    expect(onTrackSelect).toHaveBeenCalledWith('track-1');
  });

  it('should call onStartEditing when name is double-clicked', () => {
    const onStartEditing = jest.fn();
    render(<TrackHeader {...defaultProps} onStartEditing={onStartEditing} />);

    const nameDiv = screen.getByText('Test Lane');
    fireEvent.doubleClick(nameDiv);

    expect(onStartEditing).toHaveBeenCalledWith('track-1');
  });

  it('should render input when isEditing is true', () => {
    render(<TrackHeader {...defaultProps} isEditing={true} />);

    const input = screen.getByDisplayValue('Test Lane');
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('should call onNameChange and onStopEditing when Enter is pressed', () => {
    const onNameChange = jest.fn();
    const onStopEditing = jest.fn();
    render(
      <TrackHeader
        {...defaultProps}
        isEditing={true}
        onNameChange={onNameChange}
        onStopEditing={onStopEditing}
      />
    );

    const input = screen.getByDisplayValue('Test Lane');
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onNameChange).toHaveBeenCalledWith('track-1', 'New Name');
    expect(onStopEditing).toHaveBeenCalled();
  });

  it('should call onStopEditing when Escape is pressed without saving', () => {
    const onNameChange = jest.fn();
    const onStopEditing = jest.fn();
    render(
      <TrackHeader
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
      <TrackHeader
        {...defaultProps}
        isEditing={true}
        onNameChange={onNameChange}
        onStopEditing={onStopEditing}
      />
    );

    const input = screen.getByDisplayValue('Test Lane');
    fireEvent.change(input, { target: { value: 'Blurred Name' } });
    fireEvent.blur(input);

    expect(onNameChange).toHaveBeenCalledWith('track-1', 'Blurred Name');
    expect(onStopEditing).toHaveBeenCalled();
  });
});
