/**
 * Cyclone - ViewModeToggle Component Tests
 * Tests for view mode toggle button
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewModeToggle from './ViewModeToggle';
import type { ViewMode } from '@/types';

describe('ViewModeToggle', () => {
  describe('Rendering', () => {
    it('should render the toggle button', () => {
      const mockOnToggle = jest.fn();
      render(<ViewModeToggle viewMode="parameters" onToggle={mockOnToggle} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should display "P" when in parameters mode', () => {
      const mockOnToggle = jest.fn();
      render(<ViewModeToggle viewMode="parameters" onToggle={mockOnToggle} />);

      expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('should display "A" when in aux mode', () => {
      const mockOnToggle = jest.fn();
      render(<ViewModeToggle viewMode="aux" onToggle={mockOnToggle} />);

      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onToggle when clicked', async () => {
      const user = userEvent.setup();
      const mockOnToggle = jest.fn();
      render(<ViewModeToggle viewMode="parameters" onToggle={mockOnToggle} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle multiple times on multiple clicks', async () => {
      const user = userEvent.setup();
      const mockOnToggle = jest.fn();
      render(<ViewModeToggle viewMode="parameters" onToggle={mockOnToggle} />);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnToggle).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      const mockOnToggle = jest.fn();
      render(<ViewModeToggle viewMode="parameters" onToggle={mockOnToggle} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Toggle view mode (currently Parameters)');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const mockOnToggle = jest.fn();
      render(<ViewModeToggle viewMode="parameters" onToggle={mockOnToggle} />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should be activatable with Space key', async () => {
      const user = userEvent.setup();
      const mockOnToggle = jest.fn();
      render(<ViewModeToggle viewMode="parameters" onToggle={mockOnToggle} />);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard(' ');
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props', () => {
    it('should handle viewMode changes', () => {
      const mockOnToggle = jest.fn();
      const { rerender } = render(
        <ViewModeToggle viewMode="parameters" onToggle={mockOnToggle} />
      );

      expect(screen.getByText('P')).toBeInTheDocument();

      rerender(<ViewModeToggle viewMode="aux" onToggle={mockOnToggle} />);

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.queryByText('P')).not.toBeInTheDocument();
    });

    it('should accept different onToggle callbacks', async () => {
      const user = userEvent.setup();
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();

      const { rerender } = render(
        <ViewModeToggle viewMode="parameters" onToggle={firstCallback} />
      );

      const button = screen.getByRole('button');
      await user.click(button);
      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(secondCallback).not.toHaveBeenCalled();

      rerender(<ViewModeToggle viewMode="parameters" onToggle={secondCallback} />);

      await user.click(button);
      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(secondCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should not crash with rapid clicks', async () => {
      const user = userEvent.setup();
      const mockOnToggle = jest.fn();
      render(<ViewModeToggle viewMode="parameters" onToggle={mockOnToggle} />);

      const button = screen.getByRole('button');

      // Rapid fire clicks
      for (let i = 0; i < 10; i++) {
        await user.click(button);
      }

      expect(mockOnToggle).toHaveBeenCalledTimes(10);
    });

    it('should render with both viewMode values', () => {
      const mockOnToggle = jest.fn();
      const modes: ViewMode[] = ['parameters', 'aux'];

      modes.forEach((mode) => {
        const { unmount } = render(
          <ViewModeToggle viewMode={mode} onToggle={mockOnToggle} />
        );

        expect(screen.getByRole('button')).toBeInTheDocument();
        unmount();
      });
    });
  });
});
