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
  snapValue: number;
  selectedClipIds: ID[];
  isEditing: boolean;
  onNameChange: (laneId: ID, newName: string) => void;
  onStartEditing: (laneId: ID) => void;
  onStopEditing: () => void;
  onClipSelect: (clipId: ID, isMultiSelect: boolean) => void;
  onClipMove: (clipId: ID, newPosition: Position) => void;
  onClipResize: (clipId: ID, newDuration: Duration, edge: 'left' | 'right') => void;
  onClipLabelChange?: (clipId: ID, label: string) => void;
  onClipCopy?: (clipId: ID) => void;
  onClipVerticalDrag?: (clipId: ID, deltaY: number) => void;
  onDoubleClick: (laneId: ID, position: Position) => void;
}

const Lane = ({
  id,
  name,
  clips,
  zoom,
  snapValue,
  selectedClipIds,
  isEditing,
  onNameChange,
  onStartEditing,
  onStopEditing,
  onClipSelect,
  onClipMove,
  onClipResize,
  onClipLabelChange,
  onClipCopy,
  onClipVerticalDrag,
  onDoubleClick,
}: LaneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);

  // Filter clips to only show those in this lane
  const laneClips = clips.filter((clip) => clip.laneId === id);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Draw grid lines on canvas
  useEffect(() => {
    const canvas = gridCanvasRef.current;
    const container = contentRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    const barWidth = 4 * zoom; // 4 beats = 1 bar
    const snapWidth = snapValue * zoom;

    // Calculate how many bars to show (with some extra)
    const numBars = Math.ceil(canvas.width / barWidth) + 1;

    // Draw bar lines (every 4 beats) - brighter and thicker
    ctx.strokeStyle = '#00ff00';
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;
    for (let i = 0; i <= numBars; i++) {
      const x = i * barWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw snap lines (based on snap value) - dimmer and thinner
    if (snapValue > 0 && snapValue < 4) {
      ctx.strokeStyle = '#003300';
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;

      const numSnaps = Math.ceil(canvas.width / snapWidth) + 1;
      for (let i = 0; i <= numSnaps; i++) {
        const x = i * snapWidth;
        // Skip if this is a bar line (already drawn)
        if (Math.abs((x % barWidth)) < 0.1) continue;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    }
  }, [zoom, snapValue]);

  // Re-draw grid when window resizes
  useEffect(() => {
    const handleResize = () => {
      const canvas = gridCanvasRef.current;
      const container = contentRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
        <canvas
          ref={gridCanvasRef}
          className="lane__grid"
          data-testid={`lane-${id}-grid`}
        />
        {laneClips.map((clip) => (
          <Clip
            key={clip.id}
            id={clip.id}
            position={clip.position}
            duration={clip.duration}
            zoom={zoom}
            snapValue={snapValue}
            isSelected={selectedClipIds.includes(clip.id)}
            label={clip.label}
            laneName={name}
            onSelect={onClipSelect}
            onMove={onClipMove}
            onResize={onClipResize}
            onLabelChange={onClipLabelChange}
            onCopy={onClipCopy}
            onVerticalDrag={onClipVerticalDrag}
          />
        ))}
      </div>
    </div>
  );
};

export default Lane;
