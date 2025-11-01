/**
 * CommandPalette Component Tests
 * Tests for the searchable command palette
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/testUtils';
import { CommandPalette } from './CommandPalette';

describe('CommandPalette', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    localStorage.clear();
  });

  it('should render with search input', () => {
    renderWithProviders(<CommandPalette isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText(/search commands/i)).toBeInTheDocument();
  });

  it('should display all commands initially', () => {
    renderWithProviders(<CommandPalette isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Set Tempo...')).toBeInTheDocument();
    expect(screen.getByText('Zoom In')).toBeInTheDocument();
  });

  it('should filter commands by search query', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(/search commands/i);
    await user.type(input, 'zoom');

    expect(screen.getByText('Set Zoom Level...')).toBeInTheDocument();
    expect(screen.getByText('Zoom In')).toBeInTheDocument();
    expect(screen.queryByText('Set Tempo...')).not.toBeInTheDocument();
  });

  it('should close on Escape key', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    await user.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should navigate with arrow keys', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    await user.keyboard('{ArrowDown}');
    // First command should be highlighted
    const firstCommand = screen.getAllByRole('button')[0];
    expect(firstCommand).toHaveClass('command-palette-item--selected');
  });

  it('should execute command on Enter', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    // Select first command and press Enter
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show keyboard shortcuts', () => {
    renderWithProviders(<CommandPalette isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('Space')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    renderWithProviders(<CommandPalette isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search commands/i)).toHaveAttribute('aria-label');
  });
});
