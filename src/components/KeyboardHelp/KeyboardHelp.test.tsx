/**
 * KeyboardHelp Component Tests
 * Tests for the keyboard shortcuts help overlay
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyboardHelp } from './KeyboardHelp';

describe('KeyboardHelp', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render with title', () => {
    render(<KeyboardHelp onClose={mockOnClose} />);
    expect(screen.getByText('KEYBOARD SHORTCUTS')).toBeInTheDocument();
  });

  it('should display shortcut categories', () => {
    render(<KeyboardHelp onClose={mockOnClose} />);
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Editing')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  it('should display shortcuts', () => {
    render(<KeyboardHelp onClose={mockOnClose} />);
    expect(screen.getByText('Play/Pause')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should close on Escape key', async () => {
    const user = userEvent.setup();
    render(<KeyboardHelp onClose={mockOnClose} />);

    await user.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close on close button click', async () => {
    const user = userEvent.setup();
    render(<KeyboardHelp onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have role="dialog"', () => {
    render(<KeyboardHelp onClose={mockOnClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
