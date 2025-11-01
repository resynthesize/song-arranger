/**
 * Cyclone - RowVisibilityToolbar Tests
 * Tests for the row visibility toggle toolbar
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RowVisibilityToolbar } from './RowVisibilityToolbar';
import type { PatternRow } from '@/types';

describe('RowVisibilityToolbar', () => {
  const mockOnToggle = jest.fn();

  afterEach(() => {
    mockOnToggle.mockClear();
  });

  describe('Rendering', () => {
    it('should render all provided rows', () => {
      const rows: PatternRow[] = ['note', 'velocity', 'length', 'delay'];
      const visibleRows = {
        note: true,
        velocity: true,
        length: true,
        delay: true,
        auxA: true,
        auxB: true,
        auxC: true,
        auxD: true,
      };
      const rowLabels = {
        note: 'N',
        velocity: 'V',
        length: 'L',
        delay: 'D',
        auxA: 'A',
        auxB: 'B',
        auxC: 'C',
        auxD: 'D',
      };

      render(
        <RowVisibilityToolbar
          rows={rows}
          visibleRows={visibleRows}
          rowLabels={rowLabels}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByTestId('row-visibility-toolbar')).toBeInTheDocument();
      expect(screen.getByText('N')).toBeInTheDocument();
      expect(screen.getByText('V')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
    });

    it('should apply visible class to visible rows', () => {
      const rows: PatternRow[] = ['note', 'velocity'];
      const visibleRows = {
        note: true,
        velocity: false,
        length: true,
        delay: true,
        auxA: true,
        auxB: true,
        auxC: true,
        auxD: true,
      };
      const rowLabels = {
        note: 'N',
        velocity: 'V',
        length: 'L',
        delay: 'D',
        auxA: 'A',
        auxB: 'B',
        auxC: 'C',
        auxD: 'D',
      };

      render(
        <RowVisibilityToolbar
          rows={rows}
          visibleRows={visibleRows}
          rowLabels={rowLabels}
          onToggle={mockOnToggle}
        />
      );

      const noteButton = screen.getByTestId('row-visibility-note');
      const velocityButton = screen.getByTestId('row-visibility-velocity');

      // Note is visible, should have visible class
      expect(noteButton).toHaveClass('visible');
      expect(noteButton).not.toHaveClass('hidden');

      // Velocity is hidden, should have hidden class
      expect(velocityButton).toHaveClass('hidden');
      expect(velocityButton).not.toHaveClass('visible');
    });
  });

  describe('Interactions', () => {
    it('should call onToggle when button clicked', async () => {
      const user = userEvent.setup();
      const rows: PatternRow[] = ['note'];
      const visibleRows = {
        note: true,
        velocity: true,
        length: true,
        delay: true,
        auxA: true,
        auxB: true,
        auxC: true,
        auxD: true,
      };
      const rowLabels = {
        note: 'N',
        velocity: 'V',
        length: 'L',
        delay: 'D',
        auxA: 'A',
        auxB: 'B',
        auxC: 'C',
        auxD: 'D',
      };

      render(
        <RowVisibilityToolbar
          rows={rows}
          visibleRows={visibleRows}
          rowLabels={rowLabels}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('row-visibility-note');
      await user.click(button);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith('note');
    });

    it('should toggle multiple rows independently', async () => {
      const user = userEvent.setup();
      const rows: PatternRow[] = ['note', 'velocity', 'length'];
      const visibleRows = {
        note: true,
        velocity: true,
        length: true,
        delay: true,
        auxA: true,
        auxB: true,
        auxC: true,
        auxD: true,
      };
      const rowLabels = {
        note: 'N',
        velocity: 'V',
        length: 'L',
        delay: 'D',
        auxA: 'A',
        auxB: 'B',
        auxC: 'C',
        auxD: 'D',
      };

      render(
        <RowVisibilityToolbar
          rows={rows}
          visibleRows={visibleRows}
          rowLabels={rowLabels}
          onToggle={mockOnToggle}
        />
      );

      await user.click(screen.getByTestId('row-visibility-note'));
      await user.click(screen.getByTestId('row-visibility-velocity'));
      await user.click(screen.getByTestId('row-visibility-length'));

      expect(mockOnToggle).toHaveBeenCalledTimes(3);
      expect(mockOnToggle).toHaveBeenNthCalledWith(1, 'note');
      expect(mockOnToggle).toHaveBeenNthCalledWith(2, 'velocity');
      expect(mockOnToggle).toHaveBeenNthCalledWith(3, 'length');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for visible rows', () => {
      const rows: PatternRow[] = ['note'];
      const visibleRows = {
        note: true,
        velocity: true,
        length: true,
        delay: true,
        auxA: true,
        auxB: true,
        auxC: true,
        auxD: true,
      };
      const rowLabels = {
        note: 'N',
        velocity: 'V',
        length: 'L',
        delay: 'D',
        auxA: 'A',
        auxB: 'B',
        auxC: 'C',
        auxD: 'D',
      };

      render(
        <RowVisibilityToolbar
          rows={rows}
          visibleRows={visibleRows}
          rowLabels={rowLabels}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('row-visibility-note');
      expect(button).toHaveAttribute('aria-label', 'Hide note row');
      expect(button).toHaveAttribute('title', 'Hide note');
    });

    it('should have proper ARIA labels for hidden rows', () => {
      const rows: PatternRow[] = ['velocity'];
      const visibleRows = {
        note: true,
        velocity: false,
        length: true,
        delay: true,
        auxA: true,
        auxB: true,
        auxC: true,
        auxD: true,
      };
      const rowLabels = {
        note: 'N',
        velocity: 'V',
        length: 'L',
        delay: 'D',
        auxA: 'A',
        auxB: 'B',
        auxC: 'C',
        auxD: 'D',
      };

      render(
        <RowVisibilityToolbar
          rows={rows}
          visibleRows={visibleRows}
          rowLabels={rowLabels}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('row-visibility-velocity');
      expect(button).toHaveAttribute('aria-label', 'Show velocity row');
      expect(button).toHaveAttribute('title', 'Show velocity');
    });
  });

  describe('Different Row Sets', () => {
    it('should render aux rows with correct labels', () => {
      const rows: PatternRow[] = ['auxA', 'auxB', 'auxC', 'auxD'];
      const visibleRows = {
        note: true,
        velocity: true,
        length: true,
        delay: true,
        auxA: true,
        auxB: true,
        auxC: true,
        auxD: true,
      };
      const rowLabels = {
        note: 'N',
        velocity: 'V',
        length: 'L',
        delay: 'D',
        auxA: 'A',
        auxB: 'B',
        auxC: 'C',
        auxD: 'D',
      };

      render(
        <RowVisibilityToolbar
          rows={rows}
          visibleRows={visibleRows}
          rowLabels={rowLabels}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
    });
  });
});
