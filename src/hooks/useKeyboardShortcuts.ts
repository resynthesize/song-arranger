/**
 * Song Arranger - Keyboard Shortcuts Hook
 * React hook for handling global keyboard shortcuts
 */

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { findMatchingShortcut, type KeyboardContext } from '@/utils/keyboard';
import {
  removeClips,
  duplicateClips,
  duplicateClipsWithOffset,
  splitClip,
  setClipsDuration,
  trimClipStart,
  trimClipEnd,
  addClip,
} from '@/store/slices/clipsSlice';
import {
  zoomIn,
  zoomOut,
  zoomInFocused,
  zoomOutFocused,
  verticalZoomIn,
  verticalZoomOut,
  togglePlayPause,
  toggleMinimap,
  stop,
  movePlayheadByBars,
  movePlayheadToPosition,
  adjustTempo,
  frameViewport,
} from '@/store/slices/timelineSlice';
import {
  clearSelection,
  selectAllClips,
  cycleSelection,
  selectClip,
  navigateUp as navigateUpAction,
  navigateDown as navigateDownAction,
} from '@/store/slices/selectionSlice';
import { addLane, removeLane, moveLaneUp, moveLaneDown, setMovingLane, clearMovingLane } from '@/store/slices/lanesSlice';
import { selectEffectiveSnapValue } from '@/store/slices/timelineSlice';
import {
  findNearestClipEast,
  findNearestClipWest,
  findNearestClipNorth,
  findNearestClipSouth,
  findNearestNeighbor,
} from '@/utils/navigation';

/**
 * Hook to handle global keyboard shortcuts
 */
export const useKeyboardShortcuts = () => {
  const dispatch = useAppDispatch();
  const selectedClipIds = useAppSelector((state) => state.selection.selectedClipIds);
  const isEditingLane = useAppSelector((state) => state.lanes.editingLaneId !== null);
  const clips = useAppSelector((state) => state.clips.clips);
  const lanes = useAppSelector((state) => state.lanes.lanes);
  const playheadPosition = useAppSelector((state) => state.timeline.playheadPosition);
  const effectiveSnapValue = useAppSelector(selectEffectiveSnapValue);
  const currentLaneId = useAppSelector((state) => state.selection.currentLaneId);

  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [quickInputCommand, setQuickInputCommand] = useState<'tempo' | 'zoom' | 'snap' | 'length' | 'position' | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Build current context
      const context: KeyboardContext = {
        hasSelection: selectedClipIds.length > 0,
        selectionCount: selectedClipIds.length,
        isEditing: isEditingLane,
      };

      // Find matching shortcut
      const shortcut = findMatchingShortcut(event, context);

      if (!shortcut) {
        return;
      }

      // Prevent default browser behavior
      event.preventDefault();

      // Handle the shortcut action
      switch (shortcut.action) {
        // Clip operations
        case 'delete':
          if (selectedClipIds.length > 0) {
            console.log('[useKeyboardShortcuts] Delete key pressed', {
              selectedClipIds,
              totalClips: clips.length
            });

            // Find nearest neighbor to the first deleted clip
            const firstDeletedClip = clips.find((c) => c.id === selectedClipIds[0]);
            const remainingClips = clips.filter((c) => !selectedClipIds.includes(c.id));

            console.log('[useKeyboardShortcuts] Delete data:', {
              firstDeletedClip,
              remainingCount: remainingClips.length
            });

            dispatch(removeClips(selectedClipIds));

            // Try to select nearest neighbor if one exists
            if (firstDeletedClip) {
              const nearestClip = findNearestNeighbor(firstDeletedClip, remainingClips);
              console.log('[useKeyboardShortcuts] Nearest neighbor found:', nearestClip);
              if (nearestClip) {
                console.log('[useKeyboardShortcuts] Selecting nearest clip:', nearestClip.id);
                dispatch(selectClip(nearestClip.id));
              } else {
                console.log('[useKeyboardShortcuts] No nearest clip, clearing selection');
                dispatch(clearSelection());
              }
            } else {
              console.log('[useKeyboardShortcuts] First deleted clip not found, clearing selection');
              dispatch(clearSelection());
            }
          }
          break;

        case 'duplicate':
          if (selectedClipIds.length > 0) {
            dispatch(duplicateClips(selectedClipIds));
          }
          break;

        case 'duplicateOffset':
          if (selectedClipIds.length > 0) {
            dispatch(duplicateClipsWithOffset(selectedClipIds));
          }
          break;

        case 'split':
          if (selectedClipIds.length > 0) {
            // Split the first selected clip at playhead position
            const clipId = selectedClipIds[0];
            if (clipId) {
              dispatch(splitClip({ clipId, position: playheadPosition }));
            }
          }
          break;

        case 'join':
          // TODO: Implement join adjacent clips
          console.log('Join clips (not yet implemented)');
          break;

        // Selection
        case 'selectAll':
          dispatch(selectAllClips(clips.map(c => c.id)));
          break;

        case 'deselectAll':
          dispatch(clearSelection());
          break;

        case 'cycleForward':
        case 'cycleBackward': {
          // Get clips in current lane (if selection exists)
          let laneClips = clips;
          if (selectedClipIds.length > 0) {
            const selectedClip = clips.find(c => c.id === selectedClipIds[0]);
            if (selectedClip) {
              laneClips = clips.filter(c => c.laneId === selectedClip.laneId);
              // Sort by position
              laneClips.sort((a, b) => a.position - b.position);
            }
          }

          dispatch(cycleSelection({
            clipIds: laneClips.map(c => c.id),
            direction: shortcut.action === 'cycleForward' ? 'forward' : 'backward'
          }));
          break;
        }

        // Playhead navigation
        case 'stop':
          dispatch(stop());
          break;

        case 'jumpToStart':
          dispatch(movePlayheadToPosition(0));
          break;

        case 'jumpToEnd': {
          // Find the end position (furthest clip end)
          const endPosition = clips.reduce((max, clip) => {
            const clipEnd = clip.position + clip.duration;
            return Math.max(max, clipEnd);
          }, 0);
          dispatch(movePlayheadToPosition(endPosition));
          break;
        }

        case 'movePlayheadLeft':
          dispatch(movePlayheadByBars(-1));
          break;

        case 'movePlayheadRight':
          dispatch(movePlayheadByBars(1));
          break;

        case 'movePlayheadPrevClip':
        case 'movePlayheadNextClip': {
          // Get all clip boundaries
          const boundaries = new Set<number>();
          boundaries.add(0);
          clips.forEach(clip => {
            boundaries.add(clip.position);
            boundaries.add(clip.position + clip.duration);
          });

          const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

          if (shortcut.action === 'movePlayheadPrevClip') {
            // Find previous boundary
            const prev = sortedBoundaries.reverse().find(pos => pos < playheadPosition);
            if (prev !== undefined) {
              dispatch(movePlayheadToPosition(prev));
            }
          } else {
            // Find next boundary
            const next = sortedBoundaries.find(pos => pos > playheadPosition);
            if (next !== undefined) {
              dispatch(movePlayheadToPosition(next));
            }
          }
          break;
        }

        // Clip duration
        case 'setDuration1':
        case 'setDuration2':
        case 'setDuration3':
        case 'setDuration4':
        case 'setDuration5':
        case 'setDuration6':
        case 'setDuration7':
        case 'setDuration8':
        case 'setDuration9': {
          if (selectedClipIds.length > 0) {
            const bars = parseInt(shortcut.action.replace('setDuration', ''));
            const beatsPerBar = 4;
            dispatch(setClipsDuration({ clipIds: selectedClipIds, duration: bars * beatsPerBar }));
          }
          break;
        }

        case 'trimStart':
          if (selectedClipIds.length > 0) {
            const clipId = selectedClipIds[0];
            if (clipId) {
              dispatch(trimClipStart({ clipId, amount: effectiveSnapValue }));
            }
          }
          break;

        case 'trimEnd':
          if (selectedClipIds.length > 0) {
            const clipId = selectedClipIds[0];
            if (clipId) {
              dispatch(trimClipEnd({ clipId, amount: effectiveSnapValue }));
            }
          }
          break;

        case 'adjustTempoUp':
          dispatch(adjustTempo(1));
          break;

        case 'adjustTempoDown':
          dispatch(adjustTempo(-1));
          break;

        // View
        case 'frameSelection':
          if (selectedClipIds.length > 0) {
            const selectedClips = clips.filter(c => selectedClipIds.includes(c.id));
            const startBeats = Math.min(...selectedClips.map(c => c.position));
            const endBeats = Math.max(...selectedClips.map(c => c.position + c.duration));
            dispatch(frameViewport({ startBeats, endBeats }));
          }
          break;

        case 'frameAll': {
          if (clips.length > 0) {
            const startBeats = Math.min(...clips.map(c => c.position));
            const endBeats = Math.max(...clips.map(c => c.position + c.duration));
            dispatch(frameViewport({ startBeats, endBeats }));
          }
          break;
        }

        case 'zoomIn':
          if (selectedClipIds.length > 0) {
            // Zoom focused on center of selected clips
            const selectedClips = clips.filter(c => selectedClipIds.includes(c.id));
            const minPos = Math.min(...selectedClips.map(c => c.position));
            const maxPos = Math.max(...selectedClips.map(c => c.position + c.duration));
            const centerBeats = (minPos + maxPos) / 2;
            dispatch(zoomInFocused(centerBeats));
          } else {
            dispatch(zoomIn());
          }
          break;

        case 'zoomOut':
          if (selectedClipIds.length > 0) {
            // Zoom focused on center of selected clips
            const selectedClips = clips.filter(c => selectedClipIds.includes(c.id));
            const minPos = Math.min(...selectedClips.map(c => c.position));
            const maxPos = Math.max(...selectedClips.map(c => c.position + c.duration));
            const centerBeats = (minPos + maxPos) / 2;
            dispatch(zoomOutFocused(centerBeats));
          } else {
            dispatch(zoomOut());
          }
          break;

        case 'togglePlay':
          dispatch(togglePlayPause());
          break;

        case 'toggleMinimap':
          dispatch(toggleMinimap());
          break;

        case 'verticalZoomIn':
          dispatch(verticalZoomIn());
          break;

        case 'verticalZoomOut':
          dispatch(verticalZoomOut());
          break;

        case 'undo':
          // TODO: Implement undo functionality
          console.log('Undo action (not yet implemented)');
          break;

        case 'redo':
          // TODO: Implement redo functionality
          console.log('Redo action (not yet implemented)');
          break;

        case 'navigateUp':
          if (selectedClipIds.length > 0) {
            // Navigate to clip above
            const currentClip = clips.find(c => c.id === selectedClipIds[0]);
            if (currentClip) {
              const nearestClip = findNearestClipNorth(currentClip, clips, lanes);
              if (nearestClip) {
                dispatch(selectClip(nearestClip.id));
              }
            }
          } else {
            // Navigate to previous lane
            dispatch(navigateUpAction(lanes.map(l => l.id)));
          }
          break;

        case 'navigateDown':
          if (selectedClipIds.length > 0) {
            // Navigate to clip below
            const currentClip = clips.find(c => c.id === selectedClipIds[0]);
            if (currentClip) {
              const nearestClip = findNearestClipSouth(currentClip, clips, lanes);
              if (nearestClip) {
                dispatch(selectClip(nearestClip.id));
              }
            }
          } else {
            // Navigate to next lane
            dispatch(navigateDownAction(lanes.map(l => l.id)));
          }
          break;

        case 'navigateLeft':
          if (selectedClipIds.length > 0) {
            // Navigate to clip on left (same lane)
            const currentClip = clips.find(c => c.id === selectedClipIds[0]);
            if (currentClip) {
              const nearestClip = findNearestClipWest(currentClip, clips);
              if (nearestClip) {
                dispatch(selectClip(nearestClip.id));
              }
            }
          }
          break;

        case 'navigateRight':
          if (selectedClipIds.length > 0) {
            // Navigate to clip on right (same lane)
            const currentClip = clips.find(c => c.id === selectedClipIds[0]);
            if (currentClip) {
              const nearestClip = findNearestClipEast(currentClip, clips);
              if (nearestClip) {
                dispatch(selectClip(nearestClip.id));
              }
            }
          }
          break;

        case 'edit':
          // TODO: Implement clip label editing
          console.log('Edit clip label (not yet implemented)');
          break;

        case 'changeColor':
          // TODO: Implement color picker
          console.log('Change color (not yet implemented)');
          break;

        case 'addLane':
          dispatch(addLane({}));
          break;

        case 'deleteLane':
          if (currentLaneId) {
            dispatch(removeLane(currentLaneId));
          }
          break;

        case 'moveLaneUp':
          if (currentLaneId) {
            console.log('moveLaneUp: Setting moving lane', currentLaneId);
            dispatch(setMovingLane(currentLaneId));
            dispatch(moveLaneUp(currentLaneId));
            setTimeout(() => {
              console.log('moveLaneUp: Clearing moving lane');
              dispatch(clearMovingLane());
            }, 400);
          } else {
            console.log('moveLaneUp: No current lane ID');
          }
          break;

        case 'moveLaneDown':
          if (currentLaneId) {
            console.log('moveLaneDown: Setting moving lane', currentLaneId);
            dispatch(setMovingLane(currentLaneId));
            dispatch(moveLaneDown(currentLaneId));
            setTimeout(() => {
              console.log('moveLaneDown: Clearing moving lane');
              dispatch(clearMovingLane());
            }, 400);
          } else {
            console.log('moveLaneDown: No current lane ID');
          }
          break;

        case 'addClip':
          if (currentLaneId) {
            // Add clip at playhead position on current lane
            dispatch(addClip({
              laneId: currentLaneId,
              position: playheadPosition,
              duration: 4, // Default 1 bar (4 beats)
            }));
          }
          break;

        case 'help':
          setShowHelp(true);
          break;

        case 'settings':
          setShowSettings(true);
          break;

        case 'commandPalette':
          setShowCommandPalette(true);
          break;

        default:
          console.warn(`Unhandled shortcut action: ${shortcut.action}`);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, selectedClipIds, isEditingLane, clips, lanes, playheadPosition, effectiveSnapValue, currentLaneId]);

  return {
    showHelp,
    setShowHelp,
    showSettings,
    setShowSettings,
    showCommandPalette,
    setShowCommandPalette,
    showQuickInput,
    setShowQuickInput,
    quickInputCommand,
    setQuickInputCommand,
  };
};
