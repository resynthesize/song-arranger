/**
 * TerminalButton Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TerminalButton } from './TerminalButton';

describe('TerminalButton', () => {
  describe('Rendering', () => {
    it('should render with text', () => {
      render(<TerminalButton>Click Me</TerminalButton>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<TerminalButton className="custom-class">Button</TerminalButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should apply variant classes', () => {
      const { rerender } = render(<TerminalButton variant="primary">Primary</TerminalButton>);
      expect(screen.getByRole('button')).toHaveClass('terminal-button--primary');

      rerender(<TerminalButton variant="secondary">Secondary</TerminalButton>);
      expect(screen.getByRole('button')).toHaveClass('terminal-button--secondary');
    });

    it('should apply size classes', () => {
      const { rerender } = render(<TerminalButton size="sm">Small</TerminalButton>);
      expect(screen.getByRole('button')).toHaveClass('terminal-button--sm');

      rerender(<TerminalButton size="md">Medium</TerminalButton>);
      expect(screen.getByRole('button')).toHaveClass('terminal-button--md');

      rerender(<TerminalButton size="lg">Large</TerminalButton>);
      expect(screen.getByRole('button')).toHaveClass('terminal-button--lg');
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<TerminalButton onClick={handleClick}>Click Me</TerminalButton>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <TerminalButton onClick={handleClick} disabled>
          Disabled
        </TerminalButton>
      );
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should be focusable with keyboard', async () => {
      const user = userEvent.setup();
      render(<TerminalButton>Focus Me</TerminalButton>);

      const button = screen.getByRole('button');
      await user.tab();

      expect(button).toHaveFocus();
    });

    it('should trigger onClick on Enter key', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<TerminalButton onClick={handleClick}>Press Enter</TerminalButton>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger onClick on Space key', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<TerminalButton onClick={handleClick}>Press Space</TerminalButton>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('States', () => {
    it('should apply disabled state', () => {
      render(<TerminalButton disabled>Disabled</TerminalButton>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveClass('terminal-button--disabled');
    });

    it('should apply active state', () => {
      render(<TerminalButton active>Active</TerminalButton>);
      expect(screen.getByRole('button')).toHaveClass('terminal-button--active');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when disabled', () => {
      render(<TerminalButton disabled>Disabled</TerminalButton>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should accept custom aria-label', () => {
      render(<TerminalButton aria-label="Custom label">X</TerminalButton>);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });

    it('should have button type by default', () => {
      render(<TerminalButton>Button</TerminalButton>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should accept custom type attribute', () => {
      render(<TerminalButton type="submit">Submit</TerminalButton>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('Full Width', () => {
    it('should apply fullWidth class', () => {
      render(<TerminalButton fullWidth>Full Width</TerminalButton>);
      expect(screen.getByRole('button')).toHaveClass('terminal-button--full-width');
    });
  });
});
