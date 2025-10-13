/**
 * TerminalPanel Component Tests
 */

import { render, screen } from '@testing-library/react';
import { TerminalPanel } from './TerminalPanel';

describe('TerminalPanel', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      render(
        <TerminalPanel>
          <p>Panel content</p>
        </TerminalPanel>
      );
      expect(screen.getByText('Panel content')).toBeInTheDocument();
    });

    it('should render with title', () => {
      render(<TerminalPanel title="Panel Title">Content</TerminalPanel>);
      expect(screen.getByText('Panel Title')).toBeInTheDocument();
    });

    it('should render ASCII borders', () => {
      const { container } = render(<TerminalPanel>Content</TerminalPanel>);
      const panel = container.querySelector('.terminal-panel');

      expect(panel).toBeInTheDocument();
      expect(panel?.textContent).toContain('┌');
      expect(panel?.textContent).toContain('└');
      expect(panel?.textContent).toContain('─');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <TerminalPanel className="custom-class">Content</TerminalPanel>
      );
      expect(container.querySelector('.terminal-panel')).toHaveClass('custom-class');
    });

    it('should apply variant classes', () => {
      const { container, rerender } = render(
        <TerminalPanel variant="default">Default</TerminalPanel>
      );
      expect(container.querySelector('.terminal-panel')).toHaveClass(
        'terminal-panel--default'
      );

      rerender(<TerminalPanel variant="elevated">Elevated</TerminalPanel>);
      expect(container.querySelector('.terminal-panel')).toHaveClass(
        'terminal-panel--elevated'
      );

      rerender(<TerminalPanel variant="ghost">Ghost</TerminalPanel>);
      expect(container.querySelector('.terminal-panel')).toHaveClass(
        'terminal-panel--ghost'
      );
    });

    it('should apply padding option', () => {
      const { container, rerender } = render(
        <TerminalPanel padding="none">Content</TerminalPanel>
      );
      expect(container.querySelector('.terminal-panel')).toHaveClass(
        'terminal-panel--padding-none'
      );

      rerender(<TerminalPanel padding="sm">Content</TerminalPanel>);
      expect(container.querySelector('.terminal-panel')).toHaveClass(
        'terminal-panel--padding-sm'
      );

      rerender(<TerminalPanel padding="md">Content</TerminalPanel>);
      expect(container.querySelector('.terminal-panel')).toHaveClass(
        'terminal-panel--padding-md'
      );

      rerender(<TerminalPanel padding="lg">Content</TerminalPanel>);
      expect(container.querySelector('.terminal-panel')).toHaveClass(
        'terminal-panel--padding-lg'
      );
    });
  });

  describe('Title', () => {
    it('should render title in header', () => {
      render(<TerminalPanel title="Test Title">Content</TerminalPanel>);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('terminal-panel__title');
    });

    it('should not render header when no title is provided', () => {
      const { container } = render(<TerminalPanel>Content</TerminalPanel>);
      expect(container.querySelector('.terminal-panel__header')).not.toBeInTheDocument();
    });

    it('should integrate title with top border', () => {
      const { container } = render(<TerminalPanel title="Title">Content</TerminalPanel>);
      const header = container.querySelector('.terminal-panel__header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Border Customization', () => {
    it('should support noBorder prop', () => {
      const { container } = render(<TerminalPanel noBorder>Content</TerminalPanel>);
      expect(container.querySelector('.terminal-panel')).toHaveClass(
        'terminal-panel--no-border'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<TerminalPanel>Content</TerminalPanel>);
      const panel = container.querySelector('.terminal-panel');
      expect(panel).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      const { container } = render(
        <TerminalPanel aria-label="Settings Panel">Content</TerminalPanel>
      );
      expect(container.querySelector('.terminal-panel')).toHaveAttribute(
        'aria-label',
        'Settings Panel'
      );
    });

    it('should support role attribute', () => {
      const { container } = render(
        <TerminalPanel role="region">Content</TerminalPanel>
      );
      expect(container.querySelector('.terminal-panel')).toHaveAttribute('role', 'region');
    });
  });

  describe('Full Width', () => {
    it('should apply fullWidth class', () => {
      const { container } = render(<TerminalPanel fullWidth>Content</TerminalPanel>);
      expect(container.querySelector('.terminal-panel')).toHaveClass(
        'terminal-panel--full-width'
      );
    });
  });
});
