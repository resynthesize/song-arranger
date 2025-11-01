# Cyclone Refactoring Action Items

## CRITICAL PRIORITY - Start Here

### TASK 1: Split timelineActions.ts (930 lines)
**File:** `/src/store/slices/songSlice/timelineActions.ts`
**Effort:** 4-6 hours
**Impact:** High - Improves maintainability significantly

**Steps:**
1. Create `/src/store/slices/songSlice/actions/` directory
2. Create 4 new files:
   - `patternActions.ts` - movePatternInTimeline, movePatternsInTimeline, resizePatternInTimeline, resizePatternsInTimeline, duplicatePatternInTimeline, duplicatePatternsInTimeline, splitPatternInTimeline, trimPatternStartInTimeline, trimPatternEndInTimeline, setPatternsDurationInTimeline, setPatternMutedInTimeline, setPatternTypeInTimeline, updatePatternLabel, deletePatternInTimeline, deletePatternsInTimeline, movePatternToTrack, movePatternsToTrack, createPatternInTimeline
   - `trackActions.ts` - addTrackInTimeline, removeTrackInTimeline, moveTrackUpInTimeline, moveTrackDownInTimeline, reorderTrackInTimeline, renameTrackInTimeline, setTrackColorInTimeline
   - `sceneActions.ts` - (if any scene editing is in timelineActions)
   - `stepActions.ts` - updateStepValueInTimeline, updateStepNoteInTimeline, toggleGateInTimeline, toggleAuxFlagInTimeline
3. Create `/src/store/slices/songSlice/actions/index.ts` for barrel export
4. Update `/src/store/slices/songSlice/slice.ts` to import from new location
5. Run tests to verify functionality

**Files to Update:**
- `/src/store/slices/songSlice/slice.ts` - Update imports
- `/src/store/slices/songSlice/index.ts` - May need to re-export if using wildcard
- Any files importing from timelineActions

---

### TASK 2: Fix Store.ts songSlice Import
**File:** `/src/store/store.ts`
**Effort:** 15 minutes
**Impact:** Medium - Consistency with Redux patterns

**Change:**
```typescript
// Line 21 - BEFORE:
import songReducer from './slices/songSlice/slice'; // Direct import, bypasses barrel

// AFTER:
import songReducer from './slices/songSlice';
```

**Files to Check:**
- Any other files with `from './slices/songSlice/slice'` pattern
- Search: `grep -r "from.*songSlice/slice" /src/store`

---

### TASK 3: Add Missing Component Barrel Exports
**Effort:** 30 minutes
**Impact:** Medium - Consistent import patterns

**Create these 10 index.ts files:**

#### Organisms (4):
1. `/src/components/organisms/CirklonExportDialog/index.ts`
```typescript
export { default } from './CirklonExportDialog';
```

2. `/src/components/organisms/LiveConsole/index.ts`
```typescript
export { LiveConsole } from './LiveConsole';
```

3. `/src/components/organisms/SongDataViewer/index.ts`
```typescript
export { default } from './SongDataViewer';
```

4. `/src/components/organisms/StatusLine/index.ts`
```typescript
export { default } from './StatusLine';
```

#### Molecules (6):
1. `/src/components/molecules/BarNavigation/index.ts`
```typescript
export { BarNavigation } from './BarNavigation';
```

2. `/src/components/molecules/ConsoleAutocomplete/index.ts`
```typescript
export { ConsoleAutocomplete } from './ConsoleAutocomplete';
```

3. `/src/components/molecules/PatternEditorHeader/index.ts`
```typescript
export { PatternEditorHeader } from './PatternEditorHeader';
```

4. `/src/components/molecules/StepValueEditor/index.ts`
```typescript
export { StepValueEditor } from './StepValueEditor/StepValueEditor';
export type { StepValueEditorProps } from './StepValueEditor/StepValueEditor';
```

5. `/src/components/molecules/TrackHeaderResizeHandle/index.ts`
```typescript
export { TrackHeaderResizeHandle } from './TrackHeaderResizeHandle';
```

6. `/src/components/molecules/TrackResizeHandle/index.ts`
```typescript
export { TrackResizeHandle } from './TrackResizeHandle/TrackResizeHandle';
```

**Update organisms/index.ts:**
Add after line 47 (after BootSequence):
```typescript
export { default as CirklonExportDialog } from './CirklonExportDialog';
export { LiveConsole } from './LiveConsole';
export { default as SongDataViewer } from './SongDataViewer';
export { default as StatusLine } from './StatusLine';
```

**Update TimelineTemplate.tsx imports:**
```typescript
// From:
import MenuBar from '../../organisms/MenuBar';
import Timeline from '../../organisms/Timeline';
// ... other relative imports

// To:
import { MenuBar, Timeline, CommandFooter, StatusLine, PatternEditor, SongDataViewer } from '@/components/organisms';
import { TrackSettingsPanel, LiveConsole } from '@/components/organisms';
import { ResizableDivider } from '@/components/molecules';
```

---

## HIGH PRIORITY - Week 1-2

### TASK 4: Split Large Components > 350 Lines

#### 4a. FileMenu.tsx (616 lines)
**File:** `/src/components/organisms/FileMenu/FileMenu.tsx`
**Effort:** 2-3 hours

**Refactor Strategy:**
- Extract file operations into sub-components
- Create: `FileMenuHeader.tsx`, `FileMenuImportExport.tsx`, `FileMenuActions.tsx`
- Keep FileMenu as orchestrator component

#### 4b. Pattern.tsx (385 lines)
**File:** `/src/components/organisms/Pattern/Pattern.tsx`
**Effort:** 2 hours

**Refactor Strategy:**
- Extract visualization logic into `PatternVisualizer.tsx`
- Extract context menu handling into `PatternContextMenu.tsx`
- Keep Pattern as container component

#### 4c. Track.tsx (373 lines)
**File:** `/src/components/organisms/Track/Track.tsx`
**Effort:** 2 hours

**Refactor Strategy:**
- GridCanvas already extracted (good!)
- Extract PatternList rendering to `TrackPatternList.tsx`
- Extract header handling to `TrackHeaderContainer.tsx`

#### 4d. Minimap.tsx (354 lines)
**File:** `/src/components/organisms/Minimap/Minimap.tsx`
**Effort:** 2 hours

**Refactor Strategy:**
- Extract rendering logic to `MinimapDisplay.tsx`
- Extract interaction handlers to `useMinimapInteraction.ts`

---

### TASK 5: Split keyboard.ts (629 lines)
**File:** `/src/utils/keyboard.ts`
**Effort:** 2-3 hours
**Impact:** Medium - Better organization of keyboard logic

**New Structure:**
```
/src/utils/keyboard/
├── types.ts              (KeyboardAction, KeyboardShortcut, KeyboardContext)
├── registry.ts           (SHORTCUT_REGISTRY, getAllShortcuts, getShortcutsForContext)
├── matching.ts           (matchesShortcut, findMatchingShortcut)
├── formatting.ts         (formatShortcut)
└── index.ts              (barrel export - re-export all)
```

**Steps:**
1. Create `keyboard/` directory
2. Extract types to `types.ts`
3. Extract registry to `registry.ts` 
4. Extract matching logic to `matching.ts`
5. Extract formatting to `formatting.ts`
6. Create `index.ts` with barrel exports
7. Update `/src/utils/keyboard.ts` to re-export from keyboard/ (for backwards compat)
8. Update all imports to use new structure
9. Remove old keyboard.ts

---

## MEDIUM PRIORITY - Week 2-3

### TASK 6: Consolidate Type Definitions
**Effort:** 3-4 hours
**Impact:** Medium - Single source of truth for types

**Create New Structure:**
```
/src/types/
├── index.ts                  (main UI/Timeline types)
├── patternData.ts
├── redux/
│   ├── index.ts
│   ├── state.ts             (PatternEditorState, TimelineState, etc.)
│   └── actions.ts           (action payload types)
├── cirklon/                  (moved from utils)
│   ├── index.ts
│   ├── song.ts              (CirklonSongData)
│   ├── pattern.ts           (CirklonPattern, CirklonScene)
│   └── metadata.ts          (CycloneMetadata)
└── components/              (optional - component-specific types)
```

**Migration Steps:**
1. Create `/src/types/redux/state.ts` and consolidate Redux state interfaces
2. Create `/src/types/cirklon/` and move `/src/utils/cirklon/types.ts`
3. Create `/src/types/redux/actions.ts` for payload types from `/src/store/slices/songSlice/types.ts`
4. Update all imports
5. Verify TypeScript compilation
6. Consider deprecating old locations

---

### TASK 7: Split Large Hook Files

#### 7a. usePatternOperations.ts (353 lines)
**File:** `/src/hooks/usePatternOperations.ts`
**Effort:** 1-2 hours

**Split Into:**
- `usePatternCreation.ts`
- `usePatternModification.ts` (move, resize, duplicate, split)
- `usePatternDeletion.ts`
- `usePatternOperations.ts` (main export combining all)

#### 7b. useNavigationShortcuts.ts (254 lines)
**File:** `/src/hooks/shortcuts/useNavigationShortcuts.ts`
**Effort:** 1 hour

Consider combining with other shortcuts or splitting by domain (playhead vs selection)

---

### TASK 8: Update Template Imports
**File:** `/src/components/templates/TimelineTemplate/TimelineTemplate.tsx`
**Effort:** 30 minutes

**Change all relative imports to aliases:**
```typescript
// Search & replace pattern:
// FROM: import X from '../../organisms/...'
// TO: import X from '@/components/organisms/...'

import MenuBar from '@/components/organisms/MenuBar';
import Timeline from '@/components/organisms/Timeline';
import CommandFooter from '@/components/organisms/CommandFooter';
import StatusLine from '@/components/organisms/StatusLine';
import PatternEditor from '@/components/organisms/PatternEditor/PatternEditor';
import SongDataViewer from '@/components/organisms/SongDataViewer/SongDataViewer';
import { TrackSettingsPanel } from '@/components/organisms/TrackSettingsPanel';
import { LiveConsole } from '@/components/organisms/LiveConsole';
import { ResizableDivider } from '@/components/molecules';
```

---

## LOW PRIORITY - Week 3-4

### TASK 9: Replace Console Statements with Logger
**Effort:** 1-2 hours
**Impact:** Low - Better debugging infrastructure

Search for all `console.log`, `console.warn`, `console.error` and replace with:
```typescript
import { logger } from '@/utils/debug';

// Replace:
console.log('message') → logger.debug('message')
console.warn('message') → logger.warn('message')
console.error('message') → logger.error('message')
```

---

### TASK 10: Split Large Test Files

#### 10a. PatternEditor.test.tsx (897 lines)
**File:** `/src/components/organisms/PatternEditor/PatternEditor.test.tsx`
**Effort:** 2 hours

**Split Into:**
- `PatternEditor.rendering.test.tsx`
- `PatternEditor.interaction.test.tsx`
- `PatternEditor.keyboard.test.tsx`

#### 10b. patternEditorSlice.test.ts (985 lines)
**File:** `/src/store/slices/patternEditorSlice.test.ts`
**Effort:** 2 hours

**Split Into:**
- `patternEditorSlice.row-selection.test.ts`
- `patternEditorSlice.step-selection.test.ts`
- `patternEditorSlice.view-mode.test.ts`

And similar splits for other large test files.

---

### TASK 11: Deprecate Legacy constants.ts
**File:** `/src/constants.ts`
**Effort:** 30 minutes

Either:
- Merge contents into `/src/constants/index.ts` and delete constants.ts
- Or add deprecation notice and gradually migrate imports

---

### TASK 12: Standardize Component Export Style
**Effort:** 1-2 hours

Review `/src/components/organisms/index.ts` and decide on single export style (default vs named) then apply consistently.

---

## VERIFICATION CHECKLIST

After each task, verify:
- [ ] TypeScript compiles: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] No circular dependency warnings
- [ ] Imports resolve correctly
- [ ] No unused imports
- [ ] Code still functions as expected

---

## Testing Strategy

1. Run full test suite after each task: `npm test`
2. For refactored files, ensure test coverage remains the same
3. Create snapshots if visual components change
4. Manual testing in browser after major changes

---

## Git Strategy

Recommended commits:
1. `refactor: split timelineActions.ts into domain-specific files`
2. `refactor: fix store.ts songSlice import to use barrel export`
3. `chore: add missing barrel exports for 10 components`
4. `refactor: split FileMenu, Pattern, Track, Minimap components`
5. `refactor: reorganize keyboard utilities into keyboard/ subdirectory`
6. And so on...

---

## Documentation Updates Needed

After refactoring:
1. Update ARCHITECTURE.md with new file structure
2. Update code comments in moved files
3. Add migration guide to CHANGELOG if needed
4. Update any internal documentation linking to moved files

