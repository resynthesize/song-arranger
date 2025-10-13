/**
 * Song Arranger - BootSequence Component
 * Authentic terminal boot sequence with localStorage skip preference
 * Inspired by Commodore 8032 and vintage computing
 */

import { useEffect, useState, useCallback } from 'react';
import './BootSequence.css';

interface BootSequenceProps {
  onComplete: () => void;
}

// Boot messages with timing
interface BootMessage {
  text: string;
  delay: number;
  status?: string;
}

const BOOT_MESSAGES: BootMessage[] = [
  { text: '> COMMODORE 8032 AV', delay: 100 },
  { text: '> 64K RAM SYSTEM', delay: 300 },
  { text: '', delay: 200 },
  { text: '> LOADING SONG ARRANGER v0.1', delay: 400 },
  { text: '> INITIALIZING LANES.........', delay: 600, status: '[OK]' },
  { text: '> MOUNTING TIMELINE..........', delay: 600, status: '[OK]' },
  { text: '> LOADING CRT EFFECTS........', delay: 500, status: '[OK]' },
  { text: '', delay: 200 },
  { text: '> READY.', delay: 300 },
];

const SKIP_STORAGE_KEY = 'skipBootSequence';

const BootSequence = ({ onComplete }: BootSequenceProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<Array<{ text: string; status?: string }>>([]);
  const [shouldSkip, setShouldSkip] = useState(false);

  // Check if user has set skip preference
  useEffect(() => {
    const skipPreference = localStorage.getItem(SKIP_STORAGE_KEY);
    if (skipPreference === 'true') {
      setShouldSkip(true);
      onComplete();
    }
  }, [onComplete]);

  // Handle skip with Escape key
  const handleSkip = useCallback(() => {
    if (!shouldSkip) {
      localStorage.setItem(SKIP_STORAGE_KEY, 'true');
      setShouldSkip(true);
      onComplete();
    }
  }, [shouldSkip, onComplete]);

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [handleSkip]);

  // Animate boot messages sequentially
  useEffect(() => {
    if (shouldSkip || currentMessageIndex >= BOOT_MESSAGES.length) {
      if (currentMessageIndex >= BOOT_MESSAGES.length) {
        // Sequence complete
        const timer = setTimeout(() => {
          onComplete();
        }, 500);
        return () => { clearTimeout(timer); };
      }
      return;
    }

    const message = BOOT_MESSAGES[currentMessageIndex];
    if (!message) return;

    const timer = setTimeout(() => {
      setDisplayedMessages((prev) => [
        ...prev,
        { text: message.text, status: message.status },
      ]);
      setCurrentMessageIndex((prev) => prev + 1);
    }, message.delay);

    return () => { clearTimeout(timer); };
  }, [currentMessageIndex, shouldSkip, onComplete]);

  // Don't render if skip preference is set
  if (shouldSkip) {
    return null;
  }

  return (
    <div className="boot-sequence" data-testid="boot-sequence">
      <div className="boot-sequence__container">
        <div className="boot-sequence__messages" data-testid="boot-messages">
          {displayedMessages.map((msg, index) => (
            <div key={index} className="boot-sequence__line">
              <span className="boot-sequence__text">{msg.text}</span>
              {msg.status && (
                <span className="boot-sequence__status">{msg.status}</span>
              )}
            </div>
          ))}
          {currentMessageIndex < BOOT_MESSAGES.length && (
            <span className="boot-sequence__cursor">_</span>
          )}
        </div>

        <div className="boot-sequence__footer">
          <span className="boot-sequence__hint">
            PRESS ESC TO SKIP AND DISABLE BOOT SEQUENCE
          </span>
        </div>
      </div>
    </div>
  );
};

export default BootSequence;
