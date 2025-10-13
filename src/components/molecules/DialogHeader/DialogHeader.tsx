/**
 * DialogHeader Molecule
 * Consistent header for dialog components
 */

import './DialogHeader.css';

export interface DialogHeaderProps {
  title: string;
  onClose?: () => void;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  title,
  onClose,
}) => {
  return (
    <div className="dialog-header">
      <h2 className="dialog-header__title">{title}</h2>
      {onClose && (
        <button
          className="dialog-header__close"
          onClick={onClose}
          aria-label="Close dialog"
          data-testid="dialog-close-button"
        >
          ✕
        </button>
      )}
    </div>
  );
};
