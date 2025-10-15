/**
 * QuickInput Component Tests
 * Tests for the quick value entry modal dialog
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickInput, QuickInputProps } from './QuickInput';
import { actUser } from '@/utils/testUtils';

describe('QuickInput', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  /**
   * Helper to render QuickInput and wait for auto-focus effect to complete
   */
  const renderQuickInput = async (props: QuickInputProps) => {
    const result = render(<QuickInput {...props} />);
    // Wait for autofocus effect and any state updates to complete
    await waitFor(() => {
      const input = screen.getByDisplayValue(String(props.currentValue));
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });
    return result;
  };

  describe('Rendering', () => {
    it('should render with tempo command', async () => {
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      expect(screen.getByText('SET TEMPO')).toBeInTheDocument();
      expect(screen.getByLabelText('Tempo (BPM)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('120')).toBeInTheDocument();
    });

    it('should render with zoom command', async () => {
      await renderQuickInput({
        command: "zoom",
        currentValue: 5,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      expect(screen.getByText('SET ZOOM LEVEL')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom (px/beat)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    it('should render with snap command', async () => {
      await renderQuickInput({
        command: "snap",
        currentValue: 1,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      expect(screen.getByText('SET SNAP GRID')).toBeInTheDocument();
      expect(screen.getByLabelText('Snap value (beats)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    it('should render with length command', async () => {
      await renderQuickInput({
        command: "length",
        currentValue: 4,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      expect(screen.getByText('SET CLIP LENGTH')).toBeInTheDocument();
      expect(screen.getByLabelText('Length (beats)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4')).toBeInTheDocument();
    });

    it('should render with position command', async () => {
      await renderQuickInput({
        command: "position",
        currentValue: "1:1",
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      expect(screen.getByText('JUMP TO POSITION')).toBeInTheDocument();
      expect(screen.getByLabelText('Position (bar:beat)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1:1')).toBeInTheDocument();
    });

    it('should auto-focus the input field', async () => {
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('120');
      expect(input).toHaveFocus();
    });
  });

  describe('User Interaction', () => {
    it('should call onSubmit with numeric value when Enter is pressed', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('120');
      await actUser(() => user.clear(input));
      await actUser(() => user.type(input, '140'));
      await actUser(() => user.keyboard('{Enter}'));

      expect(mockOnSubmit).toHaveBeenCalledWith(140);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmit when submit button is clicked', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('120');
      await actUser(() => user.clear(input));
      await actUser(() => user.type(input, '140'));

      const submitButton = screen.getByRole('button', { name: /submit|ok/i });
      await actUser(() => user.click(submitButton));

      expect(mockOnSubmit).toHaveBeenCalledWith(140);
    });

    it('should call onCancel when Escape is pressed', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('120');
      await actUser(() => user.click(input));
      await actUser(() => user.keyboard('{Escape}'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const cancelButton = screen.getByRole('button', { name: /cancel|esc/i });
      await actUser(() => user.click(cancelButton));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should allow typing numeric values', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('120');
      await actUser(() => user.clear(input));
      await actUser(() => user.type(input, '180'));

      expect(input).toHaveValue('180');
    });

    it('should allow typing position values (bar:beat)', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "position",
        currentValue: "1:1",
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('1:1');
      await actUser(() => user.clear(input));
      await actUser(() => user.type(input, '4:3'));

      expect(input).toHaveValue('4:3');
    });
  });

  describe('Validation', () => {
    it('should not call onSubmit with invalid numeric value', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('120');
      await actUser(() => user.clear(input));
      await actUser(() => user.type(input, 'abc'));
      await actUser(() => user.keyboard('{Enter}'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error message for invalid tempo', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('120');
      await actUser(() => user.clear(input));
      await actUser(() => user.type(input, 'abc'));
      await actUser(() => user.keyboard('{Enter}'));

      expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    });

    it('should validate tempo range (20-300)', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('120');

      // Test too low
      await actUser(() => user.clear(input));
      await actUser(() => user.type(input, '10'));
      await actUser(() => user.keyboard('{Enter}'));
      expect(screen.getByText(/range/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();

      // Test too high
      await actUser(() => user.clear(input));
      await actUser(() => user.type(input, '400'));
      await actUser(() => user.keyboard('{Enter}'));
      expect(screen.getByText(/range/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate position format (bar:beat)', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "position",
        currentValue: "1:1",
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('1:1');
      await actUser(() => user.clear(input));
      await actUser(() => user.type(input, 'invalid'));
      await actUser(() => user.keyboard('{Enter}'));

      expect(screen.getByText(/format/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should convert position string to beats and call onSubmit', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "position",
        currentValue: "1:1",
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('1:1');
      await actUser(() => user.clear(input));
      await actUser(() => user.type(input, '2:3'));
      await actUser(() => user.keyboard('{Enter}'));

      // Bar 2, Beat 3 = (2-1) * 4 + (3-1) = 4 + 2 = 6 beats
      expect(mockOnSubmit).toHaveBeenCalledWith(6);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('120');
      expect(input).toHaveAttribute('aria-label');
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      const input = screen.getByDisplayValue('120');
      const submitButton = screen.getByRole('button', { name: /submit|ok/i });
      const cancelButton = screen.getByRole('button', { name: /cancel|esc/i });

      // Tab through elements
      expect(input).toHaveFocus();
      await actUser(() => user.tab());
      expect(submitButton).toHaveFocus();
      await actUser(() => user.tab());
      expect(cancelButton).toHaveFocus();
      await actUser(() => user.tab());
      expect(input).toHaveFocus(); // Should cycle back
    });

    it('should have role="dialog"', async () => {
      await renderQuickInput({
        command: "tempo",
        currentValue: 120,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
