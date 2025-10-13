/**
 * DialogFooter Molecule
 * Consistent footer for dialog components with action buttons
 */

import { TerminalButton } from '../../atoms/TerminalButton';
import './DialogFooter.css';

export interface DialogAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  testId?: string;
}

export interface DialogFooterProps {
  actions: DialogAction[];
  helpText?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({
  actions,
  helpText,
}) => {
  return (
    <div className="dialog-footer">
      {helpText && (
        <div className="dialog-footer__help-text">{helpText}</div>
      )}
      <div className="dialog-footer__actions">
        {actions.map((action, index) => (
          <TerminalButton
            key={action.testId || `action-${index}`}
            onClick={action.onClick}
            variant={action.variant || 'secondary'}
            disabled={action.disabled}
            data-testid={action.testId}
          >
            {action.label}
          </TerminalButton>
        ))}
      </div>
    </div>
  );
};
