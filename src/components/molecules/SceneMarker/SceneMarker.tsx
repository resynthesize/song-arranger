/**
 * SceneMarker Molecule
 * Scene marker displayed on the ruler
 */

import { KeyboardEvent, useRef, useEffect } from 'react';
import type { ID } from '@/types';
import './SceneMarker.css';

export interface SceneMarkerProps {
  id: ID;
  name: string;
  position: number;
  isEditing: boolean;
  onDoubleClick: () => void;
  onNameChange: (newName: string) => void;
  onStopEditing: () => void;
}

export const SceneMarker: React.FC<SceneMarkerProps> = ({
  id,
  name,
  position,
  isEditing,
  onDoubleClick,
  onNameChange,
  onStopEditing,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus and select text when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newName = (e.target as HTMLInputElement).value;
      onNameChange(newName);
      onStopEditing();
    } else if (e.key === 'Escape') {
      onStopEditing();
    }
  };

  const handleBlur = () => {
    if (inputRef.current) {
      const newName = inputRef.current.value;
      onNameChange(newName);
    }
    onStopEditing();
  };

  return (
    <div
      className="scene-marker"
      style={{ left: `${position.toString()}px` }}
      data-testid={`scene-marker-${id}`}
    >
      <div className="scene-marker__line" />
      {isEditing ? (
        <input
          ref={inputRef}
          className="scene-marker__input terminal-input"
          defaultValue={name}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onClick={(e) => {
            e.stopPropagation();
          }}
          data-testid={`scene-marker-${id}-input`}
        />
      ) : (
        <div
          className="scene-marker__label"
          onDoubleClick={onDoubleClick}
          data-testid={`scene-marker-${id}-label`}
        >
          {name}
        </div>
      )}
    </div>
  );
};
