/**
 * BlockCursor Component Tests
 */

import { render, screen } from '@testing-library/react';
import { BlockCursor } from './BlockCursor';

describe('BlockCursor', () => {
  describe('Rendering', () => {
    it('should render cursor element', () => {
      const { container } = render(<BlockCursor />);
      expect(container.querySelector('.block-cursor')).toBeInTheDocument();
    });

    it('should render with text content', () => {
      render(<BlockCursor>A</BlockCursor>);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should render empty space when no children provided', () => {
      const { container } = render(<BlockCursor />);
      const cursor = container.querySelector('.block-cursor');
      expect(cursor?.textContent).toBe('\u00A0');
    });

    it('should apply custom className', () => {
      const { container } = render(<BlockCursor className="custom-class" />);
      expect(container.querySelector('.block-cursor')).toHaveClass('custom-class');
    });

    it('should apply size classes', () => {
      const { container, rerender } = render(<BlockCursor size="sm" />);
      expect(container.querySelector('.block-cursor')).toHaveClass('block-cursor--sm');

      rerender(<BlockCursor size="md" />);
      expect(container.querySelector('.block-cursor')).toHaveClass('block-cursor--md');

      rerender(<BlockCursor size="lg" />);
      expect(container.querySelector('.block-cursor')).toHaveClass('block-cursor--lg');
    });
  });

  describe('Animation', () => {
    it('should not have no-blink class by default', () => {
      const { container } = render(<BlockCursor />);
      const cursor = container.querySelector('.block-cursor');
      expect(cursor).not.toHaveClass('block-cursor--no-blink');
    });

    it('should not blink when blink prop is false', () => {
      const { container } = render(<BlockCursor blink={false} />);
      expect(container.querySelector('.block-cursor')).toHaveClass('block-cursor--no-blink');
    });

    it('should blink when blink prop is true', () => {
      const { container } = render(<BlockCursor blink={true} />);
      const cursor = container.querySelector('.block-cursor');
      expect(cursor).not.toHaveClass('block-cursor--no-blink');
    });
  });

  describe('Variants', () => {
    it('should apply variant classes', () => {
      const { container, rerender } = render(<BlockCursor variant="primary" />);
      expect(container.querySelector('.block-cursor')).toHaveClass('block-cursor--primary');

      rerender(<BlockCursor variant="secondary" />);
      expect(container.querySelector('.block-cursor')).toHaveClass('block-cursor--secondary');

      rerender(<BlockCursor variant="highlight" />);
      expect(container.querySelector('.block-cursor')).toHaveClass('block-cursor--highlight');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden by default', () => {
      const { container } = render(<BlockCursor />);
      expect(container.querySelector('.block-cursor')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });

    it('should allow aria-hidden to be overridden', () => {
      const { container } = render(<BlockCursor aria-hidden={false} />);
      expect(container.querySelector('.block-cursor')).toHaveAttribute(
        'aria-hidden',
        'false'
      );
    });
  });

  describe('Inline Display', () => {
    it('should be positioned inline with text', () => {
      const { container } = render(
        <div>
          Text<BlockCursor />After
        </div>
      );
      const cursor = container.querySelector('.block-cursor');
      expect(cursor).toBeInTheDocument();
      expect(cursor?.textContent).toBe('\u00A0');
    });
  });
});
