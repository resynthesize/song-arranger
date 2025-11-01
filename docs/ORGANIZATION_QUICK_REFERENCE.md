# Cyclone Codebase Organization - Quick Reference

## Critical Issues (Must Fix First)

### 1. timelineActions.ts - 930 Lines (HIGHEST PRIORITY)
**Location:** `/src/store/slices/songSlice/timelineActions.ts`
**Issue:** Single file with 50+ reducer functions mixing patterns, tracks, and steps
**Action:** Split into 4 files:
```
/src/store/slices/songSlice/actions/
├── patternActions.ts     (move, resize, duplicate, split, trim)
├── trackActions.ts       (add, remove, reorder, rename, color)
├── sceneActions.ts       (create, delete, update)
├── stepActions.ts        (updateStepValue, updateStepNote, toggleGate)
└── index.ts              (barrel export)
```
**Impact:** Improves maintainability, testability, modularity

---

### 2. Store Import Inconsistency
**Location:** `/src/store/store.ts` line 21
**Issue:** Imports from `'./slices/songSlice/slice'` instead of barrel export
```typescript
// ❌ Current (bypasses barrel export)
import songReducer from './slices/songSlice/slice';

// ✅ Should be:
import songReducer from './slices/songSlice';
```
**Files to Update:** `store.ts` and any direct `songSlice/slice` imports
**Impact:** Consistency with Redux best practices

---

### 3. Missing Component Barrel Exports (10 Components)
**Organisms Missing (4):**
- CirklonExportDialog
- LiveConsole  
- SongDataViewer
- StatusLine

**Molecules Missing (6):**
- BarNavigation
- ConsoleAutocomplete
- PatternEditorHeader
- StepValueEditor
- TrackHeaderResizeHandle
- TrackResizeHandle

**Action:** Create `index.ts` in each directory
```typescript
// Example: /src/components/organisms/CirklonExportDialog/index.ts
export { default } from './CirklonExportDialog';
export type { CirklonExportDialogProps } from './CirklonExportDialog';
```
**Impact:** Consistent import patterns across codebase

---

## High Priority Issues

### 4. Large Components (Need Splitting > 350 lines)
| Component | Lines | Action |
|-----------|-------|--------|
| FileMenu.tsx | 616 | Extract menu items into sub-components |
| Pattern.tsx | 385 | Extract visualization logic |
| Track.tsx | 373 | Extract grid canvas & header handling |
| Minimap.tsx | 354 | Split display & interaction logic |

### 5. Large Utilities (keyboard.ts - 629 lines)
**Location:** `/src/utils/keyboard.ts`
**Solution:** Split into subdirectory
```
/src/utils/keyboard/
├── types.ts          (KeyboardAction, KeyboardShortcut, KeyboardContext)
├── registry.ts       (getAllShortcuts, getShortcutsForContext)
├── matching.ts       (matchesShortcut, findMatchingShortcut)
├── formatting.ts     (formatShortcut)
└── index.ts          (barrel export)
```

### 6. Type Definition Consolidation
**Current Scattering:**
- `/src/types/` - UI types
- `/src/utils/cirklon/types.ts` - Cirklon types
- Redux slices - State interfaces
- Components - Props interfaces

**Solution:**
```
/src/types/
├── index.ts              (UI/Timeline types)
├── patternData.ts
├── redux/
│   ├── state.ts          (all Redux state types)
│   ├── selectors.ts
│   └── index.ts
├── cirklon/              (moved from utils)
│   ├── song.ts
│   ├── pattern.ts
│   └── index.ts
└── components/           (or keep component-local)
```

---

## Medium Priority Issues

### 7. Large Hook Files (> 250 lines)
- `usePatternOperations.ts` (353 lines) - Split by operation type
- `useNavigationShortcuts.ts` (254 lines) - Consider combining with other shortcuts
- `usePatternShortcuts.ts` (242 lines) - Close to limit

### 8. Large Test Files (> 800 lines)
- `import.test.ts` (1,158 lines) - Split into import.basic.test.ts, import.validation.test.ts, etc.
- `patternEditorSlice.test.ts` (985 lines) - Split by reducer domain
- `PatternEditor.test.tsx` (897 lines) - Split by feature tested
- `patternsSlice.test.ts` (803 lines) - Split into separate suites

### 9. Template Import Style (TimelineTemplate.tsx)
**Issue:** Uses relative imports instead of aliases
```typescript
// ❌ Current
import MenuBar from '../../organisms/MenuBar';

// ✅ Should be:
import MenuBar from '@/components/organisms/MenuBar';
```

### 10. Pattern Data in Multiple Slices
**Current:**
- `songSlice` - CKS format (source of truth)
- `patternsSlice` - Timeline Pattern objects
- `patternEditorSlice` - Editor UI state

**Verify:** All pattern reads use `selectAllPatterns` selector (not direct slice access)

---

## Low Priority Issues

### 11. Debug Statements (95 console logs)
**Action:** Replace with logger utility
```typescript
// ❌ Current
console.log('Pattern created:', patternId);

// ✅ Should be:
import { logger } from '@/utils/debug';
logger.debug('Pattern created:', patternId);
```

### 12. Legacy Constants File
**Location:** `/src/constants.ts`
**Issue:** Re-exports from newer `/src/constants/` directory
**Action:** Either deprecate or merge into `/src/constants/index.ts`

### 13. Component Export Style Inconsistency
```typescript
// Mixed patterns
export { default as Timeline } from './Timeline/Timeline';  // default
export { Track } from './Track';                            // named
export { Pattern } from './Pattern';                        // named
```
**Recommendation:** Standardize on named exports

---

## File Size Guidelines (Recommendations)

| Type | Recommended Max | Current Violations |
|------|-----------------|-------------------|
| Component | 350 lines | 4 organisms over limit |
| Hook | 250 lines | 3 hooks over limit |
| Utility | 300 lines | 1 utility (keyboard.ts) |
| Test | 800 lines | 4 tests over limit |
| Redux Action | 100 lines per action | timelineActions mixes many |

---

## Import Consistency Summary

**Current State:**
- ✅ 85% use alias imports (`@/`)
- ⚠️ 15% use relative imports (`../../`)
- ⚠️ One direct `slice.ts` import in store.ts

**Target:** 100% alias imports (except direct slice imports in store.ts)

---

## Testing Organization Summary

**Good:**
- Tests colocated with source files
- Comprehensive test coverage
- Good use of describe blocks

**Needs Work:**
- Split tests > 800 lines
- Some tests have complex setup

---

## Refactoring Priority Order

1. **Week 1:** timelineActions split (highest impact)
2. **Week 1:** Store import consistency
3. **Week 2:** Add missing barrel exports (10 components)
4. **Week 2:** Split large components > 350 lines
5. **Week 3:** Refactor keyboard.ts
6. **Week 3:** Consolidate type definitions
7. **Week 4:** Split large test files
8. **Week 4:** Clean up remaining issues

---

## Validation Checklist

After implementing changes, verify:
- [ ] All TypeScript compiles without errors
- [ ] All tests pass (`npm test`)
- [ ] No circular dependency warnings
- [ ] No unused imports
- [ ] Consistent import patterns across codebase
- [ ] All components have barrel exports
- [ ] Component file sizes < 350 lines
- [ ] No console.log statements (use logger)
- [ ] Redux state properly typed

---

## Related Documentation

See `CODEBASE_ORGANIZATION_AUDIT.md` for detailed analysis including:
- Complete list of issues with examples
- Detailed metrics and statistics
- Comprehensive recommendations
- Code examples for each issue
