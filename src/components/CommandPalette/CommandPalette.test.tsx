/**
 * CommandPalette Component Tests
 * Tests for the searchable command palette
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CommandPalette } from './CommandPalette';
import timelineReducer from '@/store/slices/timelineSlice';
import lanesReducer from '@/store/slices/lanesSlice';
import clipsReducer from '@/store/slices/clipsSlice';
import selectionReducer from '@/store/slices/selectionSlice';

const createMockStore = () => configureStore({
  reducer: {
    timeline: timelineReducer,
    lanes: lanesReducer,
    clips: clipsReducer,
    selection: selectionReducer,
  },
});

describe('CommandPalette', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    localStorage.clear();
  });

  const renderWithStore = (component: React.ReactElement) => {
    const store = createMockStore();
    return render(<Provider store={store}>{component}</Provider>);
  };

  it('should render with search input', () => {
    renderWithStore(<CommandPalette onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText(/search commands/i)).toBeInTheDocument();
  });

  it('should display all commands initially', () => {
    renderWithStore(<CommandPalette onClose={mockOnClose} />);
    expect(screen.getByText('Set Tempo...')).toBeInTheDocument();
    expect(screen.getByText('Zoom In')).toBeInTheDocument();
  });

  it('should filter commands by search query', async () => {
    const user = userEvent.setup();
    renderWithStore(<CommandPalette onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(/search commands/i);
    await user.type(input, 'zoom');

    expect(screen.getByText('Set Zoom Level...')).toBeInTheDocument();
    expect(screen.getByText('Zoom In')).toBeInTheDocument();
    expect(screen.queryByText('Set Tempo...')).not.toBeInTheDocument();
  });

  it('should close on Escape key', async () => {
    const user = userEvent.setup();
    renderWithStore(<CommandPalette onClose={mockOnClose} />);

    await user.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should navigate with arrow keys', async () => {
    const user = userEvent.setup();
    renderWithStore(<CommandPalette onClose={mockOnClose} />);

    await user.keyboard('{ArrowDown}');
    // First command should be highlighted
    const firstCommand = screen.getAllByRole('button')[0];
    expect(firstCommand).toHaveClass('command-palette-item--selected');
  });

  it('should execute command on Enter', async () => {
    const user = userEvent.setup();
    renderWithStore(<CommandPalette onClose={mockOnClose} />);

    // Select first command and press Enter
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show keyboard shortcuts', () => {
    renderWithStore(<CommandPalette onClose={mockOnClose} />);
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('Space')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    renderWithStore(<CommandPalette onClose={mockOnClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search commands/i)).toHaveAttribute('aria-label');
  });
});
