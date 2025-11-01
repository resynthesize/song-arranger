# Cyclone Design System

**Version:** 1.0.0
**Last Updated:** October 21, 2025

---

## Executive Summary

This document defines the Cyclone Design System, a dual-theme UI framework for music sequencing applications. The design system supports two distinct visual modes:

1. **Retro Terminal** - VT323-based CRT aesthetic with phosphor glow effects
2. **Modern Minimal** - JetBrains Mono-based professional DAW aesthetic

Both themes share a common token architecture and component library, enabling seamless theme switching while maintaining visual consistency.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Token Architecture](#token-architecture)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing System](#spacing-system)
6. [Component Patterns](#component-patterns)
7. [Theming System](#theming-system)
8. [Accessibility](#accessibility)
9. [Migration Guide](#migration-guide)
10. [Package Structure](#package-structure)

---

## Design Philosophy

### Core Principles

1. **Theme Flexibility** - Support radically different aesthetics with shared components
2. **Token-Driven** - All visual properties derive from CSS custom properties
3. **Accessibility First** - WCAG AA compliance minimum across all themes
4. **Atomic Design** - Components organized by complexity (atoms → molecules → organisms)
5. **Retro Authenticity** - Terminal theme feels like genuine VT terminal hardware

### Design Constraints

- **No Green in Modern Theme** - Strict separation of color palettes
- **Font Consistency** - Each theme uses exactly one font family
- **Effects as Enhancements** - All visual effects (glows, scanlines) must be optional
- **Responsive to Motion** - Respect `prefers-reduced-motion` across all animations

---

## Token Architecture

### Three-Tier Token System

The design system uses a hierarchical token structure:

```
Primitive Tokens → Semantic Tokens → Component Tokens
```

#### Primitive Tokens
Raw values that define the design language foundation.

```css
/* Colors */
--primitive-green-500: #00ff00;
--primitive-green-700: #008800;
--primitive-gray-900: #1c1c1c;
--primitive-blue-400: #4a9eff;

/* Spacing */
--primitive-space-1: 4px;
--primitive-space-2: 8px;
--primitive-space-3: 12px;
--primitive-space-4: 16px;

/* Typography */
--primitive-font-vt323: 'VT323', monospace;
--primitive-font-jetbrains: 'JetBrains Mono', monospace;
```

#### Semantic Tokens
Context-specific tokens that reference primitives.

```css
/* Theme: Retro Terminal */
--color-bg: var(--primitive-black);
--color-primary: var(--primitive-green-500);
--color-highlight: var(--primitive-green-300);

/* Theme: Modern Minimal */
--color-bg: var(--primitive-gray-900);
--color-primary: var(--primitive-white);
--color-highlight: var(--primitive-blue-400);

/* Shared semantic tokens */
--spacing-sm: var(--primitive-space-2);
--spacing-md: var(--primitive-space-3);
```

#### Component Tokens
Component-specific tokens that reference semantic tokens.

```css
--button-padding-x: var(--spacing-md);
--button-padding-y: var(--spacing-sm);
--input-padding-x: var(--spacing-sm);
--panel-padding: var(--spacing-md);
```

---

## Color System

### Retro Terminal Theme

**Philosophy:** Monochromatic green palette mimicking P3 phosphor CRT displays

#### Primary Palette

| Token | Value | Usage | Contrast (vs #000) |
|-------|-------|-------|-------------------|
| `--color-primary` | `#00ff00` | Primary text, borders | 15.3:1 ✓ AAA |
| `--color-secondary` | `#008800` | Secondary text, muted elements | 4.52:1 ✓ AA |
| `--color-tertiary` | `#006600` | Tertiary text, disabled | 2.9:1 ✗ |
| `--color-highlight` | `#66ff66` | Highlights, selections | 16.06:1 ✓ AAA |

#### Background Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#000000` | Base background |
| `--color-bg-elevated` | `#001100` | Panels, cards |
| `--color-grid` | `#003300` | Grid lines, dividers |
| `--color-dim` | `#004400` | Dimmed elements |
| `--color-disabled` | `#002200` | Disabled states |

#### Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-error` | `#ff0000` | Errors, warnings |
| `--color-warning` | `#ffff00` | Warnings, cautions |

**Accessibility Score:** 36.1% WCAG AA compliance
**Recommended Pairings:**
- Primary text: `--color-primary` on `--color-bg` (15.3:1)
- Highlights: `--color-highlight` on `--color-bg` (16.06:1)
- Interactive: `--color-secondary` on `--color-bg` (4.52:1)

### Modern Minimal Theme

**Philosophy:** Professional DAW aesthetic with neutral grays and blue accents

#### Primary Palette

| Token | Value | Usage | Contrast (vs #1c1c1c) |
|-------|-------|-------|----------------------|
| `--color-primary` | `#ffffff` | Primary text | 17.04:1 ✓ AAA |
| `--color-secondary` | `#b3b3b3` | Secondary text | 8.13:1 ✓ AAA |
| `--color-tertiary` | `#808080` | Tertiary text | 4.32:1 ✓ AA |
| `--color-highlight` | `#4a9eff` | Highlights, focus | 6.19:1 ✓ AA |

#### Background Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#1c1c1c` | Base background |
| `--color-bg-elevated` | `#2a2a2a` | Panels, cards |
| `--color-grid` | `#333333` | Grid lines, dividers |
| `--color-dim` | `#666666` | Dimmed elements |
| `--color-disabled` | `#404040` | Disabled states |

#### Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-error` | `#ff6b6b` | Errors |
| `--color-warning` | `#ffa500` | Warnings |

**Accessibility Score:** 33.3% WCAG AA compliance
**Recommended Pairings:**
- Primary text: `--color-primary` on `--color-bg` (17.04:1)
- Secondary text: `--color-secondary` on `--color-bg` (8.13:1)
- Interactive: `--color-highlight` on `--color-bg` (6.19:1)

---

## Typography

### Retro Terminal Theme

**Primary Font:** VT323 - Authentic VT220 terminal recreation

```css
--font-primary: 'VT323', monospace;
--font-secondary: 'Share Tech Mono', monospace;
--font-fallback: 'Courier', monospace;
```

**Type Scale** (VT323 requires larger sizes due to lighter weight):

| Token | Size | Usage |
|-------|------|-------|
| `--font-size-xs` | 14px | Metadata, captions |
| `--font-size-sm` | 16px | Small UI text |
| `--font-size-base` | 20px | Body text |
| `--font-size-md` | 24px | Subheadings |
| `--font-size-lg` | 28px | Headings |
| `--font-size-xl` | 32px | Large headings |
| `--font-size-2xl` | 40px | Display text |
| `--font-size-3xl` | 48px | Hero text |

**Line Heights:**
- `--line-height-tight: 1.2` - Headings, displays
- `--line-height-base: 1.5` - Body text
- `--line-height-relaxed: 1.8` - Long-form content

### Modern Minimal Theme

**Primary Font:** JetBrains Mono - Professional coding font with excellent readability

```css
--font-primary: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
--font-secondary: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
--font-fallback: 'Consolas', 'Monaco', monospace;
```

**Type Scale** (Smaller sizes for better readability):

| Token | Size | Usage |
|-------|------|-------|
| `--font-size-xs` | 10px | Metadata, captions |
| `--font-size-sm` | 12px | Small UI text |
| `--font-size-base` | 14px | Body text |
| `--font-size-md` | 16px | Subheadings |
| `--font-size-lg` | 18px | Headings |
| `--font-size-xl` | 20px | Large headings |
| `--font-size-2xl` | 24px | Display text |
| `--font-size-3xl` | 28px | Hero text |

**Line Heights:**
- `--line-height-tight: 1.3` - Headings
- `--line-height-base: 1.6` - Body text
- `--line-height-relaxed: 1.8` - Long-form content

**Font Weights:**
- `--font-weight-normal: 400` - Body text
- `--font-weight-bold: 600` - Emphasis (Modern), 700 (Retro)

---

## Spacing System

### 8px/4px Grid System

**Philosophy:** Modern theme uses 4px grid for precision; Retro uses 8px base with 4px increments

```css
/* Shared spacing scale */
--spacing-xs: 4px;    /* 0.5 grid units */
--spacing-sm: 8px;    /* 1 grid unit */
--spacing-md: 12px;   /* 1.5 grid (Modern) / 16px (Retro) */
--spacing-lg: 16px;   /* 2 grid (Modern) / 24px (Retro) */
--spacing-xl: 24px;   /* 3 grid (Modern) / 32px (Retro) */
--spacing-2xl: 32px;  /* 4 grid (Modern) / 40px (Retro) */
--spacing-3xl: 40px;  /* 5 grid (Modern) / 48px (Retro) */
```

**Theme-Specific Adjustments:**

```css
/* Modern: Tighter spacing */
.app.theme-modern {
  --spacing-md: 12px;
  --spacing-lg: 16px;
}

/* Retro: Original spacing */
:root {
  --spacing-md: 16px;
  --spacing-lg: 24px;
}
```

### Usage Guidelines

| Spacing | Common Use Cases |
|---------|-----------------|
| `xs (4px)` | Icon-text gap, tight element spacing |
| `sm (8px)` | Button padding (vertical), list item gap |
| `md (12-16px)` | Button padding (horizontal), panel padding |
| `lg (16-24px)` | Section gaps, card padding |
| `xl (24-32px)` | Major section separation |
| `2xl (32-40px)` | Page layout margins |

---

## Component Patterns

### Atomic Design Structure

```
components/
├── atoms/           # Single-purpose, indivisible UI elements
│   ├── TerminalButton/
│   ├── BlockCursor/
│   ├── CRTEffects/
│   ├── ModernEffects/
│   └── DurationDisplay/
├── molecules/       # Combinations of atoms with specific function
│   ├── TerminalPanel/
│   ├── PatternHandle/
│   ├── TrackHeader/
│   ├── RulerTick/
│   └── ColorSwatch/
├── organisms/       # Complex UI sections
│   ├── Pattern/
│   ├── Track/
│   ├── Timeline/
│   ├── PatternEditor/
│   ├── Ruler/
│   └── MenuBar/
├── templates/       # Page-level layouts
│   └── TimelineTemplate/
└── pages/          # Complete views
    └── TimelinePage/
```

### Component Architecture Patterns

#### 1. **Variant-Based Composition**

Components use variant props for styling alternatives:

```tsx
<TerminalButton
  variant="primary" | "secondary" | "ghost"
  size="sm" | "md" | "lg"
  active={boolean}
/>
```

**Implementation:**
```tsx
export interface TerminalButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  fullWidth?: boolean;
}

const classes = [
  'terminal-button',
  `terminal-button--${variant}`,
  `terminal-button--${size}`,
  active && 'terminal-button--active',
].filter(Boolean).join(' ');
```

#### 2. **Theme-Aware Styling**

CSS uses theme classes for conditional styling:

```css
/* Base retro styling */
.pattern {
  border: 2px solid var(--color-secondary);
  box-shadow: var(--phosphor-glow-md);
}

/* Modern theme override */
.app.theme-modern .pattern {
  border: 1.5px solid rgba(179, 179, 179, 0.3);
  box-shadow: none !important;
  background: color-mix(in srgb, var(--pattern-color) 40%, var(--color-bg-elevated));
}
```

#### 3. **ASCII Border Decoration**

Terminal components use Unicode box-drawing characters:

```tsx
<span className="terminal-button__border--top">
  ┌{'─'.repeat(10)}┐
</span>
<span className="terminal-button__content">{children}</span>
<span className="terminal-button__border--bottom">
  └{'─'.repeat(10)}┘
</span>
```

**Character Reference:**
- `┌` U+250C - Box Drawings Light Down and Right
- `─` U+2500 - Box Drawings Light Horizontal
- `┐` U+2510 - Box Drawings Light Down and Left
- `│` U+2502 - Box Drawings Light Vertical
- `└` U+2514 - Box Drawings Light Up and Right
- `┘` U+2518 - Box Drawings Light Up and Left

#### 4. **Phosphor Glow System**

Multi-layer text-shadow/box-shadow simulates CRT phosphor bloom:

```css
/* Multi-layer phosphor glow */
--phosphor-glow-xl:
  0 0 var(--glow-intensity-sm) var(--color-primary),   /* Inner core */
  0 0 var(--glow-intensity-md) var(--color-primary),   /* Mid bloom */
  0 0 var(--glow-intensity-lg) var(--color-primary),   /* Outer bloom */
  0 0 var(--glow-intensity-xl) var(--color-highlight); /* Halo */
```

**Glow Intensity Levels:**
- `sm: 1px` - Subtle glow for text
- `md: 2px` - Standard UI glow
- `lg: 4px` - Emphasized elements
- `xl: 6px` - Active/selected states

**Modern Theme:** All glow intensities set to `0px`

#### 5. **Animation Patterns**

**Phosphor Persistence Effect:**
Selection animations simulate phosphor fade-in (200-300ms):

```css
.pattern.selected {
  transition: box-shadow 250ms ease-out;
  animation: pattern-select-glow 300ms ease-out,
             pattern-pulse 2s ease-in-out infinite;
}

@keyframes pattern-select-glow {
  0% {
    box-shadow: 0 0 2px rgba(0, 255, 0, 0.5);
  }
  100% {
    box-shadow:
      0 0 4px rgba(0, 255, 0, 1),
      0 0 8px rgba(0, 255, 0, 0.8),
      0 0 16px rgba(0, 255, 0, 0.6);
  }
}
```

**Motion Accessibility:**
```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0ms;
    --transition-base: 0ms;
    --cursor-blink-duration: 0ms;
  }
}
```

---

## Theming System

### Theme Switching Architecture

Themes are applied via CSS class on root app container:

```tsx
<div className={`app theme-${currentTheme}`}>
  {/* All content */}
</div>
```

Where `currentTheme` is either `"retro"` (default) or `"modern"`.

### Theme Definition Pattern

```css
/* 1. Define base (retro) theme in :root */
:root {
  --color-primary: #00ff00;
  --font-primary: 'VT323', monospace;
  --glow-intensity-md: 2px;
}

/* 2. Override for modern theme */
.app.theme-modern {
  --color-primary: #ffffff;
  --font-primary: 'JetBrains Mono', monospace;
  --glow-intensity-md: 0px;
}
```

### Theme Toggle Implementation

```tsx
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/store/slices/uiSlice';

export const ThemeToggle = () => {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.ui.theme);

  return (
    <button onClick={() => dispatch(toggleTheme())}>
      {theme === 'retro' ? 'Modern' : 'Retro'}
    </button>
  );
};
```

### Creating Custom Themes

To add a new theme:

1. **Define token overrides:**
```css
.app.theme-custom {
  /* Color overrides */
  --color-bg: #your-bg;
  --color-primary: #your-primary;

  /* Typography overrides */
  --font-primary: 'Your Font', monospace;
  --font-size-base: 14px;

  /* Effect overrides */
  --glow-intensity-md: 3px;
  --scanline-opacity: 0.08;
}
```

2. **Add component-specific overrides:**
```css
.app.theme-custom .pattern {
  border-style: dashed;
  background: radial-gradient(/* your gradient */);
}
```

3. **Update theme selector:**
```tsx
type Theme = 'retro' | 'modern' | 'custom';
```

---

## Accessibility

### WCAG Compliance

**Target:** WCAG 2.1 Level AA minimum

#### Color Contrast Requirements

| Use Case | Minimum Ratio | Retro | Modern |
|----------|---------------|-------|--------|
| Normal text (< 18px) | 4.5:1 | ✓ Primary on BG (15.3:1) | ✓ Primary on BG (17.04:1) |
| Large text (≥ 18px) | 3:1 | ✓ All pairs | ✓ All pairs |
| UI components | 3:1 | ✓ Borders, icons | ✓ Borders, icons |

**Known Issues:**
- Retro: `--color-tertiary` (#006600) fails on black (2.9:1) - use sparingly
- Modern: `--color-tertiary` (#808080) fails on dark BG - use for non-critical text only

#### Keyboard Navigation

All interactive components support keyboard:

```tsx
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  aria-label="Descriptive label"
  tabIndex={0}
/>
```

**Focus Indicators:**
```css
:focus-visible {
  outline: 2px solid var(--color-highlight);
  outline-offset: 2px;
}
```

#### Screen Reader Support

```tsx
<button
  aria-label="Play pattern"
  aria-pressed={isPlaying}
  aria-disabled={disabled}
>
  <span aria-hidden="true">▶</span>
</button>
```

#### Motion Sensitivity

All animations respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }

  .terminal-cursor {
    animation: none;
  }
}
```

---

## Migration Guide

### From Ad-hoc to Systematic Design

#### Phase 1: Audit (Completed)

**Findings:**
- 90+ unique color values identified
- Font sizes range from 9px to 48px (inconsistent scaling)
- Spacing values: mix of px, rem, and arbitrary values
- Two distinct themes with some token overlap

**Consolidation Opportunities:**
- Reduce 90+ colors to ~15 semantic tokens
- Normalize spacing to 8px/4px grid
- Unify font size scales per theme
- Separate theme-specific from shared tokens

#### Phase 2: Normalize Tokens

**Replace hard-coded values:**

```css
/* Before */
.pattern {
  color: #00ff00;
  padding: 12px 16px;
  font-size: 20px;
}

/* After */
.pattern {
  color: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
}
```

**Create semantic mappings:**

```css
/* tokens/colors.css */
:root {
  /* Primitives */
  --primitive-green-500: #00ff00;
  --primitive-gray-900: #1c1c1c;

  /* Semantic (Retro) */
  --color-primary: var(--primitive-green-500);
  --color-bg: #000000;
}

.app.theme-modern {
  /* Semantic (Modern) */
  --color-primary: #ffffff;
  --color-bg: var(--primitive-gray-900);
}
```

#### Phase 3: Refactor Components

**Make components theme-agnostic:**

```tsx
// ❌ Before: Theme-specific logic in component
export const Pattern = ({ color }) => (
  <div style={{
    background: theme === 'modern' ? '#2a2a2a' : '#001100',
    border: `2px solid ${color}`
  }} />
);

// ✅ After: Use tokens, let CSS handle themes
export const Pattern = ({ color }) => (
  <div
    className="pattern"
    style={{ '--pattern-color': color }}
  />
);

/* CSS handles theme differences */
.pattern {
  background: var(--color-bg-elevated);
  border: var(--border-width-base) solid var(--pattern-color);
}

.app.theme-modern .pattern {
  background: color-mix(in srgb, var(--pattern-color) 40%, var(--color-bg));
}
```

#### Phase 4: Document Patterns

**Create component guidelines:**

```markdown
## TerminalButton

### Usage
\`\`\`tsx
<TerminalButton variant="primary" size="md" onClick={handleClick}>
  Submit
</TerminalButton>
\`\`\`

### Props
- `variant`: 'primary' | 'secondary' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `active`: boolean - Active/selected state
- `fullWidth`: boolean - Fill container width

### Theme Behavior
- **Retro:** ASCII borders with phosphor glow
- **Modern:** Solid borders, no glow effects
```

#### Phase 5: Create Token Files

**Organize tokens by category:**

```
src/styles/tokens/
├── colors.css          # Color primitives + semantic
├── typography.css      # Font families, sizes, weights
├── spacing.css         # Spacing scale
├── effects.css         # Shadows, glows, transitions
├── z-index.css         # Layering system
└── index.css          # Imports all token files
```

---

## Package Structure

### Portable Design System Architecture

To make Cyclone's design reusable across projects:

```
cyclone-design-system/
├── package.json
├── README.md
├── src/
│   ├── tokens/
│   │   ├── colors.css
│   │   ├── typography.css
│   │   ├── spacing.css
│   │   ├── effects.css
│   │   └── index.css
│   ├── themes/
│   │   ├── retro.css
│   │   ├── modern.css
│   │   └── index.css
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── TerminalButton/
│   │   │   │   ├── TerminalButton.tsx
│   │   │   │   ├── TerminalButton.css
│   │   │   │   ├── TerminalButton.test.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── molecules/
│   │   └── organisms/
│   ├── utils/
│   │   └── theme.ts
│   └── index.ts
├── dist/              # Build output
└── docs/             # Documentation
    ├── components/
    └── tokens/
```

### Package Configuration

**package.json:**
```json
{
  "name": "@cyclone/design-system",
  "version": "1.0.0",
  "description": "Dual-theme design system for music sequencing applications",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "src"
  ],
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
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "keywords": [
    "design-system",
    "react",
    "typescript",
    "retro",
    "terminal",
    "ui-components"
  ]
}
```

### Installation & Usage

```bash
npm install @cyclone/design-system
```

```tsx
// Import tokens
import '@cyclone/design-system/tokens';
import '@cyclone/design-system/themes/retro';

// Import components
import { TerminalButton, Pattern, Timeline } from '@cyclone/design-system';

function App() {
  return (
    <div className="app theme-retro">
      <TerminalButton variant="primary">
        Click Me
      </TerminalButton>
    </div>
  );
}
```

---

## Design Tokens Reference

### Complete Token List

#### Colors (Retro Theme)

```css
:root {
  /* Primary Palette */
  --color-bg: #000000;
  --color-bg-elevated: #001100;
  --color-primary: #00ff00;
  --color-secondary: #008800;
  --color-tertiary: #006600;
  --color-highlight: #66ff66;
  --color-grid: #003300;
  --color-dim: #004400;
  --color-disabled: #002200;
  --color-error: #ff0000;
  --color-warning: #ffff00;
}
```

#### Colors (Modern Theme)

```css
.app.theme-modern {
  /* Primary Palette */
  --color-bg: #1c1c1c;
  --color-bg-elevated: #2a2a2a;
  --color-primary: #ffffff;
  --color-secondary: #b3b3b3;
  --color-tertiary: #808080;
  --color-highlight: #4a9eff;
  --color-grid: #333333;
  --color-dim: #666666;
  --color-disabled: #404040;
  --color-error: #ff6b6b;
  --color-warning: #ffa500;
}
```

#### Typography

```css
:root {
  /* Retro */
  --font-primary: 'VT323', monospace;
  --font-size-base: 20px;
  --font-weight-normal: 400;
  --font-weight-bold: 700;
  --line-height-base: 1.5;
}

.app.theme-modern {
  /* Modern */
  --font-primary: 'JetBrains Mono', monospace;
  --font-size-base: 14px;
  --font-weight-normal: 400;
  --font-weight-bold: 600;
  --line-height-base: 1.6;
}
```

#### Spacing

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;   /* 12px in modern */
  --spacing-lg: 24px;   /* 16px in modern */
  --spacing-xl: 32px;   /* 24px in modern */
  --spacing-2xl: 40px;  /* 32px in modern */
  --spacing-3xl: 48px;  /* 40px in modern */
}
```

#### Effects

```css
:root {
  /* CRT Effects (Retro only) */
  --scanline-opacity: 0.04;
  --glow-intensity-sm: 1px;
  --glow-intensity-md: 2px;
  --glow-intensity-lg: 4px;
  --glow-intensity-xl: 6px;
  --phosphor-persistence: 150ms;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 255, 0, 0.1);
  --shadow-md: 0 2px 4px rgba(0, 255, 0, 0.15);
  --shadow-lg: 0 4px 8px rgba(0, 255, 0, 0.2);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}

.app.theme-modern {
  /* Disable CRT effects */
  --scanline-opacity: 0;
  --glow-intensity-sm: 0px;
  --glow-intensity-md: 0px;
  --glow-intensity-lg: 0px;
  --glow-intensity-xl: 0px;
  --phosphor-persistence: 0ms;

  /* Modern shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.4);

  /* Faster transitions */
  --transition-fast: 120ms ease-out;
  --transition-base: 200ms ease-out;
  --transition-slow: 300ms ease-out;
}
```

#### Z-Index Scale

```css
:root {
  --z-base: 1;
  --z-controls: 10;
  --z-hud: 15;
  --z-dropdown: 50;
  --z-modal: 100;
  --z-tooltip: 1000;
}
```

---

## Appendix

### Inspiration & References

- **Retro Theme:** Monolake 8bit (Robert Henke), VT220 terminals, P3 phosphor CRT displays
- **Modern Theme:** Ableton Live 12, Logic Pro X, Professional DAW aesthetics
- **Typography:** VT323 (Google Fonts), JetBrains Mono

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- CSS Custom Properties required
- CSS `color-mix()` for modern theme (fallback provided)

### Version History

**1.0.0** (2025-10-21)
- Initial design system documentation
- Dual-theme architecture established
- Complete token inventory
- Component pattern library
- Accessibility guidelines

---

**Maintained by:** Cyclone Design Team
**License:** MIT
**Contributing:** See CONTRIBUTING.md
