/**
 * Cyclone - CirklonExportDialog Component
 * Dialog for exporting project to Cirklon CKS format
 */

import { useEffect, useState } from 'react';
import { TerminalPanel } from '../../molecules/TerminalPanel';
import type { ExportOptions } from '@/utils/cirklon/export';
import './CirklonExportDialog.css';

export interface CirklonExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}

const CirklonExportDialog: React.FC<CirklonExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const [sceneLengthBars, setSceneLengthBars] = useState(8);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [songName, setSongName] = useState('Untitled');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleExportClick = () => {
    // Validate inputs
    if (!songName.trim()) {
      return;
    }

    if (beatsPerBar <= 0) {
      return;
    }

    const options: ExportOptions = {
      sceneLengthBars,
      beatsPerBar,
      songName: songName.trim(),
      tempo: 120,
    };

    onExport(options);
  };

  const handleCancelClick = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="cirklon-export-dialog">
      <TerminalPanel title="EXPORT CIRKLON (.CKS)" variant="elevated" padding="md">
        <div className="cirklon-export-dialog__content">
          <div className="cirklon-export-dialog__field">
            <label className="cirklon-export-dialog__label" htmlFor="song-name">
              SONG NAME:
            </label>
            <input
              id="song-name"
              type="text"
              className="cirklon-export-dialog__input terminal-input"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              maxLength={50}
              placeholder="Enter song name..."
              data-testid="export-song-name"
            />
          </div>

          <div className="cirklon-export-dialog__field">
            <label className="cirklon-export-dialog__label" htmlFor="scene-length">
              SCENE LENGTH (BARS):
            </label>
            <select
              id="scene-length"
              className="cirklon-export-dialog__select terminal-input"
              value={sceneLengthBars}
              onChange={(e) => setSceneLengthBars(Number(e.target.value))}
              data-testid="export-scene-length"
            >
              <option value={4}>4 bars</option>
              <option value={8}>8 bars</option>
              <option value={16}>16 bars</option>
              <option value={32}>32 bars</option>
              <option value={64}>64 bars</option>
            </select>
          </div>

          <div className="cirklon-export-dialog__field">
            <label className="cirklon-export-dialog__label" htmlFor="beats-per-bar">
              BEATS PER BAR:
            </label>
            <input
              id="beats-per-bar"
              type="number"
              min="1"
              max="16"
              className="cirklon-export-dialog__input terminal-input"
              value={beatsPerBar}
              onChange={(e) => setBeatsPerBar(Number(e.target.value))}
              data-testid="export-beats-per-bar"
            />
          </div>

          <div className="cirklon-export-dialog__actions">
            <button
              className="cirklon-export-dialog__button cirklon-export-dialog__button--primary"
              onClick={handleExportClick}
              disabled={!songName.trim() || beatsPerBar <= 0}
              data-testid="export-button"
            >
              [ENTER] EXPORT
            </button>
            <button
              className="cirklon-export-dialog__button cirklon-export-dialog__button--secondary"
              onClick={handleCancelClick}
              data-testid="export-cancel-button"
            >
              [ESC] CANCEL
            </button>
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
};

export default CirklonExportDialog;
