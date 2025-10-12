/**
 * Song Arranger - Lane Component
 * Horizontal lane that contains clips
 */

import { useRef, useEffect, useMemo, useState, KeyboardEvent, MouseEvent } from 'react';
import Clip from '../Clip';
import ContextMenu, { type MenuItem } from '../ContextMenu';
import type { ID, Clip as ClipType, Position, Duration, ViewportState } from '@/types';
import { beatsToViewportPx, isRangeVisible } from '@/utils/viewport';
import './Lane.css';

interface LaneProps {
  id: ID;
  name: string;
  clips: ClipType[];
  viewport: ViewportState;
  snapValue: number;
  selectedClipIds: ID[];
  isEditing: boolean;
  onNameChange: (laneId: ID, newName: string) => void;
  onStartEditing: (laneId: ID) => void;
  onStopEditing: () => void;
  onRemove: (laneId: ID) => void;
  onClipSelect: (clipId: ID, isMultiSelect: boolean) => void;
  onClipMove: (clipId: ID, newPosition: Position) => void;
  onClipResize: (clipId: ID, newDuration: Duration, edge: 'left' | 'right') => void;
  onClipLabelChange?: (clipId: ID, label: string) => void;
  onClipCopy?: (clipId: ID) => void;
  onClipDelete?: (clipId: ID) => void;
  onClipVerticalDrag?: (clipId: ID, startingLaneId: ID, deltaY: number) => void;
  onDoubleClick: (laneId: ID, position: Position) => void;
}

const Lane = ({
  id,
  name,
  clips,
  viewport,
  snapValue,
  selectedClipIds,
  isEditing,
  onNameChange,
  onStartEditing,
  onStopEditing,
  onRemove,
  onClipSelect,
  onClipMove,
  onClipResize,
  onClipLabelChange,
  onClipCopy,
  onClipDelete,
  onClipVerticalDrag,
  onDoubleClick,
}: LaneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; position: number } | null>(null);

  // Filter clips to only show those in this lane
  const laneClips = clips.filter((clip) => clip.laneId === id);

  // Virtual rendering: only render clips visible in the viewport
  // Use a margin of 200px to render clips slightly off-screen for smooth scrolling
  const visibleClips = useMemo(() => {
    return laneClips.filter((clip) => {
      const clipStart = clip.position;
      const clipEnd = clip.position + clip.duration;
      return isRangeVisible(clipStart, clipEnd, viewport, 200);
    });
  }, [laneClips, viewport]);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Draw adaptive grid lines on canvas - matches ruler's 4-division grid system
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

    const BEATS_PER_BAR = 4;

    // Calculate visible range in beats using viewport
    const startBeat = viewport.offsetBeats;
    const beatsVisible = viewport.widthPx / viewport.zoom;
    const endBeat = startBeat + beatsVisible;

    // Calculate visible bars
    const startBar = Math.floor(startBeat / BEATS_PER_BAR);
    const endBar = Math.ceil(endBeat / BEATS_PER_BAR);
    const barsVisible = endBar - startBar;

    // Determine bar line interval (same logic as ruler)
    let barInterval = 1;
    if (barsVisible > 128) {
      barInterval = 16; // Very zoomed out: every 16 bars
    } else if (barsVisible > 64) {
      barInterval = 8; // Every 8 bars
    } else if (barsVisible > 32) {
      barInterval = 4; // Every 4 bars
    } else if (barsVisible > 16) {
      barInterval = 2; // Every 2 bars
    }

    // Calculate grid interval: always 4 divisions between consecutive bar numbers
    const gridIntervalBeats = (barInterval * BEATS_PER_BAR) / 4;

    // Draw bar lines and grid lines (same logic as Ruler)
    for (let bar = startBar; bar <= endBar + barInterval; bar++) {
      const barBeat = bar * BEATS_PER_BAR;

      // Add bar line if it matches the interval
      if ((bar % barInterval) === 0) {
        const x = beatsToViewportPx(barBeat, viewport); // Position relative to viewport

        // Draw bar line (numbered bars in ruler) - brighter and thicker
        if (x >= 0 && x <= canvas.width) {
          ctx.strokeStyle = '#00ff00';
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Generate 3 grid lines between this bar and the next numbered bar
        ctx.strokeStyle = '#003300';
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
          const gridBeat = barBeat + (i * gridIntervalBeats);
          const gridX = beatsToViewportPx(gridBeat, viewport);

          // Only draw if within visible range
          if (gridBeat >= startBeat && gridBeat <= endBeat && gridX >= 0 && gridX <= canvas.width) {
            ctx.beginPath();
            ctx.moveTo(gridX, 0);
            ctx.lineTo(gridX, canvas.height);
            ctx.stroke();
          }
        }
      }
    }
  }, [viewport, snapValue]);

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
      const positionInBeats = viewport.offsetBeats + clickX / viewport.zoom;
      onDoubleClick(id, positionInBeats);
    }
  };

  const handleRemove = () => {
    onRemove(id);
  };

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    // Don't show menu if clicking on a clip
    if ((e.target as HTMLElement).closest('.clip')) {
      return;
    }

    e.preventDefault();

    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const positionInBeats = viewport.offsetBeats + clickX / viewport.zoom;

      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        position: positionInBeats,
      });
    }
  };

  const handleInsertClip = () => {
    if (contextMenu) {
      onDoubleClick(id, contextMenu.position);
    }
  };

  const contextMenuItems: MenuItem[] = [
    {
      label: 'Insert Clip',
      action: handleInsertClip,
    },
  ];

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
        <button
          className="lane__remove-button"
          onClick={handleRemove}
          title="Remove lane"
          data-testid={`lane-${id}-remove-button`}
        >
          ×
        </button>
      </div>
      <div
        ref={contentRef}
        className="lane__content"
        data-testid={`lane-${id}-content`}
        onDoubleClick={handleContentDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <canvas
          ref={gridCanvasRef}
          className="lane__grid"
          data-testid={`lane-${id}-grid`}
        />
        {visibleClips.map((clip) => (
          <Clip
            key={clip.id}
            id={clip.id}
            laneId={clip.laneId}
            position={clip.position}
            duration={clip.duration}
            viewport={viewport}
            snapValue={snapValue}
            isSelected={selectedClipIds.includes(clip.id)}
            label={clip.label}
            laneName={name}
            onSelect={onClipSelect}
            onMove={onClipMove}
            onResize={onClipResize}
            onLabelChange={onClipLabelChange}
            onCopy={onClipCopy}
            onDelete={onClipDelete}
            onVerticalDrag={onClipVerticalDrag}
          />
        ))}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Lane;
