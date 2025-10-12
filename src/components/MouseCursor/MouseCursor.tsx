/**
 * MouseCursor Component
 * Terminal-style block cursor that follows the mouse with context-aware states
 */

import { useEffect, useState, useRef } from 'react';
import './MouseCursor.css';

export type CursorState =
  | 'default'     // █ block
  | 'grab'        // ✋ hand
  | 'grabbing'    // ✊ closed hand
  | 'resize-h'    // ◄► horizontal resize
  | 'resize-e'    // ► east resize
  | 'resize-w'    // ◄ west resize
  | 'pointer';    // ▶ pointer

export interface MouseCursorProps {
  enabled?: boolean;
}

const CURSOR_ICONS: Record<CursorState, string> = {
  default: '█',
  grab: '✋',
  grabbing: '✊',
  'resize-h': '◄►',
  'resize-e': '►',
  'resize-w': '◄',
  pointer: '▶',
};

export const MouseCursor: React.FC<MouseCursorProps> = ({ enabled = true }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [isVisible, setIsVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(false);
      return;
    }

    const updateCursorState = (target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement)) return 'default';

      const computedStyle = window.getComputedStyle(target);
      const cursor = computedStyle.cursor;

      // Map CSS cursor values to our cursor states
      // Check grabbing before grab since grabbing contains "grab"
      if (cursor.includes('grabbing')) {
        return 'grabbing';
      } else if (cursor.includes('grab')) {
        return 'grab';
      } else if (cursor.includes('ew-resize')) {
        return 'resize-h';
      } else if (cursor.includes('e-resize')) {
        return 'resize-e';
      } else if (cursor.includes('w-resize')) {
        return 'resize-w';
      } else if (cursor.includes('pointer')) {
        return 'pointer';
      }

      return 'default';
    };

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const newState = updateCursorState(e.target);
      setCursorState(newState);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Track mouse movement
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled]);

  if (!enabled || !isVisible) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className={`mouse-cursor mouse-cursor--${cursorState}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      data-testid="mouse-cursor"
      aria-hidden="true"
    >
      {CURSOR_ICONS[cursorState]}
    </div>
  );
};
