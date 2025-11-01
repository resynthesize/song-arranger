/**
 * Cyclone - StatusLine Component
 * Displays status messages above the footer
 */

import { useEffect, useRef } from 'react';
import { logger } from '@/utils/debug';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearStatus } from '@/store/slices/statusSlice';
import './StatusLine.css';

const StatusLine = () => {
  const dispatch = useAppDispatch();
  const currentMessage = useAppSelector((state) => state.status.currentMessage);
  const statusLineRef = useRef<HTMLDivElement>(null);

  // Auto-clear success/info messages after 5 seconds
  useEffect(() => {
    if (currentMessage && (currentMessage.type === 'success' || currentMessage.type === 'info')) {
      const timer = setTimeout(() => {
        dispatch(clearStatus());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentMessage, dispatch]);

  // Debug logging for status line dimensions
  useEffect(() => {
    if (currentMessage && statusLineRef.current) {
      const rect = statusLineRef.current.getBoundingClientRect();
      logger.debug('[StatusLine] Rendered with dimensions:', {
        height: rect.height,
        bottom: rect.bottom,
        top: rect.top,
        message: currentMessage.message,
        type: currentMessage.type
      });
    }
  }, [currentMessage]);

  if (!currentMessage) {
    logger.debug('[StatusLine] Not rendering - no message');
    return null;
  }

  return (
    <div
      ref={statusLineRef}
      className={`status-line status-line--${currentMessage.type}`}
      data-testid="status-line"
    >
      <span className="status-line__message">{currentMessage.message}</span>
      <button
        className="status-line__close"
        onClick={() => dispatch(clearStatus())}
        aria-label="Close status message"
      >
        ×
      </button>
    </div>
  );
};

export default StatusLine;
