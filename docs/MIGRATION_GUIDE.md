# Migration Guide - CKS Native Architecture

## Overview

This guide explains how to migrate components from using the old Redux slices (`patternsSlice`, `tracksSlice`, `scenesSlice`) to the new CKS-native architecture (`songSlice` + selectors).

## Migration Strategy

We're using a **gradual migration** approach:
1. Old slices remain in place (backward compatibility)
2. New songSlice added alongside
3. Migrate components one at a time
4. Remove old slices once all components migrated

## Step-by-Step Component Migration

### Step 1: Update Selector Imports

**Before:**
```typescript
import { selectAllPatterns, selectPatternById } from '@/store/selectors/patterns';
import { selectAllTracks, selectTrackById } from '@/store/selectors/tracks';
```

**After:**
```typescript
import { selectAllPatterns, selectPatternById } from '@/store/selectors/song';
import { selectAllTracks, selectTrackById } from '@/store/selectors/song';
```

**Key Point:** The selector names are the same, just imported from a different file!

### Step 2: Verify Component Still Works

The interfaces returned by selectors are identical:
- `Pattern[]` still has same fields
- `Track[]` still has same fields
- `Scene[]` still has same fields

Components should work without modification.

### Step 3: Update Action Dispatches (Future)

This step is NOT required yet, but here's how to migrate actions when ready:

**Before:**
```typescript
import { addPattern, updatePattern } from '@/store/slices/patternsSlice';

dispatch(addPattern({ trackId: 't1', position: 0, duration: 4 }));
dispatch(updatePattern({ patternId: 'p1', updates: { duration: 8 } }));
```

**After:**
```typescript
import { assignPatternToScene, updatePattern } from '@/store/slices/songSlice';

// Need to work with CKS structure (scenes + pattern names)
dispatch(assignPatternToScene({
  sceneName: 'Scene 1',
  trackKey: 'track_1',
  patternName: 'T1_P3_00'
}));

dispatch(updatePattern({
  patternName: 'T1_P3_00',
  changes: { bar_count: 2 } // Note: bar_count, not duration
}));
```

**Note:** Action migration requires more thought - we'll need adapter functions.

## Example Migration

### Before (Old Architecture)
```typescript
import { useSelector } from 'react-redux';
import { selectAllPatterns } from '@/store/selectors/patterns';
import { selectAllTracks } from '@/store/selectors/tracks';
import type { RootState } from '@/store/store';

export function Timeline() {
  const patterns = useSelector(selectAllPatterns);
  const tracks = useSelector(selectAllTracks);

  return (
    <div>
      {tracks.map(track => (
        <TrackRow key={track.id} track={track}>
          {patterns
            .filter(p => p.trackId === track.id)
            .map(pattern => (
              <Pattern key={pattern.id} pattern={pattern} />
            ))}
        </TrackRow>
      ))}
    </div>
  );
}
```

### After (New Architecture)
```typescript
import { useSelector } from 'react-redux';
import { selectAllPatterns, selectAllTracks } from '@/store/selectors/song'; // Changed import
import type { RootState } from '@/store/store';

export function Timeline() {
  const patterns = useSelector(selectAllPatterns); // Same selector name!
  const tracks = useSelector(selectAllTracks); // Same selector name!

  return (
    <div>
      {tracks.map(track => (
        <TrackRow key={track.id} track={track}>
          {patterns
            .filter(p => p.trackId === track.id)
            .map(pattern => (
              <Pattern key={pattern.id} pattern={pattern} />
            ))}
        </TrackRow>
      ))}
    </div>
  );
}
```

**That's it!** Just change the import statement. The component code is identical.

## Selector Mapping

| Old Selector | New Selector | Notes |
|--------------|--------------|-------|
| `selectAllPatterns` | `selectAllPatterns` | Same interface |
| `selectPatternById` | `selectPatternById` | Same interface |
| `selectPatternsByTrack` | `selectPatternsByTrack` | Same interface |
| `selectSelectedPatterns` | `selectSelectedPatterns` | Same interface |
| `selectTimelineEndPosition` | `selectTimelineEndPosition` | Same interface |
| `selectPatternCount` | `selectPatternCount` | Same interface |
| `selectAllTracks` | `selectAllTracks` | Same interface |
| `selectTrackById` | `selectTrackById` | Same interface |
| `selectTrackCount` | `selectTrackCount` | Same interface |
| `selectTrackIndexById` | `selectTrackIndexById` | Same interface |
| `selectAllScenes` | `selectAllScenes` | NEW (from songSlice) |
| `selectSceneById` | `selectSceneById` | NEW (from songSlice) |

## Testing Your Migration

After migrating a component:

1. **Run unit tests:**
   ```bash
   npm test -- ComponentName.test.tsx
   ```

2. **Run full test suite:**
   ```bash
   npm test
   ```

3. **Manual testing:**
   - Load a CKS file
   - Verify patterns/tracks display correctly
   - Test interactions (select, move, edit)
   - Export CKS file and verify it's identical

## Common Pitfalls

### Pitfall 1: Circular Dependencies

**Problem:** Importing from both old and new selectors in same file.

**Solution:** Choose one architecture per file. Don't mix.

### Pitfall 2: Assuming Pattern IDs are CKS Pattern Names

**Problem:** In the old architecture, `pattern.id` was a generated ID. In new architecture, `pattern.id` is `cyclonePatternId` (still generated), but CKS uses `pattern.label` as the pattern name.

**Solution:** Use `pattern.label` when working with CKS structure.

### Pitfall 3: Direct State Access

**Problem:** Components accessing `state.patterns.patterns` directly.

**Solution:** Always use selectors. Selectors abstract the underlying structure.

## Migration Checklist

For each component:

- [ ] Update selector imports to use `@/store/selectors/song`
- [ ] Run component tests
- [ ] Manual testing in browser
- [ ] Verify no console errors
- [ ] Verify export/import still works
- [ ] Document any issues

## Action Migration (Future Work)

Action migration is more complex because actions operate differently:

### Old Actions (Pattern-centric)
- `addPattern({ trackId, position, duration })`
- `updatePattern({ patternId, updates })`
- `removePattern(patternId)`

### New Actions (CKS-centric)
- `addPattern({ patternName, pattern })` + `assignPatternToScene({ sceneName, trackKey, patternName })`
- `updatePattern({ patternName, changes })`
- `removePattern(patternName)`

**Key Difference:** New actions work with CKS structure (scenes, pattern names, track keys) instead of Cyclone IDs.

### Adapter Pattern (Recommended)

Create adapter functions that map old action calls to new actions:

```typescript
// src/store/adapters/patternActions.ts
export function addPatternAdapter(
  trackId: string,
  position: number,
  duration: number
) {
  return (dispatch, getState) => {
    const state = getState();

    // 1. Find scene at position
    const scene = findSceneAtPosition(state, position);

    // 2. Find track key for trackId
    const trackKey = findTrackKey(state, trackId);

    // 3. Generate pattern name
    const patternName = generatePatternName();

    // 4. Create pattern
    const pattern = createPattern(duration);

    // 5. Dispatch new actions
    dispatch(addPattern({ patternName, pattern }));
    dispatch(assignPatternToScene({
      sceneName: scene.name,
      trackKey,
      patternName
    }));
  };
}
```

## When to Migrate

Migrate components in this order:

1. **Start with leaf components** (Pattern, Track, SceneMarker)
   - Fewer dependencies
   - Easy to test
   - Quick wins

2. **Then container components** (Timeline, TrackList)
   - More complex
   - Benefit from leaf component migrations
   - Integration testing needed

3. **Finally hooks** (usePatternOperations, useTrackOperations)
   - Most complex
   - Used by many components
   - Requires adapter functions

4. **Last: global operations** (import, export, storage)
   - Critical path
   - Extensive testing needed
   - Save for when everything else works

## Rollback Plan

If migration causes issues:

1. **Component-level rollback:**
   - Change import back to old selector
   - No other changes needed

2. **Full rollback:**
   - Remove `song: songReducer` from store
   - Delete new files
   - Old architecture still works

## Success Metrics

Migration is successful when:

- ✅ All tests pass (1106+ tests)
- ✅ Import/export works perfectly
- ✅ No console errors
- ✅ Performance is same or better
- ✅ Components still look/behave correctly
- ✅ Round-trip preservation verified

## Getting Help

Questions? Check:
1. `ARCHITECTURE.md` - Architecture overview
2. `REFACTOR_SUMMARY.md` - What was done
3. This file - How to migrate
4. Test files - Examples of usage

## Example PR Description

When creating a PR for component migration:

```markdown
## Summary
Migrate [ComponentName] to use CKS-native selectors

## Changes
- Updated selector imports from `@/store/selectors/patterns` to `@/store/selectors/song`
- No component logic changes required
- All tests passing

## Testing
- [x] Unit tests pass
- [x] Manual testing complete
- [x] No regressions
- [x] Export/import verified

## Migration Progress
- Components migrated: X/Y
- Remaining: [list]
```

## Conclusion

Migration is straightforward for selectors - just change the import! Action migration will require more work, but we can tackle that incrementally with adapter functions.

The key principle: **Migrate incrementally, test thoroughly, and maintain backward compatibility until fully migrated.**
