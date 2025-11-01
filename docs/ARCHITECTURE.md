# Cyclone Architecture - CKS Native Format

## Overview

Cyclone uses the Cirklon Song (CKS) format as its **native internal format** throughout the application. This ensures lossless import/export and eliminates dual format maintenance.

## Design Principles

### 1. Single Source of Truth (DRY)
- **CKS is the format**: `CirklonSongData` is stored directly in Redux
- **No conversion**: No lossy CKS → Cyclone → CKS conversions
- **Preserve everything**: Unknown CKS fields are preserved exactly

### 2. Clean Architecture
- **Storage Layer**: CKS data in Redux (`songSlice`)
- **View Layer**: Components use `Pattern`/`Track`/`Scene` view models
- **Selectors**: Compute view models from CKS data (one-way transformation)
- **Actions**: Modify CKS structure directly (not view models)

### 3. Lossless Import/Export
- **Import**: Parse CKS → Add `_cyclone_metadata` → Store in Redux
- **Export**: Strip `_cyclone_metadata` → Write CKS file
- **Perfect round-trip**: Import → Edit → Export produces identical CKS (modulo edits)

## Data Model

### CirklonSongData (Storage Format)
```typescript
interface CirklonSongData {
  song_data: {
    [songName: string]: CirklonSong; // The actual Cirklon data
  };
  _cyclone_metadata?: CycloneMetadata; // Cyclone UI state (stripped on export)
}
```

### CycloneMetadata (UI State)
```typescript
interface CycloneMetadata {
  version: string;
  currentSongName: string; // Which song we're editing

  // React keys for stable rendering
  uiMappings: {
    patterns: { [patternName: string]: { reactKey: string; cyclonePatternId: string } };
    tracks: { [trackKey: string]: { reactKey: string; color: string } };
    scenes: { [sceneName: string]: { reactKey: string; color?: string } };
  };

  // Track display order
  trackOrder: string[]; // Array of track keys (e.g., ["track_1", "track_2"])

  // UI state
  viewport?: ViewportState;
  timeline?: Partial<TimelineState>;
  selection?: SelectionState;
  patternEditor?: PatternEditorState;
}
```

### View Models (Computed)
```typescript
// These are DERIVED from CKS via selectors - never stored!
interface Pattern {
  id: string; // From _cyclone_metadata.uiMappings.patterns[name].reactKey
  trackId: string; // From _cyclone_metadata.uiMappings.tracks[trackKey].reactKey
  position: Position; // Computed from scene positions
  duration: Duration; // From pattern bar_count
  label?: string; // Pattern name from CKS
  // ... other computed fields
}

interface Track {
  id: string; // From _cyclone_metadata.uiMappings.tracks[trackKey].reactKey
  name: string; // e.g., "Track 1"
  color: string; // From _cyclone_metadata
}

interface Scene {
  id: string; // From _cyclone_metadata.uiMappings.scenes[sceneName].reactKey
  name: string; // Scene name from CKS
  position: Position; // Computed from scene.gbar
  duration: Duration; // From scene.length
}
```

## Redux Architecture

### State Shape
```typescript
interface RootState {
  song: CirklonSongData; // The entire CKS file + metadata
  timeline: TimelineState; // Playback state (separate)
  // Other UI slices (unchanged)
}
```

### Selectors (View Layer)
Selectors transform CKS data into view models:

```typescript
// Example: Compute all patterns from CKS
const selectAllPatterns = createSelector(
  [(state: RootState) => state.song],
  (songData) => {
    const currentSong = getCurrentSong(songData);
    const metadata = songData._cyclone_metadata;

    // Flatten scenes → patterns
    const patterns: Pattern[] = [];
    Object.entries(currentSong.scenes).forEach(([sceneName, scene]) => {
      Object.entries(scene.pattern_assignments || {}).forEach(([trackKey, patternName]) => {
        const pattern = currentSong.patterns[patternName];
        const mapping = metadata?.uiMappings.patterns[patternName];

        patterns.push({
          id: mapping?.reactKey || generateId('pattern'),
          trackId: metadata?.uiMappings.tracks[trackKey]?.reactKey || generateId('track'),
          position: computeScenePosition(sceneName, currentSong),
          duration: computePatternDuration(pattern),
          label: patternName,
          // ... other fields
        });
      });
    });

    return patterns;
  }
);
```

### Actions (Modify CKS)
Actions operate directly on CKS structure:

```typescript
// Instead of: updatePattern(patternId, changes)
// We have: updateCKSPattern(patternName, changes)

updateCKSPattern: (state, action: PayloadAction<{
  patternName: string;
  changes: Partial<CirklonPattern>;
}>) => {
  const { patternName, changes } = action.payload;
  const currentSong = getCurrentSong(state);

  if (currentSong.patterns[patternName]) {
    Object.assign(currentSong.patterns[patternName], changes);
  }
}
```

## Migration Strategy

We're using a **gradual migration** to minimize risk:

### Phase 1: Parallel Operation
1. Add `songSlice` alongside existing slices
2. Update import to populate BOTH old and new stores (dual-write)
3. Components continue using old selectors (no changes yet)

### Phase 2: Selector Migration
1. Create new selectors that read from `songSlice`
2. Update components one-by-one to use new selectors
3. Old slices remain but are no longer populated

### Phase 3: Action Migration
1. Create new actions that modify `songSlice`
2. Update components/hooks to dispatch new actions
3. Old actions remain for backward compatibility

### Phase 4: Cleanup
1. Remove old slices (`patternsSlice`, `tracksSlice`, `scenesSlice`)
2. Remove dual-write logic from import
3. Update tests

## Import/Export Flow

### Import (Add Metadata)
```typescript
function importCKS(cksString: string): CirklonSongData {
  const cksData = JSON.parse(cksString);

  // Add _cyclone_metadata if missing
  if (!cksData._cyclone_metadata) {
    cksData._cyclone_metadata = generateMetadata(cksData);
  }

  return cksData;
}

function generateMetadata(cksData: CirklonSongData): CycloneMetadata {
  // Generate stable React keys for all patterns/tracks/scenes
  // Extract first song as current
  // Set default UI state
}
```

### Export (Strip Metadata)
```typescript
function exportCKS(songData: CirklonSongData): string {
  const { _cyclone_metadata, ...cksData } = songData;
  return JSON.stringify(cksData, null, '\t'); // Match Cirklon formatting
}
```

## Benefits

1. **Lossless**: Perfect round-trip import/export
2. **Simple**: Single source of truth (CKS)
3. **Future-proof**: Unknown CKS fields preserved automatically
4. **Clean**: Clear separation between storage (CKS) and view (React)
5. **Type-safe**: TypeScript types for all operations

## Component Impact

**Zero impact on components!** Components continue using:
- `Pattern`, `Track`, `Scene` interfaces (unchanged)
- Same selectors (just reimplemented)
- Same dispatched actions (just reimplemented)

The refactor is **transparent** to components.
