/**
 * Song Arranger - ColorPicker Component
 * Retro terminal-styled color picker for lane colors
 */

import { useEffect, useState } from 'react';
import { TerminalPanel } from '../../molecules/TerminalPanel';
import './ColorPicker.css';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  onClose: () => void;
}

// Terminal-inspired color palette (~35 colors)
const COLOR_PALETTE = [
  // Green variants (classic terminal)
  ['#001100', '#002200', '#003300', '#004400', '#005500', '#006600', '#007700', '#008800', '#00ff00'],
  // Amber/Yellow variants
  ['#221100', '#443300', '#665500', '#887700', '#aa9900', '#ccbb00', '#ffdd00', '#ffee00', '#ffff00'],
  // Blue variants
  ['#000033', '#000066', '#000099', '#0000cc', '#0000ff', '#0033ff', '#0066ff', '#0099ff', '#00ccff'],
  // Red variants
  ['#330000', '#660000', '#990000', '#cc0000', '#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00'],
  // Purple/Magenta variants
  ['#330033', '#660066', '#990099', '#cc00cc', '#ff00ff', '#ff33ff', '#ff66ff', '#ff99ff', '#ffccff'],
  // White/Gray variants
  ['#111111', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd', '#eeeeee', '#ffffff'],
];

const ColorPicker = ({ selectedColor, onSelectColor, onClose }: ColorPickerProps) => {
  const [currentColor, setCurrentColor] = useState(selectedColor);
  const [focusedIndex, setFocusedIndex] = useState(() => {
    // Find initial focused index
    for (let rowIdx = 0; rowIdx < COLOR_PALETTE.length; rowIdx++) {
      const colIdx = COLOR_PALETTE[rowIdx]?.indexOf(selectedColor);
      if (colIdx !== undefined && colIdx !== -1) {
        return { row: rowIdx, col: colIdx };
      }
    }
    return { row: 0, col: 8 }; // Default to bright green
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

  return (
    <div className="color-picker">
      <TerminalPanel title="SELECT LANE COLOR" variant="elevated" padding="md">
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
