/**
 * DialogFooter Molecule Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { DialogFooter } from './DialogFooter';

describe('DialogFooter', () => {
  it('should render action buttons', () => {
    const actions = [
      { label: 'Cancel', onClick: jest.fn(), testId: 'cancel-btn' },
      { label: 'Confirm', onClick: jest.fn(), variant: 'primary' as const, testId: 'confirm-btn' },
    ];

    render(<DialogFooter actions={actions} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should call action onClick when button is clicked', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const actions = [
      { label: 'Cancel', onClick: onCancel, testId: 'cancel-btn' },
      { label: 'Confirm', onClick: onConfirm, testId: 'confirm-btn' },
    ];

    render(<DialogFooter actions={actions} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should render help text when provided', () => {
    const actions = [
      { label: 'OK', onClick: jest.fn(), testId: 'ok-btn' },
    ];

    render(<DialogFooter actions={actions} helpText="Press ESC to cancel" />);

    expect(screen.getByText('Press ESC to cancel')).toBeInTheDocument();
  });

  it('should not render help text when not provided', () => {
    const actions = [
      { label: 'OK', onClick: jest.fn(), testId: 'ok-btn' },
    ];

    render(<DialogFooter actions={actions} />);

    expect(screen.queryByText(/Press ESC/)).not.toBeInTheDocument();
  });

  it('should disable button when disabled prop is true', () => {
    const actions = [
      { label: 'Submit', onClick: jest.fn(), disabled: true, testId: 'submit-btn' },
    ];

    render(<DialogFooter actions={actions} />);

    const button = screen.getByText('Submit').closest('button');
    expect(button).toBeDisabled();
  });
});
