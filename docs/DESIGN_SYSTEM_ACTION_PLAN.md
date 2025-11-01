# Design System Action Plan

**Created:** October 25, 2025
**Status:** Ready for Implementation
**Estimated Timeline:** 6-8 weeks

This document provides a concrete, step-by-step action plan based on the Design System Audit Report.

---

## Quick Summary

The Cyclone design system audit revealed:
- ✅ **Excellent token architecture** - well-designed, documented
- ❌ **Incomplete migration** - legacy files compete with new tokens
- ❌ **Inconsistent adoption** - 150+ hardcoded colors, 200+ hardcoded spacing values
- 📊 **Current token coverage:** 70% (target: 95%)

**Primary Goal:** Complete the migration to the token-based design system and eliminate all legacy patterns.

---

## Phase 1: Foundation Cleanup (Week 1-2)

### Goal: Establish single source of truth for tokens

### Task 1.1: Remove Legacy Theme Files ⚡ CRITICAL
**Effort:** 1 hour
**Risk:** Low (tokens already defined elsewhere)

```bash
# Verify tokens exist in new location
cat src/styles/tokens/colors.css | grep "color-bg:"
cat src/styles/tokens/spacing.css | grep "spacing-md:"

# If tokens confirmed, delete legacy files
rm src/styles/theme.css
rm src/styles/theme-modern.css

# Update main import (if exists)
# Check where these files are imported and replace with:
# @import './tokens/index.css';
# @import './themes/index.css';
```

**Files to Update:**
- `src/main.tsx` or `src/App.tsx` - Update CSS imports
- Any component directly importing theme.css or theme-modern.css

**Validation:**
```bash
npm run dev
# Verify all three themes still work
# Check: No console errors about missing variables
# Check: Theme switcher works correctly
```

---

### Task 1.2: Create ESLint/Stylelint Rules ⚡ CRITICAL
**Effort:** 2 hours
**Risk:** Low

Install dependencies:
```bash
npm install --save-dev stylelint stylelint-config-standard
```

Create `.stylelintrc.json`:
```json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "color-hex-case": "lower",
    "color-hex-length": "long",
    "custom-property-pattern": "^(primitive|color|spacing|font|border|shadow|glow|z|transition|duration|opacity|ease)-[a-z-]+$",
    "declaration-property-value-disallowed-list": {
      "/^(padding|margin|gap|width|height|top|left|right|bottom)$/": ["/^[0-9]+px$/"],
      "/^color$/": ["/^#[0-9a-fA-F]{3,6}$/"],
      "/^background(-color)?$/": ["/^#[0-9a-fA-F]{3,6}$/"]
    }
  }
}
```

Add to `package.json`:
```json
{
  "scripts": {
    "lint:css": "stylelint 'src/**/*.css' 'src/**/*.module.css'",
    "lint:css:fix": "stylelint 'src/**/*.css' 'src/**/*.module.css' --fix"
  }
}
```

**Validation:**
```bash
npm run lint:css
# Should show violations for hardcoded values
```

---

### Task 1.3: Audit Current Token Imports
**Effort:** 1 hour
**Risk:** Low

Create a script to check where tokens are imported:

```bash
# Find all files importing CSS
grep -r "@import" src/ | grep -E "\.(css|scss)"

# Find all files importing old theme files
grep -r "theme.css\|theme-modern.css" src/

# List expected imports:
# - src/main.tsx or src/App.tsx should import tokens/index.css
# - Components should NOT import tokens directly (cascade from root)
```

**Expected State:**
- Only 1-2 files import token files (at app root level)
- Components rely on CSS cascade
- No direct token imports in components

---

## Phase 2: Token Migration (Week 3-5)

### Goal: Remove all hardcoded values, use tokens exclusively

### Task 2.1: Remove Color Fallback Values 🔥 HIGH PRIORITY
**Effort:** 3-4 hours
**Risk:** Low (automated)

**Automated Script:**

Create `scripts/remove-color-fallbacks.sh`:
```bash
#!/bin/bash

# Remove color fallbacks: var(--color-primary, #00ff00) → var(--color-primary)
find src/components -name "*.css" -o -name "*.module.css" | while read file; do
  sed -i.bak -E 's/var\(--color-([^,]+),\s*#[0-9a-fA-F]{3,6}\)/var(--color-\1)/g' "$file"
  sed -i.bak -E 's/var\(--primitive-([^,]+),\s*#[0-9a-fA-F]{3,6}\)/var(--primitive-\1)/g' "$file"
done

echo "Backup files created with .bak extension"
echo "Review changes and delete .bak files when satisfied"
```

Run script:
```bash
chmod +x scripts/remove-color-fallbacks.sh
./scripts/remove-color-fallbacks.sh

# Review changes
git diff src/components/

# If satisfied, commit
git add .
git commit -m "Remove color token fallback values

- Remove 150+ hardcoded color fallbacks
- Trust CSS token cascade
- Improves theme switching reliability"

# Remove backup files
find src/components -name "*.bak" -delete
```

**Files Affected:** ~30 component files
**Lines Changed:** ~150-200

**Validation:**
```bash
# Verify no more fallbacks
grep -r "var(--color-[^)]*," src/components/ && echo "Still has fallbacks!" || echo "Clean!"

# Run app and test theme switching
npm run dev
```

---

### Task 2.2: Replace Hardcoded Spacing Values 🔥 HIGH PRIORITY
**Effort:** 8-10 hours (requires manual review)
**Risk:** Medium (visual changes possible)

**Manual Process (Per File):**

1. **Identify hardcoded values:**
```bash
# Generate list of files
grep -r -l -E "(padding|margin|gap|top|left|right|bottom):\s*[0-9]+px" src/components/ > spacing-audit.txt

# Example output: 42 files
cat spacing-audit.txt
```

2. **Create mapping table for common values:**

| Hardcoded | Token | Usage |
|-----------|-------|-------|
| `1px` | `var(--border-width-thin)` | Borders |
| `2px` | `var(--spacing-xs)` or `calc(var(--spacing-xs) / 2)` | Minimal spacing |
| `4px` | `var(--spacing-xs)` | Tight gaps |
| `6px` | `calc(var(--spacing-xs) + 2px)` | Button padding |
| `8px` | `var(--spacing-sm)` | Default gaps |
| `12px` | `var(--spacing-md)` | Panel padding |
| `16px` | `var(--spacing-md)` (retro) or `var(--spacing-lg)` (modern) | Section padding |

3. **Refactor priority files:**

**High Priority (Week 3):**
- `Pattern.module.css` (15 instances)
- `ConsoleInput.css` (12 instances)
- `LiveConsole.css` (10 instances)
- `Track.module.css` (8 instances)

**Medium Priority (Week 4):**
- All other organism components (10 files)

**Low Priority (Week 5):**
- Atom/Molecule components (18 files)

4. **Example Refactor:**

**Before:**
```css
.pattern {
  top: 2px;
  bottom: 2px;
  padding: 4px 8px;
}

.infoType {
  padding: 1px 4px;
}
```

**After:**
```css
.pattern {
  top: var(--spacing-xs);
  bottom: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
}

.infoType {
  padding: calc(var(--spacing-xs) / 4) var(--spacing-xs);
}
```

**Per-File Workflow:**
1. Open file in editor
2. Find all hardcoded spacing: `grep -E "[0-9]+px" filename.css`
3. Replace with tokens using mapping table
4. Test visually in both retro and modern themes
5. Commit file individually

**Validation (per file):**
```bash
# Check file has no hardcoded spacing
grep -E "(padding|margin|gap|top|left|right|bottom):\s*[0-9]+px" src/components/organisms/Pattern/Pattern.module.css

# If clean, commit
git add src/components/organisms/Pattern/Pattern.module.css
git commit -m "Refactor Pattern spacing to use design tokens"
```

---

### Task 2.3: Remove Primitive Token References 🔥 HIGH PRIORITY
**Effort:** 2-3 hours
**Risk:** Low

**Find all primitive token usage:**
```bash
grep -r -n "var(--primitive-" src/components/ > primitive-usage.txt
cat primitive-usage.txt
```

**Create semantic tokens for missing use cases:**

If components use primitives for valid reasons, create semantic tokens:

```css
/* In tokens/colors.css or tokens/effects.css */

/* Example: Track swap animation uses primitive-green-500 */
/* Instead of: color-mix(in srgb, var(--primitive-green-500) 80%, transparent) */
/* Create semantic token: */
:root {
  --color-swap-glow: color-mix(in srgb, var(--color-primary) 80%, transparent);
}
```

**Replace in components:**
```bash
# Find and replace pattern
# Before: var(--primitive-green-500)
# After: var(--color-primary)

# Or create new semantic token if needed
```

**Validation:**
```bash
# No primitive token usage in components
grep -r "var(--primitive-" src/components/ && echo "Still has primitives!" || echo "Clean!"
```

---

## Phase 3: Consistency & Patterns (Week 6-7)

### Goal: Standardize styling patterns across codebase

### Task 3.1: Create Shared Utilities
**Effort:** 4 hours
**Risk:** Low

Create `/src/styles/utilities.css`:
```css
/**
 * Cyclone Design System - Utility Classes
 * Reusable styling patterns to reduce duplication
 */

/* ========================================
   PHOSPHOR GLOW UTILITIES
   ======================================== */

.u-glow-sm {
  text-shadow: var(--phosphor-glow-sm);
}

.u-glow-md {
  text-shadow: var(--phosphor-glow-md);
}

.u-glow-lg {
  text-shadow: var(--phosphor-glow-lg);
}

.u-glow-hover {
  transition: text-shadow var(--transition-base);
}

.u-glow-hover:hover {
  text-shadow: var(--phosphor-glow-md);
}

/* ========================================
   TERMINAL INPUT STYLE
   ======================================== */

.u-terminal-input {
  background: var(--color-bg-elevated);
  border: var(--border-width-thin) solid var(--color-primary);
  color: var(--color-primary);
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  padding: var(--spacing-xs);
  outline: none;
  transition: var(--transition-border);
}

.u-terminal-input:focus {
  border-color: var(--color-highlight);
  box-shadow: var(--phosphor-glow-sm);
}

.u-terminal-input:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

/* ========================================
   LAYOUT UTILITIES
   ======================================== */

.u-flex {
  display: flex;
}

.u-flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.u-flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.u-flex-col {
  display: flex;
  flex-direction: column;
}

.u-flex-gap-xs { gap: var(--spacing-xs); }
.u-flex-gap-sm { gap: var(--spacing-sm); }
.u-flex-gap-md { gap: var(--spacing-md); }
.u-flex-gap-lg { gap: var(--spacing-lg); }

/* ========================================
   ACCESSIBILITY UTILITIES
   ======================================== */

.u-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.u-disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
  pointer-events: none;
}

/* ========================================
   GRID LINE UTILITY
   ======================================== */

.u-grid-line {
  background: var(--color-grid);
  opacity: 0.6;
  pointer-events: none;
}

/* ========================================
   THEME-SPECIFIC UTILITIES
   ======================================== */

/* Hide in modern theme */
.app.theme-modern .u-retro-only {
  display: none !important;
}

/* Hide in retro theme */
.app.theme-retro .u-modern-only {
  display: none !important;
}
```

Import in `src/styles/tokens/index.css`:
```css
@import './colors.css';
@import './typography.css';
@import './spacing.css';
@import './effects.css';
@import './z-index.css';
@import '../utilities.css'; /* Add utilities */
```

**Validation:**
```bash
# Test utility classes work
npm run dev
# Apply .u-terminal-input to an input element
```

---

### Task 3.2: Refactor High-Traffic Components to Use Utilities
**Effort:** 6 hours
**Risk:** Low

**Priority Components:**
1. `ConsoleInput.css` → Use `.u-terminal-input`
2. `Track.module.css` → Use `.u-flex-between`, `.u-glow-sm`
3. `Pattern.module.css` → Use `.u-glow-hover`
4. `CommandPalette.css` → Use `.u-flex-col`, `.u-flex-gap-md`

**Example Refactor:**

**Before (ConsoleInput.css):**
```css
.input {
  background: var(--color-bg-elevated);
  border: var(--border-width-thin) solid var(--color-primary);
  color: var(--color-primary);
  font-family: var(--font-primary);
  padding: var(--spacing-xs);
  outline: none;
}

.input:focus {
  border-color: var(--color-highlight);
  box-shadow: var(--phosphor-glow-sm);
}
```

**After (ConsoleInput.tsx):**
```tsx
<input className="u-terminal-input" />
```

**Estimated Savings:**
- 15 components using terminal input style
- ~10 lines per component
- **Total: ~150 lines of CSS removed**

---

### Task 3.3: CSS Modules Migration Plan
**Effort:** 10+ hours (deferred to Phase 4)
**Risk:** High (structural changes)

**Scope:** Convert 48 plain CSS files to CSS Modules

**Recommended Approach:**
- Defer to Phase 4 (after token migration complete)
- Start with new components only
- Gradually migrate existing components as they're updated
- Document migration pattern

**Not critical for Phase 3** - focus on token usage first.

---

## Phase 4: Testing & Validation (Week 8)

### Goal: Ensure design system works reliably across all themes

### Task 4.1: Theme Switching Visual Tests
**Effort:** 4 hours
**Risk:** Low

Create Playwright test for theme switching:

`tests/theme-switching.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('should switch between all three themes', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Test retro theme (default)
    await expect(page.locator('.app')).toHaveClass(/theme-retro/);
    const retroBg = await page.locator('body').evaluate(el =>
      getComputedStyle(el).backgroundColor
    );
    expect(retroBg).toBe('rgb(0, 0, 0)'); // #000000

    // Switch to modern theme
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.locator('[data-testid="theme-modern"]').click();
    await expect(page.locator('.app')).toHaveClass(/theme-modern/);
    const modernBg = await page.locator('body').evaluate(el =>
      getComputedStyle(el).backgroundColor
    );
    expect(modernBg).toBe('rgb(28, 28, 28)'); // #1c1c1c

    // Switch to minimalist theme
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.locator('[data-testid="theme-minimalist"]').click();
    await expect(page.locator('.app')).toHaveClass(/theme-minimalist/);
    const minimalBg = await page.locator('body').evaluate(el =>
      getComputedStyle(el).backgroundColor
    );
    expect(minimalBg).toBe('rgb(255, 255, 255)'); // #ffffff
  });

  test('should apply theme-specific colors to components', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Check pattern border color in retro theme
    const patternRetro = page.locator('.pattern').first();
    const retroBorderColor = await patternRetro.evaluate(el =>
      getComputedStyle(el).borderColor
    );
    expect(retroBorderColor).toContain('0, 255, 0'); // green

    // Switch to modern
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.locator('[data-testid="theme-modern"]').click();

    // Check pattern border color in modern theme
    const modernBorderColor = await patternRetro.evaluate(el =>
      getComputedStyle(el).borderColor
    );
    expect(modernBorderColor).not.toContain('0, 255, 0'); // NOT green
  });
});
```

Run tests:
```bash
npm run test:e2e
```

---

### Task 4.2: Create Design System Validation Script
**Effort:** 2 hours
**Risk:** Low

Create `scripts/validate-design-system.sh`:
```bash
#!/bin/bash

echo "🔍 Validating Cyclone Design System..."
echo ""

# Check 1: No hardcoded colors
echo "✓ Checking for hardcoded colors..."
COLOR_COUNT=$(grep -r "#[0-9a-fA-F]\{3,6\}" src/components/ | grep -v "var(--" | wc -l)
if [ $COLOR_COUNT -eq 0 ]; then
  echo "  ✅ No hardcoded colors found"
else
  echo "  ❌ Found $COLOR_COUNT hardcoded color values"
  grep -r "#[0-9a-fA-F]\{3,6\}" src/components/ | grep -v "var(--" | head -5
fi
echo ""

# Check 2: No primitive token usage in components
echo "✓ Checking for primitive token usage..."
PRIMITIVE_COUNT=$(grep -r "var(--primitive-" src/components/ | wc -l)
if [ $PRIMITIVE_COUNT -eq 0 ]; then
  echo "  ✅ No primitive tokens in components"
else
  echo "  ❌ Found $PRIMITIVE_COUNT primitive token references"
  grep -r "var(--primitive-" src/components/ | head -5
fi
echo ""

# Check 3: Legacy theme files removed
echo "✓ Checking for legacy theme files..."
if [ ! -f "src/styles/theme.css" ] && [ ! -f "src/styles/theme-modern.css" ]; then
  echo "  ✅ Legacy theme files removed"
else
  echo "  ❌ Legacy theme files still exist"
fi
echo ""

# Check 4: Token coverage
echo "✓ Checking token coverage..."
TOTAL_CSS=$(find src/components -name "*.css" -o -name "*.module.css" | wc -l)
WITH_TOKENS=$(grep -r -l "var(--color-\|var(--spacing-\|var(--font-" src/components/ | sort -u | wc -l)
COVERAGE=$(echo "scale=0; ($WITH_TOKENS * 100) / $TOTAL_CSS" | bc)
echo "  📊 Token coverage: $COVERAGE% ($WITH_TOKENS/$TOTAL_CSS files)"
if [ $COVERAGE -ge 95 ]; then
  echo "  ✅ Excellent coverage!"
elif [ $COVERAGE -ge 80 ]; then
  echo "  ⚠️  Good coverage, aim for 95%"
else
  echo "  ❌ Low coverage, needs work"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $COLOR_COUNT -eq 0 ] && [ $PRIMITIVE_COUNT -eq 0 ] && [ $COVERAGE -ge 95 ]; then
  echo "✅ Design System Validation: PASSED"
  exit 0
else
  echo "❌ Design System Validation: FAILED"
  exit 1
fi
```

Run validation:
```bash
chmod +x scripts/validate-design-system.sh
./scripts/validate-design-system.sh
```

Add to CI/CD:
```yaml
# .github/workflows/ci.yml
- name: Validate Design System
  run: ./scripts/validate-design-system.sh
```

---

### Task 4.3: Update Documentation
**Effort:** 2 hours
**Risk:** Low

Update `DESIGN_SYSTEM_README.md`:
```markdown
# Quick Start - Using the Design System

## For Developers

### 1. Colors
Always use semantic color tokens:
```css
/* ✅ Good */
color: var(--color-primary);
background: var(--color-bg-elevated);
border-color: var(--color-border);

/* ❌ Bad */
color: #00ff00;
color: var(--primitive-green-500); /* Don't use primitives */
color: var(--color-primary, #00ff00); /* Don't use fallbacks */
```

### 2. Spacing
Use the spacing scale:
```css
/* ✅ Good */
padding: var(--spacing-md);
gap: var(--spacing-sm);
margin-top: var(--spacing-xl);

/* ❌ Bad */
padding: 16px;
gap: 8px;
```

### 3. Utilities
Use shared utility classes when possible:
```tsx
// ✅ Good
<input className="u-terminal-input" />

// ❌ Bad - duplicating styles
<input style={{ background: 'var(--color-bg)', border: '...' }} />
```

## Checklist for New Components

- [ ] Uses CSS Modules (.module.css)
- [ ] All colors use semantic tokens (--color-*)
- [ ] All spacing uses spacing tokens (--spacing-*)
- [ ] No hardcoded pixel values
- [ ] No primitive token references (--primitive-*)
- [ ] Uses utility classes where appropriate
- [ ] Tested in all three themes
- [ ] Respects prefers-reduced-motion
```

---

## Success Metrics

### Before Refactor (Current State)
- ❌ Token Coverage: **70%**
- ❌ Hardcoded Colors: **150+ instances**
- ❌ Hardcoded Spacing: **200+ instances**
- ❌ Primitive References: **30+ instances**
- ❌ Legacy Files: **2 files (theme.css, theme-modern.css)**

### After Refactor (Target State)
- ✅ Token Coverage: **95%+**
- ✅ Hardcoded Colors: **0 instances**
- ✅ Hardcoded Spacing: **<10 instances (documented exceptions)**
- ✅ Primitive References: **0 instances in components**
- ✅ Legacy Files: **0 files**
- ✅ Utility Classes: **Created and documented**
- ✅ Theme Tests: **Automated visual regression**

---

## Weekly Checklist

### Week 1-2: Foundation
- [ ] Remove theme.css and theme-modern.css
- [ ] Update imports in main app file
- [ ] Install and configure Stylelint
- [ ] Create validation script
- [ ] Run validation baseline

### Week 3: Color Migration
- [ ] Run color fallback removal script
- [ ] Test theme switching
- [ ] Remove primitive token refs
- [ ] Commit changes

### Week 4-5: Spacing Migration
- [ ] Refactor Pattern.module.css
- [ ] Refactor ConsoleInput.css
- [ ] Refactor LiveConsole.css
- [ ] Refactor Track.module.css
- [ ] Refactor 10 organism components
- [ ] Test visually in both themes

### Week 6-7: Utilities & Consistency
- [ ] Create utilities.css
- [ ] Refactor 15 components to use utilities
- [ ] Document common patterns
- [ ] Create component styling guide

### Week 8: Testing & Validation
- [ ] Create Playwright theme tests
- [ ] Run validation script
- [ ] Update documentation
- [ ] Final review and sign-off

---

## Risk Mitigation

### Risk: Visual Regressions
**Mitigation:**
- Test each component in all themes before committing
- Use screenshot comparison for critical components
- Staged rollout (per-component commits)

### Risk: Breaking Changes
**Mitigation:**
- Comprehensive testing after each phase
- Rollback plan (Git revert)
- Incremental changes with frequent commits

### Risk: Time Overruns
**Mitigation:**
- Prioritize critical files first
- Accept technical debt for low-traffic components
- Document deferred work for future sprints

---

## Communication Plan

### Daily Standup
- Report files refactored
- Highlight blockers
- Share validation results

### Weekly Demo
- Show before/after comparisons
- Demonstrate theme switching improvements
- Share metrics progress

### Final Presentation
- Document learnings
- Share best practices
- Update team style guide

---

## Support Resources

**Documentation:**
- `/DESIGN_SYSTEM_AUDIT_REPORT.md` - Full audit findings
- `/CYCLONE_DESIGN_SYSTEM.md` - Design system reference
- `/DESIGN_TOKENS_REFERENCE.md` - Token quick lookup

**Scripts:**
- `/scripts/remove-color-fallbacks.sh` - Automated color cleanup
- `/scripts/validate-design-system.sh` - Validation checks

**Questions?**
- Refer to design system documentation
- Check audit report for examples
- Consult UX team for design decisions

---

**End of Action Plan**

*Ready to begin? Start with Phase 1, Task 1.1: Remove Legacy Theme Files*
