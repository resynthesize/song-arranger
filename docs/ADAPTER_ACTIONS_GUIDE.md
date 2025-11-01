# Adapter Actions Usage Guide

## Overview

The songSlice now has **Timeline Adapter Actions** that translate free-form timeline operations into CKS scene-based storage. This allows the UI to work with a free-form timeline while maintaining perfect CKS compatibility.

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│ Components/Hooks                                             │
│ (Work with Pattern IDs, Track IDs, Positions)              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Timeline Adapter Actions (songSlice)                        │
│ - Translate React IDs → CKS identifiers                     │
│ - Manage scene creation/consolidation                       │
│ - Handle position snapping                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ CKS Storage (scenes, pattern_assignments)                   │
│ - Scene-based organization                                  │
│ - Lossless export to Cirklon                                │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/store/slices/songSlice/
├── index.ts              # Barrel export
├── slice.ts              # Main reducer with all actions
├── types.ts              # PayloadAction types
├── constants.ts          # Scene length, snap granularity
├── adapters.ts           # Pure functions (ID mapping, scene finding)
├── mutations.ts          # CKS state mutations (primitives)
└── timelineActions.ts    # Timeline adapter reducers
```

## How to Use: Migrate a Hook

### Before (Old Pattern)

```typescript
// usePatternOperations.ts (OLD)
import { movePattern } from '@/store/slices/patternsSlice';

const handleClipMove = (patternId: ID, newPosition: Position) => {
  dispatch(movePattern({ patternId, position: newPosition }));
};
```

**Problem**: This writes to `patternsSlice` which is now EMPTY! Changes don't appear.

### After (New Pattern)

```typescript
// usePatternOperations.ts (NEW)
import { movePatternInTimeline } from '@/store/slices/songSlice';

const handleClipMove = (patternId: ID, newPosition: Position) => {
  dispatch(movePatternInTimeline({
    patternReactId: patternId,
    newPosition
  }));
};
```

**How it works**:
1. Adapter finds pattern's current scene using React ID
2. Snaps `newPosition` to scene boundary (16 beats)
3. Finds or creates scene at target position
4. Removes pattern from old scene, adds to new scene
5. Updates metadata mappings

## Available Timeline Adapter Actions

### Single Pattern Operations

```typescript
// Move pattern to new position
dispatch(movePatternInTimeline({
  patternReactId: 'pattern-123',
  newPosition: 32 // beats
}));

// Create new pattern
dispatch(createPatternInTimeline({
  trackReactId: 'track-456',
  position: 16,
  duration: 4,
  label: 'Kick Pattern' // optional
}));

// Delete pattern
dispatch(deletePatternInTimeline({
  patternReactId: 'pattern-123'
}));

// Resize pattern
dispatch(resizePatternInTimeline({
  patternReactId: 'pattern-123',
  newDuration: 8 // beats
}));

// Move to different track (vertical drag)
dispatch(movePatternToTrack({
  patternReactId: 'pattern-123',
  targetTrackReactId: 'track-789'
}));

// Update pattern label
dispatch(updatePatternLabel({
  patternReactId: 'pattern-123',
  label: 'New Name'
}));

// Duplicate pattern
dispatch(duplicatePatternInTimeline({
  patternReactId: 'pattern-123'
}));
```

### Multi-Pattern Operations (Ganged)

```typescript
// Move multiple patterns by delta (preserves spacing)
dispatch(movePatternsInTimeline({
  patternReactIds: ['pattern-1', 'pattern-2', 'pattern-3'],
  deltaBeats: 16 // Move right by 16 beats
}));

// Move patterns to different tracks (vertical multi-drag)
dispatch(movePatternsToTrack({
  patternReactIds: ['pattern-1', 'pattern-2'],
  deltaTrackIndex: 1 // Move down 1 track
}));

// Resize multiple patterns by factor
dispatch(resizePatternsInTimeline({
  patternReactIds: ['pattern-1', 'pattern-2'],
  factor: 2.0 // Double duration
}));

// Delete multiple patterns
dispatch(deletePatternsInTimeline({
  patternReactIds: ['pattern-1', 'pattern-2', 'pattern-3']
}));

// Duplicate multiple patterns
dispatch(duplicatePatternsInTimeline({
  patternReactIds: ['pattern-1', 'pattern-2']
}));
```

## Scene Management Rules

### 1. Position Snapping
- All positions snap to scene boundaries (default: 16 beats)
- Configurable via `SCENE_SNAP_GRANULARITY` constant

### 2. Scene Creation
- New scenes created automatically when pattern moved to empty position
- Default scene length: 16 beats (4 bars @ 4/4)
- Scenes inserted in order by position

### 3. Empty Scenes
- **NOT** deleted when last pattern removed
- Serve as placeholders to maintain timeline structure
- Can be manually deleted if needed

### 4. Multi-Select Movement
- Delta-based: preserves relative spacing between patterns
- Each pattern moves independently to its target scene
- No scene merging - patterns land where they land

## Migration Checklist

For each hook that manipulates patterns:

- [ ] Replace `patternsSlice` imports with `songSlice`
- [ ] Update action names (e.g., `movePattern` → `movePatternInTimeline`)
- [ ] Change payload format (use `patternReactId` instead of `patternId`)
- [ ] Test that operations work correctly
- [ ] Verify CKS export is correct

## Example: Complete Hook Migration

### Before

```typescript
// src/hooks/usePatternOperations.ts (OLD)
import {
  movePattern,
  resizePattern,
  removePatterns,
  duplicatePattern,
  updatePattern,
} from '@/store/slices/patternsSlice';

export function usePatternOperations() {
  const dispatch = useAppDispatch();

  const handleClipMove = (patternId: ID, newPosition: Position) => {
    dispatch(movePattern({ patternId, position: newPosition }));
  };

  const handleClipResize = (patternId: ID, newDuration: Duration) => {
    dispatch(resizePattern({ patternId, duration: newDuration }));
  };

  const handleClipDelete = (patternId: ID) => {
    dispatch(removePatterns([patternId]));
  };

  const handleClipCopy = (patternId: ID) => {
    dispatch(duplicatePattern(patternId));
  };

  const handleClipLabelChange = (patternId: ID, label: string) => {
    dispatch(updatePattern({ patternId, updates: { label } }));
  };

  return {
    handleClipMove,
    handleClipResize,
    handleClipDelete,
    handleClipCopy,
    handleClipLabelChange,
  };
}
```

### After

```typescript
// src/hooks/usePatternOperations.ts (NEW)
import {
  movePatternInTimeline,
  resizePatternInTimeline,
  deletePatternInTimeline,
  duplicatePatternInTimeline,
  updatePatternLabel,
} from '@/store/slices/songSlice';

export function usePatternOperations() {
  const dispatch = useAppDispatch();

  const handleClipMove = (patternId: ID, newPosition: Position) => {
    dispatch(movePatternInTimeline({
      patternReactId: patternId,
      newPosition
    }));
  };

  const handleClipResize = (patternId: ID, newDuration: Duration) => {
    dispatch(resizePatternInTimeline({
      patternReactId: patternId,
      newDuration
    }));
  };

  const handleClipDelete = (patternId: ID) => {
    dispatch(deletePatternInTimeline({
      patternReactId: patternId
    }));
  };

  const handleClipCopy = (patternId: ID) => {
    dispatch(duplicatePatternInTimeline({
      patternReactId: patternId
    }));
  };

  const handleClipLabelChange = (patternId: ID, label: string) => {
    dispatch(updatePatternLabel({
      patternReactId: patternId,
      label
    }));
  };

  return {
    handleClipMove,
    handleClipResize,
    handleClipDelete,
    handleClipCopy,
    handleClipLabelChange,
  };
}
```

## Testing the Migration

After migrating a hook:

1. **Import CKS file** to populate songSlice with data
2. **Test pattern operations** (create, move, resize, delete)
3. **Export CKS file** and verify it's valid
4. **Check console** for any adapter errors
5. **Verify multi-select** operations work correctly

## Common Pitfalls

### ❌ Using old slice actions
```typescript
import { addPattern } from '@/store/slices/patternsSlice'; // DON'T USE!
```

### ✅ Use timeline adapter actions
```typescript
import { createPatternInTimeline } from '@/store/slices/songSlice';
```

### ❌ Forgetting to rename payload fields
```typescript
dispatch(movePatternInTimeline({
  patternId: id, // WRONG field name
  newPosition: pos
}));
```

### ✅ Use correct payload format
```typescript
dispatch(movePatternInTimeline({
  patternReactId: id, // CORRECT field name
  newPosition: pos
}));
```

## Next Steps

1. Migrate `usePatternOperations` hook
2. Migrate `useTrackOperations` hook
3. Update any components that dispatch pattern/track actions directly
4. Remove DATA actions from old slices (keep only UI state actions)
5. Test full workflow: import → edit → export
