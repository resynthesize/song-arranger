/**
 * ColorSwatch Molecule
 * A color swatch button for displaying and selecting colors
 */

import './ColorSwatch.css';

export interface ColorSwatchProps {
  color: string;
  onClick: (e: React.MouseEvent) => void;
  title?: string;
  testId?: string;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  onClick,
  title = 'Change color',
  testId,
}) => {
  return (
    <button
      className="color-swatch"
      onClick={onClick}
      title={title}
      data-testid={testId}
      style={{ color }}
    >
      █
    </button>
  );
};
