/**
 * Cyclone - Timeline Component
 * Main timeline container with lanes and clips
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useViewport } from '@/hooks/useViewport';
import { usePatternOperations } from '@/hooks/usePatternOperations';
import { useTrackOperations } from '@/hooks/useTrackOperations';
import { useRectangleSelection } from '@/hooks/useRectangleSelection';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
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
import { openPattern } from '@/store/slices/patternEditorSlice';
import { reorderTrack, setMovingTrack, clearMovingTrack } from '@/store/slices/tracksSlice';
import { snapToGrid } from '@/utils/snap';
import { LANE_HEIGHT } from '@/constants';
import { logger } from '@/utils/debug';
import type { ID, Position } from '@/types';
import styles from './Timeline.module.css';

interface TimelineProps {
  onOpenTrackSettings: (trackId: ID) => void;
}

const Timeline = ({ onOpenTrackSettings }: TimelineProps) => {
  const dispatch = useAppDispatch();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [verticalDragState, setVerticalDragState] = useState<{
    deltaY: number;
    draggedPatternId: ID;
  } | null>(null);
  const [draggedTrackId, setDraggedTrackId] = useState<ID | null>(null);
  const [dropTargetTrackId, setDropTargetTrackId] = useState<ID | null>(null);
  const [trackHeaderWidth, setTrackHeaderWidth] = useState(200); // Global track header width

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

  // Debug: log timeline container dimensions
  useEffect(() => {
    if (timelineRef.current) {
      // Defer layout reads to avoid forced reflow
      requestAnimationFrame(() => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(timelineRef.current);
        logger.debug('[Timeline] Container dimensions:', {
          rect: {
            top: rect.top,
            bottom: rect.bottom,
            height: rect.height,
            width: rect.width
          },
          position: computedStyle.position,
          bottom: computedStyle.bottom,
          windowHeight: window.innerHeight,
          overflow: computedStyle.overflow
        });
      });
    }
  }, [lanes.length, viewport.heightPx]);

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

  // Handle opening pattern editor
  const handleOpenPatternEditor = useCallback(
    (patternId: ID) => {
      dispatch(openPattern(patternId));
    },
    [dispatch]
  );

  // Handle vertical clip drag updates (called during drag for visual feedback)
  const handleClipVerticalDragUpdate = useCallback(
    (clipId: ID, deltaY: number) => {
      setVerticalDragState({ deltaY, draggedPatternId: clipId });
    },
    []
  );

  // Wrapper for vertical drag that delegates to hook, then clears visual state
  const handleClipVerticalDrag = useCallback(
    (clipId: ID, startingLaneId: ID, deltaY: number) => {
      // Delegate to hook first
      clipOperations.handleClipVerticalDrag(clipId, startingLaneId, deltaY);
      // Clear visual drag state after a short delay to allow Redux to update
      setTimeout(() => setVerticalDragState(null), 100);
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

  // Track height and collapse handlers now come from laneOperations hook
  const handleTrackHeightChange = laneOperations.handleTrackHeightChange;
  const handleTrackCollapseToggle = laneOperations.handleTrackCollapseToggle;

  // Handle track drag start
  const handleTrackDragStart = useCallback(
    (trackId: ID) => {
      logger.debug('[Timeline] handleTrackDragStart called', { trackId });
      setDraggedTrackId(trackId);
      dispatch(setMovingTrack(trackId));
    },
    [dispatch]
  );

  // Handle track drag end
  const handleTrackDragEnd = useCallback(() => {
    // Perform reorder if we have both dragged track and drop target
    if (draggedTrackId && dropTargetTrackId && draggedTrackId !== dropTargetTrackId) {
      const targetIndex = lanes.findIndex(l => l.id === dropTargetTrackId);
      if (targetIndex !== -1) {
        dispatch(reorderTrack({ trackId: draggedTrackId, newIndex: targetIndex }));
      }
    }

    // Clear drag state
    setDraggedTrackId(null);
    setDropTargetTrackId(null);
    setTimeout(() => dispatch(clearMovingTrack()), 300); // Delay to allow animation
  }, [draggedTrackId, dropTargetTrackId, lanes, dispatch]);

  // Handle track drag over
  const handleTrackDragOver = useCallback(
    (trackId: ID) => {
      if (draggedTrackId && trackId !== draggedTrackId) {
        setDropTargetTrackId(trackId);
      }
    },
    [draggedTrackId]
  );

  // Handle opening track settings - delegate to parent
  const handleOpenTrackSettings = useCallback(
    (trackId: ID) => {
      logger.debug('[Timeline] handleOpenTrackSettings called, delegating to parent', { trackId });
      onOpenTrackSettings(trackId);
    },
    [onOpenTrackSettings]
  );

  // Handle track header width change (applies to all tracks)
  const handleTrackHeaderWidthChange = useCallback((width: number) => {
    setTrackHeaderWidth(width);
  }, []);

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
      className={styles.timeline}
      data-testid="timeline"
      ref={timelineRef}
      onMouseDown={handleRectangleSelectionMouseDown}
    >
      {lanes.length === 0 ? (
        <div className={styles.empty}>
          <p>No lanes yet. Click &quot;Add Lane&quot; to get started.</p>
        </div>
      ) : (
        <>
          <Ruler
            viewport={viewport}
            snapValue={effectiveSnapValue}
            onPositionClick={handleRulerClick}
          />
          <div className={styles.lanes}>
            {lanes.map((lane) => (
              <Track
                key={lane.id}
                id={lane.id}
                name={lane.name}
                color={lane.color}
                height={lane.height}
                collapsed={lane.collapsed}
                patterns={clips}
                viewport={viewport}
                snapValue={effectiveSnapValue}
                selectedPatternIds={selectedClipIds}
                verticalDragState={verticalDragState}
                verticalZoom={verticalZoom}
                isCurrent={lane.id === currentLaneId}
                isEditing={editingLaneId === lane.id}
                isMoving={movingLaneId === lane.id}
                headerWidth={trackHeaderWidth}
                onTrackSelect={laneOperations.handleLaneSelect}
                onNameChange={laneOperations.handleNameChange}
                onColorChange={laneOperations.handleColorChange}
                onTrackHeightChange={handleTrackHeightChange}
                onToggleCollapse={handleTrackCollapseToggle}
                onOpenSettings={handleOpenTrackSettings}
                onHeaderWidthChange={handleTrackHeaderWidthChange}
                onTrackDragStart={handleTrackDragStart}
                onTrackDragEnd={handleTrackDragEnd}
                onTrackDragOver={handleTrackDragOver}
                onStartEditing={laneOperations.handleStartEditing}
                onStopEditing={laneOperations.handleStopEditing}
                onRemove={laneOperations.handleRemoveLane}
                onPatternSelect={handleClipSelect}
                onPatternMove={clipOperations.handleClipMove}
                onPatternResize={clipOperations.handleClipResize}
                onPatternOpenEditor={handleOpenPatternEditor}
                onPatternLabelChange={clipOperations.handleClipLabelChange}
                onPatternCopy={clipOperations.handleClipCopy}
                onPatternDelete={clipOperations.handleClipDelete}
                onPatternVerticalDrag={handleClipVerticalDrag}
                onPatternVerticalDragUpdate={handleClipVerticalDragUpdate}
                onDoubleClick={laneOperations.handleLaneDoubleClick}
              />
            ))}
          </div>
        </>
      )}
      {selectionRect && (
        <div
          className={styles.selectionRect}
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
