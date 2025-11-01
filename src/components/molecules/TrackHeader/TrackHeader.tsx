/**
 * TrackHeader Molecule
 * Lane header component with current indicator, color swatch, and name editing
 */

import { useRef, useEffect, KeyboardEvent } from 'react';
import { TrackHeaderResizeHandle } from '../TrackHeaderResizeHandle/TrackHeaderResizeHandle';
import type { ID } from '@/types';
import { logger } from '@/utils/debug';
import './TrackHeader.css';

export interface TrackHeaderProps {
  id: ID;
  name: string;
  isCurrent: boolean;
  isEditing: boolean;
  headerPadding: number;
  headerWidth?: number;
  collapsed?: boolean;
  onTrackSelect?: (trackId: ID) => void;
  onNameChange: (trackId: ID, newName: string) => void;
  onStartEditing: (trackId: ID) => void;
  onStopEditing: () => void;
  onToggleCollapse?: (trackId: ID) => void;
  onOpenSettings?: (trackId: ID) => void;
  onHeaderWidthChange?: (width: number) => void;
  onDragStart?: (trackId: ID) => void;
  onDragEnd?: () => void;
  onDragOver?: (trackId: ID) => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  id,
  name,
  isCurrent,
  isEditing,
  headerPadding,
  headerWidth = 200,
  collapsed,
  onTrackSelect,
  onNameChange,
  onStartEditing,
  onStopEditing,
  onToggleCollapse,
  onOpenSettings,
  onHeaderWidthChange,
  onDragStart,
  onDragEnd,
  onDragOver,
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

  const handleCollapseClick = (e: React.MouseEvent) => {
    logger.debug('[TrackHeader] Collapse button clicked', { id, hasCallback: !!onToggleCollapse });
    e.stopPropagation(); // Don't trigger track selection
    onToggleCollapse?.(id);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    logger.debug('[TrackHeader] Settings button clicked', { id, hasCallback: !!onOpenSettings });
    e.stopPropagation(); // Don't trigger track selection
    if (onOpenSettings) {
      logger.debug('[TrackHeader] Calling onOpenSettings', id);
      onOpenSettings(id);
    } else {
      console.warn('[TrackHeader] onOpenSettings callback not provided!');
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    logger.debug('[TrackHeader] Drag started', { id, hasCallback: !!onDragStart });
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    onDragStart?.(id);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
    onDragOver?.(id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={`track-header ${isCurrent ? 'track-header--current' : ''} ${collapsed ? 'track-header--collapsed' : ''}`}
      style={{ padding: `${headerPadding}px`, width: `${headerWidth}px` }}
      onClick={() => onTrackSelect?.(id)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      draggable={!!onDragStart}
      onDragStart={onDragStart ? handleDragStart : undefined}
      onDragEnd={onDragStart ? handleDragEnd : undefined}
      title={onDragStart ? 'Drag to reorder track' : undefined}
      data-testid={`track-${id}-header`}
    >
      {/* Controls column */}
      <div className="track-header__controls">
        {onToggleCollapse && (
          <button
            className="track-header__collapse-button"
            onClick={handleCollapseClick}
            aria-label={collapsed ? 'Expand track' : 'Collapse track'}
            title={collapsed ? 'Expand' : 'Collapse'}
            data-testid={`track-${id}-collapse-button`}
          >
            {collapsed ? '▶' : '▼'}
          </button>
        )}
        {onOpenSettings && (
          <button
            className="track-header__settings-button"
            onClick={handleSettingsClick}
            aria-label="Track settings"
            title="Track settings (T)"
            data-testid={`track-${id}-settings-button`}
          >
            ⚙
          </button>
        )}
      </div>

      {/* Track name */}
      {isEditing ? (
        <input
          ref={inputRef}
          className="track-header__name-input terminal-input"
          defaultValue={name}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          onClick={(e) => e.stopPropagation()} // Don't trigger track selection while editing
        />
      ) : (
        <div className="track-header__name" onDoubleClick={handleNameDoubleClick}>
          {name}
        </div>
      )}

      {/* Horizontal resize handle */}
      {onHeaderWidthChange && (
        <TrackHeaderResizeHandle
          currentWidth={headerWidth}
          onWidthChange={onHeaderWidthChange}
          minWidth={100}
          maxWidth={400}
        />
      )}
    </div>
  );
};
