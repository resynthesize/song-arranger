# Cyclone Design System - Implementation Roadmap

**Version:** 1.0.0
**Last Updated:** October 21, 2025

This roadmap provides a practical, step-by-step plan for implementing the Cyclone Design System across the codebase, transitioning from ad-hoc design to a systematic, token-driven approach.

---

## Overview

**Current State:**
- 90+ unique color values scattered across components
- Mixed spacing values (px, rem, arbitrary)
- Inconsistent font sizes (9px - 48px range)
- Two themes with overlapping token definitions
- Some components already using CSS custom properties

**Target State:**
- ~15 consolidated semantic color tokens
- Systematic 4px/8px spacing scale
- Normalized type scales per theme
- Clear separation of theme-specific and shared tokens
- All components theme-agnostic
- Portable, reusable design system package

**Estimated Effort:** 2-3 weeks for full implementation

---

## Implementation Phases

### Phase 1: Foundation (Week 1, Days 1-2)

#### Objective
Establish token architecture and create base token files

#### Tasks

**1.1 Create Token Directory Structure**

```bash
mkdir -p src/styles/tokens
mkdir -p src/styles/themes
```

**1.2 Create Token Files**

Create `src/styles/tokens/colors.css`:
```css
/**
 * Cyclone Design Tokens - Colors
 * Primitive and semantic color definitions
 */

/* ============================================
   PRIMITIVE COLORS
   Raw color values - never use directly in components
   ============================================ */

:root {
  /* Green Palette (Retro) */
  --primitive-green-50: #ccffcc;
  --primitive-green-100: #66ff66;
  --primitive-green-300: #00ff00;
  --primitive-green-500: #00ff00;
  --primitive-green-700: #008800;
  --primitive-green-900: #006600;

  /* Gray Palette (Modern) */
  --primitive-gray-50: #ffffff;
  --primitive-gray-100: #e0e0e0;
  --primitive-gray-200: #b3b3b3;
  --primitive-gray-400: #808080;
  --primitive-gray-600: #666666;
  --primitive-gray-700: #404040;
  --primitive-gray-800: #333333;
  --primitive-gray-850: #2a2a2a;
  --primitive-gray-900: #1c1c1c;
  --primitive-gray-950: #000000;

  /* Blue Palette (Modern accents) */
  --primitive-blue-400: #4a9eff;
  --primitive-blue-500: #5aafff;

  /* Semantic Palette */
  --primitive-red-500: #ff0000;
  --primitive-red-400: #ff6b6b;
  --primitive-yellow-500: #ffff00;
  --primitive-orange-500: #ffa500;
  --primitive-black: #000000;
}

/* ============================================
   SEMANTIC COLORS - RETRO THEME (DEFAULT)
   Context-specific tokens that reference primitives
   ============================================ */

:root {
  /* Background Colors */
  --color-bg: var(--primitive-black);
  --color-bg-elevated: #001100;

  /* Text Colors */
  --color-primary: var(--primitive-green-500);
  --color-secondary: var(--primitive-green-700);
  --color-tertiary: var(--primitive-green-900);
  --color-highlight: var(--primitive-green-100);

  /* UI Colors */
  --color-grid: #003300;
  --color-dim: #004400;
  --color-disabled: #002200;

  /* Semantic Colors */
  --color-error: var(--primitive-red-500);
  --color-warning: var(--primitive-yellow-500);
}

/* ============================================
   SEMANTIC COLORS - MODERN THEME
   ============================================ */

.app.theme-modern {
  /* Background Colors */
  --color-bg: var(--primitive-gray-900);
  --color-bg-elevated: var(--primitive-gray-850);

  /* Text Colors */
  --color-primary: var(--primitive-gray-50);
  --color-secondary: var(--primitive-gray-200);
  --color-tertiary: var(--primitive-gray-400);
  --color-highlight: var(--primitive-blue-400);

  /* UI Colors */
  --color-grid: var(--primitive-gray-800);
  --color-dim: var(--primitive-gray-600);
  --color-disabled: var(--primitive-gray-700);

  /* Semantic Colors */
  --color-error: var(--primitive-red-400);
  --color-warning: var(--primitive-orange-500);
}
```

Create `src/styles/tokens/typography.css`
Create `src/styles/tokens/spacing.css`
Create `src/styles/tokens/effects.css`
Create `src/styles/tokens/z-index.css`
Create `src/styles/tokens/index.css` (imports all tokens)

**1.3 Create Theme Files**

Create `src/styles/themes/retro.css` - Retro-specific overrides
Create `src/styles/themes/modern.css` - Modern-specific overrides
Create `src/styles/themes/index.css` - Imports both themes

**1.4 Update Imports**

Update `src/main.tsx`:
```tsx
import './styles/tokens/index.css';
import './styles/themes/index.css';
import './styles/global.css';
```

**Deliverables:**
- [ ] Token directory structure created
- [ ] All token files created with complete definitions
- [ ] Theme files created
- [ ] Imports updated in main.tsx
- [ ] Verify tokens load in browser DevTools

**Success Criteria:**
- All tokens visible in browser CSS inspector
- No console errors
- Existing styles still work (tokens don't break anything yet)

---

### Phase 2: Component Audit (Week 1, Days 3-4)

#### Objective
Document all components and their current styling approach

#### Tasks

**2.1 Create Component Inventory**

Use this template:

```markdown
## Component Inventory

### Atoms
- [ ] TerminalButton - Uses custom properties ✓, needs token migration
- [ ] BlockCursor - Hard-coded colors, needs refactor
- [ ] CRTEffects - Theme-specific, already conditional
- [ ] ModernEffects - Theme-specific, already conditional
- [ ] DurationDisplay - Hard-coded sizing, needs tokens
- [ ] ...

### Molecules
- [ ] TerminalPanel - Mixed (some tokens, some hard-coded)
- [ ] PatternHandle - Hard-coded colors
- [ ] TrackHeader - Uses some tokens, needs cleanup
- [ ] ...

### Organisms
- [ ] Pattern - Complex, mixed approach, priority refactor
- [ ] Track - Partially tokenized
- [ ] Timeline - Needs spacing tokens
- [ ] ...
```

**2.2 Categorize Components**

Create three lists:

1. **Already Token-Based** - Minimal work needed
2. **Partially Token-Based** - Needs cleanup and completion
3. **Fully Hard-Coded** - Needs complete refactor

**2.3 Identify Token Usage Patterns**

Document common patterns:
```markdown
### Common Hard-Coded Values to Replace

| Current Value | Frequency | Token Replacement |
|--------------|-----------|-------------------|
| `#00ff00` | 47 occurrences | `var(--color-primary)` |
| `padding: 12px 16px` | 23 occurrences | `padding: var(--spacing-sm) var(--spacing-md)` |
| `font-size: 20px` | 18 occurrences | `font-size: var(--font-size-base)` |
```

**Deliverables:**
- [ ] Complete component inventory with status
- [ ] Categorized lists (token-based, partial, hard-coded)
- [ ] Token usage pattern document
- [ ] Migration priority order

**Success Criteria:**
- Clear understanding of refactor scope
- Priority order established
- Time estimates per component calculated

---

### Phase 3: Critical Path Migration (Week 1, Day 5 - Week 2, Day 2)

#### Objective
Migrate high-priority components to token-based system

#### Priority Order

1. **Core UI Components** (Day 5)
   - TerminalButton
   - Input elements
   - TerminalPanel

2. **Layout Components** (Day 6)
   - Pattern
   - Track
   - TrackHeader

3. **Navigation/Controls** (Week 2, Day 1)
   - MenuBar
   - CommandFooter
   - Ruler

4. **Complex Components** (Week 2, Day 2)
   - Timeline
   - PatternEditor
   - Minimap

#### Migration Process Per Component

**Step 1: Read Current Implementation**

```bash
# Review component file
cat src/components/atoms/TerminalButton/TerminalButton.css
```

**Step 2: Identify Hard-Coded Values**

Create checklist:
- [ ] Colors: `#00ff00` → `var(--color-primary)`
- [ ] Spacing: `12px` → `var(--spacing-md)`
- [ ] Font sizes: `20px` → `var(--font-size-base)`
- [ ] Shadows: `0 2px 4px rgba(...)` → `var(--shadow-md)`
- [ ] Transitions: `0.25s` → `var(--transition-base)`

**Step 3: Replace Values**

```css
/* Before */
.terminal-button {
  color: #00ff00;
  padding: 8px 16px;
  font-size: 20px;
  box-shadow: 0 2px 4px rgba(0, 255, 0, 0.3);
  transition: all 0.25s;
}

/* After */
.terminal-button {
  color: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}
```

**Step 4: Test Both Themes**

```tsx
// Test component in both themes
<div className="app theme-retro">
  <TerminalButton>Test</TerminalButton>
</div>

<div className="app theme-modern">
  <TerminalButton>Test</TerminalButton>
</div>
```

**Step 5: Update Tests**

```tsx
// Update snapshot tests if needed
test('renders with modern theme', () => {
  const { container } = render(
    <div className="app theme-modern">
      <TerminalButton>Click</TerminalButton>
    </div>
  );
  expect(container).toMatchSnapshot();
});
```

**Step 6: Document Changes**

Create migration log:
```markdown
### TerminalButton Migration

**Date:** 2025-10-22
**Status:** ✓ Complete
**Changes:**
- Replaced 5 color hard-codes with tokens
- Replaced 3 spacing values with tokens
- Replaced 1 font-size with token
- Added theme testing

**Breaking Changes:** None
**Visual Regression:** None detected
```

**Deliverables (Per Component):**
- [ ] All hard-coded values replaced with tokens
- [ ] Both themes tested visually
- [ ] Tests updated/passing
- [ ] Migration log entry created
- [ ] Peer review completed

**Success Criteria:**
- Component looks identical in both themes
- All tests pass
- No hard-coded design values remain

---

### Phase 4: Remaining Components (Week 2, Days 3-4)

#### Objective
Complete migration of all remaining components

#### Process

Apply same migration process to:
- All atoms not yet migrated
- All molecules not yet migrated
- All organisms not yet migrated
- Template and page components

**Batch Processing:**

Group similar components:
```bash
# Migrate all button-like components together
- TerminalButton ✓ (already done)
- ViewModeToggle
- ColorSwatch
- BarNavigation
```

**Deliverables:**
- [ ] All components migrated
- [ ] Migration log complete
- [ ] Visual regression testing completed
- [ ] Accessibility audit passed

---

### Phase 5: Documentation (Week 2, Day 5)

#### Objective
Create comprehensive documentation for developers

#### Tasks

**5.1 Component Documentation**

For each major component, create:

```markdown
# TerminalButton

## Usage

\`\`\`tsx
import { TerminalButton } from '@/components/atoms';

<TerminalButton
  variant="primary"
  size="md"
  onClick={handleClick}
>
  Submit
</TerminalButton>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `active` | `boolean` | `false` | Active/selected state |
| `fullWidth` | `boolean` | `false` | Stretch to container width |

## Theme Behavior

### Retro Terminal
- ASCII borders using box-drawing characters
- Multi-layer phosphor glow
- Glow intensity increases on hover
- Thicker borders (2px)

### Modern Minimal
- Solid borders, no ASCII characters
- No glow effects
- Subtle shadow on hover
- Thinner borders (1px)

## Accessibility

- Keyboard navigable (Tab, Enter, Space)
- ARIA attributes for screen readers
- Focus indicators meet WCAG AA (3:1 contrast)
- Respects `prefers-reduced-motion`

## Examples

### Primary Button
\`\`\`tsx
<TerminalButton variant="primary">Save</TerminalButton>
\`\`\`

### Secondary Button
\`\`\`tsx
<TerminalButton variant="secondary">Cancel</TerminalButton>
\`\`\`

### Active State
\`\`\`tsx
<TerminalButton active>Playing</TerminalButton>
\`\`\`
```

**5.2 Token Documentation**

Already completed:
- ✓ CYCLONE_DESIGN_SYSTEM.md
- ✓ DESIGN_TOKENS_REFERENCE.md
- ✓ THEME_COMPARISON_GUIDE.md

Additional needed:
- [ ] Token migration guide for contributors
- [ ] Theme customization guide
- [ ] Component pattern library

**5.3 Storybook/Component Showcase** (Optional)

If using Storybook:
```tsx
// TerminalButton.stories.tsx
export default {
  title: 'Atoms/TerminalButton',
  component: TerminalButton,
};

export const AllVariants = () => (
  <>
    <TerminalButton variant="primary">Primary</TerminalButton>
    <TerminalButton variant="secondary">Secondary</TerminalButton>
    <TerminalButton variant="ghost">Ghost</TerminalButton>
  </>
);

export const BothThemes = () => (
  <>
    <div className="theme-retro">
      <h3>Retro Theme</h3>
      <TerminalButton>Button</TerminalButton>
    </div>
    <div className="theme-modern">
      <h3>Modern Theme</h3>
      <TerminalButton>Button</TerminalButton>
    </div>
  </>
);
```

**Deliverables:**
- [ ] Component documentation for all major components
- [ ] Token migration guide for contributors
- [ ] Theme customization guide
- [ ] Storybook stories (if applicable)
- [ ] README.md update with design system references

---

### Phase 6: Package Creation (Week 3, Optional)

#### Objective
Make design system reusable across multiple projects

**Only pursue if:**
- Planning to create multiple Cyclone-themed applications
- Want to share design system with other developers
- Building a product family

#### Tasks

**6.1 Create Package Structure**

```bash
# Create new package directory
mkdir -p ../cyclone-design-system
cd ../cyclone-design-system

# Initialize package
npm init -y

# Create structure
mkdir -p src/{tokens,themes,components/{atoms,molecules,organisms},utils}
mkdir -p dist
mkdir -p docs
```

**6.2 Extract Tokens**

Copy token files to package:
```bash
cp -r ../song-arranger/src/styles/tokens/* src/tokens/
cp -r ../song-arranger/src/styles/themes/* src/themes/
```

**6.3 Extract Components**

For each reusable component:
```bash
# Copy component with all files
cp -r ../song-arranger/src/components/atoms/TerminalButton src/components/atoms/

# Remove app-specific dependencies
# Update imports to be package-relative
```

**6.4 Create Build Configuration**

```json
// package.json
{
  "name": "@cyclone/design-system",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "src"],
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./tokens": "./dist/tokens/index.css",
    "./themes/retro": "./dist/themes/retro.css",
    "./themes/modern": "./dist/themes/modern.css"
  },
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@rollup/plugin-typescript": "^11.0.0",
    "@types/react": "^18.0.0",
    "rollup": "^3.0.0",
    "rollup-plugin-postcss": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

**6.5 Publish to npm** (Optional)

```bash
npm login
npm publish --access public
```

**Deliverables:**
- [ ] Package structure created
- [ ] Components extracted and cleaned
- [ ] Build system configured
- [ ] Documentation written
- [ ] Published to npm (optional)

---

## Testing Strategy

### Visual Regression Testing

**Setup:**

```bash
npm install --save-dev @playwright/test
```

**Create test:**

```tsx
// tests/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test('TerminalButton - Retro Theme', async ({ page }) => {
  await page.goto('/storybook/?path=/story/atoms-terminalbutton--retro-theme');
  await expect(page).toHaveScreenshot('terminal-button-retro.png');
});

test('TerminalButton - Modern Theme', async ({ page }) => {
  await page.goto('/storybook/?path=/story/atoms-terminalbutton--modern-theme');
  await expect(page).toHaveScreenshot('terminal-button-modern.png');
});
```

**Run tests:**
```bash
npx playwright test --update-snapshots  # Generate initial snapshots
npx playwright test                     # Compare against snapshots
```

### Accessibility Testing

```tsx
// tests/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('TerminalButton meets WCAG AA', async ({ page }) => {
  await page.goto('/component/terminal-button');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Theme Switching Tests

```tsx
// tests/theme-switching.spec.ts
test('Theme switch updates all components', async ({ page }) => {
  await page.goto('/');

  // Verify initial theme
  const app = page.locator('.app');
  await expect(app).toHaveClass(/theme-retro/);

  // Switch theme
  await page.click('[data-testid="theme-toggle"]');

  // Verify new theme
  await expect(app).toHaveClass(/theme-modern/);

  // Check component updates
  const button = page.locator('.terminal-button').first();
  const styles = await button.evaluate(el =>
    window.getComputedStyle(el).getPropertyValue('--color-primary')
  );

  expect(styles.trim()).toBe('#ffffff'); // Modern theme primary
});
```

---

## Rollback Strategy

### If Issues Arise

**Immediate Rollback:**

```bash
# Revert to last stable commit
git revert HEAD
git push

# Or reset to specific commit
git reset --hard <commit-hash>
```

**Partial Rollback:**

```bash
# Revert specific component
git checkout <commit-hash> -- src/components/atoms/TerminalButton/

# Commit the revert
git commit -m "Revert TerminalButton to stable version"
```

**Feature Flag Approach:**

```tsx
// Enable/disable new design system
const USE_NEW_DESIGN_SYSTEM = process.env.REACT_APP_USE_NEW_DS === 'true';

// Conditionally import
const tokens = USE_NEW_DESIGN_SYSTEM
  ? import('./styles/tokens/index.css')
  : import('./styles/legacy/theme.css');
```

---

## Success Metrics

### Quantitative Metrics

- [ ] **Token Usage:** 95%+ of design values use tokens
- [ ] **Hard-Coded Values:** < 5 remaining (only truly unique values)
- [ ] **Test Coverage:** Maintain or improve existing coverage
- [ ] **Bundle Size:** No significant increase (< 5%)
- [ ] **Performance:** No regression in render times
- [ ] **Accessibility:** 100% WCAG AA compliance

### Qualitative Metrics

- [ ] **Developer Experience:** Easier to implement new components
- [ ] **Theme Consistency:** Both themes feel cohesive
- [ ] **Maintainability:** Changes to design tokens propagate correctly
- [ ] **Documentation:** New developers can understand system quickly
- [ ] **Portability:** Design system can be extracted to separate package

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1: Foundation** | 2 days | Token files, theme files, imports |
| **Phase 2: Audit** | 2 days | Component inventory, migration plan |
| **Phase 3: Critical Path** | 3 days | Core components migrated |
| **Phase 4: Remaining** | 2 days | All components migrated |
| **Phase 5: Documentation** | 1 day | Component docs, guides |
| **Phase 6: Package** (Optional) | 5 days | Standalone package published |

**Total:** 10-15 days (2-3 weeks)

---

## Next Steps

### Immediate Actions (Day 1)

1. Review this roadmap with team
2. Set up project board (Linear/GitHub Projects)
3. Create Phase 1 tasks in Linear
4. Begin token file creation

### First Week Goals

- Complete Phase 1 (Foundation)
- Complete Phase 2 (Audit)
- Begin Phase 3 (Critical Path)

### Success Checkpoints

**End of Week 1:**
- [ ] All token files exist and are functional
- [ ] Component audit complete
- [ ] 3-5 core components migrated

**End of Week 2:**
- [ ] All components migrated
- [ ] Visual regression tests passing
- [ ] Documentation complete

**End of Week 3 (if doing Phase 6):**
- [ ] Package created and published
- [ ] Integration guide written
- [ ] Example project created

---

## Resources

### Reference Documents

- [CYCLONE_DESIGN_SYSTEM.md](./CYCLONE_DESIGN_SYSTEM.md) - Complete design system spec
- [DESIGN_TOKENS_REFERENCE.md](./DESIGN_TOKENS_REFERENCE.md) - Token quick reference
- [THEME_COMPARISON_GUIDE.md](./THEME_COMPARISON_GUIDE.md) - Theme comparison

### External Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Atomic Design by Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [Design Tokens (W3C Draft)](https://design-tokens.github.io/community-group/format/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools

- **Color Contrast:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Accessibility:** [axe DevTools](https://www.deque.com/axe/devtools/)
- **Visual Regression:** [Playwright](https://playwright.dev/)
- **Documentation:** [Storybook](https://storybook.js.org/) (optional)

---

## FAQ

**Q: Will this break existing functionality?**
A: No. We're replacing hard-coded values with tokens that produce identical output. Changes are CSS-only with no logic changes.

**Q: How do I know which token to use?**
A: See [DESIGN_TOKENS_REFERENCE.md](./DESIGN_TOKENS_REFERENCE.md) for complete token list with usage guidelines.

**Q: What if I need a value that doesn't have a token?**
A: First check if an existing token is close enough. If truly unique, discuss with team before adding new token.

**Q: Can I still use hard-coded values?**
A: Only for truly component-specific values that will never be reused (very rare). Document why in comment.

**Q: How do I test theme switching?**
A: Add `className="app theme-modern"` to root div and verify component appearance. Also run automated theme tests.

**Q: Will this affect performance?**
A: Minimal impact. CSS custom properties are efficient. Main benefits are maintainability and consistency.

---

**Document Owner:** Design System Team
**Last Review:** 2025-10-21
**Next Review:** 2025-11-21 (or upon completion)
