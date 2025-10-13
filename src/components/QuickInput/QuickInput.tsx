/**
 * QuickInput Component
 * Modal dialog for direct numeric input (Voyetra-style)
 */

import React, { useState, useRef, useEffect } from 'react';
import { TerminalPanel } from '@/components/TerminalPanel';
import { TerminalInput } from '@/components/atoms/TerminalInput';
import { TerminalButton } from '@/components/atoms/TerminalButton';
import './QuickInput.css';

export interface QuickInputProps {
  command: 'tempo' | 'zoom' | 'snap' | 'length' | 'position';
  currentValue: number | string;
  onSubmit: (value: number) => void;
  onCancel: () => void;
}

interface CommandConfig {
  title: string;
  unit: string;
  inputLabel: string;
  validate: (value: string) => { valid: boolean; error?: string; numericValue?: number };
}

const COMMAND_CONFIGS: Record<QuickInputProps['command'], CommandConfig> = {
  tempo: {
    title: 'SET TEMPO',
    unit: 'BPM',
    inputLabel: 'Tempo (BPM)',
    validate: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return { valid: false, error: 'Invalid number' };
      }
      if (num < 20 || num > 300) {
        return { valid: false, error: 'Tempo must be in range 20-300 BPM' };
      }
      return { valid: true, numericValue: num };
    },
  },
  zoom: {
    title: 'SET ZOOM LEVEL',
    unit: 'px/beat',
    inputLabel: 'Zoom (px/beat)',
    validate: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return { valid: false, error: 'Invalid number' };
      }
      if (num <= 0) {
        return { valid: false, error: 'Zoom must be positive' };
      }
      return { valid: true, numericValue: num };
    },
  },
  snap: {
    title: 'SET SNAP GRID',
    unit: 'beats',
    inputLabel: 'Snap value (beats)',
    validate: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return { valid: false, error: 'Invalid number' };
      }
      if (num < 0) {
        return { valid: false, error: 'Snap value must be non-negative' };
      }
      return { valid: true, numericValue: num };
    },
  },
  length: {
    title: 'SET CLIP LENGTH',
    unit: 'beats',
    inputLabel: 'Length (beats)',
    validate: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return { valid: false, error: 'Invalid number' };
      }
      if (num <= 0) {
        return { valid: false, error: 'Length must be positive' };
      }
      return { valid: true, numericValue: num };
    },
  },
  position: {
    title: 'JUMP TO POSITION',
    unit: 'bar:beat',
    inputLabel: 'Position (bar:beat)',
    validate: (value: string) => {
      // Match format like "1:1", "4:3", etc.
      const match = value.match(/^(\d+):(\d+)$/);
      if (!match) {
        return { valid: false, error: 'Invalid format. Use bar:beat (e.g., 1:1, 4:3)' };
      }
      const barStr = match[1];
      const beatStr = match[2];
      if (!barStr || !beatStr) {
        return { valid: false, error: 'Invalid format' };
      }
      const bar = parseInt(barStr, 10);
      const beat = parseInt(beatStr, 10);
      if (bar < 1 || beat < 1) {
        return { valid: false, error: 'Bar and beat must be at least 1' };
      }
      // Convert to beats (4 beats per bar, 1-indexed)
      const numericValue = (bar - 1) * 4 + (beat - 1);
      return { valid: true, numericValue };
    },
  },
};

export const QuickInput: React.FC<QuickInputProps> = ({
  command,
  currentValue,
  onSubmit,
  onCancel,
}) => {
  const config = COMMAND_CONFIGS[command];
  const [inputValue, setInputValue] = useState(String(currentValue));
  const [error, setError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const validation = config.validate(inputValue);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    if (validation.numericValue !== undefined) {
      onSubmit(validation.numericValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Tab') {
      // Implement focus trap
      e.preventDefault();
      const activeElement = document.activeElement;
      if (activeElement === inputRef.current) {
        submitButtonRef.current?.focus();
      } else if (activeElement === submitButtonRef.current) {
        cancelButtonRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  };

  return (
    <div
      className="quick-input-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-input-title"
      onKeyDown={handleKeyDown}
    >
      <div className="quick-input-container">
        <TerminalPanel title={config.title} variant="elevated">
          <div className="quick-input-content">
            <div className="quick-input-info">
              <span className="quick-input-label">Current:</span>
              <span className="quick-input-current">{currentValue} {config.unit}</span>
            </div>

            <TerminalInput
              ref={inputRef}
              label={config.inputLabel}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError(undefined);
              }}
              error={error}
              aria-label={config.inputLabel}
              fullWidth
            />

            <div className="quick-input-actions">
              <TerminalButton
                ref={submitButtonRef}
                onClick={handleSubmit}
                variant="primary"
              >
                OK [Enter]
              </TerminalButton>
              <TerminalButton
                ref={cancelButtonRef}
                onClick={onCancel}
                variant="secondary"
              >
                Cancel [ESC]
              </TerminalButton>
            </div>
          </div>
        </TerminalPanel>
      </div>
    </div>
  );
};
