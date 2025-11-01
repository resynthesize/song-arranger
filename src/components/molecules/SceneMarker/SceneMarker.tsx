/**
 * SceneMarker Molecule
 * Scene marker displayed as a block in the ruler scene row
 */

import { KeyboardEvent, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resizeSceneInTimeline } from '@/store/slices/songSlice/slice';
import { setKeyboardContext, resetKeyboardContext } from '@/store/slices/keyboardContextSlice';
import { useSceneResize } from '@/hooks/useSceneResize';
import type { ID, Duration, ViewportState } from '@/types';
import './SceneMarker.css';

export interface SceneMarkerProps {
  id: ID;
  name: string;
  position: number;      // Viewport pixel X position
  duration: Duration;    // Scene duration in beats
  viewport: ViewportState;
  isEditing: boolean;
  onDoubleClick: () => void;
  onNameChange: (newName: string) => void;
  onStopEditing: () => void;
}

export const SceneMarker: React.FC<SceneMarkerProps> = ({
  id,
  name,
  position,
  duration,
  viewport,
  isEditing,
  onDoubleClick,
  onNameChange,
  onStopEditing,
}) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const snapValue = useAppSelector((state) => state.timeline.snapValue);

  // Calculate width from duration and zoom
  const widthPx = duration * viewport.zoom;

  // Scene resizing hook
  const { isResizing, handleResizeStart } = useSceneResize({
    sceneId: id,
    duration,
    viewport,
    snapValue,
    onResize: (sceneId, newDuration) => {
      dispatch(resizeSceneInTimeline({ sceneId, newDuration }));
    },
  });

  // Auto-focus and select text when editing starts
  // Set keyboard context to prevent shortcuts from interfering
  useEffect(() => {
    if (isEditing) {
      dispatch(setKeyboardContext({ context: 'editing', editor: `scene-${id}` }));
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    } else {
      dispatch(resetKeyboardContext());
    }
  }, [isEditing, dispatch, id]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Stop propagation to prevent global shortcuts
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission or other Enter handlers
      const newName = (e.target as HTMLInputElement).value;
      onNameChange(newName);
      onStopEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
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
      className={`scene-marker ${isResizing ? 'scene-marker--resizing' : ''}`}
      style={{
        left: `${position.toString()}px`,
        width: `${widthPx.toString()}px`,
      }}
      data-testid={`scene-marker-${id}`}
      onDoubleClick={onDoubleClick}
    >
      {/* Vertical accent line at left edge */}
      <div className="scene-marker__line" />

      {/* Scene name label */}
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
          data-testid={`scene-marker-${id}-label`}
        >
          {name}
        </div>
      )}

      {/* Resize handle at right edge */}
      <div
        className="scene-marker__resize-handle"
        onMouseDown={handleResizeStart}
        data-testid={`scene-marker-${id}-resize`}
      />
    </div>
  );
};
