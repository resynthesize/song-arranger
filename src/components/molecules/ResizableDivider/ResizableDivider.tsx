import { useState, useEffect, useRef } from 'react';
import styles from './ResizableDivider.module.css';

export interface ResizableDividerProps {
  onResize: (newHeight: number) => void;
  minHeight?: number;
  maxHeight?: number;
}

export const ResizableDivider = ({
  onResize,
  minHeight = 200,
  maxHeight = 600,
}: ResizableDividerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(minHeight);

  // Use refs to store handlers for cleanup
  const handlersRef = useRef<{
    handleMouseMove: ((event: MouseEvent) => void) | null;
    handleMouseUp: (() => void) | null;
  }>({
    handleMouseMove: null,
    handleMouseUp: null,
  });

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const newHeight = window.innerHeight - event.clientY;
      const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      setCurrentHeight(constrainedHeight);
      onResize(constrainedHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Store handlers in ref for cleanup
    handlersRef.current.handleMouseMove = handleMouseMove;
    handlersRef.current.handleMouseUp = handleMouseUp;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minHeight, maxHeight, onResize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const { handleMouseMove, handleMouseUp } = handlersRef.current;
      if (handleMouseMove) {
        document.removeEventListener('mousemove', handleMouseMove);
      }
      if (handleMouseUp) {
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const dividerClasses = [
    styles.divider,
    isHovered && styles.hover,
    isDragging && styles.dragging,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      data-testid="resizable-divider"
      className={dividerClasses}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="separator"
      aria-label="Resizable divider between timeline and pattern editor"
      aria-valuemin={minHeight}
      aria-valuemax={maxHeight}
      aria-valuenow={currentHeight}
      aria-orientation="horizontal"
      tabIndex={0}
    >
      <div className={styles.handle}>
        <div className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>
    </div>
  );
};
