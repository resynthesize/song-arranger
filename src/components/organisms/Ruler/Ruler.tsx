/**
 * Cyclone - Ruler Component
 * Bar and beat ruler positioned above the timeline
 */

import { useMemo, useState, useRef, useEffect, MouseEvent } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setZoomFocused, setViewportOffset } from '@/store/slices/timelineSlice';
import { setEditingScene, clearEditingScene } from '@/store/slices/scenesSlice';
import { openScene } from '@/store/slices/sceneEditorSlice';
import { renameScene } from '@/store/slices/songSlice/slice';
import { selectAllScenes } from '@/store/selectors';
import { RulerTick } from '../../molecules/RulerTick';
import { SceneMarker } from '../../molecules/SceneMarker';
import type { ViewportState, ID } from '@/types';
import { beatsToViewportPx, viewportPxToBeats } from '@/utils/viewport';
import { calculateGridMetrics } from '@/utils/grid';
import { BEATS_PER_BAR, MIN_ZOOM, MAX_ZOOM } from '@/constants';
import './Ruler.css';

interface RulerProps {
  viewport: ViewportState; // Viewport state for coordinate conversion
  snapValue: number; // Snap interval in beats (currently unused but kept for future features)
  onPositionClick?: (position: number) => void; // Optional click handler
}

// Convert beats to time string (M:SS format)
const beatsToTimeString = (beats: number, tempo: number): string => {
  const totalSeconds = (beats / tempo) * 60;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const Ruler = ({ viewport, snapValue: _snapValue, onPositionClick }: RulerProps) => {
  const dispatch = useAppDispatch();
  const tempo = useAppSelector((state) => state.timeline.tempo);
  const scenes = useAppSelector(selectAllScenes); // Get scenes from CKS data
  const editingSceneId = useAppSelector((state) => state.scenes.editingSceneId);

  // Drag state for zoom and scroll
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartZoom = useRef(0);
  const dragStartOffset = useRef(0);
  const dragFocusBeats = useRef(0);
  const rafId = useRef<number | null>(null);
  const currentDeltaX = useRef(0);
  const currentDeltaY = useRef(0);

  // Calculate visible bars and adaptive grid lines
  const { bars, gridLines } = useMemo(() => {
    // Handle zero width gracefully
    if (viewport.widthPx === 0) {
      return { bars: [], gridLines: [] };
    }

    // Calculate visible range in beats using viewport
    const startBeat = viewport.offsetBeats;
    const beatsVisible = viewport.widthPx / viewport.zoom;
    const endBeat = startBeat + beatsVisible;

    // Calculate visible bars
    const startBar = Math.floor(startBeat / BEATS_PER_BAR);
    const endBar = Math.ceil(endBeat / BEATS_PER_BAR);

    // Calculate adaptive grid metrics using shared utility
    const { barInterval, gridIntervalBeats } = calculateGridMetrics(viewport, BEATS_PER_BAR);

    const barsArray: Array<{ barNumber: number; position: number; beats: number }> = [];
    const gridLinesArray: Array<{ position: number }> = [];

    // Generate bar numbers and their associated grid lines
    // Start from the first bar that matches the interval and increment by barInterval
    const firstIntervalBar = Math.floor(startBar / barInterval) * barInterval;
    for (let bar = firstIntervalBar; bar <= endBar + barInterval; bar += barInterval) {
      const barNumber = bar + 1; // Bars start at 1
      const barBeat = bar * BEATS_PER_BAR;

      const x = beatsToViewportPx(barBeat, viewport); // Position relative to viewport
      barsArray.push({ barNumber, position: x, beats: barBeat });

      // Generate 3 grid lines between this bar and the next numbered bar
      // (the 4th division is the next bar number itself)
      for (let i = 1; i < 4; i++) {
        const gridBeat = barBeat + (i * gridIntervalBeats);
        const gridX = beatsToViewportPx(gridBeat, viewport);

        // Only add if within visible range
        if (gridBeat >= startBeat && gridBeat <= endBeat) {
          gridLinesArray.push({ position: gridX });
        }
      }
    }

    return { bars: barsArray, gridLines: gridLinesArray };
  }, [viewport]);

  const handleClick = (pixelX: number) => {
    if (onPositionClick) {
      // Convert viewport pixel position to beat position
      const beatPosition = viewportPxToBeats(pixelX, viewport);
      onPositionClick(beatPosition);
    }
  };

  // Handle scene marker editing
  const handleSceneDoubleClick = (sceneId: ID) => {
    // Open scene editor in bottom pane instead of inline name editing
    dispatch(openScene(sceneId));
  };

  const handleSceneNameChange = (sceneId: ID, newName: string) => {
    if (newName.trim()) {
      dispatch(renameScene({ sceneId, newName: newName.trim() }));
    }
  };

  const handleSceneStopEditing = () => {
    dispatch(clearEditingScene());
  };

  // Handle mouse down to start drag for zoom and scroll
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Only on left click, and not if clicking on a ruler tick
    if (e.button !== 0 || (e.target as HTMLElement).closest('.ruler-tick')) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    dragStartZoom.current = viewport.zoom;
    dragStartOffset.current = viewport.offsetBeats;

    // Calculate the beat position at the mouse cursor (this is our focus point for zooming)
    const rect = e.currentTarget.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    dragFocusBeats.current = viewportPxToBeats(pixelX, viewport);
  };

  // Handle drag for both zoom (vertical) and scroll (horizontal) with requestAnimationFrame for smoothness
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      currentDeltaX.current = dragStartX.current - e.clientX;
      currentDeltaY.current = dragStartY.current - e.clientY;

      // Only schedule a new frame if one isn't already scheduled
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          const deltaX = currentDeltaX.current;
          const deltaY = currentDeltaY.current;

          // Determine primary drag direction based on magnitude
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          // If vertical movement is dominant, zoom
          if (absY > absX && absY > 5) {
            // Calculate zoom using exponential scaling for smooth feel
            // Sensitivity: 100px vertical drag = ~2x zoom change
            // Negative deltaY (drag down) = zoom in, positive deltaY (drag up) = zoom out (Ableton-style)
            const sensitivity = 0.007; // Adjust this for faster/slower zoom
            const zoomFactor = Math.exp(-deltaY * sensitivity);
            const newZoom = dragStartZoom.current * zoomFactor;

            // Clamp to valid range
            const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

            // Update zoom with focus point maintained
            dispatch(setZoomFocused({
              zoom: clampedZoom,
              focusBeats: dragFocusBeats.current,
            }));
          }
          // If horizontal movement is dominant, scroll
          else if (absX > absY && absX > 5) {
            // Convert horizontal pixel movement to beat movement (from original drag start)
            const deltaBeats = deltaX / dragStartZoom.current;

            // Calculate new offset from the original starting position
            const newOffset = Math.max(0, dragStartOffset.current + deltaBeats);

            // Set viewport offset directly (absolute position from drag start)
            dispatch(setViewportOffset(newOffset));
          }

          rafId.current = null;
        });
      }
    };

    const handleMouseUp = () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dispatch, viewport]);

  return (
    <div className="ruler" data-testid="ruler" role="none">
      {/* Header space to align with lane headers */}
      <div className="ruler__header" />

      {/* Content area split into two rows */}
      <div className="ruler__content">
        {/* Bar row - contains bar numbers, time markers, and grid */}
        <div
          className={`ruler__bar-row ${isDragging ? 'ruler__bar-row--dragging' : ''}`}
          onMouseDown={handleMouseDown}
        >
          {/* Bar numbers and time markers */}
          {bars.map(({ barNumber, position, beats }) => (
            <RulerTick
              key={`bar-${barNumber.toString()}`}
              barNumber={barNumber}
              position={position}
              timeString={beatsToTimeString(beats, tempo)}
              onClick={handleClick}
            />
          ))}

          {/* Grid markers - always 4 divisions between bar numbers */}
          {gridLines.map(({ position }, index) => (
            <div
              key={`grid-${index.toString()}`}
              className="ruler__grid-tick"
              style={{ left: `${position.toString()}px` }}
              onClick={() => { handleClick(position); }}
            >
              │
            </div>
          ))}
        </div>

        {/* Scene row - contains scene markers as blocks */}
        <div className="ruler__scene-row">
          {scenes.map((scene) => {
            const scenePosition = beatsToViewportPx(scene.position, viewport);
            return (
              <SceneMarker
                key={scene.id}
                id={scene.id}
                name={scene.name}
                position={scenePosition}
                duration={scene.duration}
                viewport={viewport}
                isEditing={editingSceneId === scene.id}
                onDoubleClick={() => { handleSceneDoubleClick(scene.id); }}
                onNameChange={(newName) => { handleSceneNameChange(scene.id, newName); }}
                onStopEditing={handleSceneStopEditing}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Ruler;
