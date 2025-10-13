/**
 * Song Arranger - Timeline Component
 * Main timeline container with lanes and clips
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useViewport } from '@/hooks/useViewport';
import { usePatternOperations } from '@/hooks/usePatternOperations';
import { useTrackOperations } from '@/hooks/useTrackOperations';
import { useRectangleSelection } from '@/hooks/useRectangleSelection';
import Track from '../Track';
import Ruler from '../Ruler';
import {
  selectPattern,
  togglePatternSelection,
} from '@/store/slices/selectionSlice';
import {
  selectAllPatterns,
  selectAllTracks,
  selectSelectedPatternIds,
  selectCurrentTrackId,
  selectEditingTrackId,
  selectMovingTrackId,
} from '@/store/selectors';
import { setPlayheadPosition, selectEffectiveSnapValue } from '@/store/slices/timelineSlice';
import { snapToGrid } from '@/utils/snap';
import { LANE_HEIGHT } from '@/constants';
import { logger } from '@/utils/debug';
import type { ID, Position } from '@/types';
import './Timeline.css';

const Timeline = () => {
  const dispatch = useAppDispatch();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [verticalDragState, setVerticalDragState] = useState<{
    deltaY: number;
    draggedClipId: ID;
  } | null>(null);

  // Select data from Redux using centralized selectors
  const effectiveSnapValue = useAppSelector(selectEffectiveSnapValue);
  const lanes = useAppSelector(selectAllTracks);
  const clips = useAppSelector(selectAllPatterns);
  const selectedClipIds = useAppSelector(selectSelectedPatternIds);
  const currentLaneId = useAppSelector(selectCurrentTrackId);
  const editingLaneId = useAppSelector(selectEditingTrackId);
  const movingLaneId = useAppSelector(selectMovingTrackId);
  const verticalZoom = useAppSelector((state) => state.timeline.verticalZoom);

  // Use viewport hook for pan/zoom interactions
  const { viewport, handleZoomIn, handleZoomOut } = useViewport({
    containerRef: timelineRef,
    wheelZoomEnabled: true,
    panEnabled: true,
  });

  // Use custom hooks for operations
  const clipOperations = usePatternOperations(lanes);
  const laneOperations = useTrackOperations(effectiveSnapValue);
  const { selectionRect, handleMouseDown: handleRectangleSelectionMouseDown } = useRectangleSelection({
    timelineRef,
    viewport,
    clips,
    lanes,
  });

  // Debug: log vertical zoom and calculated visible lanes
  useEffect(() => {
    const laneHeight = (LANE_HEIGHT * verticalZoom) / 100;
    const maxVisibleLanes = Math.floor(viewport.heightPx / laneHeight);
    logger.log('Timeline Vertical Zoom Debug:', {
      verticalZoom: `${verticalZoom}%`,
      laneHeight: `${laneHeight}px`,
      viewportHeight: `${viewport.heightPx}px`,
      maxVisibleLanes,
      totalLanes: lanes.length
    });
  }, [verticalZoom, viewport.heightPx, lanes.length]);

  // Debug: log movingLaneId changes
  useEffect(() => {
    logger.log('Timeline: movingLaneId changed to', movingLaneId);
  }, [movingLaneId]);

  // Handle clip selection
  const handleClipSelect = useCallback(
    (clipId: ID, isMultiSelect: boolean) => {
      if (isMultiSelect) {
        dispatch(togglePatternSelection(clipId));
      } else {
        dispatch(selectPattern(clipId));
      }
    },
    [dispatch]
  );

  // Handle vertical clip drag updates (called during drag for visual feedback)
  const handleClipVerticalDragUpdate = useCallback(
    (clipId: ID, deltaY: number) => {
      setVerticalDragState({ deltaY, draggedClipId: clipId });
    },
    []
  );

  // Wrapper for vertical drag that clears visual state and delegates to hook
  const handleClipVerticalDrag = useCallback(
    (clipId: ID, startingLaneId: ID, deltaY: number) => {
      // Clear visual drag state
      setVerticalDragState(null);
      // Delegate to hook
      clipOperations.handleClipVerticalDrag(clipId, startingLaneId, deltaY);
    },
    [clipOperations]
  );

  // Handle ruler click to move playhead
  const handleRulerClick = useCallback(
    (position: Position) => {
      const snappedPosition = snapToGrid(position, effectiveSnapValue);
      dispatch(setPlayheadPosition(snappedPosition));
    },
    [dispatch, effectiveSnapValue]
  );

  // NOTE: Keyboard shortcuts are now handled by useKeyboardShortcuts hook
  // This effect only handles zoom shortcuts that use the viewport hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Zoom shortcuts - use viewport hook handlers
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleZoomOut();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleZoomIn, handleZoomOut]);

  return (
    <div
      className="timeline"
      data-testid="timeline"
      ref={timelineRef}
      onMouseDown={handleRectangleSelectionMouseDown}
    >
      {lanes.length === 0 ? (
        <div className="timeline__empty">
          <p>No lanes yet. Click &quot;Add Lane&quot; to get started.</p>
        </div>
      ) : (
        <>
          <Ruler
            viewport={viewport}
            snapValue={effectiveSnapValue}
            onPositionClick={handleRulerClick}
          />
          <div className="timeline__lanes">
            {lanes.map((lane) => (
              <Lane
                key={lane.id}
                id={lane.id}
                name={lane.name}
                color={lane.color}
                clips={clips}
                viewport={viewport}
                snapValue={effectiveSnapValue}
                selectedClipIds={selectedClipIds}
                verticalDragState={verticalDragState}
                verticalZoom={verticalZoom}
                isCurrent={lane.id === currentLaneId}
                isEditing={editingLaneId === lane.id}
                isMoving={movingLaneId === lane.id}
                onLaneSelect={laneOperations.handleLaneSelect}
                onNameChange={laneOperations.handleNameChange}
                onColorChange={laneOperations.handleColorChange}
                onStartEditing={laneOperations.handleStartEditing}
                onStopEditing={laneOperations.handleStopEditing}
                onRemove={laneOperations.handleRemoveLane}
                onClipSelect={handleClipSelect}
                onClipMove={clipOperations.handleClipMove}
                onClipResize={clipOperations.handleClipResize}
                onClipLabelChange={clipOperations.handleClipLabelChange}
                onClipCopy={clipOperations.handleClipCopy}
                onClipDelete={clipOperations.handleClipDelete}
                onClipVerticalDrag={handleClipVerticalDrag}
                onClipVerticalDragUpdate={handleClipVerticalDragUpdate}
                onDoubleClick={laneOperations.handleLaneDoubleClick}
              />
            ))}
          </div>
        </>
      )}
      {selectionRect && (
        <div
          className="timeline__selection-rect"
          style={{
            left: `${Math.min(selectionRect.startX, selectionRect.currentX)}px`,
            top: `${Math.min(selectionRect.startY, selectionRect.currentY)}px`,
            width: `${Math.abs(selectionRect.currentX - selectionRect.startX)}px`,
            height: `${Math.abs(selectionRect.currentY - selectionRect.startY)}px`,
          }}
        />
      )}
    </div>
  );
};

export default Timeline;
