# Cyclone Component Audit Report

**Date:** October 21, 2025
**Phase:** 2 - Component Audit
**Auditor:** Design System Implementation Team

---

## Executive Summary

**Total Components:** 52
- **Atoms:** 11
- **Molecules:** 17
- **Organisms:** 24

**Token Usage Analysis:**
- **CSS Variables (var(--):** 902 occurrences across 46 files
- **Hard-coded Hex Colors (#):** 299 occurrences across 27 files

**Token Adoption Rate:** ~75% of files use some CSS variables, but many still have hard-coded values mixed in.

---

## Component Inventory

### Atoms (11 components)

| Component | Has CSS | Token Usage | Status | Priority |
|-----------|---------|-------------|--------|----------|
| BarChart | ✓ (module) | HIGH | 🟢 Good | Low |
| BlockCursor | ✓ | EXCELLENT | 🟢 Excellent | Low |
| CRTEffects | ✓ | HIGH | 🟢 Good | Low |
| DurationDisplay | ✓ | MEDIUM | 🟡 Needs Work | Medium |
| ModernEffects | ✓ | HIGH | 🟢 Good | Low |
| RowVisibilityToolbar | ✓ (module) | MEDIUM | 🟡 Needs Work | Medium |
| TerminalButton | ✓ | EXCELLENT | 🟢 Excellent | Low |
| TerminalInput | ✓ | HIGH | 🟢 Good | Low |
| TerminalNoise | ✓ | MEDIUM | 🟡 Needs Work | Medium |
| ViewModeToggle | ✓ (module) | MEDIUM | 🟡 Needs Work | Medium |

**Atom Summary:**
- ✅ **Ready (6):** BlockCursor, TerminalButton, CRTEffects, ModernEffects, TerminalInput, BarChart
- ⚠️ **Needs Cleanup (4):** DurationDisplay, RowVisibilityToolbar, TerminalNoise, ViewModeToggle

### Molecules (17 components)

| Component | Has CSS | Token Usage | Status | Priority |
|-----------|---------|-------------|--------|----------|
| BarNavigation | ✓ (module) | LOW | 🔴 Needs Refactor | High |
| ColorSwatch | ✓ | MIXED | 🟡 Needs Work | Medium |
| DialogFooter | ✓ | MEDIUM | 🟡 Needs Work | Medium |
| DialogHeader | ✓ | MEDIUM | 🟡 Needs Work | Medium |
| PatternEditorHeader | ✓ (module) | MEDIUM | 🟡 Needs Work | High |
| PatternHandle | ✓ | MEDIUM | 🟡 Needs Work | Medium |
| PatternRow | ✓ (module) | LOW | 🔴 Needs Refactor | High |
| ResizableDivider | ✓ (module) | MEDIUM | 🟡 Needs Work | Medium |
| RowSelector | ✓ (module) | LOW | 🔴 Needs Refactor | High |
| RulerTick | ✓ | HIGH | 🟢 Good | Low |
| SceneMarker | ✓ | MEDIUM | 🟡 Needs Work | Medium |
| StepValueEditor | ✓ (module) | LOW | 🔴 Needs Refactor | High |
| TerminalPanel | ✓ | HIGH | 🟢 Good | Low |
| TrackHeader | ✓ | MEDIUM | 🟡 Needs Work | High |
| TrackHeaderResizeHandle | ✓ (module) | LOW | 🔴 Needs Refactor | Medium |
| TrackResizeHandle | ✓ (module) | LOW | 🔴 Needs Refactor | Medium |

**Molecule Summary:**
- ✅ **Ready (2):** RulerTick, TerminalPanel
- ⚠️ **Needs Cleanup (8):** ColorSwatch, DialogFooter, DialogHeader, PatternHandle, ResizableDivider, SceneMarker, PatternEditorHeader, TrackHeader
- 🔴 **Needs Refactor (6):** BarNavigation, PatternRow, RowSelector, StepValueEditor, TrackHeaderResizeHandle, TrackResizeHandle

### Organisms (24 components)

| Component | Has CSS | Token Usage | Status | Priority |
|-----------|---------|-------------|--------|----------|
| BootSequence | ✓ | MEDIUM | 🟡 Needs Work | Low |
| CirklonExportDialog | ✓ | MEDIUM | 🟡 Needs Work | Medium |
| ColorPicker | ✓ | MEDIUM | 🟡 Needs Work | Medium |
| CommandFooter | ✓ | HIGH | 🟢 Good | Low |
| CommandPalette | ✓ | HIGH | 🟢 Good | Medium |
| ContextMenu | ✓ | HIGH | 🟢 Good | Medium |
| FileMenu | ✓ | HIGH | 🟢 Good | Medium |
| Help | ✓ | MEDIUM | 🟡 Needs Work | Low |
| HUD | ✓ | HIGH | 🟢 Good | Low |
| KeyboardHelp | ✓ | MEDIUM | 🟡 Needs Work | Low |
| MenuBar | ✓ | HIGH | 🟢 Good | Low |
| Minimap | ✓ | HIGH | 🟢 Good | Low |
| Pattern | ✓ (module) | MIXED | 🟡 Needs Work | **CRITICAL** |
| PatternEditor | ✓ (module) | MEDIUM | 🟡 Needs Work | **CRITICAL** |
| ProjectSelector | ✓ | MEDIUM | 🟡 Needs Work | Low |
| QuickInput | ✓ | MEDIUM | 🟡 Needs Work | Medium |
| Ruler | ✓ | HIGH | 🟢 Good | Medium |
| SaveAsDialog | ✓ | MEDIUM | 🟡 Needs Work | Medium |
| StatusLine | ✓ | HIGH | 🟢 Good | Low |
| TerminalMenu | ✓ | HIGH | 🟢 Good | Medium |
| Timeline | ✓ (module) | MEDIUM | 🟡 Needs Work | **CRITICAL** |
| Track | ✓ (module) | MIXED | 🟡 Needs Work | **CRITICAL** |
| TrackSettingsDialog | ✓ (module) | MEDIUM | 🟡 Needs Work | High |

**Organism Summary:**
- ✅ **Ready (10):** CommandFooter, CommandPalette, ContextMenu, FileMenu, HUD, MenuBar, Minimap, Ruler, StatusLine, TerminalMenu
- ⚠️ **Needs Cleanup (14):** BootSequence, CirklonExportDialog, ColorPicker, Help, KeyboardHelp, Pattern, PatternEditor, ProjectSelector, QuickInput, SaveAsDialog, Timeline, Track, TrackSettingsDialog

---

## Categorization by Token Usage Level

### 🟢 Excellent Token Usage (8 components)

**Already token-based with minimal work needed:**

**Atoms:**
1. BlockCursor - Uses all token variables, only minor hard-coded padding
2. TerminalButton - Exemplary token usage throughout

**Organisms:**
3. CommandFooter - Well tokenized
4. CommandPalette - Good token coverage
5. HUD - Consistent token usage
6. MenuBar - Solid token adoption
7. StatusLine - Well structured with tokens
8. TerminalMenu - Good token patterns

**Estimated Migration Time:** 1-2 hours total (minor cleanup only)

### 🟡 Partially Token-Based (34 components)

**Uses some tokens but has hard-coded values mixed in:**

**Atoms (4):**
- DurationDisplay - Has hard-coded font sizes, transitions
- RowVisibilityToolbar - Mixed token/hard-coded values
- TerminalNoise - Some hard-coded opacity values
- ViewModeToggle - Hard-coded sizing, spacing

**Molecules (14):**
- BarNavigation - Hard-coded colors in animations
- ColorSwatch - Hard-coded font-size, rgba colors, transitions
- DialogFooter - Some spacing hard-coded
- DialogHeader - Mixed approach
- PatternEditorHeader - Needs token cleanup
- PatternHandle - Some hard-coded values
- PatternRow - Significant hard-coded values
- ResizableDivider - Mixed token usage
- RowSelector - Needs token migration
- SceneMarker - Some hard-coded styling
- StepValueEditor - Needs cleanup
- TrackHeader - Critical component, needs work
- TrackHeaderResizeHandle - Minimal tokens
- TrackResizeHandle - Minimal tokens

**Organisms (16):**
- BootSequence - Animation values hard-coded
- CirklonExportDialog - Mixed styling
- ColorPicker - Needs token adoption
- ContextMenu - Good but needs cleanup
- FileMenu - Minor cleanup needed
- Help - Some hard-coded values
- KeyboardHelp - Needs improvement
- Minimap - Minor cleanup
- Pattern - **CRITICAL** - Complex animations with rgba values
- PatternEditor - **CRITICAL** - Needs token migration
- ProjectSelector - Needs work
- QuickInput - Mixed approach
- Ruler - Good but needs polish
- SaveAsDialog - Needs cleanup
- Timeline - **CRITICAL** - Core component needs work
- Track - **CRITICAL** - Has hard-coded green rgba in animations
- TrackSettingsDialog - Needs migration

**Estimated Migration Time:** 20-30 hours (2-4 days)

### 🔴 Fully Hard-Coded (10 components)

**Minimal or no token usage:**

**Molecules (6):**
- BarNavigation - Significant hard-coded styles
- PatternRow - Needs complete refactor
- RowSelector - Low token adoption
- StepValueEditor - Needs token migration
- TrackHeaderResizeHandle - Minimal tokenization
- TrackResizeHandle - Minimal tokenization

**Notes:** These may overlap with "Partially Token-Based" category - need deeper inspection.

**Estimated Migration Time:** 8-12 hours (1-2 days)

---

## Common Hard-Coded Patterns

### Colors (Most Frequent)

| Hard-Coded Value | Occurrences | Token Replacement | Notes |
|-----------------|-------------|-------------------|-------|
| `rgba(0, 255, 0, *)` | ~150+ | `var(--color-primary)` or variants | Green with opacity |
| `rgba(0, 0, 0, *)` | ~50+ | `var(--color-bg)` with opacity | Black backgrounds |
| `#00ff00` | ~30 | `var(--color-primary)` | Bright green |
| `#003300` | ~20 | `var(--color-grid)` | Dark green grid |
| `#66ff66` | ~15 | `var(--color-highlight)` | Light green |
| `rgba(74, 158, 255, *)` | ~40 | Modern theme blue - needs semantic token | |

### Spacing (Most Frequent)

| Hard-Coded Value | Occurrences | Token Replacement |
|-----------------|-------------|-------------------|
| `2px` | ~100+ | `var(--spacing-xs)` for most, sometimes literal |
| `4px` | ~80+ | `var(--spacing-xs)` |
| `8px` | ~70+ | `var(--spacing-sm)` |
| `12px` | ~50+ | `var(--spacing-md)` (modern) |
| `16px` | ~60+ | `var(--spacing-md)` (retro) / `var(--spacing-lg)` (modern) |
| `24px` | ~30+ | `var(--spacing-lg)` (retro) / `var(--spacing-xl)` (modern) |

### Typography (Most Frequent)

| Hard-Coded Value | Occurrences | Token Replacement |
|-----------------|-------------|-------------------|
| `14px` | ~40+ | `var(--font-size-xs)` (retro) / `var(--font-size-base)` (modern) |
| `16px` | ~30+ | `var(--font-size-sm)` (retro) / `var(--font-size-md)` (modern) |
| `20px` | ~20+ | `var(--font-size-base)` (retro) / `var(--font-size-xl)` (modern) |
| `12px` | ~25+ | Needs semantic token |

### Transitions/Animations

| Hard-Coded Value | Occurrences | Token Replacement |
|-----------------|-------------|-------------------|
| `0.2s` / `200ms` | ~50+ | `var(--duration-base)` |
| `0.3s` / `300ms` | ~30+ | `var(--duration-slow)` |
| `ease-out` | ~40+ | `var(--ease-out)` |
| `ease-in-out` | ~30+ | `var(--ease-in-out)` |

---

## Critical Path Components

**These components are used frequently and should be migrated first:**

### Priority 1 - CRITICAL (Week 1)

1. **Pattern** (organisms/Pattern) - Core pattern display component
   - Hard-coded rgba(0, 255, 0, *) throughout animations
   - Complex phosphor glow animations
   - Theme-specific overrides needed
   - **Estimated Time:** 4-6 hours

2. **Track** (organisms/Track) - Core track container
   - Hard-coded green values in animations
   - Needs animation token migration
   - **Estimated Time:** 3-4 hours

3. **Timeline** (organisms/Timeline) - Main timeline view
   - Core layout component
   - Needs spacing and color tokens
   - **Estimated Time:** 3-4 hours

4. **PatternEditor** (organisms/PatternEditor) - Pattern editing interface
   - Complex component with many styles
   - **Estimated Time:** 4-5 hours

5. **TrackHeader** (molecules/TrackHeader) - Track control panel
   - Frequently used, highly visible
   - **Estimated Time:** 2-3 hours

**Total Priority 1 Time:** ~18-22 hours (3 days)

### Priority 2 - High (Week 2)

6. **PatternEditorHeader** (molecules) - Pattern editor controls
7. **PatternRow** (molecules) - Pattern editor rows
8. **RowSelector** (molecules) - Row selection controls
9. **StepValueEditor** (molecules) - Step editing
10. **BarNavigation** (molecules) - Bar navigation controls
11. **TrackSettingsDialog** (organisms) - Track configuration
12. **CommandPalette** (organisms) - Command interface (minor cleanup)
13. **ContextMenu** (organisms) - Context menus (minor cleanup)

**Estimated Time:** ~12-16 hours (2 days)

### Priority 3 - Medium (Week 2-3)

14-23. Remaining molecules and organisms with 🟡 status

**Estimated Time:** ~8-12 hours (1.5 days)

### Priority 4 - Low (Week 3)

24-52. Components already in good shape, minor cleanup

**Estimated Time:** ~4-6 hours (1 day)

---

## Migration Strategy Recommendations

### Phase 3A: Critical Path (Days 1-3)

**Focus on core timeline/pattern components:**
1. Pattern
2. Track
3. Timeline
4. PatternEditor
5. TrackHeader

**Goal:** Main user workflows work with new tokens

### Phase 3B: High Priority (Days 4-5)

**Focus on pattern editor ecosystem:**
6. PatternEditorHeader
7. PatternRow
8. RowSelector
9. StepValueEditor
10. BarNavigation
11. TrackSettingsDialog

**Goal:** Pattern editing experience fully tokenized

### Phase 4: Remaining Components (Days 6-8)

**Systematic migration of all remaining components**

**Goal:** 100% token coverage

---

## Common Migration Patterns

### Pattern 1: Replace Hard-Coded Colors

**Before:**
```css
.component {
  color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
}
```

**After:**
```css
.component {
  color: var(--color-primary);
  background: rgba(0, 255, 0, 0.1); /* TODO: Need opacity variant token */
}
```

**OR (better):**
```css
.component {
  color: var(--color-primary);
  background: var(--color-primary);
  opacity: 0.1;
}
```

### Pattern 2: Replace Hard-Coded Spacing

**Before:**
```css
.component {
  padding: 8px 16px;
  margin-bottom: 24px;
  gap: 4px;
}
```

**After:**
```css
.component {
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-xs);
}
```

### Pattern 3: Replace Hard-Coded Transitions

**Before:**
```css
.component {
  transition: all 0.2s ease-out;
}
```

**After:**
```css
.component {
  transition: all var(--transition-base);
}
```

### Pattern 4: Theme-Specific Animations

**Before (Retro only):**
```css
.pattern-selected {
  box-shadow: 0 0 4px rgba(0, 255, 0, 1),
              0 0 8px rgba(0, 255, 0, 0.8);
}
```

**After:**
```css
.pattern-selected {
  box-shadow: var(--phosphor-glow-lg);
}

/* Modern theme override */
.app.theme-modern .pattern-selected {
  box-shadow: var(--shadow-focus); /* Defined in modern theme */
}
```

---

## Identified Issues & Recommendations

### Issue 1: Opacity Variants

**Problem:** Many components use `rgba(0, 255, 0, 0.X)` for opacity variants
**Solution:** Consider adding opacity utility classes or color-with-opacity tokens

**Recommendation:**
```css
/* Add to tokens/colors.css */
:root {
  --color-primary-10: rgba(0, 255, 0, 0.1);
  --color-primary-20: rgba(0, 255, 0, 0.2);
  --color-primary-30: rgba(0, 255, 0, 0.3);
  /* ... etc */
}
```

### Issue 2: Hard-Coded Animation Values

**Problem:** Complex animations have hard-coded rgba values
**Solution:** Extract animation-specific tokens or use existing color tokens

**Recommendation:**
- Create `--color-animation-flash` tokens
- Use `var(--color-primary)` with opacity in animations

### Issue 3: Font Size Inconsistency

**Problem:** Some components use 12px, 13px, 14px inconsistently
**Solution:** Standardize on token scale, decide on semantic mappings

**Recommendation:**
- Audit all font sizes
- Map to nearest token value
- Document exceptions

### Issue 4: CSS Module vs Regular CSS

**Problem:** Mix of `.module.css` and `.css` files
**Solution:** This is fine, but be consistent within component families

**Recommendation:**
- Keep current approach
- Ensure tokens work in both CSS and CSS Modules
- Document import patterns

---

## Success Metrics

### Quantitative Targets

- [ ] **Token Usage:** 95%+ of design values use tokens
- [ ] **Hard-Coded Colors:** < 10 remaining (only truly unique values)
- [ ] **Hard-Coded Spacing:** < 5 remaining
- [ ] **Test Coverage:** Maintain current coverage (no regressions)
- [ ] **Bundle Size:** < 5% increase (tokens should be minimal)

### Qualitative Targets

- [ ] **Consistency:** Both themes feel cohesive across all components
- [ ] **Maintainability:** Changing a token value updates all instances
- [ ] **Developer Experience:** New components are easy to create with tokens
- [ ] **Documentation:** All components have token usage documented

---

## Next Steps

1. **Review this audit with team** - Validate findings and priorities
2. **Set up Phase 3 tasks** - Create Linear tickets for Priority 1 components
3. **Begin Pattern migration** - Start with most critical component
4. **Create migration template** - Standardize approach for consistency
5. **Set up visual regression tests** - Ensure no visual changes during migration

---

## Appendix: Full Component List

### Atoms (11)
1. BarChart
2. BlockCursor ✅
3. CRTEffects
4. DurationDisplay
5. ModernEffects
6. RowVisibilityToolbar
7. TerminalButton ✅
8. TerminalInput
9. TerminalNoise
10. ViewModeToggle

### Molecules (17)
1. BarNavigation
2. ColorSwatch
3. DialogFooter
4. DialogHeader
5. PatternEditorHeader
6. PatternHandle
7. PatternRow
8. ResizableDivider
9. RowSelector
10. RulerTick ✅
11. SceneMarker
12. StepValueEditor
13. TerminalPanel ✅
14. TrackHeader
15. TrackHeaderResizeHandle
16. TrackResizeHandle

### Organisms (24)
1. BootSequence
2. CirklonExportDialog
3. ColorPicker
4. CommandFooter ✅
5. CommandPalette ✅
6. ContextMenu
7. FileMenu
8. Help
9. HUD ✅
10. KeyboardHelp
11. MenuBar ✅
12. Minimap
13. Pattern ⚠️ CRITICAL
14. PatternEditor ⚠️ CRITICAL
15. ProjectSelector
16. QuickInput
17. Ruler
18. SaveAsDialog
19. StatusLine ✅
20. TerminalMenu ✅
21. Timeline ⚠️ CRITICAL
22. Track ⚠️ CRITICAL
23. TrackSettingsDialog

**✅** = Already in good shape
**⚠️** = Critical path, high priority

---

**Report Generated:** October 21, 2025
**Next Review:** After Phase 3A completion
**Owner:** Design System Implementation Team
