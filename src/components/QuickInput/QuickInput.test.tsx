/**
 * QuickInput Component Tests
 * Tests for the quick value entry modal dialog
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickInput } from './QuickInput';

describe('QuickInput', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Rendering', () => {
    it('should render with tempo command', () => {
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('SET TEMPO')).toBeInTheDocument();
      expect(screen.getByLabelText('Tempo (BPM)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('120')).toBeInTheDocument();
    });

    it('should render with zoom command', () => {
      render(
        <QuickInput
          command="zoom"
          currentValue={5}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('SET ZOOM LEVEL')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom (px/beat)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    it('should render with snap command', () => {
      render(
        <QuickInput
          command="snap"
          currentValue={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('SET SNAP GRID')).toBeInTheDocument();
      expect(screen.getByLabelText('Snap value (beats)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    it('should render with length command', () => {
      render(
        <QuickInput
          command="length"
          currentValue={4}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('SET CLIP LENGTH')).toBeInTheDocument();
      expect(screen.getByLabelText('Length (beats)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4')).toBeInTheDocument();
    });

    it('should render with position command', () => {
      render(
        <QuickInput
          command="position"
          currentValue="1:1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('JUMP TO POSITION')).toBeInTheDocument();
      expect(screen.getByLabelText('Position (bar:beat)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1:1')).toBeInTheDocument();
    });

    it('should auto-focus the input field', () => {
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('120');
      expect(input).toHaveFocus();
    });
  });

  describe('User Interaction', () => {
    it('should call onSubmit with numeric value when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('120');
      await user.clear(input);
      await user.type(input, '140');
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledWith(140);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmit when submit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('120');
      await user.clear(input);
      await user.type(input, '140');

      const submitButton = screen.getByRole('button', { name: /submit|ok/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(140);
    });

    it('should call onCancel when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('120');
      await user.click(input);
      await user.keyboard('{Escape}');

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel|esc/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should allow typing numeric values', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('120');
      await user.clear(input);
      await user.type(input, '180');

      expect(input).toHaveValue('180');
    });

    it('should allow typing position values (bar:beat)', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="position"
          currentValue="1:1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('1:1');
      await user.clear(input);
      await user.type(input, '4:3');

      expect(input).toHaveValue('4:3');
    });
  });

  describe('Validation', () => {
    it('should not call onSubmit with invalid numeric value', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('120');
      await user.clear(input);
      await user.type(input, 'abc');
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error message for invalid tempo', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('120');
      await user.clear(input);
      await user.type(input, 'abc');
      await user.keyboard('{Enter}');

      expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    });

    it('should validate tempo range (20-300)', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('120');

      // Test too low
      await user.clear(input);
      await user.type(input, '10');
      await user.keyboard('{Enter}');
      expect(screen.getByText(/range/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();

      // Test too high
      await user.clear(input);
      await user.type(input, '400');
      await user.keyboard('{Enter}');
      expect(screen.getByText(/range/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate position format (bar:beat)', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="position"
          currentValue="1:1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('1:1');
      await user.clear(input);
      await user.type(input, 'invalid');
      await user.keyboard('{Enter}');

      expect(screen.getByText(/format/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should convert position string to beats and call onSubmit', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="position"
          currentValue="1:1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('1:1');
      await user.clear(input);
      await user.type(input, '2:3');
      await user.keyboard('{Enter}');

      // Bar 2, Beat 3 = (2-1) * 4 + (3-1) = 4 + 2 = 6 beats
      expect(mockOnSubmit).toHaveBeenCalledWith(6);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('120');
      expect(input).toHaveAttribute('aria-label');
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByDisplayValue('120');
      const submitButton = screen.getByRole('button', { name: /submit|ok/i });
      const cancelButton = screen.getByRole('button', { name: /cancel|esc/i });

      // Tab through elements
      expect(input).toHaveFocus();
      await user.tab();
      expect(submitButton).toHaveFocus();
      await user.tab();
      expect(cancelButton).toHaveFocus();
      await user.tab();
      expect(input).toHaveFocus(); // Should cycle back
    });

    it('should have role="dialog"', () => {
      render(
        <QuickInput
          command="tempo"
          currentValue={120}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
