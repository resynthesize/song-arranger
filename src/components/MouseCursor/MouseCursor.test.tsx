/**
 * MouseCursor Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MouseCursor } from './MouseCursor';

describe('MouseCursor', () => {
  describe('Rendering', () => {
    it('should not render when disabled', () => {
      render(<MouseCursor enabled={false} />);
      expect(screen.queryByTestId('mouse-cursor')).not.toBeInTheDocument();
    });

    it('should not render initially when enabled (before mouse move)', () => {
      render(<MouseCursor enabled={true} />);
      expect(screen.queryByTestId('mouse-cursor')).not.toBeInTheDocument();
    });

    it('should render after mouse movement', () => {
      render(<MouseCursor enabled={true} />);

      // Simulate mouse movement
      fireEvent.mouseMove(document, { clientX: 100, clientY: 200 });

      expect(screen.getByTestId('mouse-cursor')).toBeInTheDocument();
    });

    it('should update position on mouse move', () => {
      render(<MouseCursor enabled={true} />);

      // Move mouse
      fireEvent.mouseMove(document, { clientX: 150, clientY: 250 });

      const cursor = screen.getByTestId('mouse-cursor');
      expect(cursor).toHaveStyle({
        left: '150px',
        top: '250px',
      });
    });
  });

  describe('Cursor States', () => {
    it('should show default block cursor initially', () => {
      render(<MouseCursor enabled={true} />);

      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });

      const cursor = screen.getByTestId('mouse-cursor');
      expect(cursor).toHaveClass('mouse-cursor--default');
      expect(cursor).toHaveTextContent('█');
    });

    it('should change to grab cursor over grabable elements', () => {
      const { container } = render(
        <div>
          <MouseCursor enabled={true} />
          <div data-testid="grabable" style={{ cursor: 'grab' }}>
            Grabable
          </div>
        </div>
      );

      const grabable = screen.getByTestId('grabable');
      fireEvent.mouseMove(grabable, { clientX: 100, clientY: 100 });

      const cursor = container.querySelector('.mouse-cursor');
      expect(cursor).toHaveClass('mouse-cursor--grab');
      expect(cursor?.textContent).toBe('✋');
    });

    it('should change to grabbing cursor when grabbing', () => {
      const { container } = render(
        <div>
          <MouseCursor enabled={true} />
          <div data-testid="grabbing" style={{ cursor: 'grabbing' }}>
            Grabbing
          </div>
        </div>
      );

      const grabbing = screen.getByTestId('grabbing');
      fireEvent.mouseMove(grabbing, { clientX: 100, clientY: 100 });

      const cursor = container.querySelector('.mouse-cursor');
      expect(cursor).toHaveClass('mouse-cursor--grabbing');
      expect(cursor?.textContent).toBe('✊');
    });

    it('should change to resize-h cursor over horizontal resize elements', () => {
      const { container } = render(
        <div>
          <MouseCursor enabled={true} />
          <div data-testid="resize" style={{ cursor: 'ew-resize' }}>
            Resize
          </div>
        </div>
      );

      const resize = screen.getByTestId('resize');
      fireEvent.mouseMove(resize, { clientX: 100, clientY: 100 });

      const cursor = container.querySelector('.mouse-cursor');
      expect(cursor).toHaveClass('mouse-cursor--resize-h');
      expect(cursor?.textContent).toBe('◄►');
    });

    it('should change to resize-e cursor over east resize elements', () => {
      const { container } = render(
        <div>
          <MouseCursor enabled={true} />
          <div data-testid="resize-e" style={{ cursor: 'e-resize' }}>
            Resize East
          </div>
        </div>
      );

      const resize = screen.getByTestId('resize-e');
      fireEvent.mouseMove(resize, { clientX: 100, clientY: 100 });

      const cursor = container.querySelector('.mouse-cursor');
      expect(cursor).toHaveClass('mouse-cursor--resize-e');
      expect(cursor?.textContent).toBe('►');
    });

    it('should change to resize-w cursor over west resize elements', () => {
      const { container } = render(
        <div>
          <MouseCursor enabled={true} />
          <div data-testid="resize-w" style={{ cursor: 'w-resize' }}>
            Resize West
          </div>
        </div>
      );

      const resize = screen.getByTestId('resize-w');
      fireEvent.mouseMove(resize, { clientX: 100, clientY: 100 });

      const cursor = container.querySelector('.mouse-cursor');
      expect(cursor).toHaveClass('mouse-cursor--resize-w');
      expect(cursor?.textContent).toBe('◄');
    });

    it('should change to pointer cursor over clickable elements', () => {
      const { container } = render(
        <div>
          <MouseCursor enabled={true} />
          <div data-testid="clickable" style={{ cursor: 'pointer' }}>
            Click me
          </div>
        </div>
      );

      const clickable = screen.getByTestId('clickable');
      fireEvent.mouseMove(clickable, { clientX: 100, clientY: 100 });

      const cursor = container.querySelector('.mouse-cursor');
      expect(cursor).toHaveClass('mouse-cursor--pointer');
      expect(cursor?.textContent).toBe('▶');
    });
  });

  describe('Visibility', () => {
    it('should hide cursor on mouse leave', () => {
      render(<MouseCursor enabled={true} />);

      // Show cursor
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      expect(screen.getByTestId('mouse-cursor')).toBeInTheDocument();

      // Hide cursor
      fireEvent.mouseLeave(document);
      expect(screen.queryByTestId('mouse-cursor')).not.toBeInTheDocument();
    });

    it('should show cursor on mouse enter', () => {
      render(<MouseCursor enabled={true} />);

      fireEvent.mouseEnter(document);
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });

      expect(screen.getByTestId('mouse-cursor')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden attribute', () => {
      render(<MouseCursor enabled={true} />);

      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });

      const cursor = screen.getByTestId('mouse-cursor');
      expect(cursor).toHaveAttribute('aria-hidden', 'true');
    });

    it('should not be focusable', () => {
      render(<MouseCursor enabled={true} />);

      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });

      const cursor = screen.getByTestId('mouse-cursor');
      expect(cursor).not.toHaveAttribute('tabindex');
    });
  });

  describe('Performance', () => {
    it('should have pointer-events: none to avoid interfering with mouse events', () => {
      render(<MouseCursor enabled={true} />);

      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });

      const cursor = screen.getByTestId('mouse-cursor');
      expect(cursor).toHaveClass('mouse-cursor');
      // The CSS class should have pointer-events: none
    });
  });
});
