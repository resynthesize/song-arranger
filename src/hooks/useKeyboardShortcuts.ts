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
  navigateUp as navigateUpAction,
  navigateDown as navigateDownAction,
} from '@/store/slices/selectionSlice';
import { selectEffectiveSnapValue } from '@/store/slices/timelineSlice';

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
            dispatch(removeClips(selectedClipIds));
            dispatch(clearSelection());
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
            dispatch(splitClip({ clipId, position: playheadPosition }));
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
            dispatch(trimClipStart({ clipId, amount: effectiveSnapValue }));
          }
          break;

        case 'trimEnd':
          if (selectedClipIds.length > 0) {
            const clipId = selectedClipIds[0];
            dispatch(trimClipEnd({ clipId, amount: effectiveSnapValue }));
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
          dispatch(navigateUpAction(lanes.map(l => l.id)));
          break;

        case 'navigateDown':
          dispatch(navigateDownAction(lanes.map(l => l.id)));
          break;

        case 'edit':
          // TODO: Implement clip label editing
          console.log('Edit clip label (not yet implemented)');
          break;

        case 'changeColor':
          // TODO: Implement color picker
          console.log('Change color (not yet implemented)');
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
  }, [dispatch, selectedClipIds, isEditingLane, clips, lanes, playheadPosition, effectiveSnapValue]);

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
