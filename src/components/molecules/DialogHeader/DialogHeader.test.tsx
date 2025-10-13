/**
 * DialogHeader Molecule Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { DialogHeader } from './DialogHeader';

describe('DialogHeader', () => {
  it('should render title', () => {
    render(<DialogHeader title="Test Dialog" />);
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
  });

  it('should render close button when onClose is provided', () => {
    const onClose = jest.fn();
    render(<DialogHeader title="Test Dialog" onClose={onClose} />);

    const closeButton = screen.getByTestId('dialog-close-button');
    expect(closeButton).toBeInTheDocument();
  });

  it('should not render close button when onClose is not provided', () => {
    render(<DialogHeader title="Test Dialog" />);

    const closeButton = screen.queryByTestId('dialog-close-button');
    expect(closeButton).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<DialogHeader title="Test Dialog" onClose={onClose} />);

    const closeButton = screen.getByTestId('dialog-close-button');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
