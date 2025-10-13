/**
 * TrackHeader Molecule
 * Lane header component with current indicator, color swatch, and name editing
 */

import { useRef, useEffect, KeyboardEvent } from 'react';
import { ColorSwatch } from '../ColorSwatch';
import type { ID } from '@/types';
import './TrackHeader.css';

export interface TrackHeaderProps {
  id: ID;
  name: string;
  color: string;
  isCurrent: boolean;
  isEditing: boolean;
  headerPadding: number;
  onTrackSelect?: (trackId: ID) => void;
  onNameChange: (trackId: ID, newName: string) => void;
  onStartEditing: (trackId: ID) => void;
  onStopEditing: () => void;
  onColorSwatchClick: (e: React.MouseEvent) => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  id,
  name,
  color,
  isCurrent,
  isEditing,
  headerPadding,
  onTrackSelect,
  onNameChange,
  onStartEditing,
  onStopEditing,
  onColorSwatchClick,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameDoubleClick = () => {
    onStartEditing(id);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newName = (e.target as HTMLInputElement).value;
      onNameChange(id, newName);
      onStopEditing();
    } else if (e.key === 'Escape') {
      onStopEditing();
    }
  };

  const handleInputBlur = () => {
    if (inputRef.current) {
      const newName = inputRef.current.value;
      onNameChange(id, newName);
    }
    onStopEditing();
  };

  return (
    <div
      className="lane-header"
      style={{ padding: `${headerPadding}px` }}
      onClick={() => onTrackSelect?.(id)}
      data-testid={`lane-${id}-header`}
    >
      {isCurrent && <span className="lane-header__current-indicator">&gt;</span>}
      <ColorSwatch
        color={color}
        onClick={onColorSwatchClick}
        title="Change lane color"
        testId={`lane-${id}-color-swatch`}
      />
      {isEditing ? (
        <input
          ref={inputRef}
          className="lane-header__name-input terminal-input"
          defaultValue={name}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          onClick={(e) => e.stopPropagation()} // Don't trigger lane selection while editing
        />
      ) : (
        <div className="lane-header__name" onDoubleClick={handleNameDoubleClick}>
          {name}
        </div>
      )}
    </div>
  );
};
