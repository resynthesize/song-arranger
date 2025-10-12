/**
 * Song Arranger - Lane Component
 * Horizontal lane that contains clips
 */

import { useRef, useEffect, KeyboardEvent, MouseEvent } from 'react';
import Clip from '../Clip';
import type { ID, Clip as ClipType, Position, Duration } from '@/types';
import './Lane.css';

interface LaneProps {
  id: ID;
  name: string;
  clips: ClipType[];
  zoom: number;
  selectedClipIds: ID[];
  isEditing: boolean;
  onNameChange: (laneId: ID, newName: string) => void;
  onStartEditing: (laneId: ID) => void;
  onStopEditing: () => void;
  onClipSelect: (clipId: ID, isMultiSelect: boolean) => void;
  onClipMove: (clipId: ID, delta: number) => void;
  onClipResize: (clipId: ID, newDuration: Duration, edge: 'left' | 'right') => void;
  onDoubleClick: (laneId: ID, position: Position) => void;
}

const Lane = ({
  id,
  name,
  clips,
  zoom,
  selectedClipIds,
  isEditing,
  onNameChange,
  onStartEditing,
  onStopEditing,
  onClipSelect,
  onClipMove,
  onClipResize,
  onDoubleClick,
}: LaneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter clips to only show those in this lane
  const laneClips = clips.filter((clip) => clip.laneId === id);

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

  const handleContentDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    // Don't trigger if clicking on a clip
    if ((e.target as HTMLElement).closest('.clip')) {
      return;
    }

    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const positionInBeats = clickX / zoom;
      onDoubleClick(id, positionInBeats);
    }
  };

  return (
    <div className="lane" data-testid={`lane-${id}`}>
      <div className="lane__header">
        {isEditing ? (
          <input
            ref={inputRef}
            className="lane__name-input terminal-input"
            defaultValue={name}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
          />
        ) : (
          <div className="lane__name" onDoubleClick={handleNameDoubleClick}>
            {name}
          </div>
        )}
      </div>
      <div
        ref={contentRef}
        className="lane__content"
        data-testid={`lane-${id}-content`}
        onDoubleClick={handleContentDoubleClick}
      >
        {laneClips.map((clip) => (
          <Clip
            key={clip.id}
            id={clip.id}
            position={clip.position}
            duration={clip.duration}
            zoom={zoom}
            isSelected={selectedClipIds.includes(clip.id)}
            label={clip.label}
            onSelect={onClipSelect}
            onMove={onClipMove}
            onResize={onClipResize}
          />
        ))}
      </div>
    </div>
  );
};

export default Lane;
