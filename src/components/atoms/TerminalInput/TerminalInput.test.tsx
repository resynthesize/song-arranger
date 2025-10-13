/**
 * TerminalInput Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TerminalInput } from './TerminalInput';

describe('TerminalInput', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<TerminalInput />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<TerminalInput label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<TerminalInput placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(<TerminalInput error="Invalid input" />);
      expect(screen.getByText('Invalid input')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<TerminalInput className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should apply size classes', () => {
      const { rerender } = render(<TerminalInput size="sm" />);
      expect(screen.getByRole('textbox')).toHaveClass('terminal-input--sm');

      rerender(<TerminalInput size="md" />);
      expect(screen.getByRole('textbox')).toHaveClass('terminal-input--md');

      rerender(<TerminalInput size="lg" />);
      expect(screen.getByRole('textbox')).toHaveClass('terminal-input--lg');
    });
  });

  describe('Interactions', () => {
    it('should accept text input', async () => {
      const user = userEvent.setup();
      render(<TerminalInput />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Hello World');
      expect(input).toHaveValue('Hello World');
    });

    it('should call onChange when value changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<TerminalInput onChange={handleChange} />);
      await user.type(screen.getByRole('textbox'), 'test');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onFocus when focused', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();

      render(<TerminalInput onFocus={handleFocus} />);
      await user.click(screen.getByRole('textbox'));

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when blurred', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();

      render(<TerminalInput onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should be focusable with keyboard', async () => {
      const user = userEvent.setup();
      render(<TerminalInput />);

      await user.tab();
      expect(screen.getByRole('textbox')).toHaveFocus();
    });
  });

  describe('States', () => {
    it('should apply disabled state', () => {
      render(<TerminalInput disabled />);
      const input = screen.getByRole('textbox');

      expect(input).toBeDisabled();
      expect(input).toHaveClass('terminal-input--disabled');
    });

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<TerminalInput disabled />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');
      expect(input).toHaveValue('');
    });

    it('should apply error state when error prop is provided', () => {
      render(<TerminalInput error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('terminal-input--error');
    });

    it('should apply focused state styles', async () => {
      const user = userEvent.setup();
      render(<TerminalInput />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      expect(input).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when disabled', () => {
      render(<TerminalInput disabled />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should link label with input via id', () => {
      render(<TerminalInput label="Email" id="email-input" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email');

      expect(label).toHaveAttribute('for', 'email-input');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('should have aria-invalid when error is present', () => {
      render(<TerminalInput error="Invalid" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link error message with input via aria-describedby', () => {
      render(<TerminalInput id="test-input" error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
      expect(screen.getByText('Error message')).toHaveAttribute('id', 'test-input-error');
    });
  });

  describe('Value Control', () => {
    it('should work as controlled component', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <TerminalInput
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'controlled');
      expect(input).toHaveValue('controlled');
    });

    it('should support defaultValue for uncontrolled component', () => {
      render(<TerminalInput defaultValue="default text" />);
      expect(screen.getByRole('textbox')).toHaveValue('default text');
    });
  });

  describe('Full Width', () => {
    it('should apply fullWidth class', () => {
      render(<TerminalInput fullWidth />);
      const container = screen.getByRole('textbox').parentElement;
      expect(container).toHaveClass('terminal-input-wrapper--full-width');
    });
  });
});
