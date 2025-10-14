/**
 * Cyclone - SaveAsDialog Component
 * Retro terminal-styled save as dialog with text input
 */

import { useEffect, useState, useRef } from 'react';
import { TerminalPanel } from '../../molecules/TerminalPanel';
import './SaveAsDialog.css';

interface SaveAsDialogProps {
  defaultName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

const SaveAsDialog = ({ defaultName, onSave, onClose }: SaveAsDialogProps) => {
  const [projectName, setProjectName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus and select input on mount
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const trimmedName = projectName.trim();
        if (trimmedName) {
          onSave(trimmedName);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onSave, projectName]);

  const handleSaveClick = () => {
    const trimmedName = projectName.trim();
    if (trimmedName) {
      onSave(trimmedName);
    }
  };

  const handleCancelClick = () => {
    onClose();
  };

  return (
    <div className="save-as-dialog">
      <TerminalPanel title="SAVE PROJECT AS" variant="elevated" padding="md">
        <div className="save-as-dialog__content">
          <div className="save-as-dialog__field">
            <label className="save-as-dialog__label" htmlFor="project-name">
              PROJECT NAME:
            </label>
            <input
              ref={inputRef}
              id="project-name"
              type="text"
              className="save-as-dialog__input terminal-input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              maxLength={50}
              placeholder="Enter project name..."
              data-testid="save-as-input"
            />
          </div>

          <div className="save-as-dialog__actions">
            <button
              className="save-as-dialog__button save-as-dialog__button--primary"
              onClick={handleSaveClick}
              disabled={!projectName.trim()}
              data-testid="save-as-save-button"
            >
              [ENTER] SAVE
            </button>
            <button
              className="save-as-dialog__button save-as-dialog__button--secondary"
              onClick={handleCancelClick}
              data-testid="save-as-cancel-button"
            >
              [ESC] CANCEL
            </button>
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
};

export default SaveAsDialog;
