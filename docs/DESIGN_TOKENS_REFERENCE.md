# Cyclone Design Tokens - Quick Reference

**Version:** 1.0.0
**Last Updated:** October 21, 2025

This is a quick-reference guide for all design tokens in the Cyclone Design System. For complete documentation, see [CYCLONE_DESIGN_SYSTEM.md](./CYCLONE_DESIGN_SYSTEM.md).

---

## Quick Token Lookup

### When to Use Which Token

| Need | Retro Theme | Modern Theme | Token Name |
|------|-------------|--------------|------------|
| **Primary text color** | Bright green (#00ff00) | White (#ffffff) | `--color-primary` |
| **Secondary text** | Dark green (#008800) | Light gray (#b3b3b3) | `--color-secondary` |
| **Background** | Pure black (#000000) | Dark gray (#1c1c1c) | `--color-bg` |
| **Panel background** | Very dark green (#001100) | Medium gray (#2a2a2a) | `--color-bg-elevated` |
| **Highlight/selection** | Light green (#66ff66) | Blue (#4a9eff) | `--color-highlight` |
| **Error messages** | Red (#ff0000) | Soft red (#ff6b6b) | `--color-error` |
| **Warning messages** | Yellow (#ffff00) | Orange (#ffa500) | `--color-warning` |
| **Grid lines** | Dark green (#003300) | Medium gray (#333333) | `--color-grid` |
| **Disabled states** | Very dark green (#002200) | Dark gray (#404040) | `--color-disabled` |

### Spacing Quick Guide

```css
/* Icon-text gap, tight spacing */
gap: var(--spacing-xs);        /* 4px */

/* Button vertical padding, list gaps */
padding-block: var(--spacing-sm);  /* 8px */

/* Button horizontal padding, panel padding */
padding-inline: var(--spacing-md); /* 12-16px depending on theme */

/* Section gaps, card padding */
margin-bottom: var(--spacing-lg);  /* 16-24px depending on theme */

/* Major section separation */
margin-top: var(--spacing-xl);     /* 24-32px depending on theme */
```

### Typography Quick Guide

```css
/* Small metadata, captions */
font-size: var(--font-size-xs);    /* 10-14px depending on theme */

/* UI labels, small text */
font-size: var(--font-size-sm);    /* 12-16px depending on theme */

/* Body text - DEFAULT */
font-size: var(--font-size-base);  /* 14-20px depending on theme */

/* Subheadings */
font-size: var(--font-size-md);    /* 16-24px depending on theme */

/* Headings */
font-size: var(--font-size-lg);    /* 18-28px depending on theme */
```

---

## Complete Token Reference

### Color Tokens

#### Retro Terminal Theme

```css
:root {
  /* Background Colors */
  --color-bg: #000000;              /* Pure black - main background */
  --color-bg-elevated: #001100;     /* Very dark green - panels, cards */

  /* Text Colors */
  --color-primary: #00ff00;         /* Bright green - primary text, borders */
  --color-secondary: #008800;       /* Dark green - secondary text, muted elements */
  --color-tertiary: #006600;        /* Medium green - tertiary text */
  --color-highlight: #66ff66;       /* Light green - highlights, selections */

  /* UI Colors */
  --color-grid: #003300;            /* Dark green - grid lines, dividers */
  --color-dim: #004400;             /* Dim green - dimmed elements */
  --color-disabled: #002200;        /* Very dark green - disabled states */

  /* Semantic Colors */
  --color-error: #ff0000;           /* Red - errors */
  --color-warning: #ffff00;         /* Yellow - warnings */
}
```

**Contrast Ratios (vs #000000):**
- Primary: 15.3:1 ✓ AAA
- Secondary: 4.52:1 ✓ AA
- Tertiary: 2.9:1 ✗ (use sparingly)
- Highlight: 16.06:1 ✓ AAA

#### Modern Minimal Theme

```css
.app.theme-modern {
  /* Background Colors */
  --color-bg: #1c1c1c;              /* Dark gray - main background */
  --color-bg-elevated: #2a2a2a;     /* Medium dark gray - panels, cards */

  /* Text Colors */
  --color-primary: #ffffff;         /* White - primary text */
  --color-secondary: #b3b3b3;       /* Light gray - secondary text */
  --color-tertiary: #808080;        /* Medium gray - tertiary text */
  --color-highlight: #4a9eff;       /* Blue - highlights, focus, selections */

  /* UI Colors */
  --color-grid: #333333;            /* Medium gray - grid lines, dividers */
  --color-dim: #666666;             /* Dim gray - dimmed elements */
  --color-disabled: #404040;        /* Dark gray - disabled states */

  /* Semantic Colors */
  --color-error: #ff6b6b;           /* Soft red - errors */
  --color-warning: #ffa500;         /* Orange - warnings */
}
```

**Contrast Ratios (vs #1c1c1c):**
- Primary: 17.04:1 ✓ AAA
- Secondary: 8.13:1 ✓ AAA
- Tertiary: 4.32:1 ✓ AA
- Highlight: 6.19:1 ✓ AA

---

### Typography Tokens

#### Retro Terminal Theme

```css
:root {
  /* Font Families */
  --font-primary: 'VT323', monospace;
  --font-secondary: 'Share Tech Mono', monospace;
  --font-fallback: 'Courier', monospace;

  /* Font Sizes (larger for VT323 readability) */
  --font-size-xs: 14px;
  --font-size-sm: 16px;
  --font-size-base: 20px;      /* DEFAULT body text */
  --font-size-md: 24px;
  --font-size-lg: 28px;
  --font-size-xl: 32px;
  --font-size-2xl: 40px;
  --font-size-3xl: 48px;

  /* Line Heights */
  --line-height-tight: 1.2;    /* Headings, displays */
  --line-height-base: 1.5;     /* Body text */
  --line-height-relaxed: 1.8;  /* Long-form content */

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-bold: 700;
}
```

#### Modern Minimal Theme

```css
.app.theme-modern {
  /* Font Families */
  --font-primary: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  --font-secondary: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  --font-fallback: 'Consolas', 'Monaco', monospace;

  /* Font Sizes (smaller for better readability) */
  --font-size-xs: 10px;
  --font-size-sm: 12px;
  --font-size-base: 14px;      /* DEFAULT body text */
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 28px;

  /* Line Heights */
  --line-height-tight: 1.3;    /* Headings */
  --line-height-base: 1.6;     /* Body text */
  --line-height-relaxed: 1.8;  /* Long-form content */

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-bold: 600;
}
```

---

### Spacing Tokens

#### Base Spacing Scale (Both Themes)

```css
:root {
  --spacing-xs: 4px;     /* 0.5 grid units - icon gaps, tight spacing */
  --spacing-sm: 8px;     /* 1 grid unit - button vertical padding */
}
```

#### Retro Theme Spacing

```css
:root {
  --spacing-md: 16px;    /* 2 grid units - button horizontal padding */
  --spacing-lg: 24px;    /* 3 grid units - section gaps */
  --spacing-xl: 32px;    /* 4 grid units - major sections */
  --spacing-2xl: 40px;   /* 5 grid units - page margins */
  --spacing-3xl: 48px;   /* 6 grid units - large spacing */
}
```

#### Modern Theme Spacing

```css
.app.theme-modern {
  --spacing-md: 12px;    /* 1.5 grid units - tighter spacing */
  --spacing-lg: 16px;    /* 2 grid units - section gaps */
  --spacing-xl: 24px;    /* 3 grid units - major sections */
  --spacing-2xl: 32px;   /* 4 grid units - page margins */
  --spacing-3xl: 40px;   /* 5 grid units - large spacing */
}
```

---

### Border Tokens

```css
:root {
  /* Border Radius */
  --border-radius-none: 0;
  --border-radius-sm: 2px;     /* Retro: minimal rounding */
  --border-radius-md: 4px;

  /* Border Widths */
  --border-width-thin: 1px;
  --border-width-base: 2px;    /* Retro: thicker borders */
  --border-width-thick: 3px;
}

.app.theme-modern {
  /* Modern: thinner borders */
  --border-radius-sm: 3px;     /* Slightly more rounded */
  --border-width-base: 1px;    /* Thinner default */
  --border-width-thick: 2px;
}
```

---

### Effect Tokens

#### CRT Effects (Retro Theme Only)

```css
:root {
  /* Scanline Effect */
  --scanline-opacity: 0.04;    /* Subtle horizontal scanlines */

  /* Phosphor Glow Intensities */
  --glow-intensity-sm: 1px;    /* Subtle text glow */
  --glow-intensity-md: 2px;    /* Standard UI glow */
  --glow-intensity-lg: 4px;    /* Emphasized elements */
  --glow-intensity-xl: 6px;    /* Active/selected states */

  /* Phosphor Persistence */
  --phosphor-persistence: 150ms;  /* Afterglow duration */

  /* Multi-layer Phosphor Glows */
  --phosphor-glow-sm:
    0 0 var(--glow-intensity-sm) var(--color-primary);

  --phosphor-glow-md:
    0 0 var(--glow-intensity-sm) var(--color-primary),
    0 0 var(--glow-intensity-md) var(--color-primary);

  --phosphor-glow-lg:
    0 0 var(--glow-intensity-sm) var(--color-primary),
    0 0 var(--glow-intensity-md) var(--color-primary),
    0 0 var(--glow-intensity-lg) var(--color-primary);

  --phosphor-glow-xl:
    0 0 var(--glow-intensity-sm) var(--color-primary),
    0 0 var(--glow-intensity-md) var(--color-primary),
    0 0 var(--glow-intensity-lg) var(--color-primary),
    0 0 var(--glow-intensity-xl) var(--color-highlight);

  /* Default glow */
  --phosphor-glow: var(--phosphor-glow-sm);

  /* Box Glows for Interactive Elements */
  --box-glow-sm: 0 0 var(--glow-intensity-sm) var(--color-primary);
  --box-glow-md: 0 0 var(--glow-intensity-md) var(--color-primary);
  --box-glow-lg:
    0 0 var(--glow-intensity-md) var(--color-primary),
    0 0 var(--glow-intensity-lg) var(--color-primary);
  --box-glow-xl:
    0 0 var(--glow-intensity-md) var(--color-primary),
    0 0 var(--glow-intensity-lg) var(--color-primary),
    0 0 var(--glow-intensity-xl) var(--color-highlight);
}
```

#### Modern Theme - No Glow Effects

```css
.app.theme-modern {
  /* Disable all CRT effects */
  --scanline-opacity: 0;
  --glow-intensity-sm: 0px;
  --glow-intensity-md: 0px;
  --glow-intensity-lg: 0px;
  --glow-intensity-xl: 0px;
  --phosphor-persistence: 0ms;

  /* No glow effects */
  --phosphor-glow-sm: none;
  --phosphor-glow-md: none;
  --phosphor-glow-lg: none;
  --phosphor-glow-xl: none;
  --phosphor-glow: none;

  /* Subtle modern box shadows instead */
  --box-glow-sm: 0 0 2px rgba(79, 195, 247, 0.2);
  --box-glow-md: 0 0 4px rgba(79, 195, 247, 0.3);
  --box-glow-lg: 0 0 6px rgba(79, 195, 247, 0.4);
  --box-glow-xl: 0 0 8px rgba(79, 195, 247, 0.5);
}
```

---

### Shadow Tokens

#### Retro Theme Shadows

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 255, 0, 0.1);
  --shadow-md: 0 2px 4px rgba(0, 255, 0, 0.15);
  --shadow-lg: 0 4px 8px rgba(0, 255, 0, 0.2);
  --shadow-glow: var(--phosphor-glow-md);  /* Reference to glow effect */
}
```

#### Modern Theme Shadows

```css
.app.theme-modern {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 2px rgba(79, 195, 247, 0.3);
}
```

---

### Animation Tokens

#### Retro Theme

```css
:root {
  /* Durations */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;

  /* Easing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Cursor Blink */
  --cursor-blink-duration: 1000ms;
}
```

#### Modern Theme (Faster)

```css
.app.theme-modern {
  /* Durations */
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 400ms;

  /* Transitions */
  --transition-fast: 120ms ease-out;
  --transition-base: 200ms ease-out;
  --transition-slow: 300ms ease-out;

  /* No cursor blink */
  --cursor-blink-duration: 0ms;
}
```

#### Motion Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0ms;
    --transition-base: 0ms;
    --transition-slow: 0ms;
    --duration-fast: 0ms;
    --duration-base: 0ms;
    --duration-slow: 0ms;
    --duration-slower: 0ms;
    --cursor-blink-duration: 0ms;
  }
}
```

---

### Z-Index Tokens

```css
:root {
  --z-base: 1;        /* Base layer - content */
  --z-controls: 10;   /* Controls, interactive elements */
  --z-hud: 15;        /* HUD overlay elements */
  --z-dropdown: 50;   /* Dropdowns, menus */
  --z-modal: 100;     /* Modal dialogs */
  --z-tooltip: 1000;  /* Tooltips (always on top) */
}
```

**Usage Guidelines:**
- Use semantic z-index tokens, never arbitrary values
- Elements within the same layer should not set z-index
- Modal backdrops should use `--z-modal - 1` (99)

---

### Component-Specific Tokens

```css
:root {
  /* Buttons */
  --button-padding-x: var(--spacing-md);
  --button-padding-y: var(--spacing-sm);

  /* Inputs */
  --input-padding-x: var(--spacing-sm);
  --input-padding-y: var(--spacing-xs);

  /* Panels */
  --panel-padding: var(--spacing-md);

  /* Layout */
  --footer-height: 50px;  /* Retro */
}

.app.theme-modern {
  --footer-height: 40px;  /* Modern: slightly smaller */
}
```

---

### Opacity Tokens

```css
:root {
  --opacity-disabled: 0.4;   /* Retro: more dimmed */
  --opacity-muted: 0.6;
  --opacity-hover: 0.8;
  --opacity-full: 1;
}

.app.theme-modern {
  --opacity-disabled: 0.5;   /* Modern: slightly less dimmed */
  --opacity-muted: 0.7;
  --opacity-hover: 0.9;
}
```

---

## Usage Examples

### Basic Component Styling

```css
.my-component {
  /* Colors */
  background: var(--color-bg-elevated);
  color: var(--color-primary);
  border: var(--border-width-base) solid var(--color-secondary);

  /* Spacing */
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-xs);

  /* Typography */
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);

  /* Effects */
  box-shadow: var(--shadow-md);
  text-shadow: var(--phosphor-glow);
  border-radius: var(--border-radius-sm);

  /* Animation */
  transition: all var(--transition-base);
}

.my-component:hover {
  border-color: var(--color-highlight);
  box-shadow: var(--box-glow-md);
}

.my-component:disabled {
  opacity: var(--opacity-disabled);
  color: var(--color-disabled);
}
```

### Theme-Specific Overrides

```css
/* Base (Retro) styling */
.pattern {
  border: var(--border-width-base) solid var(--color-secondary);
  box-shadow: var(--phosphor-glow-md);
  background: var(--color-bg-elevated);
}

/* Modern theme override */
.app.theme-modern .pattern {
  border-width: var(--border-width-thin);
  box-shadow: none;
  background: color-mix(
    in srgb,
    var(--pattern-color) 40%,
    var(--color-bg-elevated)
  );
}
```

### Dynamic Color Usage

```tsx
// React component with dynamic color
<div
  className="pattern"
  style={{
    '--pattern-color': trackColor
  } as React.CSSProperties}
>
  Pattern Content
</div>
```

```css
.pattern {
  border-color: var(--pattern-color, var(--color-secondary));
}

.pattern::before {
  background: var(--pattern-color);
  opacity: 0.1;
}
```

---

## Token Migration Checklist

### Replacing Hard-Coded Values

- [ ] Replace color hex codes with `--color-*` tokens
- [ ] Replace pixel spacing with `--spacing-*` tokens
- [ ] Replace font sizes with `--font-size-*` tokens
- [ ] Replace shadow values with `--shadow-*` or `--box-glow-*` tokens
- [ ] Replace transition durations with `--transition-*` or `--duration-*` tokens
- [ ] Replace z-index numbers with `--z-*` tokens

### Common Replacements

| Hard-coded Value | Token Replacement |
|-----------------|-------------------|
| `color: #00ff00` | `color: var(--color-primary)` |
| `padding: 12px 16px` | `padding: var(--spacing-sm) var(--spacing-md)` |
| `font-size: 20px` | `font-size: var(--font-size-base)` |
| `transition: 0.25s` | `transition: var(--transition-base)` |
| `z-index: 100` | `z-index: var(--z-modal)` |
| `opacity: 0.6` | `opacity: var(--opacity-muted)` |
| `border-radius: 4px` | `border-radius: var(--border-radius-md)` |

---

## Token Naming Conventions

### Pattern

```
--{category}-{property}-{variant}-{state}
```

### Examples

```css
/* Category: color, Property: bg, Variant: elevated */
--color-bg-elevated

/* Category: spacing, Property: (implied), Variant: md */
--spacing-md

/* Category: font, Property: size, Variant: base */
--font-size-base

/* Category: shadow, Property: (implied), Variant: lg */
--shadow-lg

/* Category: z, Property: (implied), Variant: modal */
--z-modal
```

---

## Best Practices

### DO ✓

- Use semantic tokens (`--color-primary`) over primitive values
- Reference tokens in component CSS, not inline styles
- Test color combinations for WCAG compliance
- Respect `prefers-reduced-motion` in animations
- Use fallback values: `var(--color-primary, #00ff00)`

### DON'T ✗

- Hard-code colors, spacing, or font sizes
- Use arbitrary z-index values
- Create component-specific tokens in global scope
- Override theme tokens in component files
- Use green colors in modern theme

---

**For complete documentation, see:** [CYCLONE_DESIGN_SYSTEM.md](./CYCLONE_DESIGN_SYSTEM.md)
