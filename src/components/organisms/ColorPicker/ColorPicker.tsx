/**
 * Song Arranger - ColorPicker Component
 * Theme-aware color picker for lane colors
 */

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { TerminalPanel } from '../../molecules/TerminalPanel';
import { RETRO_COLOR_PALETTE, MODERN_COLOR_PALETTE } from '@/constants';
import './ColorPicker.css';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  onClose: () => void;
}

const ColorPicker = ({ selectedColor, onSelectColor, onClose }: ColorPickerProps) => {
  // Get current theme from Redux
  const theme = useAppSelector((state) => state.theme.current);

  // Select palette based on theme
  const COLOR_PALETTE = theme === 'modern' ? MODERN_COLOR_PALETTE : RETRO_COLOR_PALETTE;

  const [currentColor, setCurrentColor] = useState(selectedColor);
  const [focusedIndex, setFocusedIndex] = useState(() => {
    // Find initial focused index
    for (let rowIdx = 0; rowIdx < COLOR_PALETTE.length; rowIdx++) {
      const colIdx = COLOR_PALETTE[rowIdx]?.indexOf(selectedColor);
      if (colIdx !== undefined && colIdx !== -1) {
        return { row: rowIdx, col: colIdx };
      }
    }
    return { row: 0, col: 8 }; // Default to last color in first row
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const row = COLOR_PALETTE[focusedIndex.row];
        if (row && focusedIndex.col < row.length - 1) {
          const newIndex = { row: focusedIndex.row, col: focusedIndex.col + 1 };
          setFocusedIndex(newIndex);
          const newColor = row[newIndex.col];
          if (newColor) {
            setCurrentColor(newColor);
            onSelectColor(newColor);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (focusedIndex.col > 0) {
          const newIndex = { row: focusedIndex.row, col: focusedIndex.col - 1 };
          setFocusedIndex(newIndex);
          const row = COLOR_PALETTE[focusedIndex.row];
          const newColor = row?.[newIndex.col];
          if (newColor) {
            setCurrentColor(newColor);
            onSelectColor(newColor);
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (focusedIndex.row < COLOR_PALETTE.length - 1) {
          const newRow = focusedIndex.row + 1;
          const targetRow = COLOR_PALETTE[newRow];
          const newCol = Math.min(focusedIndex.col, (targetRow?.length ?? 1) - 1);
          const newIndex = { row: newRow, col: newCol };
          setFocusedIndex(newIndex);
          const newColor = targetRow?.[newCol];
          if (newColor) {
            setCurrentColor(newColor);
            onSelectColor(newColor);
          }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focusedIndex.row > 0) {
          const newRow = focusedIndex.row - 1;
          const targetRow = COLOR_PALETTE[newRow];
          const newCol = Math.min(focusedIndex.col, (targetRow?.length ?? 1) - 1);
          const newIndex = { row: newRow, col: newCol };
          setFocusedIndex(newIndex);
          const newColor = targetRow?.[newCol];
          if (newColor) {
            setCurrentColor(newColor);
            onSelectColor(newColor);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onSelectColor, focusedIndex]);

  const handleSwatchClick = (color: string) => {
    setCurrentColor(color);
    onSelectColor(color);
  };

  const panelTitle = theme === 'modern' ? 'SELECT TRACK COLOR' : 'SELECT LANE COLOR';

  return (
    <div className="color-picker">
      <TerminalPanel title={panelTitle} variant="elevated" padding="md">
        <div className="color-picker__content">
          <div className="color-picker__palette">
            {COLOR_PALETTE.map((row, rowIdx) => (
              <div key={rowIdx} className="color-picker__row">
                {row.map((color) => (
                  <button
                    key={color}
                    data-testid={`color-swatch-${color}`}
                    className={`color-picker__swatch ${
                      currentColor === color ? 'color-picker__swatch--selected' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleSwatchClick(color)}
                    title={color}
                    aria-label={`Select color ${color}`}
                  >
                    {currentColor === color ? '█' : ' '}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="color-picker__preview">
            <span className="color-picker__preview-label">PREVIEW:</span>
            <span
              className="color-picker__preview-swatch"
              style={{ color: currentColor }}
            >
              █
            </span>
            <span className="color-picker__preview-hex">{currentColor}</span>
          </div>

          <div className="color-picker__instructions">
            [ENTER] SELECT [ESC] CANCEL
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
};

export default ColorPicker;
