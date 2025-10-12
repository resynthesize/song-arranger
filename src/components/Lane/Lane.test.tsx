/**
 * Song Arranger - Lane Component Tests
 * Tests for the Lane component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Lane from './Lane';
import type { Clip } from '@/types';

describe('Lane', () => {
  const mockClips: Clip[] = [
    { id: 'clip-1', laneId: 'lane-1', position: 0, duration: 4, label: 'Intro' },
    {
      id: 'clip-2',
      laneId: 'lane-1',
      position: 8,
      duration: 4,
      label: 'Verse',
    },
  ];

  const defaultProps = {
    id: 'lane-1',
    name: 'Kick',
    clips: mockClips,
    zoom: 100,
    selectedClipIds: [],
    isEditing: false,
    onNameChange: jest.fn(),
    onStartEditing: jest.fn(),
    onStopEditing: jest.fn(),
    onClipSelect: jest.fn(),
    onClipMove: jest.fn(),
    onClipResize: jest.fn(),
    onDoubleClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render lane with name', () => {
    render(<Lane {...defaultProps} />);
    expect(screen.getByText('Kick')).toBeInTheDocument();
  });

  it('should render all clips in the lane', () => {
    render(<Lane {...defaultProps} />);
    expect(screen.getByTestId('clip-clip-1')).toBeInTheDocument();
    expect(screen.getByTestId('clip-clip-2')).toBeInTheDocument();
  });

  it('should only render clips that belong to this lane', () => {
    const clipsWithDifferentLanes = [
      ...mockClips,
      { id: 'clip-3', laneId: 'lane-2', position: 0, duration: 4 },
    ];
    render(<Lane {...defaultProps} clips={clipsWithDifferentLanes} />);

    expect(screen.getByTestId('clip-clip-1')).toBeInTheDocument();
    expect(screen.getByTestId('clip-clip-2')).toBeInTheDocument();
    expect(screen.queryByTestId('clip-clip-3')).not.toBeInTheDocument();
  });

  it('should show input when editing', () => {
    render(<Lane {...defaultProps} isEditing={true} />);
    const input = screen.getByDisplayValue('Kick');
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('should call onStartEditing when name is double-clicked', async () => {
    const onStartEditing = jest.fn();
    render(<Lane {...defaultProps} onStartEditing={onStartEditing} />);

    const nameLabel = screen.getByText('Kick');
    await userEvent.dblClick(nameLabel);

    expect(onStartEditing).toHaveBeenCalledWith('lane-1');
  });

  it('should call onNameChange and onStopEditing when Enter is pressed', async () => {
    const onNameChange = jest.fn();
    const onStopEditing = jest.fn();
    render(
      <Lane
        {...defaultProps}
        isEditing={true}
        onNameChange={onNameChange}
        onStopEditing={onStopEditing}
      />
    );

    const input = screen.getByDisplayValue('Kick');
    await userEvent.clear(input);
    await userEvent.type(input, 'Snare{Enter}');

    expect(onNameChange).toHaveBeenCalledWith('lane-1', 'Snare');
    expect(onStopEditing).toHaveBeenCalled();
  });

  it('should call onStopEditing when Escape is pressed without saving', async () => {
    const onNameChange = jest.fn();
    const onStopEditing = jest.fn();
    render(
      <Lane
        {...defaultProps}
        isEditing={true}
        onNameChange={onNameChange}
        onStopEditing={onStopEditing}
      />
    );

    const input = screen.getByDisplayValue('Kick');
    await userEvent.type(input, '{Escape}');

    expect(onNameChange).not.toHaveBeenCalled();
    expect(onStopEditing).toHaveBeenCalled();
  });

  it('should call onStopEditing when input loses focus', async () => {
    const onNameChange = jest.fn();
    const onStopEditing = jest.fn();
    render(
      <Lane
        {...defaultProps}
        isEditing={true}
        onNameChange={onNameChange}
        onStopEditing={onStopEditing}
      />
    );

    const input = screen.getByDisplayValue('Kick');
    await userEvent.clear(input);
    await userEvent.type(input, 'Hi-Hat');

    // Blur the input
    input.blur();

    expect(onNameChange).toHaveBeenCalledWith('lane-1', 'Hi-Hat');
    expect(onStopEditing).toHaveBeenCalled();
  });

  it('should pass selected state to clips', () => {
    render(<Lane {...defaultProps} selectedClipIds={['clip-1']} />);
    const clip1 = screen.getByTestId('clip-clip-1');
    expect(clip1).toHaveClass('clip--selected');
  });

  it('should call onDoubleClick when lane area is double-clicked', async () => {
    const onDoubleClick = jest.fn();
    render(<Lane {...defaultProps} onDoubleClick={onDoubleClick} />);

    const laneContent = screen.getByTestId('lane-lane-1-content');
    await userEvent.dblClick(laneContent);

    expect(onDoubleClick).toHaveBeenCalled();
  });

  it('should calculate click position in beats', () => {
    const onDoubleClick = jest.fn();
    render(<Lane {...defaultProps} zoom={100} onDoubleClick={onDoubleClick} />);

    const laneContent = screen.getByTestId('lane-lane-1-content');

    // Mock getBoundingClientRect to return a stable position
    const mockGetBoundingClientRect = jest.fn().mockReturnValue({
      left: 100,
      top: 0,
      right: 900,
      bottom: 80,
      width: 800,
      height: 80,
      x: 100,
      y: 0,
      toJSON: () => {},
    });

    laneContent.getBoundingClientRect = mockGetBoundingClientRect;

    // Simulate double-click at x=500, which is 400px from left = 4 beats (400 / 100)
    const dblClickEvent = new MouseEvent('dblclick', {
      bubbles: true,
      clientX: 500,
    });
    laneContent.dispatchEvent(dblClickEvent);

    expect(onDoubleClick).toHaveBeenCalled();
    const callArgs = onDoubleClick.mock.calls[0] as [string, number];
    expect(callArgs[0]).toBe('lane-1');
    expect(callArgs[1]).toBe(4); // Position should be 4 beats
  });
});
