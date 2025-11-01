# Cyclone Song Arranger - Codebase Organization Audit Report

## Executive Summary

The Cyclone codebase has **260 TypeScript files** organized into a structured component hierarchy with Redux state management. While the overall architecture is sound with good separation of concerns, there are **several organizational issues** affecting maintainability, consistency, and scalability.

**Overall Health:** 7/10 - Good foundation with notable organizational inconsistencies

---

## 1. FILE ORGANIZATION

### 1.1 Component Hierarchy (Atoms → Molecules → Organisms)

#### Status: GOOD - Well-Structured

**Atoms:** 14 components (primitive UI building blocks)
- `/src/components/atoms/` - ✅ Well organized

**Molecules:** 26 components (simple component combinations)
- `/src/components/molecules/` - ✅ Well organized

**Organisms:** 27 directories (complex, standalone components)
- `/src/components/organisms/` - ⚠️ **4 MISSING barrel exports**
- **Templates:** 1 component
- **Pages:** 1 component

#### Issues Found:

**Issue 1.1a: Missing Barrel Exports (Inconsistent Pattern)**
- **Priority:** MEDIUM
- **Files Affected:**
  - `/src/components/organisms/CirklonExportDialog/` - ❌ No `index.ts`
  - `/src/components/organisms/LiveConsole/` - ❌ No `index.ts`
  - `/src/components/organisms/SongDataViewer/` - ❌ No `index.ts`
  - `/src/components/organisms/StatusLine/` - ❌ No `index.ts`

- **Molecules Missing Barrel Exports:**
  - `/src/components/molecules/BarNavigation/` - ❌ No `index.ts`
  - `/src/components/molecules/ConsoleAutocomplete/` - ❌ No `index.ts`
  - `/src/components/molecules/PatternEditorHeader/` - ❌ No `index.ts`
  - `/src/components/molecules/StepValueEditor/` - ❌ No `index.ts`
  - `/src/components/molecules/TrackHeaderResizeHandle/` - ❌ No `index.ts`
  - `/src/components/molecules/TrackResizeHandle/` - ❌ No `index.ts`

- **Impact:** Inconsistent import patterns. Some components use `index.ts` barrel exports, others require direct imports.
  ```typescript
  // Inconsistent pattern A (with barrel export)
  import { ColorSwatch } from '@/components/molecules/ColorSwatch';
  
  // Inconsistent pattern B (direct import, no index.ts)
  import { StepValueEditor } from '@/components/molecules/StepValueEditor/StepValueEditor';
  ```

- **Recommendation:**
  - Create `index.ts` files for all 10 missing components
  - Standardize on barrel export pattern for all components
  - Update all direct imports to use barrel exports

---

### 1.2 Component Size Analysis

#### Issue 1.2a: Large Components and Test Files

**Priority:** HIGH (Refactoring Candidates)

| Component | Size | Issue |
|-----------|------|-------|
| PatternEditor.test.tsx | 897 lines | Test too large - split by feature |
| PatternRow.test.tsx | 706 lines | Test too large - split by feature |
| Track.test.tsx | 636 lines | Test too large - split by feature |
| FileMenu.tsx | 616 lines | Component too large - extract sub-components |
| PatternEditor.tsx | 450 lines | Container component OK, but split presentational parts |
| Pattern.tsx | 385 lines | Component too large - extract visualization logic |
| Track.tsx | 373 lines | Component too large - extract sub-components |
| Minimap.tsx | 354 lines | Component too large - split by concern |
| Timeline.tsx | 320 lines | Good size for container component |

**Recommendation:** Components over 350 lines should be split:
- Extract visualization/rendering logic into separate components
- Separate container logic from presentation
- Create smaller, reusable sub-components

---

## 2. IMPORT PATTERNS

### 2.1 Import Style Consistency

#### Status: GOOD with Minor Inconsistencies

**Current Usage:**
- ✅ Majority use alias imports: `@/` (path aliases)
- ✅ Only 15 files use deep relative imports (`../../`)
- ⚠️ Template component uses inconsistent relative imports

**Issue 2.1a: Inconsistent Relative Imports in Templates**

**Priority:** LOW

**File:** `/src/components/templates/TimelineTemplate/TimelineTemplate.tsx`

```typescript
// ❌ Uses relative imports instead of aliases
import MenuBar from '../../organisms/MenuBar';
import Timeline from '../../organisms/Timeline';
import CommandFooter from '../../organisms/CommandFooter';
import StatusLine from '../../organisms/StatusLine';
import PatternEditor from '../../organisms/PatternEditor/PatternEditor';
import SongDataViewer from '../../organisms/SongDataViewer/SongDataViewer';
import { TrackSettingsPanel } from '../../organisms/TrackSettingsPanel';
import { LiveConsole } from '../../organisms/LiveConsole';
import { ResizableDivider } from '../../molecules/ResizableDivider';

// ✅ Should be:
import MenuBar from '@/components/organisms/MenuBar';
import Timeline from '@/components/organisms/Timeline';
// etc.
```

**Recommendation:** Convert all relative imports in `/src/components/templates/TimelineTemplate/` to use `@/` alias imports

---

### 2.2 Redux Imports

#### Status: GOOD with Export Organization Issue

**Issue 2.2a: Multiple Import Paths for songSlice**

**Priority:** MEDIUM

**Files Affected:**
- `/src/store/store.ts` - imports from `'./slices/songSlice/slice'` (direct)
- `/src/store/slices/songSlice/slice.ts` - main implementation
- `/src/store/slices/songSlice/index.ts` - barrel export

**Current Pattern:**
```typescript
// store.ts (line 21)
import songReducer from './slices/songSlice/slice'; // Direct import, bypasses barrel

// Alternative pattern used elsewhere
import { movePatternInTimeline } from '@/store/slices/songSlice'; // Uses barrel
```

**Problem:** The comment says "Import directly from slice.ts, not barrel export" which is:
1. Inconsistent with other slices
2. Makes barrel export confusing
3. Bypasses intentional exports

**Recommendation:** 
- Import all slices through barrel exports: `./slices/songSlice`
- Remove direct `slice.ts` imports
- Update store.ts: `import songReducer from './slices/songSlice';`

---

## 3. CODE DUPLICATION & REUSABILITY

### 3.1 Duplicated Constants

#### Status: GOOD (Well-Organized)

**Structure:**
```
/src/constants/
├── index.ts          (barrel export)
├── colors.ts         (color palettes)
├── timeline.ts       (timeline constants)
├── music.ts          (music theory constants)
└── ui.ts             (UI constants)

/src/constants.ts     (legacy file, re-exports from /constants/)
```

**Issue 3.1a: Legacy Constants File**

**Priority:** LOW

**File:** `/src/constants.ts`

This file exists as a compatibility layer and re-exports from the newer `/src/constants/` directory. While it works, it creates a deprecation concern.

**Recommendation:** 
- Deprecate `/src/constants.ts` 
- Migrate all imports to `/src/constants/` structure
- Or merge contents into `/src/constants/index.ts`

---

### 3.2 Redux State Management Duplication

#### Status: CONCERNING (Multiple Overlapping Slices)

**Issue 3.2a: Pattern Data in Multiple Slices**

**Priority:** MEDIUM

Pattern information is stored in multiple Redux slices:
1. **`songSlice`** - CKS native format (source of truth)
2. **`patternsSlice`** - Subset of pattern data
3. **`patternEditorSlice`** - Pattern editor UI state

**Current Structure:**
```typescript
// songSlice stores: CirklonSongData (full format)
export interface SongState extends CirklonSongData

// patternsSlice stores: Pattern objects (timeline view)
interface PatternsState {
  patterns: Pattern[];
  editingPatternId: ID | null;
}

// patternEditorSlice stores: Editor UI state
interface PatternEditorState {
  openPatternId: ID | null;
  selectedRow: PatternRow;
  selectedSteps: number[];
  // ...
}
```

**Problem:**
- Pattern data is synchronized between `songSlice` and `patternsSlice`
- Selectors compute patterns from `songSlice.present` (via `selectAllPatterns`)
- Unclear which slice is authoritative
- Risk of state inconsistency

**Recommendation:**
- Single source of truth: `songSlice` (currently this is correct)
- `patternsSlice` should be removed or converted to computed selectors
- Verify all pattern reads use `selectAllPatterns` from song selector

---

### 3.3 Track/Scene Selection State

#### Issue 3.3b: Track Settings Duplication

**Priority:** LOW

**Files Affected:**
- `/src/components/organisms/TrackSettingsPanel/TrackSettingsPanel.tsx`
- `/src/components/organisms/TrackSettingsDialog/TrackSettingsDialog.tsx`

Both components handle track settings but may duplicate logic. Need review for:
- Form validation
- State management
- Change handling

---

## 4. NAMING CONVENTIONS

### 4.1 File Naming

#### Status: GOOD (Consistent)

✅ Components: PascalCase (`Timeline.tsx`, `PatternEditor.tsx`)
✅ Utilities: camelCase (`noteConversion.ts`, `patternVisualization.ts`)
✅ Constants: UPPER_SNAKE_CASE (`ZOOM_LEVELS`, `MIN_TEMPO`)
✅ CSS Modules: kebab-case (`.timeline-lane`)

---

### 4.2 Component Naming

#### Issue 4.2a: Inconsistent Component Export Names

**Priority:** LOW

**Pattern:** Most organisms export as `export default` or named export, creating inconsistency

```typescript
// Default export pattern
export { default as Timeline } from './Timeline/Timeline';
export { default as ColorPicker } from './ColorPicker/ColorPicker';

// Named export pattern
export { Track } from './Track';
export { Pattern } from './Pattern';
export { BottomPane } from './BottomPane/BottomPane';
```

**Recommendation:** Standardize on one pattern. Prefer named exports for consistency and better tree-shaking.

---

### 4.3 Type Definition Naming

#### Status: GOOD

✅ Pattern types are clear: `Pattern`, `Track`, `Scene`, `PatternRow`
✅ State types are suffixed: `*State` (e.g., `PatternEditorState`, `TimelineState`)
✅ Props interfaces are suffixed: `*Props` (e.g., `TrackHeaderProps`)

---

## 5. MODULE BOUNDARIES & RESPONSIBILITIES

### 5.1 Component Module Clarity

#### Status: GOOD

**Clear Separation:**
- **Atoms** - UI primitives (buttons, inputs, displays)
- **Molecules** - Combinations of atoms (patterns rows, headers)
- **Organisms** - Complex, domain-specific components (Timeline, Track, Pattern)
- **Templates** - Page-level layout
- **Pages** - Route-level containers

---

### 5.2 Hooks Organization

#### Status: GOOD

**Structure:**
```
/src/hooks/
├── shortcuts/                    (domain-specific)
│   ├── index.ts
│   ├── usePatternShortcuts.ts
│   ├── useTrackShortcuts.ts
│   ├── useViewShortcuts.ts
│   └── useNavigationShortcuts.ts
├── usePatternOperations.ts       (353 lines)
├── usePatternDrag.ts
├── usePatternEditorKeyboard.ts
├── useRectangleSelection.ts
├── useDragToCreatePattern.ts
├── useTrackOperations.ts         (180 lines)
├── usePatternResize.ts
└── useViewport.ts
```

**Issue 5.2a: Large Hook Files**

**Priority:** MEDIUM

- `usePatternOperations.ts` (353 lines)
- `useNavigationShortcuts.ts` (254 lines)
- `usePatternShortcuts.ts` (242 lines)

**Recommendation:**
- Split hooks > 250 lines by operation type
- Extract reusable sub-hooks
- Consider custom hook libraries for related operations

---

### 5.3 Utilities Organization

#### Status: GOOD

**Structure:**
```
/src/utils/
├── cirklon/                  (CKS format handling)
│   ├── types.ts
│   ├── conversion.ts
│   ├── export.ts
│   ├── import.ts
│   ├── metadata.ts
│   ├── roundtrip.test.ts
│   └── integration.test.ts
├── keyboard.ts               (629 lines - keyboard shortcuts)
├── patternVisualization.ts   (visualization helpers)
├── storage.ts                (localStorage operations)
├── navigation.ts             (timeline navigation)
├── noteConversion.ts         (MIDI/note conversion)
├── duration.ts               (time calculations)
├── viewport.ts               (viewport utilities)
├── grid.ts                   (grid snapping)
├── snap.ts                   (snap logic)
└── debug.ts
```

**Issue 5.3a: Large keyboard.ts File**

**Priority:** MEDIUM

**File:** `/src/utils/keyboard.ts` (629 lines)

**Contains:**
- Type definitions for `KeyboardAction`, `KeyboardShortcut`
- Shortcut matching logic: `matchesShortcut`, `findMatchingShortcut`
- Shortcut registry: `getAllShortcuts`, `getShortcutsForContext`
- Shortcut formatting: `formatShortcut`

**Problem:** Mixes type definitions, logic, and registry in single file

**Recommendation:**
- Extract types to `keyboard.types.ts`
- Extract registry and matching logic to `keyboard.registry.ts`
- Keep utilities in `keyboard.ts`

**Example Split:**
```
/src/utils/
├── keyboard/
│   ├── types.ts          (type definitions)
│   ├── registry.ts       (shortcut definitions)
│   ├── matching.ts       (matchesShortcut, findMatchingShortcut)
│   ├── formatting.ts     (formatShortcut)
│   └── index.ts          (barrel export)
└── keyboard.ts           (legacy, re-exports from keyboard/)
```

---

### 5.4 Store Organization

#### Status: GOOD

**Redux Structure:**
```
/src/store/
├── store.ts              (main config)
├── hooks.ts              (useAppDispatch, useAppSelector)
├── slices/
│   ├── songSlice/        (complex multi-file)
│   │   ├── slice.ts      (main reducer)
│   │   ├── index.ts      (barrel export)
│   │   ├── adapters.ts   (CKS ↔ Timeline adapters)
│   │   ├── mutations.ts  (immutable mutations)
│   │   ├── timelineActions.ts (930 lines!)
│   │   ├── stepOperations.ts  (step editing)
│   │   ├── types.ts      (payload types)
│   │   └── constants.ts
│   └── [other slices]    (single file each)
└── selectors/
    ├── index.ts          (barrel export)
    ├── song.ts           (430 lines - main selectors)
    ├── tracks.ts
    ├── patterns.ts
    └── selection.ts
```

**Issue 5.4a: timelineActions.ts is Excessively Large**

**Priority:** HIGH

**File:** `/src/store/slices/songSlice/timelineActions.ts` (930 lines)

**Contains:** 50+ CaseReducer functions for timeline operations:
- Pattern operations: move, move multiple, resize, duplicate, split, trim
- Track operations: add, remove, reorder, rename, setColor
- Step operations: updateStepValue, updateStepNote, toggleGate, toggleAuxFlag
- Etc.

**Problem:**
- Hard to navigate
- Difficult to test individual operations
- Mixing concerns (patterns, tracks, steps)
- Risk of interdependency issues

**Recommendation:** Split by domain:
```
/src/store/slices/songSlice/
├── slice.ts              (main reducer, imports actions)
├── mutations.ts          (immutable state helpers)
├── actions/
│   ├── patternActions.ts (pattern operations)
│   ├── trackActions.ts   (track operations)
│   ├── sceneActions.ts   (scene operations)
│   ├── stepActions.ts    (step editing)
│   └── index.ts          (barrel export)
└── types.ts
```

---

### 5.5 Type Definitions

#### Status: GOOD

**Structure:**
```
/src/types/
├── index.ts              (barrel export - main types)
└── patternData.ts        (P3PatternData types)
```

**Issue 5.5a: Types Scattered in Multiple Locations**

**Priority:** MEDIUM

Type definitions exist in:
1. `/src/types/index.ts` - Main types (Pattern, Track, Scene, etc.)
2. `/src/types/patternData.ts` - P3PatternData type definitions
3. `/src/utils/cirklon/types.ts` - CirklonSongData, CirklonPattern, etc.
4. Individual slice files - State interfaces (e.g., `PatternEditorState` in patternEditorSlice.ts)
5. Component files - Props interfaces (e.g., `TrackProps` in Track.tsx)

**Problem:**
- No single source of truth for types
- Difficult to find type definitions
- Risk of duplicate/conflicting types

**Recommendation:**
```
/src/types/
├── index.ts                (UI/Timeline types)
├── patternData.ts          (P3 pattern types)
├── redux/
│   ├── state.ts            (all Redux state types)
│   ├── selectors.ts        (selector return types)
│   └── index.ts
├── cirklon/                (rename from utils/cirklon/types.ts)
│   ├── song.ts
│   ├── pattern.ts
│   └── index.ts
└── components/             (component-specific types)
    ├── track.ts
    ├── pattern.ts
    └── index.ts
```

---

## 6. DEAD CODE & UNUSED EXPORTS

### 6.1 Organisms Index Missing Exports

#### Issue 6.1a: 4 Organisms Not Exported

**Priority:** MEDIUM

**File:** `/src/components/organisms/index.ts`

**Missing Exports:**
```typescript
// NOT exported, but used in TimelineTemplate:
// - CirklonExportDialog
// - LiveConsole
// - SongDataViewer
// - StatusLine
```

**File Usage:**
- CirklonExportDialog - Used in TimelineTemplate.tsx (direct import)
- LiveConsole - Used in TimelineTemplate.tsx (direct import)
- SongDataViewer - Used in TimelineTemplate.tsx (direct import)
- StatusLine - Used in TimelineTemplate.tsx (direct import)

**Impact:**
- Inconsistent import patterns (direct vs barrel)
- Organisms index doesn't export all organisms
- Makes discovery difficult

**Recommendation:**
- Add these 4 organisms to `/src/components/organisms/index.ts`
- Update TimelineTemplate imports to use barrel export
- Consistency: All organisms should be in barrel export

---

### 6.2 Redux Slice Exports

#### Status: GOOD

All slices properly export their reducers and actions. No dead exports found.

---

### 6.3 Debug Console Statements

#### Issue 6.3a: 95 console.log/warn/error Statements

**Priority:** LOW

- **Count:** 95 console statements found
- **Location:** Spread across components, hooks, and utilities
- **Issue:** Some may be debug code left in production

**Example Files:**
- Keyboard utilities
- Pattern operations
- Navigation hooks

**Recommendation:**
- Use `logger` utility instead of `console` directly
- Implement log levels (debug, info, warn, error)
- Configure log output based on environment (dev vs prod)

---

## 7. CIRCULAR DEPENDENCIES

### Status: GOOD

**Analysis:** No obvious circular dependencies detected.

**Key Separation:**
- Components don't import from store directly (use hooks)
- Store doesn't import from components
- Utilities are dependency-free
- Selectors only import types and utilities

---

## 8. STYLE ORGANIZATION

### Status: GOOD

**Structure:**
```
/src/
├── App.css
├── styles/
│   ├── themes/        (theme CSS/variables)
│   └── tokens/        (design tokens)
└── [components]/
    └── [Component].module.css  (scoped styles)
```

**CSS Modules:** Every component has associated `.module.css` file (✅ good practice)

---

## 9. TEST ORGANIZATION

### Status: GOOD with Size Concerns

**Coverage:**
- Component tests: `.test.tsx` alongside components (✅)
- Redux tests: `.test.ts` alongside slices (✅)
- Utility tests: `.test.ts` alongside utilities (✅)

**Issue 9.1a: Oversized Test Files**

**Priority:** MEDIUM

| Test File | Size | Lines per Test |
|-----------|------|----------------|
| import.test.ts | 1,158 | ~40 avg |
| patternEditorSlice.test.ts | 985 | ~15 avg |
| PatternEditor.test.tsx | 897 | ~20 avg |
| patternsSlice.test.ts | 803 | ~15 avg |

**Recommendation:**
- Split tests > 800 lines into multiple test suites
- Group related tests with `describe` blocks
- Use test utilities for setup/teardown

---

## 10. ADDITIONAL OBSERVATIONS

### 10.1 TODOs and Incomplete Features

**Found 6 TODO/FIXME comments:**

1. **TimelinePage.tsx** - "Handle quick input submission"
2. **usePatternShortcuts.ts** - "Implement join adjacent patterns"
3. **usePatternShortcuts.ts** - "Implement pattern label editing"
4. **usePatternShortcuts.ts** - "Implement color picker"
5. **song.ts selector** (2 instances) - "Get from song settings" (for beatsPerBar)

**Recommendation:** Create Linear issues for each TODO and track completion

---

### 10.2 Hook Dependencies

**Issue 10.2a: Complex Hook Dependencies**

The shortcuts orchestration hook has complex dependencies:
```typescript
// hooks/shortcuts/index.ts
useEffect(() => {
  // depends on:
  selectedClipIds,
  isEditingLane,
  clipShortcuts,
  viewShortcuts,
  laneShortcuts,
  navigationShortcuts,
}, [...]); // 6 dependencies
```

**Risk:** Changes to any shortcut hook re-run main effect.

**Recommendation:** Memoize shortcut handlers to prevent unnecessary re-renders

---

### 10.3 Large Test-to-Code Ratio

Some tests are significantly larger than their source:

| File | Source | Test | Ratio |
|------|--------|------|-------|
| patternEditorSlice | 5.8KB | 30.3KB | 5.2x |
| PatternRow | 13KB | 30KB | 2.3x |
| Track | 9.5KB | 25.5KB | 2.7x |

This is actually GOOD and shows solid test coverage, but suggests:
- Complex components that might benefit from refactoring
- Or tests that could be more concise

---

## RECOMMENDATIONS SUMMARY

### Critical Issues (Address First)

1. **songSlice timelineActions split** (930 lines → 4-5 files)
2. **Store import consistency** (use barrel exports, not direct `slice.ts`)
3. **Missing organism barrel exports** (4 components)

### High Priority

1. Large components > 350 lines need splitting (FileMenu, Pattern, Track, Minimap)
2. Large utilities: keyboard.ts split into subdirectory
3. Pattern data duplication between slices (verify source of truth)
4. Type definitions scattered across codebase (consolidate)

### Medium Priority

1. Large test files (split > 800 lines)
2. Hook files > 250 lines (split by domain)
3. Template relative imports → alias imports
4. Molecule barrel exports (6 missing)
5. Component export style (standardize: default vs named)
6. Debug console statements → logger utility

### Low Priority

1. Legacy constants.ts (deprecate/merge)
2. Naming consistency improvements
3. TODO/FIXME tracking
4. Create design system documentation

---

## METRICS SUMMARY

| Metric | Value | Status |
|--------|-------|--------|
| Total TypeScript Files | 260 | ✅ |
| Barrel Exports (Components) | 52/52 (including missing) | ⚠️ 90% (4 organisms + 6 molecules missing) |
| Component Count by Type | Atoms: 14, Molecules: 26, Organisms: 27 | ✅ Good |
| Largest Component | FileMenu (616 lines) | ⚠️ Consider splitting |
| Largest Hook | usePatternOperations (353 lines) | ⚠️ Consider splitting |
| Largest Utility | keyboard.ts (629 lines) | ⚠️ Consider splitting |
| Test Coverage | ~100+ test files | ✅ Good |
| Redux Slices | 14 slices | ✅ Good |
| Circular Dependencies | 0 detected | ✅ Good |
| Alias vs Relative Imports | ~85% alias / ~15% relative | ✅ Good |

---

## NEXT STEPS

1. Create Linear issues for each critical/high priority item
2. Start with songSlice refactoring (highest impact)
3. Add barrel exports to missing components
4. Document component architecture and guidelines
5. Establish maximum file size standards (e.g., 400 lines for components)

